// server/src/routes/worksheetRoutes.ts
import { Router, Request, Response } from "express";
import crypto from "crypto";
import { DriftProofEngine } from "../services/driftProofEngine";
import { QuestionBankService } from "../services/questionBankService";
import { PDFService } from "../services/pdfService";

const router = Router();

/**
 * 1. PREVIEW GENERATION (Client can call as much as they want)
 * DB remains untouched here.
 */
router.post("/generate", (req: Request, res: Response): any => {
  try {
    const { grade, board, topic, difficulty = "Medium", count = 5 } = req.body;

    if (!grade || !topic) {
      return res.status(400).json({ error: "grade and topic are required." });
    }

    const questions = DriftProofEngine.generateWorksheetQuestions({
      grade,
      board: board || "CBSE",
      topic,
      difficulty,
      count: Number(count),
      baseSeed: Math.floor(Math.random() * 100000),
    });

    return res.json({
      success: true,
      grade,
      board,
      topic,
      difficulty,
      totalQuestions: questions.length,
      questions,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 2. FINAL ACTION: SAVE & EXPORT PDF
 * - Deduplicates questions in canonical DB table
 * - Saves worksheet record
 * - Generates & streams PDF
 */
router.post("/save-and-export", async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      grade,
      board = "CBSE",
      topic,
      difficulty = "Medium",
      questions,
      includeAnswerKey = true,
    } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Questions array is required to export." });
    }

    const worksheetId = `ws_${crypto.randomUUID()}`;
    const totalMarks = questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0);

    // Canonical atomic save without duplicates
    QuestionBankService.finalizeAndSaveWorksheet({
      worksheetId,
      title: title || `${grade} ${topic} Worksheet`,
      grade,
      board,
      topic,
      difficulty,
      totalMarks,
      questions: questions.map((q: any) => ({
        questionText: q.questionText,
        answer: q.answer,
        solutionSteps: q.solutionSteps || [],
        grade,
        board,
        topic,
        difficulty,
        marks: q.marks || 1,
      })),
    });

    // Prepare PDF HTTP response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(title || "Worksheet").replace(/\s+/g, "_")}.pdf"`
    );

    const pdfQuestions = questions.map((q: any, idx: number) => ({
      questionNumber: idx + 1,
      questionText: q.questionText,
      marks: q.marks || 1,
      answer: q.answer,
      solutionSteps: q.solutionSteps,
    }));

    await PDFService.generateWorksheetPDF(
      {
        title: title || `${grade} - ${topic}`,
        grade,
        board,
        topic,
        totalMarks,
        questions: pdfQuestions,
        includeAnswerKey,
      },
      res
    );
  } catch (err: any) {
    console.error("Save & Export Error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
  }
});

export default router;