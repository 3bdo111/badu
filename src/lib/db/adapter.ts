/**
 * Dialect-neutral database access layer.
 *
 * BADU runs on two explicit configurations:
 *   - Development:  SQLite via better-sqlite3 (local file)
 *   - Production:   PostgreSQL via @neondatabase/serverless (Neon, Vercel-compatible)
 *
 * Selection is explicit (see db.ts): production refuses to start without
 * DATABASE_URL — there is no silent fallback to SQLite.
 *
 * SQL conventions shared by both dialects:
 *   - positional "?" placeholders (rewritten to $1..$n for PostgreSQL)
 *   - flag columns stored as INTEGER 0/1 on both dialects
 *   - timestamps stored as TEXT (ISO-8601)
 *   - no dialect-specific SQL outside schema definitions
 */

export type SqlValue = string | number | null;

export interface RunResult {
  /** Number of rows affected by INSERT/UPDATE/DELETE. */
  changes: number;
}

export interface BaduDatabase {
  readonly dialect: "sqlite" | "postgres";
  all<T = Record<string, unknown>>(sql: string, params?: readonly SqlValue[]): Promise<T[]>;
  get<T = Record<string, unknown>>(sql: string, params?: readonly SqlValue[]): Promise<T | undefined>;
  run(sql: string, params?: readonly SqlValue[]): Promise<RunResult>;
  exec(sql: string): Promise<void>;
  /**
   * Run fn inside a transaction. fn receives a transaction-scoped handle that
   * MUST be used for every statement inside the callback. Rolls back on throw.
   */
  transaction<T>(fn: (tx: BaduDatabase) => Promise<T>): Promise<T>;
}

/**
 * Rewrite "?" positional placeholders to PostgreSQL "$1..$n" style.
 * Question marks inside single/double-quoted string literals are ignored.
 */
export function rewritePositionalParams(sql: string): string {
  let out = "";
  let index = 0;
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inSingle) {
      out += ch;
      if (ch === "'" && sql[i + 1] === "'") {
        out += "'";
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      out += ch;
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      out += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      out += ch;
      continue;
    }
    if (ch === "?") {
      index += 1;
      out += `$${index}`;
      continue;
    }
    out += ch;
  }

  return out;
}
