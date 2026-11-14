// server/src/services/questionBankService.ts
import { db, insertBankQuestions, persistAtomicWorksheet, calculateFingerprint, calculateSkeleton } from "../db/database";
import { Worksheet, Question } from "../types";

export class QuestionBankService {
  /**
   * Final action when saving/exporting a worksheet:
   * 1. Inserts questions into the global `question_bank` repository with zero duplicates
   *    (if fingerprint exists, increments usage_count).
   * 2. Saves the worksheet and linked questions atomically via `persistAtomicWorksheet`.
   */
  public static finalizeAndSaveWorksheet(
    worksheet: Worksheet,
    status: "DRAFT" | "APPROVED" | "EXPORTED" = "EXPORTED"
  ): { addedToBank: number; totalBankCount: number } {
    // 1. Deduplicate into question_bank
    const bankItems = worksheet.questions.map((q) => ({
      question: q.question,
      type: q.type || "Short Answer",
      difficulty: q.difficulty || worksheet.config.difficulty,
      cognitiveSkill: q.cognitiveSkill || "Understand",
      marks: q.marks || 1,
      options: q.options || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    }));

    const added = insertBankQuestions(
      {
        board: worksheet.config.board,
        grade: worksheet.config.grade,
        topic: worksheet.config.topic,
      },
      bankItems
    );

    // 2. Atomic worksheet persistence
    persistAtomicWorksheet(worksheet, status);

    const totalCount = (
      db.prepare("SELECT COUNT(*) as cnt FROM question_bank").get() as { cnt: number }
    ).cnt;

    return { addedToBank: added, totalBankCount: totalCount };
  }

  /**
   * Check if a question already exists in the global bank
   */
  public static findInBank(text: string): any {
    const fp = calculateFingerprint(text);
    return db.prepare("SELECT * FROM question_bank WHERE fingerprint = ?").get(fp);
  }
}