import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '..', '..', 'data', 'pinyutuan.db');

let db: Database | null = null;

const DDL = `
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    initiator TEXT NOT NULL,
    fish_type TEXT NOT NULL,
    min_quantity INTEGER NOT NULL CHECK(min_quantity >= 3),
    deadline TEXT NOT NULL,
    pickup_point TEXT NOT NULL CHECK(pickup_point IN ('甲', '乙', '丙')),
    current_quantity INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'collecting' CHECK(status IN ('collecting', 'success', 'failed')),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participations (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    created_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    UNIQUE(group_id, nickname)
);

CREATE INDEX IF NOT EXISTS idx_participations_nickname ON participations(nickname);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
`;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run(DDL);
  persistDatabase();
  return db;
}

export function getDatabase(): Database {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function persistDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
