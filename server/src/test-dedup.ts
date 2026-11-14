// server/src/test-dedup.ts
import { db, calculateFingerprint } from "./db/database";
import { QuestionBankService } from "./services/questionBankService";
import { Worksheet } from "./types";

async function testDedup() {
  console.log("==========================================================");
  console.log("  VERIFYING ZERO-DUPLICATION IN question_bank REPOSITORY  ");
  console.log("==========================================================");

  // Exact same questions requested by user across two different worksheets
  const rawQuestions = [
    {
      question: "Solve for x: 3x + 12 = 27",
      type: "Short Answer",
      correctAnswer: "x = 5",
      explanation: "Subtract 12 from both sides (3x = 15), then divide by 3 (x = 5).",
      marks: 3,
      difficulty: "Medium",
      topic: "Algebra",
    },
    {
      question: "Find the perimeter of a rectangle with length 8 cm and breadth 5 cm.",
      type: "Short Answer",
      correctAnswer: "26 cm",
      explanation: "Perimeter = 2 * (l + b) = 2 * (8 + 5) = 26 cm.",
      marks: 2,
      difficulty: "Easy",
      topic: "Mensuration",
    },
  ];

  const now = new Date().toISOString();

  // Worksheet 1
  const ws1Id = `ws_test_${Date.now()}_1`;
  const ws1: Worksheet = {
    id: ws1Id,
    title: "Class 6 Math Test - Batch A",
    totalMarks: 5,
    status: "APPROVED",
    config: {
      grade: "Grade 6",
      board: "CBSE",
      topic: "Mathematics",
      difficulty: "Medium",
    },
    questions: rawQuestions.map((q, idx) => ({
      ...q,
      id: `${ws1Id}_q_${idx + 1}`,
    })) as any,
    createdAt: now,
    updatedAt: now,
  };

  // Worksheet 2 (User requests another worksheet containing identical questions)
  const ws2Id = `ws_test_${Date.now()}_2`;
  const ws2: Worksheet = {
    id: ws2Id,
    title: "Class 6 Math Test - Batch B (Identical Questions)",
    totalMarks: 5,
    status: "EXPORTED",
    config: {
      grade: "Grade 6",
      board: "CBSE",
      topic: "Mathematics",
      difficulty: "Medium",
    },
    questions: rawQuestions.map((q, idx) => ({
      ...q,
      id: `${ws2Id}_q_${idx + 1}`,
    })) as any,
    createdAt: now,
    updatedAt: now,
  };

  // Step 1: Initial Count
  const initialBankCount = (
    db.prepare("SELECT COUNT(*) as cnt FROM question_bank").get() as any
  ).cnt;
  console.log(`\nInitial canonical questions in question_bank: ${initialBankCount}`);

  // Step 2: Finalize Worksheet 1
  console.log("\n[Action 1] Finalizing & Saving Worksheet #1...");
  QuestionBankService.finalizeAndSaveWorksheet(ws1);

  const bankCountAfterFirst = (
    db.prepare("SELECT COUNT(*) as cnt FROM question_bank").get() as any
  ).cnt;
  console.log(`Canonical questions in question_bank after Worksheet #1: ${bankCountAfterFirst}`);

  // Step 3: Finalize Worksheet 2 (Exact same questions)
  console.log("\n[Action 2] Finalizing & Saving Worksheet #2 (identical questions)...");
  QuestionBankService.finalizeAndSaveWorksheet(ws2);

  const bankCountAfterSecond = (
    db.prepare("SELECT COUNT(*) as cnt FROM question_bank").get() as any
  ).cnt;
  console.log(`Canonical questions in question_bank after Worksheet #2: ${bankCountAfterSecond}`);

  // Step 4: Verify Fingerprint & Usage Count
  const fp1 = calculateFingerprint(rawQuestions[0].question);
  const qbRow = db
    .prepare("SELECT fingerprint, skeleton, usage_count, last_used_at FROM question_bank WHERE fingerprint = ?")
    .get(fp1) as any;

  console.log("\n[Verification] Inspecting question_bank record:");
  console.log(`  - Question Fingerprint: "${qbRow.fingerprint}"`);
  console.log(`  - Question Skeleton:    "${qbRow.skeleton}"`);
  console.log(`  - Usage Count:          ${qbRow.usage_count} (Incremented automatically!)`);

  const delta = bankCountAfterSecond - bankCountAfterFirst;

  if (delta === 0 && qbRow.usage_count >= 2) {
    console.log("\n==========================================================");
    console.log(">>> SUCCESS: ZERO DUPLICATION IN question_bank VERIFIED! <<<");
    console.log("Both worksheets exist independently in the worksheets table,");
    console.log("while question_bank reuses canonical items and increments usage_count.");
    console.log("==========================================================");
  } else {
    console.error(`\n>>> FAILED: ${delta} new duplicate rows were created in question_bank!`);
  }
}

testDedup();