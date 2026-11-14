import { existsSync, statSync } from "fs";
import { Worksheet } from "../types";
import { validateWorksheet } from "./composer";

export interface FinalVerification {
  ok: boolean;
  autoRepairs: string[];
  checks: { name: string; passed: boolean; detail: string; fixHint?: string }[];
}

/**
 * Stage H - Final Verification (SELF-HEALING).
 * Fixes stale bookkeeping (answer key, numbering, total marks, missing
 * validation) BEFORE checking, so teachers are never blocked by
 * accounting bugs. Only genuine content problems can still block export.
 */
export function finalVerification(ws: Worksheet, docxPath?: string): FinalVerification {
  const autoRepairs: string[] = [];

  // ---- Self-repair 1: answer key must mirror the question list ----
  if (ws.answerKey.length !== ws.questions.length) {
    const byId = new Map(ws.answerKey.map((k) => [k.questionId, k]));
    ws.answerKey = ws.questions.map((q, i) => {
      const existing = byId.get(q.id);
      if (existing) return existing;
      return {
        questionId: q.id,
        number: i + 1,
        answer: q.correctAnswer,
        explanation: q.explanation ?? "",
      };
    });
    autoRepairs.push("Rebuilt the answer key to match the question list.");
  }
  ws.answerKey.forEach((k, i) => {
    k.number = i + 1;
  });

  // ---- Self-repair 2: total marks must equal the sum of question marks ----
  const markSum = ws.questions.reduce((s, q) => s + (q.marks || 0), 0);
  if (ws.totalMarks !== markSum) {
    ws.totalMarks = markSum;
    autoRepairs.push(`Corrected total marks to ${markSum}.`);
  }

  // ---- Self-repair 3: validation must exist ----
  if (!ws.validation) {
    ws.validation = validateWorksheet(ws);
    autoRepairs.push("Recomputed worksheet validation.");
  }

  const checks: FinalVerification["checks"] = [];

  const keyCountOk = ws.answerKey.length === ws.questions.length;
  checks.push({
    name: "Answer-key consistency",
    passed: keyCountOk,
    detail: keyCountOk
      ? `${ws.answerKey.length} answer-key entries match ${ws.questions.length} questions.`
      : `Mismatch: ${ws.answerKey.length} key entries for ${ws.questions.length} questions.`,
    fixHint: keyCountOk ? undefined : "Reopen the worksheet from Saved Worksheets, or regenerate it.",
  });

  const numbersOk = ws.answerKey.every((k, i) => k.number === i + 1);
  checks.push({
    name: "Question numbering",
    passed: numbersOk,
    detail: numbersOk ? "Sequential numbering 1..N verified." : "Answer-key numbering has gaps or duplicates.",
    fixHint: numbersOk ? undefined : "Reopen the worksheet — numbering is repaired automatically on the next check.",
  });

  const marksOk = ws.totalMarks === markSum;
  checks.push({
    name: "Marks calculation",
    passed: marksOk,
    detail: marksOk
      ? `Total marks (${ws.totalMarks}) equal the sum of question marks.`
      : "Total marks do not match the sum of question marks.",
    fixHint: marksOk ? undefined : "Total marks are repaired automatically — export again.",
  });

  const sectionsOk = ws.sections.length > 0 && ws.sections.every((s) => s.questionIds.length > 0);
  checks.push({
    name: "Section structure",
    passed: sectionsOk,
    detail: `${ws.sections.length} section(s) with questions present.`,
    fixHint: sectionsOk ? undefined : "Generate the worksheet again — a section ended up empty.",
  });

  if (docxPath) {
    const exists = existsSync(docxPath);
    const size = exists ? statSync(docxPath).size : 0;
    const valid = exists && size > 2000 && docxPath.toLowerCase().endsWith(".docx");
    checks.push({
      name: "DOCX document",
      passed: valid,
      detail: valid
        ? `DOCX verified (${(size / 1024).toFixed(1)} KB).`
        : exists
          ? "DOCX file exists but looks invalid."
          : "DOCX file not found on disk.",
      fixHint: valid ? undefined : "No problem — Export PDF now rebuilds the DOCX automatically before converting.",
    });

    const errorIssues = (ws.validation?.issues ?? []).filter((i) => i.severity === "error");
    const contentValid = !!ws.validation?.valid;
    checks.push({
      name: "Content validation",
      passed: contentValid,
      detail: contentValid
        ? "No validation errors."
        : `${errorIssues.length} validation error(s) present.`,
      fixHint: contentValid
        ? undefined
        : "Open the preview and fix or regenerate every question shown in red, then export again.",
    });
  }

  return { ok: checks.every((c) => c.passed), autoRepairs, checks };
}
