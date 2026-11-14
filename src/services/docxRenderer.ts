import {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer,
  Paragraph, Table, TableCell, TableRow, TextRun, WidthType, ShadingType,
} from "docx";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { OUTPUT_DIR, DEFAULT_INSTITUTION_NAME } from "../config";
import { sanitizeFileName } from "../utils";
import { Question, Worksheet, WorksheetSection } from "../types";

type DocxAlignment = typeof AlignmentType[keyof typeof AlignmentType];

interface TemplateProfile {
  bodyFont: string;
  headingFont: string;
  bodySize: number;
  headingSize: number;
  spacingAfter: number;
  questionGap: number;
  decorative: boolean;
  writeLines: number;
}

const TEMPLATE_PROFILES: Record<string, TemplateProfile> = {
  "clean-school": { bodyFont: "Calibri", headingFont: "Calibri", bodySize: 22, headingSize: 28, spacingAfter: 120, questionGap: 200, decorative: false, writeLines: 0 },
  "exam-practice": { bodyFont: "Times New Roman", headingFont: "Times New Roman", bodySize: 22, headingSize: 26, spacingAfter: 80, questionGap: 120, decorative: false, writeLines: 0 },
  "primary-fun-math": { bodyFont: "Comic Sans MS", headingFont: "Comic Sans MS", bodySize: 24, headingSize: 30, spacingAfter: 140, questionGap: 240, decorative: true, writeLines: 3 },
  "concept-builder": { bodyFont: "Georgia", headingFont: "Georgia", bodySize: 22, headingSize: 28, spacingAfter: 120, questionGap: 200, decorative: false, writeLines: 2 },
  "competency-hots": { bodyFont: "Calibri", headingFont: "Calibri", bodySize: 22, headingSize: 28, spacingAfter: 120, questionGap: 180, decorative: false, writeLines: 2 },
  "revision-pack": { bodyFont: "Calibri", headingFont: "Calibri", bodySize: 22, headingSize: 28, spacingAfter: 100, questionGap: 160, decorative: false, writeLines: 1 },
  "teacher-assessment": { bodyFont: "Times New Roman", headingFont: "Times New Roman", bodySize: 22, headingSize: 26, spacingAfter: 100, questionGap: 160, decorative: false, writeLines: 0 },
};

const DEFAULT_PROFILE = TEMPLATE_PROFILES["clean-school"];

function getProfile(templateId: string): TemplateProfile {
  return TEMPLATE_PROFILES[templateId] || DEFAULT_PROFILE;
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const CELL_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

function headerCell(text: string, width: number, opts?: { bold?: boolean; shading?: string; align?: DocxAlignment }): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: CELL_BORDERS,
    shading: opts?.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: opts?.align, children: [new TextRun({ text, bold: opts?.bold !== false, font: "Calibri", size: 22, color: opts?.shading ? "FFFFFF" : "000000" })] })],
  });
}

function infoCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: CELL_BORDERS,
    margins: { top: 40, bottom: 40, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, font: "Calibri", size: 20 })] })],
  });
}

const OPEN_ENDED = new Set(["Short Answer", "Long Answer", "Word Problems", "HOTS", "Case/Activity", "Number/Pattern", "Logical Reasoning"]);

function buildQuestionPara(q: Question, num: number, profile: TemplateProfile): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const qText = `${num}. ${q.question}  [${q.marks} ${q.marks === 1 ? "mark" : "marks"}]`;
  out.push(new Paragraph({ spacing: { after: profile.questionGap }, children: [new TextRun({ text: qText, font: profile.bodyFont, size: profile.bodySize, bold: false })] }));

  if (q.type === "MCQ" && q.options && q.options.length > 0) {
    const optTable = new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [4500, 4500],
      rows: [
        new TableRow({ children: [headerCell(`(a) ${q.options[0] || ""}`, 4500), headerCell(`(b) ${q.options[1] || ""}`, 4500)] }),
        new TableRow({ children: [headerCell(`(c) ${q.options[2] || ""}`, 4500), headerCell(`(d) ${q.options[3] || ""}`, 4500)] }),
      ],
    });
    out.push(optTable);
  } else if (q.type === "Match the Following" && q.options && q.options.length > 0) {
    for (let i = 0; i < q.options.length; i++) {
      out.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `  ${String.fromCharCode(65 + i)}. ${q.options[i] || ""}`, font: profile.bodyFont, size: profile.bodySize })] }));
    }
  } else if (q.type === "Fill in the Blanks") {
    out.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "  ___________________________________________", font: profile.bodyFont, size: profile.bodySize })] }));
  } else if (q.type === "True/False") {
    out.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "  (True / False) _____________________________", font: profile.bodyFont, size: profile.bodySize })] }));
  } else if (OPEN_ENDED.has(q.type)) {
    for (let i = 0; i < (profile.writeLines || 3); i++) {
      out.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "  ____________________________________________________________________", font: profile.bodyFont, size: profile.bodySize, color: "AAAAAA" })] }));
    }
  }
  return out;
}

function buildAnswerKeyTable(ws: Worksheet): Table {
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Q.No.", 800, { bold: true, shading: "1F4E79", align: AlignmentType.CENTER }),
        headerCell("Answer", 3000, { bold: true, shading: "1F4E79" }),
        headerCell("Explanation", 5800, { bold: true, shading: "1F4E79" }),
      ],
    }),
  ];
  for (const ak of ws.answerKey) {
    rows.push(new TableRow({
      children: [
        headerCell(String(ak.number), 800, { align: AlignmentType.CENTER }),
        headerCell(ak.answer, 3000),
        headerCell(ak.explanation, 5800),
      ],
    }));
  }
  rows.push(new TableRow({
    children: [
      headerCell("TOTAL", 800, { bold: true, align: AlignmentType.CENTER, shading: "D9E2F3" }),
      headerCell(`${ws.totalMarks} marks`, 3000, { bold: true, shading: "D9E2F3" }),
      headerCell("", 5800),
    ],
  }));
  return new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: [800, 3000, 5800], rows });
}

/** Render worksheet to a .docx file. Returns the output file path. */
export async function renderWorksheetToDocx(ws: Worksheet, institutionName?: string): Promise<string> {
  const profile = getProfile(ws.config.template);
  const school = institutionName || ws.config.institutionName || DEFAULT_INSTITUTION_NAME;
  const sections: (Paragraph | Table)[] = [];

  // Header block
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: school.toUpperCase(), font: profile.headingFont, size: profile.headingSize, bold: true, color: "1F4E79" })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: ws.title, font: profile.headingFont, size: profile.headingSize - 2, bold: true })] }));

  // Info table
  const infoRow1 = new TableRow({ children: [infoCell(`Board: ${ws.config.board}`, 3200), infoCell(`Class: ${ws.config.grade}`, 3200), infoCell(`Subject: Mathematics`, 3200)] });
  const infoRow2 = new TableRow({ children: [infoCell(`Topic: ${ws.config.topic}`, 4800), infoCell(`Time: ${ws.config.timeLimitMinutes || 45} min`, 2200), infoCell(`Max Marks: ${ws.totalMarks}`, 2600)] });
  sections.push(new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: [3200, 3200, 3200], rows: [infoRow1, infoRow2] }));

  // Student details
  sections.push(new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: `Name: _________________________    Class: ____________    Roll No: ____________    Date: ____________`, font: "Calibri", size: 20 })] }));

  // Instructions
  if (ws.instructions.length > 0) {
    sections.push(new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun({ text: "Instructions:", font: "Calibri", size: 20, bold: true })] }));
    for (const inst of ws.instructions) {
      sections.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `  • ${inst}`, font: "Calibri", size: 20 })] }));
    }
  }

  // Sections and questions
  for (const section of ws.sections) {
    const sectionQuestions = section.questionIds.map((qid) => ws.questions.find((q) => q.id === qid)!).filter(Boolean);
    sections.push(new Paragraph({ spacing: { before: 300, after: 150 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F4E79" } }, children: [new TextRun({ text: `Section ${section.label}  (${section.marks} marks)`, font: profile.headingFont, size: profile.headingSize - 4, bold: true, color: "1F4E79" })] }));
    for (let i = 0; i < sectionQuestions.length; i++) {
      const q = sectionQuestions[i];
      const num = ws.answerKey.find((ak) => ak.questionId === q.id)?.number || (i + 1);
      const parts = buildQuestionPara(q, num, profile);
      for (const p of parts) sections.push(p);
    }
  }

  // Answer key on new page
  sections.push(new Paragraph({ pageBreakBefore: true, alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "ANSWER KEY", font: profile.headingFont, size: profile.headingSize, bold: true, color: "1F4E79" })] }));
  sections.push(buildAnswerKeyTable(ws));

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } }, children: sections }] });
  const buffer = await Packer.toBuffer(doc);
  await mkdir(OUTPUT_DIR, { recursive: true });
  const fileName = sanitizeFileName(`${ws.title}_${ws.id}.docx`);
  const filePath = join(OUTPUT_DIR, fileName);
  await writeFile(filePath, buffer);
  return filePath;
}
