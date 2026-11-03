import bcrypt from "bcryptjs";
import type { BaduDatabase } from "./adapter";
import { initialProducts } from "@/data/initial-products";
import { LANDING_SECTIONS, LANDING_SECTION_ORDER } from "@/lib/storefront/section-definitions";

/**
 * Seeds a fresh database (SQLite or PostgreSQL) with the initial catalogue,
 * default admin user, and storefront sections. Only fills tables that are
 * empty, so migrated databases are never re-seeded.
 */
export async function seedDatabase(db: BaduDatabase): Promise<void> {
  // 1. Seed Products if empty
  const productRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM products");
  if (productRow && productRow.count === 0) {
    const now = new Date().toISOString();

    await db.transaction(async (tx) => {
      for (const p of initialProducts) {
        await tx.run(
          `INSERT INTO products (
            id, slug, price, currency, available, featured,
            fit_en, fit_ar, name_en, name_ar, desc_en, desc_ar, artwork_en, artwork_ar,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.slug,
            p.price,
            p.currency,
            p.available ? 1 : 0,
            p.featured ? 1 : 0,
            p.fit.en,
            p.fit.ar,
            p.translations.en.name,
            p.translations.ar.name,
            p.translations.en.description,
            p.translations.ar.description,
            p.translations.en.artwork,
            p.translations.ar.artwork,
            p.createdAt || now,
            p.updatedAt || now,
          ]
        );

        for (const [idx, img] of p.images.entries()) {
          await tx.run(
            `INSERT INTO product_images (id, product_id, src, alt_en, alt_ar, sort_order, is_primary, color_key)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              img.id || `img-${p.id}-${idx}`,
              p.id,
              img.src,
              img.alt.en,
              img.alt.ar,
              img.sortOrder ?? idx,
              img.isPrimary ? 1 : 0,
              img.colorKey ?? null,
            ]
          );
        }

        for (const [idx, col] of p.colors.entries()) {
          await tx.run(
            `INSERT INTO product_colors (id, product_id, name_en, name_ar, hex)
             VALUES (?, ?, ?, ?, ?)`,
            [`col-${p.id}-${idx}`, p.id, col.name.en, col.name.ar, col.hex]
          );
        }

        if (p.stock) {
          for (const [size, qty] of Object.entries(p.stock)) {
            await tx.run(
              `INSERT INTO product_stock (id, product_id, size, quantity)
               VALUES (?, ?, ?, ?)`,
              [`stk-${p.id}-${size}`, p.id, size, qty]
            );
          }
        }
      }
    });
  }

  // 2. Seed Default Admin User if empty
  const userRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM admin_users");
  if (userRow && userRow.count === 0) {
    const isProduction = process.env.NODE_ENV === "production";
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@badu.store";
    let adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

    if (!adminPassword) {
      if (isProduction) {
        throw new Error(
          "ADMIN_BOOTSTRAP_PASSWORD environment variable is required to bootstrap the first admin user in production. Refusing to create an admin account with a default password."
        );
      }
      adminPassword = "badu_admin_2026";
    }

    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO admin_users (id, email, password_hash, role, created_at, updated_at)
       VALUES (?, ?, ?, 'ADMIN', ?, ?)`,
      ["usr-admin-001", adminEmail.toLowerCase().trim(), passwordHash, now, now]
    );
  }

  // 3. Seed Storefront CMS Sections if empty
  const sectionRow = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM storefront_sections");
  if (sectionRow && sectionRow.count === 0) {
    const now = new Date().toISOString();

    const sections = [
      {
        id: "sec-hero",
        key: "hero",
        title_en: "MADE FOR THE JOURNEY",
        title_ar: "صُنِعَ للرحلة",
        subtitle_en: "Desert inspired. Modern streetwear crafted with intention and heavyweight organic cotton.",
        subtitle_ar: "مستوحى من الصحراء. ملابس شريعية عصرية صُنعت بعناية من القطن العضوي الثقيل.",
        body_en: null,
        body_ar: null,
        cta_label_en: "EXPLORE HOODIE",
        cta_label_ar: "استكشف الهودي",
        cta_url: "#hoodie",
        featured_product_id: "bd-hoodie-001",
        image_url: null,
        visible: 1,
        status: "PUBLISHED",
        sort_order: 1,
      },
      {
        id: "sec-story",
        key: "story",
        title_en: "OUR STORY",
        title_ar: "قصتنا",
        subtitle_en: null,
        subtitle_ar: null,
        body_en: "BADU emerges from the quiet vastness of the desert — where silence carries history, and every line tells of resilience. We merge heritage craftsmanship with contemporary silhouettes.",
        body_ar: "ينبع بادو من اتساع الصحراء الهادئ — حيث يحمل الصمت تاريخاً، وتحكي كل قصة عن الصمود. نمزج بين الحرفية التراثية والتصاميم المعاصرة.",
        cta_label_en: null,
        cta_label_ar: null,
        cta_url: null,
        featured_product_id: null,
        image_url: "/images/story.jpg",
        visible: 1,
        status: "PUBLISHED",
        sort_order: 2,
      },
      {
        id: "sec-featured-product",
        key: "featured_product",
        title_en: "THE JOURNEY HOODIE",
        title_ar: "هودي الرحلة",
        subtitle_en: "Our flagship piece. Crafted from 480GSM organic cotton with embroidered calligraphy.",
        subtitle_ar: "قطعتنا الأساسية. صُنعت من القطن العضوي 480 جم/م² مع تطريز للخط العربي.",
        body_en: null,
        body_ar: null,
        cta_label_en: null,
        cta_label_ar: null,
        cta_url: null,
        featured_product_id: "bd-hoodie-001",
        image_url: null,
        visible: 1,
        status: "PUBLISHED",
        sort_order: 3,
      },
      {
        id: "sec-artwork",
        key: "artwork",
        title_en: "EMBROIDERED ARTWORK",
        title_ar: "لوحة زهرية مطرزة",
        subtitle_en: null,
        subtitle_ar: null,
        body_en: "Each stitch honours ancient calligraphy and desert flora, transformed into modern high-density embroidery that endures time.",
        body_ar: "تكرم كل غرزة فن الخط العربي والغطاء النباتي للصحراء، وتحوله إلى تطريز عالي الكثافة يدوم عبر الزمن.",
        cta_label_en: null,
        cta_label_ar: null,
        cta_url: null,
        featured_product_id: null,
        image_url: "/images/products/badu-hoodie/detail-2-v2.jpg",
        visible: 1,
        status: "PUBLISHED",
        sort_order: 4,
      },
      {
        id: "sec-features",
        key: "features",
        title_en: "CRAFT & DETAILS",
        title_ar: "الحرفية والتفاصيل",
        subtitle_en: null,
        subtitle_ar: null,
        body_en: "HEAVYWEIGHT FABRIC • RELAXED FIT • EMBROIDERED ARTWORK • DESERT TONES",
        body_ar: "قماش ثقيل • قصة مريحة • تطريز عالي الجودة • ألوان رمال الصحراء",
        cta_label_en: null,
        cta_label_ar: null,
        cta_url: null,
        featured_product_id: null,
        image_url: null,
        visible: 1,
        status: "PUBLISHED",
        sort_order: 5,
      },
    ];

    await db.transaction(async (tx) => {
      for (const sec of sections) {
        await tx.run(
          `INSERT INTO storefront_sections (
            id, section_key, title_en, title_ar, subtitle_en, subtitle_ar,
            body_en, body_ar, cta_label_en, cta_label_ar, cta_url,
            featured_product_id, image_url, visible, status, sort_order,
            created_at, updated_at, published_at,
            draft_title_en, draft_title_ar, draft_subtitle_en, draft_subtitle_ar,
            draft_body_en, draft_body_ar, draft_cta_label_en, draft_cta_label_ar,
            draft_cta_url, draft_featured_product_id, draft_image_url,
            draft_visible, draft_sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sec.id,
            sec.key,
            sec.title_en,
            sec.title_ar,
            sec.subtitle_en,
            sec.subtitle_ar,
            sec.body_en,
            sec.body_ar,
            sec.cta_label_en,
            sec.cta_label_ar,
            sec.cta_url,
            sec.featured_product_id,
            sec.image_url,
            sec.visible,
            sec.status,
            sec.sort_order,
            now,
            now,
            now,
            sec.title_en,
            sec.title_ar,
            sec.subtitle_en,
            sec.subtitle_ar,
            sec.body_en,
            sec.body_ar,
            sec.cta_label_en,
            sec.cta_label_ar,
            sec.cta_url,
            sec.featured_product_id,
            sec.image_url,
            sec.visible,
            sec.sort_order,
          ]
        );
      }
    });
  }

  // 4. Ensure every landing-page section exists (idempotent).
  //    Older databases only contain the 5 originally seeded CMS sections;
  //    this creates rows for the previously hard-coded sections so the admin
  //    gains full control (content, visibility, order) over the whole page.
  await ensureLandingSections(db);

  // 5. Lightweight column migrations (idempotent) — keep existing databases
  //    in sync with the canonical schema without manual scripts.
  await ensureColumn(db, "product_images", "color_key", "TEXT");
}

/**
 * Add a column to a table when it is missing. No-op when the column exists.
 */
async function ensureColumn(
  db: BaduDatabase,
  table: string,
  column: string,
  ddlType: string
): Promise<void> {
  const dialect = db.dialect;
  let hasColumn = false;

  if (dialect === "postgres") {
    const row = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM information_schema.columns
       WHERE table_name = '${table}' AND column_name = '${column}'`
    );
    hasColumn = Boolean(row && row.count > 0);
  } else {
    const rows = await db.all<{ name: string }>(`PRAGMA table_info(${table})`);
    hasColumn = rows.some((r) => r.name === column);
  }

  if (!hasColumn) {
    await db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddlType}`);
  }
}

/**
 * Create any missing `storefront_sections` rows from the canonical registry
 * and (re)number all sections to the canonical order. Existing content is
 * never overwritten — only rows whose key is absent are inserted, and only
 * `sort_order` is adjusted for existing rows (draft content is untouched).
 */
async function ensureLandingSections(db: BaduDatabase): Promise<void> {
  const rows = await db.all<{ section_key: string }>("SELECT section_key FROM storefront_sections");
  const existing = new Set(rows.map((r) => r.section_key));
  const missing = LANDING_SECTION_ORDER.filter((key) => !existing.has(key));

  if (missing.length === 0) return;

  const now = new Date().toISOString();

  for (const [index, key] of LANDING_SECTION_ORDER.entries()) {
    const order = index + 1;
    const def = LANDING_SECTIONS.find((s) => s.key === key);
    if (!def) continue;

    if (existing.has(key)) {
      await db.run(
        "UPDATE storefront_sections SET sort_order = ?, draft_sort_order = NULL WHERE section_key = ?",
        [order, key]
      );
      continue;
    }

    await db.run(
      `INSERT INTO storefront_sections (
        id, section_key, title_en, title_ar, subtitle_en, subtitle_ar,
        body_en, body_ar, cta_label_en, cta_label_ar, cta_url,
        featured_product_id, image_url, visible, status, sort_order,
        created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, ?)`,
      [
        `sec-${key}`,
        key,
        def.defaults.titleEn,
        def.defaults.titleAr,
        def.defaults.subtitleEn || null,
        def.defaults.subtitleAr || null,
        def.defaults.bodyEn || null,
        def.defaults.bodyAr || null,
        def.defaults.ctaLabelEn || null,
        def.defaults.ctaLabelAr || null,
        def.defaults.ctaUrl || null,
        null,
        def.defaults.imageUrl || null,
        1,
        order,
        now,
        now,
        now,
      ]
    );
  }
}
