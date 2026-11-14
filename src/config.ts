import { resolve } from "path";
import { config as loadEnv } from "dotenv";

loadEnv();

export const APP_NAME = "Math Worksheet & Activity Sheet Generator";

export const PORT = Number(process.env.PORT || 5000);
export const DATA_DIR = resolve(process.env.DATA_DIR || "./data");
export const OUTPUT_DIR = resolve(process.env.OUTPUT_DIR || "./output");

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
export const DEFAULT_INSTITUTION_NAME =
  process.env.DEFAULT_INSTITUTION_NAME || "Sunrise Public School";

export const hasGeminiKey = (): boolean => GEMINI_API_KEY.trim().length > 10;

export const BOARDS = [
  "CBSE",
  "ICSE",
  "IGCSE",
  "State Board",
  "Generic Indian",
] as const;

export const GRADES = [
  "KG", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12",
  "Intermediate 1st Year", "Intermediate 2nd Year",
] as const;

export const QUESTION_TYPES = [
  "MCQ",
  "Fill in the Blanks",
  "True/False",
  "Match the Following",
  "Number/Pattern",
  "Short Answer",
  "Long Answer",
  "Word Problems",
  "Logical Reasoning",
  "HOTS",
  "Case/Activity",
] as const;

export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"] as const;

export const TEMPLATE_IDS = [
  "clean-school",
  "exam-practice",
  "primary-fun-math",
  "concept-builder",
  "competency-hots",
  "revision-pack",
  "teacher-assessment",
] as const;

export const TEMPLATE_INFO: Record<
  string,
  { name: string; description: string }
> = {
  "clean-school": {
    name: "Clean School",
    description:
      "Highly readable, spacious layout with minimal decoration. Best for daily classwork.",
  },
  "exam-practice": {
    name: "Exam Practice",
    description:
      "Compact, numbered sections with marks and time limit shown. Best for pre-exam drills.",
  },
  "primary-fun-math": {
    name: "Primary Fun Math",
    description:
      "Child-friendly boxes and visual activity areas for KG and primary classes.",
  },
  "concept-builder": {
    name: "Concept Builder",
    description:
      "Worked-example area followed by graded practice on the same concept.",
  },
  "competency-hots": {
    name: "Competency / HOTS",
    description:
      "Scenario, reasoning and application sections aligned with NEP 2020 competency-based learning.",
  },
  "revision-pack": {
    name: "Revision Pack",
    description:
      "Mixed question types with a quick summary/self-check area at the end.",
  },
  "teacher-assessment": {
    name: "Teacher Assessment",
    description:
      "Student details block, marks table, rubric and teacher comments area.",
  },
};

export const NEP_PRINCIPLES = [
  "Competency-based learning",
  "Conceptual understanding",
  "Application to real life",
  "Reasoning and problem-solving",
  "Experiential / activity-based learning",
  "Higher-order thinking",
];
