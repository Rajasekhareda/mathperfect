import { insertBankQuestions } from "../db/database";

// Inside saveQuestions(...):
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
  // 1. Existing duplicate warning logic & cache append
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

  // 2. Persist atomically to SQLite question_bank table
  try {
    insertBankQuestions(meta, questions);
  } catch (err) {
    console.error("[SQLite Bank] Failed to insert questions:", err);
  }

  return { added: questions.length, warnings };
}