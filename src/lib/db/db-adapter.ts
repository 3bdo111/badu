export type DbEngine = "sqlite" | "postgres";

export function getActiveDbEngine(): DbEngine {
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (pgUrl && (pgUrl.startsWith("postgres://") || pgUrl.startsWith("postgresql://"))) {
    return "postgres";
  }
  return "sqlite";
}

export function convertSqlToPg(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

export type SqlParam = string | number | boolean | null | undefined;
