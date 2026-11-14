import { Question, ValidationIssue } from "../types";
import { jaccardSimilarity, questionText } from "../utils";
import { gradeBand, MAX_QUESTION_WORDS } from "./curriculumPlanner";

export interface PedagogyContext {
  grade: string;
  board: string;
  requestedDifficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  learningObjective?: string;
  topic: string;
}

/**
 * Stage D - Pedagogy Validator.
 * Heuristic checks for age-appropriateness, difficulty alignment,
 * learning-objective coverage, marks sanity and formatting.
 */
export function validatePedagogy(questions: Question[], ctx: PedagogyContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const band = gradeBand(ctx.grade as Parameters<typeof gradeBand>[0]);
  const maxWords = MAX_QUESTION_WORDS[band] ?? 50;

  for (const q of questions) {
    const words = q.question.trim().split(/\s+/).length;
    if (words > maxWords) {
      issues.push({
        severity: band === "pre-primary" || band === "primary" ? "error" : "warning",
        code: "AGE_APPROPRIATENESS",
        message: `Question length (${words} words) may be too long for ${ctx.grade} (${band}); keep it concise.`,
        questionId: q.id,
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) {
      issues.push({ severity: "error", code: "DIFFICULTY_INVALID", message: `Invalid difficulty "${q.difficulty}".`, questionId: q.id });
    }

    if (ctx.requestedDifficulty !== "Mixed" && q.difficulty !== ctx.requestedDifficulty) {
      issues.push({
        severity: "warning", code: "DIFFICULTY_MISMATCH",
        message: `Requested ${ctx.requestedDifficulty} but question is ${q.difficulty}.`,
        questionId: q.id,
      });
    }

    if (!q.marks || q.marks < 1) {
      issues.push({ severity: "error", code: "MARKS_INVALID", message: "Marks must be a positive integer.", questionId: q.id });
    }

    if (!q.learningObjective || q.learningObjective.trim().length < 5) {
      issues.push({ severity: "warning", code: "OBJECTIVE_MISSING", message: "Learning objective missing or too short.", questionId: q.id });
    }

    if (!q.explanation || q.explanation.trim().length < 5) {
      issues.push({ severity: "error", code: "EXPLANATION_MISSING", message: "Worked explanation is required for the answer key.", questionId: q.id });
    }

    if (!q.cognitiveSkill) {
      issues.push({ severity: "warning", code: "COGNITIVE_MISSING", message: "Cognitive skill not labelled.", questionId: q.id });
    }

    if (q.type === "Fill in the Blanks" && !q.question.includes("________") && !q.question.includes("___")) {
      issues.push({ severity: "error", code: "FIB_NO_BLANK", message: "Fill in the Blanks question must contain a blank (________).", questionId: q.id });
    }

    if (ctx.learningObjective && q.learningObjective && ctx.learningObjective.length > 10) {
      // informational overlap check
      const overlap = jaccardSimilarity(q.learningObjective, ctx.learningObjective);
      if (overlap < 0.05) {
        issues.push({
          severity: "info", code: "OBJECTIVE_DRIFT",
          message: "Question objective differs from the stated worksheet objective (verify alignment).",
          questionId: q.id,
        });
      }
    }
  }
  return issues;
}

/**
 * Stage E - Duplicate Detector.
 * Flags near-duplicate questions (Jaccard similarity >= 0.85).
 */
export function detectDuplicates(questions: Question[], threshold = 0.85): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const sim = jaccardSimilarity(questionText(questions[i]), questionText(questions[j]));
      if (sim >= threshold) {
        issues.push({
          severity: "error", code: "DUPLICATE",
          message: `Questions ${i + 1} and ${j + 1} are near-duplicates (similarity ${(sim * 100).toFixed(0)}%).`,
          questionId: questions[j].id,
        });
      }
    }
  }
  return issues;
}
