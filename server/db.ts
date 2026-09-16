import fs from 'fs';
import path from 'path';

export interface WorksheetItem {
  id: string;
  title: string;
  topic: string;
  grade: string;
  difficulty: 'Foundational' | 'Standard' | 'Advanced' | 'Olympiad';
  questionType: 'multiple-choice' | 'free-response' | 'word-problems' | 'mixed';
  questionCount: number;
  schoolName?: string;
  instructions?: string;
  questions: Array<{
    id: number;
    question: string;
    options?: string[];
    correctAnswer: string;
    solution: string;
    hint?: string;
    marks?: number;
  }>;
  createdAt: string;
  createdBy?: string;
}

export interface QuestionBankItem {
  id: string;
  topic: string;
  subtopic: string;
  grade: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Challenge';
  type: 'mcq' | 'short-answer' | 'extended' | 'proof';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  hint: string;
  tags: string[];
}

export interface ExamPaperItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  totalMarks: number;
  timeMinutes: number;
  instructions: string[];
  sections: Array<{
    name: string;
    description: string;
    questions: Array<{
      id: number;
      question: string;
      options?: string[];
      marks: number;
      solution: string;
      markingScheme: string[];
    }>;
  }>;
  guessAnalysis?: {
    trendingTopics: string[];
    highProbabilityTopics: Array<{ topic: string; weight: number; rationale: string }>;
    examStrategy: string[];
  };
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'revoked';
  avatarUrl?: string;
  createdAt: string;
  lastActive?: string;
  notes?: string;
}

interface DatabaseSchema {
  worksheets: WorksheetItem[];
  questionBank: QuestionBankItem[];
  examPapers: ExamPaperItem[];
  savedSimulationsState: Record<string, any>;
  siteContent: Record<string, string>;
  users: AdminUser[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mathperfect.json');

const INITIAL_QUESTIONS: QuestionBankItem[] = [
  {
    id: 'qb-1',
    topic: 'Algebra',
    subtopic: 'Quadratic Equations',
    grade: 'Grade 10',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'Solve for x: 2x² - 7x + 3 = 0',
    options: ['x = 3 or x = 1/2', 'x = -3 or x = -1/2', 'x = 3 or x = -1/2', 'x = 2 or x = 3/2'],
    answer: 'x = 3 or x = 1/2',
    explanation: 'Using the quadratic formula x = (-b ± √(b² - 4ac)) / (2a): a = 2, b = -7, c = 3. Discriminant Δ = (-7)² - 4(2)(3) = 49 - 24 = 25. Thus x = (7 ± 5)/4 => x = 12/4 = 3 or x = 2/4 = 1/2.',
    hint: 'Calculate the discriminant Δ = b² - 4ac first.',
    tags: ['Quadratic Formula', 'Factoring', 'Polynomials']
  },
  {
    id: 'qb-2',
    topic: 'Calculus',
    subtopic: 'Differentiation',
    grade: 'Grade 12',
    difficulty: 'Medium',
    type: 'short-answer',
    question: 'Find the derivative of f(x) = x³ · e^(2x) with respect to x.',
    answer: "f'(x) = e^(2x) · (2x³ + 3x²)",
    explanation: "Apply the Product Rule: (u · v)' = u'v + uv'. Here u = x³, so u' = 3x²; v = e^(2x), so v' = 2e^(2x) (by chain rule). Therefore f'(x) = 3x² · e^(2x) + x³ · 2e^(2x) = e^(2x)(2x³ + 3x²).",
    hint: 'Use the product rule along with the chain rule for e^(2x).',
    tags: ['Product Rule', 'Chain Rule', 'Exponentials']
  },
  {
    id: 'qb-3',
    topic: 'Geometry',
    subtopic: 'Pythagorean Theorem & Circles',
    grade: 'Grade 9',
    difficulty: 'Easy',
    type: 'mcq',
    question: 'A right-angled triangle has a base of 8 cm and an altitude of 15 cm. What is the length of the hypotenuse?',
    options: ['17 cm', '16 cm', '19 cm', '23 cm'],
    answer: '17 cm',
    explanation: 'By the Pythagorean theorem: c² = a² + b² = 8² + 15² = 64 + 225 = 289. Since √289 = 17, the hypotenuse is 17 cm.',
    hint: 'Recall the Pythagorean triplet: 8, 15, 17.',
    tags: ['Right Triangles', 'Pythagorean Triplet', 'Lengths']
  },
  {
    id: 'qb-4',
    topic: 'Trigonometry',
    subtopic: 'Identities',
    grade: 'Grade 11',
    difficulty: 'Hard',
    type: 'proof',
    question: 'Prove that (sin θ + cos θ)² = 1 + sin 2θ for all real values of θ.',
    answer: 'LHS = sin² θ + 2 sin θ cos θ + cos² θ = (sin² θ + cos² θ) + 2 sin θ cos θ = 1 + sin 2θ = RHS.',
    explanation: 'Expanding the left hand side: (sin θ + cos θ)² = sin² θ + 2 sin θ cos θ + cos² θ. Using the Pythagorean identity sin² θ + cos² θ = 1, and the double angle formula sin 2θ = 2 sin θ cos θ, we arrive at 1 + sin 2θ.',
    hint: 'Expand the squared binomial and apply fundamental identities.',
    tags: ['Trig Identity', 'Double Angle', 'Proofs']
  },
  {
    id: 'qb-5',
    topic: 'Statistics',
    subtopic: 'Probability & Distributions',
    grade: 'Grade 11',
    difficulty: 'Medium',
    type: 'short-answer',
    question: 'A fair six-sided die is rolled twice. What is the probability of getting a sum strictly greater than 9?',
    answer: '1/6 (or approx 16.67%)',
    explanation: 'Total outcomes = 6 × 6 = 36. Favorable outcomes where sum > 9 (i.e. sum = 10, 11, or 12): Sum 10: (4,6), (5,5), (6,4) [3 outcomes]; Sum 11: (5,6), (6,5) [2 outcomes]; Sum 12: (6,6) [1 outcome]. Total favorable = 3 + 2 + 1 = 6. Probability = 6/36 = 1/6.',
    hint: 'List pairs that produce sums of 10, 11, and 12.',
    tags: ['Probability', 'Combinatorics', 'Dice']
  },
  {
    id: 'qb-6',
    topic: 'Number Theory',
    subtopic: 'Prime Factorization & Modular Arithmetic',
    grade: 'Grade 8',
    difficulty: 'Easy',
    type: 'mcq',
    question: 'What is the greatest common divisor (GCD) of 84 and 180?',
    options: ['12', '6', '14', '24'],
    answer: '12',
    explanation: 'Prime factorizations: 84 = 2² × 3 × 7; 180 = 2² × 3² × 5. Common factors: 2² × 3 = 4 × 3 = 12.',
    hint: 'Find the lowest common powers of each shared prime factor.',
    tags: ['GCD', 'LCM', 'Prime Factors']
  },
  {
    id: 'qb-7',
    topic: 'Algebra',
    subtopic: 'Systems of Linear Equations',
    grade: 'Grade 9',
    difficulty: 'Medium',
    type: 'short-answer',
    question: 'Solve the system: 3x + 2y = 19 and 2x - y = 8.',
    answer: 'x = 5, y = 2',
    explanation: 'From equation 2: y = 2x - 8. Substitute into equation 1: 3x + 2(2x - 8) = 19 => 3x + 4x - 16 = 19 => 7x = 35 => x = 5. Then y = 2(5) - 8 = 2.',
    hint: 'Express y in terms of x using the second equation, then substitute.',
    tags: ['Linear Systems', 'Substitution', 'Elimination']
  },
  {
    id: 'qb-8',
    topic: 'Calculus',
    subtopic: 'Integration',
    grade: 'Grade 12',
    difficulty: 'Hard',
    type: 'extended',
    question: 'Evaluate the definite integral: ∫ from 0 to 2 of (3x² - 4x + 1) dx.',
    answer: '2',
    explanation: 'Find the antiderivative: F(x) = ∫(3x² - 4x + 1)dx = x³ - 2x² + x. Evaluate from 0 to 2: F(2) = 2³ - 2(2²) + 2 = 8 - 8 + 2 = 2. F(0) = 0. Therefore, the integral equals 2 - 0 = 2.',
    hint: 'Apply the power rule of integration: ∫ x^n dx = (x^(n+1))/(n+1).',
    tags: ['Definite Integrals', 'Fundamental Theorem', 'Polynomials']
  }
];

const INITIAL_WORKSHEETS: WorksheetItem[] = [
  {
    id: 'ws-sample-1',
    title: 'Mastering Quadratic Equations & Factorization',
    topic: 'Quadratic Equations',
    grade: 'Grade 10',
    difficulty: 'Standard',
    questionType: 'mixed',
    questionCount: 5,
    schoolName: 'MATH PERFECT Education',
    instructions: 'Answer all questions. Show all working steps clearly. Calculators are permitted unless specified.',
    questions: [
      {
        id: 1,
        question: 'Solve by factoring: x² - 9x + 20 = 0',
        correctAnswer: 'x = 4 or x = 5',
        solution: 'Find two numbers that multiply to 20 and add to -9: (-4) and (-5). (x - 4)(x - 5) = 0 => x = 4 or x = 5.',
        hint: 'Identify factors of 20 that sum up to -9.',
        marks: 3
      },
      {
        id: 2,
        question: 'What is the nature of the roots of 3x² + 5x + 4 = 0?',
        options: ['Two distinct real roots', 'Two equal real roots', 'Complex/non-real conjugate roots', 'Infinitely many roots'],
        correctAnswer: 'Complex/non-real conjugate roots',
        solution: 'Compute discriminant Δ = b² - 4ac = 5² - 4(3)(4) = 25 - 48 = -23. Since Δ < 0, roots are complex conjugates.',
        hint: 'Use the discriminant sign: Δ > 0 (real distinct), Δ = 0 (equal), Δ < 0 (complex).',
        marks: 2
      },
      {
        id: 3,
        question: 'Find the vertex and line of symmetry of the parabola y = 2x² - 8x + 5.',
        correctAnswer: 'Vertex: (2, -3); Axis of symmetry: x = 2',
        solution: 'x-coordinate of vertex = -b/(2a) = -(-8)/(2 × 2) = 8/4 = 2. Substitute into equation: y = 2(2)² - 8(2) + 5 = 8 - 16 + 5 = -3. Vertex is (2, -3), line of symmetry is x = 2.',
        hint: 'Use the formula x = -b/(2a).',
        marks: 4
      },
      {
        id: 4,
        question: 'A projectile is launched from ground level with height h(t) = -5t² + 30t meters after t seconds. At what time does it reach maximum height and what is the maximum height?',
        correctAnswer: 'Max height at t = 3 seconds; Max height = 45 meters',
        solution: 'Peak occurs at vertex t = -b/(2a) = -30/(2 × -5) = 3 seconds. Height at t = 3: h(3) = -5(9) + 30(3) = -45 + 90 = 45 meters.',
        hint: 'The vertex of a downward-opening parabola gives the maximum.',
        marks: 5
      },
      {
        id: 5,
        question: 'Solve 2x² + 4x - 6 = 0 using the quadratic formula.',
        options: ['x = 1 or x = -3', 'x = -1 or x = 3', 'x = 2 or x = -6', 'x = 1/2 or x = -3/2'],
        correctAnswer: 'x = 1 or x = -3',
        solution: 'Divide entire equation by 2: x² + 2x - 3 = 0. Δ = 2² - 4(1)(-3) = 4 + 12 = 16. x = (-2 ± 4)/2 => x = 2/2 = 1 or x = -6/2 = -3.',
        hint: 'Simplify coefficients by dividing by common factor first.',
        marks: 3
      }
    ],
    createdAt: new Date().toISOString(),
    createdBy: 'System Curriculum Specialist'
  }
];

const INITIAL_EXAM_PAPERS: ExamPaperItem[] = [
  {
    id: 'exam-1',
    title: 'Senior Secondary Mathematics Term Examination',
    grade: 'Grade 10 / High School',
    subject: 'Pure & Applied Mathematics',
    totalMarks: 80,
    timeMinutes: 180,
    instructions: [
      'This question paper consists of 3 Sections: Section A (MCQs - 20 marks), Section B (Short Answer - 30 marks), and Section C (Long Answer - 30 marks).',
      'All questions are compulsory. Internal choice is provided in certain sections.',
      'Use of non-programmable scientific calculators is permitted.',
      'Write legible step-by-step solutions with appropriate units.'
    ],
    sections: [
      {
        name: 'Section A: Foundational Knowledge & Concepts (20 Marks)',
        description: 'Multiple choice questions assessing core definitions and fundamental principles.',
        questions: [
          {
            id: 1,
            question: 'If the discriminant of ax² + bx + c = 0 is zero, the roots are:',
            options: ['Real and distinct', 'Real and equal', 'Non-real', 'Rational only'],
            marks: 1,
            solution: 'Real and equal. When Δ = b² - 4ac = 0, both roots equal -b/(2a).',
            markingScheme: ['Correct option identified: 1 mark']
          },
          {
            id: 2,
            question: 'The distance between the points (2, 3) and (10, 9) is:',
            options: ['10 units', '14 units', '12 units', '8 units'],
            marks: 1,
            solution: 'Distance = √((10-2)² + (9-3)²) = √(64 + 36) = √100 = 10 units.',
            markingScheme: ['Correct distance calculation: 1 mark']
          }
        ]
      },
      {
        name: 'Section B: Mathematical Modeling & Calculations (30 Marks)',
        description: 'Short answer questions testing procedural fluency and multi-step reasoning.',
        questions: [
          {
            id: 3,
            question: 'Solve for x and y: 4x + 3y = 25 and x - 2y = -2.',
            marks: 3,
            solution: 'From second equation, x = 2y - 2. Substitute: 4(2y - 2) + 3y = 25 => 8y - 8 + 3y = 25 => 11y = 33 => y = 3. Then x = 2(3) - 2 = 4. Solution: (4, 3).',
            markingScheme: [
              'Substitution or elimination formulation: 1 mark',
              'Correct determination of y: 1 mark',
              'Correct determination of x: 1 mark'
            ]
          }
        ]
      },
      {
        name: 'Section C: Extended Reasoning & Problem Solving (30 Marks)',
        description: 'High-order analytical proofs and multi-variable applications.',
        questions: [
          {
            id: 4,
            question: 'Prove that the tangents drawn from an external point to a circle are equal in length. Include a labeled geometric diagram description.',
            marks: 5,
            solution: 'Let P be an external point to circle with center O. Tangents touch circle at A and B. Consider triangles OPA and OPB. OA = OB (radii). OP = OP (common hypotenuse). ∠OAP = ∠OBP = 90° (radius is perpendicular to tangent). By RHS congruence criterion, ΔOPA ≅ ΔOPB. Therefore PA = PB by CPCTC.',
            markingScheme: [
              'Clear diagram description and Given/To Prove statements: 1 mark',
              'Perpendicularity of radius and tangent cited: 1 mark',
              'Hypotenuse-Leg (RHS) congruence justification: 2 marks',
              'Conclusion PA = PB: 1 mark'
            ]
          }
        ]
      }
    ],
    guessAnalysis: {
      trendingTopics: [
        'Quadratic modeling and projectile trajectory',
        'Coordinate geometry distance and section formula',
        'Circle theorems (tangent lengths & alternate segment theorem)',
        'Trigonometric heights & distances applications',
        'Surface areas and volumes of composite solids'
      ],
      highProbabilityTopics: [
        { topic: 'Quadratic Equations (Discriminant & Word Problems)', weight: 14, rationale: 'Appeared consistently in 98% of past 5 years board and national assessments.' },
        { topic: 'Circles & Tangents Proofs', weight: 12, rationale: 'Standard Section C mandatory theorem verification requirement.' },
        { topic: 'Trigonometric Identities & Elevations', weight: 15, rationale: 'High weightage real-world elevation and depression multi-step question.' },
        { topic: 'Linear Equations in Two Variables', weight: 10, rationale: 'Consistently forms core of Section B analytical marks.' }
      ],
      examStrategy: [
        'Spend first 10 minutes skimming questions and categorizing Section A vs Section C priorities.',
        'Always write explicit formulas and specify units in final answers.',
        'For geometric proofs, draw and label the diagram clearly before writing deductive steps.',
        'Reserve 15 minutes at the end for algebraic sign checking.'
      ]
    },
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-superadmin-1',
    email: 'Rajasekhar.eda@gmail.com',
    name: 'Rajasekhar Eda',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    notes: 'Primary Master Webmaster & Platform Owner'
  },
  {
    id: 'usr-admin-2',
    email: 'curriculum.lead@mathperfect.edu',
    name: 'Curriculum Director',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    notes: 'Academic Content Lead'
  },
  {
    id: 'usr-editor-3',
    email: 'guest.editor@mathperfect.edu',
    name: 'Guest Math Editor',
    role: 'editor',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    notes: 'Assistant question bank reviewer'
  }
];

export const DEFAULT_SITE_CONTENT: Record<string, string> = {
  // Brand & Header
  'site.title': 'MATH PERFECT',
  'site.tagline': 'Curriculum Intelligence',
  'site.badge': 'PRO',
  'site.nav.home': 'HOME',
  'site.nav.worksheets': 'WORKSHEETS',
  'site.nav.activities': 'ACTIVITIES',
  'site.nav.simulations': 'SIMULATIONS',
  'site.nav.solvers': 'SOLVERS',
  'site.nav.questionbank': 'QUESTION BANK',
  'site.nav.exampaper': 'EXAM PAPERS',
  'site.nav.videos': 'VIDEOS',
  'site.header.cta': 'AI WORKSHEET',

  // Home Hero
  'home.hero.pillText': 'Pure Mathematical Intelligence',
  'home.hero.pillBadge': '8K Fidelity',
  'home.hero.title1': 'Precision Mathematics.',
  'home.hero.title2': 'Mastered With Absolute Clarity.',
  'home.hero.description': 'Institutional-grade mathematical intelligence crafted for educators, students, and institutions. Unifying generative AI worksheets, dynamic visual simulations, multi-step symbolic solvers, and authentic examination blueprints.',
  'home.hero.ctaWorksheet': 'Launch Worksheet Engine',
  'home.hero.ctaSimulations': 'Explore 3D Simulations',

  // Interactive Teaser
  'home.teaser.heading': 'Parabolic Trajectory & Roots Live Engine',
  'home.teaser.subheading': 'Adjust coefficients a, b, and c in real-time to compute the discriminant Δ and inspect parabolic vertex geometry.',

  // Home Features Heading
  'home.features.heading': 'Institutional Mathematical Architecture',
  'home.features.subheading': 'Seven integrated computational pillars powering curriculum mastery from elementary foundational concepts to international Olympiad rigor.',

  // Home Feature Cards
  'home.card.worksheets.title': 'Worksheet Generator',
  'home.card.worksheets.desc': 'Generate customized, pedagogical printable worksheets with instant answer keys, full step-by-step solutions, and native DOCX / vector PDF export.',
  'home.card.worksheets.cta': 'Generate Worksheet',

  'home.card.activities.title': 'Hands-on Activities',
  'home.card.activities.desc': 'Interactive discovery laboratories featuring dynamic geometry, projectile physics, Pythagorean visual proofs, and polynomial graphers.',
  'home.card.activities.cta': 'Open Activities',

  'home.card.simulations.title': '3D Interactive Simulations',
  'home.card.simulations.desc': 'Visual interactive sandboxes for calculus tangents, Riemann sums, unit circle trigonometry, and linear algebra matrices.',
  'home.card.simulations.cta': 'Enter Lab',

  'home.card.solvers.title': 'Step-by-Step Solvers',
  'home.card.solvers.desc': 'Deconstruct complex problems with rigorous step-by-step proofs, intermediate formula steps, parabola geometry analyses, and linear system matrices.',
  'home.card.solvers.cta': 'Solve Problem',

  'home.card.questionbank.title': 'Question Bank',
  'home.card.questionbank.desc': 'Search and filter thousands of academic math questions by topic, grade level, difficulty, and question format with progressive hints and complete solutions.',
  'home.card.questionbank.cta': 'Browse Bank',

  'home.card.exampaper.title': 'Exam Papers & Guessing',
  'home.card.exampaper.desc': 'Standardized assessment builder with balanced cognitive sections (MCQ, short, extended proof), point rubrics, and predictive topic frequency analysis.',
  'home.card.exampaper.cta': 'Generate Exam',

  'home.card.videos.title': 'Curated Video Lessons',
  'home.card.videos.desc': 'High-yield video lectures covering geometric intuition, calculus insights, contest heuristics, and deep fundamental proofs.',
  'home.card.videos.cta': 'Watch Lessons',

  // Audience Section
  'home.audience.heading': 'Engineered for Every Mathematical Stakeholder',
  'home.audience.subheading': 'Empowering learners, guiding mentors, reassuring parents, and scaling institutional academic excellence.',

  // Footer & Institutional
  'footer.brandDesc': 'Empowering educators, students, and curriculum directors worldwide with state-of-the-art computational pedagogy, generative assessment tooling, and interactive visualization.',
  'footer.copyright': '© 2026 MATH PERFECT Education Inc. All mathematical rights reserved.'
};

function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      let modified = false;
      if (!parsed.siteContent) {
        parsed.siteContent = { ...DEFAULT_SITE_CONTENT };
        modified = true;
      }
      if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = [...INITIAL_USERS];
        modified = true;
      } else {
        // Ensure primary webmaster exists
        const hasWebmaster = parsed.users.some((u: AdminUser) => u.email.toLowerCase() === 'rajasekhar.eda@gmail.com');
        if (!hasWebmaster) {
          parsed.users.unshift(INITIAL_USERS[0]);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, initializing default:', err);
  }

  const initialData: DatabaseSchema = {
    worksheets: INITIAL_WORKSHEETS,
    questionBank: INITIAL_QUESTIONS,
    examPapers: INITIAL_EXAM_PAPERS,
    savedSimulationsState: {},
    siteContent: { ...DEFAULT_SITE_CONTENT },
    users: [...INITIAL_USERS]
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing initial database file:', err);
  }

  return initialData;
}

let dbCache: DatabaseSchema = initDatabase();

function saveDatabase(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

export const db = {
  getWorksheets(): WorksheetItem[] {
    return dbCache.worksheets;
  },
  getWorksheetById(id: string): WorksheetItem | undefined {
    return dbCache.worksheets.find(w => w.id === id);
  },
  saveWorksheet(worksheet: WorksheetItem): WorksheetItem {
    const existingIndex = dbCache.worksheets.findIndex(w => w.id === worksheet.id);
    if (existingIndex >= 0) {
      dbCache.worksheets[existingIndex] = worksheet;
    } else {
      dbCache.worksheets.unshift(worksheet);
    }
    saveDatabase();
    return worksheet;
  },
  deleteWorksheet(id: string): boolean {
    const initialLen = dbCache.worksheets.length;
    dbCache.worksheets = dbCache.worksheets.filter(w => w.id !== id);
    if (dbCache.worksheets.length !== initialLen) {
      saveDatabase();
      return true;
    }
    return false;
  },
  getQuestionBank(filters?: { topic?: string; grade?: string; difficulty?: string; type?: string; search?: string }): QuestionBankItem[] {
    let items = dbCache.questionBank;
    if (!filters) return items;

    if (filters.topic && filters.topic !== 'All') {
      items = items.filter(q => q.topic.toLowerCase() === filters.topic!.toLowerCase());
    }
    if (filters.grade && filters.grade !== 'All') {
      items = items.filter(q => q.grade.toLowerCase().includes(filters.grade!.toLowerCase()));
    }
    if (filters.difficulty && filters.difficulty !== 'All') {
      items = items.filter(q => q.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
    }
    if (filters.type && filters.type !== 'All') {
      items = items.filter(q => q.type.toLowerCase() === filters.type!.toLowerCase());
    }
    if (filters.search) {
      const qLower = filters.search.toLowerCase();
      items = items.filter(q => 
        q.question.toLowerCase().includes(qLower) || 
        q.explanation.toLowerCase().includes(qLower) ||
        q.tags.some(t => t.toLowerCase().includes(qLower))
      );
    }
    return items;
  },
  addQuestion(question: QuestionBankItem): QuestionBankItem {
    dbCache.questionBank.unshift(question);
    saveDatabase();
    return question;
  },
  getExamPapers(): ExamPaperItem[] {
    return dbCache.examPapers;
  },
  getExamPaperById(id: string): ExamPaperItem | undefined {
    return dbCache.examPapers.find(e => e.id === id);
  },
  saveExamPaper(examPaper: ExamPaperItem): ExamPaperItem {
    const idx = dbCache.examPapers.findIndex(e => e.id === examPaper.id);
    if (idx >= 0) {
      dbCache.examPapers[idx] = examPaper;
    } else {
      dbCache.examPapers.unshift(examPaper);
    }
    saveDatabase();
    return examPaper;
  },

  // --- CMS / MASTER TEXT CONTENT MANAGEMENT ---
  getSiteContent(): Record<string, string> {
    if (!dbCache.siteContent) {
      dbCache.siteContent = { ...DEFAULT_SITE_CONTENT };
    }
    return dbCache.siteContent;
  },
  getDefaultSiteContent(): Record<string, string> {
    return DEFAULT_SITE_CONTENT;
  },
  updateSiteContentKey(key: string, value: string): Record<string, string> {
    if (!dbCache.siteContent) {
      dbCache.siteContent = { ...DEFAULT_SITE_CONTENT };
    }
    dbCache.siteContent[key] = value;
    saveDatabase();
    return dbCache.siteContent;
  },
  batchUpdateSiteContent(updates: Record<string, string>): Record<string, string> {
    if (!dbCache.siteContent) {
      dbCache.siteContent = { ...DEFAULT_SITE_CONTENT };
    }
    dbCache.siteContent = { ...dbCache.siteContent, ...updates };
    saveDatabase();
    return dbCache.siteContent;
  },
  resetSiteContentKey(key: string): { content: Record<string, string>; defaultValue: string } {
    if (!dbCache.siteContent) {
      dbCache.siteContent = { ...DEFAULT_SITE_CONTENT };
    }
    const def = DEFAULT_SITE_CONTENT[key] ?? '';
    dbCache.siteContent[key] = def;
    saveDatabase();
    return { content: dbCache.siteContent, defaultValue: def };
  },
  resetAllSiteContent(): Record<string, string> {
    dbCache.siteContent = { ...DEFAULT_SITE_CONTENT };
    saveDatabase();
    return dbCache.siteContent;
  },

  // --- ADMIN USER & ACCESS CONTROL MANAGEMENT ---
  getUsers(): AdminUser[] {
    if (!dbCache.users) {
      dbCache.users = [...INITIAL_USERS];
    }
    return dbCache.users;
  },
  getUserById(id: string): AdminUser | undefined {
    return this.getUsers().find(u => u.id === id);
  },
  getUserByEmail(email: string): AdminUser | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  addUser(user: { email: string; name: string; role: AdminUser['role']; notes?: string; status?: AdminUser['status'] }): AdminUser {
    const existing = this.getUserByEmail(user.email);
    if (existing) {
      throw new Error(`User with email ${user.email} already exists.`);
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      email: user.email.trim(),
      name: user.name.trim() || user.email.split('@')[0],
      role: user.role || 'editor',
      status: user.status || 'active',
      notes: user.notes?.trim() || 'Provisioned via Admin Console',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    if (!dbCache.users) dbCache.users = [];
    dbCache.users.push(newUser);
    saveDatabase();
    return newUser;
  },
  updateUser(id: string, updates: Partial<AdminUser>): AdminUser | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    // Prevent revoking or downgrading root webmaster
    const target = users[idx];
    if (target.email.toLowerCase() === 'rajasekhar.eda@gmail.com' && updates.status === 'revoked') {
      throw new Error('Cannot revoke access for primary Webmaster root account.');
    }

    users[idx] = {
      ...target,
      ...updates,
      id: target.id // ensure ID is invariant
    };
    saveDatabase();
    return users[idx];
  },
  setUserStatus(id: string, status: 'active' | 'revoked'): AdminUser | null {
    return this.updateUser(id, { status, lastActive: new Date().toISOString() });
  },
  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return false;
    if (target.email.toLowerCase() === 'rajasekhar.eda@gmail.com') {
      throw new Error('Cannot delete primary root Webmaster account.');
    }
    const initialLen = users.length;
    dbCache.users = users.filter(u => u.id !== id);
    if (dbCache.users.length !== initialLen) {
      saveDatabase();
      return true;
    }
    return false;
  }
};
