import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export interface BackupResult {
  success: boolean;
  backupPath: string;
  sizeBytes: number;
  integrityResult: string;
}

export interface IntegrityResult {
  ok: boolean;
  result: string;
}

export interface RestoreResult {
  success: boolean;
  safetyBackupPath: string;
  restoredPath: string;
  integrityResult: string;
}

export function getLiveDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }
  return path.join(process.cwd(), "data", "badu.db");
}

export function checkDatabaseIntegrity(targetDbPath?: string): IntegrityResult {
  const dbPathToTest = targetDbPath ? path.resolve(targetDbPath) : getLiveDatabasePath();
  if (!fs.existsSync(dbPathToTest)) {
    return { ok: false, result: `Database file does not exist at ${dbPathToTest}` };
  }

  let tempDb: Database.Database | undefined;
  try {
    tempDb = new Database(dbPathToTest, { readonly: true });
    const row = tempDb.prepare("PRAGMA integrity_check;").get() as { integrity_check?: string } | undefined;
    const resultText = row ? Object.values(row)[0] || "ok" : "ok";
    const ok = resultText.toLowerCase() === "ok";
    return { ok, result: resultText };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to check integrity";
    return { ok: false, result: msg };
  } finally {
    if (tempDb) {
      tempDb.close();
    }
  }
}

export async function backupDatabase(customDestPath?: string): Promise<BackupResult> {
  const liveDbPath = getLiveDatabasePath();
  if (!fs.existsSync(liveDbPath)) {
    throw new Error(`Live database file does not exist at ${liveDbPath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "data", "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const destPath = customDestPath
    ? path.resolve(customDestPath)
    : path.join(backupDir, `badu-${timestamp}.db`);

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Open temporary connection to liveDbPath for native SQLite backup
  const sourceDb = new Database(liveDbPath);
  try {
    await sourceDb.backup(destPath);
  } finally {
    sourceDb.close();
  }

  const stats = fs.statSync(destPath);
  const integrity = checkDatabaseIntegrity(destPath);

  if (!integrity.ok) {
    throw new Error(`Backup created at ${destPath} failed integrity check: ${integrity.result}`);
  }

  return {
    success: true,
    backupPath: destPath,
    sizeBytes: stats.size,
    integrityResult: integrity.result,
  };
}

export async function restoreDatabase(backupFilePath: string): Promise<RestoreResult> {
  const resolvedBackupPath = path.resolve(backupFilePath);

  if (!fs.existsSync(resolvedBackupPath)) {
    throw new Error(`Backup file does not exist at ${resolvedBackupPath}`);
  }

  // 1. Verify integrity of the backup file first
  const backupIntegrity = checkDatabaseIntegrity(resolvedBackupPath);
  if (!backupIntegrity.ok) {
    throw new Error(`Cannot restore invalid backup file. Integrity check failed: ${backupIntegrity.result}`);
  }

  const liveDbPath = getLiveDatabasePath();
  const backupDir = path.join(process.cwd(), "data", "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 2. Create safety snapshot of live database before touching it
  const safetyTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safetyBackupPath = path.join(backupDir, `safety-before-restore-${safetyTimestamp}.db`);

  if (fs.existsSync(liveDbPath)) {
    const liveSourceDb = new Database(liveDbPath);
    try {
      await liveSourceDb.backup(safetyBackupPath);
    } finally {
      liveSourceDb.close();
    }
  }

  // 3. Perform restoration by copying backup file over live database location
  // Close active singleton connection if exists
  const g = globalThis as unknown as Record<string, { close: () => void } | undefined>;
  if (g._baduSqliteDb) {
    try {
      g._baduSqliteDb.close();
    } catch {
      // Ignore
    }
    g._baduSqliteDb = undefined;
  }

  fs.copyFileSync(resolvedBackupPath, liveDbPath);

  // Clean up any stale -wal and -shm sidecar files for live DB
  const walPath = `${liveDbPath}-wal`;
  const shmPath = `${liveDbPath}-shm`;
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

  // 4. Verify integrity of restored database
  const restoredIntegrity = checkDatabaseIntegrity(liveDbPath);
  if (!restoredIntegrity.ok) {
    throw new Error(`Post-restore integrity check failed: ${restoredIntegrity.result}`);
  }

  return {
    success: true,
    safetyBackupPath,
    restoredPath: liveDbPath,
    integrityResult: restoredIntegrity.result,
  };
}
