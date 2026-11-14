import { GeneratedQuestion } from "./schemas";
import {
  generateFallbackQuestions,
  FallbackSpec,
} from "./fallbackGenerator";
import {
  GeminiError,
  generateQuestions,
} from "./geminiService";
import {
  CurriculumConstraints,
  planCurriculum,
} from "./curriculumPlanner";
import {
  composeFromQuestions,
  validateWorksheet,
} from "./composer";
import {
  hasAnyLlmKey,
  listProviders,
} from "./llmService";
import {
  Question,
  QuestionType,
  Worksheet,
  WorksheetConfig,
} from "../types";
import {
  classifyDifficulty,
  jaccardSimilarity,
  newId,
  questionText,
} from "../utils";
import {
  DuplicateWarning,
  saveQuestions,
} from "./questionBank";

export interface GenerationOutcome {
  worksheet: Worksheet;
  generator: "gemini" | "local-fallback";
  generatorNotice?: string;
  bankWarnings?: DuplicateWarning[];
}

export function toDomainQuestions(
  g: GeneratedQuestion[],
  topic: string
): Question[] {
  return g.map((q) => ({
    id: newId("q"),
    type: q.type as QuestionType,
    question: q.question,
    options: q.options ?? undefined,
    correctAnswer: q.correctAnswer,
    acceptableAnswers: q.acceptableAnswers ?? undefined,
    explanation: q.explanation,
    marks: q.marks,
    difficulty: classifyDifficulty(q.difficulty),
    topic: q.topic || topic,
    learningObjective: q.learningObjective,
    cognitiveSkill: q.cognitiveSkill,
  }));
}

function splitMixed(
  count: number
): ["Easy" | "Medium" | "Hard", number][] {
  const e = Math.max(1, Math.round(count / 3));
  const h = Math.max(1, Math.round(count / 3));
  const m = Math.max(0, count - e - h);
  const out: ["Easy" | "Medium" | "Hard", number][] = [];
  if (e) out.push(["Easy", e]);
  if (m) out.push(["Medium", m]);
  if (h) out.push(["Hard", h]);
  return out.length ? out : [["Medium", count]];
}

export const DEFAULT_MARKS: Partial<
  Record<QuestionType, number>
> = {
  "MCQ": 1,
  "Fill in the Blanks": 1,
  "True/False": 1,
  "Match the Following": 2,
  "Number/Pattern": 1,
  "Short Answer": 2,
  "Long Answer": 4,
  "Word Problems": 3,
  "Logical Reasoning": 2,
  "HOTS": 3,
  "Case/Activity": 4,
};

function buildSpec(
  config: WorksheetConfig
): FallbackSpec[] {
  const spec: FallbackSpec[] = [];
  for (const { type, count } of config.questionTypes) {
    if (count <= 0) continue;
    const defaultMark = DEFAULT_MARKS[type] ?? 1;
    if (config.difficulty === "Mixed") {
      for (const [diff, subCount] of splitMixed(count)) {
        spec.push({
          type,
          count: subCount,
          difficulty: diff,
          marks: defaultMark,
        });
      }
    } else {
      spec.push({
        type,
        count,
        difficulty: config.difficulty,
        marks: defaultMark,
      });
    }
  }
  return spec;
}

const BLOOM_CYCLE: Record<
  "Easy" | "Medium" | "Hard",
  string[]
> = {
  Easy: ["Remember", "Understand"],
  Medium: ["Understand", "Apply", "Analyse"],
  Hard: ["Apply", "Analyse", "Evaluate", "Create"],
};

interface GeminiSlot {
  type: QuestionType;
  difficulty: string;
  marks: number;
  bloom: string;
}

function buildSlots(
  config: WorksheetConfig
): GeminiSlot[] {
  const slots: GeminiSlot[] = [];
  for (const s of buildSpec(config)) {
    const d = (["Easy", "Medium", "Hard"].includes(
      s.difficulty
    )
      ? s.difficulty
      : "Medium") as "Easy" | "Medium" | "Hard";
    const cycle = BLOOM_CYCLE[d];
    for (let i = 0; i < s.count; i++) {
      slots.push({
        type: s.type,
        difficulty: d,
        marks: s.marks,
        bloom: cycle[i % cycle.length],
      });
    }
  }
  return slots;
}

export async function generateWorksheet(
  config: WorksheetConfig
): Promise<GenerationOutcome> {
  const constraints: CurriculumConstraints =
    planCurriculum(
      config.board,
      config.grade as never,
      config.topic,
      config.subtopic
    );

  const spec = buildSpec(config);
  const slots = buildSlots(config);

  // RULE 1: Do NOT artificially exclude questions based on bank pre-checks.
  // Generate precisely what the user requested first without bank filtering.
  const bankExclusions: string[] = [];

  let generator: "gemini" | "local-fallback" =
    "local-fallback";
  let notice: string | undefined;
  let domainQuestions: Question[];

  if (hasAnyLlmKey()) {
    try {
      const generated = await generateQuestions({
        constraints,
        spec,
        topic: config.topic,
        subtopic: config.subtopic,
        language: config.language || "English",
        numberSystem: config.numberSystem || "Indian",
        calculatorAllowed: !!config.calculatorAllowed,
        customInstructions: config.customInstructions,
        learningObjective: config.learningObjective,
        excludeQuestions: bankExclusions,
        slots,
      });
      if (generated.length === 0) {
        throw new GeminiError(
          "Model returned zero questions",
          "invalid-json"
        );
      }
      domainQuestions = toDomainQuestions(
        generated as unknown as GeneratedQuestion[],
        config.topic
      );
      generator = "gemini";
    } catch (err) {
      const detail =
        err instanceof Error
          ? err.message
          : String(err);
      notice =
        `AI providers unavailable: ${detail}. ` +
        `Used the built-in local generator instead. ` +
        `(Providers configured: ${
          listProviders().join(", ") || "none"
        })`;
      domainQuestions = toDomainQuestions(
        generateFallbackQuestions(
          constraints,
          spec,
          config.topic,
          config.subtopic
        ),
        config.topic
      );
    }
  } else {
    notice =
      "No AI provider keys in .env — used the " +
      "built-in local generator (offline mode). " +
      "Add GROQ_API_KEY or GEMINI_API_KEY for " +
      "full-quality questions.";
    domainQuestions = toDomainQuestions(
      generateFallbackQuestions(
        constraints,
        spec,
        config.topic,
        config.subtopic
      ),
      config.topic
    );
  }

  let questions = domainQuestions;
  if (generator === "gemini") {
    const draft = composeFromQuestions(
      config,
      questions,
      generator,
      undefined,
      notice
    );
    const draftValidation = validateWorksheet(draft);
    const badIds = new Set(
      draftValidation.issues
        .filter(
          (i) =>
            i.severity === "error" && i.questionId
        )
        .map((i) => i.questionId as string)
    );
    if (badIds.size > 0) {
      let workingSet = [...questions];
      let replacedCount = 0;
      for (const q of questions) {
        if (!badIds.has(q.id)) continue;
        const replacement = pickLocalReplacement(
          constraints,
          q,
          workingSet,
          config.topic,
          config.subtopic
        );
        workingSet = workingSet.map((x) =>
          x.id === q.id
            ? { ...replacement, id: q.id }
            : x
        );
        replacedCount++;
      }
      questions = workingSet;
      notice =
        `${notice ?? ""} ${replacedCount} question(s) ` +
        `that failed validation were replaced with ` +
        `locally generated equivalents.`.trim();
    }
  }

  const worksheet = composeFromQuestions(
    config,
    questions,
    generator,
    generator === "gemini"
      ? "multi-provider LLM"
      : undefined,
    notice
  );
  worksheet.validation = validateWorksheet(worksheet);

  // User requirement rule 1: Do NOT block or tamper with user download.
  // Questions are saved cleanly to the bank as a record.
  let bankWarnings: DuplicateWarning[] = [];
  try {
    const save = saveQuestions(
      worksheet.id,
      {
        board: config.board,
        grade: config.grade,
        topic: config.topic,
      },
      questions.map((q) => ({
        question: q.question,
        type: q.type,
        difficulty: q.difficulty,
        cognitiveSkill: q.cognitiveSkill,
        marks: q.marks,
        options: q.options ?? null,
        correctAnswer: q.correctAnswer,
      }))
    );
    bankWarnings = save.warnings;
  } catch (bankErr) {
    console.warn(
      "[questionbank] save record:",
      bankErr
    );
  }

  return {
    worksheet,
    generator,
    generatorNotice: notice,
    bankWarnings,
  };
}

function pickLocalReplacement(
  constraints: CurriculumConstraints,
  bad: Question,
  existing: Question[],
  topic: string,
  subtopic?: string
): Question {
  const generated = generateFallbackQuestions(
    constraints,
    [
      {
        type: bad.type,
        count: 5,
        difficulty: bad.difficulty,
        marks: bad.marks,
      },
    ],
    topic,
    subtopic
  );
  const domain = toDomainQuestions(generated, topic);
  for (const c of domain) {
    const isDup = existing.some(
      (e) =>
        jaccardSimilarity(
          questionText(e.question),
          questionText(c.question)
        ) > 0.65
    );
    if (!isDup) {
      return {
        ...c,
        id: bad.id,
        marks: bad.marks,
        type: bad.type,
        difficulty: bad.difficulty,
      };
    }
  }
  return {
    ...domain[0],
    id: bad.id,
    marks: bad.marks,
    type: bad.type,
    difficulty: bad.difficulty,
  };
}

export async function regenerateQuestion(
  worksheet: Worksheet,
  questionId: string
): Promise<{ worksheet: Worksheet; notice?: string }> {
  const target = worksheet.questions.find(
    (q) => q.id === questionId
  );
  if (!target) {
    throw new Error(
      `Question ${questionId} not found in worksheet`
    );
  }
  const constraints = planCurriculum(
    worksheet.config.board,
    worksheet.config.grade as never,
    worksheet.config.topic,
    worksheet.config.subtopic
  );
  const replacement = pickLocalReplacement(
    constraints,
    target,
    worksheet.questions,
    worksheet.config.topic,
    worksheet.config.subtopic
  );
  const nextQuestions = worksheet.questions.map((q) =>
    q.id === questionId ? replacement : q
  );
  const nextWs = composeFromQuestions(
    worksheet.config,
    nextQuestions,
    worksheet.metadata.generatedBy as never,
    worksheet.metadata.model,
    worksheet.notice
  );
  nextWs.id = worksheet.id;
  nextWs.title = worksheet.title;
  nextWs.validation = validateWorksheet(nextWs);
  return {
    worksheet: nextWs,
    notice: `Question ${questionId} replaced with a fresh variant.`,
  };
}
