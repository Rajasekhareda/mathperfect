import { Router, Request, Response } from "express";
import { existsSync, readdirSync, statSync, readFileSync } from "fs";
import { join as pathJoin } from "path";
import {
  generateWorksheet,
  regenerateQuestion,
} from "../services/worksheetService";
import { validateConfig } from "../services/schemas";
import { validateWorksheet } from "../services/composer";
import { renderWorksheetToDocx } from "../services/docxRenderer";
import { renderWorksheetToHtml } from "../services/htmlRenderer";
import {
  exportWorksheetToPdf,
  findBrowserExecutable,
  verifyPdfFile,
} from "../services/pdfPipeline";
import { finalVerification } from "../services/finalVerification";
import { bankStats, searchBank, deduplicateBank } from "../services/questionBank";
import {
  atlasSize,
  getAtlasChapters,
  getAtlasGrades,
  searchAtlas,
} from "../services/curriculumAtlas";
import {
  BOARDS,
  GRADES,
  QUESTION_TYPES,
  DIFFICULTIES,
  TEMPLATE_IDS,
  TEMPLATE_INFO,
  DEFAULT_INSTITUTION_NAME,
  OUTPUT_DIR,
  PORT,
  DATA_DIR,
  GEMINI_MODEL,
  hasGeminiKey,
} from "../config";
import {
  getCurriculumByGrade,
  getAllGrades,
  searchCurriculum,
  listProjects,
  getProject,
  saveProject,
  deleteProject,
  addExportRecord,
  getExportHistory,
  listCurriculum,
  addCurriculum,
  deleteCurriculum,
} from "../db/database";
import { Worksheet, WorksheetConfig } from "../types";

const router = Router();

const fsExists = (p: string): boolean => {
  try {
    return existsSync(p);
  } catch {
    return false;
  }
};

/** "Class 9" / "Grade 9" / "9" -> 9 */
function gradeNumberOf(grade: string): number {
  const m = grade.match(/\d+/);
  return m ? parseInt(m[0], 10) : -1;
}

/** Parse a worksheet JSON body from the client. */
function parseWorksheetBody(body: unknown): Worksheet | null {
  if (!body || typeof body !== "object") return null;
  const ws =
    (body as { worksheet?: Worksheet }).worksheet ??
    (body as Worksheet);
  if (!ws?.id || !Array.isArray(ws.questions) || !ws.config) {
    return null;
  }
  return ws;
}

// ---------- Metadata for the UI ----------
router.get("/meta", (_req: Request, res: Response) => {
  res.json({
    boards: BOARDS,
    grades: GRADES,
    questionTypes: QUESTION_TYPES,
    difficulties: DIFFICULTIES,
    templates: TEMPLATE_IDS.map((id) => ({
      id,
      ...TEMPLATE_INFO[id],
    })),
    defaultInstitutionName: DEFAULT_INSTITUTION_NAME,
    pdfBrowser: findBrowserExecutable(),
  });
});

// ---------- ATLAS: official chapter lists ----------
router.get("/atlas/grades", (_req: Request, res: Response) => {
  res.json({
    grades: getAtlasGrades(),
    chaptersTotal: atlasSize(),
  });
});

router.get("/atlas/chapters", (req: Request, res: Response) => {
  const raw = String(req.query.grade ?? "");
  const key = `Grade ${gradeNumberOf(raw)}`;
  const chapters = getAtlasChapters(key);
  res.json({
    grade: raw,
    covered: chapters.length > 0,
    chapters: chapters.map((c) => ({
      id: c.id,
      number: c.number,
      name: c.name,
      aliases: c.aliases,
      subtopics: c.subtopics,
    })),
  });
});

router.get("/atlas/search", (req: Request, res: Response) => {
  const q = String(req.query.q ?? "");
  res.json({ query: q, results: searchAtlas(q) });
});

// ---------- Generate (stages A-I) ----------
router.post("/generate", async (req: Request, res: Response) => {
  const check = validateConfig(req.body);
  if (!check.ok) {
    return res.status(400).json({
      error: "Invalid worksheet configuration",
      details: check.errors,
    });
  }
  try {
    const outcome = await generateWorksheet(
      check.config as unknown as WorksheetConfig
    );
    res.json({
      worksheet: outcome.worksheet,
      generator: outcome.generator,
      notice: outcome.generatorNotice,
      bankWarnings: outcome.bankWarnings ?? [],
      finalVerification: finalVerification(outcome.worksheet),
    });
  } catch (err) {
    res.status(500).json({
      error: "Worksheet generation failed",
      details:
        err instanceof Error ? err.message : String(err),
    });
  }
});

// ---------- Validate again ----------
router.post("/validate", (req: Request, res: Response) => {
  const ws = parseWorksheetBody(req.body);
  if (!ws) {
    return res.status(400).json({
      error: "Invalid worksheet payload",
    });
  }
  ws.validation = validateWorksheet(ws);
  res.json({
    worksheet: ws,
    finalVerification: finalVerification(ws),
  });
});

// ---------- Edit a question ----------
router.post("/questions/update", (req: Request, res: Response) => {
  const ws = parseWorksheetBody(req.body);
  const q = req.body?.question;
  if (!ws || !q?.id) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const idx = ws.questions.findIndex((x) => x.id === q.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Question not found" });
  }
  const allowed = new Set([
    "question",
    "options",
    "correctAnswer",
    "explanation",
    "marks",
    "difficulty",
    "learningObjective",
    "cognitiveSkill",
  ]);
  for (const [k, v] of Object.entries(q)) {
    if (allowed.has(k)) {
      (ws.questions[idx] as unknown as Record<string, unknown>)[
        k
      ] = v;
    }
  }
  const keyEntry = ws.answerKey.find(
    (k) => k.questionId === q.id
  );
  if (keyEntry) {
    keyEntry.answer = ws.questions[idx].correctAnswer;
    keyEntry.explanation = ws.questions[idx].explanation;
  }
  ws.totalMarks = ws.questions.reduce(
    (s, question) => s + (question.marks || 0),
    0
  );
  ws.updatedAt = new Date().toISOString();
  ws.validation = validateWorksheet(ws);
  res.json({
    worksheet: ws,
    finalVerification: finalVerification(ws),
  });
});

// ---------- Regenerate one question ----------
router.post(
  "/questions/regenerate",
  async (req: Request, res: Response) => {
    const ws = parseWorksheetBody(req.body);
    const questionId = req.body?.questionId;
    if (!ws || !questionId) {
      return res
        .status(400)
        .json({ error: "Invalid payload" });
    }
    try {
      const result = await regenerateQuestion(ws, questionId);
      res.json({
        worksheet: result.worksheet,
        notice: result.notice,
        finalVerification: finalVerification(result.worksheet),
      });
    } catch (err) {
      res.status(500).json({
        error: "Regeneration failed",
        details:
          err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// ---------- Export DOCX ----------
router.post("/export/docx", async (req: Request, res: Response) => {
  const ws = parseWorksheetBody(req.body);
  if (!ws) {
    return res
      .status(400)
      .json({ error: "Invalid worksheet payload" });
  }
  try {
    const filePath = await renderWorksheetToDocx(ws);
    const fv = finalVerification(ws, filePath);
    await saveProject(ws, filePath);
    res.json({ filePath, finalVerification: fv });
  } catch (err) {
    res.status(500).json({
      error: "DOCX generation failed",
      details:
        err instanceof Error ? err.message : String(err),
    });
  }
});

// ---------- Preview HTML ----------
router.post("/preview/html", (req: Request, res: Response) => {
  const ws = parseWorksheetBody(req.body);
  if (!ws) {
    return res
      .status(400)
      .json({ error: "Invalid worksheet payload" });
  }
  res.json({
    html: renderWorksheetToHtml(ws, req.body?.institutionName),
  });
});

// ---------- Verify PDF readiness ----------
router.post("/verify/pdf", (req: Request, res: Response) => {
  const ws = parseWorksheetBody(req.body);
  if (!ws) {
    return res
      .status(400)
      .json({ error: "Invalid worksheet payload" });
  }
  const project = getProject(ws.id);
  const docxPath =
    req.body?.docxPath || project?.docxPath || undefined;
  const fv = finalVerification(ws, docxPath);
  const browser = findBrowserExecutable();
  const ready =
    fv.checks
      .filter((c) => c.name !== "DOCX document")
      .every((c) => c.passed) && !!browser;
  res.json({
    ready,
    browserAvailable: !!browser,
    finalVerification: fv,
    worksheet: ws,
    existingPdf:
      project?.pdfPath && fsExists(project.pdfPath)
        ? project.pdfPath
        : null,
  });
});

// ---------- Export PDF (self-healing) ----------
router.post("/export/pdf", async (req: Request, res: Response) => {
  const ws = parseWorksheetBody(req.body);
  if (!ws) {
    return res
      .status(400)
      .json({ error: "Invalid worksheet payload" });
  }
  try {
    const existing = getProject(ws.id);
    const docxPath =
      req.body?.docxPath || existing?.docxPath || undefined;

    const fv = finalVerification(ws, docxPath);
    const blocking = fv.checks.filter(
      (c) => !c.passed && c.name !== "DOCX document"
    );
    if (blocking.length > 0) {
      return res.status(409).json({
        error:
          "PDF export blocked: fix the issues below first.",
        finalVerification: fv,
        fixHints: blocking.map(
          (c) =>
            `${c.name} — ${c.detail}` +
            `${c.fixHint ? ` Fix: ${c.fixHint}` : ""}`
        ),
      });
    }

    const docxOk = Boolean(
      docxPath &&
        fsExists(docxPath) &&
        docxPath.toLowerCase().endsWith(".docx")
    );
    const finalDocxPath = docxOk
      ? (docxPath as string)
      : await renderWorksheetToDocx(ws);

    const html = renderWorksheetToHtml(
      ws,
      req.body?.institutionName
    );
    const pdf = await exportWorksheetToPdf(
      ws.id,
      ws.title,
      html
    );
    await saveProject(ws, finalDocxPath, pdf.filePath);
    res.json({
      ...pdf,
      verification: verifyPdfFile(pdf.filePath),
      finalVerification: fv,
      docxPath: finalDocxPath,
    });
  } catch (err) {
    res.status(500).json({
      error: "PDF export failed",
      details:
        err instanceof Error ? err.message : String(err),
    });
  }
});

// ---------- Question Bank ----------
router.get("/bank/stats", (_req: Request, res: Response) => {
  try {
    res.json(bankStats());
  } catch (err) {
    res.status(500).json({
      error: "Bank stats failed",
      details:
        err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/bank", (req: Request, res: Response) => {
  const { q, grade, type, bloom, difficulty, topic } =
    req.query as Record<string, string | undefined>;
  const limit = req.query.limit
    ? Number(req.query.limit)
    : undefined;
  try {
    res.json({
      questions: searchBank({
        q,
        grade,
        type,
        bloom,
        difficulty,
        topic,
        limit,
      }),
    });
  } catch (err) {
    res.status(500).json({
      error: "Bank search failed",
      details:
        err instanceof Error ? err.message : String(err),
    });
  }
});


// ---------- Global Curriculum Engine Backup & Chapters ----------
router.get("/curriculum/global", (_req: Request, res: Response) => {
  try {
    const jsonPath = pathJoin(process.cwd(), "data", "global_curriculum.json");
    if (existsSync(jsonPath)) {
      const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
      return res.json(data);
    }
    res.json({ error: "global_curriculum.json not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to read global curriculum", details: String(err) });
  }
});

// ---------- Deduplicate Bank ----------
router.post("/bank/deduplicate", (_req: Request, res: Response) => {
  try {
    const result = deduplicateBank();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({
      error: "Deduplication failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
// ---------- Curriculum chapters (legacy seed) ----------
router.get("/curriculum/chapters", (req, res) => {
  const grade = req.query.grade as string;
  if (!grade) {
    const grades = getAllGrades();
    const result = grades.map((g) => {
      const chapters = getCurriculumByGrade(g);
      return {
        grade: g,
        chapterCount: chapters.length,
        chapters: chapters.map((c) => c.chapterName),
      };
    });
    return res.json({ grades: result });
  }
  const chapters = getCurriculumByGrade(grade);
  res.json({
    grade,
    chapterCount: chapters.length,
    chapters: chapters.map((c) => ({
      id: c.id,
      chapterName: c.chapterName,
      subtopics: c.subtopics,
      objectives: c.objectives,
      difficulty: c.difficulty,
      questionTypes: c.questionTypes,
      gradeBand: c.gradeBand,
    })),
  });
});

router.get("/curriculum/search", (req: Request, res) => {
  const q = req.query.q as string;
  if (!q) return res.json({ results: [] });
  const results = searchCurriculum(q);
  res.json({ count: results.length, results });
});

// ---------- Output folder browsing ----------
router.get("/output/files", (_req: Request, res: Response) => {
  
  const outDir = OUTPUT_DIR;
  if (!existsSync(outDir)) {
    return res.json({ files: [] });
  }
  const files = fs
    .readdirSync(outDir)
    .filter(
      (f: string) =>
        f.endsWith(".docx") || f.endsWith(".pdf")
    )
    .map((f: string) => {
      const stat = statSync(
        pathJoin(outDir, f)
      );
      return {
        name: f,
        size: stat.size,
        modified: stat.mtime.toISOString(),
      };
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.modified).getTime() -
        new Date(a.modified).getTime()
    );
  res.json({ outputDir: outDir, files });
});

// ---------- Export history ----------
router.get("/projects/:id/exports", (req, res) => {
  const history = getExportHistory(String(req.params.id));
  res.json({
    projectId: req.params.id,
    exports: history,
  });
});

// ---------- Saved projects ----------
router.get("/projects", (_req: Request, res: Response) => {
  const projects = listProjects();
  res.json({
    projects: projects.map((p) => ({
      id: p.id,
      savedAt: p.savedAt,
      docxPath: p.docxPath,
      pdfPath: p.pdfPath,
      summary: {
        title: p.worksheet.title,
        grade: p.worksheet.config.grade,
        board: p.worksheet.config.board,
        topic: p.worksheet.config.topic,
        questions: p.worksheet.questions.length,
        totalMarks: p.worksheet.totalMarks,
      },
    })),
  });
});

router.get("/projects/:id", (req, res) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json({ project });
});

router.post("/projects/save", (req, res) => {
  const ws = parseWorksheetBody(req.body);
  if (!ws) {
    return res
      .status(400)
      .json({ error: "Invalid worksheet payload" });
  }
  const project = saveProject(ws);
  res.json({
    saved: true,
    id: project.id,
    savedAt: project.savedAt,
  });
});

router.delete("/projects/:id", (req, res) => {
  res.json({ deleted: deleteProject(String(req.params.id)) });
});

// ---------- Output dir info ----------
router.get("/output/dir", (_req: Request, res: Response) => {
  res.json({ outputDir: OUTPUT_DIR });
});

// ---------- Chapters by grade (legacy) ----------
router.get("/chapters/:grade", (req, res) => {
  const grade = String(req.params.grade);
  const chapters = getCurriculumByGrade(grade);
  res.json({ grade, chapters });
});

// ---------- Curriculum library ----------
router.get("/curriculum", (_req: Request, res: Response) => {
  res.json({
    documents: listCurriculum().map(
      ({ content, ...rest }) => ({
        ...rest,
        preview: content.slice(0, 200),
      })
    ),
  });
});

router.post("/curriculum", (req, res) => {
  const { title, board, grade, content } = req.body ?? {};
  if (!title || !content) {
    return res
      .status(400)
      .json({ error: "title and content are required" });
  }
  const doc = addCurriculum({
    id: `cur_${Date.now().toString(36)}`,
    title: String(title).slice(0, 200),
    board: board ?? "Generic Indian",
    grade: grade ?? "Class 1",
    content: String(content).slice(0, 200_000),
    addedAt: new Date().toISOString(),
  });
  res.json({
    document: {
      ...doc,
      content: undefined,
      preview: doc.content.slice(0, 200),
    },
  });
});

router.delete("/curriculum/:id", (req, res) => {
  res.json({ deleted: deleteCurriculum(String(req.params.id)) });
});

// ---------- Settings ----------
router.get("/settings", (_req: Request, res: Response) => {
  const cfg = { hasGeminiKey, GEMINI_MODEL, DATA_DIR, OUTPUT_DIR, PORT };
  res.json({
    geminiConfigured: cfg.hasGeminiKey(),
    model: cfg.GEMINI_MODEL,
    dataDir: cfg.DATA_DIR,
    outputDir: cfg.OUTPUT_DIR,
    port: cfg.PORT,
    pdfBrowser: findBrowserExecutable(),
  });
});

export default router;
