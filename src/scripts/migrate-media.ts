import fs from "fs";
import path from "path";
import { getDb } from "../lib/db/db";
import { getMediaStore } from "../lib/media/media-store";

/**
 * Migrates CMS media from the local uploads directory to the configured
 * durable media store (Vercel Blob in production) and rewrites database
 * references (storefront section images, product images) to the new URLs.
 *
 * - Only touches files under public/uploads (runtime CMS uploads).
 * - Authentic product photography under public/images stays static — never
 *   migrated, never deleted.
 * - Local originals are NEVER deleted by this script; deletion happens only
 *   after manual migration verification.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-media.ts            # dry run (no writes)
 *   CONFIRM=MIGRATE npx tsx src/scripts/migrate-media.ts
 */

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "storefront");
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

interface MediaReference {
  table: "storefront_sections" | "product_images";
  column: string;
  oldPath: string;
}

async function findReferences(db: Awaited<ReturnType<typeof getDb>>, oldPath: string): Promise<MediaReference[]> {
  const refs: MediaReference[] = [];

  const sectionCols = ["image_url", "draft_image_url"] as const;
  for (const col of sectionCols) {
    const rows = await db.all<{ id: string }>(
      `SELECT id FROM storefront_sections WHERE ${col} = ?`,
      [oldPath]
    );
    for (let i = 0; i < rows.length; i++) refs.push({ table: "storefront_sections", column: col, oldPath });
  }

  const images = await db.all<{ id: string }>(`SELECT id FROM product_images WHERE src = ?`, [oldPath]);
  for (let i = 0; i < images.length; i++) refs.push({ table: "product_images", column: "src", oldPath });

  return refs;
}

async function main() {
  console.log("=== BADU CMS MEDIA MIGRATION (local → durable storage) ===\n");
  const confirmed = process.env.CONFIRM === "MIGRATE";

  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    console.log("No local uploads directory found — nothing to migrate.");
    return;
  }

  const files = fs.readdirSync(LOCAL_UPLOAD_DIR).filter((f) => IMAGE_EXT.test(f));
  if (files.length === 0) {
    console.log("No CMS media files found locally — nothing to migrate.");
    return;
  }

  const store = getMediaStore();
  console.log(`Media store: ${store.kind} (${store.kind === "blob" ? "durable object storage" : "local development store"})`);
  console.log(`Files to process: ${files.length}`);
  console.log(`Mode: ${confirmed ? "MIGRATE (writes enabled)" : "DRY RUN (set CONFIRM=MIGRATE to write)"}\n`);

  const db = await getDb();

  for (const filename of files) {
    const oldPath = `/uploads/storefront/${filename}`;
    const buffer = fs.readFileSync(path.join(LOCAL_UPLOAD_DIR, filename));
    const refs = await findReferences(db, oldPath);

    if (refs.length === 0) {
      console.log(`· ${filename}: no database references — uploaded to store only.`);
    } else {
      console.log(`· ${filename}: ${refs.length} reference(s) (${refs.map((r) => `${r.table}.${r.column}`).join(", ")})`);
    }

    if (!confirmed) continue;

    const saved = await store.save({
      filename,
      contentType: "image/jpeg", // exact type unavailable post-hoc; blob serves with safe defaults
      buffer,
    });

    for (const ref of refs) {
      if (ref.table === "storefront_sections") {
        await db.run(`UPDATE storefront_sections SET ${ref.column} = ? WHERE ${ref.column} = ?`, [saved.url, oldPath]);
      } else {
        await db.run(`UPDATE product_images SET src = ? WHERE src = ?`, [saved.url, oldPath]);
      }
    }

    console.log(`  ✓ ${oldPath}  →  ${saved.url}`);
  }

  console.log(
    confirmed
      ? "\n✓ Media migration complete. Local originals preserved on disk — verify rendering, then remove them manually."
      : "\nDry run complete. No writes performed."
  );
}

main().catch((err) => {
  console.error("❌ Media migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
