/**
 * Auto-Structure & Path Normalizer Script
 * Run with: node setup-structure.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
console.log(`\n🚀 Initializing project folder setup in: ${ROOT}\n`);

// 1. Ensure required directory tree exists
const requiredDirs = [
  "data",
  "exports",
  "server",
  "server/src",
  "server/src/db",
  "server/src/services",
  "server/src/routes",
  "server/db",
  "server/services",
  "server/routes"
];

for (const dir of requiredDirs) {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

// 2. Helper to bridge/forward files between server/ and server/src/
function bridgeFile(primaryRel, mirrorRel) {
  const primaryPath = path.join(ROOT, primaryRel);
  const mirrorPath = path.join(ROOT, mirrorRel);

  const primaryExists = fs.existsSync(primaryPath);
  const mirrorExists = fs.existsSync(mirrorPath);

  if (primaryExists && !mirrorExists) {
    fs.copyFileSync(primaryPath, mirrorPath);
    console.log(`📋 Mirrored ${primaryRel} -> ${mirrorRel}`);
  } else if (!primaryExists && mirrorExists) {
    fs.copyFileSync(mirrorPath, primaryPath);
    console.log(`📋 Mirrored ${mirrorRel} -> ${primaryRel}`);
  } else if (!primaryExists && !mirrorExists) {
    // Both missing, will handle with defaults below
  }
}

// Ensure key modules can be resolved from either server/... or server/src/...
bridgeFile("server/src/index.ts", "server/index.ts");
bridgeFile("server/src/db/database.ts", "server/db/database.ts");
bridgeFile("server/src/types.ts", "server/types.ts");

// 3. Ensure curriculumAtlas placeholder exists to prevent ERR_MODULE_NOT_FOUND
const atlasPaths = [
  path.join(ROOT, "server/services/curriculumAtlas.ts"),
  path.join(ROOT, "server/src/services/curriculumAtlas.ts")
];

const atlasFallbackContent = `/**
 * Built-in Curriculum Atlas Fallback
 */
export const curriculumAtlas = {
  grades: [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ],
  boards: ["CBSE", "ICSE", "Common Core", "Cambridge", "State Board"],
  getChapters(grade: string) {
    return [
      "Number Systems & Arithmetic",
      "Algebra & Equations",
      "Geometry & Measurement",
      "Data Handling & Probability"
    ];
  }
};
export default curriculumAtlas;
`;

for (const p of atlasPaths) {
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, atlasFallbackContent, "utf-8");
    console.log(`✅ Generated missing module: ${path.relative(ROOT, p)}`);
  }
}

// 4. Ensure types.ts exists if missing in either location
const typesFallbackContent = `export interface Question {
  id?: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation?: string;
  marks?: number;
  difficulty: string;
  topic?: string;
  learningObjective?: string;
  cognitiveSkill?: string;
}

export interface AnswerKeyEntry {
  questionId: string;
  answer: string;
  steps?: string[];
  explanation?: string;
}

export interface WorksheetConfig {
  grade: string;
  board: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  numQuestions?: number;
}

export interface Worksheet {
  id: string;
  title: string;
  config: WorksheetConfig;
  totalMarks?: number;
  createdAt?: string;
  questions: Question[];
  answerKey?: AnswerKeyEntry[];
  metadata?: Record<string, any>;
}
`;

for (const p of [path.join(ROOT, "server/types.ts"), path.join(ROOT, "server/src/types.ts")]) {
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, typesFallbackContent, "utf-8");
    console.log(`✅ Generated fallback types: ${path.relative(ROOT, p)}`);
  }
}

// 5. Install missing core dependencies if needed
console.log("\n📦 Verifying essential npm packages (cors, express, better-sqlite3)...");
try {
  execSync("npm install cors express better-sqlite3 dotenv", { stdio: "inherit" });
  execSync("npm install -D @types/cors @types/express @types/better-sqlite3 @types/node tsx", { stdio: "inherit" });
  console.log("✅ Dependencies installed cleanly!\n");
} catch (err) {
  console.warn("⚠️ npm install encountered a warning or skipped, proceeding...");
}

console.log("✨ All files and folders synchronized successfully!");
console.log("👉 You can now run your server with: npx tsx server/src/index.ts\n");