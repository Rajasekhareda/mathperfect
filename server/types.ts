export type NavTab =
  | 'home'
  | 'worksheets'
  | 'activities'
  | 'simulations'
  | 'solvers'
  | 'questionbank'
  | 'exampaper'
  | 'videos';

export interface WorksheetQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  solution: string;
  hint?: string;
  marks?: number;
}

export interface WorksheetItem {
  id: string;
  title: string;
  topic: string;
  grade: string;
  difficulty: 'Foundational' | 'Standard' | 'Advanced' | 'Olympiad';
  questionType: 'multiple-choice' | 'free-response' | 'word-problems' | 'mixed';
  questionCount: number;
  schoolName?: string;
  instructions?: string;
  questions: WorksheetQuestion[];
  createdAt: string;
  createdBy?: string;
}

export interface QuestionBankItem {
  id: string;
  topic: string;
  subtopic: string;
  grade: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Challenge';
  type: 'mcq' | 'short-answer' | 'extended' | 'proof';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  hint: string;
  tags: string[];
}

export interface SolverStep {
  title: string;
  explanation: string;
  math?: string;
}

export interface SolverResult {
  title: string;
  problemType: string;
  inputSummary: string;
  solution: string;
  steps: SolverStep[];
  keyFormulas: string[];
  additionalData?: Record<string, any>;
}

export interface ExamQuestion {
  id: number;
  question: string;
  options?: string[];
  marks: number;
  solution: string;
  markingScheme: string[];
}

export interface ExamSection {
  name: string;
  description: string;
  questions: ExamQuestion[];
}

export interface ExamGuessAnalysis {
  trendingTopics: string[];
  highProbabilityTopics: Array<{ topic: string; weight: number; rationale: string }>;
  examStrategy: string[];
}

export interface ExamPaperItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  totalMarks: number;
  timeMinutes: number;
  instructions: string[];
  sections: ExamSection[];
  guessAnalysis?: ExamGuessAnalysis;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: 'Arithmetic' | 'Algebra' | 'Geometry' | 'Probability' | 'Calculus' | 'Logic';
  gradeLevel: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  description: string;
  learningOutcome: string;
  durationMinutes: number;
  toolType: 'fraction-strips' | 'algebra-balance' | 'coordinate-plane' | 'angle-protractor' | 'probability-spinner' | 'prime-sieve';
}

export interface SimulationItem {
  id: string;
  title: string;
  category: 'Calculus' | 'Geometry' | 'Trigonometry' | 'Statistics' | 'Chaos & Fractals';
  description: string;
  interactiveFeatures: string[];
  theoreticalConcept: string;
  simType: 'calculus-derivative' | 'pythagoras-visual' | 'unit-circle' | 'monte-carlo-pi' | 'normal-distribution' | 'chaos-game';
}

export interface VideoItem {
  id: string;
  title: string;
  topic: string;
  category: string;
  duration: string;
  grade: string;
  thumbnail: string;
  instructor: string;
  description: string;
  keyTakeaways: string[];
  embedId: string;
}
