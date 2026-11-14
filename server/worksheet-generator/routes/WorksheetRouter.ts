import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { Router, Request, Response } from "express";
import { api } from "../api";
import { validateConfig } from "../services/schemas";
import { validateWorksheet } from "../services/composer";
import { renderWorksheetToDocx } from "../services/docxRenderer";
import { renderWorksheetToHtml } from "../services/htmlRenderer";
import { generatePDF as exportWorksheetToPdf, findBrowserExecutable, verifyPdfFile } from '../services/pdfPipeline';
import { finalVerification } from "../services/finalVerification";
import { bankStats, searchBank } from "../services/questionBank";
import {
  atlasSize,
  getAtlasChapters,
  getAtlasGrades,
  searchAtlas,
} from "../services/curriculumAtlas";
import {
  BOARDS,
  GRADES,
  QUESTION_TYPES,
  DIFFICULTIES,
  TEMPLATE_IDS,
  TEMPLATE_INFO,
  DEFAULT_INSTITUTION_NAME,
  OUTPUT_DIR,
} from "../config";
import {
  getCurriculumByGrade,
  getAllGrades,
  searchCurriculum,
  listProjects,
  getProject,
  saveProject,
  deleteProject,
  addExportRecord,
  getExportHistory,
  listCurriculum,
  addCurriculum,
  deleteCurriculum,
} from "../db/database";
import { Worksheet, WorksheetConfig } from "../types";

const router = Router();

const fsExists = (p: string): boolean => {
  try {
    return require("fs").existsSync(p);
  } catch {
    return false;
  }
};

// ... rest of the code
