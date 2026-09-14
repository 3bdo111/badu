import { db } from "@/lib/db/db";
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
  getAll(): Product[] {
    const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all() as DbProductRow[];
    const images = db.prepare("SELECT * FROM product_images").all() as DbImageRow[];
    const colors = db.prepare("SELECT * FROM product_colors").all() as DbColorRow[];
    const stock = db.prepare("SELECT * FROM product_stock").all() as DbStockRow[];

    return products.map((p) => mapRowToProduct(p, images, colors, stock));
  },

  getVisible(): Product[] {
    const products = db.prepare("SELECT * FROM products WHERE available = 1 ORDER BY created_at DESC").all() as DbProductRow[];
    const images = db.prepare("SELECT * FROM product_images").all() as DbImageRow[];
    const colors = db.prepare("SELECT * FROM product_colors").all() as DbColorRow[];
    const stock = db.prepare("SELECT * FROM product_stock").all() as DbStockRow[];

    return products.map((p) => mapRowToProduct(p, images, colors, stock));
  },

  getById(id: string): Product | undefined {
    const p = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as DbProductRow | undefined;
    if (!p) return undefined;

    const images = db.prepare("SELECT * FROM product_images WHERE product_id = ?").all(id) as DbImageRow[];
    const colors = db.prepare("SELECT * FROM product_colors WHERE product_id = ?").all(id) as DbColorRow[];
    const stock = db.prepare("SELECT * FROM product_stock WHERE product_id = ?").all(id) as DbStockRow[];

    return mapRowToProduct(p, images, colors, stock);
  },

  getBySlug(slug: string): Product | undefined {
    const p = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as DbProductRow | undefined;
    if (!p) return undefined;

    const images = db.prepare("SELECT * FROM product_images WHERE product_id = ?").all(p.id) as DbImageRow[];
    const colors = db.prepare("SELECT * FROM product_colors WHERE product_id = ?").all(p.id) as DbColorRow[];
    const stock = db.prepare("SELECT * FROM product_stock WHERE product_id = ?").all(p.id) as DbStockRow[];

    return mapRowToProduct(p, images, colors, stock);
  },

  create(rawProduct: Partial<Product>): Product {
    const existingProducts = this.getAll();
    const normalized = normalizeProduct(rawProduct, existingProducts);

    const now = new Date().toISOString();

    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, slug, price, currency, available, featured,
        fit_en, fit_ar, name_en, name_ar, desc_en, desc_ar, artwork_en, artwork_ar,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    const insertImage = db.prepare(`
      INSERT INTO product_images (id, product_id, src, alt_en, alt_ar, sort_order, is_primary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertColor = db.prepare(`
      INSERT INTO product_colors (id, product_id, name_en, name_ar, hex)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertStock = db.prepare(`
      INSERT INTO product_stock (id, product_id, size, quantity)
      VALUES (?, ?, ?, ?)
    `);

    const saveTransaction = db.transaction(() => {
      insertProduct.run(
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
        now
      );

      normalized.images.forEach((img, idx) => {
        insertImage.run(
          img.id || `img-${normalized.id}-${idx}`,
          normalized.id,
          img.src,
          img.alt.en,
          img.alt.ar,
          img.sortOrder ?? idx,
          img.isPrimary ? 1 : 0
        );
      });

      normalized.colors.forEach((col, idx) => {
        insertColor.run(
          `col-${normalized.id}-${idx}`,
          normalized.id,
          col.name.en,
          col.name.ar,
          col.hex
        );
      });

      if (normalized.stock) {
        for (const [size, qty] of Object.entries(normalized.stock)) {
          insertStock.run(
            `stk-${normalized.id}-${size}`,
            normalized.id,
            size,
            qty
          );
        }
      }
    });

    saveTransaction();
    return normalized;
  },

  update(id: string, updatedFields: Partial<Product>): Product | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const existingStockRows = db
      .prepare("SELECT size, quantity FROM product_stock WHERE product_id = ?")
      .all(id) as Array<{ size: string; quantity: number }>;
    const existingStockMap: Record<string, number> = {};
    existingStockRows.forEach((row) => {
      existingStockMap[row.size] = row.quantity;
    });

    const allProducts = this.getAll().filter((p) => p.id !== id);
    const merged: Partial<Product> = {
      ...existing,
      stock: updatedFields.stock ?? existingStockMap,
      ...updatedFields,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    const normalized = normalizeProduct(merged, allProducts);
    const now = new Date().toISOString();

    const updateProduct = db.prepare(`
      UPDATE products SET
        slug = ?, price = ?, currency = ?, available = ?, featured = ?,
        fit_en = ?, fit_ar = ?, name_en = ?, name_ar = ?, desc_en = ?, desc_ar = ?,
        artwork_en = ?, artwork_ar = ?, updated_at = ?
      WHERE id = ?
    `);

    const updateTransaction = db.transaction(() => {
      updateProduct.run(
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
        id
      );

      // Re-insert images, colors, stock
      db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
      db.prepare("DELETE FROM product_colors WHERE product_id = ?").run(id);
      db.prepare("DELETE FROM product_stock WHERE product_id = ?").run(id);

      const insertImage = db.prepare(`
        INSERT INTO product_images (id, product_id, src, alt_en, alt_ar, sort_order, is_primary)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertColor = db.prepare(`
        INSERT INTO product_colors (id, product_id, name_en, name_ar, hex)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertStock = db.prepare(`
        INSERT INTO product_stock (id, product_id, size, quantity)
        VALUES (?, ?, ?, ?)
      `);

      normalized.images.forEach((img, idx) => {
        insertImage.run(
          img.id || `img-${id}-${idx}`,
          id,
          img.src,
          img.alt.en,
          img.alt.ar,
          img.sortOrder ?? idx,
          img.isPrimary ? 1 : 0
        );
      });

      normalized.colors.forEach((col, idx) => {
        insertColor.run(
          `col-${id}-${idx}`,
          id,
          col.name.en,
          col.name.ar,
          col.hex
        );
      });

      if (normalized.stock) {
        for (const [size, qty] of Object.entries(normalized.stock)) {
          insertStock.run(
            `stk-${id}-${size}`,
            id,
            size,
            qty
          );
        }
      }
    });

    updateTransaction();
    return normalized;
  },

  delete(id: string): boolean {
    const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return info.changes > 0;
  },
};
