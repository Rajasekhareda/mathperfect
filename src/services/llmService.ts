/**
 * MULTI-PROVIDER LLM ENGINE, 2026 edition v3.
 * Chain: Groq -> OpenRouter -> Gemini -> Mistral.
 * Models discovered LIVE per provider.
 * JSON enforced by the API, auto-repaired,
 * salvaged question-by-question as last resort.
 * v3: fraction formatting hardened — nested
 * \frac parsing, clean a/b output, exact
 * fractions over decimals, fractional
 * exponents handled.
 */

import fs from "fs";
import path from "path";

export class LlmError extends Error {
  kind: string;
  constructor(
    message: string,
    kind = "llm-error"
  ) {
    super(message);
    this.kind = kind;
  }
}

export interface LlmRequest {
  constraints: unknown;
  spec: {
    type: string;
    count: number;
    difficulty: string;
    marks: number;
  }[];
  topic: string;
  subtopic?: string;
  language: string;
  numberSystem: string;
  calculatorAllowed: boolean;
  customInstructions?: string;
  learningObjective?: string;
  excludeQuestions?: string[];
  slots?: {
    type: string;
    difficulty: string;
    marks: number;
    bloom: string;
  }[];
  feedback?: string;
}

export interface LlmQuestion {
  type: string;
  question: string;
  options?: string[] | null;
  correctAnswer: string;
  acceptableAnswers?: string[] | null;
  explanation?: string;
  marks: number;
  difficulty: string;
  topic?: string;
  learningObjective?: string;
  cognitiveSkill?: string;
}

type Provider = {
  name: string;
  enabled: () => boolean;
  call: (
    prompt: string
  ) => Promise<string>;
};

const TIMEOUT_MS = 45_000;
const TOTAL_BUDGET_MS = 100_000;
const DISCOVER_MS = 15_000;

function env(key: string): string {
  return (
    process.env[key] ?? ""
  ).trim();
}

// ---------- Self-loading .env scanner ----------

const ENV_KEYS = [
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "GROQ_API_KEY",
  "OPENROUTER_API_KEY",
  "MISTRAL_API_KEY",
];

function candidateEnvPaths(): string[] {
  const list: string[] = [];
  const cwd = process.cwd();
  list.push(path.join(cwd, ".env"));
  list.push(
    path.join(cwd, "server", ".env")
  );
  try {
    const here = process.cwd();
    list.push(
      path.join(here, ".env")
    );
    list.push(
      path.join(
        here, "..", "..", "..", ".env"
      )
    );
    list.push(
      path.join(
        here, "..", "..", "server", ".env"
      )
    );
  } catch {
    // skip
  }
  return list;
}

function parseEnvFile(
  p: string
): Record<string, string> {
  const out: Record<string, string> =
    {};
  try {
    if (!fs.existsSync(p)) {
      return out;
    }
    const raw = fs.readFileSync(
      p,
      "utf8"
    );
    const lines = raw
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/);
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith("#")) {
        continue;
      }
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      const v = t
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (k) out[k] = v;
    }
  } catch {
    // skip
  }
  return out;
}

function maskKey(v: string): string {
  if (v.length <= 8) return "****";
  return "..." + v.slice(-4);
}

function selfLoadApiKeys(): void {
  for (const p of candidateEnvPaths()) {
    const parsed = parseEnvFile(p);
    for (const k of ENV_KEYS) {
      const v = parsed[k];
      if (v && !process.env[k]) {
        process.env[k] = v;
      }
    }
  }
}

function logEnvStatus(): void {
  const rows = ENV_KEYS.map((k) => {
    const v = process.env[k];
    return (
      k + "=" +
      (v
        ? "yes " + maskKey(v)
        : "no")
    );
  });
  console.log(
    "[env] " + rows.join("  ")
  );
}

selfLoadApiKeys();
logEnvStatus();

// ---------- Time budget ----------

let globalDeadline = 0;

function timeLeftMs(): number {
  if (!globalDeadline) {
    return TIMEOUT_MS;
  }
  return globalDeadline - Date.now();
}

function errText(err: unknown): string {
  return err instanceof Error
    ? err.message
    : String(err);
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs: number
): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => {
    ctrl.abort();
  }, timeoutMs);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await r.text();
    if (!r.ok) {
      throw new Error(
        "HTTP " + r.status + ": " +
        text.slice(0, 200)
      );
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

async function getJson(
  url: string,
  headers: Record<string, string>
): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => {
    ctrl.abort();
  }, DISCOVER_MS);
  try {
    const r = await fetch(url, {
      headers,
      signal: ctrl.signal,
    });
    if (!r.ok) {
      throw new Error(
        "HTTP " + r.status
      );
    }
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

const GEMINI_BASE =
  "https://generativelanguage" +
  ".googleapis.com/v1beta/models";
const GROQ_URL =
  "https://api.groq.com/openai/v1/" +
  "chat/completions";
const GROQ_MODELS_URL =
  "https://api.groq.com/openai/v1/models";
const OR_URL =
  "https://openrouter.ai/api/v1/" +
  "chat/completions";
const OR_MODELS_URL =
  "https://openrouter.ai/api/v1/models";
const MISTRAL_URL =
  "https://api.mistral.ai/v1/" +
  "chat/completions";

// ---------- Model discovery ----------

const BAD_MODEL_WORDS = [
  "guard",
  "whisper",
  "tts",
  "embed",
  "r1",
  "think",
  "vision",
  "image",
  "imagen",
  "veo",
  "aqa",
  "native-audio",
  "live",
];

function isBadModel(id: string): boolean {
  const low = id.toLowerCase();
  return BAD_MODEL_WORDS.some((b) =>
    low.includes(b)
  );
}

function geminiScore(id: string): number {
  let s = 0;
  if (id.includes("flash")) s += 100;
  else if (id.includes("pro")) s += 40;
  if (id.includes("lite")) s -= 15;
  if (id.includes("exp")) s -= 25;
  if (id.includes("preview")) s -= 5;
  return s;
}

async function discoverGeminiModels(
  key: string
): Promise<string[]> {
  try {
    const data = await getJson(
      GEMINI_BASE + "?key=" + key,
      {}
    );
    const models =
      (data?.models ?? []) as any[];
    const ids: string[] = models
      .map((m) =>
        String(m?.name ?? "").replace(
          /^models\//,
          ""
        )
      )
      .filter((id) => id.length > 0)
      .filter((id) => !isBadModel(id));
    const scored = ids.map((id) => ({
      id,
      s: geminiScore(id),
    }));
    scored.sort(
      (a, b) =>
        b.s - a.s ||
        b.id.localeCompare(a.id)
    );
    return scored
      .map((x) => x.id)
      .slice(0, 5);
  } catch (err) {
    console.log(
      "[llm] Gemini discovery " +
      "FAILED: " +
      errText(err).slice(0, 120)
    );
    return [];
  }
}

async function discoverGroqModels(
  key: string
): Promise<string[]> {
  try {
    const data = await getJson(
      GROQ_MODELS_URL,
      {
        Authorization: "Bearer " + key,
      }
    );
    const ids: string[] = (
      (data?.data ?? []) as any[]
    )
      .map((m) => String(m?.id ?? ""))
      .filter((id) => id.length > 0)
      .filter((id) => !isBadModel(id));
    const PREF = [
      "70b",
      "instruct",
      "8b",
      "32b",
    ];
    const picked: string[] = [];
    for (const k of PREF) {
      for (const id of ids) {
        if (
          id.toLowerCase().includes(k) &&
          !picked.includes(id)
        ) {
          picked.push(id);
          if (picked.length >= 3) {
            return picked;
          }
        }
      }
    }
    for (const id of ids) {
      if (!picked.includes(id)) {
        picked.push(id);
        if (picked.length >= 3) {
          break;
        }
      }
    }
    return picked;
  } catch (err) {
    console.log(
      "[llm] Groq discovery " +
      "FAILED: " +
      errText(err).slice(0, 120)
    );
    return [];
  }
}

async function discoverOrModels(): Promise<string[]> {
  try {
    const data = await getJson(
      OR_MODELS_URL,
      {}
    );
    const free: string[] = (
      (data?.data ?? []) as any[]
    )
      .map((m) => String(m?.id ?? ""))
      .filter((id) =>
        id.endsWith(":free")
      )
      .filter((id) => !isBadModel(id));
    const PREF = [
      "70b",
      "72b",
      "instruct",
      "deepseek",
      "qwen",
      "llama",
      "gemma",
    ];
    const picked: string[] = [];
    for (const k of PREF) {
      for (const id of free) {
        if (
          id.toLowerCase().includes(k) &&
          !picked.includes(id)
        ) {
          picked.push(id);
          if (picked.length >= 3) {
            return picked;
          }
        }
      }
    }
    for (const id of free) {
      if (!picked.includes(id)) {
        picked.push(id);
        if (picked.length >= 3) {
          break;
        }
      }
    }
    return picked;
  } catch (err) {
    console.log(
      "[llm] OpenRouter discovery " +
      "FAILED: " +
      errText(err).slice(0, 120)
    );
    return [];
  }
}

let goodGroqModel: string | null = null;
let goodOrModel: string | null = null;
let goodGeminiModel: string | null =
  null;

function dedupe(
  list: (string | null | undefined)[]
): string[] {
  const out: string[] = [];
  for (const x of list) {
    if (x && !out.includes(x)) {
      out.push(x);
    }
  }
  return out;
}

// ---------- JSON repair & salvage ----------

function fixInnerQuotes(
  s: string
): string {
  const out: string[] = [];
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!inStr) {
      if (c === '"') inStr = true;
      out.push(c);
      continue;
    }
    if (c === "\\") {
      out.push(c);
      if (i + 1 < s.length) {
        out.push(s[i + 1]);
        i++;
      }
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (
        j < s.length &&
        /\s/.test(s[j])
      ) {
        j++;
      }
      const nxt = s[j];
      if (
        nxt === undefined ||
        ",}]:".includes(nxt)
      ) {
        inStr = false;
        out.push(c);
      } else {
        out.push('\\"');
      }
      continue;
    }
    out.push(c);
  }
  return out.join("");
}

function repairJson(t: string): string {
  let s = t;
  s = s.replace(
    /[\u201C\u201D]/g,
    "'"
  );
  s = s.replace(
    /[\u2018\u2019]/g,
    "'"
  );
  s = s.replace(
    /[\u0000-\u001F]+/g,
    " "
  );
  s = s.replace(
    /,\s*([}\]])/g,
    "$1"
  );
  s = fixInnerQuotes(s);
  return s;
}

function scanObjects(
  text: string
): string[] {
  const objs: string[] = [];
  let depth = 0;
  let start = -1;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (
        depth === 0 &&
        start >= 0
      ) {
        objs.push(
          text.slice(start, i + 1)
        );
        start = -1;
      }
    }
  }
  return objs;
}

function extractJsonBlob(
  text: string
): string {
  const a = text.indexOf("[");
  const b = text.indexOf("{");
  let start = -1;
  let openCh = "";
  if (a === -1 && b === -1) {
    throw new Error(
      "No JSON in LLM reply"
    );
  }
  if (a === -1) {
    start = b;
    openCh = "{";
  } else if (b === -1) {
    start = a;
    openCh = "[";
  } else if (a < b) {
    start = a;
    openCh = "[";
  } else {
    start = b;
    openCh = "{";
  }
  const closeCh =
    openCh === "[" ? "]" : "}";
  const end =
    text.lastIndexOf(closeCh);
  if (end <= start) {
    throw new Error(
      "JSON not closed in reply"
    );
  }
  return text.slice(start, end + 1);
}

function unwrapQuestions(
  parsed: any
): any[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (
    parsed &&
    typeof parsed === "object"
  ) {
    if (
      Array.isArray(parsed.questions)
    ) {
      return parsed.questions;
    }
    for (const k of Object.keys(
      parsed
    )) {
      const v = parsed[k];
      if (
        Array.isArray(v) &&
        v.length > 0
      ) {
        return v;
      }
    }
  }
  throw new Error(
    "no question array in JSON"
  );
}

const PARSERS: ((
  s: string
) => any)[] = [
  (s) => JSON.parse(s),
  (s) => JSON.parse(repairJson(s)),
];

function parseQuestionsLoose(
  text: string
): any[] {
  const blob = extractJsonBlob(text);
  for (const fn of PARSERS) {
    try {
      return unwrapQuestions(fn(blob));
    } catch {
      // try next strategy
    }
  }
  const salvaged: any[] = [];
  for (const objStr of scanObjects(
    blob
  )) {
    let o: any = null;
    for (const fn of PARSERS) {
      try {
        o = fn(objStr);
        break;
      } catch {
        // next
      }
    }
    if (!o) continue;
    if (Array.isArray(o.questions)) {
      salvaged.push(...o.questions);
      continue;
    }
    if (
      o.question ||
      o.correctAnswer ||
      o.answer
    ) {
      salvaged.push(o);
    }
  }
  if (salvaged.length > 0) {
    console.log(
      "[llm] Salvaged " +
      salvaged.length +
      " question(s) from " +
      "malformed JSON"
    );
    return salvaged;
  }
  throw new Error(
    "JSON unparseable even " +
    "after repair"
  );
}

// ---------- Chat helpers ----------

async function openAiCompatible(
  name: string,
  url: string,
  key: string,
  model: string,
  prompt: string,
  timeoutMs: number
): Promise<string> {
  const headers = {
    Authorization: "Bearer " + key,
  };
  const body: Record<string, unknown> =
    {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert math " +
            "worksheet generator. " +
            "Reply with ONLY the " +
            "JSON object requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
    };
  try {
    const data = await postJson(
      url,
      headers,
      body,
      timeoutMs
    );
    return extractChoice(name, data);
  } catch (err) {
    const msg = errText(err);
    if (
      /response_format|json_object/i.test(
        msg
      ) ||
      msg.startsWith("HTTP 400")
    ) {
      console.log(
        "[llm] " + name +
        " retrying without " +
        "JSON mode..."
      );
      delete body.response_format;
      const t2 = Math.min(
        timeLeftMs(),
        TIMEOUT_MS
      );
      if (t2 < 3000) throw err;
      const data = await postJson(
        url,
        headers,
        body,
        t2
      );
      return extractChoice(name, data);
    }
    throw err;
  }
}

function extractChoice(
  name: string,
  data: any
): string {
  const choice =
    data?.choices?.[0]?.message
      ?.content;
  if (
    typeof choice !== "string" ||
    !choice.trim()
  ) {
    throw new Error(
      name + ": empty response"
    );
  }
  return choice;
}

async function tryModelChain(
  label: string,
  candidates: string[],
  run: (
    model: string,
    t: number
  ) => Promise<string>,
  onWin: (model: string) => void
): Promise<string> {
  let lastErr = "unknown";
  for (const model of candidates) {
    const t = Math.min(
      timeLeftMs(),
      TIMEOUT_MS
    );
    if (t < 3000) {
      throw new Error(
        "time budget exhausted"
      );
    }
    console.log(
      "[llm] " + label +
      " trying " + model +
      " (" +
      Math.round(t / 1000) +
      "s left)"
    );
    const t0 = Date.now();
    try {
      const out = await run(model, t);
      onWin(model);
      console.log(
        "[llm] " + label + " " +
        model + " OK in " +
        Math.round(
          (Date.now() - t0) / 1000
        ) + "s"
      );
      return out;
    } catch (err) {
      lastErr = errText(err);
      console.log(
        "[llm] " + label + " " +
        model + " failed: " +
        lastErr.slice(0, 120)
      );
    }
  }
  throw new Error(
    "all " + label +
    " models failed: " + lastErr
  );
}

// ---------------- Providers ----------------

const groqProvider: Provider = {
  name: "Groq",
  enabled: () =>
    !!env("GROQ_API_KEY"),
  call: async (prompt) => {
    const key = env("GROQ_API_KEY");
    let candidates: string[];
    if (goodGroqModel) {
      candidates = [goodGroqModel];
    } else {
      console.log(
        "[llm] Groq: asking for " +
        "live model list..."
      );
      const found =
        await discoverGroqModels(key);
      console.log(
        "[llm] Groq live models: " +
        (found.length
          ? found.join(", ")
          : "NONE FOUND")
      );
      candidates = dedupe([
        ...found,
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
      ]);
    }
    if (candidates.length === 0) {
      throw new Error(
        "no models available"
      );
    }
    return tryModelChain(
      "Groq",
      candidates,
      (model, t) =>
        openAiCompatible(
          "Groq",
          GROQ_URL,
          key,
          model,
          prompt,
          t
        ),
      (m) => {
        goodGroqModel = m;
      }
    );
  },
};

const orProvider: Provider = {
  name: "OpenRouter",
  enabled: () =>
    !!env("OPENROUTER_API_KEY"),
  call: async (prompt) => {
    const key =
      env("OPENROUTER_API_KEY");
    let candidates: string[];
    if (goodOrModel) {
      candidates = [goodOrModel];
    } else {
      console.log(
        "[llm] OpenRouter: asking " +
        "for free model list..."
      );
      const found =
        await discoverOrModels();
      console.log(
        "[llm] OpenRouter free " +
        "models: " +
        (found.length
          ? found.join(", ")
          : "NONE FOUND")
      );
      candidates = dedupe([
        ...found,
        "meta-llama/" +
        "llama-3.3-70b-instruct:free",
        "qwen/qwen-2.5-72b-instruct:free",
      ]);
    }
    if (candidates.length === 0) {
      throw new Error(
        "no free models available"
      );
    }
    return tryModelChain(
      "OpenRouter",
      candidates,
      (model, t) =>
        openAiCompatible(
          "OpenRouter",
          OR_URL,
          key,
          model,
          prompt,
          t
        ),
      (m) => {
        goodOrModel = m;
      }
    );
  },
};

async function callGemini(
  key: string,
  model: string,
  prompt: string,
  timeoutMs: number
): Promise<string> {
  const url =
    GEMINI_BASE + "/" + model +
    ":generateContent?key=" + key;
  const gen: Record<string, unknown> =
    {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType:
        "application/json",
    };
  if (model.includes("2.5")) {
    gen.thinkingConfig = {
      thinkingBudget: 0,
    };
  }
  const data = await postJson(
    url,
    {},
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: gen,
    },
    timeoutMs
  );
  const parts =
    data?.candidates?.[0]?.content
      ?.parts as
    { text?: string }[] | undefined;
  const out = (parts ?? [])
    .map((p) => p.text ?? "")
    .join("");
  if (!out.trim()) {
    throw new Error(
      "Gemini: empty response"
    );
  }
  return out;
}

const geminiProvider: Provider = {
  name: "Gemini",
  enabled: () =>
    !!env("GEMINI_API_KEY") ||
    !!env("GOOGLE_API_KEY"),
  call: async (prompt) => {
    const key =
      env("GEMINI_API_KEY") ||
      env("GOOGLE_API_KEY");
    let candidates: string[];
    if (goodGeminiModel) {
      candidates = [goodGeminiModel];
    } else {
      console.log(
        "[llm] Gemini: asking " +
        "Google for live models..."
      );
      const found =
        await discoverGeminiModels(
          key
        );
      console.log(
        "[llm] Gemini live " +
        "models: " +
        (found.length
          ? found.join(", ")
          : "NONE FOUND")
      );
      candidates = dedupe([
        ...found,
        "gemini-2.5-flash",
        "gemini-2.0-flash",
      ]);
    }
    if (candidates.length === 0) {
      throw new Error(
        "no models available"
      );
    }
    return tryModelChain(
      "Gemini",
      candidates,
      (model, t) =>
        callGemini(
          key,
          model,
          prompt,
          t
        ),
      (m) => {
        goodGeminiModel = m;
      }
    );
  },
};

const mistralProvider: Provider = {
  name: "Mistral",
  enabled: () =>
    !!env("MISTRAL_API_KEY"),
  call: (prompt) => {
    const t = Math.min(
      timeLeftMs(),
      TIMEOUT_MS
    );
    return openAiCompatible(
      "Mistral",
      MISTRAL_URL,
      env("MISTRAL_API_KEY"),
      "mistral-small-latest",
      prompt,
      t
    );
  },
};

const PROVIDERS: Provider[] = [
  groqProvider,
  orProvider,
  geminiProvider,
  mistralProvider,
];

export function hasAnyLlmKey(): boolean {
  return PROVIDERS.some((p) =>
    p.enabled()
  );
}

export function listProviders(): string[] {
  return PROVIDERS.filter((p) =>
    p.enabled()
  ).map((p) => p.name);
}

// ---------------- Prompt ----------------

function slotTable(
  req: LlmRequest
): string {
  if (req.slots && req.slots.length > 0) {
    return req.slots
      .map((s, i) => {
        return (
          "Q" + (i + 1) + ": type=" +
          s.type +
          " | difficulty=" +
          s.difficulty +
          " | bloom=" + s.bloom +
          " | marks=" + s.marks
        );
      })
      .join("\n");
  }
  let n = 0;
  const lines: string[] = [];
  for (const s of req.spec) {
    for (let i = 0; i < s.count; i++) {
      n++;
      lines.push(
        "Q" + n + ": type=" + s.type +
        " | difficulty=" +
        s.difficulty +
        " | marks=" + s.marks
      );
    }
  }
  return lines.join("\n");
}

const PICTURE_RULES = `PICTURE RULES:
- For early grades (KG to Class 5), build
  "picture" questions using emoji and
  Unicode shapes, e.g.:
  "Count the apples: 🍎🍎🍎🍎. How many?"
  "Which shape has 3 sides? △ ◻ ○"
- For fraction-of-a-set questions, use
  emoji groups, e.g.:
  "What fraction of the fruits are
  apples? 🍎🍎🍌🍌🍌 -> 2/5"
- For geometry, describe the figure
  precisely in words with labelled
  points, e.g. "In triangle ABC,
  angle A = 50° and angle B = 60°."
- Inside JSON strings, NEVER use the
  straight double-quote character.
  Use single quotes for any quoted
  words inside question text.`;

const NOTATION_RULES = `MATH NOTATION RULES (STRICT):

FRACTIONS — follow ALL of these:
- Write every fraction as plain a/b:
  3/4, x/5, 22/7.
- Multi-term parts get brackets:
  (x+1)/2, (a+b)/(a-b).
- NEVER use LaTeX: no \\frac, no
  \\dfrac, no \\over.
- NEVER use Unicode fractions:
  write 1/2, not \\u00bd.
- Mixed numbers: write as 2 3/4.
- Give answers as exact fractions
  (3/4), NOT decimals (0.75),
  unless the question explicitly
  asks for decimals.

OTHER NOTATION:
- Exponents: superscript x², x³,
  or x^(n/d) for fractional powers,
  or plain x^5 beyond cube.
- Use these exact characters:
  × ÷ ± ° ∠ △ √ π ≤ ≥ ≠
- Square root: √(9). Degree: 30°.`;

const OUTPUT_RULES = `OUTPUT FORMAT — return ONLY this
JSON object, no markdown, no commentary:
{"questions": [ { ... }, { ... } ]}
Each array element:
{
  "type": "<slot type>",
  "question": "<text, math symbols>",
  "options": ["A) ..","B) ..","C) ..","D) .."],
  "correctAnswer": "<answer>",
  "acceptableAnswers": ["alt1"] or null,
  "explanation": "<1-3 sentences>",
  "marks": <number>,
  "difficulty": "<Easy|Medium|Hard>",
  "cognitiveSkill": "<Bloom level>",
  "topic": "<the chapter above>",
  "learningObjective": "<objective or empty>"
}
JSON SAFETY: inside any string value,
never use a raw double quote; write
single quotes instead.`;

function buildPrompt(
  req: LlmRequest
): string {
  const constraintsText = JSON.stringify(
    req.constraints
  ).slice(0, 3500);

  const exclude =
    req.excludeQuestions &&
    req.excludeQuestions.length > 0
      ? "\nDO NOT repeat or closely " +
        "imitate these existing " +
        "questions:\n" +
        req.excludeQuestions
          .map((q) => "- " + q)
          .join("\n")
      : "";

  const feedback = req.feedback
    ? "\nFIX THESE PROBLEMS from " +
      "your previous attempt:\n" +
      req.feedback
    : "";

  let head =
    "Generate a school math " +
    "worksheet as JSON.\n\n" +
    "CHAPTER (the ONLY allowed " +
    "chapter): \"" + req.topic +
    "\"\n";
  if (req.subtopic) {
    head +=
      "SUBTOPIC FOCUS: \"" +
      req.subtopic + "\"\n";
  }
  head +=
    "GRADE / CLASS and board " +
    "constraints JSON: " +
    constraintsText + "\n" +
    "LANGUAGE: " + req.language +
    "\n" +
    "NUMBER SYSTEM: " +
    req.numberSystem +
    " (Indian: lakhs/crores; " +
    "International: millions)\n" +
    "CALCULATOR ALLOWED: " +
    (req.calculatorAllowed
      ? "yes"
      : "no") + "\n";
  if (req.learningObjective) {
    head +=
      "LEARNING OBJECTIVE: " +
      req.learningObjective + "\n";
  }
  if (req.customInstructions) {
    head +=
      "TEACHER'S EXTRA " +
      "INSTRUCTIONS: " +
      req.customInstructions + "\n";
  }

  const tail =
    "\nEach question MUST match its " +
    "slot exactly (type, difficulty, " +
    "bloom, marks). Produce exactly " +
    "one question per slot, in this " +
    "order:\n" +
    slotTable(req) + "\n" +
    exclude +
    feedback +
    "\n" +
    PICTURE_RULES + "\n" +
    NOTATION_RULES + "\n" +
    OUTPUT_RULES + "\n" +
    "Topic field for every " +
    "question: \"" + req.topic +
    "\"\n" +
    "Return ONLY the JSON object " +
    "with the questions array.";

  return head + tail;
}

// ---------------- Math cleanup ----------------

const SUPER: Record<string, string> = {
  "0": "\u2070",
  "1": "\u00B9",
  "2": "\u00B2",
  "3": "\u00B3",
  "4": "\u2074",
  "5": "\u2075",
  "6": "\u2076",
  "7": "\u2077",
  "8": "\u2078",
  "9": "\u2079",
};

function supOf(d: string): string {
  return d
    .split("")
    .map((c) => SUPER[c] ?? c)
    .join("");
}

// --- Fraction engine (v3) ---

function readGroup(
  s: string,
  start: number
): { body: string; end: number } | null {
  if (s[start] !== "{") return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "{") {
      depth++;
    } else if (s[i] === "}") {
      depth--;
      if (depth === 0) {
        return {
          body: s.slice(start + 1, i),
          end: i,
        };
      }
    }
  }
  return null;
}

function fracToPlain(
  num: string,
  den: string
): string {
  const n = num.trim();
  const d = den.trim();
  const simple = /^[A-Za-z0-9]+$/;
  if (
    simple.test(n) &&
    simple.test(d)
  ) {
    return n + "/" + d;
  }
  return "(" + n + ")/(" + d + ")";
}

function convertFracs(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\") {
      const m = /^\\[dt]?frac/.exec(
        s.slice(i)
      );
      if (m) {
        let j = i + m[0].length;
        while (
          j < s.length &&
          s[j] === " "
        ) {
          j++;
        }
        if (s[j] === "{") {
          const g1 = readGroup(s, j);
          if (g1) {
            let k = g1.end + 1;
            while (
              k < s.length &&
              s[k] === " "
            ) {
              k++;
            }
            if (s[k] === "{") {
              const g2 = readGroup(
                s,
                k
              );
              if (g2) {
                const num =
                  convertFracs(
                    g1.body
                  );
                const den =
                  convertFracs(
                    g2.body
                  );
                out += fracToPlain(
                  num,
                  den
                );
                i = g2.end + 1;
                continue;
              }
            }
          }
        }
        const two =
          /^[0-9A-Za-z]{2}/.exec(
            s.slice(j)
          );
        if (two) {
          out +=
            two[0][0] +
            "/" +
            two[0][1];
          i = j + 2;
          continue;
        }
      }
    }
    out += s[i];
    i++;
  }
  return out;
}

const SQRT_RE = /\\sqrt\{([^{}]*)\}/g;
const TEXT_RE = /\\text\{([^{}]*)\}/g;
const DOLLAR_RE = /\$(.+?)\$/g;
const PAREN_RE = /\\\((.+?)\\\)/g;
const BRACKET_RE =
  /\\\[([\s\S]+?)\\\]/g;
const LEFTRIGHT_RE =
  /\\left|\\right/g;
const FRACSLASH_RE = /\u2044/g;
const VULGAR_FRAC_RE =
  /[\u00BC-\u00BE\u2150-\u215E]/g;
const PARENSLASH_RE =
  /\(([^()]+)\)\/\(([^()]+)\)/g;
const SPACE_SLASH_RE =
  /([A-Za-z0-9])\s*\/\s*([A-Za-z0-9])/g;
const EXP_BRACE_NUM_RE =
  /\^\{([0-9]+)\}/g;
const EXP_BRACE_GEN_RE =
  /\^\{([^{}]+)\}/g;
const EXP_PLAIN_RE = /\^([0-9]+)/g;

const SYMBOL_MAP: [RegExp, string][] = [
  [/\\times/g, "\u00D7"],
  [/\\div/g, "\u00F7"],
  [/\\pm/g, "\u00B1"],
  [/\\leq/g, "\u2264"],
  [/\\le\b/g, "\u2264"],
  [/\\geq/g, "\u2265"],
  [/\\ge\b/g, "\u2265"],
  [/\\neq/g, "\u2260"],
  [/\\ne\b/g, "\u2260"],
  [/\\angle/g, "\u2220"],
  [/\\triangle/g, "\u25B3"],
  [/\\degree/g, "\u00B0"],
  [/\\circ/g, "\u00B0"],
  [/\\pi/g, "\u03C0"],
  [/\\cdot/g, "\u00B7"],
];

// Unicode vulgar -> plain a/b
const VULGAR_MAP: Record<
  string,
  string
> = {
  "\u00BC": "1/4",
  "\u00BD": "1/2",
  "\u00BE": "3/4",
  "\u2150": "1/7",
  "\u2151": "1/9",
  "\u2152": "1/10",
  "\u2153": "1/3",
  "\u2154": "2/3",
  "\u2155": "1/5",
  "\u2156": "2/5",
  "\u2157": "3/5",
  "\u2158": "4/5",
  "\u2159": "1/6",
  "\u215A": "5/6",
  "\u215B": "1/8",
  "\u215C": "3/8",
  "\u215D": "5/8",
  "\u215E": "7/8",
};

export function normalizeMath(
  input: string
): string {
  let s = input ?? "";
  s = convertFracs(s);
  s = s.replace(
    VULGAR_FRAC_RE,
    (ch) => VULGAR_MAP[ch] ?? ch
  );
  s = s.replace(FRACSLASH_RE, "/");
  s = s.replace(SQRT_RE, "\u221A($1)");
  s = s.replace(TEXT_RE, "$1");
  s = s.replace(DOLLAR_RE, "$1");
  s = s.replace(PAREN_RE, "$1");
  s = s.replace(BRACKET_RE, "$1");
  s = s.replace(LEFTRIGHT_RE, "");
  for (const [re, rep] of SYMBOL_MAP) {
    s = s.replace(re, rep);
  }
  s = s.replace(
    PARENSLASH_RE,
    (_m, a: string, b: string) =>
      fracToPlain(a, b)
  );
  s = s.replace(
    SPACE_SLASH_RE,
    "$1/$2"
  );
  s = s.replace(
    EXP_BRACE_NUM_RE,
    (_m, d: string) => supOf(d)
  );
  s = s.replace(
    EXP_BRACE_GEN_RE,
    (_m, inner: string) =>
      "^(" + inner + ")"
  );
  s = s.replace(
    EXP_PLAIN_RE,
    (_m, d: string) => supOf(d)
  );
  s = s.replace(/[ \t]{2,}/g, " ")
    .trim();
  return s;
}

function coerceQuestion(
  raw: any,
  fallbackTopic: string
): LlmQuestion | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const question = normalizeMath(
    String(raw.question ?? "")
  );
  const answer = normalizeMath(
    String(
      raw.correctAnswer ??
      raw.answer ?? ""
    )
  );
  if (!question || !answer) {
    return null;
  }
  return {
    type: String(
      raw.type ?? "Short Answer"
    ),
    question,
    options: Array.isArray(
      raw.options
    )
      ? raw.options.map((o: any) =>
          normalizeMath(String(o))
        )
      : null,
    correctAnswer: answer,
    acceptableAnswers: Array.isArray(
      raw.acceptableAnswers
    )
      ? raw.acceptableAnswers.map(
          (a: any) =>
            normalizeMath(String(a))
        )
      : null,
    explanation: raw.explanation
      ? normalizeMath(
          String(raw.explanation)
        )
      : undefined,
    marks:
      Number(raw.marks) > 0
        ? Number(raw.marks)
        : 1,
    difficulty: String(
      raw.difficulty ?? "Medium"
    ),
    topic: String(
      raw.topic || fallbackTopic
    ),
    learningObjective:
      raw.learningObjective
        ? String(
            raw.learningObjective
          )
        : undefined,
    cognitiveSkill: raw.cognitiveSkill
      ? String(raw.cognitiveSkill)
      : undefined,
  };
}

export async function llmGenerate(
  req: LlmRequest
): Promise<LlmQuestion[]> {
  const prompt = buildPrompt(req);
  const failures: string[] = [];
  globalDeadline =
    Date.now() + TOTAL_BUDGET_MS;

  for (const p of PROVIDERS) {
    if (!p.enabled()) continue;
    const left = timeLeftMs();
    if (left < 5000) {
      failures.push(
        "time budget ran out " +
        "before " + p.name
      );
      continue;
    }
    try {
      const text = await p.call(
        prompt
      );
      const raws =
        parseQuestionsLoose(text);
      const out = raws
        .map((r) =>
          coerceQuestion(r, req.topic)
        )
        .filter(
          (q): q is LlmQuestion =>
            q !== null
        );
      if (out.length === 0) {
        throw new Error(
          "all questions unparseable"
        );
      }
      console.log(
        "[llm] " + p.name +
        " delivered " +
        out.length + " question(s)"
      );
      return out;
    } catch (err) {
      const msg = errText(err);
      failures.push(
        p.name + ": " +
        msg.slice(0, 160)
      );
    }
  }

  throw new LlmError(
    failures.length > 0
      ? "All AI providers failed" +
        " -> " +
        failures.join(" | ") +
        " (full per-model log is" +
        " in the server terminal)"
      : "No AI provider keys in .env",
    "all-providers-failed"
  );
}
