import { spawn } from "child_process";
import fs, { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync, renameSync, copyFileSync } from "fs";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { OUTPUT_DIR } from "../config";
import { sanitizeFileName } from "../utils";

/**
 * PDF export pipeline (Windows).
 * Converts the worksheet HTML rendering to PDF using a local headless
 * Chromium-based browser (Microsoft Edge is present on all modern Windows
 * installs; Google Chrome is used when available). This is the most reliable
 * Windows-native conversion path without external Office dependencies.
 *
 * Pipeline: HTML -> headless print-to-PDF -> verification (%PDF header,
 * size threshold, page-count estimate) -> final export location.
 */

const CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

export function findBrowserExecutable(): string | null {
  for (const p of CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

export interface PdfResult {
  filePath: string;
  verified: boolean;
  pages: number;
  bytes: number;
  browser: string;
}

function runBrowserPrint(browserExe: string, htmlPath: string, pdfPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ];
    const proc = spawn(browserExe, args, { windowsHide: true });
    let stderr = "";
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error("PDF conversion timed out after 60s"));
    }, 60_000);
    proc.on("error", (e) => { clearTimeout(timer); reject(new Error(`Failed to launch browser: ${e.message}`)); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0 && existsSync(pdfPath)) resolve();
      else reject(new Error(`Browser exited with code ${code}. ${stderr.slice(0, 400)}`));
    });
  });
}

export interface PdfVerification {
  ok: boolean;
  pages: number;
  bytes: number;
  issues: string[];
}

/** Verification step before final PDF export. */
export function verifyPdfFile(pdfPath: string): PdfVerification {
  const issues: string[] = [];
  if (!existsSync(pdfPath)) {
    return { ok: false, pages: 0, bytes: 0, issues: ["PDF file was not created."] };
  }
  const bytes = statSync(pdfPath).size;
  if (bytes < 1024) issues.push(`PDF file suspiciously small (${bytes} bytes).`);
  const header = readFileSync(pdfPath).subarray(0, 5).toString("latin1");
  if (!header.startsWith("%PDF-")) issues.push("File does not start with %PDF header - not a valid PDF.");
  // Estimate page count from /Type /Page occurrences (works for Chromium output).
  const raw = readFileSync(pdfPath, "latin1");
  const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length || 1;
  if (pages < 1) issues.push("No pages detected in PDF.");
  return { ok: issues.length === 0, pages, bytes, issues };
}

/** Full DOCX-verified -> PDF export for a worksheet HTML string. */
export async function exportWorksheetToPdf(
  worksheetId: string,
  title: string,
  html: string,
  outDir = OUTPUT_DIR
): Promise<PdfResult> {
  const browserExe = findBrowserExecutable();
  if (!browserExe) {
    throw new Error(
      "No suitable browser found for PDF conversion. Install Microsoft Edge (pre-installed on Windows 10/11) or Google Chrome."
    );
  }

  const tmp = mkdtempSync(join(tmpdir(), "mws-pdf-"));
  const htmlPath = join(tmp, "worksheet.html");
  const tmpPdf = join(tmp, "worksheet.pdf");

  try {
    const htmlWithBom = "\uFEFF" + html; // ensure correct encoding of ₹ and Indian text
    writeFileSync(htmlPath, htmlWithBom, "utf-8");
    await runBrowserPrint(browserExe, htmlPath, tmpPdf);

    const verification = verifyPdfFile(tmpPdf);
    if (!verification.ok) {
      throw new Error(`PDF verification failed: ${verification.issues.join(" ")}`);
    }

    mkdirSync(outDir, { recursive: true });
    const filePath = join(outDir, `${sanitizeFileName(title)}_${worksheetId}.pdf`);
    try { unlinkSync(filePath); } catch { /* not present */ }
    
    try {
      renameSync(tmpPdf, filePath);
    } catch {
      // Temp dir may be on a different drive (EXDEV): copy instead of rename.
      copyFileSync(tmpPdf, filePath);
    }

    const recheck = verifyPdfFile(filePath);
    return {
      filePath,
      verified: recheck.ok,
      pages: recheck.pages,
      bytes: recheck.bytes,
      browser: browserExe.includes("chrome") ? "Google Chrome (headless)" : "Microsoft Edge (headless)",
    };
  } finally {
    try { unlinkSync(htmlPath); } catch { /* ignore */ }
    try { unlinkSync(tmpPdf); } catch { /* ignore */ }
  }
}
