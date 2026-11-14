import { useEffect, useState } from "react";
import { api } from "../api";
import type { FinalVerification, Worksheet, WorksheetConfig } from "../types";
import type { WorkingState } from "../App";

export default function Preview({
  working, onWorkingChange,
}: {
  working: WorkingState;
  onWorkingChange: (w: WorkingState) => void;
}) {
  const [html, setHtml] = useState<string>("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error" | "info"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ question: string; correctAnswer: string; explanation: string; marks: number } | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const ws = working.worksheet;

  const refreshPreview = async (worksheet: Worksheet) => {
    try {
      const { html } = await api.previewHtml(worksheet);
      setHtml(html);
    } catch (e) {
      setMessage({ kind: "error", text: `Preview failed: ${e instanceof Error ? e.message : String(e)}` });
    }
  };

  useEffect(() => {
    refreshPreview(ws);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws]);

  const setWorksheet = (worksheet: Worksheet, fv?: FinalVerification, extra?: Partial<WorkingState>) => {
    onWorkingChange({ ...working, worksheet, finalVerification: fv, ...extra });
  };

  const runAction = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    setMessage(null);
    try {
      await fn();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  const validateAgain = () =>
    runAction("validate", async () => {
      const r = await api.validate(ws);
      setWorksheet(r.worksheet, r.finalVerification);
      setMessage({ kind: r.worksheet.validation?.valid ? "ok" : "info", text: r.worksheet.validation?.valid ? "Validation passed — no errors found." : `Validation found ${r.worksheet.validation?.stats.errors} error(s).` });
    });

  const regenerate = (questionId: string) =>
    runAction(`regen-${questionId}`, async () => {
      const r = await api.regenerateQuestion(ws, questionId);
      setWorksheet(r.worksheet, r.finalVerification, { notice: r.notice });
      setMessage({ kind: "ok", text: "Question regenerated and re-validated." });
    });

  const saveProject = () =>
    runAction("save", async () => {
      const r = await api.saveProject(ws);
      setMessage({ kind: "ok", text: `Project saved (${r.savedAt.slice(0, 19).replace("T", " ")}).` });
    });

  const exportDocx = () =>
    runAction("docx", async () => {
      const r = await api.exportDocx(ws);
      setWorksheet(ws, r.finalVerification, { docxPath: r.filePath });
      setMessage({ kind: r.finalVerification.ok ? "ok" : "info", text: `DOCX exported: ${r.filePath}` });
    });

  const verifyPdf = () =>
    runAction("verify", async () => {
      const r = await api.verifyPdf(ws);
      const rows = r.finalVerification.checks.map((c) => `${c.passed ? "✔" : "✘"} ${c.name}: ${c.detail}`).join("\n");
      setMessage({ kind: r.ready ? "ok" : "info", text: `PDF readiness: ${r.ready ? "READY" : "NOT READY"}\nBrowser: ${r.browserAvailable ? "available" : "not found"}\n${rows}` });
    });

  const exportPdf = () =>
    runAction("pdf", async () => {
      const r = await api.exportPdf(ws);
      onWorkingChange({ ...working, worksheet: ws, pdfPath: r.filePath });
      setMessage({ kind: "ok", text: `PDF exported (${r.pages} page(s), verified) via ${r.browser}:\n${r.filePath}` });
    });

  const startEdit = (id: string) => {
    const q = ws.questions.find((x) => x.id === id);
    if (!q) return;
    setEditingId(id);
    setEditDraft({ question: q.question, correctAnswer: q.correctAnswer, explanation: q.explanation, marks: q.marks });
  };

  const saveEdit = () =>
    runAction("edit", async () => {
      if (!editingId || !editDraft) return;
      const r = await api.updateQuestion(ws, { id: editingId, ...editDraft });
      setWorksheet(r.worksheet, r.finalVerification);
      setEditingId(null);
      setEditDraft(null);
      setMessage({ kind: "ok", text: "Question updated and answer key synced." });
    });

  const updateConfigTemplate = (template: string) => {
    const cfg: WorksheetConfig = { ...ws.config, template };
    const next = { ...ws, config: cfg };
    setWorksheet(next);
  };

  const numberFor = (id: string): number => ws.answerKey.find((k) => k.questionId === id)?.number ?? 0;

  return (
    <div className="card">
      <h2>Preview — {ws.title}</h2>
      <div className="kv" style={{ marginBottom: 10 }}>
        <span className="k">Generator</span><span>{ws.metadata.generatedBy === "gemini" ? `Gemini (${ws.metadata.model})` : "Built-in local generator"}{ws.notice ? ` — ${ws.notice}` : ""}</span>
        <span className="k">Questions / Marks</span><span>{ws.questions.length} questions · {ws.totalMarks} marks · {ws.sections.length} section(s)</span>
        <span className="k">Validation</span><span>{ws.validation ? (ws.validation.valid ? "✔ Passed" : `✘ ${ws.validation.stats.errors} error(s), ${ws.validation.stats.warnings} warning(s)`) : "Not validated yet"}</span>
        <span className="k">Alignment</span><span>{ws.metadata.boardAlignmentLabel}</span>
      </div>

      <div className="toolbar">
        <button className="btn secondary" disabled={!!busy} onClick={validateAgain}>{busy === "validate" ? <span className="spin" /> : "✅"} Validate</button>
        <button className="btn secondary" disabled={!!busy} onClick={saveProject}>{busy === "save" ? <span className="spin" /> : "💾"} Save Project</button>
        <button className="btn" disabled={!!busy} onClick={exportDocx}>{busy === "docx" ? <span className="spin" /> : "📄"} Export DOCX</button>
        <button className="btn warn" disabled={!!busy} onClick={verifyPdf}>{busy === "verify" ? <span className="spin" /> : "🔍"} Verify PDF</button>
        <button className="btn ok" disabled={!!busy} onClick={exportPdf} title="Requires a verified DOCX first">{busy === "pdf" ? <span className="spin" /> : "🖨️"} Export PDF</button>
        <select value={ws.config.template} onChange={(e) => updateConfigTemplate(e.target.value)} style={{ padding: "8px", borderRadius: 8, border: "1px solid var(--border)" }}>
          <option value="clean-school">Template: Clean School</option>
          <option value="exam-practice">Template: Exam Practice</option>
          <option value="primary-fun-math">Template: Primary Fun Math</option>
          <option value="concept-builder">Template: Concept Builder</option>
          <option value="competency-hots">Template: Competency/HOTS</option>
          <option value="revision-pack">Template: Revision Pack</option>
          <option value="teacher-assessment">Template: Teacher Assessment</option>
        </select>
        <button className="btn secondary" onClick={() => setShowAnswers((s) => !s)}>{showAnswers ? "Hide question editor" : "Edit questions"}</button>
      </div>

      {message && <div className={`notice ${message.kind}`} style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>}

      {working.finalVerification && (
        <div className="notice info">
          {working.finalVerification.checks.map((c) => (
            <div key={c.name} className={`check-row ${c.passed ? "pass" : "fail"}`}><span className="tick">{c.passed ? "✔" : "✘"}</span><span><b>{c.name}</b> — {c.detail}</span></div>
          ))}
        </div>
      )}
      {ws.validation && ws.validation.issues.length > 0 && (
        <div>
          {ws.validation.issues.slice(0, 12).map((i, idx) => (
            <div key={idx} className={`issue ${i.severity}`}>{i.severity.toUpperCase()} [{i.code}] {i.message}</div>
          ))}
        </div>
      )}

      {showAnswers && (
        <div style={{ margin: "12px 0" }}>
          {ws.questions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="meta-row">
                <span className="tag">Q{numberFor(q.id)}</span>
                <span className="tag">{q.type}</span>
                <span className="tag">{q.difficulty}</span>
                <span className="tag">{q.marks} marks</span>
                <span className="tag">{q.cognitiveSkill}</span>
              </div>
              {editingId === q.id && editDraft ? (
                <div>
                  <textarea className="q-edit" value={editDraft.question} onChange={(e) => setEditDraft({ ...editDraft, question: e.target.value })} />
                  <input className="q-answer" value={editDraft.correctAnswer} onChange={(e) => setEditDraft({ ...editDraft, correctAnswer: e.target.value })} placeholder="Correct answer" />
                  <input className="q-answer" value={editDraft.explanation} onChange={(e) => setEditDraft({ ...editDraft, explanation: e.target.value })} placeholder="Explanation" />
                  <div className="toolbar">
                    <button className="btn small" onClick={saveEdit} disabled={busy === "edit"}>Save</button>
                    <button className="btn small secondary" onClick={() => { setEditingId(null); setEditDraft(null); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{q.question}</div>
                  {q.options && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{q.options.join("   ·   ")}</div>}
                  <div style={{ fontSize: 12.5, marginTop: 4 }}><b>Answer:</b> {q.correctAnswer}</div>
                  <div className="toolbar">
                    <button className="btn small secondary" onClick={() => startEdit(q.id)}>Edit</button>
                    <button className="btn small secondary" onClick={() => regenerate(q.id)} disabled={busy === `regen-${q.id}`}>{busy === `regen-${q.id}` ? <span className="spin" /> : "♻"} Regenerate Question</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="preview-frame">
        {html
          ? <iframe title="Worksheet preview" srcDoc={html} />
          : <div className="empty">Loading preview…</div>}
      </div>
    </div>
  );
}

