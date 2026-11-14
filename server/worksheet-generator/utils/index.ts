import { Question, QuestionType } from "../types";

export const TYPE_SECTION_LABELS: Record<QuestionType, string> = {
  "MCQ": "Multiple Choice Questions",
  "Fill in the Blanks": "Fill in the Blanks",
  "True/False": "True or False",
  "Match the Following": "Match the Following",
  "Number/Pattern": "Number and Pattern Questions",
  "Short Answer": "Short Answer Questions",
  "Long Answer": "Long Answer Questions",
  "Word Problems": "Word Problems",
  "Logical Reasoning": "Logical Reasoning",
  "HOTS": "Higher Order Thinking Skills (HOTS)",
  "Case/Activity": "Case / Activity-Based Questions",
};

/** Section order used by the worksheet composer (easy → hard, objective → subjective). */
export const SECTION_ORDER: QuestionType[] = [
  "Number/Pattern",
  "MCQ",
  "Fill in the Blanks",
  "True/False",
  "Match the Following",
  "Short Answer",
  "Word Problems",
  "Logical Reasoning",
  "Long Answer",
  "HOTS",
  "Case/Activity",
];

export const DIFFICULTY_ORDER: Record<string, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

export const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"];

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function classifyDifficulty(difficulty: string): "Easy" | "Medium" | "Hard" {
  if (difficulty === "Easy" || difficulty === "Medium" || difficulty === "Hard") return difficulty;
  return "Medium";
}

/**
 * Attempt to repair common JSON issues from LLM output:
 * trailing commas, code fences, stray text before/after the JSON body.
 */
export function extractJson(text: string): unknown {
  let s = text.trim();
  // strip markdown fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  // find first { or [ and matching last } or ]
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  let start: number;
  if (firstObj === -1 && firstArr === -1) throw new Error("No JSON found in model output");
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  const lastObj = s.lastIndexOf("}");
  const lastArr = s.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (end <= start) throw new Error("Malformed JSON in model output");
  s = s.slice(start, end + 1);
  // remove trailing commas
  s = s.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(s);
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Cheap token-based Jaccard similarity for duplicate detection. */
export function jaccardSimilarity(a: string, b: string): number {
  const norm = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^a-z0-9₹ ]/g, " ")
        .split(/\s+/)
        // keep words longer than 2 chars AND numeric tokens (so questions
        // differing only in their numbers are not treated as duplicates)
        .filter((w) => w.length > 2 || /^\d+$/.test(w))
    );
  const A = norm(a), B = norm(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export function questionText(q: Question): string {
  return [q.question, ...(q.options ?? [])].join(" ");
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
