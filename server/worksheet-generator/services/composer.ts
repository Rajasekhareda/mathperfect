import {
  AnswerKeyEntry, Question, QuestionType, ValidationIssue,
  ValidationResult, ValidationStats, Worksheet, WorksheetConfig,
} from "../types";
import { DIFFICULTY_ORDER, ROMAN, SECTION_ORDER, TYPE_SECTION_LABELS, classifyDifficulty, newId } from "../utils";
import { alignmentLabel, planCurriculum } from "./curriculumPlanner";
import { validateMathematics } from "./mathValidator";
import { detectDuplicates, validatePedagogy } from "./pedagogyValidator";
import { NEP_PRINCIPLES } from "../config";

/** Stage F - Worksheet Composer: orders questions and calculates marks. */
export function composeFromQuestions(
  config: WorksheetConfig,
  questions: Question[],
  generatedBy: "gemini" | "local-fallback" = "local-fallback",
  model?: string,
  notice?: string
): Worksheet {
  const numbered = questions.map((q, i) => ({ ...q, id: q.id || `q_${i}_${newId("x")}` }));

  const sectionTypes = SECTION_ORDER.filter((t) => numbered.some((q) => q.type === t));
  const sections = sectionTypes.map((type: QuestionType) => {
    const qs = numbered
      .filter((q) => q.type === type)
      .sort((x, y) => (DIFFICULTY_ORDER[x.difficulty] ?? 1) - (DIFFICULTY_ORDER[y.difficulty] ?? 1));
    return {
      type,
      label: TYPE_SECTION_LABELS[type],
      questionIds: qs.map((q) => q.id),
      marks: qs.reduce((s, q) => s + q.marks, 0),
    };
  });

  const answerKey: AnswerKeyEntry[] = [];
  let num = 0;
  for (const section of sections) {
    section.questionIds.forEach((qid, idx) => {
      num++;
      const q = numbered.find((x) => x.id === qid)!;
      answerKey.push({
        questionId: q.id,
        number: num,
        answer: q.correctAnswer,
        explanation: q.explanation,
      });
      // expose the worksheet number on the question for renderers
      (q as Question & { worksheetNumber?: number }).worksheetNumber = num;
      void idx;
    });
  }

  const totalMarks = numbered.reduce((s, q) => s + q.marks, 0);
  const now = new Date().toISOString();
  const constraints = planCurriculum(config.board, config.grade as never, config.topic, config.subtopic);

  const instructions: string[] = [
    "Answer all questions.",
    `This paper contains ${numbered.length} questions in ${sections.length} section${sections.length === 1 ? "" : "s"}.`,
    `Total marks: ${totalMarks}.`,
  ];
  if (config.timeLimitMinutes) instructions.push(`Time allowed: ${config.timeLimitMinutes} minutes.`);
  if (config.calculatorAllowed === false) instructions.push("Calculators are not allowed.");
  if (config.calculatorAllowed === true) instructions.push("Calculators are allowed.");
  instructions.push("Show your working for long answer and word problems.");
  if (config.customInstructions) instructions.push(config.customInstructions);

  return {
    id: newId("ws"),
    title: `${config.topic}${config.subtopic ? ` - ${config.subtopic}` : ""} | ${config.grade} Mathematics`,
    config,
    generator: generatedBy,
    instructions,
    sections,
    questions: numbered,
    totalMarks,
    answerKey,
    studentFields: {
      nameLine: "Name: ______________________________",
      dateLine: `Date: ____ / ____ / ________    Roll No.: ________`,
      classLine: `Class / Section: ${config.grade}  ________`,
    },
    validation: null,
    metadata: {
      boardAlignmentLabel: alignmentLabel(config.board, config.grade),
      nepPrinciples: NEP_PRINCIPLES,
      generatedBy,
      model,
    },
    notice,
    createdAt: now,
    updatedAt: now,
  };
}

export interface FullValidationResult {
  result: ValidationResult;
}

/** Run stages C, D, E over a composed worksheet and attach the result. */
export function validateWorksheet(worksheet: Worksheet): ValidationResult {
  const issues: ValidationIssue[] = [];
  const { issues: mathIssues, recomputed } = validateMathematics(worksheet.questions);
  issues.push(...mathIssues);
  issues.push(...validatePedagogy(worksheet.questions, {
    grade: worksheet.config.grade,
    board: worksheet.config.board,
    requestedDifficulty: worksheet.config.difficulty,
    learningObjective: worksheet.config.learningObjective,
    topic: worksheet.config.topic,
  }));
  issues.push(...detectDuplicates(worksheet.questions));

  // Answer-key consistency (stage H pre-check): every question must have exactly one key entry.
  const keyIds = new Set(worksheet.answerKey.map((k) => k.questionId));
  for (const q of worksheet.questions) {
    if (!keyIds.has(q.id)) {
      issues.push({ severity: "error", code: "KEY_MISSING", message: "No answer-key entry for this question.", questionId: q.id });
    }
  }
  if (worksheet.answerKey.length !== worksheet.questions.length) {
    issues.push({
      severity: "error", code: "KEY_COUNT_MISMATCH",
      message: `Answer key has ${worksheet.answerKey.length} entries for ${worksheet.questions.length} questions.`,
    });
  }
  const keyTotal = worksheet.answerKey.length;
  const marksTotal = worksheet.questions.reduce((s, q) => s + q.marks, 0);
  void keyTotal;

  const stats: ValidationStats = {
    questionsChecked: worksheet.questions.length,
    numericRecomputed: recomputed,
    duplicatesFound: issues.filter((i) => i.code === "DUPLICATE").length,
    mcqIssues: issues.filter((i) => i.code.startsWith("MCQ")).length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
  };

  return {
    valid: stats.errors === 0,
    issues,
    stats,
    checkedAt: new Date().toISOString(),
    engine: "local-validators+mathjs",
  };
}

export { ROMAN, classifyDifficulty };
