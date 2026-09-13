var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "mathperfect.json");
var INITIAL_QUESTIONS = [
  {
    id: "qb-1",
    topic: "Algebra",
    subtopic: "Quadratic Equations",
    grade: "Grade 10",
    difficulty: "Medium",
    type: "mcq",
    question: "Solve for x: 2x\xB2 - 7x + 3 = 0",
    options: ["x = 3 or x = 1/2", "x = -3 or x = -1/2", "x = 3 or x = -1/2", "x = 2 or x = 3/2"],
    answer: "x = 3 or x = 1/2",
    explanation: "Using the quadratic formula x = (-b \xB1 \u221A(b\xB2 - 4ac)) / (2a): a = 2, b = -7, c = 3. Discriminant \u0394 = (-7)\xB2 - 4(2)(3) = 49 - 24 = 25. Thus x = (7 \xB1 5)/4 => x = 12/4 = 3 or x = 2/4 = 1/2.",
    hint: "Calculate the discriminant \u0394 = b\xB2 - 4ac first.",
    tags: ["Quadratic Formula", "Factoring", "Polynomials"]
  },
  {
    id: "qb-2",
    topic: "Calculus",
    subtopic: "Differentiation",
    grade: "Grade 12",
    difficulty: "Medium",
    type: "short-answer",
    question: "Find the derivative of f(x) = x\xB3 \xB7 e^(2x) with respect to x.",
    answer: "f'(x) = e^(2x) \xB7 (2x\xB3 + 3x\xB2)",
    explanation: "Apply the Product Rule: (u \xB7 v)' = u'v + uv'. Here u = x\xB3, so u' = 3x\xB2; v = e^(2x), so v' = 2e^(2x) (by chain rule). Therefore f'(x) = 3x\xB2 \xB7 e^(2x) + x\xB3 \xB7 2e^(2x) = e^(2x)(2x\xB3 + 3x\xB2).",
    hint: "Use the product rule along with the chain rule for e^(2x).",
    tags: ["Product Rule", "Chain Rule", "Exponentials"]
  },
  {
    id: "qb-3",
    topic: "Geometry",
    subtopic: "Pythagorean Theorem & Circles",
    grade: "Grade 9",
    difficulty: "Easy",
    type: "mcq",
    question: "A right-angled triangle has a base of 8 cm and an altitude of 15 cm. What is the length of the hypotenuse?",
    options: ["17 cm", "16 cm", "19 cm", "23 cm"],
    answer: "17 cm",
    explanation: "By the Pythagorean theorem: c\xB2 = a\xB2 + b\xB2 = 8\xB2 + 15\xB2 = 64 + 225 = 289. Since \u221A289 = 17, the hypotenuse is 17 cm.",
    hint: "Recall the Pythagorean triplet: 8, 15, 17.",
    tags: ["Right Triangles", "Pythagorean Triplet", "Lengths"]
  },
  {
    id: "qb-4",
    topic: "Trigonometry",
    subtopic: "Identities",
    grade: "Grade 11",
    difficulty: "Hard",
    type: "proof",
    question: "Prove that (sin \u03B8 + cos \u03B8)\xB2 = 1 + sin 2\u03B8 for all real values of \u03B8.",
    answer: "LHS = sin\xB2 \u03B8 + 2 sin \u03B8 cos \u03B8 + cos\xB2 \u03B8 = (sin\xB2 \u03B8 + cos\xB2 \u03B8) + 2 sin \u03B8 cos \u03B8 = 1 + sin 2\u03B8 = RHS.",
    explanation: "Expanding the left hand side: (sin \u03B8 + cos \u03B8)\xB2 = sin\xB2 \u03B8 + 2 sin \u03B8 cos \u03B8 + cos\xB2 \u03B8. Using the Pythagorean identity sin\xB2 \u03B8 + cos\xB2 \u03B8 = 1, and the double angle formula sin 2\u03B8 = 2 sin \u03B8 cos \u03B8, we arrive at 1 + sin 2\u03B8.",
    hint: "Expand the squared binomial and apply fundamental identities.",
    tags: ["Trig Identity", "Double Angle", "Proofs"]
  },
  {
    id: "qb-5",
    topic: "Statistics",
    subtopic: "Probability & Distributions",
    grade: "Grade 11",
    difficulty: "Medium",
    type: "short-answer",
    question: "A fair six-sided die is rolled twice. What is the probability of getting a sum strictly greater than 9?",
    answer: "1/6 (or approx 16.67%)",
    explanation: "Total outcomes = 6 \xD7 6 = 36. Favorable outcomes where sum > 9 (i.e. sum = 10, 11, or 12): Sum 10: (4,6), (5,5), (6,4) [3 outcomes]; Sum 11: (5,6), (6,5) [2 outcomes]; Sum 12: (6,6) [1 outcome]. Total favorable = 3 + 2 + 1 = 6. Probability = 6/36 = 1/6.",
    hint: "List pairs that produce sums of 10, 11, and 12.",
    tags: ["Probability", "Combinatorics", "Dice"]
  },
  {
    id: "qb-6",
    topic: "Number Theory",
    subtopic: "Prime Factorization & Modular Arithmetic",
    grade: "Grade 8",
    difficulty: "Easy",
    type: "mcq",
    question: "What is the greatest common divisor (GCD) of 84 and 180?",
    options: ["12", "6", "14", "24"],
    answer: "12",
    explanation: "Prime factorizations: 84 = 2\xB2 \xD7 3 \xD7 7; 180 = 2\xB2 \xD7 3\xB2 \xD7 5. Common factors: 2\xB2 \xD7 3 = 4 \xD7 3 = 12.",
    hint: "Find the lowest common powers of each shared prime factor.",
    tags: ["GCD", "LCM", "Prime Factors"]
  },
  {
    id: "qb-7",
    topic: "Algebra",
    subtopic: "Systems of Linear Equations",
    grade: "Grade 9",
    difficulty: "Medium",
    type: "short-answer",
    question: "Solve the system: 3x + 2y = 19 and 2x - y = 8.",
    answer: "x = 5, y = 2",
    explanation: "From equation 2: y = 2x - 8. Substitute into equation 1: 3x + 2(2x - 8) = 19 => 3x + 4x - 16 = 19 => 7x = 35 => x = 5. Then y = 2(5) - 8 = 2.",
    hint: "Express y in terms of x using the second equation, then substitute.",
    tags: ["Linear Systems", "Substitution", "Elimination"]
  },
  {
    id: "qb-8",
    topic: "Calculus",
    subtopic: "Integration",
    grade: "Grade 12",
    difficulty: "Hard",
    type: "extended",
    question: "Evaluate the definite integral: \u222B from 0 to 2 of (3x\xB2 - 4x + 1) dx.",
    answer: "2",
    explanation: "Find the antiderivative: F(x) = \u222B(3x\xB2 - 4x + 1)dx = x\xB3 - 2x\xB2 + x. Evaluate from 0 to 2: F(2) = 2\xB3 - 2(2\xB2) + 2 = 8 - 8 + 2 = 2. F(0) = 0. Therefore, the integral equals 2 - 0 = 2.",
    hint: "Apply the power rule of integration: \u222B x^n dx = (x^(n+1))/(n+1).",
    tags: ["Definite Integrals", "Fundamental Theorem", "Polynomials"]
  }
];
var INITIAL_WORKSHEETS = [
  {
    id: "ws-sample-1",
    title: "Mastering Quadratic Equations & Factorization",
    topic: "Quadratic Equations",
    grade: "Grade 10",
    difficulty: "Standard",
    questionType: "mixed",
    questionCount: 5,
    schoolName: "MATH PERFECT Academy",
    instructions: "Answer all questions. Show all working steps clearly. Calculators are permitted unless specified.",
    questions: [
      {
        id: 1,
        question: "Solve by factoring: x\xB2 - 9x + 20 = 0",
        correctAnswer: "x = 4 or x = 5",
        solution: "Find two numbers that multiply to 20 and add to -9: (-4) and (-5). (x - 4)(x - 5) = 0 => x = 4 or x = 5.",
        hint: "Identify factors of 20 that sum up to -9.",
        marks: 3
      },
      {
        id: 2,
        question: "What is the nature of the roots of 3x\xB2 + 5x + 4 = 0?",
        options: ["Two distinct real roots", "Two equal real roots", "Complex/non-real conjugate roots", "Infinitely many roots"],
        correctAnswer: "Complex/non-real conjugate roots",
        solution: "Compute discriminant \u0394 = b\xB2 - 4ac = 5\xB2 - 4(3)(4) = 25 - 48 = -23. Since \u0394 < 0, roots are complex conjugates.",
        hint: "Use the discriminant sign: \u0394 > 0 (real distinct), \u0394 = 0 (equal), \u0394 < 0 (complex).",
        marks: 2
      },
      {
        id: 3,
        question: "Find the vertex and line of symmetry of the parabola y = 2x\xB2 - 8x + 5.",
        correctAnswer: "Vertex: (2, -3); Axis of symmetry: x = 2",
        solution: "x-coordinate of vertex = -b/(2a) = -(-8)/(2 \xD7 2) = 8/4 = 2. Substitute into equation: y = 2(2)\xB2 - 8(2) + 5 = 8 - 16 + 5 = -3. Vertex is (2, -3), line of symmetry is x = 2.",
        hint: "Use the formula x = -b/(2a).",
        marks: 4
      },
      {
        id: 4,
        question: "A projectile is launched from ground level with height h(t) = -5t\xB2 + 30t meters after t seconds. At what time does it reach maximum height and what is the maximum height?",
        correctAnswer: "Max height at t = 3 seconds; Max height = 45 meters",
        solution: "Peak occurs at vertex t = -b/(2a) = -30/(2 \xD7 -5) = 3 seconds. Height at t = 3: h(3) = -5(9) + 30(3) = -45 + 90 = 45 meters.",
        hint: "The vertex of a downward-opening parabola gives the maximum.",
        marks: 5
      },
      {
        id: 5,
        question: "Solve 2x\xB2 + 4x - 6 = 0 using the quadratic formula.",
        options: ["x = 1 or x = -3", "x = -1 or x = 3", "x = 2 or x = -6", "x = 1/2 or x = -3/2"],
        correctAnswer: "x = 1 or x = -3",
        solution: "Divide entire equation by 2: x\xB2 + 2x - 3 = 0. \u0394 = 2\xB2 - 4(1)(-3) = 4 + 12 = 16. x = (-2 \xB1 4)/2 => x = 2/2 = 1 or x = -6/2 = -3.",
        hint: "Simplify coefficients by dividing by common factor first.",
        marks: 3
      }
    ],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: "System Curriculum Specialist"
  }
];
var INITIAL_EXAM_PAPERS = [
  {
    id: "exam-1",
    title: "Senior Secondary Mathematics Term Examination",
    grade: "Grade 10 / High School",
    subject: "Pure & Applied Mathematics",
    totalMarks: 80,
    timeMinutes: 180,
    instructions: [
      "This question paper consists of 3 Sections: Section A (MCQs - 20 marks), Section B (Short Answer - 30 marks), and Section C (Long Answer - 30 marks).",
      "All questions are compulsory. Internal choice is provided in certain sections.",
      "Use of non-programmable scientific calculators is permitted.",
      "Write legible step-by-step solutions with appropriate units."
    ],
    sections: [
      {
        name: "Section A: Foundational Knowledge & Concepts (20 Marks)",
        description: "Multiple choice questions assessing core definitions and fundamental principles.",
        questions: [
          {
            id: 1,
            question: "If the discriminant of ax\xB2 + bx + c = 0 is zero, the roots are:",
            options: ["Real and distinct", "Real and equal", "Non-real", "Rational only"],
            marks: 1,
            solution: "Real and equal. When \u0394 = b\xB2 - 4ac = 0, both roots equal -b/(2a).",
            markingScheme: ["Correct option identified: 1 mark"]
          },
          {
            id: 2,
            question: "The distance between the points (2, 3) and (10, 9) is:",
            options: ["10 units", "14 units", "12 units", "8 units"],
            marks: 1,
            solution: "Distance = \u221A((10-2)\xB2 + (9-3)\xB2) = \u221A(64 + 36) = \u221A100 = 10 units.",
            markingScheme: ["Correct distance calculation: 1 mark"]
          }
        ]
      },
      {
        name: "Section B: Mathematical Modeling & Calculations (30 Marks)",
        description: "Short answer questions testing procedural fluency and multi-step reasoning.",
        questions: [
          {
            id: 3,
            question: "Solve for x and y: 4x + 3y = 25 and x - 2y = -2.",
            marks: 3,
            solution: "From second equation, x = 2y - 2. Substitute: 4(2y - 2) + 3y = 25 => 8y - 8 + 3y = 25 => 11y = 33 => y = 3. Then x = 2(3) - 2 = 4. Solution: (4, 3).",
            markingScheme: [
              "Substitution or elimination formulation: 1 mark",
              "Correct determination of y: 1 mark",
              "Correct determination of x: 1 mark"
            ]
          }
        ]
      },
      {
        name: "Section C: Extended Reasoning & Problem Solving (30 Marks)",
        description: "High-order analytical proofs and multi-variable applications.",
        questions: [
          {
            id: 4,
            question: "Prove that the tangents drawn from an external point to a circle are equal in length. Include a labeled geometric diagram description.",
            marks: 5,
            solution: "Let P be an external point to circle with center O. Tangents touch circle at A and B. Consider triangles OPA and OPB. OA = OB (radii). OP = OP (common hypotenuse). \u2220OAP = \u2220OBP = 90\xB0 (radius is perpendicular to tangent). By RHS congruence criterion, \u0394OPA \u2245 \u0394OPB. Therefore PA = PB by CPCTC.",
            markingScheme: [
              "Clear diagram description and Given/To Prove statements: 1 mark",
              "Perpendicularity of radius and tangent cited: 1 mark",
              "Hypotenuse-Leg (RHS) congruence justification: 2 marks",
              "Conclusion PA = PB: 1 mark"
            ]
          }
        ]
      }
    ],
    guessAnalysis: {
      trendingTopics: [
        "Quadratic modeling and projectile trajectory",
        "Coordinate geometry distance and section formula",
        "Circle theorems (tangent lengths & alternate segment theorem)",
        "Trigonometric heights & distances applications",
        "Surface areas and volumes of composite solids"
      ],
      highProbabilityTopics: [
        { topic: "Quadratic Equations (Discriminant & Word Problems)", weight: 14, rationale: "Appeared consistently in 98% of past 5 years board and national assessments." },
        { topic: "Circles & Tangents Proofs", weight: 12, rationale: "Standard Section C mandatory theorem verification requirement." },
        { topic: "Trigonometric Identities & Elevations", weight: 15, rationale: "High weightage real-world elevation and depression multi-step question." },
        { topic: "Linear Equations in Two Variables", weight: 10, rationale: "Consistently forms core of Section B analytical marks." }
      ],
      examStrategy: [
        "Spend first 10 minutes skimming questions and categorizing Section A vs Section C priorities.",
        "Always write explicit formulas and specify units in final answers.",
        "For geometric proofs, draw and label the diagram clearly before writing deductive steps.",
        "Reserve 15 minutes at the end for algebraic sign checking."
      ]
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
function initDatabase() {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (import_fs.default.existsSync(DB_FILE)) {
      const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file, initializing default:", err);
  }
  const initialData = {
    worksheets: INITIAL_WORKSHEETS,
    questionBank: INITIAL_QUESTIONS,
    examPapers: INITIAL_EXAM_PAPERS,
    savedSimulationsState: {}
  };
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing initial database file:", err);
  }
  return initialData;
}
var dbCache = initDatabase();
function saveDatabase() {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}
var db = {
  getWorksheets() {
    return dbCache.worksheets;
  },
  getWorksheetById(id) {
    return dbCache.worksheets.find((w) => w.id === id);
  },
  saveWorksheet(worksheet) {
    const existingIndex = dbCache.worksheets.findIndex((w) => w.id === worksheet.id);
    if (existingIndex >= 0) {
      dbCache.worksheets[existingIndex] = worksheet;
    } else {
      dbCache.worksheets.unshift(worksheet);
    }
    saveDatabase();
    return worksheet;
  },
  deleteWorksheet(id) {
    const initialLen = dbCache.worksheets.length;
    dbCache.worksheets = dbCache.worksheets.filter((w) => w.id !== id);
    if (dbCache.worksheets.length !== initialLen) {
      saveDatabase();
      return true;
    }
    return false;
  },
  getQuestionBank(filters) {
    let items = dbCache.questionBank;
    if (!filters) return items;
    if (filters.topic && filters.topic !== "All") {
      items = items.filter((q) => q.topic.toLowerCase() === filters.topic.toLowerCase());
    }
    if (filters.grade && filters.grade !== "All") {
      items = items.filter((q) => q.grade.toLowerCase().includes(filters.grade.toLowerCase()));
    }
    if (filters.difficulty && filters.difficulty !== "All") {
      items = items.filter((q) => q.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
    }
    if (filters.type && filters.type !== "All") {
      items = items.filter((q) => q.type.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.search) {
      const qLower = filters.search.toLowerCase();
      items = items.filter(
        (q) => q.question.toLowerCase().includes(qLower) || q.explanation.toLowerCase().includes(qLower) || q.tags.some((t) => t.toLowerCase().includes(qLower))
      );
    }
    return items;
  },
  addQuestion(question) {
    dbCache.questionBank.unshift(question);
    saveDatabase();
    return question;
  },
  getExamPapers() {
    return dbCache.examPapers;
  },
  getExamPaperById(id) {
    return dbCache.examPapers.find((e) => e.id === id);
  },
  saveExamPaper(examPaper) {
    const idx = dbCache.examPapers.findIndex((e) => e.id === examPaper.id);
    if (idx >= 0) {
      dbCache.examPapers[idx] = examPaper;
    } else {
      dbCache.examPapers.unshift(examPaper);
    }
    saveDatabase();
    return examPaper;
  }
};

// server/gemini.ts
var import_genai = require("@google/genai");
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      },
      timeout: 15e3
    }
  });
}
function generateAlgorithmicQuestions(params) {
  const count = Math.min(Math.max(params.questionCount || 5, 1), 20);
  const questions = [];
  const topicLower = params.topic.toLowerCase();
  for (let i = 1; i <= count; i++) {
    if (topicLower.includes("quadratic") || topicLower.includes("algebra") && !topicLower.includes("linear")) {
      const r1 = i % 5 + 1;
      const r2 = i % 4 + 2;
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bStr = b < 0 ? `- ${Math.abs(b)}x` : `+ ${b}x`;
      const cStr = c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`;
      if (params.questionType === "multiple-choice" || params.questionType === "mixed" && i % 2 === 1) {
        questions.push({
          id: i,
          question: `Find the real roots of the quadratic equation: x\xB2 ${bStr} ${cStr} = 0`,
          options: [
            `x = ${r1} or x = ${r2}`,
            `x = -${r1} or x = -${r2}`,
            `x = ${r1 + 1} or x = ${r2 - 1}`,
            `x = ${r1 * 2} or x = ${r2}`
          ],
          correctAnswer: `x = ${r1} or x = ${r2}`,
          solution: `Factoring the quadratic polynomial: (x - ${r1})(x - ${r2}) = 0. Setting each linear factor to zero yields roots x = ${r1} and x = ${r2}.`,
          hint: `Find two integers that multiply to give ${c} and sum to give ${b}.`,
          marks: 3
        });
      } else {
        questions.push({
          id: i,
          question: `Solve for x by factoring or by quadratic formula: x\xB2 ${bStr} ${cStr} = 0. Detail all steps.`,
          correctAnswer: `x = ${r1} or x = ${r2}`,
          solution: `Using the quadratic formula: a = 1, b = ${b}, c = ${c}. Discriminant \u0394 = b\xB2 - 4ac = (${b})\xB2 - 4(1)(${c}) = ${b * b - 4 * c}. Thus x = (-(${b}) \xB1 \u221A(${b * b - 4 * c})) / 2 = ${r1} or ${r2}.`,
          hint: `Compute the discriminant \u0394 = b\xB2 - 4ac first to verify real roots.`,
          marks: 4
        });
      }
    } else if (topicLower.includes("linear") || topicLower.includes("system") || topicLower.includes("simultaneous")) {
      const xVal = i + 1;
      const yVal = i % 3 + 2;
      const a1 = 2;
      const b1 = 3;
      const c1 = a1 * xVal + b1 * yVal;
      const a2 = 3;
      const b2 = -1;
      const c2 = a2 * xVal + b2 * yVal;
      questions.push({
        id: i,
        question: `Solve the simultaneous system of linear equations:
(1) ${a1}x + ${b1}y = ${c1}
(2) ${a2}x ${b2 < 0 ? `- ${Math.abs(b2)}` : `+ ${b2}`}y = ${c2}`,
        options: params.questionType === "multiple-choice" ? [
          `x = ${xVal}, y = ${yVal}`,
          `x = ${xVal + 1}, y = ${yVal - 1}`,
          `x = ${-xVal}, y = ${yVal}`,
          `x = ${xVal * 2}, y = ${yVal + 2}`
        ] : void 0,
        correctAnswer: `x = ${xVal}, y = ${yVal}`,
        solution: `From equation (2), express y: y = ${a2}x - ${c2}. Substitute into equation (1): ${a1}x + ${b1}(${a2}x - ${c2}) = ${c1} => (${a1} + ${b1 * a2})x - ${b1 * c2} = ${c1} => ${a1 + b1 * a2}x = ${c1 + b1 * c2} => x = ${xVal}. Back-substitute to find y: y = ${a2}(${xVal}) - ${c2} = ${yVal}.`,
        hint: `Use the method of substitution or multiply equation (2) by 3 to eliminate y.`,
        marks: 4
      });
    } else if (topicLower.includes("integral") || topicLower.includes("antiderivative")) {
      const p = i % 3 + 1;
      const coeff = (p + 1) * (i + 1);
      questions.push({
        id: i,
        question: `Evaluate the indefinite integral: \u222B (${coeff}x^${p} - ${2 * i}x + ${i + 3}) dx.`,
        options: params.questionType === "multiple-choice" ? [
          `${coeff / (p + 1)}x^${p + 1} - ${i}x\xB2 + ${i + 3}x + C`,
          `${coeff}x^${p + 1} - ${2 * i}x\xB2 + ${i + 3}x + C`,
          `${coeff / (p + 1)}x^${p} - ${i}x + C`,
          `${coeff * (p + 1)}x^${p + 1} - ${i}x\xB2 + C`
        ] : void 0,
        correctAnswer: `${coeff / (p + 1)}x^${p + 1} - ${i}x\xB2 + ${i + 3}x + C`,
        solution: `Using the power rule of integration \u222B x^n dx = (x^(n+1))/(n+1) + C: \u222B ${coeff}x^${p} dx = (${coeff}/(${p + 1}))x^${p + 1} = ${coeff / (p + 1)}x^${p + 1}. \u222B -${2 * i}x dx = -${i}x\xB2. \u222B ${i + 3} dx = ${i + 3}x. Summing and appending constant of integration yields ${coeff / (p + 1)}x^${p + 1} - ${i}x\xB2 + ${i + 3}x + C.`,
        hint: `Increase the power by 1 and divide by the new power for each term. Remember + C.`,
        marks: 4
      });
    } else if (topicLower.includes("calculus") || topicLower.includes("derivative") || topicLower.includes("differentiat")) {
      const power = i % 4 + 2;
      const coeff = i % 5 + 2;
      const constVal = i % 7 + 1;
      questions.push({
        id: i,
        question: `Determine the first derivative f'(x) of the function f(x) = ${coeff}x^${power} - ${constVal}x\xB2 + ${i * 3}.`,
        options: params.questionType === "multiple-choice" ? [
          `${coeff * power}x^${power - 1} - ${constVal * 2}x`,
          `${coeff * (power - 1)}x^${power} - ${constVal}x`,
          `${coeff * power}x^${power - 1} - ${constVal * 2}`,
          `${coeff}x^${power - 1} - ${constVal * 2}x + ${i * 3}`
        ] : void 0,
        correctAnswer: `${coeff * power}x^${power - 1} - ${constVal * 2}x`,
        solution: `Apply the Power Rule: d/dx [a\xB7x^n] = a\xB7n\xB7x^(n-1). d/dx [${coeff}x^${power}] = ${coeff * power}x^${power - 1}; d/dx [-${constVal}x\xB2] = -${constVal * 2}x; d/dx [${i * 3}] = 0. Combine: f'(x) = ${coeff * power}x^${power - 1} - ${constVal * 2}x.`,
        hint: `Multiply coefficient by exponent and subtract 1 from the power. Derivative of a constant is 0.`,
        marks: 4
      });
    } else if (topicLower.includes("probability") || topicLower.includes("permutation") || topicLower.includes("combinat")) {
      const total = 10 + i;
      const selected = 3;
      const numCombos = total * (total - 1) * (total - 2) / 6;
      questions.push({
        id: i,
        question: `A mathematics study committee of ${selected} students is to be selected from a class of ${total} students. How many distinct committee combinations are possible?`,
        options: params.questionType === "multiple-choice" ? [
          `${numCombos}`,
          `${numCombos + 12}`,
          `${total * selected}`,
          `${numCombos - 15}`
        ] : void 0,
        correctAnswer: `${numCombos}`,
        solution: `Use combination formula C(n, r) = n! / (r! \xB7 (n - r)!): C(${total}, 3) = (${total} \xD7 ${total - 1} \xD7 ${total - 2}) / (3 \xD7 2 \xD7 1) = ${total * (total - 1) * (total - 2)} / 6 = ${numCombos} unique committees.`,
        hint: `Order does not matter in committee selection, so use combination C(n, r), not permutation P(n, r).`,
        marks: 3
      });
    } else if (topicLower.includes("coordinate") || topicLower.includes("distance") || topicLower.includes("slope")) {
      const x1 = i * 2;
      const y1 = i + 1;
      const x2 = x1 + 3;
      const y2 = y1 + 4;
      questions.push({
        id: i,
        question: `Given points A(${x1}, ${y1}) and B(${x2}, ${y2}) in the Cartesian plane, find the exact distance between them and the slope of line AB.`,
        options: params.questionType === "multiple-choice" ? [
          `Distance = 5, Slope = 4/3`,
          `Distance = 7, Slope = 3/4`,
          `Distance = 25, Slope = 4/3`,
          `Distance = 5, Slope = -4/3`
        ] : void 0,
        correctAnswer: `Distance = 5, Slope = 4/3`,
        solution: `Distance d = \u221A((x\u2082 - x\u2081)\xB2 + (y\u2082 - y\u2081)\xB2) = \u221A((3)\xB2 + (4)\xB2) = \u221A(9 + 16) = \u221A25 = 5 units. Slope m = (y\u2082 - y\u2081)/(x\u2082 - x\u2081) = 4/3.`,
        hint: `Use Euclidean distance formula d = \u221A((\u0394x)\xB2 + (\u0394y)\xB2) and slope formula m = \u0394y / \u0394x.`,
        marks: 3
      });
    } else if (topicLower.includes("geometry") || topicLower.includes("pythagor") || topicLower.includes("triangle")) {
      const triplets = [
        { a: 3 * i, b: 4 * i, c: 5 * i },
        { a: 5, b: 12, c: 13 },
        { a: 8, b: 15, c: 17 },
        { a: 7, b: 24, c: 25 },
        { a: 9, b: 40, c: 41 }
      ];
      const t = triplets[(i - 1) % triplets.length];
      questions.push({
        id: i,
        question: `In a right triangle, the two perpendicular legs measure ${t.a} cm and ${t.b} cm. Calculate the exact length of the hypotenuse.`,
        options: params.questionType === "multiple-choice" ? [
          `${t.c} cm`,
          `${t.c + 2} cm`,
          `${t.c - 1} cm`,
          `${t.a + t.b} cm`
        ] : void 0,
        correctAnswer: `${t.c} cm`,
        solution: `According to the Pythagorean theorem: c\xB2 = a\xB2 + b\xB2 = (${t.a})\xB2 + (${t.b})\xB2 = ${t.a * t.a} + ${t.b * t.b} = ${t.c * t.c}. Taking the principal square root gives c = ${t.c} cm.`,
        hint: `Use the formula c = \u221A(a\xB2 + b\xB2).`,
        marks: 3
      });
    } else if (topicLower.includes("trigonometry")) {
      const angles = [30, 45, 60, 90, 0];
      const ang = angles[(i - 1) % angles.length];
      const trigValues = {
        0: { sin: "0", cos: "1", tan: "0" },
        30: { sin: "1/2", cos: "\u221A3/2", tan: "1/\u221A3" },
        45: { sin: "\u221A2/2", cos: "\u221A2/2", tan: "1" },
        60: { sin: "\u221A3/2", cos: "1/2", tan: "\u221A3" },
        90: { sin: "1", cos: "0", tan: "undefined" }
      };
      const v = trigValues[ang];
      questions.push({
        id: i,
        question: `Evaluate the exact value of the trigonometric expression: 2 \xB7 sin(${ang}\xB0) + 4 \xB7 cos(${ang}\xB0).`,
        correctAnswer: `2(${v.sin}) + 4(${v.cos})`,
        solution: `Using exact special angle values: sin(${ang}\xB0) = ${v.sin}, cos(${ang}\xB0) = ${v.cos}. Evaluate: 2(${v.sin}) + 4(${v.cos}).`,
        hint: `Recall unit circle values for special standard angles (0\xB0, 30\xB0, 45\xB0, 60\xB0, 90\xB0).`,
        marks: 3
      });
    } else {
      const num1 = i * 7 + 4;
      const num2 = i * 3 + 2;
      questions.push({
        id: i,
        question: `Simplify the algebraic expression: ${i + 1}(x + ${num2}) - ${i}(x - ${num1}).`,
        options: params.questionType === "multiple-choice" ? [
          `x + ${(i + 1) * num2 + i * num1}`,
          `x - ${(i + 1) * num2 - i * num1}`,
          `${2 * i + 1}x + ${num2}`,
          `${i}x + ${num1}`
        ] : void 0,
        correctAnswer: `x + ${(i + 1) * num2 + i * num1}`,
        solution: `Distribute terms: (${i + 1}x + ${(i + 1) * num2}) - (${i}x - ${i * num1}) = ${i + 1}x - ${i}x + ${(i + 1) * num2} + ${i * num1} = x + ${(i + 1) * num2 + i * num1}.`,
        hint: `Distribute the constants carefully, remembering that negative times negative is positive.`,
        marks: 3
      });
    }
  }
  return questions;
}
async function generateWorksheetAI(params) {
  const client = getGeminiClient();
  if (!client) {
    console.log("[Curriculum Generator] Gemini API key unconfigured. Using built-in curriculum engine.");
    return generateAlgorithmicQuestions(params);
  }
  const prompt = `You are a distinguished mathematics educator at MATH PERFECT.
Create an academic worksheet of ${params.questionCount} rigorous mathematics problems.
Topic: ${params.topic}
Grade/Level: ${params.grade}
Difficulty: ${params.difficulty}
Question Type: ${params.questionType}
Custom Instructions: ${params.customInstructions || "Standard curriculum-aligned mathematical questions."}

Return a JSON array where each object has:
- id: integer (1 to ${params.questionCount})
- question: clear mathematical problem text (use standard formatting or clean LaTeX notation)
- options: array of 4 distinct choices if questionType is multiple-choice or mixed (optional)
- correctAnswer: the precise correct answer
- solution: comprehensive step-by-step mathematical derivation/explanation
- hint: a pedagogical clue that guides understanding without giving away the answer
- marks: integer point value (e.g. 2, 3, 4, or 5)`;
  const responseSchema = {
    type: import_genai.Type.ARRAY,
    items: {
      type: import_genai.Type.OBJECT,
      properties: {
        id: { type: import_genai.Type.INTEGER },
        question: { type: import_genai.Type.STRING },
        options: {
          type: import_genai.Type.ARRAY,
          items: { type: import_genai.Type.STRING }
        },
        correctAnswer: { type: import_genai.Type.STRING },
        solution: { type: import_genai.Type.STRING },
        hint: { type: import_genai.Type.STRING },
        marks: { type: import_genai.Type.INTEGER }
      },
      required: ["id", "question", "correctAnswer", "solution"]
    }
  };
  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert mathematics curriculum creator. Provide academically sound, mathematically correct questions, clear explanations, and precise solutions. Always respond in valid JSON matching the requested schema.",
          responseMimeType: "application/json",
          responseSchema
        }
      });
      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      const errMsg = err?.message || String(err);
      console.warn(`[Curriculum AI] Model ${model} unavailable or busy: ${errMsg}. Trying next candidate or fallback...`);
    }
  }
  return generateAlgorithmicQuestions(params);
}

// server/docxGenerator.ts
var import_docx = require("docx");
async function generateWorksheetDocxBuffer(worksheet) {
  const children = [];
  children.push(
    new import_docx.Paragraph({
      alignment: import_docx.AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new import_docx.TextRun({
          text: worksheet.schoolName || "MATH PERFECT ACADEMY",
          bold: true,
          size: 32,
          color: "1E3A8A",
          font: "Arial"
        })
      ]
    }),
    new import_docx.Paragraph({
      alignment: import_docx.AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new import_docx.TextRun({
          text: worksheet.title,
          bold: true,
          size: 26,
          color: "0F172A",
          font: "Arial"
        })
      ]
    }),
    new import_docx.Paragraph({
      alignment: import_docx.AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new import_docx.TextRun({
          text: `Subject Topic: ${worksheet.topic}   |   Grade: ${worksheet.grade}   |   Difficulty: ${worksheet.difficulty}`,
          italics: true,
          size: 20,
          color: "475569",
          font: "Arial"
        })
      ]
    })
  );
  const infoTable = new import_docx.Table({
    width: { size: 100, type: import_docx.WidthType.PERCENTAGE },
    rows: [
      new import_docx.TableRow({
        children: [
          new import_docx.TableCell({
            width: { size: 50, type: import_docx.WidthType.PERCENTAGE },
            borders: {
              top: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              bottom: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              left: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              right: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
            },
            children: [
              new import_docx.Paragraph({
                children: [
                  new import_docx.TextRun({ text: "Student Name: _______________________", bold: true, size: 20, font: "Arial" })
                ]
              })
            ]
          }),
          new import_docx.TableCell({
            width: { size: 25, type: import_docx.WidthType.PERCENTAGE },
            borders: {
              top: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              bottom: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              left: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              right: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
            },
            children: [
              new import_docx.Paragraph({
                children: [
                  new import_docx.TextRun({ text: "Date: ____________", bold: true, size: 20, font: "Arial" })
                ]
              })
            ]
          }),
          new import_docx.TableCell({
            width: { size: 25, type: import_docx.WidthType.PERCENTAGE },
            borders: {
              top: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              bottom: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              left: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              right: { style: import_docx.BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
            },
            children: [
              new import_docx.Paragraph({
                children: [
                  new import_docx.TextRun({ text: "Score: _____ / _____", bold: true, size: 20, font: "Arial" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
  children.push(infoTable);
  children.push(
    new import_docx.Paragraph({
      spacing: { before: 200, after: 300 },
      children: [
        new import_docx.TextRun({ text: "Instructions: ", bold: true, size: 20, font: "Arial" }),
        new import_docx.TextRun({
          text: worksheet.instructions || "Show all your mathematical work clearly in the space provided below each question. Answer all questions.",
          size: 20,
          font: "Arial",
          color: "334155"
        })
      ]
    })
  );
  worksheet.questions.forEach((q, idx) => {
    children.push(
      new import_docx.Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new import_docx.TextRun({
            text: `Q${idx + 1}. `,
            bold: true,
            size: 22,
            color: "1E3A8A",
            font: "Arial"
          }),
          new import_docx.TextRun({
            text: q.question,
            bold: true,
            size: 22,
            font: "Arial"
          }),
          new import_docx.TextRun({
            text: `  [${q.marks || 3} Marks]`,
            size: 18,
            color: "64748B",
            font: "Arial",
            italics: true
          })
        ]
      })
    );
    if (q.options && q.options.length > 0) {
      const labels = ["A", "B", "C", "D", "E"];
      q.options.forEach((opt, optIdx) => {
        children.push(
          new import_docx.Paragraph({
            indent: { left: 400 },
            spacing: { after: 60 },
            children: [
              new import_docx.TextRun({
                text: `(${labels[optIdx]}) `,
                bold: true,
                size: 20,
                font: "Arial"
              }),
              new import_docx.TextRun({
                text: opt,
                size: 20,
                font: "Arial"
              })
            ]
          })
        );
      });
    }
    children.push(
      new import_docx.Paragraph({
        spacing: { before: 100, after: 200 },
        children: [
          new import_docx.TextRun({
            text: "Working space / Solution:\n\n\n\n",
            size: 18,
            color: "94A3B8",
            font: "Arial",
            italics: true
          })
        ]
      })
    );
  });
  children.push(
    new import_docx.Paragraph({
      pageBreakBefore: true,
      alignment: import_docx.AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new import_docx.TextRun({
          text: "TEACHER MARKING SCHEME & COMPLETE ANSWER KEY",
          bold: true,
          size: 26,
          color: "1E3A8A",
          font: "Arial"
        })
      ]
    }),
    new import_docx.Paragraph({
      alignment: import_docx.AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new import_docx.TextRun({
          text: `Worksheet Reference: ${worksheet.title} (${worksheet.topic})`,
          italics: true,
          size: 20,
          color: "64748B",
          font: "Arial"
        })
      ]
    })
  );
  worksheet.questions.forEach((q, idx) => {
    children.push(
      new import_docx.Paragraph({
        spacing: { before: 160, after: 60 },
        children: [
          new import_docx.TextRun({
            text: `Answer Q${idx + 1}: `,
            bold: true,
            size: 20,
            color: "059669",
            font: "Arial"
          }),
          new import_docx.TextRun({
            text: q.correctAnswer,
            bold: true,
            size: 20,
            color: "0F172A",
            font: "Arial"
          })
        ]
      }),
      new import_docx.Paragraph({
        indent: { left: 300 },
        spacing: { after: 120 },
        children: [
          new import_docx.TextRun({
            text: "Derivation & Step-by-Step Solution: ",
            bold: true,
            size: 18,
            color: "475569",
            font: "Arial"
          }),
          new import_docx.TextRun({
            text: q.solution,
            size: 18,
            color: "334155",
            font: "Arial"
          })
        ]
      })
    );
  });
  const doc = new import_docx.Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children
      }
    ]
  });
  return await import_docx.Packer.toBuffer(doc);
}

// server/solverEngine.ts
function solveQuadratic(a, b, c) {
  if (a === 0) {
    throw new Error("Coefficient 'a' cannot be 0 in a quadratic equation (ax\xB2 + bx + c = 0).");
  }
  const discriminant = b * b - 4 * a * c;
  const h = -b / (2 * a);
  const k = c - b * b / (4 * a);
  const steps = [];
  steps.push({
    title: "1. Identify Coefficients",
    explanation: `For the standard form ax\xB2 + bx + c = 0:`,
    math: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`
  });
  let natureOfRoots = "";
  if (discriminant > 0) {
    natureOfRoots = "Two distinct real roots (\u0394 > 0)";
  } else if (discriminant === 0) {
    natureOfRoots = "One repeated real root (\u0394 = 0)";
  } else {
    natureOfRoots = "Two complex conjugate roots (\u0394 < 0)";
  }
  steps.push({
    title: "2. Compute the Discriminant (\u0394)",
    explanation: `Calculate \u0394 = b\xB2 - 4ac to determine root character: ${natureOfRoots}.`,
    math: `\\Delta = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${discriminant}`
  });
  let root1Str = "";
  let root2Str = "";
  let rootsSummary = "";
  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const r1 = (-b + sqrtD) / (2 * a);
    const r2 = (-b - sqrtD) / (2 * a);
    root1Str = `x_1 = ${r1.toFixed(4).replace(/\\.0000$/, "")}`;
    root2Str = `x_2 = ${r2.toFixed(4).replace(/\\.0000$/, "")}`;
    rootsSummary = `x = ${r1.toFixed(4).replace(/\\.0000$/, "")} \\quad \\text{or} \\quad x = ${r2.toFixed(4).replace(/\\.0000$/, "")}`;
    steps.push({
      title: "3. Apply the Quadratic Formula",
      explanation: `Substitute a, b, and \u221A\u0394 into x = (-b \xB1 \u221A\u0394) / (2a):`,
      math: `x = \\frac{-(${b}) \\pm \\sqrt{${discriminant}}}{2(${a})} = \\frac{${-b} \\pm ${sqrtD.toFixed(4).replace(/\\.0000$/, "")}}{${2 * a}}`
    });
    steps.push({
      title: "4. Separate into Two Roots",
      explanation: `Compute both the positive and negative branches:`,
      math: `${root1Str}, \\qquad ${root2Str}`
    });
  } else if (discriminant === 0) {
    const r = -b / (2 * a);
    rootsSummary = `x = ${r.toFixed(4).replace(/\\.0000$/, "")} \\quad (\\text{multiplicity 2})`;
    steps.push({
      title: "3. Single Repeated Root",
      explanation: `Since \u0394 = 0, the single root is given by x = -b / (2a):`,
      math: `x = \\frac{-(${b})}{2(${a})} = ${r.toFixed(4).replace(/\\.0000$/, "")}`
    });
  } else {
    const realPart = (-b / (2 * a)).toFixed(4).replace(/\\.0000$/, "");
    const imagPart = (Math.sqrt(-discriminant) / (2 * Math.abs(a))).toFixed(4).replace(/\\.0000$/, "");
    rootsSummary = `x = ${realPart} \\pm ${imagPart}i`;
    steps.push({
      title: "3. Complex Roots Evaluation",
      explanation: `Since \u0394 < 0, \u221A\u0394 = i\u221A|\u0394|:`,
      math: `x = \\frac{${-b} \\pm i\\sqrt{${-discriminant}}}{${2 * a}} = ${realPart} \\pm ${imagPart}i`
    });
  }
  steps.push({
    title: "5. Parabola Vertex & Geometry",
    explanation: `The vertex of the parabola y = ax\xB2 + bx + c occurs at (h, k):`,
    math: `h = -\\frac{b}{2a} = ${h.toFixed(3)}, \\quad k = f(h) = ${k.toFixed(3)} \\implies \\text{Vertex } (${h.toFixed(3)}, ${k.toFixed(3)})`
  });
  return {
    title: "Quadratic Equation Solution",
    problemType: "Algebra / Quadratic Equations",
    inputSummary: `${a}x\xB2 ${b >= 0 ? "+ " + b : "- " + Math.abs(b)}x ${c >= 0 ? "+ " + c : "- " + Math.abs(c)} = 0`,
    solution: rootsSummary,
    steps,
    keyFormulas: [
      "Quadratic Formula: x = (-b \xB1 \u221A(b\xB2 - 4ac)) / (2a)",
      "Discriminant: \u0394 = b\xB2 - 4ac",
      "Vertex Coordinates: (h, k) = (-b / 2a, c - b\xB2 / 4a)",
      "Axis of Symmetry: x = -b / (2a)"
    ],
    additionalData: {
      discriminant,
      natureOfRoots,
      vertex: { h: Number(h.toFixed(3)), k: Number(k.toFixed(3)) },
      roots: rootsSummary
    }
  };
}
function solveLinearSystem(a1, b1, c1, a2, b2, c2) {
  const D = a1 * b2 - a2 * b1;
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;
  const steps = [];
  steps.push({
    title: "1. Standard Matrix Representation",
    explanation: "Write the system as a matrix equation A \xB7 X = B:",
    math: `\\begin{pmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ${c1} \\\\ ${c2} \\end{pmatrix}`
  });
  steps.push({
    title: "2. Compute the System Determinant (D)",
    explanation: "Using Cramer's Rule, calculate the coefficient determinant D:",
    math: `D = (${a1})(${b2}) - (${a2})(${b1}) = ${a1 * b2} - ${a2 * b1} = ${D}`
  });
  if (Math.abs(D) < 1e-9) {
    if (Math.abs(Dx) < 1e-9 && Math.abs(Dy) < 1e-9) {
      return {
        title: "System of Linear Equations",
        problemType: "Linear Algebra",
        inputSummary: `${a1}x + ${b1}y = ${c1},  ${a2}x + ${b2}y = ${c2}`,
        solution: "Infinitely many solutions (Coincident lines)",
        steps: [
          ...steps,
          {
            title: "3. Analysis of Dependent Equations",
            explanation: "Both lines are collinear (D = 0, Dx = 0, Dy = 0), representing the same mathematical line.",
            math: "\\text{Dependent System with } \\infty \\text{ solutions}"
          }
        ],
        keyFormulas: ["Cramer's Rule: D = a\u2081b\u2082 - a\u2082b\u2081", "Dx = c\u2081b\u2082 - c\u2082b\u2081", "Dy = a\u2081c\u2082 - a\u2082c\u2081"]
      };
    } else {
      return {
        title: "System of Linear Equations",
        problemType: "Linear Algebra",
        inputSummary: `${a1}x + ${b1}y = ${c1},  ${a2}x + ${b2}y = ${c2}`,
        solution: "No solution (Parallel, inconsistent lines)",
        steps: [
          ...steps,
          {
            title: "3. Inconsistent System",
            explanation: "The determinant D = 0 but Dx or Dy \u2260 0. The two lines are parallel and never intersect.",
            math: "\\text{Inconsistent System: } \\emptyset"
          }
        ],
        keyFormulas: ["Cramer's Rule: D = a\u2081b\u2082 - a\u2082b\u2081", "Parallel Lines Condition: a\u2081/a\u2082 = b\u2081/b\u2082 \u2260 c\u2081/c\u2082"]
      };
    }
  }
  const x = Dx / D;
  const y = Dy / D;
  steps.push({
    title: "3. Compute Determinants Dx and Dy",
    explanation: "Replace x-column with constants for Dx, and y-column with constants for Dy:",
    math: `D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${Dx}, \\quad D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${Dy}`
  });
  steps.push({
    title: "4. Compute x and y",
    explanation: "Divide Dx and Dy by D to get unique coordinates:",
    math: `x = \\frac{D_x}{D} = \\frac{${Dx}}{${D}} = ${x.toFixed(4).replace(/\\.0000$/, "")}, \\quad y = \\frac{D_y}{D} = \\frac{${Dy}}{${D}} = ${y.toFixed(4).replace(/\\.0000$/, "")}`
  });
  return {
    title: "Linear System Solution",
    problemType: "Linear Algebra",
    inputSummary: `${a1}x + ${b1}y = ${c1},  ${a2}x + ${b2}y = ${c2}`,
    solution: `x = ${x.toFixed(4).replace(/\\.0000$/, "")}, \\quad y = ${y.toFixed(4).replace(/\\.0000$/, "")}`,
    steps,
    keyFormulas: ["Cramer's Rule: x = Dx / D, y = Dy / D", "Determinant: |A| = a\u2081b\u2082 - a\u2082b\u2081"],
    additionalData: { x, y, D, Dx, Dy }
  };
}
function solvePolynomialCalculus(coefficients) {
  const degree = coefficients.length - 1;
  const derivCoeffs = [];
  const integCoeffs = [];
  for (let i = 0; i < coefficients.length - 1; i++) {
    const power = degree - i;
    derivCoeffs.push(coefficients[i] * power);
  }
  for (let i = 0; i < coefficients.length; i++) {
    const power = degree - i;
    integCoeffs.push(coefficients[i] / (power + 1));
  }
  const formatPoly = (coeffs, startDeg) => {
    if (coeffs.length === 0) return "0";
    return coeffs.map((c, idx) => {
      const p = startDeg - idx;
      const val = Number(c.toFixed(3));
      if (val === 0) return "";
      const sign = idx > 0 && val > 0 ? "+ " : val < 0 ? "- " : "";
      const absVal = Math.abs(val);
      const coeffStr = absVal === 1 && p > 0 ? "" : `${absVal}`;
      const xStr = p > 1 ? `x^{${p}}` : p === 1 ? "x" : "";
      return `${sign}${coeffStr}${xStr}`;
    }).filter(Boolean).join(" ") || "0";
  };
  const origPoly = formatPoly(coefficients, degree);
  const derivPoly = formatPoly(derivCoeffs, degree - 1);
  const integPoly = `${formatPoly(integCoeffs, degree + 1)} + C`;
  return {
    title: "Polynomial Calculus Operations",
    problemType: "Calculus",
    inputSummary: `f(x) = ${origPoly}`,
    solution: `f'(x) = ${derivPoly}, \\quad \\int f(x)dx = ${integPoly}`,
    steps: [
      {
        title: "1. Identify Polynomial Degree & Terms",
        explanation: `Given polynomial of degree ${degree}:`,
        math: `f(x) = ${origPoly}`
      },
      {
        title: "2. Apply the Power Rule for Derivatives",
        explanation: "Differentiate term by term using d/dx [a\xB7x^n] = a\xB7n\xB7x^(n-1):",
        math: `f'(x) = \\frac{d}{dx}[${origPoly}] = ${derivPoly}`
      },
      {
        title: "3. Apply the Power Rule for Integrals",
        explanation: "Antidifferentiate term by term using \u222B a\xB7x^n dx = (a / (n+1))\xB7x^(n+1) + C:",
        math: `\\int f(x)\\,dx = ${integPoly}`
      }
    ],
    keyFormulas: [
      "Derivative Power Rule: d/dx [x^n] = n\xB7x^(n-1)",
      "Integral Power Rule: \u222B x^n dx = (x^(n+1)) / (n+1) + C",
      "Sum Rule: (f + g)' = f' + g'"
    ]
  };
}
function solveFractionArithmetic(n1, d1, op, n2, d2) {
  if (d1 === 0 || d2 === 0) {
    throw new Error("Denominator cannot be zero.");
  }
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };
  let resN = 0;
  let resD = 1;
  const steps = [];
  if (op === "+" || op === "-") {
    const commonD = d1 * d2 / gcd(d1, d2);
    const m1 = commonD / d1;
    const m2 = commonD / d2;
    const adjN1 = n1 * m1;
    const adjN2 = n2 * m2;
    steps.push({
      title: "1. Find the Least Common Multiple (LCM) of Denominators",
      explanation: `Denominators are ${d1} and ${d2}. LCM(${d1}, ${d2}) = ${commonD}.`,
      math: `\\text{LCM}(${d1}, ${d2}) = ${commonD}`
    });
    steps.push({
      title: "2. Convert Both Fractions to Common Denominator",
      explanation: `Multiply numerators by the respective scaling factors (${m1} and ${m2}):`,
      math: `\\frac{${n1} \\times ${m1}}{${d1} \\times ${m1}} = \\frac{${adjN1}}{${commonD}}, \\quad \\frac{${n2} \\times ${m2}}{${d2} \\times ${m2}} = \\frac{${adjN2}}{${commonD}}`
    });
    resN = op === "+" ? adjN1 + adjN2 : adjN1 - adjN2;
    resD = commonD;
    steps.push({
      title: "3. Combine the Numerators",
      explanation: `Keep the common denominator and ${op === "+" ? "add" : "subtract"} numerators:`,
      math: `\\frac{${adjN1} ${op} ${adjN2}}{${commonD}} = \\frac{${resN}}{${resD}}`
    });
  } else if (op === "*") {
    resN = n1 * n2;
    resD = d1 * d2;
    steps.push({
      title: "1. Multiply Numerators and Denominators Directly",
      explanation: "For fraction multiplication, multiply numerators together and denominators together:",
      math: `\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}} = \\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\frac{${resN}}{${resD}}`
    });
  } else if (op === "/") {
    if (n2 === 0) throw new Error("Division by zero fraction.");
    resN = n1 * d2;
    resD = d1 * n2;
    steps.push({
      title: "1. Multiply by the Reciprocal (Invert and Multiply)",
      explanation: `The reciprocal of ${n2}/${d2} is ${d2}/${n2}:`,
      math: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}} = \\frac{${resN}}{${resD}}`
    });
  }
  const g = gcd(resN, resD);
  const simpN = resN / g;
  const simpD = resD / g;
  steps.push({
    title: "4. Simplify by Greatest Common Divisor (GCD)",
    explanation: `GCD of ${resN} and ${resD} is ${g}. Divide both by ${g}:`,
    math: `\\frac{${resN} \\div ${g}}{${resD} \\div ${g}} = \\frac{${simpN}}{${simpD}}`
  });
  return {
    title: "Fraction Arithmetic",
    problemType: "Arithmetic",
    inputSummary: `\\frac{${n1}}{${d1}} ${op === "*" ? "\\times" : op === "/" ? "\\div" : op} \\frac{${n2}}{${d2}}`,
    solution: simpD === 1 ? `${simpN}` : `\\frac{${simpN}}{${simpD}}`,
    steps,
    keyFormulas: [
      "Addition/Subtraction: a/b \xB1 c/d = (ad \xB1 bc) / bd",
      "Multiplication: a/b \xD7 c/d = (ac) / (bd)",
      "Division: a/b \xF7 c/d = (ad) / (bc)"
    ]
  };
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ extended: true }));
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      platform: "MATH PERFECT",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/worksheets", (req, res) => {
    try {
      const list = db.getWorksheets();
      res.json({ success: true, worksheets: list });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/worksheets/:id", (req, res) => {
    try {
      const ws = db.getWorksheetById(req.params.id);
      if (!ws) {
        return res.status(404).json({ error: "Worksheet not found" });
      }
      res.json({ success: true, worksheet: ws });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/worksheets/generate", async (req, res) => {
    try {
      const {
        topic = "Algebra",
        grade = "Grade 10",
        difficulty = "Standard",
        questionType = "mixed",
        questionCount = 5,
        schoolName = "MATH PERFECT Academy",
        instructions = "",
        customInstructions = ""
      } = req.body;
      const questions = await generateWorksheetAI({
        topic,
        grade,
        difficulty,
        questionType,
        questionCount: Number(questionCount) || 5,
        schoolName,
        customInstructions
      });
      const newWorksheet = {
        id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: `${topic} Practice Worksheet`,
        topic,
        grade,
        difficulty,
        questionType,
        questionCount: questions.length,
        schoolName,
        instructions: instructions || "Show all your work clearly. Complete each question carefully.",
        questions,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdBy: "Math Perfect AI Curriculum"
      };
      db.saveWorksheet(newWorksheet);
      res.json({ success: true, worksheet: newWorksheet });
    } catch (err) {
      console.error("Error generating worksheet:", err);
      res.status(500).json({ error: err.message || "Failed to generate worksheet" });
    }
  });
  app.post("/api/worksheets/export/docx", async (req, res) => {
    try {
      const worksheet = req.body.worksheet || db.getWorksheetById(req.body.id);
      if (!worksheet) {
        return res.status(400).json({ error: "Valid worksheet payload or ID is required" });
      }
      const buffer = await generateWorksheetDocxBuffer(worksheet);
      const filename = `MathPerfect_${worksheet.topic.replace(/[^a-zA-Z0-9]/g, "_")}_Worksheet.docx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (err) {
      console.error("DOCX export error:", err);
      res.status(500).json({ error: err.message || "Failed to generate DOCX file" });
    }
  });
  app.get("/api/questionbank", (req, res) => {
    try {
      const { topic, grade, difficulty, type, search } = req.query;
      const questions = db.getQuestionBank({
        topic,
        grade,
        difficulty,
        type,
        search
      });
      res.json({ success: true, questions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/questionbank/save", (req, res) => {
    try {
      const newQuestion = {
        id: `qb-custom-${Date.now()}`,
        ...req.body
      };
      db.addQuestion(newQuestion);
      res.json({ success: true, question: newQuestion });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/solvers/solve", (req, res) => {
    try {
      const { type, params } = req.body;
      let result;
      switch (type) {
        case "quadratic":
          result = solveQuadratic(Number(params.a), Number(params.b), Number(params.c));
          break;
        case "linearSystem":
          result = solveLinearSystem(
            Number(params.a1),
            Number(params.b1),
            Number(params.c1),
            Number(params.a2),
            Number(params.b2),
            Number(params.c2)
          );
          break;
        case "polynomialCalculus":
          const coeffs = Array.isArray(params.coefficients) ? params.coefficients.map(Number) : String(params.coefficients).split(",").map((s) => Number(s.trim()));
          result = solvePolynomialCalculus(coeffs);
          break;
        case "fraction":
          result = solveFractionArithmetic(
            Number(params.n1),
            Number(params.d1),
            params.op,
            Number(params.n2),
            Number(params.d2)
          );
          break;
        default:
          return res.status(400).json({ error: `Unknown solver type: ${type}` });
      }
      res.json({ success: true, result });
    } catch (err) {
      res.status(400).json({ error: err.message || "Error executing solver" });
    }
  });
  app.get("/api/exampapers", (req, res) => {
    try {
      const papers = db.getExamPapers();
      res.json({ success: true, examPapers: papers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/exampapers/:id", (req, res) => {
    try {
      const paper = db.getExamPaperById(req.params.id);
      if (!paper) {
        return res.status(404).json({ error: "Exam paper not found" });
      }
      res.json({ success: true, examPaper: paper });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/exampaper/generate", (req, res) => {
    try {
      const {
        title = "Standard Mathematics Comprehensive Examination",
        grade = "Grade 10 / High School",
        subject = "Pure & Applied Mathematics",
        totalMarks = 80,
        timeMinutes = 180
      } = req.body;
      const newPaper = {
        id: `exam-${Date.now()}`,
        title,
        grade,
        subject,
        totalMarks: Number(totalMarks) || 80,
        timeMinutes: Number(timeMinutes) || 180,
        instructions: [
          "Read all questions carefully. Time allowed: " + (timeMinutes || 180) + " minutes.",
          "Section A comprises Multiple Choice Questions (1 mark each).",
          "Section B comprises Short Answer Problems (2 to 3 marks each).",
          "Section C comprises Analytical proofs and High Order Thinking Questions (4 to 5 marks each).",
          "Mathematical tables and scientific calculators are permitted where specified."
        ],
        sections: [
          {
            name: "Section A: Conceptual & Objective Evaluation",
            description: "1 Mark Questions testing core recall and fundamental mechanics.",
            questions: [
              {
                id: 1,
                question: "What is the discriminant of 3x\xB2 - 6x + 3 = 0, and what does it indicate about the roots?",
                options: ["\u0394 = 0 (One repeated real root)", "\u0394 = 36 (Two distinct real roots)", "\u0394 = -12 (Complex roots)", "\u0394 = 1 (Rational roots)"],
                marks: 1,
                solution: "\u0394 = (-6)\xB2 - 4(3)(3) = 36 - 36 = 0. Roots are real and equal.",
                markingScheme: ["Identification of \u0394 = 0: 1 mark"]
              },
              {
                id: 2,
                question: "If sin \u03B8 = 3/5 in Quadrant I, what is the exact value of tan \u03B8?",
                options: ["3/4", "4/3", "4/5", "5/3"],
                marks: 1,
                solution: "Since sin \u03B8 = opposite/hypotenuse = 3/5, adjacent = \u221A(5\xB2 - 3\xB2) = 4. tan \u03B8 = opposite/adjacent = 3/4.",
                markingScheme: ["Correct trigonometric ratio: 1 mark"]
              }
            ]
          },
          {
            name: "Section B: Structured Analytical Problems",
            description: "Multi-step computational problems with structured marks.",
            questions: [
              {
                id: 3,
                question: "Solve the simultaneous system: 5x - 3y = 19 and 3x + y = 17.",
                marks: 3,
                solution: "From second equation, y = 17 - 3x. Substitute: 5x - 3(17 - 3x) = 19 => 5x - 51 + 9x = 19 => 14x = 70 => x = 5. Then y = 17 - 3(5) = 2.",
                markingScheme: [
                  "Method of substitution or elimination: 1 mark",
                  "Correct calculation of x = 5: 1 mark",
                  "Correct calculation of y = 2: 1 mark"
                ]
              },
              {
                id: 4,
                question: "Find the coordinates of the turning point of the curve y = 2x\xB2 - 12x + 11 and determine whether it is a maximum or minimum.",
                marks: 3,
                solution: "dy/dx = 4x - 12 = 0 => x = 3. At x = 3, y = 2(9) - 12(3) + 11 = 18 - 36 + 11 = -7. d\xB2y/dx\xB2 = 4 > 0, hence minimum at (3, -7).",
                markingScheme: [
                  "First derivative set to zero: 1 mark",
                  "Coordinates (3, -7) determined: 1 mark",
                  "Second derivative check for minimum: 1 mark"
                ]
              }
            ]
          },
          {
            name: "Section C: Extended Inquiries & Rigorous Proofs",
            description: "Comprehensive proofs and multi-concept modeling scenarios.",
            questions: [
              {
                id: 5,
                question: "A farmer has 120 meters of fencing to enclose a rectangular pasture divided into two equal compartments by a fence parallel to one of the sides. Find the dimensions that maximize the total enclosed area.",
                marks: 5,
                solution: "Let x be length of perpendicular fences (3 fences of length x) and y be length of the 2 outer sides. Perimeter constraint: 3x + 2y = 120 => y = (120 - 3x)/2 = 60 - 1.5x. Total Area A(x) = x \xB7 y = x(60 - 1.5x) = 60x - 1.5x\xB2. Differentiate: dA/dx = 60 - 3x = 0 => x = 20 meters. Then y = 60 - 1.5(20) = 30 meters. Maximum Area = 20 \xD7 30 = 600 m\xB2.",
                markingScheme: [
                  "Correct constraint equation 3x + 2y = 120: 1 mark",
                  "Area objective function A(x) formulated: 1 mark",
                  "Derivative computed and set to zero: 1 mark",
                  "Dimensions x = 20 m and y = 30 m found: 1 mark",
                  "Verification of maximum and concluding area: 1 mark"
                ]
              }
            ]
          }
        ],
        guessAnalysis: {
          trendingTopics: [
            "Optimization using differential calculus",
            "Simultaneous linear systems and Cramer's Rule",
            "Trigonometric standard ratios and double angle expansions",
            "Quadratic modeling and projectile trajectory",
            "Coordinate geometry distance and locus problems"
          ],
          highProbabilityTopics: [
            { topic: "Calculus Optimization Word Problems", weight: 18, rationale: "Appeared in 95% of past examinations as a marquee 5-mark question." },
            { topic: "Quadratic Discriminant & Nature of Roots", weight: 14, rationale: "A foundational concept recurring every examination cycle." },
            { topic: "Linear Equations & Determinants", weight: 12, rationale: "Standard core benchmark of algebraic procedural mastery." },
            { topic: "Trigonometric Applications", weight: 16, rationale: "High correlation with board and standardized test blueprints." }
          ],
          examStrategy: [
            "Allocate 25 minutes for Section A, 65 minutes for Section B, and 75 minutes for Section C.",
            "Keep 15 minutes at the conclusion for dimensional and algebraic sanity checks.",
            "Underline or box your final numerical answers with appropriate units.",
            "State all formulas explicitly before substituting values."
          ]
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.saveExamPaper(newPaper);
      res.json({ success: true, examPaper: newPaper });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const legacyHtmlRoutes = [
    "/index.html",
    "/worksheets.html",
    "/activities.html",
    "/simulations.html",
    "/solvers.html",
    "/questionbank.html",
    "/exampaper.html",
    "/videos.html"
  ];
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MATH PERFECT platform server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
});
//# sourceMappingURL=server.cjs.map
