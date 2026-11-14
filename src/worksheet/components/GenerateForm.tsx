import { useEffect, useState } from "react";
import { api } from "../api";
import type {
  GenerateResponse,
  Meta,
  QuestionType,
  WorksheetConfig,
} from "../types";
import type { WorkingState } from "../App";

interface AtlasChapterLite {
  id: string;
  number: number;
  name: string;
  aliases: string[];
  subtopics: string[];
}

const ATLAS_BASES = [
  "/api",
  "http://localhost:3000/api",
  "http://localhost:4000/api",
  "http://localhost:5000/api",
  "http://localhost:8000/api",
];

let atlasGoodBase: string | null = null;

async function fetchAtlas<T>(path: string): Promise<T | null> {
  const bases = atlasGoodBase ? [atlasGoodBase] : ATLAS_BASES;
  for (const base of bases) {
    try {
      const r = await fetch(`${base}${path}`);
      if (r.ok) {
        atlasGoodBase = base;
        return (await r.json()) as T;
      }
    } catch {
      /* try next base */
    }
  }
  return null;
}

const defaultCounts: Record<QuestionType, number> = {
  MCQ: 5,
  "Fill in the Blanks": 5,
  "True/False": 3,
  "Match the Following": 2,
  "Number/Pattern": 3,
  "Short Answer": 3,
  "Long Answer": 2,
  "Word Problems": 3,
  "Logical Reasoning": 2,
  HOTS: 2,
  "Case/Activity": 1,
};

export default function GenerateForm(props: {
  meta: Meta | null;
  working: WorkingState | null;
  onGenerated: (r: GenerateResponse) => void;
}) {
  const { meta, working, onGenerated } = props;
  const [config, setConfig] = useState<WorksheetConfig>({
    board: "CBSE",
    grade: "Class 6",
    subject: "Mathematics",
    topic: "",
    subtopic: "",
    difficulty: "Easy",
    questionTypes: [
      { type: "MCQ", count: 5 },
      { type: "Fill in the Blanks", count: 5 },
    ],
    template: "clean-school",
    language: "English",
    numberSystem: "Indian",
    calculatorAllowed: false,
  });

  const [selectedTypes, setSelectedTypes] = useState<
    Set<QuestionType>
  >(new Set(["MCQ", "Fill in the Blanks"]));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // --- Atlas picker state ---
  const [atlasChapters, setAtlasChapters] = useState<
    AtlasChapterLite[]
  >([]);
  const [loadingAtlas, setLoadingAtlas] = useState(false);
  const [chapterQuery, setChapterQuery] = useState("");
  const [selectedChapterId, setSelectedChapterId] =
    useState("");
  const [subtopic, setSubtopic] = useState("");
  const [lockOn, setLockOn] = useState(true);

  // Load Atlas chapters whenever the grade changes
  useEffect(() => {
    if (!config.grade) return;
    let cancelled = false;
    setLoadingAtlas(true);
    setSelectedChapterId("");
    setSubtopic("");
    fetchAtlas<{ chapters: AtlasChapterLite[] }>(
      `/atlas/chapters?grade=${encodeURIComponent(
        config.grade
      )}`
    )
      .then((d) => {
        if (cancelled) return;
        setAtlasChapters(d?.chapters ?? []);
        setLoadingAtlas(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAtlasChapters([]);
        setLoadingAtlas(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config.grade]);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setConfig((c) => ({ ...c, template: id }));
    };
    window.addEventListener("select-template", handler);
    return () =>
      window.removeEventListener("select-template", handler);
  }, []);

  const isCustom = selectedChapterId === "__custom";
  const chapter = atlasChapters.find(
    (c) => c.id === selectedChapterId
  );

  const visibleChapters = atlasChapters.filter((c) => {
    const q = chapterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.aliases.some((a) =>
        a.toLowerCase().includes(q)
      ) ||
      c.subtopics.some((s) =>
        s.toLowerCase().includes(q)
      )
    );
  });

  const liveValidation = (): string[] => {
    const errs: string[] = [];
    if (!config.topic.trim()) {
      errs.push(
        "Pick a chapter from the Atlas list, or choose Custom topic."
      );
    }
    if (selectedTypes.size === 0) {
      errs.push("Select at least one question type.");
    }
    if (
      config.totalMarks &&
      (config.totalMarks < 1 || config.totalMarks > 200)
    ) {
      errs.push(
        "Total marks must be between 1 and 200."
      );
    }
    return errs;
  };

  const toggleType = (t: QuestionType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const setCount = (t: QuestionType, count: number) => {
    setConfig((c) => {
      const others = c.questionTypes.filter(
        (q) => q.type !== t
      );
      return {
        ...c,
        questionTypes: [
          ...others,
          {
            type: t,
            count: Math.max(
              1,
              Math.min(50, count || 1)
            ),
          },
        ],
      };
    });
  };

  const chooseChapter = (id: string) => {
    setSelectedChapterId(id);
    setSubtopic("");
    if (id === "__custom") {
      setConfig((c) => ({ ...c, topic: "", subtopic: "" }));
      return;
    }
    const ch = atlasChapters.find((x) => x.id === id);
    setConfig((c) => ({
      ...c,
      topic: ch ? ch.name : "",
      subtopic: "",
    }));
  };

  const chooseSubtopic = (s: string) => {
    setSubtopic(s);
    setConfig((c) => ({ ...c, subtopic: s }));
  };

  const generate = async () => {
    setErrors([]);
    setBusy(true);
    try {
      let instructions = config.customInstructions ?? "";
      if (lockOn && chapter) {
        const others = atlasChapters
          .filter((c) => c.id !== chapter.id)
          .map((c) => c.name)
          .join("; ");
        const lockText = [
          `STRICT CHAPTER LOCK: use ONLY the chapter "${chapter.name}".`,
          subtopic
            ? `Subtopic focus: ${subtopic}.`
            : `Cover these subtopics: ${chapter.subtopics.join("; ")}.`,
          `Do NOT use other chapters, including: ${others}.`,
        ].join(" ");
        instructions = [lockText, instructions]
          .filter(Boolean)
          .join(" ");
      }
      const payload: WorksheetConfig = {
        ...config,
        customInstructions: instructions || undefined,
        questionTypes: config.questionTypes.filter((q) =>
          selectedTypes.has(q.type)
        ),
        institutionName:
          config.institutionName ||
          meta?.defaultInstitutionName,
      };
      const resp = await api.generate(payload);
      onGenerated(resp);
    } catch (e) {
      setErrors([
        e instanceof Error ? e.message : String(e),
      ]);
    } finally {
      setBusy(false);
    }
  };

  const live = liveValidation();

  return (
    <div className="card">
      <h2>New Worksheet — Guided Setup</h2>
      <div className="form-grid">
        <div className="field">
          <label>Board</label>
          <select
            value={config.board}
            onChange={(e) =>
              setConfig({
                ...config,
                board: e.target.value,
              })
            }
          >
            {(meta?.boards ?? ["CBSE"]).map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Grade</label>
          <select
            value={config.grade}
            onChange={(e) =>
              setConfig({
                ...config,
                grade: e.target.value,
              })
            }
          >
            {(meta?.grades ?? ["Class 1"]).map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Subject</label>
          <input value="Mathematics" disabled />
        </div>

        {/* ---- SMART CHAPTER PICKER ---- */}
        <div
          className="field"
          style={{ gridColumn: "1 / -1" }}
        >
          <label>🧭 Chapter (official Atlas list)</label>
          {loadingAtlas && (
            <div className="hint">Loading chapters…</div>
          )}
          {!loadingAtlas && atlasChapters.length === 0 && (
            <div className="hint">
              🌍 Atlas not built for this grade yet
              (Phase 2 adds Classes 1–5 and 11–12).
              Use the Custom topic option below.
            </div>
          )}
          {atlasChapters.length > 0 && (
            <>
              <input
                style={{ marginBottom: 6 }}
                placeholder="🔍 Filter by name, alias or subtopic…"
                value={chapterQuery}
                onChange={(e) =>
                  setChapterQuery(e.target.value)
                }
              />
              <select
                value={selectedChapterId}
                onChange={(e) =>
                  chooseChapter(e.target.value)
                }
              >
                <option value="">
                  — Select a chapter (
                  {visibleChapters.length} shown) —
                </option>
                <option value="__custom">
                  ✍️ Custom topic (not listed)
                </option>
                {visibleChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number}. {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Chapter selected: aliases + subtopics + lock */}
        {chapter && (
          <div
            className="field"
            style={{ gridColumn: "1 / -1" }}
          >
            <div className="hint">
              🔒 Official chapter: <b>{chapter.name}</b>
              {chapter.aliases.length > 0 &&
                ` · also known as: ${chapter.aliases.join(
                  ", "
                )}`}
            </div>
            <label>Subtopic (optional)</label>
            <select
              value={subtopic}
              onChange={(e) =>
                chooseSubtopic(e.target.value)
              }
            >
              <option value="">
                All subtopics (whole chapter)
              </option>
              {chapter.subtopics.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label
              style={{
                display: "block",
                marginTop: 8,
              }}
            >
              <input
                type="checkbox"
                checked={lockOn}
                onChange={() => setLockOn((v) => !v)}
              />{" "}
              🔒 Lock the generator to this chapter
              only (recommended)
            </label>
          </div>
        )}

        {/* Custom topic mode */}
        {isCustom && (
          <>
            <div className="field">
              <label>Chapter / Topic *</label>
              <input
                value={config.topic}
                placeholder="e.g. Vedic Maths Tricks"
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    topic: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>Subtopic (optional)</label>
              <input
                value={config.subtopic ?? ""}
                placeholder="e.g. Addition of like fractions"
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    subtopic: e.target.value,
                  }))
                }
              />
            </div>
          </>
        )}

        <div className="field">
          <label>Difficulty</label>
          <select
            value={config.difficulty}
            onChange={(e) =>
              setConfig({
                ...config,
                difficulty: e.target
                  .value as WorksheetConfig["difficulty"],
              })
            }
          >
            {(
              meta?.difficulties ?? [
                "Easy",
                "Medium",
                "Hard",
                "Mixed",
              ]
            ).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Worksheet template</label>
          <select
            value={config.template}
            onChange={(e) =>
              setConfig({
                ...config,
                template: e.target.value,
              })
            }
          >
            {(meta?.templates ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Time limit (minutes, optional)</label>
          <input
            type="number"
            min={5}
            max={300}
            value={config.timeLimitMinutes ?? ""}
            onChange={(e) =>
              setConfig({
                ...config,
                timeLimitMinutes: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
        </div>

        <div className="field">
          <label>Total marks (optional)</label>
          <input
            type="number"
            min={1}
            max={200}
            value={config.totalMarks ?? ""}
            onChange={(e) =>
              setConfig({
                ...config,
                totalMarks: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
          <div className="hint">
            Leave blank to use per-type default marks.
          </div>
        </div>

        <div className="field">
          <label>Number system</label>
          <select
            value={config.numberSystem}
            onChange={(e) =>
              setConfig({
                ...config,
                numberSystem: e.target
                  .value as "Indian" | "International",
              })
            }
          >
            <option value="Indian">
              Indian (lakhs / crores)
            </option>
            <option value="International">
              International (millions)
            </option>
          </select>
        </div>

        <div className="field">
          <label>Calculator</label>
          <select
            value={
              config.calculatorAllowed ? "yes" : "no"
            }
            onChange={(e) =>
              setConfig({
                ...config,
                calculatorAllowed:
                  e.target.value === "yes",
              })
            }
          >
            <option value="no">Not allowed</option>
            <option value="yes">Allowed</option>
          </select>
        </div>

        <div className="field">
          <label>School / Institution name</label>
          <input
            value={config.institutionName ?? ""}
            placeholder={
              meta?.defaultInstitutionName ??
              "School name"
            }
            onChange={(e) =>
              setConfig({
                ...config,
                institutionName: e.target.value,
              })
            }
          />
        </div>
      </div>

      <h3>Question types &amp; quantity</h3>
      <div className="qtype-grid">
        {(meta?.questionTypes ?? []).map((t) => (
          <div key={t} className="qtype-item">
            <input
              type="checkbox"
              checked={selectedTypes.has(t)}
              onChange={() => toggleType(t)}
            />
            <span>{t}</span>
            {selectedTypes.has(t) && (
              <input
                type="number"
                min={1}
                max={50}
                value={
                  config.questionTypes.find(
                    (q) => q.type === t
                  )?.count ?? defaultCounts[t]
                }
                onChange={(e) =>
                  setCount(t, Number(e.target.value))
                }
              />
            )}
          </div>
        ))}
      </div>

      <h3>Optional details</h3>
      <div className="form-grid">
        <div className="field">
          <label>Learning objective</label>
          <input
            value={config.learningObjective ?? ""}
            placeholder="e.g. Students can add unlike fractions"
            onChange={(e) =>
              setConfig({
                ...config,
                learningObjective: e.target.value,
              })
            }
          />
        </div>
        <div className="field">
          <label>Custom instructions to the AI</label>
          <textarea
            value={config.customInstructions ?? ""}
            rows={2}
            placeholder="e.g. Use cricket-based word problems"
            onChange={(e) =>
              setConfig({
                ...config,
                customInstructions: e.target.value,
              })
            }
          />
        </div>
      </div>

      {live.length > 0 && (
        <div
          className="notice warn"
          style={{ marginTop: 12 }}
        >
          {live.map((v) => (
            <div key={v}>• {v}</div>
          ))}
        </div>
      )}
      {errors.map((e) => (
        <div key={e} className="notice error">
          {e}
        </div>
      ))}

      <div className="toolbar">
        <button
          className="btn"
          disabled={busy || live.length > 0}
          onClick={generate}
        >
          {busy ? (
            <>
              <span className="spin" /> Generating…
            </>
          ) : (
            "✨ Generate Worksheet"
          )}
        </button>
        {working && (
          <span
            className="notice info"
            style={{ margin: 0 }}
          >
            Previewing: <b>{working.worksheet.title}</b>
          </span>
        )}
      </div>
    </div>
  );
}
