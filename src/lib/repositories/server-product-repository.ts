import { getDb } from "@/lib/db/db";
import type { Product, ProductImage, ProductColor } from "@/lib/types/product";
import { normalizeProduct } from "@/lib/services/product-validator";

interface DbProductRow {
  id: string;
  slug: string;
  price: number;
  currency: string;
  available: number;
  featured: number;
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

function mapRowToProduct(
  p: DbProductRow,
  images: DbImageRow[],
  colors: DbColorRow[],
  stock: DbStockRow[]
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

  const raw: Partial<Product> = {
    id: p.id,
    slug: p.slug,
    price: p.price,
    currency: p.currency,
    available: Boolean(p.available),
    featured: Boolean(p.featured),
    sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
    stock: stockMap,
    images: imageList,
    colors: colorList.length > 0 ? colorList : [{ name: { en: "Desert Sand", ar: "رمال الصحراء" }, hex: "#C8A77D" }],
    fit: { en: p.fit_en, ar: p.fit_ar },
    features: [
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
    ],
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

  return normalizeProduct(raw, []);
}

export const serverProductRepository = {
  async getAll(): Promise<Product[]> {
    const db = await getDb();
    const products = await db.all<DbProductRow>("SELECT * FROM products ORDER BY created_at DESC");
    const images = await db.all<DbImageRow>("SELECT * FROM product_images");
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors");
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock");

    return products.map((p) => mapRowToProduct(p, images, colors, stock));
  },

  async getVisible(): Promise<Product[]> {
    const db = await getDb();
    const products = await db.all<DbProductRow>("SELECT * FROM products WHERE available = 1 ORDER BY created_at DESC");
    const images = await db.all<DbImageRow>("SELECT * FROM product_images");
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors");
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock");

    return products.map((p) => mapRowToProduct(p, images, colors, stock));
  },

  async getById(id: string): Promise<Product | undefined> {
    const db = await getDb();
    const p = await db.get<DbProductRow>("SELECT * FROM products WHERE id = ?", [id]);
    if (!p) return undefined;

    const images = await db.all<DbImageRow>("SELECT * FROM product_images WHERE product_id = ?", [id]);
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors WHERE product_id = ?", [id]);
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock WHERE product_id = ?", [id]);

    return mapRowToProduct(p, images, colors, stock);
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    const db = await getDb();
    const p = await db.get<DbProductRow>("SELECT * FROM products WHERE slug = ?", [slug]);
    if (!p) return undefined;

    const images = await db.all<DbImageRow>("SELECT * FROM product_images WHERE product_id = ?", [p.id]);
    const colors = await db.all<DbColorRow>("SELECT * FROM product_colors WHERE product_id = ?", [p.id]);
    const stock = await db.all<DbStockRow>("SELECT * FROM product_stock WHERE product_id = ?", [p.id]);

    return mapRowToProduct(p, images, colors, stock);
  },

  async create(rawProduct: Partial<Product>): Promise<Product> {
    const existingProducts = await this.getAll();
    const normalized = normalizeProduct(rawProduct, existingProducts);
    const now = new Date().toISOString();

    const db = await getDb();
    await db.transaction(async (tx) => {
      await tx.run(
        `INSERT INTO products (
          id, slug, price, currency, available, featured,
          fit_en, fit_ar, name_en, name_ar, desc_en, desc_ar, artwork_en, artwork_ar,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
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
    });

    return normalized;
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

    await db.transaction(async (tx) => {
      await tx.run(
        `UPDATE products SET
          slug = ?, price = ?, currency = ?, available = ?, featured = ?,
          fit_en = ?, fit_ar = ?, name_en = ?, name_ar = ?, desc_en = ?, desc_ar = ?,
          artwork_en = ?, artwork_ar = ?, updated_at = ?
        WHERE id = ?`,
        [
          normalized.slug,
          normalized.price,
          normalized.currency,
          normalized.available ? 1 : 0,
          normalized.featured ? 1 : 0,
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

      // Re-insert images, colors, stock
      await tx.run("DELETE FROM product_images WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_colors WHERE product_id = ?", [id]);
      await tx.run("DELETE FROM product_stock WHERE product_id = ?", [id]);

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
    });

    return normalized;
  },

  async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const info = await db.run("DELETE FROM products WHERE id = ?", [id]);
    return info.changes > 0;
  },
};
