import "./index.css";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type {
  FinalVerification,
  GenerateResponse,
  Meta,
  Worksheet,
} from "./types";
import GenerateForm from "./components/GenerateForm";
import Preview from "./components/Preview";
import TemplatesView from "./components/TemplatesView";
import SavedWorksheets from "./components/SavedWorksheets";
import CurriculumLibrary from "./components/CurriculumLibrary";
import SettingsView from "./components/SettingsView";

type View =
  | "dashboard"
  | "new"
  | "bank"
  | "templates"
  | "saved"
  | "curriculum"
  | "settings";

const NAV: { id: View; label: string }[] = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "new", label: "🧮 New Worksheet" },
  { id: "bank", label: "🏦 Question Bank" },
  { id: "templates", label: "📐 Templates" },
  { id: "saved", label: "📁 Saved Worksheets" },
  { id: "curriculum", label: "📚 Curriculum Library" },
  { id: "settings", label: "⚙️ Settings" },
];

export interface WorkingState {
  worksheet: Worksheet;
  finalVerification?: FinalVerification;
  notice?: string;
  docxPath?: string;
  pdfPath?: string;
  approved?: boolean;
}

const API_BASES = [
  "/api",
  "http://localhost:3000/api",
  "http://localhost:4000/api",
  "http://localhost:5000/api",
  "http://localhost:8000/api",
];

let goodBase: string | null = null;

async function fetchJson<T>(path: string): Promise<T | null> {
  const bases = goodBase ? [goodBase] : API_BASES;
  for (const base of bases) {
    try {
      const r = await fetch(`${base}${path}`);
      if (r.ok) {
        goodBase = base;
        return (await r.json()) as T;
      }
    } catch {
      /* try next base */
    }
  }
  return null;
}

interface BankStats {
  total: number;
  byGrade: Record<string, number>;
  byType: Record<string, number>;
  byBloom: Record<string, number>;
  byDifficulty: Record<string, number>;
}

interface BankQ {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  bloom: string;
  topic: string;
  grade: string;
  createdAt: string;
}

type FVCheck = {
  name: string;
  passed: boolean;
  detail: string;
  fixHint?: string;
};

type FV = {
  ok: boolean;
  autoRepairs?: string[];
  checks: FVCheck[];
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "14px 18px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

function StatCard(props: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  const { label, value, tone } = props;
  return (
    <div style={{ ...cardStyle, minWidth: 150 }}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: tone ?? "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BarList(props: {
  title: string;
  data: Record<string, number>;
  color: string;
}) {
  const { title, data, color } = props;
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const max = Math.max(1, ...entries.map((e) => e[1]));
  return (
    <div style={{ ...cardStyle, flex: "1 1 250px" }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{title}</div>
      {entries.length === 0 && (
        <div style={{ color: "#94a3b8", fontSize: 13 }}>
          No data yet
        </div>
      )}
      {entries.map(([k, v]) => (
        <div key={k} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#475569",
            }}
          >
            <span>{k}</span>
            <span>{v}</span>
          </div>
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 4,
              height: 6,
            }}
          >
            <div
              style={{
                width: `${(v / max) * 100}%`,
                background: color,
                height: 6,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard(props: {
  meta: Meta | null;
  onNew: () => void;
  onBank: () => void;
}) {
  const { meta, onNew, onBank } = props;
  const [stats, setStats] = useState<BankStats | null>(null);
  const [projects, setProjects] = useState<number | null>(null);

  const refresh = useCallback(() => {
    fetchJson<BankStats>("/bank/stats").then(setStats);
    fetchJson<{ projects: unknown[] }>("/projects").then((d) =>
      setProjects(d?.projects?.length ?? null)
    );
  }, []);
  useEffect(refresh, [refresh]);

  const biasHints: string[] = [];
  if (stats && stats.total > 0) {
    const total = stats.total;
    const createShare = (stats.byBloom["Create"] ?? 0) / total;
    const evaluateShare = (stats.byBloom["Evaluate"] ?? 0) / total;
    const hardShare = (stats.byDifficulty["Hard"] ?? 0) / total;
    const easyShare = (stats.byDifficulty["Easy"] ?? 0) / total;
    if (createShare < 0.05) {
      biasHints.push(
        'Very few "Create" (HOTS) questions — add some HOTS items.'
      );
    }
    if (evaluateShare < 0.05) {
      biasHints.push(
        'Very few "Evaluate" questions — add judgement items.'
      );
    }
    if (hardShare < 0.1) {
      biasHints.push(
        "Hard questions are rare — the bank may lean too easy."
      );
    }
    if (easyShare > 0.7) {
      biasHints.push(
        "More than 70% questions are Easy — raise the challenge."
      );
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <StatCard
          label="Questions in Bank"
          value={stats?.total ?? "…"}
          tone="#2563eb"
        />
        <StatCard
          label="Saved Worksheets"
          value={projects ?? "…"}
          tone="#7c3aed"
        />
        <StatCard
          label="PDF Engine"
          value={meta?.pdfBrowser ? "Ready ✓" : "Missing ⚠️"}
          tone={meta?.pdfBrowser ? "#059669" : "#dc2626"}
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            className="nav-item"
            style={{ border: "1px solid #cbd5e1", borderRadius: 8 }}
            onClick={onNew}
          >
            ➕ New Worksheet
          </button>
          <button
            className="nav-item"
            style={{ border: "1px solid #cbd5e1", borderRadius: 8 }}
            onClick={onBank}
          >
            🏦 Browse Bank
          </button>
          <button
            className="nav-item"
            style={{ border: "1px solid #cbd5e1", borderRadius: 8 }}
            onClick={refresh}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {stats && stats.total === 0 && (
        <div
          className="notice"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          👋 The Question Bank fills up automatically every time
          you generate a worksheet. Create your first one!
        </div>
      )}

      {biasHints.length > 0 && (
        <div
          className="notice"
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
          }}
        >
          <b>⚠️ Bank health alerts</b>
          <ul style={{ margin: "6px 0 0 18px" }}>
            {biasHints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <BarList
          title="By Difficulty"
          data={stats?.byDifficulty ?? {}}
          color="#10b981"
        />
        <BarList
          title="By Bloom Level"
          data={stats?.byBloom ?? {}}
          color="#8b5cf6"
        />
        <BarList
          title="By Grade"
          data={stats?.byGrade ?? {}}
          color="#f59e0b"
        />
        <BarList
          title="By Question Type"
          data={stats?.byType ?? {}}
          color="#3b82f6"
        />
      </div>
    </div>
  );
}

function BankView({ meta }: { meta: Meta | null }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [bloom, setBloom] = useState("");
  const [rows, setRows] = useState<BankQ[] | null>(null);
  const [loading, setLoading] = useState(false);

  const typeOptions = Array.isArray(meta?.questionTypes)
    ? (meta!.questionTypes as unknown[]).map((t) =>
        typeof t === "string"
          ? t
          : String((t as { type?: string })?.type ?? t)
      )
    : [];
  const bloomOptions = [
    "Remember",
    "Understand",
    "Apply",
    "Analyse",
    "Evaluate",
    "Create",
  ];

  const load = useCallback(
    async (qq: string, tt: string, bb: string) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (qq) params.set("q", qq);
      if (tt) params.set("type", tt);
      if (bb) params.set("bloom", bb);
      params.set("limit", "50");
      const d = await fetchJson<{ questions: BankQ[] }>(
        `/bank?${params.toString()}`
      );
      setRows(d?.questions ?? []);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    load("", "", "");
  }, [load]);

  const inputStyle: React.CSSProperties = {
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    marginRight: 8,
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 14,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          style={{ ...inputStyle, minWidth: 260 }}
          placeholder="🔍 Search questions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") load(q, type, bloom);
          }}
        />
        <select
          style={inputStyle}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            load(q, e.target.value, bloom);
          }}
        >
          <option value="">All types</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          style={inputStyle}
          value={bloom}
          onChange={(e) => {
            setBloom(e.target.value);
            load(q, type, e.target.value);
          }}
        >
          <option value="">All Bloom levels</option>
          {bloomOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <button
          className="nav-item"
          style={{ border: "1px solid #cbd5e1", borderRadius: 8 }}
          onClick={() => load(q, type, bloom)}
        >
          Search
        </button>
      </div>

      {loading && <div className="notice">Loading…</div>}
      {!loading && rows !== null && rows.length === 0 && (
        <div
          className="notice"
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          No questions found yet — they appear here
          automatically after each generation.
        </div>
      )}

      {rows && rows.length > 0 && (
        <div style={{ ...cardStyle, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: 8 }}>#</th>
                <th style={{ padding: 8 }}>Question</th>
                <th style={{ padding: 8 }}>Type</th>
                <th style={{ padding: 8 }}>Diff</th>
                <th style={{ padding: 8 }}>Bloom</th>
                <th style={{ padding: 8 }}>Topic</th>
                <th style={{ padding: 8 }}>Grade</th>
                <th style={{ padding: 8 }}>Added</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ borderTop: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: 8, color: "#94a3b8" }}>
                    {i + 1}
                  </td>
                  <td
                    style={{ padding: 8, maxWidth: 420 }}
                    title={r.question}
                  >
                    {r.question.length > 120
                      ? r.question.slice(0, 120) + "…"
                      : r.question}
                  </td>
                  <td style={{ padding: 8 }}>{r.type}</td>
                  <td style={{ padding: 8 }}>{r.difficulty}</td>
                  <td style={{ padding: 8 }}>{r.bloom}</td>
                  <td style={{ padding: 8 }}>{r.topic}</td>
                  <td style={{ padding: 8 }}>{r.grade}</td>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [working, setWorking] = useState<WorkingState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .meta()
      .then(setMeta)
      .catch((e) =>
        setError(`Failed to load metadata: ${e.message}`)
      );
  }, []);

  const handleGenerated = useCallback((resp: GenerateResponse) => {
    setWorking({
      worksheet: resp.worksheet,
      finalVerification: resp.finalVerification,
      notice: resp.notice,
    });
    setView("new");
  }, []);

  const openSaved = useCallback(async (id: string) => {
    try {
      const { project } = await api.getProject(id);
      setWorking({
        worksheet: project.worksheet,
        docxPath: project.docxPath,
        pdfPath: project.pdfPath,
      });
      setView("new");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const loadTemplate = useCallback((templateId: string) => {
    setView("new");
    window.setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("select-template", {
            detail: templateId,
          })
        ),
      50
    );
  }, []);

  const fv = working?.finalVerification
    ? (working.finalVerification as unknown as FV)
    : null;

  return (
    <div>
      <header className="app-header">
        <h1>Math Worksheet &amp; Activity Sheet Generator</h1>
        <span className="subtitle">
          KG – Intermediate · CBSE / ICSE / IGCSE / State Boards
          · NEP 2020 aligned
        </span>
        {meta && (
          <span className="badge">
            {meta.pdfBrowser ? "PDF ready" : "PDF browser missing"}
          </span>
        )}
      </header>

      <div className="layout">
        <nav className="sidebar">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item${view === n.id ? " active" : ""}`}
              onClick={() => setView(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <main className="main">
          {error && <div className="notice error">{error}</div>}

          {view === "dashboard" && (
            <Dashboard
              meta={meta}
              onNew={() => setView("new")}
              onBank={() => setView("bank")}
            />
          )}

          {view === "new" && (
            <>
              <GenerateForm
                meta={meta}
                working={working}
                onGenerated={handleGenerated}
              />
              {working?.notice && (
                <div
                  className="notice"
                  style={{
                    background: working.notice.includes('unavailable') ? '#fef3c7' : '#dbeafe',
                    border: `2px solid ${working.notice.includes('unavailable') ? '#fbbf24' : '#3b82f6'}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    margin: '10px 0',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <strong>ℹ️ Generation Info:</strong> {working.notice}
                </div>
              )}
              {/* Success message for fresh questions */}
              {working?.worksheet && (
                <div style={{
                  background: '#f0fdf4',
                  border: '2px solid #22c55e',
                  borderRadius: 8,
                  padding: '12px 16px',
                  margin: '10px 0'
                }}>
                  ✅ Generated {working.worksheet.questions.length} fresh questions
                  for {working.worksheet.config.topic} ({working.worksheet.config.grade})
                </div>
              )}

              {fv?.autoRepairs && fv.autoRepairs.length > 0 && (
                <div
                  style={{
                    color: "#059669",
                    fontSize: 13,
                    margin: "6px 0",
                  }}
                >
                  🔧 Auto-fixed for you: {fv.autoRepairs.join(" ")}
                </div>
              )}

              {fv && !fv.ok && (
                <div
                  className="notice error"
                  style={{ borderRadius: 8 }}
                >
                  <b>⚠️ Export issues detected</b>
                  <ul style={{ margin: "8px 0 0 18px" }}>
                    {fv.checks
                      .filter((c) => !c.passed)
                      .map((c, i) => (
                        <li key={i}>
                          <b>{c.name}:</b> {c.detail}
                          {c.fixHint
                            ? ` — Fix: ${c.fixHint}`
                            : ""}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {working && (
                <Preview
                  working={working}
                  onWorkingChange={(w) => setWorking(w)}
                />
              )}
            </>
          )}

          {view === "bank" && <BankView meta={meta} />}
          {view === "templates" && (
            <TemplatesView meta={meta} onSelect={loadTemplate} />
          )}
          {view === "saved" && (
            <SavedWorksheets onOpen={openSaved} />
          )}
          {view === "curriculum" && (
            <CurriculumLibrary meta={meta} />
          )}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}