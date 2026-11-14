import { z } from "zod";
import { QUESTION_TYPES } from "../config";

export const questionDifficultySchema = z.enum(["Easy", "Medium", "Hard"]);

export const cognitiveSkillSchema = z.enum([
  "Remember", "Understand", "Apply", "Analyse", "Evaluate", "Create",
]);

export const questionTypeSchema = z.enum(QUESTION_TYPES as unknown as [string, ...string[]]);

/**
 * Structured JSON schema for a single question produced by the Gemini
 * Question Generator (stage B) or the Regenerate-Question flow.
 */
export const generatedQuestionSchema = z.object({
  type: questionTypeSchema,
  question: z.string().min(8),
  options: z.array(z.string()).min(2).max(6).optional().nullable(),
  correctAnswer: z.string().min(1),
  acceptableAnswers: z.array(z.string()).optional().nullable(),
  explanation: z.string().min(1),
  marks: z.number().int().positive().max(100),
  difficulty: questionDifficultySchema,
  topic: z.string().min(1),
  learningObjective: z.string().min(1),
  cognitiveSkill: cognitiveSkillSchema,
});

export const generatedQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedQuestions = z.infer<typeof generatedQuestionsSchema>;

export const questionTypeRequestSchema = z.object({
  type: questionTypeSchema,
  count: z.number().int().min(1).max(50),
});

export const worksheetConfigSchema = z.object({
  board: z.enum(["CBSE", "ICSE", "IGCSE", "State Board", "Generic Indian"]),
  grade: z.string().min(1),
  subject: z.literal("Mathematics").default("Mathematics"),
  topic: z.string().min(1, "Topic is required"),
  subtopic: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Mixed"]),
  questionTypes: z.array(questionTypeRequestSchema).min(1, "Select at least one question type"),
  learningObjective: z.string().optional(),
  totalMarks: z.number().int().positive().max(200).optional(),
  timeLimitMinutes: z.number().int().positive().max(300).optional(),
  language: z.string().default("English"),
  numberSystem: z.enum(["Indian", "International"]).default("Indian"),
  calculatorAllowed: z.boolean().default(false),
  customInstructions: z.string().max(2000).optional(),
  template: z.string().default("clean-school"),
  institutionName: z.string().optional(),
  curriculumSource: z.string().optional(),
});

export type WorksheetConfigInput = z.infer<typeof worksheetConfigSchema>;

export function validateConfig(body: unknown): { ok: true; config: WorksheetConfigInput } | { ok: false; errors: string[] } {
  const parsed = worksheetConfigSchema.safeParse(body);
  if (parsed.success) return { ok: true, config: parsed.data };
  return {
    ok: false,
    errors: parsed.error.issues.map(
      (i) => `${i.path.join(".") || "config"}: ${i.message}`
    ),
  };
}
