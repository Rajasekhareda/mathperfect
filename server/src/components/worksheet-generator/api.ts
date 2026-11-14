import type { 
  FinalVerification, 
  GenerateResponse, 
  Meta, 
  Worksheet 
} from "./types";

// 🔑 KEY CHANGE: Point to backend on port 5000
const BASE = "http://localhost:5000/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let details = "";
    try {
      const body = await res.json();
      details = body.details ? ` (${body.details})` : body.error ? ` (${body.error})` : "";
    } catch { /* ignore */ }
    throw new Error(`Request failed (${res.status})${details}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  meta: () => fetch(`${BASE}/meta`).then((r) => handle<Meta>(r)),

  generate: (config: unknown) =>
    fetch(`${BASE}/generate`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(config),
    }).then((r) => handle<GenerateResponse>(r)),

  validate: (worksheet: Worksheet) =>
    fetch(`${BASE}/validate`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet }),
    }).then((r) => handle<{ worksheet: Worksheet; finalVerification: FinalVerification }>(r)),

  updateQuestion: (worksheet: Worksheet, question: unknown) =>
    fetch(`${BASE}/questions/update`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet, question }),
    }).then((r) => handle<{ worksheet: Worksheet; finalVerification: FinalVerification }>(r)),

  regenerateQuestion: (worksheet: Worksheet, questionId: string) =>
    fetch(`${BASE}/questions/regenerate`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet, questionId }),
    }).then((r) => handle<{ worksheet: Worksheet; notice?: string; finalVerification: FinalVerification }>(r)),

  exportDocx: (worksheet: Worksheet) =>
    fetch(`${BASE}/export/docx`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet }),
    }).then((r) => handle<{ filePath: string; finalVerification: FinalVerification }>(r)),

  previewHtml: (worksheet: Worksheet) =>
    fetch(`${BASE}/preview/html`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet }),
    }).then((r) => handle<{ html: string }>(r)),

  verifyPdf: (worksheet: Worksheet) =>
    fetch(`${BASE}/verify/pdf`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet }),
    }).then((r) => handle<{ ready: boolean; browserAvailable: boolean; finalVerification: FinalVerification; existingPdf: string | null }>(r)),

  exportPdf: (worksheet: Worksheet) =>
    fetch(`${BASE}/export/pdf`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet }),
    }).then((r) => handle<{ filePath: string; verified: boolean; pages: number; browser: string }>(r)),

  saveProject: (worksheet: Worksheet) =>
    fetch(`${BASE}/projects/save`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ worksheet }),
    }).then((r) => handle<{ saved: boolean; id: string; savedAt: string }>(r)),

  listProjects: () =>
    fetch(`${BASE}/projects`).then((r) => handle<{
      projects: { 
        id: string; 
        savedAt: string; 
        docxPath?: string; 
        pdfPath?: string; 
        summary: { 
          title: string; 
          grade: string; 
          board: string; 
          topic: string; 
          questions: number; 
          totalMarks: number 
        } 
      }[];
    }>(r)),

  getProject: (id: string) =>
    fetch(`${BASE}/projects/${id}`).then((r) => handle<{ project: { 
      id: string; 
      worksheet: Worksheet; 
      docxPath?: string; 
      pdfPath?: string 
    } }>(r)),

  deleteProject: (id: string) => fetch(`${BASE}/projects/${id}`, { method: "DELETE" }).then((r) => handle<{ deleted: boolean }>(r)),

  listCurriculum: () =>
    fetch(`${BASE}/curriculum`).then((r) => handle<{ documents: { 
      id: string; 
      title: string; 
      board: string; 
      grade: string; 
      preview: string; 
      addedAt: string 
    }[] }>(r)),

  addCurriculum: (doc: { title: string; board: string; grade: string; content: string }) =>
    fetch(`${BASE}/curriculum`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(doc),
    }).then((r) => handle<{ document: unknown }>(r)),

  deleteCurriculum: (id: string) => fetch(`${BASE}/curriculum/${id}`, { method: "DELETE" }).then((r) => handle<{ deleted: boolean }>(r)),

  settings: () =>
    fetch(`${BASE}/settings`).then((r) => handle<{ 
      geminiConfigured: boolean; 
      model: string; 
      dataDir: string; 
      outputDir: string; 
      port: number; 
      pdfBrowser: string | null 
    }>(r)),

  getChapters: (grade: string) =>
    fetch(`${BASE}/chapters/${encodeURIComponent(grade)}`).then((r) => handle<{ 
      grade: string; 
      chapters: Array<{ 
        chapterName: string; 
        subtopics: string; 
        objectives: string; 
        difficulty: string; 
        questionTypes: string 
      }> 
    }>(r)),

  listOutputFiles: () =>
    fetch(`${BASE}/output/files`).then((r) => handle<{ 
      outputDir: string; 
      files: Array<{ 
        name: string; 
        size: number; 
        modified: string 
      }> 
    }>(r)),
};