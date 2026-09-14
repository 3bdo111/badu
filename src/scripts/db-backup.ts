import { backupDatabase } from "../lib/db/backup";

async function main() {
  console.log("=== BADU E-COMMERCE DATABASE BACKUP ===");
  try {
    const customPath = process.argv[2];
    const result = await backupDatabase(customPath);
    console.log(`✓ Backup successfully created!`);
    console.log(`  Path: ${result.backupPath}`);
    console.log(`  Size: ${(result.sizeBytes / 1024).toFixed(2)} KB`);
    console.log(`  Integrity Check: ${result.integrityResult}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Backup failed: ${msg}`);
    process.exit(1);
  }
}

main();
