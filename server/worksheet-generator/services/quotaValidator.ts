// Stage D2 — verifies generated questions match their assigned slots,
// and checks batch-level distribution. Errors feed the existing
// GenerateRequest.feedback self-repair loop in geminiService.ts.

import { CurriculumChapterV2, Bloom, Difficulty } from "../types/curriculumV2";
import { PlanSlot } from "./quotaPlanner";

export interface GeneratedQuestionV2 {
  chapterId: string;
  objectiveCode: string;
  type: string;
  difficulty: string;
  [k: string]: unknown;
}

const TOLERANCE_PCT = 10;

export function validateQuotaCompliance(
  slots: PlanSlot[],
  generated: GeneratedQuestionV2[],
  chapter: CurriculumChapterV2
): string[] {
  const errors: string[] = [];

  if (generated.length !== slots.length) {
    errors.push(`COUNT MISMATCH: expected exactly ${slots.length} questions, received ${generated.length}.`);
  }

  generated.forEach((q, i) => {
    const slot = slots[i];
    if (!slot) return;
    if (q.chapterId !== chapter.id)
      errors.push(`Q${i + 1}: chapterId must be "${chapter.id}" (got "${q.chapterId}").`);
    if (q.difficulty !== slot.difficulty)
      errors.push(`Q${i + 1}: difficulty must be "${slot.difficulty}" (got "${q.difficulty}").`);
    const lo = chapter.objectives.find((o) => o.code === q.objectiveCode);
    if (!lo)
      errors.push(`Q${i + 1}: objectiveCode "${q.objectiveCode}" does not exist in this chapter.`);
    else if (lo.bloom !== slot.bloom)
      errors.push(`Q${i + 1}: objective ${q.objectiveCode} requires Bloom level "${slot.bloom}" (got ${lo.bloom}).`);
  });

  // Batch-level distribution drift check
  const pct = (n: number) => (generated.length ? (n / generated.length) * 100 : 0);
  for (const d of ["Easy", "Medium", "Hard"] as Difficulty[]) {
    const got = pct(generated.filter((q) => q.difficulty === d).length);
    const want = chapter.difficultyMix[d] * (slots.length / count(chapter));
    if (Math.abs(got - want) > TOLERANCE_PCT + 5)
      errors.push(`DISTRIBUTION DRIFT: ${d} questions are ${got.toFixed(0)}% of the batch (target ~${chapter.difficultyMix[d]}%).`);
  }
  return errors;
}

const count = (_c: CurriculumChapterV2) => 100; // distribution targets are % of chapter bank

export function buildQuotaFeedback(errors: string[]): string {
  if (!errors.length) return "";
  return `QUOTA VALIDATION FAILED — fix ALL of these:\n${errors.join("\n")}\n` +
    `Regenerate ALL questions strictly following the per-slot assignments (type, difficulty, bloom, objectiveCode).`;
}
