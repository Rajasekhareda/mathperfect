export type QuestionType =
  | "MCQ" | "Fill in the Blanks" | "True/False" | "Match the Following"
  | "Number/Pattern" | "Short Answer" | "Long Answer" | "Word Problems"
  | "Logical Reasoning" | "HOTS" | "Case/Activity";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  learningObjective: string;
  cognitiveSkill: string;
}

export interface WorksheetConfig {
  board: string;
  grade: string;
  subject: "Mathematics";
  topic: string;
  subtopic?: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  questionTypes: { type: QuestionType; count: number }[];
  learningObjective?: string;
  totalMarks?: number;
  timeLimitMinutes?: number;
  language?: string;
  numberSystem?: "Indian" | "International";
  calculatorAllowed?: boolean;
  customInstructions?: string;
  template: string;
  institutionName?: string;
}

export interface AnswerKeyEntry { questionId: string; number: number; answer: string; explanation: string; }

export interface ValidationIssue { severity: "error" | "warning" | "info"; code: string; message: string; questionId?: string; }

export interface Worksheet {
  id: string;
  title: string;
  config: WorksheetConfig;
  instructions: string[];
  sections: { type: QuestionType; label: string; questionIds: string[]; marks: number }[];
  questions: Question[];
  totalMarks: number;
  answerKey: AnswerKeyEntry[];
  studentFields: { nameLine: string; dateLine: string; classLine: string };
  validation: { valid: boolean; issues: ValidationIssue[]; stats: Record<string, number>; checkedAt: string; engine: string } | null;
  notice?: string;
  metadata: { boardAlignmentLabel: string; nepPrinciples: string[]; generatedBy: string; model?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  boards: string[];
  grades: string[];
  questionTypes: QuestionType[];
  difficulties: string[];
  templates: { id: string; name: string; description: string }[];
  defaultInstitutionName: string;
  pdfBrowser: string | null;
}

export interface FinalVerification {
  ok: boolean;
  checks: { name: string; passed: boolean; detail: string }[];
}

export interface GenerateResponse {
  worksheet: Worksheet;
  generator: "gemini" | "local-fallback";
  notice?: string;
  finalVerification: FinalVerification;
}
