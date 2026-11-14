// test-llm.mjs — checks every AI key in .env
import { readFileSync } from "fs";

const envMap = {};
const lines = readFileSync(".env", "utf8")
  .split(/\r?\n/);
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim()
    .replace(/^["']|["']$/g, "");
  envMap[k] = v;
}

const get = (k) => envMap[k] || "";

async function ping(name, url, headers, body) {
  try {
    const r = await fetch(url, {
      method: body ? "POST" : "GET",
      headers,
      body: body
        ? JSON.stringify(body)
        : undefined,
    });
    const text = await r.text();
    if (r.ok) {
      return {
        name,
        ok: true,
        detail: text.slice(0, 110),
      };
    }
    return {
      name,
      ok: false,
      detail:
        "HTTP " + r.status + " " +
        text.slice(0, 130),
    };
  } catch (e) {
    return {
      name,
      ok: false,
      detail: String(e).slice(0, 130),
    };
  }
}

const results = [];

const gk =
  get("GEMINI_API_KEY") ||
  get("GOOGLE_API_KEY");
if (gk) {
  results.push(await ping(
    "GEMINI key",
    "https://generativelanguage" +
    ".googleapis.com/v1beta/models" +
    "?key=" + gk,
    {}
  ));
} else {
  results.push({
    name: "GEMINI key",
    ok: null,
    detail: "no key in .env",
  });
}

const gq = get("GROQ_API_KEY");
if (gq) {
  results.push(await ping(
    "GROQ key",
    "https://api.groq.com/openai/v1/" +
    "chat/completions",
    {
      "Content-Type": "application/json",
      Authorization: "Bearer " + gq,
    },
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: "Say OK" },
      ],
      max_tokens: 5,
    }
  ));
} else {
  results.push({
    name: "GROQ key",
    ok: null,
    detail: "no key in .env",
  });
}

const orKey = get("OPENROUTER_API_KEY");
if (orKey) {
  results.push(await ping(
    "OPENROUTER key",
    "https://openrouter.ai/api/v1/" +
    "chat/completions",
    {
      "Content-Type": "application/json",
      Authorization: "Bearer " + orKey,
    },
    {
      model:
        "meta-llama/" +
        "llama-3.3-70b-instruct:free",
      messages: [
        { role: "user", content: "Say OK" },
      ],
      max_tokens: 5,
    }
  ));
} else {
  results.push({
    name: "OPENROUTER key",
    ok: null,
    detail: "no key in .env",
  });
}

const mi = get("MISTRAL_API_KEY");
if (mi) {
  results.push(await ping(
    "MISTRAL key",
    "https://api.mistral.ai/v1/" +
    "chat/completions",
    {
      "Content-Type": "application/json",
      Authorization: "Bearer " + mi,
    },
    {
      model: "mistral-small-latest",
      messages: [
        { role: "user", content: "Say OK" },
      ],
      max_tokens: 5,
    }
  ));
} else {
  results.push({
    name: "MISTRAL key",
    ok: null,
    detail: "no key in .env",
  });
}

console.log("=== LLM KEY CHECK ===");
for (const r of results) {
  const tag =
    r.ok === true
      ? "PASS"
      : r.ok === false
        ? "FAIL"
        : "SKIP";
  console.log(
    tag.padEnd(5),
    r.name,
    "->",
    r.detail
  );
}
