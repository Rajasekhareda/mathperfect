// Academic Standards Schema — Option C (versioned syllabi)

export type Bloom =
  | "Remember" | "Understand" | "Apply" | "Analyse" | "Evaluate" | "Create";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type SyllabusVersion = "NCFSE-2023" | "NCERT-2024R" | "NCERT-LEGACY";

export interface LearningObjective {
  code: string;        // unique, e.g. "LO-10-QE-02"
  statement: string;   // measurable outcome, exam-style
  bloom: Bloom;        // cognitive level this objective targets
}

export interface CurriculumChapterV2 {
  id: string;                      // "CBSE-10-QUAD-EQ" — unique across all boards/grades
  board: string;
  syllabusVersion: SyllabusVersion;
  grade: string;
  chapterNo: number;
  chapterName: string;
  subtopics: string[];             // proper array now (fixes filter problem)
  objectives: LearningObjective[];
  difficultyMix: { Easy: number; Medium: number; Hard: number };  // % — must sum to 100
  bloomMix: Record<Bloom, number>;                                // % — must sum to 100
  questionTypes: string[];
  marksDefault: Record<string, number>;  // { "MCQ": 1, "Short Answer": 2, ... }
  prerequisites: string[];         // chapter ids
  notes?: string;                  // e.g. "Euclid's lemma removed 2023-24"
}
