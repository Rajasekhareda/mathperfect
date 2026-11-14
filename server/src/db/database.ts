/**
 * Atomic SQLite Database Engine (better-sqlite3)
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Worksheet, Question, AnswerKeyEntry } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "mathworksheet.db");
export const db = new Database(DB_PATH);

// Optimize database for concurrent reads and crash safety
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");

/* ==========================================================================
   SCHEMA INITIALIZATION
   ========================================================================== */

db.exec(`
  -- 1. Core Worksheets Table
  CREATE TABLE IF NOT EXISTS worksheets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    grade TEXT NOT NULL,
    board TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT,
    difficulty TEXT NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('DRAFT', 'APPROVED', 'EXPORTED')) DEFAULT 'DRAFT',
    config_json TEXT NOT NULL,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- 2. Atomic Questions Table
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    worksheet_id TEXT NOT NULL,
    order_idx INTEGER NOT NULL,
    type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options_json TEXT,
    correct_answer TEXT NOT NULL,
    acceptable_answers_json TEXT,
    explanation TEXT,
    marks INTEGER NOT NULL DEFAULT 1,
    difficulty TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT,
    learning_objective TEXT,
    cognitive_skill TEXT,
    hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(worksheet_id) REFERENCES worksheets(id) ON DELETE CASCADE
  );

  -- 3. Isolated Answer Keys Table
  CREATE TABLE IF NOT EXISTS answer_keys (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL UNIQUE,
    worksheet_id TEXT NOT NULL,
    final_answer TEXT NOT NULL,
    steps_json TEXT,
    explanation TEXT,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY(worksheet_id) REFERENCES worksheets(id) ON DELETE CASCADE
  );

  -- 4. Global Question Bank Table (Deduplication Repository)
  CREATE TABLE IF NOT EXISTS question_bank (
    id TEXT PRIMARY KEY,
    board TEXT NOT NULL,
    grade TEXT NOT NULL,
    topic TEXT NOT NULL,
    type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    bloom TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    options_json TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    fingerprint TEXT NOT NULL,
    skeleton TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 1,
    last_used_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- 5. Projects Storage (Full Payload Cache for UI)
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    saved_at TEXT NOT NULL,
    docx_path TEXT,
    pdf_path TEXT,
    worksheet_json TEXT NOT NULL
  );

  -- 6. Export Audit Trail
  CREATE TABLE IF NOT EXISTS export_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    format TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    page_count INTEGER DEFAULT 0,
    exported_at TEXT NOT NULL
  );

  -- 7. Custom Curriculum Documents
  CREATE TABLE IF NOT EXISTS curriculum_docs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    board TEXT NOT NULL,
    grade TEXT NOT NULL,
    content TEXT NOT NULL,
    added_at TEXT NOT NULL
  );

  -- INDICES
  CREATE INDEX IF NOT EXISTS idx_questions_ws_id ON questions(worksheet_id);
  CREATE INDEX IF NOT EXISTS idx_questions_hash ON questions(hash);
  CREATE INDEX IF NOT EXISTS idx_bank_fp ON question_bank(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_bank_sk ON question_bank(skeleton);
  CREATE INDEX IF NOT EXISTS idx_bank_lookup ON question_bank(grade, topic, difficulty);
  CREATE INDEX IF NOT EXISTS idx_history_project ON export_history(project_id);
`);

/* ==========================================================================
   HASH & NORMALIZATION HELPERS (EXPORTED)
   ========================================================================== */

export function calculateFingerprint(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function calculateSkeleton(fp: string): string {
  return fp.replace(/\d+/g, "#");
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/* ==========================================================================
   ATOMIC WORKSHEET PERSISTENCE
   ========================================================================== */

export const persistAtomicWorksheet = db.transaction((ws: Worksheet, status: "DRAFT" | "APPROVED" | "EXPORTED" = "DRAFT"): void => {
  const now = new Date().toISOString();

  // 1. Insert/Update Worksheet Record
  const insertWs = db.prepare(`
    INSERT INTO worksheets (
      id, title, grade, board, topic, subtopic, difficulty, total_marks, status,
      config_json, metadata_json, created_at, updated_at
    ) VALUES (
      @id, @title, @grade, @board, @topic, @subtopic, @difficulty, @total_marks, @status,
      @config_json, @metadata_json, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      total_marks = excluded.total_marks,
      status = excluded.status,
      config_json = excluded.config_json,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at
  `);

  insertWs.run({
    id: ws.id,
    title: ws.title,
    grade: ws.config.grade,
    board: ws.config.board,
    topic: ws.config.topic,
    subtopic: ws.config.subtopic || null,
    difficulty: ws.config.difficulty,
    total_marks: ws.totalMarks || 0,
    status,
    config_json: JSON.stringify(ws.config),
    metadata_json: JSON.stringify(ws.metadata || {}),
    created_at: ws.createdAt || now,
    updated_at: now
  });

  // 2. Clear existing child records for this worksheet
  db.prepare(`DELETE FROM answer_keys WHERE worksheet_id = ?`).run(ws.id);
  db.prepare(`DELETE FROM questions WHERE worksheet_id = ?`).run(ws.id);

  // 3. Insert Questions and Answer Keys
  const insertQuestion = db.prepare(`
    INSERT INTO questions (
      id, worksheet_id, order_idx, type, question_text, options_json,
      correct_answer, acceptable_answers_json, explanation, marks,
      difficulty, topic, subtopic, learning_objective, cognitive_skill,
      hash, created_at
    ) VALUES (
      @id, @worksheet_id, @order_idx, @type, @question_text, @options_json,
      @correct_answer, @acceptable_answers_json, @explanation, @marks,
      @difficulty, @topic, @subtopic, @learning_objective, @cognitive_skill,
      @hash, @created_at
    )
  `);

  const insertAnsKey = db.prepare(`
    INSERT INTO answer_keys (
      id, question_id, worksheet_id, final_answer, steps_json, explanation
    ) VALUES (
      @id, @question_id, @worksheet_id, @final_answer, @steps_json, @explanation
    )
  `);

  ws.questions.forEach((q: Question, idx: number) => {
    const qFp = calculateFingerprint(q.question);
    const questionId = q.id && q.id.startsWith(ws.id) ? q.id : `${ws.id}_${q.id || idx + 1}`;

    insertQuestion.run({
      id: questionId,
      worksheet_id: ws.id,
      order_idx: idx + 1,
      type: q.type,
      question_text: q.question,
      options_json: q.options ? JSON.stringify(q.options) : null,
      correct_answer: q.correctAnswer,
      acceptable_answers_json: q.acceptableAnswers ? JSON.stringify(q.acceptableAnswers) : null,
      explanation: q.explanation || "",
      marks: q.marks || 1,
      difficulty: q.difficulty,
      topic: q.topic || ws.config.topic,
      subtopic: ws.config.subtopic || null,
      learning_objective: q.learningObjective || null,
      cognitive_skill: q.cognitiveSkill || null,
      hash: qFp,
      created_at: now
    });

    const keyEntry = ws.answerKey?.find((k) => k.questionId === q.id || k.questionId === questionId);
    insertAnsKey.run({
      id: `ans_${questionId}`,
      question_id: questionId,
      worksheet_id: ws.id,
      final_answer: keyEntry?.answer || q.correctAnswer,
      steps_json: keyEntry?.steps ? JSON.stringify(keyEntry.steps) : null,
      explanation: keyEntry?.explanation || q.explanation || ""
    });
  });
});

/* ==========================================================================
   QUESTION BANK ATOMIC REPOSITORY
   ========================================================================== */

export interface DbBankQuestion {
  id: string;
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
  explanation?: string;
  usageCount: number;
  createdAt: string;
}

export const insertBankQuestions = db.transaction((
  meta: { board: string; grade: string; topic: string },
  questions: {
    question: string;
    type: string;
    difficulty: string;
    cognitiveSkill?: string;
    marks?: number;
    options?: string[] | null;
    correctAnswer: string;
    explanation?: string;
  }[]
): number => {
  const now = new Date().toISOString();
  let added = 0;

  const stmt = db.prepare(`
    INSERT INTO question_bank (
      id, board, grade, topic, type, difficulty, bloom, marks,
      question_text, options_json, correct_answer, explanation,
      fingerprint, skeleton, usage_count, last_used_at, created_at
    ) VALUES (
      @id, @board, @grade, @topic, @type, @difficulty, @bloom, @marks,
      @question_text, @options_json, @correct_answer, @explanation,
      @fingerprint, @skeleton, 1, @now, @now
    )
    ON CONFLICT(id) DO UPDATE SET
      usage_count = usage_count + 1,
      last_used_at = excluded.last_used_at
  `);

  for (const q of questions) {
    const fp = calculateFingerprint(q.question);
    const sk = calculateSkeleton(fp);
    const id = `qb_${Math.abs(hashString(fp))}`;

    stmt.run({
      id,
      board: meta.board,
      grade: meta.grade,
      topic: meta.topic,
      type: q.type,
      difficulty: q.difficulty,
      bloom: q.cognitiveSkill || "Understand",
      marks: q.marks || 1,
      question_text: q.question,
      options_json: q.options ? JSON.stringify(q.options) : null,
      correct_answer: q.correctAnswer,
      explanation: q.explanation || null,
      fingerprint: fp,
      skeleton: sk,
      now
    });
    added++;
  }
  return added;
});

/* ==========================================================================
   PROJECT STORAGE API
   ========================================================================== */

export interface SavedProject {
  id: string;
  savedAt: string;
  docxPath?: string | null;
  pdfPath?: string | null;
  worksheet: Worksheet;
}

export function saveProject(ws: Worksheet, docxPath?: string, pdfPath?: string): SavedProject {
  const now = new Date().toISOString();
  persistAtomicWorksheet(ws, pdfPath ? "EXPORTED" : "DRAFT");

  const stmt = db.prepare(`
    INSERT INTO projects (id, saved_at, docx_path, pdf_path, worksheet_json)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      saved_at = excluded.saved_at,
      docx_path = COALESCE(excluded.docx_path, projects.docx_path),
      pdf_path = COALESCE(excluded.pdf_path, projects.pdf_path),
      worksheet_json = excluded.worksheet_json
  `);
  stmt.run(ws.id, now, docxPath || null, pdfPath || null, JSON.stringify(ws));

  return {
    id: ws.id,
    savedAt: now,
    docxPath,
    pdfPath,
    worksheet: ws
  };
}

export function getProject(id: string): SavedProject | null {
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as {
    id: string;
    saved_at: string;
    docx_path: string | null;
    pdf_path: string | null;
    worksheet_json: string;
  } | undefined;

  if (!row) return null;
  return {
    id: row.id,
    savedAt: row.saved_at,
    docxPath: row.docx_path,
    pdfPath: row.pdf_path,
    worksheet: JSON.parse(row.worksheet_json)
  };
}

export function listProjects(): SavedProject[] {
  const rows = db.prepare(`SELECT * FROM projects ORDER BY saved_at DESC`).all() as {
    id: string;
    saved_at: string;
    docx_path: string | null;
    pdf_path: string | null;
    worksheet_json: string;
  }[];

  return rows.map((r) => ({
    id: r.id,
    savedAt: r.saved_at,
    docxPath: r.docx_path,
    pdfPath: r.pdf_path,
    worksheet: JSON.parse(r.worksheet_json)
  }));
}

export function deleteProject(id: string): boolean {
  db.prepare(`DELETE FROM worksheets WHERE id = ?`).run(id);
  const result = db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function addExportRecord(record: {
  projectId: string;
  format: string;
  filePath: string;
  fileSize?: number;
  pageCount?: number;
}): void {
  db.prepare(`
    INSERT INTO export_history (project_id, format, file_path, file_size, page_count, exported_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    record.projectId,
    record.format,
    record.filePath,
    record.fileSize || 0,
    record.pageCount || 0,
    new Date().toISOString()
  );
}

export function getExportHistory(projectId: string) {
  return db.prepare(`SELECT * FROM export_history WHERE project_id = ? ORDER BY exported_at DESC`).all(projectId);
}

/* ==========================================================================
   CURRICULUM LOOKUPS (BUILT-IN DATA WITHOUT EXTERNAL FILE DEPENDENCY)
   ========================================================================== */

const BUILTIN_CURRICULUM = [
  { grade: "Grade 1", chapters: ["Counting & Number Sense", "Addition & Subtraction to 20", "Shapes & Measurements"] },
  { grade: "Grade 2", chapters: ["Place Value & 3-Digit Numbers", "Addition & Subtraction with Regrouping", "Time & Money"] },
  { grade: "Grade 3", chapters: ["Multiplication & Division Fundamentals", "Fractions Introduction", "Perimeter & Area"] },
  { grade: "Grade 4", chapters: ["Multi-Digit Operations", "Equivalent Fractions & Decimals", "Angles & 2D Geometry"] },
  { grade: "Grade 5", chapters: ["Fraction & Decimal Arithmetic", "Volume & Measurement Conversions", "Coordinate Planes"] },
  { grade: "Grade 6", chapters: ["Ratios, Rates & Percentages", "Negative Numbers & Integers", "Algebraic Expressions"] },
  { grade: "Grade 7", chapters: ["Proportional Relationships", "Linear Equations & Inequalities", "Probability & Statistics"] },
  { grade: "Grade 8", chapters: ["Linear Functions & Systems", "Exponents & Scientific Notation", "Pythagorean Theorem"] },
  { grade: "Grade 9", chapters: ["Quadratic Equations", "Coordinate Geometry & Polynomials", "Congruence & Proofs"] },
  { grade: "Grade 10", chapters: ["Trigonometry & Circles", "Arithmetic & Geometric Sequences", "Surface Areas & Volumes"] }
];

export function getAllGrades(): string[] {
  return BUILTIN_CURRICULUM.map((c) => c.grade);
}

export function getCurriculumByGrade(grade: string) {
  const norm = grade.toLowerCase().replace("class", "grade").trim();
  const entry = BUILTIN_CURRICULUM.find((c) => c.grade.toLowerCase() === norm);
  if (!entry) return [];
  return entry.chapters.map((ch, idx) => ({
    id: `cur_${idx + 1}`,
    chapterName: ch,
    subtopics: ["Foundations", "Problem Solving", "Applications"],
    objectives: [`Mastery of ${ch}`],
    difficulty: "Mixed",
    questionTypes: ["MCQ", "Short Answer", "Word Problems"],
    gradeBand: norm
  }));
}

export function searchCurriculum(query: string) {
  const q = query.toLowerCase().trim();
  const results: any[] = [];
  BUILTIN_CURRICULUM.forEach((item) => {
    item.chapters.forEach((ch, idx) => {
      if (ch.toLowerCase().includes(q)) {
        results.push({
          id: `cur_${item.grade}_${idx + 1}`,
          chapterName: ch,
          grade: item.grade,
          subtopics: ["Foundations", "Problem Solving", "Applications"]
        });
      }
    });
  });
  return results;
}

export function listCurriculum() {
  return db.prepare(`SELECT * FROM curriculum_docs ORDER BY added_at DESC`).all() as {
    id: string;
    title: string;
    board: string;
    grade: string;
    content: string;
    added_at: string;
  }[];
}

export function addCurriculum(doc: {
  id: string;
  title: string;
  board: string;
  grade: string;
  content: string;
  addedAt: string;
}) {
  db.prepare(`
    INSERT INTO curriculum_docs (id, title, board, grade, content, added_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(doc.id, doc.title, doc.board, doc.grade, doc.content, doc.addedAt);
  return doc;
}

export function deleteCurriculum(id: string): boolean {
  const res = db.prepare(`DELETE FROM curriculum_docs WHERE id = ?`).run(id);
  return res.changes > 0;
}