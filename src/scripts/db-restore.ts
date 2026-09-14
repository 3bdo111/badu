import { restoreDatabase } from "../lib/db/backup";

async function main() {
  console.log("=== BADU E-COMMERCE DATABASE RESTORE ===");
  const backupFile = process.argv[2];

  if (!backupFile) {
    console.error("Usage: npm run db:restore -- <path-to-backup-file.db>");
    process.exit(1);
  }

  try {
    console.log(`Starting restoration from: ${backupFile}`);
    const result = await restoreDatabase(backupFile);
    console.log(`✓ Database successfully restored!`);
    console.log(`  Safety Copy Saved At: ${result.safetyBackupPath}`);
    console.log(`  Live DB Restored At: ${result.restoredPath}`);
    console.log(`  Integrity Check: ${result.integrityResult}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Restore failed: ${msg}`);
    process.exit(1);
  }
}

main();
