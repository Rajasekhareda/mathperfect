import { useEffect, useState } from "react";
import { api } from "../api";
import type { Meta } from "../types";

interface Doc { id: string; title: string; board: string; grade: string; preview: string; addedAt: string; }

export default function CurriculumLibrary({ meta }: { meta: Meta | null }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [grade, setGrade] = useState("Class 5");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => api.listCurriculum().then((r) => setDocs(r.documents));
  useEffect(() => { load(); }, []);

  const add = async () => {
    setMsg(null);
    try {
      await api.addCurriculum({ title, board, grade, content });
      setTitle(""); setContent("");
      setMsg("Curriculum document added. Source metadata will be shown on worksheets using it.");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="card">
      <h2>Curriculum Library</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
        Paste official syllabus extracts or your own curriculum notes here. When supplied, the generator can show
        source/reference metadata instead of generic alignment labels. Copyrighted textbook pages must not be reproduced verbatim.
      </p>
      <div className="form-grid">
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Class 7 Maths Term 1 syllabus" />
        </div>
        <div className="field">
          <label>Board</label>
          <select value={board} onChange={(e) => setBoard(e.target.value)}>
            {(meta?.boards ?? ["CBSE"]).map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Grade</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            {(meta?.grades ?? ["Class 1"]).map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label>Content (syllabus text / notes)</label>
        <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste syllabus extract or curriculum notes…" />
      </div>
      <div className="toolbar">
        <button className="btn" disabled={!title.trim() || !content.trim()} onClick={add}>Add document</button>
      </div>
      {msg && <div className="notice info">{msg}</div>}

      <h3>Stored documents</h3>
      {docs.length === 0 && <div className="empty">No curriculum documents yet.</div>}
      {docs.map((d) => (
        <div key={d.id} className="project-row">
          <div>
            <div className="title">{d.title}</div>
            <div className="sub">{d.board} · {d.grade} · added {new Date(d.addedAt).toLocaleDateString("en-IN")}</div>
            <div className="sub">{d.preview}…</div>
          </div>
          <button className="btn small secondary" onClick={async () => { await api.deleteCurriculum(d.id); load(); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
