import { readFileSync, writeFileSync, existsSync } from 'fs';

const DB_PATH = './data/worksheets.json';

interface Database {
  getWorksheets: () => any[];
  saveWorksheet: (ws: any) => void;
  getWorksheetById: (id: string) => any;
  deleteWorksheet: (id: string) => boolean;
}

const db: Database = {
  getWorksheets: () => {
    if (!existsSync(DB_PATH)) return [];
    return JSON.parse(readFileSync(DB_PATH, 'utf8'));
  },
  saveWorksheet: (ws: any) => {
    const worksheets = db.getWorksheets();
    worksheets.push(ws);
    writeFileSync(DB_PATH, JSON.stringify(worksheets, null, 2));
  },
  getWorksheetById: (id: string) => {
    return db.getWorksheets().find((w: any) => w.id === id);
  },
  deleteWorksheet: (id: string) => {
    const worksheets = db.getWorksheets().filter((w: any) => w.id !== id);
    writeFileSync(DB_PATH, JSON.stringify(worksheets, null, 2));
    return true;
  }
};

export { db };