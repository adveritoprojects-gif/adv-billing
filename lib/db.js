import fs from "fs";
import path from "path";

// Simple JSON-file data store. Good enough for a clinic prototype running
// on a single Node server (npm run dev / npm run start on a VM). If you
// later deploy to a platform with a read-only or ephemeral filesystem
// (e.g. Vercel serverless), swap this module for a real database (Postgres,
// SQLite via a mounted volume, etc.) — every API route only talks to the
// three functions exported here, so that's the one place to change.

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const EMPTY_DB = { patients: [], xrays: [], invoices: [] };

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
  }
}

export function readDB() {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { ...EMPTY_DB };
  }
}

export function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Generates a short readable id like "P-4821" that doesn't collide with
// any id already in use.
export function uid(prefix, existingIds = []) {
  let id;
  do {
    id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (existingIds.includes(id));
  return id;
}
