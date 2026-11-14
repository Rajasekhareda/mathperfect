import { useEffect, useState } from "react";
import { api } from "../api";

export default function SettingsView() {
  const [s, setS] = useState<{ geminiConfigured: boolean; model: string; dataDir: string; outputDir: string; port: number; pdfBrowser: string | null } | null>(null);

  useEffect(() => {
    api.settings().then(setS).catch(() => setS(null));
  }, []);

  if (!s) return <div className="card"><h2>Settings</h2><div className="empty">Could not load settings.</div></div>;

  return (
    <div className="card">
      <h2>Settings</h2>
      <div className="kv">
        <span className="k">Gemini API key</span>
        <span>{s.geminiConfigured ? "✔ Configured (.env on the server — never exposed to the browser)" : "✘ Not configured — the built-in offline local generator is used"}</span>
        <span className="k">Gemini model</span>
        <span>{s.model} <span style={{ color: "var(--muted)" }}>(change via GEMINI_MODEL in .env)</span></span>
        <span className="k">Server port</span>
        <span>{s.port}</span>
        <span className="k">Data directory</span>
        <span>{s.dataDir}</span>
        <span className="k">Output directory</span>
        <span>{s.outputDir}</span>
        <span className="k">PDF converter</span>
        <span>{s.pdfBrowser ?? "Not found — install Microsoft Edge or Google Chrome"}</span>
      </div>
      <div className="notice info" style={{ marginTop: 14 }}>
        To change configuration, edit the <b>.env</b> file in the project root and restart the server.
        API keys are only read server-side and are never sent to the frontend.
      </div>
    </div>
  );
}
