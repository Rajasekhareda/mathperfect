# Math Worksheet & Activity Sheet Generator

A production-quality, **Windows-local** Math Worksheet & Activity Sheet Generator for Indian schools (KG–Intermediate), designed for compatibility with **CBSE, ICSE, IGCSE, State Boards and generic Indian curricula**, and aligned with **NEP 2020** principles (competency-based learning, application, reasoning, HOTS, activity-based learning).

> Alignment is always labelled “Designed for compatibility with …” — the app never claims official board certification.

## Tech stack
- **Backend:** Node.js + TypeScript + Express
- **AI:** Gemini via the official `@google/genai` SDK with structured JSON output (`GEMINI_MODEL` configurable in `.env`)
- **DOCX:** `docx` npm package · **PDF:** headless Microsoft Edge / Google Chrome print pipeline with a verification step
- **Frontend:** React + TypeScript + Vite
- **Storage:** JSON-file project database (`data/projects.json`, `data/curriculum.json`)

## AI architecture (generation → verification)
| Stage | Module |
|-------|--------|
| A. Curriculum Planner | `server/src/services/curriculumPlanner.ts` |
| B. Question Generator (Gemini, JSON schema) + offline fallback | `geminiService.ts`, `fallbackGenerator.ts` |
| C. Mathematical Validator (recomputes answers via mathjs) | `mathValidator.ts` |
| D. Pedagogy Validator (age/difficulty/objectives) | `pedagogyValidator.ts` |
| E. Duplicate Detector (Jaccard similarity) | `pedagogyValidator.ts` |
| F. Worksheet Composer (ordering + marks) | `composer.ts` |
| G. Document Renderer (DOCX + HTML) | `docxRenderer.ts`, `htmlRenderer.ts` |
| H. Final Verification (DOCX/answer-key/PDF readiness) | `finalVerification.ts`, `pdfPipeline.ts` |

If Gemini is unavailable (no key, quota, invalid JSON), the app degrades gracefully to a deterministic **local generator** with Indian contexts (₹, lakhs/crores, Indian names, metric units) and recomputed answers.

## Windows installation

1. Install [Node.js 18+](https://nodejs.org/) (LTS recommended).
2. Open PowerShell in this folder and run:

   ```powershell
   npm install
   npm run install:all
   ```

3. Copy `.env.example` to `.env` and add your Gemini API key (get one free at https://aistudio.google.com/):

   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-3.6-flash
   PORT=3000
   DATA_DIR=./data
   OUTPUT_DIR=./output
   ```

   The app works **without** a key (offline local generator), but Gemini gives richer, topic-specific questions.

## Run

```powershell
npm run dev
```

- Frontend: http://localhost:6000 (opens the dashboard)
- Backend API: http://localhost:3000/api

Production build:

```powershell
npm run build
npm start          # serves API + built frontend on http://localhost:3000
```

## Tests

```powershell
npm run test:server
```

Covers question generation, validation, answer-key consistency, MCQ single-correct rules, duplicate detection, DOCX rendering and verified PDF export (KG + Class 10 end-to-end).

## Workflow
1. **New Worksheet** → choose board, grade, topic, difficulty, question types & counts, optional marks/time/instructions.
2. **Generate** → Gemini structured JSON → schema validation → mathematical + pedagogy validation → duplicate detection → composition.
3. **Preview** → A4 page preview; edit any question, regenerate single questions, validate again.
4. **Export DOCX** → polished Word document (answer key + explanations on final pages, never beside questions).
5. **Verify PDF** → final verification (answer-key consistency, numbering, marks, DOCX integrity, browser availability).
6. **Export PDF** → headless Edge/Chrome print → PDF verified (%PDF header, size, page count) → saved to `output/`.

## Templates
Clean School · Exam Practice · Primary Fun Math · Concept Builder · Competency/HOTS · Revision Pack · Teacher Assessment.

## Safety & quality rules
- Original questions only; no copyrighted textbook reproduction, no invented page numbers or board rules.
- Every numeric answer is independently recomputed; MCQs always have exactly one correct option (4 options by default).
- API/quota/JSON/PDF errors are handled gracefully with clear messages and fallback paths.
- API keys are only read server-side and never exposed to the frontend.

## Project layout
```
server/   Express + TypeScript backend (services, routes, db, tests)
client/   React + Vite frontend
data/     JSON project database
output/   Generated DOCX / PDF files
```
