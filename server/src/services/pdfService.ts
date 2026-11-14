// server/src/services/pdfService.ts
import PDFDocument from "pdfkit";
import { Writable } from "stream";

export interface PDFQuestionItem {
  questionNumber: number;
  questionText: string;
  marks: number;
  answer?: string;
  solutionSteps?: string[];
}

export interface PDFExportOptions {
  title: string;
  grade: string;
  board: string;
  topic: string;
  totalMarks: number;
  questions: PDFQuestionItem[];
  includeAnswerKey?: boolean;
}

export class PDFService {
  /**
   * Generates a clean, print-ready PDF stream.
   */
  public static generateWorksheetPDF(
    options: PDFExportOptions,
    outputStream: Writable
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: 45, right: 45 },
        bufferPages: true,
      });

      doc.on("error", reject);
      outputStream.on("finish", resolve);
      doc.pipe(outputStream);

      // 1. Header & Branding
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(options.title || "Mathematics Worksheet", { align: "center" });

      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `${options.grade} | Board: ${options.board} | Topic: ${options.topic} | Max Marks: ${options.totalMarks}`,
          { align: "center" }
        );

      doc.moveDown(0.8);

      // Student info block
      const startY = doc.y;
      doc
        .fontSize(9)
        .font("Helvetica")
        .text("Student Name: ___________________________", 45, startY)
        .text("Date: ______________", 320, startY)
        .text("Score: _____ / " + options.totalMarks, 450, startY);

      doc.moveDown(1.5);
      doc.strokeColor("#999999").lineWidth(0.75).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // 2. Questions Section
      doc.fontSize(10).font("Helvetica");
      options.questions.forEach((q) => {
        // Prevent question splitting awkwardly across pages
        if (doc.y > 700) {
          doc.addPage();
        }

        const questionLine = `Q${q.questionNumber}. ${q.questionText}`;
        const marksLabel = `(${q.marks} mark${q.marks > 1 ? "s" : ""})`;

        doc.font("Helvetica-Bold").text(questionLine, 45, doc.y, {
          continued: true,
          width: 440,
        });
        doc.font("Helvetica-Oblique").text(`   ${marksLabel}`, { align: "right" });

        // Working space for students
        doc.moveDown(4);
      });

      // 3. Optional Answer Key Page
      if (options.includeAnswerKey) {
        doc.addPage();
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("Answer Key & Step-by-Step Solutions", { align: "center" });
        doc.moveDown(1);
        doc.strokeColor("#999999").lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        options.questions.forEach((q) => {
          if (doc.y > 720) doc.addPage();

          doc.fontSize(10).font("Helvetica-Bold").text(`Q${q.questionNumber}: ${q.answer || "N/A"}`);
          if (q.solutionSteps && q.solutionSteps.length > 0) {
            doc.font("Helvetica").fontSize(9);
            q.solutionSteps.forEach((step) => {
              doc.text(`   • ${step}`);
            });
          }
          doc.moveDown(0.8);
        });
      }

      // 4. Page numbering footer across all pages
      const pageRange = doc.bufferedPageRange();
      for (let i = 0; i < pageRange.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#666666")
          .text(
            `Page ${i + 1} of ${pageRange.count}  •  MathPerfect Engine`,
            45,
            doc.page.height - 30,
            { align: "center", width: 505 }
          );
      }

      doc.end();
    });
  }
}