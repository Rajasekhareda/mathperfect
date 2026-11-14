import { useEffect, useState } from "react";
import { api } from "../api";
import type { FinalVerification, Worksheet, WorksheetConfig } from "../types";
import type { WorkingState } from "../App";

export default function Preview({
  working,
  onWorkingChange,
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
      setMessage({
        kind: r.worksheet.validation?.valid ? "ok" : "info",
        text: r.worksheet.validation?.valid
          ? "Validation passed — no errors found." 
          : `Validation found ${r.worksheet.validation?.stats.errors} error(s).`
      });
    });

  const regenerate = (questionId: string) =>
    runAction(`regen-${questionId}`, async () => {
      const r = await api.regenerateQuestion(ws, questionId);
      setWorksheet(r.worksheet, r.finalVerification, { notice: r.notice });
      setMessage({ kind: "ok", text: "Question regenerated and re-validated." });
    });

  const saveProject = () =>
    runAction("save", async () => {
      const confirmed = window.confirm(
        `📁 SAVE TO DATABASE\n\n` +
        `This will save the following to your local database:\n\n` +
        `Title: ${ws.title}\n` +
        `Grade: ${ws.config.grade}\n` +
        `Topic: ${ws.config.topic}\n` +
        `Questions: ${ws.questions.length}\n` +
        `Total Marks: ${ws.totalMarks}\n\n` +
        `Database Location: data/mathworksheet.db\n\n` +
        `Do you want to proceed?`
      );

      if (!confirmed) {
        setMessage({ kind: "info", text: "Save cancelled by user." });
        return;
      }

      const r = await api.saveProject(ws);
      setMessage({
        kind: "ok",
        text: `✅ Project saved successfully!\n\n` +
              `Saved at: ${r.savedAt.slice(0, 19).replace("T", " ")}\n` +
              `Database: data/mathworksheet.db\n\n` +
              `You can view this in "💾 Saved Worksheets" tab.`
      });
    });

  const exportDocx = () =>
    runAction("docx", async () => {
      const confirmed = window.confirm(
        `📄 EXPORT TO DOCX\n\n` +
        `This will create a Word document:\n\n` +
        `Title: ${ws.title}\n` +
        `Questions: ${ws.questions.length}\n` +
        `File will be saved to: output/ folder\n\n` +
        `Proceed with export?`
      );

      if (!confirmed) {
        setMessage({ kind: "info", text: "DOCX export cancelled by user." });
        return;
      }

      const r = await api.exportDocx(ws);
      setWorksheet(ws, r.finalVerification, { docxPath: r.filePath });
      setMessage({
        kind: r.finalVerification.ok ? "ok" : "info",
        text: `✅ DOCX exported successfully!\n\n` +
              `File saved to:\n${r.filePath}\n\n` +
              `Open the folder using Windows Explorer.`
      });
    });

  const verifyPdf = () =>
    runAction("verify", async () => {
      const r = await api.verifyPdf(ws);
      const rows = r.finalVerification.checks.map((c) =>
        `${c.passed ? "✔" : "✘"} ${c.name}: ${c.detail}`
      ).join("\n");
      setMessage({
        kind: r.ready ? "ok" : "info",
        text: `PDF readiness: ${r.ready ? "READY" : "NOT READY"}\nBrowser: ${r.browserAvailable ? "available" : "not found"}\n${rows}`
      });
    });

  const exportPdf = () =>
    runAction("pdf", async () => {
      const confirmed = window.confirm(
        `🖨️ EXPORT TO PDF\n\n` +
        `This will create a PDF document:\n\n` +
        `Title: ${ws.title}\n` +
        `Questions: ${ws.questions.length}\n` +
        `File will be saved to: output/ folder\n\n` +
        `Note: PDF generation may take 30-60 seconds.\n\n` +
        `Proceed with export?`
      );

      if (!confirmed) {
        setMessage({ kind: "info", text: "PDF export cancelled by user." });
        return;
      }

      const r = await api.exportPdf(ws);
      setWorksheet(ws, r.finalVerification, {
        pdfPath: r.filePath,
        docxPath: r.docxPath
      });
      setMessage({
        kind: r.verified ? "ok" : "info",
        text: `✅ PDF exported successfully!\n\n` +
              `File: ${r.filePath}\n` +
              `Pages: ${r.pages}\n` +
              `Size: ${Math.round(r.bytes / 1024)} KB\n` +
              `Browser: ${r.browser}\n\n` +
              `Open the folder to view your PDF file.`
      });
    });

  const downloadFile = (type: 'docx' | 'pdf') => {
    const path = type === 'docx' ? working.docxPath : working.pdfPath;
    if (!path) {
      setMessage({ kind: "error", text: `No ${type.toUpperCase()} file available. Please export first.` });
      return;
    }
    const link = document.createElement('a');
    link.href = `/download/${type}/${ws.id}`;
    link.download = `${ws.title}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEdit = (id: string) => {
    const q = ws.questions.find((x) => x.id === id);
    if (!q) return;
    setEditingId(id);
    setEditDraft({
      question: q.question,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: q.marks
    });
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

  const handleApprove = () => {
    runAction("approve", async () => {
      const confirmed = window.confirm(
        `👍 FINAL APPROVAL - SAVE & EXPORT\n\n` +
        `═══════════════════════════════════\n` +
        `📋 WORKSHEET DETAILS:\n` +
        `═══════════════════════════════════\n\n` +
        `✓ Title: ${ws.title}\n` +
        `✓ Grade: ${ws.config.grade}\n` +
        `✓ Topic: ${ws.config.topic}\n` +
        `✓ Questions: ${ws.questions.length}\n` +
        `✓ Total Marks: ${ws.totalMarks}\n` +
        `✓ Generator: ${ws.metadata.aiProvider === 'gemini' ? 'Gemini AI' : 'Local'}\n\n` +
        `═══════════════════════════════════\n` +
        `💾 WHAT WILL HAPPEN:\n` +
        `═══════════════════════════════════\n\n` +
        `1. ✓ Save to database (data/mathworksheet.db)\n` +
        `2. ✓ Export DOCX to output/ folder\n` +
        `3. ✓ Export PDF to output/ folder\n\n` +
        `⏱️  This will take 30-60 seconds.\n` +
        `📁 Real files will be created on your system.\n\n` +
        `═══════════════════════════════════\n\n` +
        `Approve and save both DOCX & PDF?`
      );

      if (!confirmed) {
        setMessage({ kind: "info", text: "❌ Approval cancelled. You can still edit questions or approve later." });
        return;
      }

      onWorkingChange({ ...working, approved: true });

      setMessage({
        kind: "info",
        text: `⏳ Processing approval...\n\n` +
              `Step 1/3: Saving to database...`
      });

      try {
        const saveResult = await api.saveProject(ws);
        setMessage({
          kind: "info",
          text: `⏳ Processing approval...\n\n` +
                `✅ Step 1/3: Saved to database\n` +
                `⏳ Step 2/3: Exporting DOCX...`
        });

        const docxResult = await api.exportDocx(ws);
        setWorksheet(ws, docxResult.finalVerification, { docxPath: docxResult.filePath });

        setMessage({
          kind: "info",
          text: `⏳ Processing approval...\n\n` +
                `✅ Step 1/3: Saved to database\n` +
                `✅ Step 2/3: DOCX exported\n` +
                `⏳ Step 3/3: Exporting PDF (may take 30-60s)...`
        });

        const pdfResult = await api.exportPdf(ws);
        setWorksheet(ws, pdfResult.finalVerification, {
          docxPath: docxResult.filePath,
          pdfPath: pdfResult.filePath
        });

        setMessage({
          kind: "ok",
          text: `🎉 WORKSHEET APPROVED & SAVED!\n\n` +
                `═══════════════════════════════════\n` +
                `📁 FILES SAVED TO YOUR SYSTEM:\n` +
                `═══════════════════════════════════\n\n` +
                `📄 DOCX File:\n${docxResult.filePath}\n\n` +
                `📑 PDF File:\n${pdfResult.filePath}\n` +
                `   Pages: ${pdfResult.pages}\n` +
                `   Size: ${Math.round(pdfResult.bytes / 1024)} KB\n` +
                `   Browser: ${pdfResult.browser}\n\n` +
                `💾 Database:\ndata/mathworksheet.db\n` +
                `   Saved at: ${saveResult.savedAt.slice(0, 19).replace("T", " ")}\n\n` +
                `═══════════════════════════════════\n\n` +
                `✅ All files are ready!\n` +
                `📂 Open output/ folder to view your files.`
        });
      } catch (error) {
        setMessage({
          kind: "error",
          text: `❌ Approval failed!\n\n` +
                `Error: ${error instanceof Error ? error.message : String(error)}\n\n` +
                `Please try:\n` +
                `1. Check if Chrome/Edge is installed (for PDF)\n` +
                `2. Ensure output/ folder is accessible\n` +
                `3. Try manual export buttons below`
        });
        onWorkingChange({ ...working, approved: false });
      }
    });
  };

  const numberFor = (id: string): number =>
    ws.answerKey.find((k) => k.questionId === id)?.number ?? 0;

  return (
    <div className="card">
      <h2>Preview — {ws.title}</h2>
      <div className="kv" style={{ marginBottom: 10 }}>
        <span className="k">Generator</span>
        <span>{ws.metadata.generatedBy === "gemini"
          ? `Gemini (${ws.metadata.model})`
          : "Built-in local generator"}{ws.notice ? ` — ${ws.notice}` : ""}</span>
        <span className="k">Questions / Marks</span>
        <span>{ws.questions.length} questions · {ws.totalMarks} marks · {ws.sections.length} section(s)</span>
        <span className="k">Validation</span>
        <span>{ws.validation
          ? ws.validation.valid
            ? "✔ Passed" 
            : `✘ ${ws.validation.stats.errors} error(s), ${ws.validation.stats.warnings} warning(s)` 
          : "Not validated yet"}</span>
        <span className="k">Alignment</span>
        <span>{ws.metadata.boardAlignmentLabel}</span>
      </div>

      <div className="toolbar">
        <button className="btn secondary" disabled={!!busy} onClick={validateAgain}>
          {busy === "validate" ? <span className="spin" /> : "✅"} Validate
        </button>
        <button className="btn success" disabled={!!busy || (working.approved ?? false)} onClick={handleApprove}>
          {busy === "approve" ? <span className="spin" /> : (working.approved ?? false) ? "✅ Approved" : "👍 Approve"}
        </button>
        <button className="btn secondary" disabled={!!busy || !(working.approved ?? false)} onClick={saveProject}>
          {busy === "save" ? <span className="spin" /> : "💾"} Save Project
        </button>
        <button className="btn" disabled={!!busy || !(working.approved ?? false)} onClick={exportDocx}>
          {busy === "docx" ? <span className="spin" /> : "📄"} Export DOCX
        </button>
        <button className="btn warn" disabled={!!busy || !(working.approved ?? false)} onClick={verifyPdf}>
          {busy === "verify" ? <span className="spin" /> : "🔍"} Verify PDF
        </button>
        <button className="btn ok" disabled={!!busy || !(working.approved ?? false)} onClick={exportPdf} title="Requires a verified DOCX first">
          {busy === "pdf" ? <span className="spin" /> : "🖨️"} Export PDF
        </button>

        <select
          value={ws.config.template}
          onChange={(e) => updateConfigTemplate(e.target.value)}
          style={{ padding: "8px", borderRadius: 8, border: "1px solid var(--border)" }}
        >
          <option value="clean-school">Template: Clean School</option>
          <option value="exam-practice">Template: Exam Practice</option>
          <option value="primary-fun-math">Template: Primary Fun Math</option>
          <option value="concept-builder">Template: Concept Builder</option>
          <option value="competitive-hots">Template: Competitive/HOTS</option>
          <option value="revision-pack">Template: Revision Pack</option>
          <option value="teacher-assessment">Template: Teacher Assessment</option>
        </select>
        <button className="btn secondary" onClick={() => setShowAnswers((s) => !s)} disabled={(working.approved ?? false)}>
          {showAnswers ? "Hide question editor" : "Edit questions"}
        </button>
      </div>

      {message && (
        <div className={`notice ${message.kind}`} style={{ whiteSpace: "pre-wrap" }}>
          {message.text}
        </div>
      )}

      {(working.docxPath || working.pdfPath) && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
          marginBottom: 16
        }}>
          <h4 style={{ margin: 0, marginBottom: 12, color: '#059669', fontSize: 16 }}>
            ✅ Files Generated - Saved to Your Computer
          </h4>

          {working.docxPath && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>📄 DOCX File:</div>
              <div style={{
                background: '#fff', padding: '8px 12px', borderRadius: 6, fontFamily: 'monospace',
                fontSize: 12, color: '#1e40af', wordBreak: 'break-all', border: '1px solid #bfdbfe'
              }}>
                {working.docxPath}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button onClick={() => { navigator.clipboard.writeText(working.docxPath || ''); setMessage({ kind: "ok", text: "File path copied to clipboard!" }); }}
                  style={{ padding: '4px 12px', fontSize: 12, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  📋 Copy Path
                </button>
                <button onClick={() => downloadFile('docx')}
                  style={{ padding: '4px 12px', fontSize: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  ⬇️ Download DOCX
                </button>
              </div>
            </div>
          )}

          {working.pdfPath && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>📑 PDF File:</div>
              <div style={{
                background: '#fff', padding: '8px 12px', borderRadius: 6, fontFamily: 'monospace',
                fontSize: 12, color: '#dc2626', wordBreak: 'break-all', border: '1px solid #fecaca'
              }}>
                {working.pdfPath}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button onClick={() => { navigator.clipboard.writeText(working.pdfPath || ''); setMessage({ kind: "ok", text: "File path copied to clipboard!" }); }}
                  style={{ padding: '4px 12px', fontSize: 12, background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  📋 Copy Path
                </button>
                <button onClick={() => downloadFile('pdf')}
                  style={{ padding: '4px 12px', fontSize: 12, background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  ⬇️ Download PDF
                </button>
              </div>
            </div>
          )}

          <div style={{
            fontSize: 13, color: '#059669', marginTop: 12, padding: '8px 12px', background: '#dcfce7', borderRadius: 6
          }}>
            💡 <strong>How to open folder:</strong>
            <ol style={{ margin: '6px 0 0 0', paddingLeft: 20 }}>
              <li>Copy the path above</li>
              <li>Press <kbd>Windows + R</kbd></li>
              <li>Paste the path</li>
              <li>Press <kbd>Enter</kbd></li>
            </ol>
          </div>
        </div>
      )}

      {working.finalVerification && (
        <div className="notice info">
          {working.finalVerification.checks.map((c) => (
            <div key={c.name} className={`check-row ${c.passed ? "pass" : "fail"}`}>
              <span className="tick">{c.passed ? "✔" : "✘"}</span>
              <span><b>{c.name}</b> — {c.detail}</span>
            </div>
          ))}
        </div>
      )}

      {ws.validation && ws.validation.issues.length > 0 && (
        <div>
          {ws.validation.issues.slice(0, 12).map((i, idx) => (
            <div key={idx} className={`issue ${i.severity}`}>
              {i.severity.toUpperCase()} [{i.code}] {i.message}
            </div>
          ))}
        </div>
      )}

      {showAnswers && !working.approved && (
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
                  {q.options && (
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                      {q.options.join("   ·   ")}
                    </div>
                  )}
                  <div style={{ fontSize: 12.5, marginTop: 4 }}><b>Answer:</b> {q.correctAnswer}</div>
                  <div className="toolbar">
                    <button className="btn small secondary" onClick={() => startEdit(q.id)}>Edit</button>
                    <button className="btn small secondary" onClick={() => regenerate(q.id)} disabled={busy === `regen-${q.id}`}>
                      {busy === `regen-${q.id}` ? <span className="spin" /> : "♻"} Regenerate Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="preview-frame">
        {html ? <iframe title="Worksheet preview" srcDoc={html} /> : <div className="empty">Loading preview…</div>}
      </div>
    </div>
  );
}