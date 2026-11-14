// Shared domain types for the Math Worksheet Generator

export type Board = "CBSE" | "ICSE" | "IGCSE" | "State Board" | "Generic Indian";

export type Grade =
  | "KG" | "LKG" | "UKG"
  | "Class 1" | "Class 2" | "Class 3" | "Class 4" | "Class 5"
  | "Class 6" | "Class 7" | "Class 8" | "Class 9" | "Class 10"
  | "Class 11" | "Class 12"
  | "Intermediate 1st Year" | "Intermediate 2nd Year";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Mixed";

export type QuestionType =
  | "MCQ"
  | "Fill in the Blanks"
  | "True/False"
  | "Match the Following"
  | "Number/Pattern"
  | "Short Answer"
  | "Long Answer"
  | "Word Problems"
  | "Logical Reasoning"
  | "HOTS"
  | "Case/Activity";

export type CognitiveSkill =
  | "Remember" | "Understand" | "Apply" | "Analyse" | "Evaluate" | "Create";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  marks: number;
  difficulty: QuestionDifficulty;
  topic: string;
  learningObjective: string;
  cognitiveSkill: CognitiveSkill;
}

export interface QuestionTypeRequest {
  type: QuestionType;
  count: number;
}

export interface WorksheetConfig {
  board: Board;
  grade: Grade;
  subject: "Mathematics";
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  questionTypes: QuestionTypeRequest[];
  learningObjective?: string;
  totalMarks?: number;
  timeLimitMinutes?: number;
  language?: string;
  numberSystem?: "Indian" | "International";
  calculatorAllowed?: boolean;
  customInstructions?: string;
  template: TemplateId;
  institutionName?: string;
  curriculumSource?: string;
}

export interface WorksheetSection {
  type: QuestionType;
  label: string;
  questionIds: string[];
  marks: number;
}

export interface AnswerKeyEntry {
  questionId: string;
  number: number;
  answer: string;
  explanation: string;
}

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  questionId?: string;
}

export interface ValidationStats {
  questionsChecked: number;
  numericRecomputed: number;
  duplicatesFound: number;
  mcqIssues: number;
  errors: number;
  warnings: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  stats: ValidationStats;
  checkedAt: string;
  engine: string;
}

export type TemplateId =
  | "clean-school"
  | "exam-practice"
  | "primary-fun-math"
  | "concept-builder"
  | "competency-hots"
  | "revision-pack"
  | "teacher-assessment";

export interface WorksheetMetadata {
  boardAlignmentLabel: string;
  nepPrinciples: string[];
  generatedBy: "gemini" | "local-fallback";
  model?: string;
}

export interface Worksheet {
  id: string;
  title: string;
  config: WorksheetConfig;
  instructions: string[];
  sections: WorksheetSection[];
  questions: Question[];
  totalMarks: number;
  answerKey: AnswerKeyEntry[];
  studentFields: { nameLine: string; dateLine: string; classLine: string };
  validation: ValidationResult | null;
  notice?: string;
  metadata: WorksheetMetadata;
  generator: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProject {
  id: string;
  worksheet: Worksheet;
  docxPath?: string;
  pdfPath?: string;
  htmlPath?: string;
  savedAt: string;
}

export interface CurriculumDoc {
  id: string;
  title: string;
  board: string;
  grade: string;
  content: string;
  addedAt?: string;
}
