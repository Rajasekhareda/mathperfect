import { create, all } from "mathjs";
import { Question, ValidationIssue } from "../types";
import { jaccardSimilarity, questionText } from "../utils";

const math = create(all, { number: "number" });

const NUMERIC_RE = /^-?\s*(₹)?\s*[0-9][0-9,]*(\.[0-9]+)?\s*(km|kg|m|cm|mm|g|l|ml|hrs?|hours?|km\/h|°C|%)?$/i;
const EXPR_RE = /^[\d\s+\-*/^().]+$/;

export function normalizeNumber(s: string): string {
  return s.replace(/[₹,\s]/g, "").replace(/(km|kg|cm|mm|hrs?|hours|km\/h|°C|%)$/i, "").trim();
}

function isNumericAnswer(s: string): boolean {
  return NUMERIC_RE.test(s.trim());
}

function toNumber(s: string): number | null {
  const n = Number(normalizeNumber(s));
  return Number.isFinite(n) ? n : null;
}

/** Token overlap used for phrase/expression-style answers (e.g. "2 and 3"). */
function phraseSimilarity(a: string, b: string): number {
  const tokens = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter((w) => w.length > 0);
  const A = tokens(a), B = tokens(b);
  if (A.length === 0 || B.length === 0) return 0;
  const setB = new Set(B);
  let inter = 0;
  for (const w of A) if (setB.has(w)) inter++;
  return inter / (A.length + B.length - inter);
}

/**
 * Stage C - Mathematical Validator.
 * - Recomputes pure arithmetic expressions found in questions ("12*15", "24+36", "(8+4)/3").
 * - Cross-checks numeric answers for arithmetic word problems stated as "a op b".
 * - For MCQ: verifies exactly one option matches the correct answer.
 * Returns issues; numericRecomputed counts how many answers were independently verified.
 */
export function validateMathematics(questions: Question[]): { issues: ValidationIssue[]; recomputed: number } {
  const issues: ValidationIssue[] = [];
  let recomputed = 0;

  for (const q of questions) {
    // 1. MCQ structural + single-correct check
    if (q.type === "MCQ") {
      if (!q.options || q.options.length !== 4) {
        issues.push({
          severity: "error", code: "MCQ_OPTIONS",
          message: `MCQ must have exactly 4 options (found ${q.options?.length ?? 0}).`,
          questionId: q.id,
        });
      } else {
        const normalizedAnswer = String(q.correctAnswer).trim().toLowerCase();
        const an = normalizeNumber(normalizedAnswer);
        if (an === "") {
          // Phrase / expression answers (e.g. "2 and 3", "x = 2 or x = 5/3"):
          // match by token similarity; ambiguity is a warning, not an error,
          // so valid LLM phrasing variants are preserved.
          const similar = q.options.filter((o) => phraseSimilarity(o, normalizedAnswer) >= 0.55);
          if (similar.length === 0) {
            issues.push({
              severity: "error", code: "MCQ_NO_CORRECT",
              message: "No option is equivalent to the stated correct answer.",
              questionId: q.id,
            });
          } else if (similar.length > 1) {
            issues.push({
              severity: "warning", code: "MCQ_MULTIPLE_CORRECT",
              message: "More than one option looks equivalent to the correct answer; verify unique phrasing.",
              questionId: q.id,
            });
          }
        } else {
          // Numeric answers: strict - exactly one option must match.
          const exact = q.options.filter((o) => o.trim().toLowerCase() === normalizedAnswer);
          const numeric = q.options.filter((o) => {
            const on = normalizeNumber(o);
            return on !== "" && on === an;
          });
          const matches = exact.length > 0 ? exact : numeric;
          if (matches.length === 0) {
            issues.push({
              severity: "error", code: "MCQ_NO_CORRECT",
              message: "No option matches the correct answer.",
              questionId: q.id,
            });
          } else if (matches.length > 1) {
            issues.push({
              severity: "error", code: "MCQ_MULTIPLE_CORRECT",
              message: "More than one option matches the correct answer; exactly one is required.",
              questionId: q.id,
            });
          }
        }
      }
    }

    // 2. Recompute simple arithmetic expressions embedded in the question
    //    e.g. "What is 12 × 15?" or "Find 24+36"
    const expr = extractArithmetic(q.question);
    if (expr && EXPR_RE.test(expr) && /\d/.test(expr) && /[+\-*/×÷^]/.test(expr)) {
      try {
        const expected = math.evaluate(expr.replace(/×/g, "*").replace(/÷/g, "/"));
        if (typeof expected === "number" && Number.isFinite(expected)) {
          recomputed++;
          const ansVal = toNumber(q.correctAnswer);
          if (ansVal === null || Math.abs(ansVal - expected) > 1e-9) {
            issues.push({
              severity: "error", code: "ARITHMETIC_MISMATCH",
              message: `Answer "${q.correctAnswer}" does not match recomputed value ${expected}.`,
              questionId: q.id,
            });
          } else if (q.type === "MCQ" && q.options) {
            const correctCount = q.options.filter((o) => {
              const ov = toNumber(o);
              return ov !== null && Math.abs(ov - expected) < 1e-9;
            }).length;
            if (correctCount !== 1) {
              issues.push({
                severity: "error", code: "MCQ_VALUE_COUNT",
                message: `Exactly one option must equal ${expected} (found ${correctCount}).`,
                questionId: q.id,
              });
            }
          }
        }
      } catch {
        // not evaluable - skip
      }
    } else if (isNumericAnswer(q.correctAnswer)) {
      // 3. Verify "a op b" phrasing inside text (handles × as x)
      const m = q.question.match(/(\d[\d,]*)\s*(?:×|x|\*)\s*(\d[\d,]*)/i);
      if (m) {
        const x = Number(m[1].replace(/,/g, ""));
        const y = Number(m[2].replace(/,/g, ""));
        const ansVal = toNumber(q.correctAnswer);
        recomputed++;
        if (ansVal === null || Math.abs(ansVal - x * y) > 1e-9) {
          issues.push({
            severity: "error", code: "ARITHMETIC_MISMATCH",
            message: `Multiplication check failed: ${x} × ${y} = ${x * y}, but answer is "${q.correctAnswer}".`,
            questionId: q.id,
          });
        }
      }
    }
  }
  return { issues, recomputed };
}

/** Extract a bare arithmetic expression from question text, if present. */
export function extractArithmetic(text: string): string | null {
  const m = text.match(/(\d+(?:\.\d+)?(?:\s*[+\-*/×÷^]\s*\(?\s*\d+(?:\.\d+)?\)?)+)/);
  return m ? m[1] : null;
}
