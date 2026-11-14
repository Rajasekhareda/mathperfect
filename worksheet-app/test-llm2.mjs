// test-llm2.mjs — shows which models each
// provider would auto-pick today
import { readFileSync } from "fs";

const envMap = {};
for (const line of readFileSync(".env", "utf8")
  .split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  envMap[t.slice(0, eq).trim()] =
    t.slice(eq + 1).trim()
      .replace(/^["']|["']$/g, "");
}

const gq = envMap.GROQ_API_KEY || "";
const orK = envMap.OPENROUTER_API_KEY || "";

const BAD = [
  "guard", "whisper", "tts",
  "embed", "r1", "think", "vision",
];
const bad = (id) =>
  BAD.some((b) => id.toLowerCase()
    .includes(b));

if (gq) {
  const r = await fetch(
    "https://api.groq.com/openai/v1/models",
    { headers: {
      Authorization: "Bearer " + gq,
    } }
  );
  const d = await r.json();
  const ids = (d?.data ?? [])
    .map((m) => m.id)
    .filter((i) => !bad(i));
  console.log("GROQ live models:");
  ids.slice(0, 10).forEach(
    (i) => console.log("  " + i)
  );
}

if (orK) {
  const r = await fetch(
    "https://openrouter.ai/api/v1/models"
  );
  const d = await r.json();
  const free = (d?.data ?? [])
    .map((m) => m.id)
    .filter((i) =>
      i.endsWith(":free") && !bad(i)
    );
  console.log("OPENROUTER free models:");
  free.slice(0, 10).forEach(
    (i) => console.log("  " + i)
  );
}
