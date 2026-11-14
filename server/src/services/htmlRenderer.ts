import { Worksheet } from "../types";
import { DEFAULT_INSTITUTION_NAME } from "../config";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: __FONT__; color: #111; }
  .page { width: 210mm; min-height: 297mm; padding: 14mm 12mm; margin: 0 auto; background: #fff; }
  .page:not(:last-child) { page-break-after: always; }
  h1.school { text-align: center; margin: 0 0 4px; font-size: 20px; letter-spacing: 0.5px; }
  h1.title { text-align: center; margin: 0 0 6px; font-size: 17px; }
  .meta { text-align: center; font-size: 12px; margin-bottom: 8px; }
  .marks-time { text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 10px; }
  .student { font-size: 12.5px; margin: 10px 0; }
  .instructions { font-size: 11.5px; border: 1px solid #ccc; padding: 6px 10px; border-radius: __RADIUS__; margin-bottom: 12px; }
  .instructions ul { margin: 2px 0; padding-left: 18px; }
  h2 { font-size: 13.5px; border-bottom: 2px solid __ACCENT__; padding-bottom: 3px; margin: 14px 0 8px; }
  .sec-badge { background: __ACCENT__; color: #fff; border-radius: 4px; padding: 1px 7px; font-size: 11px; margin-right: 6px; }
  .sec-marks { font-weight: normal; font-size: 11px; color: #555; }
  .question { margin-bottom: __QGAP__; }
  .qtext { font-size: __QSIZE__; margin: 0 0 4px; white-space: pre-wrap; }
  .qnum { font-weight: bold; }
  .marks { color: #555; font-size: 10.5px; font-weight: bold; }
  .options { display: flex; flex-wrap: wrap; gap: 4px 24px; margin: 4px 0 4px 18px; font-size: 12.5px; }
  .lines span { display: block; border-bottom: 1px dotted #333; height: 18px; margin: 0 4px; }
  .reflection { margin-top: 16px; font-style: italic; font-size: 12px; }
  .answers { page-break-before: always; }
  .answers h1 { text-align: center; font-size: 16px; }
  .keyrow { font-size: 12px; margin-bottom: 7px; }
  .footer-note { margin-top: 18px; font-size: 10px; color: #555; font-style: italic; }
  .total-marks { font-size: 13px; margin-top: 12px; }
  @media print { .page { width: auto; min-height: auto; margin: 0; padding: 0; } }
`;


const OPEN_ENDED = ["Short Answer", "Long Answer", "Word Problems", "HOTS", "Case/Activity", "Number/Pattern", "Logical Reasoning"];

/**
 * Renders the worksheet to a standalone A4-styled HTML document used for
 * on-screen preview (page thumbnails) and headless-browser PDF printing.
 * Honours the same template profiles as the DOCX renderer.
 */
export function renderWorksheetToHtml(ws: Worksheet, institutionName?: string): string {
  const school = institutionName || ws.config.institutionName || DEFAULT_INSTITUTION_NAME;
  const fun = ws.config.template === "primary-fun-math";
  const compact = ws.config.template === "exam-practice";
  const accent = fun ? "#f6a723" : "#1f4e79";

  const css = CSS
    .replace("__FONT__", fun ? "'Comic Sans MS','Segoe Print',cursive" : compact ? "'Times New Roman',serif" : "'Segoe UI',Calibri,sans-serif")
    .replace("__RADIUS__", fun ? "12px" : "4px")
    .replace(/__ACCENT__/g, accent)
    .replace("__QGAP__", compact ? "8px" : "14px")
    .replace("__QSIZE__", compact ? "12.5px" : "13px");

  const numbered = ws.answerKey.map((k) => ({ ...k, q: ws.questions.find((x) => x.id === k.questionId)! }));

  const sectionBlocks = ws.sections.map((section, sIdx) => {
    const items = numbered.filter((n) => section.questionIds.includes(n.q.id));
    return `
    <section class="section">
      <h2><span class="sec-badge">Section ${String.fromCharCode(65 + sIdx)}</span> ${esc(section.label)} <span class="sec-marks">(${section.marks} marks)</span></h2>
      ${items.map(({ q, number }) => `
      <div class="question" data-qid="${esc(q.id)}">
        <p class="qtext"><span class="qnum">${number}.</span> ${esc(q.question).replace(/\n/g, "<br/>")} <span class="marks">[${q.marks}${q.marks === 1 ? " mark" : " marks"}]</span></p>
        ${q.options && q.options.length
          ? `<div class="options">${q.options.map((o, i) => `<span class="opt">(${String.fromCharCode(65 + i)}) ${esc(o)}</span>`).join("")}</div>` : ""}
        ${OPEN_ENDED.includes(q.type) ? '<div class="lines"><span></span><span></span><span></span></div>' : ""}
      </div>`).join("")}
    </section>`;
  }).join("");

  const keyRows = ws.answerKey.map((k) =>
    `<div class="keyrow"><b>${k.number}.</b> <b>Answer:</b> ${esc(k.answer)}<br/><i>Explanation: ${esc(k.explanation)}</i></div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(ws.title)}</title>
<style>${css}</style>
</head>
<body>
  <div class="page">
    <h1 class="school">${esc(school.toUpperCase())}</h1>
    <h1 class="title">${esc(ws.title)}</h1>
    <div class="meta">Board: ${esc(ws.config.board)} &nbsp;|&nbsp; Class: ${esc(ws.config.grade)} &nbsp;|&nbsp; Subject: Mathematics &nbsp;|&nbsp; Topic: ${esc(ws.config.topic)}${ws.config.subtopic ? ` - ${esc(ws.config.subtopic)}` : ""}</div>
    ${ws.config.timeLimitMinutes || ws.totalMarks ? `<div class="marks-time">${ws.config.timeLimitMinutes ? `Time: ${ws.config.timeLimitMinutes} minutes &nbsp;&nbsp; ` : ""}Max. Marks: ${ws.totalMarks}</div>` : ""}
    <div class="student">${esc(ws.studentFields.nameLine)} &nbsp;&nbsp; ${esc(ws.studentFields.classLine)} &nbsp;&nbsp; ${esc(ws.studentFields.dateLine)}</div>
    <div class="instructions"><b>Instructions:</b><ul>${ws.instructions.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>
    ${sectionBlocks}
    <p class="reflection">My Reflection: How did I feel about this worksheet? (Circle one) &nbsp; Easy &nbsp;/&nbsp; Just right &nbsp;/&nbsp; Challenging</p>
  </div>
  <div class="page answers">
    <h1>ANSWER KEY</h1>
    ${keyRows}
    <div class="total-marks"><b>Total Marks: ${ws.totalMarks}</b></div>
    <div class="footer-note">${esc(ws.metadata.boardAlignmentLabel)}</div>
  </div>
</body>
</html>`;
}

