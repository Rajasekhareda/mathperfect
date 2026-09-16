import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, WorksheetItem, ExamPaperItem } from './server/db.js';
import { generateWorksheetAI } from './server/gemini.js';
import { generateWorksheetDocxBuffer } from './server/docxGenerator.js';
import {
  solveQuadratic,
  solveLinearSystem,
  solvePolynomialCalculus,
  solveFractionArithmetic
} from './server/solverEngine.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'MATH PERFECT',
      timestamp: new Date().toISOString()
    });
  });

  // --- CMS MASTER TEXT API ENDPOINTS ---
  app.get('/api/cms/content', (req, res) => {
    try {
      res.json({
        success: true,
        content: db.getSiteContent(),
        defaultContent: db.getDefaultSiteContent()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/cms/content', (req, res) => {
    try {
      const { key, value, content } = req.body;
      if (key && typeof value === 'string') {
        const updated = db.updateSiteContentKey(key, value);
        return res.json({ success: true, content: updated });
      }
      if (content && typeof content === 'object') {
        const updated = db.batchUpdateSiteContent(content);
        return res.json({ success: true, content: updated });
      }
      res.status(400).json({ error: 'Provide key and value or content object' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/cms/reset', (req, res) => {
    try {
      const { key, all } = req.body;
      if (all) {
        const resetContent = db.resetAllSiteContent();
        return res.json({ success: true, content: resetContent });
      }
      if (key) {
        const result = db.resetSiteContentKey(key);
        return res.json({ success: true, content: result.content, defaultValue: result.defaultValue });
      }
      res.status(400).json({ error: 'Specify key or all: true to reset' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ADMIN USERS & ACCESS CONTROL (INVOKE / REVOKE / GRANT ACCESS) ---
  app.get('/api/admin/users', (req, res) => {
    try {
      const users = db.getUsers();
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/users', (req, res) => {
    try {
      const { email, name, role = 'editor', status = 'active', notes = '' } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required' });
      }
      const user = db.addUser({ email, name, role, status, notes });
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/admin/users/:id', (req, res) => {
    try {
      const updated = db.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    try {
      const deleted = db.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found or cannot delete' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const emailClean = email.trim().toLowerCase();
      let user = db.getUserByEmail(emailClean);

      // Auto-provision Rajasekhar.eda@gmail.com if missing as Super Admin
      if (!user && emailClean === 'rajasekhar.eda@gmail.com') {
        user = db.addUser({
          email: 'Rajasekhar.eda@gmail.com',
          name: 'Rajasekhar Eda',
          role: 'super_admin',
          status: 'active',
          notes: 'Master Webmaster'
        });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not recognized. Please request access from Webmaster.' });
      }

      if (user.status === 'revoked') {
        return res.status(403).json({ error: 'Your access has been revoked by the Webmaster.' });
      }

      // Update last active
      db.updateUser(user.id, { lastActive: new Date().toISOString() });
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Worksheets endpoints
  app.get('/api/worksheets', (req, res) => {
    try {
      const list = db.getWorksheets();
      res.json({ success: true, worksheets: list });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/worksheets/:id', (req, res) => {
    try {
      const ws = db.getWorksheetById(req.params.id);
      if (!ws) {
        return res.status(404).json({ error: 'Worksheet not found' });
      }
      res.json({ success: true, worksheet: ws });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/worksheets/generate', async (req, res) => {
    try {
      const {
        topic = 'Algebra',
        grade = 'Grade 10',
        difficulty = 'Standard',
        questionType = 'mixed',
        questionCount = 5,
        schoolName = 'MATH PERFECT Education',
        instructions = '',
        customInstructions = ''
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

      const newWorksheet: WorksheetItem = {
        id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: `${topic} Practice Worksheet`,
        topic,
        grade,
        difficulty,
        questionType,
        questionCount: questions.length,
        schoolName,
        instructions: instructions || 'Show all your work clearly. Complete each question carefully.',
        questions,
        createdAt: new Date().toISOString(),
        createdBy: 'Math Perfect AI Curriculum'
      };

      db.saveWorksheet(newWorksheet);

      res.json({ success: true, worksheet: newWorksheet });
    } catch (err: any) {
      console.error('Error generating worksheet:', err);
      res.status(500).json({ error: err.message || 'Failed to generate worksheet' });
    }
  });

  app.post('/api/worksheets/export/docx', async (req, res) => {
    try {
      const worksheet: WorksheetItem = req.body.worksheet || db.getWorksheetById(req.body.id);
      if (!worksheet) {
        return res.status(400).json({ error: 'Valid worksheet payload or ID is required' });
      }

      const buffer = await generateWorksheetDocxBuffer(worksheet);
      const filename = `MathPerfect_${worksheet.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Worksheet.docx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (err: any) {
      console.error('DOCX export error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate DOCX file' });
    }
  });

  // Question Bank endpoints
  app.get('/api/questionbank', (req, res) => {
    try {
      const { topic, grade, difficulty, type, search } = req.query;
      const questions = db.getQuestionBank({
        topic: topic as string,
        grade: grade as string,
        difficulty: difficulty as string,
        type: type as string,
        search: search as string
      });
      res.json({ success: true, questions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/questionbank/save', (req, res) => {
    try {
      const newQuestion = {
        id: `qb-custom-${Date.now()}`,
        ...req.body
      };
      db.addQuestion(newQuestion);
      res.json({ success: true, question: newQuestion });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Solvers endpoint
  app.post('/api/solvers/solve', (req, res) => {
    try {
      const { type, params } = req.body;
      let result;

      switch (type) {
        case 'quadratic':
          result = solveQuadratic(Number(params.a), Number(params.b), Number(params.c));
          break;
        case 'linearSystem':
          result = solveLinearSystem(
            Number(params.a1),
            Number(params.b1),
            Number(params.c1),
            Number(params.a2),
            Number(params.b2),
            Number(params.c2)
          );
          break;
        case 'polynomialCalculus':
          const coeffs = Array.isArray(params.coefficients)
            ? params.coefficients.map(Number)
            : String(params.coefficients)
                .split(',')
                .map(s => Number(s.trim()));
          result = solvePolynomialCalculus(coeffs);
          break;
        case 'fraction':
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
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error executing solver' });
    }
  });

  // Exam Papers & Guessing endpoints
  app.get('/api/exampapers', (req, res) => {
    try {
      const papers = db.getExamPapers();
      res.json({ success: true, examPapers: papers });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/exampapers/:id', (req, res) => {
    try {
      const paper = db.getExamPaperById(req.params.id);
      if (!paper) {
        return res.status(404).json({ error: 'Exam paper not found' });
      }
      res.json({ success: true, examPaper: paper });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/exampaper/generate', (req, res) => {
    try {
      const {
        title = 'Standard Mathematics Comprehensive Examination',
        grade = 'Grade 10 / High School',
        subject = 'Pure & Applied Mathematics',
        totalMarks = 80,
        timeMinutes = 180
      } = req.body;

      const newPaper: ExamPaperItem = {
        id: `exam-${Date.now()}`,
        title,
        grade,
        subject,
        totalMarks: Number(totalMarks) || 80,
        timeMinutes: Number(timeMinutes) || 180,
        instructions: [
          'Read all questions carefully. Time allowed: ' + (timeMinutes || 180) + ' minutes.',
          'Section A comprises Multiple Choice Questions (1 mark each).',
          'Section B comprises Short Answer Problems (2 to 3 marks each).',
          'Section C comprises Analytical proofs and High Order Thinking Questions (4 to 5 marks each).',
          'Mathematical tables and scientific calculators are permitted where specified.'
        ],
        sections: [
          {
            name: 'Section A: Conceptual & Objective Evaluation',
            description: '1 Mark Questions testing core recall and fundamental mechanics.',
            questions: [
              {
                id: 1,
                question: 'What is the discriminant of 3x² - 6x + 3 = 0, and what does it indicate about the roots?',
                options: ['Δ = 0 (One repeated real root)', 'Δ = 36 (Two distinct real roots)', 'Δ = -12 (Complex roots)', 'Δ = 1 (Rational roots)'],
                marks: 1,
                solution: 'Δ = (-6)² - 4(3)(3) = 36 - 36 = 0. Roots are real and equal.',
                markingScheme: ['Identification of Δ = 0: 1 mark']
              },
              {
                id: 2,
                question: 'If sin θ = 3/5 in Quadrant I, what is the exact value of tan θ?',
                options: ['3/4', '4/3', '4/5', '5/3'],
                marks: 1,
                solution: 'Since sin θ = opposite/hypotenuse = 3/5, adjacent = √(5² - 3²) = 4. tan θ = opposite/adjacent = 3/4.',
                markingScheme: ['Correct trigonometric ratio: 1 mark']
              }
            ]
          },
          {
            name: 'Section B: Structured Analytical Problems',
            description: 'Multi-step computational problems with structured marks.',
            questions: [
              {
                id: 3,
                question: 'Solve the simultaneous system: 5x - 3y = 19 and 3x + y = 17.',
                marks: 3,
                solution: 'From second equation, y = 17 - 3x. Substitute: 5x - 3(17 - 3x) = 19 => 5x - 51 + 9x = 19 => 14x = 70 => x = 5. Then y = 17 - 3(5) = 2.',
                markingScheme: [
                  'Method of substitution or elimination: 1 mark',
                  'Correct calculation of x = 5: 1 mark',
                  'Correct calculation of y = 2: 1 mark'
                ]
              },
              {
                id: 4,
                question: 'Find the coordinates of the turning point of the curve y = 2x² - 12x + 11 and determine whether it is a maximum or minimum.',
                marks: 3,
                solution: 'dy/dx = 4x - 12 = 0 => x = 3. At x = 3, y = 2(9) - 12(3) + 11 = 18 - 36 + 11 = -7. d²y/dx² = 4 > 0, hence minimum at (3, -7).',
                markingScheme: [
                  'First derivative set to zero: 1 mark',
                  'Coordinates (3, -7) determined: 1 mark',
                  'Second derivative check for minimum: 1 mark'
                ]
              }
            ]
          },
          {
            name: 'Section C: Extended Inquiries & Rigorous Proofs',
            description: 'Comprehensive proofs and multi-concept modeling scenarios.',
            questions: [
              {
                id: 5,
                question: 'A farmer has 120 meters of fencing to enclose a rectangular pasture divided into two equal compartments by a fence parallel to one of the sides. Find the dimensions that maximize the total enclosed area.',
                marks: 5,
                solution: 'Let x be length of perpendicular fences (3 fences of length x) and y be length of the 2 outer sides. Perimeter constraint: 3x + 2y = 120 => y = (120 - 3x)/2 = 60 - 1.5x. Total Area A(x) = x · y = x(60 - 1.5x) = 60x - 1.5x². Differentiate: dA/dx = 60 - 3x = 0 => x = 20 meters. Then y = 60 - 1.5(20) = 30 meters. Maximum Area = 20 × 30 = 600 m².',
                markingScheme: [
                  'Correct constraint equation 3x + 2y = 120: 1 mark',
                  'Area objective function A(x) formulated: 1 mark',
                  'Derivative computed and set to zero: 1 mark',
                  'Dimensions x = 20 m and y = 30 m found: 1 mark',
                  'Verification of maximum and concluding area: 1 mark'
                ]
              }
            ]
          }
        ],
        guessAnalysis: {
          trendingTopics: [
            'Optimization using differential calculus',
            'Simultaneous linear systems and Cramer\'s Rule',
            'Trigonometric standard ratios and double angle expansions',
            'Quadratic modeling and projectile trajectory',
            'Coordinate geometry distance and locus problems'
          ],
          highProbabilityTopics: [
            { topic: 'Calculus Optimization Word Problems', weight: 18, rationale: 'Appeared in 95% of past examinations as a marquee 5-mark question.' },
            { topic: 'Quadratic Discriminant & Nature of Roots', weight: 14, rationale: 'A foundational concept recurring every examination cycle.' },
            { topic: 'Linear Equations & Determinants', weight: 12, rationale: 'Standard core benchmark of algebraic procedural mastery.' },
            { topic: 'Trigonometric Applications', weight: 16, rationale: 'High correlation with board and standardized test blueprints.' }
          ],
          examStrategy: [
            'Allocate 25 minutes for Section A, 65 minutes for Section B, and 75 minutes for Section C.',
            'Keep 15 minutes at the conclusion for dimensional and algebraic sanity checks.',
            'Underline or box your final numerical answers with appropriate units.',
            'State all formulas explicitly before substituting values.'
          ]
        },
        createdAt: new Date().toISOString()
      };

      db.saveExamPaper(newPaper);
      res.json({ success: true, examPaper: newPaper });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Legacy URL compatibility routes
  const legacyHtmlRoutes = [
    '/index.html',
    '/worksheets.html',
    '/activities.html',
    '/simulations.html',
    '/solvers.html',
    '/questionbank.html',
    '/exampaper.html',
    '/videos.html'
  ];

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MATH PERFECT platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
