import 'dotenv/config';
import express from 'express';
import worksheetRouter from './server/worksheet-generator/routes/api';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

function ensureDirectories() {
  const dirs = ['./data', './output', './data/questionbank', './data/questionbank/backups'];
  for (const dir of dirs) {
    const full = resolve(dir);
    if (!existsSync(full)) {
      mkdirSync(full, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
}

async function startServer() {
  ensureDirectories();

  const app = express();
  const PORT = 5000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS for local dev (safe for localhost only)
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Mount the full worksheet generator API at /api
  app.use('/api', worksheetRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development (serves React app + HMR)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve the built frontend
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════╗');
    console.log('  ║   🧮  MATH PERFECT  —  All-in-One Server    ║');
    console.log(`  ║   http://localhost:${PORT}                      ║`);
    console.log('  ║   /api  →  Worksheet Generator API           ║');
    console.log('  ║   /     →  React App (via Vite middleware)   ║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log('');
  });
}

startServer().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
