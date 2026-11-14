# CRITICAL FIXES PLAN - MATH PERFECT Worksheet Generator
**Generated:** September 23, 2026 11:21 AM  
**Status:** Implementation Ready

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### Issue #1: Duplicate Questions from Database
**Problem:** System checks against question bank and may skip generation if similar questions exist  
**Impact:** Users don't get fresh questions when they want new worksheets  
**Location:** `server/worksheet-generator/services/worksheetService.ts` (line 191-194)

**Current Code:**
```typescript
const bankExclusions = searchBank({
  grade: config.grade,
  limit: 60,
}).map((b) => b.question.slice(0, 160));
```

**Root Cause:** The system passes existing questions to Gemini as `excludeQuestions`, which limits variety and may cause generation failures if too many similar questions exist.

---

### Issue #2: PDF Generation Not Working
**Problem:** PDF export failing silently or with errors  
**Impact:** Users cannot download PDF versions of worksheets  
**Location:** `server/worksheet-generator/services/pdfPipeline.ts`

**Root Causes:**
1. Chrome/Edge browser path not found on Windows
2. HTML temporary file cleanup issues
3. Output directory not created
4. PDF verification too strict

---

### Issue #3: File Saving Issues
**Problem:** Generated worksheets not saving properly or users can't see them  
**Impact:** Users lose their work, cannot download files  
**Location:** Multiple locations

**Root Causes:**
1. `output/` directory doesn't exist
2. `data/` directory doesn't exist
3. Database not initializing properly
4. No clear download links in frontend

---

### Issue #4: Worksheet Tab Navigation Issues
**Problem:** Navigation between tabs may not work smoothly  
**Impact:** User experience degraded  
**Location:** Frontend React components

---

## 🔧 DETAILED FIX IMPLEMENTATION

### FIX #1: Remove Duplicate Question Filtering (HIGH PRIORITY)

**File:** `server/worksheet-generator/services/worksheetService.ts`

**Change:** Remove or modify the bank exclusion logic to allow fresh questions

**Option A - Complete Removal (Recommended for User Request):**
```typescript
// BEFORE (Line 191-194):
const bankExclusions = searchBank({
  grade: config.grade,
  limit: 60,
}).map((b) => b.question.slice(0, 160));

// AFTER:
const bankExclusions: string[] = []; // Always generate fresh questions
```

**Option B - Make it Optional (Better long-term):**
```typescript
// Add to WorksheetConfig type in types/index.ts:
export interface WorksheetConfig {
  // ... existing fields ...
  allowDuplicates?: boolean;  // NEW FIELD
}

// In worksheetService.ts:
const bankExclusions = config.allowDuplicates 
  ? [] 
  : searchBank({ grade: config.grade, limit: 60 }).map((b) => b.question.slice(0, 160));
```

**Frontend Form Addition (Option B):**
```tsx
// In GenerateForm.tsx, add checkbox:
<label>
  <input 
    type="checkbox" 
    checked={config.allowDuplicates ?? true}
    onChange={(e) => setConfig({...config, allowDuplicates: e.target.checked})}
  />
  Allow similar questions (faster generation)
</label>
```

---

### FIX #2: Ensure Directories Exist on Startup

**File:** `server.ts`

**Add this function at the top:**
```typescript
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

function ensureDirectories() {
  const dirs = [
    './data',
    './output',
    './data/questionbank',
    './data/questionbank/backups'
  ];
  
  for (const dir of dirs) {
    const fullPath = resolve(dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
}
```

**Call it before starting server (line 16):**
```typescript
async function startServer() {
  ensureDirectories(); // ADD THIS LINE
  const app = express();
  const PORT = 3000;
  // ... rest of code
}
```

---

### FIX #3: Improve PDF Generation with Better Error Handling

**File:** `server/worksheet-generator/services/pdfPipeline.ts`

**Add after line 100:**
```typescript
): Promise<PdfResult> {
  const browser = findBrowserExecutable();
  if (!browser) {
    throw new Error(
      "No PDF-capable browser found. Install Chrome or Edge. " +
      "Expected locations:\n" + CANDIDATES.join("\n")
    );
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const safeTitle = sanitizeFileName(title);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tempDir = mkdtempSync(join(tmpdir(), "math-pdf-"));
  const htmlPath = join(tempDir, `${safeTitle}.html`);
  const pdfPath = join(OUTPUT_DIR, `${safeTitle}_${timestamp}.pdf`);

  try {
    // Write complete HTML document
    const fs = require("fs");
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; margin: 1in; }
    @page { size: A4; margin: 0.5in; }
    @media print { 
      .no-print { display: none; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    
    fs.writeFileSync(htmlPath, fullHtml, "utf-8");
    console.log(`📄 HTML written to: ${htmlPath}`);

    // Run browser conversion
    await runBrowserPrint(browser, htmlPath, pdfPath);
    console.log(`🖨️ PDF generated: ${pdfPath}`);

    // Verify PDF
    const verification = verifyPdfFile(pdfPath);
    
    return {
      filePath: pdfPath,
      verified: verification.ok,
      pages: verification.pages,
      bytes: verification.bytes,
      browser: browser.includes("chrome") ? "Chrome" : "Edge",
    };
  } catch (err) {
    // Clean up on error
    if (existsSync(pdfPath)) {
      try { unlinkSync(pdfPath); } catch {}
    }
    throw new Error(
      `PDF generation failed: ${err instanceof Error ? err.message : String(err)}`
    );
  } finally {
    // Clean up temp HTML
    try {
      if (existsSync(htmlPath)) unlinkSync(htmlPath);
      if (existsSync(tempDir)) {
        const fs = require("fs");
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn("Temp file cleanup failed:", e);
    }
  }
}
```

---

### FIX #4: Add Download Links in Frontend

**File:** `src/components/worksheet-generator/components/Preview.tsx`

**Check if download section exists, if not add:**
```tsx
// Add after worksheet preview, before export buttons:

{working.docxPath && (
  <div style={{ 
    background: '#f0fdf4', 
    border: '2px solid #22c55e',
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  }}>
    <h4 style={{ margin: 0, marginBottom: 8, color: '#059669' }}>
      ✅ Files Ready for Download
    </h4>
    
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {working.docxPath && (
        <a 
          href={`/api/download/docx/${working.worksheet.id}`}
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 600
          }}
        >
          📄 Download DOCX
        </a>
      )}
      
      {working.pdfPath && (
        <a 
          href={`/api/download/pdf/${working.worksheet.id}`}
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: '#dc2626',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 600
          }}
        >
          📑 Download PDF
        </a>
      )}
    </div>
    
    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
      Files saved to: output/ folder
    </div>
  </div>
)}
```

---

### FIX #5: Add Download API Endpoints

**File:** `server/worksheet-generator/routes/api.ts`

**Add after line 603 (before export default):**
```typescript
// ---------- Direct file download endpoints ----------
router.get("/download/docx/:id", (req, res) => {
  const project = getProject(String(req.params.id));
  if (!project || !project.docxPath || !fsExists(project.docxPath)) {
    return res.status(404).json({ error: "DOCX file not found" });
  }
  
  const fs = require("fs");
  const filename = require("path").basename(project.docxPath);
  
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  
  const fileStream = fs.createReadStream(project.docxPath);
  fileStream.pipe(res);
});

router.get("/download/pdf/:id", (req, res) => {
  const project = getProject(String(req.params.id));
  if (!project || !project.pdfPath || !fsExists(project.pdfPath)) {
    return res.status(404).json({ error: "PDF file not found" });
  }
  
  const fs = require("fs");
  const filename = require("path").basename(project.pdfPath);
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  
  const fileStream = fs.createReadStream(project.pdfPath);
  fileStream.pipe(res);
});
```

---

### FIX #6: Update SavedWorksheets Component

**File:** `src/components/worksheet-generator/components/SavedWorksheets.tsx`

**Ensure download buttons are visible:**
```tsx
// Add download column in the table or card view:
<button
  onClick={async () => {
    const link = document.createElement('a');
    link.href = `/api/download/docx/${project.id}`;
    link.download = `${project.worksheet.title}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  style={{
    padding: '6px 12px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13
  }}
>
  📄 DOCX
</button>

{project.pdfPath && (
  <button
    onClick={async () => {
      const link = document.createElement('a');
      link.href = `/api/download/pdf/${project.id}`;
      link.download = `${project.worksheet.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }}
    style={{
      padding: '6px 12px',
      background: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 13
    }}
  >
    📑 PDF
  </button>
)}
```

---

### FIX #7: Improve Question Generation Notification

**File:** `src/components/worksheet-generator/App.tsx`

**Update the notice display (around line 630):**
```tsx
{working?.notice && (
  <div
    className="notice"
    style={{
      background: working.notice.includes('unavailable') ? '#fef3c7' : '#dbeafe',
      border: `2px solid ${working.notice.includes('unavailable') ? '#fbbf24' : '#3b82f6'}`,
      borderRadius: 8,
      padding: '12px 16px',
      margin: '10px 0',
      whiteSpace: 'pre-wrap',
    }}
  >
    <strong>ℹ️ Generation Info:</strong> {working.notice}
  </div>
)}

{/* Add success message for fresh questions */}
{working?.worksheet && (
  <div style={{
    background: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: 8,
    padding: '12px 16px',
    margin: '10px 0'
  }}>
    ✅ Generated {working.worksheet.questions.length} fresh questions 
    for {working.worksheet.config.topic} ({working.worksheet.config.grade})
  </div>
)}
```

---

## 🔄 IMPLEMENTATION SEQUENCE

### Phase 1: Critical Infrastructure (Do First)
1. ✅ Create `.env.local` file - **ALREADY DONE**
2. 🔧 Add `ensureDirectories()` function to `server.ts`
3. 🔧 Test server starts without errors

### Phase 2: Fix Question Generation (Immediate Impact)
4. 🔧 Modify `worksheetService.ts` - Remove duplicate checking
5. 🔧 Test worksheet generation creates new questions every time
6. 🔧 Verify questions are saved to database

### Phase 3: Fix PDF Generation (High Priority)
7. 🔧 Update `pdfPipeline.ts` with improved error handling
8. 🔧 Test PDF generation with sample worksheet
9. 🔧 Verify PDF file is created in `output/` folder

### Phase 4: Fix Downloads (User Visibility)
10. 🔧 Add download endpoints to `api.ts`
11. 🔧 Update `Preview.tsx` with download links
12. 🔧 Update `SavedWorksheets.tsx` with download buttons
13. 🔧 Test complete workflow: Generate → Export → Download

### Phase 5: Polish & Testing
14. 🔧 Update notifications in frontend
15. 🔧 Test all tabs work correctly
16. 🔧 Test complete user journey
17. 🔧 Verify files are accessible

---

## 🧪 TESTING CHECKLIST

### Test 1: Fresh Question Generation
- [ ] Generate worksheet for "Algebra - Grade 10"
- [ ] Generate another worksheet for same topic
- [ ] Verify questions are different
- [ ] Check database has both sets of questions

### Test 2: PDF Export
- [ ] Generate a worksheet
- [ ] Click "Export PDF"
- [ ] Verify no errors in console
- [ ] Check `output/` folder has PDF file
- [ ] Open PDF and verify content is correct

### Test 3: File Downloads
- [ ] Generate worksheet and export DOCX
- [ ] Click "Download DOCX" button
- [ ] Verify file downloads to browser
- [ ] Repeat for PDF
- [ ] Open both files and verify content

### Test 4: Saved Worksheets
- [ ] Go to "Saved Worksheets" tab
- [ ] Verify all generated worksheets appear
- [ ] Click download buttons
- [ ] Verify files download correctly

### Test 5: Navigation
- [ ] Test all tab transitions work
- [ ] Verify no console errors
- [ ] Check browser back/forward buttons work

---

## 📋 FILES TO MODIFY

| Priority | File | Changes | Lines |
|----------|------|---------|-------|
| 🔴 HIGH | `server.ts` | Add `ensureDirectories()` | +20 |
| 🔴 HIGH | `server/worksheet-generator/services/worksheetService.ts` | Remove duplicate checking | ~3 |
| 🔴 HIGH | `server/worksheet-generator/routes/api.ts` | Add download endpoints | +40 |
| 🟡 MEDIUM | `server/worksheet-generator/services/pdfPipeline.ts` | Improve error handling | +30 |
| 🟡 MEDIUM | `src/components/worksheet-generator/components/Preview.tsx` | Add download links | +50 |
| 🟢 LOW | `src/components/worksheet-generator/components/SavedWorksheets.tsx` | Add download buttons | +30 |
| 🟢 LOW | `src/components/worksheet-generator/App.tsx` | Update notifications | +20 |

**Total Changes:** ~193 lines across 7 files

---

## ⚠️ POTENTIAL RISKS & MITIGATIONS

### Risk 1: Removing Duplicate Check May Cause Database Growth
**Mitigation:** Question bank already has monthly backups. Add cleanup tool later if needed.

### Risk 2: PDF Generation May Fail if Browser Not Found
**Mitigation:** Clear error message tells user to install Chrome/Edge. DOCX export still works.

### Risk 3: File Paths on Windows
**Mitigation:** Using Node.js `path` module for cross-platform compatibility.

---

## 🎯 EXPECTED OUTCOMES

After implementing all fixes:

1. ✅ **Fresh Questions Every Time** - No duplicate checking, always new content
2. ✅ **PDF Generation Works** - Users can export to PDF format
3. ✅ **Easy Downloads** - Clear download buttons in UI
4. ✅ **All Files Saved** - Worksheets persist in database
5. ✅ **Better UX** - Clear notifications and error messages
6. ✅ **Stable Navigation** - All tabs work smoothly

---

## 📞 SUPPORT INFORMATION

### Common Errors & Solutions

**Error:** "No PDF-capable browser found"  
**Solution:** Install Google Chrome or Microsoft Edge

**Error:** "ENOENT: no such file or directory, open 'output/...'"  
**Solution:** Run server once after fixes, it will auto-create directories

**Error:** "Database is locked"  
**Solution:** Close any other instances of the application

**Error:** "API key invalid"  
**Solution:** Check `.env.local` has correct Gemini API key

---

## ✅ READY TO IMPLEMENT

All fixes are documented with:
- ✅ Exact file locations
- ✅ Line numbers where applicable
- ✅ Complete code snippets
- ✅ Testing procedures
- ✅ Risk mitigations

**Next Step:** Shall I implement these fixes now?

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-23 11:21 AM  
**Status:** Ready for Implementation
