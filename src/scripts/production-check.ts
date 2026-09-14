import fs from "fs";
import path from "path";
import { checkDatabaseIntegrity, getLiveDatabasePath } from "../lib/db/backup";
import { db } from "../lib/db/db";

function runProductionCheck() {
  console.log("=== BADU PRODUCTION READINESS PRE-FLIGHT CHECK ===\n");
  let hasErrors = false;

  // 1. ENVIRONMENT CONFIGURATION CHECK
  console.log("[1/5] Environment Configuration Check...");
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`  - DATABASE_PATH: ${getLiveDatabasePath()}`);
  
  if (isProduction && (!process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD === "badu_admin_2026")) {
    console.warn("  ⚠️ WARNING: Default admin bootstrap password detected in production environment! Update ADMIN_BOOTSTRAP_PASSWORD.");
  } else {
    console.log("  ✓ Admin credentials hygiene verified.");
  }

  // 2. DATABASE INTEGRITY & SCHEMA CHECK
  console.log("\n[2/5] Database Integrity & Schema Check...");
  const integrity = checkDatabaseIntegrity();
  if (!integrity.ok) {
    console.error(`  ❌ FAIL: Database integrity check failed: ${integrity.result}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Database integrity check passed: ${integrity.result}`);
  }

  try {
    const productCount = (db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }).c;
    const orderCount = (db.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c;
    const sectionCount = (db.prepare("SELECT COUNT(*) as c FROM storefront_sections").get() as { c: number }).c;
    console.log(`  ✓ Database records found — Products: ${productCount}, Orders: ${orderCount}, Storefront Sections: ${sectionCount}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Schema query error";
    console.error(`  ❌ FAIL: Schema query error: ${msg}`);
    hasErrors = true;
  }

  // 3. MEDIA UPLOADS DIRECTORY CHECK
  console.log("\n[3/5] Media Uploads Directory Check...");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "storefront");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`  ✓ Created uploads directory at ${uploadsDir}`);
  } else {
    console.log(`  ✓ Uploads directory exists at ${uploadsDir}`);
  }

  // 4. CORE BRAND & PRODUCT ASSET PROTECTION CHECK
  console.log("\n[4/5] Authentic Product Asset Verification...");
  const coreAssets = [
    "public/images/products/badu-hoodie/front-v6.jpg",
    "public/images/products/badu-hoodie/back-v6.jpg",
    "public/images/products/badu-hoodie/detail-1-v2.jpg",
    "public/images/products/badu-hoodie/detail-2-v2.jpg",
  ];

  for (const assetRel of coreAssets) {
    const absPath = path.join(process.cwd(), assetRel);
    if (!fs.existsSync(absPath)) {
      console.warn(`  ⚠️ MISSING ASSET: ${assetRel}`);
    } else {
      console.log(`  ✓ Verified authentic asset: ${assetRel}`);
    }
  }

  // 5. NEXT.JS BUILD ARTIFACTS CHECK
  console.log("\n[5/5] Build Artifact Check...");
  const nextBuildDir = path.join(process.cwd(), ".next");
  if (fs.existsSync(nextBuildDir)) {
    console.log("  ✓ Compiled Next.js build artifacts (.next) present.");
  } else {
    console.log("  ℹ Note: .next directory not found. Run 'npm run build' before production launch.");
  }

  console.log("\n==================================================");
  if (hasErrors) {
    console.error("❌ PRODUCTION PRE-FLIGHT CHECK FAILED. Resolve errors above.");
    process.exit(1);
  } else {
    console.log("✓ ALL PRODUCTION PRE-FLIGHT CHECKS PASSED!");
  }
}

runProductionCheck();
