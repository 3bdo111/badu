import type { BaduDatabase } from "./adapter";
import { createSqliteAdapter } from "./sqlite-adapter";
import { createPostgresAdapter } from "./postgres-adapter";
import { seedDatabase } from "./seed";

export type { BaduDatabase, SqlValue, RunResult } from "./adapter";

/**
 * Database selection — explicit, with no silent production fallback:
 *
 *   DATABASE_URL set  → PostgreSQL (production / Vercel)
 *   otherwise, dev    → SQLite at DATABASE_PATH or ./data/badu.db
 *   otherwise, prod   → hard failure at startup
 */
function createDatabase(): Promise<BaduDatabase> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.trim()) {
    const init = (async () => {
      const db = createPostgresAdapter({ connectionString: databaseUrl });
      await seedDatabase(db);
      return db;
    })();
    return init;
  }

  if (process.env.NODE_ENV === "production") {
    return Promise.reject(
      new Error(
        "[badu] DATABASE_URL is required in production. " +
          "Refusing to fall back to local SQLite. Set DATABASE_URL to a managed PostgreSQL connection string."
      )
    );
  }

  const db = createSqliteAdapter({ dbPath: process.env.DATABASE_PATH });
  return seedDatabase(db).then(() => db);
}

// Singleton init cached across Next.js hot reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var _baduDbInit: Promise<BaduDatabase> | undefined;
}

const dbInit: Promise<BaduDatabase> =
  global._baduDbInit ??
  (global._baduDbInit = createDatabase().catch((err) => {
    // Do not cache a failed init — allow retry after config fix.
    global._baduDbInit = undefined;
    throw err;
  }));

/**
 * Resolve the shared database handle. Schema creation and seeding run once
 * per process (empty tables only — migrated data is never overwritten).
 */
export function getDb(): Promise<BaduDatabase> {
  return dbInit;
}

/** True when running against PostgreSQL (production). */
export async function isPostgres(): Promise<boolean> {
  return (await dbInit).dialect === "postgres";
}
