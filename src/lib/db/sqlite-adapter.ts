import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { BaduDatabase, RunResult, SqlValue } from "./adapter";
import { SQLITE_SCHEMA, SQLITE_PRAGMAS, runSqliteMigrations } from "./schema-sqlite";

export interface SqliteAdapterOptions {
  /** Database file path. Defaults to <cwd>/data/badu.db */
  dbPath?: string;
}

/**
 * Development adapter backed by better-sqlite3.
 * All statements are synchronous underneath; async methods resolve immediately,
 * which keeps transaction callbacks (BEGIN IMMEDIATE..COMMIT) safe to await.
 */
export function createSqliteAdapter(options: SqliteAdapterOptions = {}): BaduDatabase {
  const dbPath = options.dbPath
    ? path.resolve(options.dbPath)
    : path.join(process.cwd(), "data", "badu.db");

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  for (const pragma of SQLITE_PRAGMAS) {
    sqlite.pragma(pragma);
  }
  sqlite.exec(SQLITE_SCHEMA);
  runSqliteMigrations(sqlite);

  const normalize = (params?: readonly SqlValue[]): SqlValue[] =>
    (params ?? []).map((p) => (p === undefined ? null : p));

  const adapter: BaduDatabase = {
    dialect: "sqlite",

    async all<T>(sql: string, params?: readonly SqlValue[]): Promise<T[]> {
      return sqlite.prepare(sql).all(...normalize(params)) as T[];
    },

    async get<T>(sql: string, params?: readonly SqlValue[]): Promise<T | undefined> {
      return sqlite.prepare(sql).get(...normalize(params)) as T | undefined;
    },

    async run(sql: string, params?: readonly SqlValue[]): Promise<RunResult> {
      const info = sqlite.prepare(sql).run(...normalize(params));
      return { changes: info.changes };
    },

    async exec(sql: string): Promise<void> {
      sqlite.exec(sql);
    },

    async transaction<T>(fn: (tx: BaduDatabase) => Promise<T>): Promise<T> {
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const result = await fn(adapter);
        sqlite.exec("COMMIT");
        return result;
      } catch (err) {
        try {
          sqlite.exec("ROLLBACK");
        } catch {
          // already rolled back
        }
        throw err;
      }
    },
  };

  return adapter;
}
