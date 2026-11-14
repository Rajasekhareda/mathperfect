import { useEffect, useState } from "react";
import { api } from "../api";

interface ProjectRow {
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
  };
}

export default function SavedWorksheets({ onOpen }: { onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => 
    api.listProjects()
      .then((r) => setProjects(r.projects))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await api.deleteProject(id);
    load();
  };

  const handleDownload = async (id: string, type: 'docx' | 'pdf', title: string) => {
    const ext = type === 'docx' ? 'docx' : 'pdf';
    const link = document.createElement('a');
    link.href = `/api/download/${type}/${id}`;
    link.download = `${title}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <h2>Saved Worksheets</h2>
      {loading && <div className="empty">Loading…</div>}
      {!loading && projects.length === 0 && (
        <div className="empty">No saved projects yet. Generate a worksheet and click "Save Project".</div>
      )}
      {projects.map((p) => (
        <div key={p.id} className="project-row">
          <div>
            <div className="title">{p.summary.title}</div>
            <div className="sub">
              {p.summary.board} · {p.summary.grade} · {p.summary.questions} questions · {p.summary.totalMarks} marks · saved {new Date(p.savedAt).toLocaleString("en-IN")}
            </div>
            <div className="sub">
              {p.docxPath ? `DOCX: ${p.docxPath.split(/[\\/]/).pop()}` : "No DOCX yet"}
              {p.pdfPath ? ` · PDF: ${p.pdfPath.split(/[\\/]/).pop()}` : ""}
            </div>
          </div>
          <div className="toolbar" style={{ margin: 0, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn small" onClick={() => onOpen(p.id)}>Open</button>
            
            {p.docxPath && (
              <button 
                className="btn small" 
                style={{ background: '#2563eb', color: 'white' }}
                onClick={() => handleDownload(p.id, 'docx', p.summary.title)}
              >
                📄 DOCX
              </button>
            )}
            
            {p.pdfPath && (
              <button 
                className="btn small" 
                style={{ background: '#dc2626', color: 'white' }}
                onClick={() => handleDownload(p.id, 'pdf', p.summary.title)}
              >
                📑 PDF
              </button>
            )}
            
            <button className="btn small secondary" onClick={() => remove(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}