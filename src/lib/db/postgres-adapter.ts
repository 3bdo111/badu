import { Pool as NeonPool, PoolClient as NeonPoolClient } from "@neondatabase/serverless";
import type { BaduDatabase, RunResult, SqlValue } from "./adapter";
import { rewritePositionalParams } from "./adapter";
import { POSTGRES_SCHEMA } from "./schema-postgres";

export interface PostgresAdapterOptions {
  /** Postgres connection string, e.g. postgresql://... or postgres://... */
  connectionString: string;
  /** Max clients in the pool. Keep small on serverless (per-instance reuse only). */
  max?: number;
  /**
   * Driver selection: "neon" (default, @neondatabase/serverless — required for
   * serverless platforms such as Vercel, connects via Neon's secure WebSocket
   * proxy) or "pg" (node-postgres over TCP — for local/non-serverless hosts).
   * Override with env PG_DRIVER.
   */
  driver?: "neon" | "pg";
}

interface PgClient {
  query<T>(text: string, params?: readonly SqlValue[]): Promise<{ rows: T[]; rowCount: number | null }>;
}

function createClientHandle(dialectClient: PgClient): BaduDatabase {
  const normalize = (params?: readonly SqlValue[]): SqlValue[] =>
    (params ?? []).map((p) => (p === undefined ? null : p));

  return {
    dialect: "postgres",

    async all<T>(sql: string, params?: readonly SqlValue[]): Promise<T[]> {
      const res = await dialectClient.query<T>(rewritePositionalParams(sql), normalize(params));
      return res.rows;
    },

    async get<T>(sql: string, params?: readonly SqlValue[]): Promise<T | undefined> {
      const res = await dialectClient.query<T>(rewritePositionalParams(sql), normalize(params));
      return res.rows[0];
    },

    async run(sql: string, params?: readonly SqlValue[]): Promise<RunResult> {
      const res = await dialectClient.query(rewritePositionalParams(sql), normalize(params));
      return { changes: res.rowCount ?? 0 };
    },

    async exec(sql: string): Promise<void> {
      await dialectClient.query(sql);
    },

    // Pool-level transaction: checks out a dedicated client for the duration.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async transaction<T>(_fn: (tx: BaduDatabase) => Promise<T>): Promise<T> {
      throw new Error("Pool-level transaction is unavailable; transactions must come from a checked-out client.");
    },
  };
}

/**
 * Production adapter backed by a managed PostgreSQL database (Neon) through
 * @neondatabase/serverless. Uses a small connection pool so warm serverless
 * instances reuse connections instead of creating one per request.
 */
export function createPostgresAdapter(options: PostgresAdapterOptions): BaduDatabase {
  const pool = new NeonPool({
    connectionString: options.connectionString,
    max: options.max ?? Number(process.env.PGPOOL_MAX ?? 5),
    // Neon requires TLS; sslmode is part of the connection string.
  });

  const poolHandle = createClientHandle({
    query: async <T>(text: string, params?: readonly SqlValue[]) => {
      const res = await pool.query(text, params ? [...params] : []);
      return { rows: res.rows as unknown as T[], rowCount: res.rowCount };
    },
  });

  // Ensure schema exists (idempotent, cheap) and surface connection errors early.
  const ready = poolHandle.exec(POSTGRES_SCHEMA).then(() => undefined);

  return {
    dialect: "postgres",

    all: (sql, params) => ready.then(() => poolHandle.all(sql, params)),
    get: (sql, params) => ready.then(() => poolHandle.get(sql, params)),
    run: (sql, params) => ready.then(() => poolHandle.run(sql, params)),
    exec: (sql) => ready.then(() => poolHandle.exec(sql)),

    async transaction<T>(fn: (tx: BaduDatabase) => Promise<T>): Promise<T> {
      await ready;
      const client: NeonPoolClient = await pool.connect();
      const txHandle = createClientHandle({
        query: async <T>(text: string, params?: readonly SqlValue[]) => {
          const res = await client.query(text, params ? [...params] : []);
          return { rows: res.rows as unknown as T[], rowCount: res.rowCount };
        },
      });
      try {
        await client.query("BEGIN");
        const result = await fn(txHandle);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // connection-level failure; client is released below
        }
        throw err;
      } finally {
        client.release();
      }
    },
  };
}
