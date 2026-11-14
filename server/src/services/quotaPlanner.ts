// Stage A2 — Anti-bias batch planner.
// Converts chapter quotas into concrete generation slots, weighted toward
// buckets that are UNDER-represented in your existing question bank.

import { CurriculumChapterV2, Bloom, Difficulty } from "../types/curriculumV2";

export interface BankStats {
  total: number;
  byBloom: Partial<Record<Bloom, number>>;
  byDifficulty: Partial<Record<Difficulty, number>>;
}

export interface PlanSlot {
  type: string;
  difficulty: Difficulty;
  marks: number;
  bloom: Bloom;
  objectiveCode: string;
}

/** Boost buckets that lag behind their target share in the bank (deficit ×2). */
function adjustWeights<T extends string>(
  mix: Record<T, number>,
  actual: Partial<Record<T, number>> | undefined,
  total: number
): Record<T, number> {
  if (!actual || total < 10) return { ...mix }; // too few samples to matter
  const out = {} as Record<T, number>;
  for (const k of Object.keys(mix) as T[]) {
    const targetPct = mix[k];
    const actualPct = ((actual[k] ?? 0) / total) * 100;
    out[k] = Math.max(2, targetPct + 2 * (targetPct - actualPct));
  }
  return out;
}

/** Largest-remainder allocation of `count` units across percentage weights. */
function allocate(weights: Record<string, number>, count: number): Map<string, number> {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const totalW = entries.reduce((s, [, w]) => s + w, 0);
  const raw = entries.map(([k, w]) => ({ k, exact: (w / totalW) * count }));
  const base = raw.map((r) => ({ k: r.k, n: Math.floor(r.exact), frac: r.exact - Math.floor(r.exact) }));
  let left = count - base.reduce((s, b) => s + b.n, 0);
  base.sort((a, b) => b.frac - a.frac);
  for (let i = 0; left > 0 && i < base.length; i++, left--) base[i].n++;
  return new Map(base.map((b) => [b.k, b.n]));
}

export function planBatch(chapter: CurriculumChapterV2, count: number, bank?: BankStats): PlanSlot[] {
  const diffAlloc = allocate(adjustWeights(chapter.difficultyMix, bank?.byDifficulty, bank?.total ?? 0), count);
  const bloomAlloc = allocate(adjustWeights(chapter.bloomMix, bank?.byBloom, bank?.total ?? 0), count);

  const objByBloom = new Map<Bloom, string[]>();
  for (const o of chapter.objectives) {
    objByBloom.set(o.bloom, [...(objByBloom.get(o.bloom) ?? []), o.code]);
  }

  const slots: PlanSlot[] = [];
  const bloomKeys = [...bloomAlloc.keys()] as Bloom[];
  let bi = 0;

  for (const [difficulty, n] of diffAlloc) {
    for (let i = 0; i < n; i++) {
      // Round-robin through bloom buckets that still have quota left
      let bloom = bloomKeys[bi % bloomKeys.length];
      let guard = 0;
      while ((bloomAlloc.get(bloom) ?? 0) <= 0 && guard++ < bloomKeys.length) {
        bi++;
        bloom = bloomKeys[bi % bloomKeys.length];
      }
      bloomAlloc.set(bloom, (bloomAlloc.get(bloom) ?? 0) - 1);
      bi++;

      const codes = objByBloom.get(bloom) ?? chapter.objectives.map((o) => o.code);
      const objectiveCode = codes.length ? codes[slots.length % codes.length] : "";
      const type = chapter.questionTypes[slots.length % chapter.questionTypes.length];

      slots.push({
        type,
        difficulty: difficulty as Difficulty,
        marks: chapter.marksDefault[type] ?? 2,
        bloom,
        objectiveCode,
      });
    }
  }
  return slots;
}
