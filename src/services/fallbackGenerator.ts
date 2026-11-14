import { GeneratedQuestion } from "./schemas";
import { QuestionType } from "../types";
import { CurriculumConstraints } from "./curriculumPlanner";
import { jaccardSimilarity } from "../utils";

/**
 * Deterministic local question generator (stage B fallback).
 * Produces original, mathematically self-consistent questions with an
 * Indian context when Gemini is unavailable (no key, quota, API failure).
 * All numeric answers are computed here, not asserted.
 */

const NAMES = ["Aarav", "Priya", "Iqbal", "Meena", "Karthik", "Lakshmi", "Rohan", "Ananya", "Vikram", "Divya"];
const ITEMS = ["marbles", "pencils", "erasers", "laddoos", "biscuits", "stickers", "beads", "shells"];

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

const COG = { Easy: "Understand", Medium: "Apply", Hard: "Analyse" } as const;

function base(
  type: QuestionType,
  difficulty: "Easy" | "Medium" | "Hard",
  marks: number,
  topic: string,
  question: string,
  correctAnswer: string,
  explanation: string,
  extra: Partial<GeneratedQuestion> = {}
): GeneratedQuestion {
  return {
    type,
    question,
    correctAnswer,
    explanation,
    marks,
    difficulty,
    topic,
    learningObjective: `Apply ${topic} to solve grade-appropriate problems`,
    cognitiveSkill: COG[difficulty],
    options: undefined,
    acceptableAnswers: undefined,
    ...extra,
  };
}

function numScope(c: CurriculumConstraints): { min: number; max: number } {
  switch (c.gradeBand) {
    case "pre-primary": return { min: 1, max: 20 };
    case "primary": return { min: 2, max: 99 };
    case "upper-primary": return { min: 5, max: 499 };
    default: return { min: 7, max: 99 };
  }
}

function topicKey(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes("quadratic")) return "quadratics";
  if (/add|sum/.test(t)) return "addition";
  if (/multip|product|table/.test(t)) return "multiplication";
  if (/fraction/.test(t)) return "fractions";
  if (/percent/.test(t)) return "percentages";
  return "default";
}

/** Generate `spec` questions per type with deterministic computation. */
export function generateFallbackQuestions(
  constraints: CurriculumConstraints,
  spec: FallbackSpec[],
  topic: string,
  subtopic: string | undefined,
  seed = Date.now()
): GeneratedQuestion[] {
  const rng = mulberry32(seed);
  const topicLabel = subtopic ? `${topic} - ${subtopic}` : topic;
  const key = topicKey(topic);
  const out: GeneratedQuestion[] = [];
  for (const s of spec) {
    for (let i = 0; i < s.count; i++) {
      // Draw with retries so template-based questions never duplicate.
      // Match detectDuplicates: compare full question text including options.
      let candidate = makeQuestion(rng, s.type, s.difficulty, s.marks, topicLabel, constraints, key, constraints.gradeBand);
      const qText = (q: GeneratedQuestion) => [q.question, ...(q.options ?? [])].join(" ");
      for (let attempt = 0; attempt < 12; attempt++) {
        const clash = out.some((prev) => jaccardSimilarity(qText(prev), qText(candidate)) >= 0.85);
        if (!clash) break;
        candidate = makeQuestion(rng, s.type, s.difficulty, s.marks, topicLabel, constraints, key, constraints.gradeBand);
      }
      out.push(candidate);
    }
  }
  return out;
}

function makeQuestion(
  rng: Rng,
  type: QuestionType,
  difficulty: "Easy" | "Medium" | "Hard",
  marks: number,
  topic: string,
  c: CurriculumConstraints,
  key: string,
  band: CurriculumConstraints["gradeBand"]
): GeneratedQuestion {
  const name = pick(rng, NAMES);
  const item = pick(rng, ITEMS);
  const { min, max } = numScope(c);
  const a = randInt(rng, min * 3, Math.max(max, 20));
  const b = randInt(rng, min, Math.max(Math.floor(max / 2), 10));

  // Pre-primary (KG/LKG/UKG): very short, counting-focused questions.
  if (band === "pre-primary") {
    const n = randInt(rng, 3, 12);
    switch (type) {
      case "MCQ": {
        const opts = shuffle(rng, [fmt(n), fmt(n + 1), fmt(n + 2), fmt(Math.max(1, n - 1))]);
        return base(type, difficulty, marks, topic, `${name} has ${n} ${item}. How many ${item}?`, fmt(n), `Count the ${item}: ${n}.`, { options: opts });
      }
      case "Fill in the Blanks":
        return base(type, difficulty, marks, topic, `Write the missing number: ${n}, ${n + 1}, ________, ${n + 3}`, fmt(n + 2), `Count on: ${n}, ${n + 1}, ${n + 2}, ${n + 3}.`);
      case "True/False":
        return base(type, difficulty, marks, topic, `True or False: ${n} is more than ${Math.max(1, n - 2)}.`, "True", `${n} is more than ${Math.max(1, n - 2)} when counting.`, { options: undefined });
      case "Number/Pattern":
        return numberPattern(rng, difficulty, marks, topic, c, key, band);
      case "HOTS":
        return base(type, difficulty, marks, topic, `Which is more: ${n} or ${Math.max(1, n - 3)}? Write the bigger number.`, fmt(n), `Counting on, ${n} comes after ${Math.max(1, n - 3)}, so ${n} is more.`);
      case "Word Problems":
      case "Long Answer":
      case "Case/Activity":
        return base(type, difficulty, marks, topic, `Count and write: ${name} has ${n} ${item}. Write the number. ________`, fmt(n), `Count the ${item} one by one. There are ${n} ${item}.`);
      case "Match the Following": {
        const pairs = [[`${n} ${item}`, fmt(n)], [`${n + 1} ${item}`, fmt(n + 1)], [`${n + 2} ${item}`, fmt(n + 2)]];
        const left = pairs.map((p, i) => `A${i + 1}. ${p[0]}`);
        const right = pairs.map((p, i) => `B${i + 1}. ${p[1]}`);
        const answer = pairs.map((_, i) => `A${i + 1}-B${i + 1}`).join(", ");
        return base(type, difficulty, marks, topic, `Match the count with the number:\nColumn A\n${left.join("\n")}\n\nColumn B\n${right.join("\n")}`, answer, `Count each group of ${item} and match it to the number.`);
      }
      default:
        return base(type, difficulty, marks, topic, `Count the ${item}. How many? ________`, fmt(n), `There are ${n} ${item}.`);
    }
  }

  // Topic-aware quadratics (secondary+): on-topic questions with answers
  // computed from chosen integer roots via Vieta's formulas.
  // (Pre-primary already returned above.)
  if (key === "quadratics") {
    return quadraticQuestion(rng, type, difficulty, marks, topic);
  }

  switch (type) {
    case "MCQ": {
      const answer = a * b;
      const cand = [answer, answer + b, answer > b ? answer - b : answer + 2 * b, answer + a];
      const uniq: number[] = [];
      for (const v of cand) if (!uniq.includes(v)) uniq.push(v);
      let pad = 11;
      while (uniq.length < 4) { if (!uniq.includes(pad)) uniq.push(pad); pad += 6; }
      const opts = shuffle(rng, uniq.slice(0, 4).map(fmt));
      return base(type, difficulty, marks, topic, `What is ${a} × ${b}?`, fmt(answer), `${a} × ${b} = ${answer}.`, { options: opts });
    }
    case "Fill in the Blanks": {
      const hi = Math.max(a, b), lo = Math.min(a, b);
      return base(type, difficulty, marks, topic, `Fill in the blank: ${hi} - ${lo} = ________`, fmt(hi - lo), `${hi} - ${lo} = ${hi - lo}.`);
    }
    case "True/False": {
      const truth = rng() > 0.5;
      const x = randInt(rng, 10, 99), y = randInt(rng, 2, 9);
      const claimed = truth ? x * y : x * y + y;
      return base(type, difficulty, marks, topic, `State whether True or False: ${x} × ${y} = ${claimed}`, truth ? "True" : "False", `${x} × ${y} = ${x * y}. The statement claims ${claimed}, which is ${truth ? "correct" : "incorrect"}.`);
    }
    case "Match the Following": {
      const pairs = [[`${a} + ${b}`, fmt(a + b)], [`${a} × ${b}`, fmt(a * b)], [`${a} - ${b > a ? 1 : b}`, fmt(a - (b > a ? 1 : b))], [`${a} + ${b} + 1`, fmt(a + b + 1)]];
      const left = pairs.map((p, i) => `A${i + 1}. ${p[0]}`);
      const right = pairs.map((p, i) => `B${i + 1}. ${p[1]}`);
      const answer = pairs.map((_, i) => `A${i + 1}-B${i + 1}`).join(", ");
      return base(type, difficulty, marks, topic, `Match the following:\nColumn A\n${left.join("\n")}\n\nColumn B\n${right.join("\n")}`, answer, `Compute each expression in Column A: ${pairs.map((p) => `${p[0]} = ${p[1]}`).join("; ")}.`);
    }
    case "Number/Pattern":
      return numberPattern(rng, difficulty, marks, topic, c, key, band);
    case "Short Answer":
      return base(type, difficulty, marks, topic, `${name} has ${a} ${item} and gets ${b} more. How many ${item} does ${name} have now?`, fmt(a + b), `Total = ${a} + ${b} = ${a + b} ${item}.`);
    case "Long Answer": {
      const price = randInt(rng, 15, 90), qty = randInt(rng, 3, 12);
      const cost = price * qty, given = Math.ceil(cost / 100) * 100;
      return base(type, difficulty, marks, topic, `${name} buys ${qty} notebooks costing ₹${price} each and gives the shopkeeper ₹${given}. Show all steps to find the change received.`, `₹${given - cost}`, `Cost = ${qty} × ₹${price} = ₹${cost}. Change = ₹${given} - ₹${cost} = ₹${given - cost}.`);
    }
    case "Word Problems": {
      const rate = randInt(rng, 20, 60), time = randInt(rng, 3, 8);
      return base(type, difficulty, marks, topic, `A train travels at ${rate} km per hour for ${time} hours. What distance does it cover?`, `${rate * time} km`, `Distance = speed × time = ${rate} × ${time} = ${rate * time} km.`);
    }
    case "Logical Reasoning": {
      const start = randInt(rng, 2, 9), r = randInt(rng, 2, 3);
      const seq = [start, start * r, start * r * r, start * r * r * r];
      const ans = start * r * r * r * r;
      return base(type, difficulty, marks, topic, `Find the next number in the pattern: ${seq.join(", ")}, ________`, fmt(ans), `Each number is multiplied by ${r}: ${seq[3]} × ${r} = ${ans}.`);
    }
    case "HOTS": {
      const q = randInt(rng, 2, 5), n = randInt(rng, 12, 60), p = n * q;
      return base(type, difficulty, marks, topic, `${name} thinks of a number, multiplies it by ${q} and gets ${p}. What is the number, and how do you know?`, fmt(n), `If n × ${q} = ${p}, then n = ${p} ÷ ${q} = ${n}. Check: ${n} × ${q} = ${p}.`);
    }
    case "Case/Activity": {
      const boxes = randInt(rng, 2, 5), each = randInt(rng, 6, 12);
      return base(type, difficulty, marks, topic, `Activity: ${name} packs ${boxes} boxes with ${each} ${item} in each box. (a) Write the total number of ${item} as a multiplication. (b) Find the total.`, `(a) ${boxes} × ${each} (b) ${boxes * each}`, `(a) ${boxes} boxes × ${each} ${item} each = ${boxes} × ${each}. (b) ${boxes} × ${each} = ${boxes * each} ${item}.`);
    }
    default: {
      const n = randInt(rng, 10, 999);
      return base(type, difficulty, marks, topic, `Write the number that is 10 more than ${n}.`, fmt(n + 10), `${n} + 10 = ${n + 10}.`);
    }
  }
}

function numberPattern(
  rng: Rng,
  difficulty: "Easy" | "Medium" | "Hard",
  marks: number,
  topic: string,
  c: CurriculumConstraints,
  key: string,
  band: CurriculumConstraints["gradeBand"]
): GeneratedQuestion {
  if (band === "pre-primary") {
    const start = randInt(rng, 1, 5);
    return base("Number/Pattern", difficulty, marks, topic, `What comes next? ${start}, ${start + 1}, ${start + 2}, ${start + 3}, ________`, fmt(start + 4), `The numbers increase by 1 each time, so the next number is ${start + 4}.`);
  }
  const { min, max } = numScope(c);
  switch (key) {
    case "multiplication": {
      const x = randInt(rng, 6, 19), y = randInt(rng, 4, 12);
      return base("Number/Pattern", difficulty, marks, topic, `Find the product: ${x} × ${y} = ________`, fmt(x * y), `${x} × ${y} = ${x * y}. Multiply ${x} by ${y} (${x} × ${y - 1} + ${x} = ${x * y}).`);
    }
    case "fractions": {
      const den = randInt(rng, 4, 12), n1 = randInt(rng, 1, den - 2), n2 = randInt(rng, 1, den - 2);
      return base("Number/Pattern", difficulty, marks, topic, `Add the fractions: ${n1}/${den} + ${n2}/${den} = ________ (write in simplest form)`, `${n1 + n2}/${den}`, `${n1}/${den} + ${n2}/${den} = ${n1 + n2}/${den}. The denominators are equal, so add the numerators.`);
    }
    case "percentages": {
      const pct = pick(rng, [10, 15, 20, 25, 40, 50]);
      const amt = randInt(rng, 2, 40) * 50;
      return base("Number/Pattern", difficulty, marks, topic, `Find ${pct}% of ₹${amt.toLocaleString("en-IN")}`, fmt((amt * pct) / 100), `${pct}% of ${amt} = (${pct}/100) × ${amt} = ${(amt * pct) / 100}.`);
    }
    default: {
      const x = randInt(rng, Math.max(min, 11), Math.max(max, 100)), y = randInt(rng, min, Math.max(Math.floor(max / 2), 9));
      return base("Number/Pattern", difficulty, marks, topic, `Add: ${x} + ${y} = ________`, fmt(x + y), `${x} + ${y} = ${x + y}. Add the ones first, then the tens (carrying where needed).`);
    }
  }
}

function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface FallbackSpec {
  type: QuestionType;
  count: number;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
}

/**
 * On-topic questions for "Quadratic Equations" computed from integer roots
 * r1, r2 via Vieta's formulas (sum = s, product = p); every answer is
 * derived, never asserted.
 */
function quadraticQuestion(
  rng: Rng,
  type: QuestionType,
  difficulty: "Easy" | "Medium" | "Hard",
  marks: number,
  topic: string
): GeneratedQuestion {
  const r1 = randInt(rng, 2, 9);
  const r2 = randInt(rng, -9, 9);
  const s = r1 + r2;
  const p = r1 * r2;
  const coeffS = s < 0 ? `+ ${-s}` : `- ${s}`;
  const coeffP = p < 0 ? `- ${-p}` : `+ ${p}`;
  const equation = `x² ${coeffS}x ${coeffP} = 0`;

  switch (type) {
    case "MCQ": {
      const cand = [r2, r1, -r1, r1 + 9, r2 + 4];
      const uniq: number[] = [];
      for (const v of cand) if (!uniq.includes(v)) uniq.push(v);
      let k = 13;
      while (uniq.length < 4) { if (!uniq.includes(k)) uniq.push(k); k += 7; }
      const opts = shuffle(rng, uniq.slice(0, 4).map(fmt));
      // Alternate phrasings so two MCQs on the same topic stay distinct.
      const phrasing = randInt(rng, 0, 2);
      const qText = phrasing === 0
        ? `If one root of ${equation} is ${r1}, what is the other root?`
        : phrasing === 1
          ? `Given that ${r1} is a root of ${equation}, find the second root.`
          : `The equation ${equation} has ${r1} as one of its roots. Calculate the remaining root.`;
      return base(type, difficulty, marks, topic,
        qText,
        fmt(r2),
        `Sum of roots = -b/a = ${s}, so the other root = ${s} - ${r1} = ${r2}.`,
        { options: opts });
    }
    case "Fill in the Blanks":
      return base(type, difficulty, marks, topic,
        `Fill the blank: the sum of the roots of ${equation} is ________.`,
        fmt(s),
        `Here a = 1 and b = ${-s}, so sum of roots = -b/a = ${s}.`);
    case "True/False": {
      const claim = rng() > 0.5;
      const val = claim ? p : p + 1;
      return base(type, difficulty, marks, topic,
        `True or False: ${val} is the product of the roots of ${equation}.`,
        claim ? "True" : "False",
        `Product of roots = constant term = ${p}; the statement claims ${val}, which is ${claim ? "correct" : "incorrect"}.`);
    }
    case "Number/Pattern":
      return base(type, difficulty, marks, topic,
        `Find the discriminant (b² - 4ac) of ${equation}.`,
        fmt(s * s - 4 * p),
        `a = 1, b = ${-s}, c = ${p}; D = (${-s})² - 4(1)(${p}) = ${s * s} - ${4 * p} = ${s * s - 4 * p}.`);
    case "Short Answer": {
      // Alternate phrasings so two Short-Answer questions on the same topic
      // don't exceed the duplicate-detection threshold.
      const phrasing = randInt(rng, 0, 2);
      if (phrasing === 0) {
        return base(type, difficulty, marks, topic,
          `Write the quadratic equation whose roots are ${r1} and ${r2} (in the form x² - (sum)x + (product) = 0).`,
          `x² ${coeffS}x ${coeffP} = 0`,
          `Sum = ${r1} + ${r2} = ${s}; product = ${r1} × ${r2} = ${p}; so the equation is x² - (${s})x + (${p}) = 0, i.e. ${equation}.`);
      } else if (phrasing === 1) {
        return base(type, difficulty, marks, topic,
          `Given that ${r1} and ${r2} are the two roots, form the corresponding quadratic equation and write it in standard form.`,
          `x² ${coeffS}x ${coeffP} = 0`,
          `Using Vieta's formulas: sum of roots = ${s}, product = ${p}. The required equation is x² - (${s})x + (${p}) = 0 = ${equation}.`);
      } else {
        return base(type, difficulty, marks, topic,
          `A quadratic equation has ${r1} and ${r2} as its zeros. Determine the equation in the form x² + bx + c = 0.`,
          `x² ${coeffS}x ${coeffP} = 0`,
          `Zeros sum to ${s} and multiply to ${p}. Hence b = ${-s} and c = ${p}, giving ${equation}.`);
      }
    }
    case "Long Answer":
      return base(type, difficulty, marks, topic,
        `One root of ${equation} is ${r1}. Use the sum of roots to find the other root, then verify by factorisation.`,
        fmt(r2),
        `Let the other root be α. Sum of roots = -b/a = ${s}, so α = ${s} - ${r1} = ${r2}. Check: x² ${coeffS}x ${coeffP} factors but divided by (x - ${r1})(x - ${r2})? (x - ${r1})(x - ${r2}) = x² - (${r1} + ${r2})x + ${r1}${r2} = ${equation}.`);
    case "Word Problems":
      return base(type, difficulty, marks, topic,
        `The sum of two positive integers is ${s} and their product is ${p}. Find the two integers.`,
        `${Math.min(r1, r2)} and ${Math.max(r1, r2)}`,
        `The integers are the roots of x² - (sum)x + (product) = 0 = ${equation}, which factors as (x - ${r1})(x - ${r2}), so the integers are ${r1} and ${r2}.`);
    case "Logical Reasoning":
      return base(type, difficulty, marks, topic,
        `A quadratic equation has roots ${r1} and ${r2}. What is the value of (sum of roots) + (product of roots)?`,
        fmt(s + p),
        `Sum + product = ${s} + ${p} = ${s + p}.`);
    case "HOTS":
      return base(type, difficulty, marks, topic,
        `${pick(rng, ["Aarav", "Priya", "Divya"])} says: "The equation ${equation} has both roots positive." Is the statement correct? Justify using the sum and product of roots.`,
        r1 > 0 && r2 > 0 ? "Yes" : "No",
        `Sum of roots = ${s}, product = ${p}. ${r1 > 0 && r2 > 0
          ? `Since the roots are ${r1} and ${r2} (both positive), the statement is correct.`
          : `Since one root is ${r2} (not positive), the statement is incorrect.`}`);
    case "Case/Activity": {
      const area = Math.abs(2 * p);
      return base(type, difficulty, marks, topic,
        `Activity: A rectangle has length ${r1} m more than twice its breadth. Its area is ${area} m². Form a quadratic equation for the breadth x and solve.`,
        `(a) 2x² + ${2 * r1}x + ${r1 * r1} = ${area} simplified to x² ${coeffS}x ${coeffP} = 0 (b) x = ${Math.min(r1, r2)} m or ${Math.max(r1, r2)} m`,
        `Let breadth = x m; length = (2x + ${r1}) m; area = 2x² + ${2 * r1}x = ${area} → divide by 2: x² + ${r1}x - ${area / 2} = 0 → equivalent to ${equation}, roots ${r1} and ${r2} (positive one is valid).`);
    }
    default: {
      const n = randInt(rng, 2, 9), q = randInt(rng, 2, 5);
      return base(type, difficulty, marks, topic,
        `Solve the equation x² + ${n + q}x + ${n * q} = 0 and write both roots.`,
        `${-n} and ${-q}`,
        `x² + (${n + q})x + ${n * q} = (x + ${n})(x + ${q}) = 0, so x = ${-n} or x = ${-q}.`);
    }
  }
}
