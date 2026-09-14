import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

function escapePgValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val.toString();
  if (typeof val === "boolean") return val ? "1" : "0";
  // Escape single quotes for SQL string literal
  const escaped = String(val).replace(/'/g, "''");
  return `'${escaped}'`;
}

function runExport() {
  console.log("=== BADU SQLITE TO POSTGRESQL DATA MIGRATION ENGINE ===");
  const sqliteDbPath = path.join(process.cwd(), "data", "badu.db");

  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`❌ Source database file not found at ${sqliteDbPath}`);
    process.exit(1);
  }

  const db = new Database(sqliteDbPath, { readonly: true });

  const tables = [
    "products",
    "product_images",
    "product_colors",
    "product_stock",
    "admin_users",
    "admin_sessions",
    "orders",
    "order_items",
    "storefront_sections",
  ];

  const counts: Record<string, number> = {};
  let sqlDump = `-- BADU E-COMMERCE POSTGRESQL DML EXPORT DUMP\n-- Generated At: ${new Date().toISOString()}\n\n`;

  // Read DDL schema file if available
  const ddlPath = path.join(process.cwd(), "src", "lib", "db", "pg-schema.sql");
  if (fs.existsSync(ddlPath)) {
    sqlDump += fs.readFileSync(ddlPath, "utf-8") + "\n\n";
  }

  for (const table of tables) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];
    counts[table] = rows.length;
    console.log(`[Source] Table '${table}': ${rows.length} rows read`);

    if (rows.length === 0) continue;

    const cols = Object.keys(rows[0]);
    const colList = cols.join(", ");

    sqlDump += `-- DATA FOR TABLE: ${table}\n`;
    for (const row of rows) {
      const valList = cols.map((col) => escapePgValue(row[col])).join(", ");
      sqlDump += `INSERT INTO ${table} (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;\n`;
    }
    sqlDump += "\n";
  }

  const dumpOutputPath = path.join(process.cwd(), "data", "badu-pg-dump.sql");
  fs.writeFileSync(dumpOutputPath, sqlDump, "utf-8");

  console.log("\n==================================================");
  console.log(`✓ PostgreSQL Migration SQL Dump successfully generated!`);
  console.log(`  Output Path: ${dumpOutputPath}`);
  console.log(`  Output File Size: ${(fs.statSync(dumpOutputPath).size / 1024).toFixed(2)} KB`);
  console.log("\nVerified Source Counts:");
  for (const [tbl, cnt] of Object.entries(counts)) {
    console.log(`  - ${tbl}: ${cnt}`);
  }
}

runExport();
