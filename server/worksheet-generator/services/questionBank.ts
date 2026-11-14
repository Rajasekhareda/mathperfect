/**
 * Question Bank — automatic indexing, duplicate detection, search, and deduplication cleanups.
 * Storage: server/data/questionbank/questions-YYYY-MM.json (one file per month)
 * Backups: server/data/questionbank/backups/bank-YYYY-MM-DD.json (daily)
 */
import fs from "fs";
import path from "path";

export interface BankQuestion {
  id: string;
  worksheetId: string;
  board: string;
  grade: string;
  topic: string;
  type: string;
  difficulty: string;
  bloom: string;
  marks: number;
  question: string;
  options: string[] | null;
  correctAnswer: string;
  createdAt: string;
  fingerprint: string;
  skeleton: string;
}

export interface DuplicateWarning {
  newQuestion: string;
  existingQuestion: string;
  reason: "exact" | "numbers-changed" | "very-similar";
}

export interface SaveResult {
  added: number;
  warnings: DuplicateWarning[];
}

const BANK_DIR = path.join(process.cwd(), "data", "questionbank");
const BACKUP_DIR = path.join(BANK_DIR, "backups");
let cache: BankQuestion[] | null = null;
let lastDailyBackup = "";

function ensureDirs(): void {
  fs.mkdirSync(BANK_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function monthFileName(d = new Date()): string {
  return `questions-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}.json`;
}

/** Normalized text: lowercase, punctuation removed — for exact-match detection. */
function fingerprintOf(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Numbers erased: "aarav has 5 apples" and "priya has 9 apples" become identical. */
function skeletonOf(fp: string): string {
  return fp.replace(/\d+/g, "#");
}

function wordSetOf(s: string): Set<string> {
  return new Set(s.split(" ").filter((w) => w.length > 2 && w !== "#"));
}

/** 0 = totally different, 1 = identical word sets. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

export function loadBank(): BankQuestion[] {
  if (cache) return cache;
  ensureDirs();
  const all: BankQuestion[] = [];
  for (const f of fs.readdirSync(BANK_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(BANK_DIR, f), "utf-8"));
      if (Array.isArray(raw)) all.push(...(raw as BankQuestion[]));
    } catch {
      console.warn(`[questionbank] Skipping unreadable file: ${f}`);
    }
  }
  cache = all;
  return all;
}

function writeMonthFile(questions: BankQuestion[]): void {
  const file = path.join(BANK_DIR, monthFileName());
  if (fs.existsSync(file)) fs.copyFileSync(file, file + ".bak");
  fs.writeFileSync(file, JSON.stringify(questions, null, 2), "utf-8");
}

function dailyBackup(): void {
  const today = new Date().toISOString().slice(0, 10);
  if (lastDailyBackup === today) return;
  ensureDirs();
  fs.writeFileSync(path.join(BACKUP_DIR, `bank-${today}.json`), JSON.stringify(loadBank(), null, 2), "utf-8");
  lastDailyBackup = today;
}

/** Check one candidate question against a bank array. */
export function findDuplicates(candidate: { question: string }, bank: BankQuestion[]): DuplicateWarning | null {
  const fp = fingerprintOf(candidate.question);
  const sk = skeletonOf(fp);
  const ws = wordSetOf(fp);
  for (let i = bank.length - 1; i >= 0; i--) {
    const ex = bank[i];
    if (ex.fingerprint === fp)
      return { newQuestion: candidate.question, existingQuestion: ex.question, reason: "exact" };
    if (ex.skeleton === sk)
      return { newQuestion: candidate.question, existingQuestion: ex.question, reason: "numbers-changed" };
    if (jaccard(ws, wordSetOf(ex.fingerprint)) >= 0.85)
      return { newQuestion: candidate.question, existingQuestion: ex.question, reason: "very-similar" };
  }
  return null;
}

export function checkAgainstBank(question: string): DuplicateWarning | null {
  return findDuplicates({ question }, loadBank());
}

/**
 * Saves questions upon exit or completion into the bank without filtering out requests.
 */
export function saveQuestions(
  worksheetId: string,
  meta: { board: string; grade: string; topic: string },
  questions: {
    question: string;
    type: string;
    difficulty: string;
    cognitiveSkill?: string;
    marks?: number;
    options?: string[] | null;
    correctAnswer: string;
  }[]
): SaveResult {
  ensureDirs();
  dailyBackup();
  const bank = loadBank();
  const warnings: DuplicateWarning[] = [];
  const now = new Date().toISOString();

  questions.forEach((q, idx) => {
    const dup = findDuplicates(q, bank);
    if (dup) warnings.push(dup);
    const fp = fingerprintOf(q.question);
    bank.push({
      id: `${worksheetId}-q${idx + 1}`,
      worksheetId,
      board: meta.board,
      grade: meta.grade,
      topic: meta.topic,
      type: q.type,
      difficulty: q.difficulty,
      bloom: q.cognitiveSkill ?? "Understand",
      marks: q.marks ?? 1,
      question: q.question,
      options: q.options ?? null,
      correctAnswer: q.correctAnswer,
      createdAt: now,
      fingerprint: fp,
      skeleton: skeletonOf(fp),
    });
  });

  const monthTag = new Date().toISOString().slice(0, 7);
  writeMonthFile(bank.filter((b) => b.createdAt.slice(0, 7) === monthTag));
  cache = bank;
  return { added: questions.length, warnings };
}

/**
 * RULE 1: Cleanup / deduplication engine inside the bank.
 * Runs inside the bank to detect and delete exact or near-identical questions.
 */
export function deduplicateBank(): { before: number; after: number; removed: number } {
  ensureDirs();
  const bank = loadBank();
  const before = bank.length;
  const uniqueList: BankQuestion[] = [];
  const seenFp = new Set<string>();

  for (const q of bank) {
    const fp = q.fingerprint || fingerprintOf(q.question);
    if (!seenFp.has(fp)) {
      seenFp.add(fp);
      uniqueList.push(q);
    }
  }

  cache = uniqueList;
  const monthTag = new Date().toISOString().slice(0, 7);
  writeMonthFile(uniqueList.filter((b) => b.createdAt.slice(0, 7) === monthTag));
  return {
    before,
    after: uniqueList.length,
    removed: before - uniqueList.length,
  };
}

export interface BankSearch {
  q?: string;
  grade?: string;
  topic?: string;
  type?: string;
  bloom?: string;
  difficulty?: string;
  limit?: number;
}

export function searchBank(opts: BankSearch = {}): BankQuestion[] {
  const q = (opts.q ?? "").toLowerCase().trim();
  let out = loadBank();
  if (opts.grade) out = out.filter((b) => b.grade === opts.grade);
  if (opts.topic) out = out.filter((b) => b.topic === opts.topic);
  if (opts.type) out = out.filter((b) => b.type === opts.type);
  if (opts.bloom) out = out.filter((b) => b.bloom === opts.bloom);
  if (opts.difficulty) out = out.filter((b) => b.difficulty === opts.difficulty);
  if (q) out = out.filter((b) => b.fingerprint.includes(q) || b.topic.toLowerCase().includes(q));
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500);
  return out.slice(-limit).reverse();
}

export function bankStats() {
  const bank = loadBank();
  const byGrade: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byBloom: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  for (const b of bank) {
    byGrade[b.grade] = (byGrade[b.grade] ?? 0) + 1;
    byType[b.type] = (byType[b.type] ?? 0) + 1;
    byBloom[b.bloom] = (byBloom[b.bloom] ?? 0) + 1;
    byDifficulty[b.difficulty] = (byDifficulty[b.difficulty] ?? 0) + 1;
  }
  return { total: bank.length, byGrade, byType, byBloom, byDifficulty };
}
