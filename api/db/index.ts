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
    try {
      const buf = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buf);
    } catch (e) {
      console.warn('[DB] Failed to load existing db, creating new:', e);
      db = new SQL.Database();
    }
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
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    console.error('[DB] Persist failed:', e);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * 执行 SELECT 查询并返回对象数组
 * 使用 sql.js 的 exec + 列名映射方式，兼容预处理语句不可用的多行查询场景
 */
export function queryAll<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  const results: T[] = [];
  try {
    stmt.bind(params as (string | number | null)[]);
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
  } finally {
    stmt.free();
  }
  return results;
}

/**
 * 执行 SELECT 查询并返回首行对象（null 表示无结果）
 */
export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 执行 INSERT / UPDATE / DELETE 等写操作
 */
export function execute(sql: string, params: unknown[] = []): number {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  try {
    stmt.bind(params as (string | number | null)[]);
    stmt.step();
  } finally {
    stmt.free();
  }
  persistDatabase();
  return database.getRowsModified() || 0;
}

/**
 * 查询是否存在（返回 true/false）
 */
export function exists(sql: string, params: unknown[] = []): boolean {
  const row = queryOne<{ c: number }>(`SELECT EXISTS(${sql}) AS c`, params);
  return !!row && row.c === 1;
}
