import { getDb } from "@/lib/db/db";
import type {
  Product,
  ProductImage,
  ProductColor,
  ProductFeature,
  ProductFaq,
  ProductSizeGuide,
  ProductStoryContent,
  ProductArtworkContent,
  ProductSeo,
} from "@/lib/types/product";
import { normalizeProduct } from "@/lib/services/product-validator";

interface DbProductRow {
  id: string;
  slug: string;
  price: number;
  currency: string;
  available: number;
  featured: number;
  status: string;
  sort_order: number;
  fit_en: string;
  fit_ar: string;
  name_en: string;
  name_ar: string;
  desc_en: string;
  desc_ar: string;
  artwork_en: string;
  artwork_ar: string;
  created_at: string;
  updated_at: string;
}

interface DbImageRow {
  id: string;
  product_id: string;
  src: string;
  alt_en: string;
  alt_ar: string;
  sort_order: number;
  is_primary: number;
}

interface DbColorRow {
  id: string;
  product_id: string;
  name_en: string;
  name_ar: string;
  hex: string;
}

interface DbStockRow {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
}

interface DbSizeGuideRow {
  product_id: string;
  enabled: number;
  title_en?: string;
  title_ar?: string;
  desc_en?: string;
  desc_ar?: string;
  unit: string;
  columns_json: string;
  rows_json: string;
  notes_en?: string;
  notes_ar?: string;
}

interface DbFaqRow {
  id: string;
  product_id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  sort_order: number;
  visible: number;
}

interface DbFeatureRow {
  id: string;
  product_id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  icon?: string;
  sort_order: number;
  visible: number;
}

interface DbStoryRow {
  product_id: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  images_json: string;
}

interface DbArtworkRow {
  product_id: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  images_json: string;
  captions_en_json: string;
  captions_ar_json: string;
}

interface DbSeoRow {
  product_id: string;
  title_en: string;
  title_ar: string;
  meta_desc_en: string;
  meta_desc_ar: string;
  og_image?: string;
  canonical_override?: string;
  indexable: number;
}

function mapRowToProduct(
  p: DbProductRow,
  images: DbImageRow[],
  colors: DbColorRow[],
  stock: DbStockRow[],
  sizeGuides: DbSizeGuideRow[],
  faqs: DbFaqRow[],
  features: DbFeatureRow[],
  stories: DbStoryRow[],
  artworks: DbArtworkRow[],
  seos: DbSeoRow[]
): Product {
  const imageList: ProductImage[] = images
    .filter((img) => img.product_id === p.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      src: img.src,
      alt: { en: img.alt_en, ar: img.alt_ar },
      isPrimary: Boolean(img.is_primary),
      sortOrder: img.sort_order,
    }));

  const colorList: ProductColor[] = colors
    .filter((col) => col.product_id === p.id)
    .map((col) => ({
      name: { en: col.name_en, ar: col.name_ar },
      hex: col.hex,
    }));

  const stockMap: Record<string, number> = {};
  const sizes: string[] = [];

  stock
    .filter((stk) => stk.product_id === p.id)
    .forEach((stk) => {
      stockMap[stk.size] = stk.quantity;
      sizes.push(stk.size);
    });

  // Product size guide
  const sgRow = sizeGuides.find((sg) => sg.product_id === p.id);
  let sizeGuide: ProductSizeGuide | undefined = undefined;
  if (sgRow) {
    try {
      sizeGuide = {
        enabled: Boolean(sgRow.enabled),
        title: sgRow.title_en || sgRow.title_ar ? { en: sgRow.title_en || "", ar: sgRow.title_ar || "" } : undefined,
        description: sgRow.desc_en || sgRow.desc_ar ? { en: sgRow.desc_en || "", ar: sgRow.desc_ar || "" } : undefined,
        unit: sgRow.unit || "cm",
        columns: JSON.parse(sgRow.columns_json || "[]"),
        rows: JSON.parse(sgRow.rows_json || "[]"),
        notes: sgRow.notes_en || sgRow.notes_ar ? { en: sgRow.notes_en || "", ar: sgRow.notes_ar || "" } : undefined,
      };
    } catch {
      sizeGuide = undefined;
    }
  }

  // Product FAQs
  const productFaqs: ProductFaq[] = faqs
    .filter((f) => f.product_id === p.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((f) => ({
      id: f.id,
      question: { en: f.question_en, ar: f.question_ar },
      answer: { en: f.answer_en, ar: f.answer_ar },
      sortOrder: f.sort_order,
      visible: Boolean(f.visible),
    }));

  // Product Features
  const pFeatures: DbFeatureRow[] = features.filter((f) => f.product_id === p.id);
  const featureList: ProductFeature[] = pFeatures.length > 0
    ? pFeatures.sort((a, b) => a.sort_order - b.sort_order).map((f) => ({
        id: f.id,
        title: { en: f.title_en, ar: f.title_ar },
        body: { en: f.body_en, ar: f.body_ar },
        icon: f.icon,
        sortOrder: f.sort_order,
        visible: Boolean(f.visible),
      }))
    : [
        {
          title: { en: "HEAVYWEIGHT FABRIC", ar: "قماش ثقيل" },
          body: { en: "Substantial feel for structure and wear.", ar: "خامة متينة للراحة والشكل." },
        },
        {
          title: { en: "RELAXED FIT", ar: "قصة مريحة" },
          body: { en: "Relaxed silhouette for everyday wear.", ar: "قصة واسعة مريحة." },
        },
        {
          title: { en: "EMBROIDERED ARTWORK", ar: "تطريز مستوحى من الرحلة" },
          body: { en: "Back artwork defining character.", ar: "التطريز الخلفي المميز." },
        },
      ];

  // Story Content
  const storyRow = stories.find((s) => s.product_id === p.id);
  let storyContent: ProductStoryContent | undefined = undefined;
  if (storyRow) {
    try {
      storyContent = {
        title: { en: storyRow.title_en, ar: storyRow.title_ar },
        description: { en: storyRow.desc_en, ar: storyRow.desc_ar },
        images: JSON.parse(storyRow.images_json || "[]"),
      };
    } catch {
      storyContent = undefined;
    }
  }

  // Artwork Content
  const artRow = artworks.find((a) => a.product_id === p.id);
  let artworkContent: ProductArtworkContent | undefined = undefined;
  if (artRow) {
    try {
      const captionsEn: string[] = JSON.parse(artRow.captions_en_json || "[]");
      const captionsAr: string[] = JSON.parse(artRow.captions_ar_json || "[]");
      const captions = captionsEn.map((enVal, idx) => ({
        en: enVal,
        ar: captionsAr[idx] || enVal,
      }));

      artworkContent = {
        title: { en: artRow.title_en, ar: artRow.title_ar },
        description: { en: artRow.desc_en, ar: artRow.desc_ar },
        images: JSON.parse(artRow.images_json || "[]"),
        captions,
      };
    } catch {
      artworkContent = undefined;
    }
  }

  // SEO Content
  const seoRow = seos.find((s) => s.product_id === p.id);
  let seo: ProductSeo | undefined = undefined;
  if (seoRow) {
    seo = {
      title: { en: seoRow.title_en, ar: seoRow.title_ar },
      metaDescription: { en: seoRow.meta_desc_en, ar: seoRow.meta_desc_ar },
      ogImage: seoRow.og_image || undefined,
      canonicalOverride: seoRow.canonical_override || undefined,
      indexable: Boolean(seoRow.indexable),
    };
  }

  const raw: Partial<Product> = {
    id: p.id,
    slug: p.slug,
    price: p.price,
    currency: p.currency,
    available: Boolean(p.available),
    featured: Boolean(p.featured),
    status: (p.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
    sortOrder: p.sort_order ?? 0,
    sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
    stock: stockMap,
    images: imageList,
    colors: colorList.length > 0 ? colorList : [{ name: { en: "Desert Sand", ar: "رمال الصحراء" }, hex: "#C8A77D" }],
    fit: { en: p.fit_en, ar: p.fit_ar },
    features: featureList,
    faqs: productFaqs,
    sizeGuide,
    storyContent,
    artworkContent,
    seo,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    translations: {
      en: {
        name: p.name_en,
        description: p.desc_en,
        artwork: p.artwork_en,
      },
      ar: {
        name: p.name_ar,
        description: p.desc_ar,
        artwork: p.artwork_ar,
      },
    },
  };

  const normalized = normalizeProduct(raw, []);
  normalized.status = (p.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED";
  normalized.sortOrder = p.sort_order ?? 0;
  normalized.faqs = productFaqs;
  normalized.sizeGuide = sizeGuide;
  normalized.storyContent = storyContent;
  normalized.artworkContent = artworkContent;
  normalized.seo = seo;
  return normalized;
}

export const serverProductRepository = {
  async getAll(): Promise<Product[]> {
    const db = await getDb();
    const products = await db.all<DbProductRow>("SELECT * FROM products ORDER BY sort_order ASC, created_at DESC");
    const images = await db.all<DbImageRow>("SELECT * FROM product_images");
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors");
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock");
    const sizeGuides = await db.all<DbSizeGuideRow>("SELECT * FROM product_size_guides");
    const faqs = await db.all<DbFaqRow>("SELECT * FROM product_faqs");
    const features = await db.all<DbFeatureRow>("SELECT * FROM product_features");
    const stories = await db.all<DbStoryRow>("SELECT * FROM product_story");
    const artworks = await db.all<DbArtworkRow>("SELECT * FROM product_artwork");
    const seos = await db.all<DbSeoRow>("SELECT * FROM product_seo");

    return products.map((p) =>
      mapRowToProduct(p, images, colors, stock, sizeGuides, faqs, features, stories, artworks, seos)
    );
  },

  async getVisible(): Promise<Product[]> {
    const db = await getDb();
    const products = await db.all<DbProductRow>(
      "SELECT * FROM products WHERE available = 1 AND (status IS NULL OR status = 'PUBLISHED') ORDER BY sort_order ASC, created_at DESC"
    );
    const images = await db.all<DbImageRow>("SELECT * FROM product_images");
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors");
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock");
    const sizeGuides = await db.all<DbSizeGuideRow>("SELECT * FROM product_size_guides");
    const faqs = await db.all<DbFaqRow>("SELECT * FROM product_faqs WHERE visible = 1");
    const features = await db.all<DbFeatureRow>("SELECT * FROM product_features WHERE visible = 1");
    const stories = await db.all<DbStoryRow>("SELECT * FROM product_story");
    const artworks = await db.all<DbArtworkRow>("SELECT * FROM product_artwork");
    const seos = await db.all<DbSeoRow>("SELECT * FROM product_seo");

    return products.map((p) =>
      mapRowToProduct(p, images, colors, stock, sizeGuides, faqs, features, stories, artworks, seos)
    );
  },

  async getById(id: string): Promise<Product | undefined> {
    const db = await getDb();
    const p = await db.get<DbProductRow>("SELECT * FROM products WHERE id = ?", [id]);
    if (!p) return undefined;

    const images = await db.all<DbImageRow>("SELECT * FROM product_images WHERE product_id = ?", [id]);
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors WHERE product_id = ?", [id]);
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock WHERE product_id = ?", [id]);
    const sizeGuides = await db.all<DbSizeGuideRow>("SELECT * FROM product_size_guides WHERE product_id = ?", [id]);
    const faqs = await db.all<DbFaqRow>("SELECT * FROM product_faqs WHERE product_id = ?", [id]);
    const features = await db.all<DbFeatureRow>("SELECT * FROM product_features WHERE product_id = ?", [id]);
    const stories = await db.all<DbStoryRow>("SELECT * FROM product_story WHERE product_id = ?", [id]);
    const artworks = await db.all<DbArtworkRow>("SELECT * FROM product_artwork WHERE product_id = ?", [id]);
    const seos = await db.all<DbSeoRow>("SELECT * FROM product_seo WHERE product_id = ?", [id]);

    return mapRowToProduct(p, images, colors, stock, sizeGuides, faqs, features, stories, artworks, seos);
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    const db = await getDb();
    const p = await db.get<DbProductRow>("SELECT * FROM products WHERE slug = ?", [slug]);
    if (!p) return undefined;

    const images = await db.all<DbImageRow>("SELECT * FROM product_images WHERE product_id = ?", [p.id]);
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors WHERE product_id = ?", [p.id]);
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock WHERE product_id = ?", [p.id]);
    const sizeGuides = await db.all<DbSizeGuideRow>("SELECT * FROM product_size_guides WHERE product_id = ?", [p.id]);
    const faqs = await db.all<DbFaqRow>("SELECT * FROM product_faqs WHERE product_id = ?", [p.id]);
    const features = await db.all<DbFeatureRow>("SELECT * FROM product_features WHERE product_id = ?", [p.id]);
    const stories = await db.all<DbStoryRow>("SELECT * FROM product_story WHERE product_id = ?", [p.id]);
    const artworks = await db.all<DbArtworkRow>("SELECT * FROM product_artwork WHERE product_id = ?", [p.id]);
    const seos = await db.all<DbSeoRow>("SELECT * FROM product_seo WHERE product_id = ?", [p.id]);

    return mapRowToProduct(p, images, colors, stock, sizeGuides, faqs, features, stories, artworks, seos);
  },

  async create(rawProduct: Partial<Product>): Promise<Product> {
    const existingProducts = await this.getAll();
    const normalized = normalizeProduct(rawProduct, existingProducts);
    const now = new Date().toISOString();
    const status = rawProduct.status || "PUBLISHED";
    const sortOrder = rawProduct.sortOrder ?? 0;

    const db = await getDb();
    await db.transaction(async (tx) => {
      await tx.run(
        `INSERT INTO products (
          id, slug, price, currency, available, featured, status, sort_order,
          fit_en, fit_ar, name_en, name_ar, desc_en, desc_ar, artwork_en, artwork_ar,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?
        )`,
        [
          normalized.id,
          normalized.slug,
          normalized.price,
          normalized.currency,
          normalized.available ? 1 : 0,
          normalized.featured ? 1 : 0,
          status,
          sortOrder,
          normalized.fit.en,
          normalized.fit.ar,
          normalized.translations.en.name,
          normalized.translations.ar.name,
          normalized.translations.en.description,
          normalized.translations.ar.description,
          normalized.translations.en.artwork,
          normalized.translations.ar.artwork,
          normalized.createdAt || now,
          now,
        ]
      );

      for (let idx = 0; idx < normalized.images.length; idx++) {
        const img = normalized.images[idx];
        await tx.run(
          `INSERT INTO product_images (id, product_id, src, alt_en, alt_ar, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            img.id || `img-${normalized.id}-${idx}`,
            normalized.id,
            img.src,
            img.alt.en,
            img.alt.ar,
            img.sortOrder ?? idx,
            img.isPrimary ? 1 : 0,
          ]
        );
      }

      for (let idx = 0; idx < normalized.colors.length; idx++) {
        const col = normalized.colors[idx];
        await tx.run(
          `INSERT INTO product_colors (id, product_id, name_en, name_ar, hex)
           VALUES (?, ?, ?, ?, ?)`,
          [
            `col-${normalized.id}-${idx}`,
            normalized.id,
            col.name.en,
            col.name.ar,
            col.hex,
          ]
        );
      }

      if (normalized.stock) {
        for (const [size, qty] of Object.entries(normalized.stock)) {
          await tx.run(
            `INSERT INTO product_stock (id, product_id, size, quantity)
             VALUES (?, ?, ?, ?)`,
            [`stk-${normalized.id}-${size}`, normalized.id, size, qty]
          );
        }
      }

      // Size Guide
      if (rawProduct.sizeGuide) {
        const sg = rawProduct.sizeGuide;
        await tx.run(
          `INSERT INTO product_size_guides (product_id, enabled, title_en, title_ar, desc_en, desc_ar, unit, columns_json, rows_json, notes_en, notes_ar)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalized.id,
            sg.enabled ? 1 : 0,
            sg.title?.en || null,
            sg.title?.ar || null,
            sg.description?.en || null,
            sg.description?.ar || null,
            sg.unit || "cm",
            JSON.stringify(sg.columns || []),
            JSON.stringify(sg.rows || []),
            sg.notes?.en || null,
            sg.notes?.ar || null,
          ]
        );
      }

      // FAQs
      if (rawProduct.faqs) {
        for (let idx = 0; idx < rawProduct.faqs.length; idx++) {
          const faq = rawProduct.faqs[idx];
          await tx.run(
            `INSERT INTO product_faqs (id, product_id, question_en, question_ar, answer_en, answer_ar, sort_order, visible)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              faq.id || `faq-${normalized.id}-${idx}`,
              normalized.id,
              faq.question.en,
              faq.question.ar,
              faq.answer.en,
              faq.answer.ar,
              faq.sortOrder ?? idx,
              faq.visible !== false ? 1 : 0,
            ]
          );
        }
      }

      // Features
      if (rawProduct.features) {
        for (let idx = 0; idx < rawProduct.features.length; idx++) {
          const feat = rawProduct.features[idx];
          await tx.run(
            `INSERT INTO product_features (id, product_id, title_en, title_ar, body_en, body_ar, icon, sort_order, visible)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              feat.id || `feat-${normalized.id}-${idx}`,
              normalized.id,
              feat.title.en,
              feat.title.ar,
              feat.body.en,
              feat.body.ar,
              feat.icon || null,
              feat.sortOrder ?? idx,
              feat.visible !== false ? 1 : 0,
            ]
          );
        }
      }

      // Story
      if (rawProduct.storyContent) {
        const s = rawProduct.storyContent;
        await tx.run(
          `INSERT INTO product_story (product_id, title_en, title_ar, desc_en, desc_ar, images_json)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            normalized.id,
            s.title.en,
            s.title.ar,
            s.description.en,
            s.description.ar,
            JSON.stringify(s.images || []),
          ]
        );
      }

      // Artwork
      if (rawProduct.artworkContent) {
        const a = rawProduct.artworkContent;
        const captionsEn = (a.captions || []).map((c) => c.en);
        const captionsAr = (a.captions || []).map((c) => c.ar);
        await tx.run(
          `INSERT INTO product_artwork (product_id, title_en, title_ar, desc_en, desc_ar, images_json, captions_en_json, captions_ar_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalized.id,
            a.title.en,
            a.title.ar,
            a.description.en,
            a.description.ar,
            JSON.stringify(a.images || []),
            JSON.stringify(captionsEn),
            JSON.stringify(captionsAr),
          ]
        );
      }

      // SEO
      if (rawProduct.seo) {
        const seo = rawProduct.seo;
        await tx.run(
          `INSERT INTO product_seo (product_id, title_en, title_ar, meta_desc_en, meta_desc_ar, og_image, canonical_override, indexable)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalized.id,
            seo.title.en,
            seo.title.ar,
            seo.metaDescription.en,
            seo.metaDescription.ar,
            seo.ogImage || null,
            seo.canonicalOverride || null,
            seo.indexable !== false ? 1 : 0,
          ]
        );
      }
    });

    return (await this.getById(normalized.id)) || normalized;
  },

  async update(id: string, updatedFields: Partial<Product>): Promise<Product | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;

    const db = await getDb();
    const existingStockRows = await db.all<{ size: string; quantity: number }>(
      "SELECT size, quantity FROM product_stock WHERE product_id = ?",
      [id]
    );
    const existingStockMap: Record<string, number> = {};
    existingStockRows.forEach((row) => {
      existingStockMap[row.size] = row.quantity;
    });

    const allProducts = (await this.getAll()).filter((p) => p.id !== id);
    const merged: Partial<Product> = {
      ...existing,
      stock: updatedFields.stock ?? existingStockMap,
      ...updatedFields,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    const normalized = normalizeProduct(merged, allProducts);
    const now = new Date().toISOString();
    const status = updatedFields.status ?? existing.status ?? "PUBLISHED";
    const sortOrder = updatedFields.sortOrder ?? existing.sortOrder ?? 0;

    await db.transaction(async (tx) => {
      await tx.run(
        `UPDATE products SET
          slug = ?, price = ?, currency = ?, available = ?, featured = ?, status = ?, sort_order = ?,
          fit_en = ?, fit_ar = ?, name_en = ?, name_ar = ?, desc_en = ?, desc_ar = ?,
          artwork_en = ?, artwork_ar = ?, updated_at = ?
        WHERE id = ?`,
        [
          normalized.slug,
          normalized.price,
          normalized.currency,
          normalized.available ? 1 : 0,
          normalized.featured ? 1 : 0,
          status,
          sortOrder,
          normalized.fit.en,
          normalized.fit.ar,
          normalized.translations.en.name,
          normalized.translations.ar.name,
          normalized.translations.en.description,
          normalized.translations.ar.description,
          normalized.translations.en.artwork,
          normalized.translations.ar.artwork,
          now,
          id,
        ]
      );

      // Re-insert images, colors, stock, size guides, faqs, features, story, artwork, seo
      await tx.run("DELETE FROM product_images WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_colors WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_stock WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_size_guides WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_faqs WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_features WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_story WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_artwork WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_seo WHERE product_id = ?", [id]);

      for (let idx = 0; idx < normalized.images.length; idx++) {
        const img = normalized.images[idx];
        await tx.run(
          `INSERT INTO product_images (id, product_id, src, alt_en, alt_ar, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            img.id || `img-${id}-${idx}`,
            id,
            img.src,
            img.alt.en,
            img.alt.ar,
            img.sortOrder ?? idx,
            img.isPrimary ? 1 : 0,
          ]
        );
      }

      for (let idx = 0; idx < normalized.colors.length; idx++) {
        const col = normalized.colors[idx];
        await tx.run(
          `INSERT INTO product_colors (id, product_id, name_en, name_ar, hex)
           VALUES (?, ?, ?, ?, ?)`,
          [`col-${id}-${idx}`, id, col.name.en, col.name.ar, col.hex]
        );
      }

      if (normalized.stock) {
        for (const [size, qty] of Object.entries(normalized.stock)) {
          await tx.run(
            `INSERT INTO product_stock (id, product_id, size, quantity)
             VALUES (?, ?, ?, ?)`,
            [`stk-${id}-${size}`, id, size, qty]
          );
        }
      }

      // Size guide
      const sg = updatedFields.sizeGuide ?? existing.sizeGuide;
      if (sg) {
        await tx.run(
          `INSERT INTO product_size_guides (product_id, enabled, title_en, title_ar, desc_en, desc_ar, unit, columns_json, rows_json, notes_en, notes_ar)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            sg.enabled ? 1 : 0,
            sg.title?.en || null,
            sg.title?.ar || null,
            sg.description?.en || null,
            sg.description?.ar || null,
            sg.unit || "cm",
            JSON.stringify(sg.columns || []),
            JSON.stringify(sg.rows || []),
            sg.notes?.en || null,
            sg.notes?.ar || null,
          ]
        );
      }

      // FAQs
      const faqsList = updatedFields.faqs ?? existing.faqs;
      if (faqsList) {
        for (let idx = 0; idx < faqsList.length; idx++) {
          const faq = faqsList[idx];
          await tx.run(
            `INSERT INTO product_faqs (id, product_id, question_en, question_ar, answer_en, answer_ar, sort_order, visible)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              faq.id || `faq-${id}-${idx}`,
              id,
              faq.question.en,
              faq.question.ar,
              faq.answer.en,
              faq.answer.ar,
              faq.sortOrder ?? idx,
              faq.visible !== false ? 1 : 0,
            ]
          );
        }
      }

      // Features
      const featList = updatedFields.features ?? existing.features;
      if (featList) {
        for (let idx = 0; idx < featList.length; idx++) {
          const feat = featList[idx];
          await tx.run(
            `INSERT INTO product_features (id, product_id, title_en, title_ar, body_en, body_ar, icon, sort_order, visible)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              feat.id || `feat-${id}-${idx}`,
              id,
              feat.title.en,
              feat.title.ar,
              feat.body.en,
              feat.body.ar,
              feat.icon || null,
              feat.sortOrder ?? idx,
              feat.visible !== false ? 1 : 0,
            ]
          );
        }
      }

      // Story
      const st = updatedFields.storyContent ?? existing.storyContent;
      if (st) {
        await tx.run(
          `INSERT INTO product_story (product_id, title_en, title_ar, desc_en, desc_ar, images_json)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, st.title.en, st.title.ar, st.description.en, st.description.ar, JSON.stringify(st.images || [])]
        );
      }

      // Artwork
      const art = updatedFields.artworkContent ?? existing.artworkContent;
      if (art) {
        const captionsEn = (art.captions || []).map((c) => c.en);
        const captionsAr = (art.captions || []).map((c) => c.ar);
        await tx.run(
          `INSERT INTO product_artwork (product_id, title_en, title_ar, desc_en, desc_ar, images_json, captions_en_json, captions_ar_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            art.title.en,
            art.title.ar,
            art.description.en,
            art.description.ar,
            JSON.stringify(art.images || []),
            JSON.stringify(captionsEn),
            JSON.stringify(captionsAr),
          ]
        );
      }

      // SEO
      const seo = updatedFields.seo ?? existing.seo;
      if (seo) {
        await tx.run(
          `INSERT INTO product_seo (product_id, title_en, title_ar, meta_desc_en, meta_desc_ar, og_image, canonical_override, indexable)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            seo.title.en,
            seo.title.ar,
            seo.metaDescription.en,
            seo.metaDescription.ar,
            seo.ogImage || null,
            seo.canonicalOverride || null,
            seo.indexable !== false ? 1 : 0,
          ]
        );
      }
    });

    return (await this.getById(id)) || normalized;
  },

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const info = await db.run("DELETE FROM products WHERE id = ?", [id]);
    return info.changes > 0;
  },
};
