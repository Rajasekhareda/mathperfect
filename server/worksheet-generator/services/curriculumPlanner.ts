import { Grade } from "../types";
import { GRADES } from "../config";
import { getCurriculumByGrade, searchCurriculum } from "../db/database";

export interface CurriculumConstraints {
  board: string;
  grade: string;
  gradeBand: "pre-primary" | "primary" | "upper-primary" | "secondary" | "senior-secondary";
  ageRange: string;
  numberRangeHint: string;
  languageStyle: string;
  boardTerminology: string;
  nepAlignment: string[];
  caution: string;
  chapters: ChapterInfo[];
  /** NEW: chapters in this grade that match the requested topic â€” sent to Gemini for topic lock. */
  topicSuggestions: string[];
}

export interface ChapterInfo {
  chapterName: string;
  subtopics: string[];
  objectives: string[];
  difficulty: string;
  questionTypes: string[];
}

const gradeIndex = (grade: Grade): number => GRADES.indexOf(grade);

export function gradeBand(grade: Grade): CurriculumConstraints["gradeBand"] {
  const idx = gradeIndex(grade);
  if (idx <= 2) return "pre-primary"; // KG, LKG, UKG
  if (idx <= 7) return "primary"; // Class 1-5
  if (idx <= 10) return "upper-primary"; // Class 6-8
  if (idx <= 12) return "secondary"; // Class 9-10
  return "senior-secondary"; // 11, 12, Intermediate
}

const BOARD_TERMINOLOGY: Record<string, string> = {
  CBSE: "Use NCERT-style terminology (e.g., 'numerals', 'place value', 'HCF/LCM'). Do NOT reference Euclid's division lemma (deleted from the rationalised 2023-24 syllabus).",
  ICSE: "Use ICSE Council style wording, slightly more application-oriented phrasing is acceptable.",
  IGCSE: "Cambridge IGCSE style: use 'show that', 'hence', 'find the value of'; marks split across parts is common.",
  "State Board": "Use state-board textbook style phrasing familiar to Indian state syllabus learners.",
  "Generic Indian": "Use broadly familiar Indian school mathematics phrasing.",
};

const NUMBER_HINTS: Record<CurriculumConstraints["gradeBand"], string> = {
  "pre-primary": "Numbers 1-50, simple shapes, counting objects, comparisons (big/small, more/less).",
  "primary": "Numbers up to 5 digits, lakhs, simple fractions and decimals, â‚¹ currency, basic measurement, simple word problems.",
  "upper-primary": "Integers, rational numbers, percentages, ratio, exponents, algebraic expressions, simple equations, mensuration.",
  "secondary": "Real numbers, polynomials, linear/quadratic equations, trigonometry, coordinate geometry, statistics, surface areas and volumes.",
  "senior-secondary": "Sets, relations and functions, trigonometric functions, complex numbers, sequences and series, limits, calculus basics, probability.",
};

const AGE_HINTS: Record<CurriculumConstraints["gradeBand"], string> = {
  "pre-primary": "3-6 years",
  "primary": "6-11 years",
  "upper-primary": "11-14 years",
  "secondary": "14-16 years",
  "senior-secondary": "16-18 years",
};

export const MAX_QUESTION_WORDS: Record<CurriculumConstraints["gradeBand"], number> = {
  "pre-primary": 15,
  "primary": 25,
  "upper-primary": 35,
  "secondary": 50,
  "senior-secondary": 70,
};

const LANGUAGE_STYLE: Record<CurriculumConstraints["gradeBand"], string> = {
  "pre-primary": "Very short sentences (max 8 words), friendly tone, use of everyday objects (toys, fruits, balloons).",
  "primary": "Short clear sentences, Indian everyday contexts (cricket, market, festival, train journey).",
  "upper-primary": "Clear direct language, moderately rich contexts, Indian names (Aarav, Priya, Iqbal, Meena, Karthik).",
  "secondary": "Formal but accessible exam-style language, Indian contexts for word problems.",
  "senior-secondary": "Precise formal mathematical language consistent with board exams.",
};

/**
 * Stage A - Curriculum Planner (deterministic).
 */
export function planCurriculum(
  board: string,
  grade: Grade,
  topic: string,
  subtopic?: string
): CurriculumConstraints {
  const band = gradeBand(grade);
  const boardLabel = board === "Generic Indian" ? "Indian school" : board;

  // Query curriculum database for this grade's chapters
  const curriculumRows = getCurriculumByGrade(grade);
  const chapters: ChapterInfo[] = curriculumRows.map((row: any) => ({
    chapterName: row.chapterName,
    subtopics: (typeof row.subtopics === "string" ? row.subtopics.split(",").map((s: string) => s.trim()) : (Array.isArray(row.subtopics) ? row.subtopics : [])),
    objectives: (typeof row.objectives === "string" ? row.objectives.split(",").map((s: string) => s.trim()) : (Array.isArray(row.objectives) ? row.objectives : [])),
    difficulty: row.difficulty,
    questionTypes: (typeof row.questionTypes === "string" ? row.questionTypes.split(",").map((s: string) => s.trim()) : (Array.isArray(row.questionTypes) ? row.questionTypes : [])),
  }));

  // BUG FIX: this list is now actually returned and sent to Gemini.
  // It locks generation to chapters that match the requested topic.
  const topicSuggestions: string[] = topic
    ? searchCurriculum(topic)
        .filter((r) => r.grade === grade)
        .map((r) => r.chapterName)
    : [];

  return {
    board,
    grade,
    gradeBand: band,
    ageRange: AGE_HINTS[band],
    numberRangeHint: NUMBER_HINTS[band],
    languageStyle: LANGUAGE_STYLE[band],
    boardTerminology: BOARD_TERMINOLOGY[board] ?? BOARD_TERMINOLOGY["Generic Indian"],
    nepAlignment: [
      "Competency-based: every question targets a demonstrable skill",
      "Conceptual understanding before procedural practice",
      "Application to familiar Indian real-life contexts",
      "Reasoning and problem-solving, not rote recall alone",
      "Experiential/activity-based items where the topic allows",
      "Higher-order thinking (HOTS) opportunities",
    ],
    caution: `Original questions only. Do not reproduce copyrighted textbook content verbatim. ` +
      `Do not invent official page numbers, board rules or syllabus citations. ` +
      `Alignment must be described only as "Designed for compatibility with ${boardLabel} ${grade} Mathematics" ` +
      `unless an official syllabus source is supplied.`,
    chapters,
    topicSuggestions,
  };
}

export function alignmentLabel(board: string, grade: string): string {
  const boardLabel = board === "Generic Indian" ? "Indian school" : board;
  return `Designed for compatibility with ${boardLabel} ${grade} Mathematics. Not an official board publication.`;
}

