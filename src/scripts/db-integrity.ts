import { checkDatabaseIntegrity } from "../lib/db/backup";

function main() {
  console.log("=== BADU E-COMMERCE DATABASE INTEGRITY CHECK ===");
  const targetPath = process.argv[2];

  const result = checkDatabaseIntegrity(targetPath);
  if (result.ok) {
    console.log(`✓ Database Integrity Check Passed! (${result.result})`);
  } else {
    console.error(`❌ Database Integrity Check Failed: ${result.result}`);
    process.exit(1);
  }
}

main();
