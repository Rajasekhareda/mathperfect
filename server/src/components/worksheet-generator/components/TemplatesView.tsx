import { useState } from "react";
import type { Meta } from "../types";

export default function TemplatesView({ meta, onSelect }: { meta: Meta | null; onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const templates = meta?.templates ?? [
    { id: "clean-school", name: "Clean School", description: "Highly readable, spacious layout with minimal decoration." },
    { id: "exam-practice", name: "Exam Practice", description: "Compact, numbered sections with marks and time limit." },
    { id: "primary-fun-math", name: "Primary Fun Math", description: "Child-friendly boxes and visual activity areas." },
    { id: "concept-builder", name: "Concept Builder", description: "Worked-example area followed by graded practice." },
    { id: "competency-hots", name: "Competency / HOTS", description: "Scenario, reasoning and application sections (NEP 2020)." },
    { id: "revision-pack", name: "Revision Pack", description: "Mixed question types with a self-check summary area." },
    { id: "teacher-assessment", name: "Teacher Assessment", description: "Student details, marks table, rubric and comments area." },
  ];

  return (
    <div className="card">
      <h2>Worksheet Templates</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
        All templates use A4 sizing, printer-friendly margins and consistent typography. Select one and start a new worksheet with it.
      </p>
      <div className="template-grid">
        {templates.map((t) => (
          <div key={t.id} className={`template-card${selected === t.id ? " active" : ""}`}>
            <h3>{t.name}</h3>
            <p>{t.description}</p>
            <button className={`btn small${selected === t.id ? "" : " secondary"}`} onClick={() => { setSelected(t.id); onSelect(t.id); }}>
              Use this template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
