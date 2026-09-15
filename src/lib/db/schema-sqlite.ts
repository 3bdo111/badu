import type Database from "better-sqlite3";

/**
 * SQLite schema for local development.
 * Mirrors schema-postgres.ts. Flag columns are INTEGER 0/1; timestamps are
 * TEXT (ISO-8601) — identical to the PostgreSQL schema.
 */

export const SQLITE_PRAGMAS = [
  "journal_mode = WAL",
  "foreign_keys = ON",
] as const;

export const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    available INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    sort_order INTEGER NOT NULL DEFAULT 0,
    fit_en TEXT NOT NULL,
    fit_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    desc_en TEXT NOT NULL,
    desc_ar TEXT NOT NULL,
    artwork_en TEXT NOT NULL,
    artwork_ar TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    src TEXT NOT NULL,
    alt_en TEXT NOT NULL,
    alt_ar TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_colors (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    hex TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_stock (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
    UNIQUE(product_id, size),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_method TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    subtotal_amount REAL NOT NULL CHECK(subtotal_amount >= 0),
    total_amount REAL NOT NULL CHECK(total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    notes TEXT,
    stock_restored INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name_en TEXT NOT NULL,
    product_name_ar TEXT NOT NULL,
    size TEXT NOT NULL,
    color_name_en TEXT NOT NULL,
    color_name_ar TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price_per_unit REAL NOT NULL CHECK(price_per_unit >= 0),
    line_total REAL NOT NULL CHECK(line_total >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS storefront_sections (
    id TEXT PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    subtitle_en TEXT,
    subtitle_ar TEXT,
    body_en TEXT,
    body_ar TEXT,
    cta_label_en TEXT,
    cta_label_ar TEXT,
    cta_url TEXT,
    featured_product_id TEXT,
    image_url TEXT,
    visible INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT,
    draft_title_en TEXT,
    draft_title_ar TEXT,
    draft_subtitle_en TEXT,
    draft_subtitle_ar TEXT,
    draft_body_en TEXT,
    draft_body_ar TEXT,
    draft_cta_label_en TEXT,
    draft_cta_label_ar TEXT,
    draft_cta_url TEXT,
    draft_featured_product_id TEXT,
    draft_image_url TEXT,
    draft_visible INTEGER,
    draft_sort_order INTEGER,
    FOREIGN KEY (featured_product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS order_idempotency (
    key TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    order_number TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS navigation_items (
    id TEXT PRIMARY KEY,
    label_en TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    is_external INTEGER NOT NULL DEFAULT 0,
    target_blank INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS footer_groups (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS footer_links (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    label_en TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (group_id) REFERENCES footer_groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS product_size_guides (
    product_id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 1,
    title_en TEXT,
    title_ar TEXT,
    desc_en TEXT,
    desc_ar TEXT,
    unit TEXT NOT NULL DEFAULT 'cm',
    columns_json TEXT NOT NULL,
    rows_json TEXT NOT NULL,
    notes_en TEXT,
    notes_ar TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_faqs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    question_en TEXT NOT NULL,
    question_ar TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_ar TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_features (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    body_en TEXT NOT NULL,
    body_ar TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_story (
    product_id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    desc_en TEXT NOT NULL,
    desc_ar TEXT NOT NULL,
    images_json TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_artwork (
    product_id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    desc_en TEXT NOT NULL,
    desc_ar TEXT NOT NULL,
    images_json TEXT NOT NULL,
    captions_en_json TEXT NOT NULL,
    captions_ar_json TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_seo (
    product_id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    meta_desc_en TEXT NOT NULL,
    meta_desc_ar TEXT NOT NULL,
    og_image TEXT,
    canonical_override TEXT,
    indexable INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_stock_product ON product_stock(product_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_footer_links_group ON footer_links(group_id);
  CREATE INDEX IF NOT EXISTS idx_product_faqs_product ON product_faqs(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id);
`;

/**
 * Migrations for pre-existing SQLite databases created before the current
 * schema. Each step is additive and idempotent. New installations get the
 * full schema above and skip everything here.
 */
export function runSqliteMigrations(db: Database.Database): void {
  try {
    const orderCols = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
    const orderColNames = new Set(orderCols.map((c) => c.name));

    if (!orderColNames.has("subtotal_amount")) {
      db.exec("ALTER TABLE orders ADD COLUMN subtotal_amount REAL NOT NULL DEFAULT 0");
    }
    if (!orderColNames.has("total_amount")) {
      db.exec("ALTER TABLE orders ADD COLUMN total_amount REAL NOT NULL DEFAULT 0");
    }
    if (!orderColNames.has("payment_method")) {
      db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY'");
    }
    if (!orderColNames.has("payment_status")) {
      db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'PENDING'");
    }
    if (!orderColNames.has("stock_restored")) {
      db.exec("ALTER TABLE orders ADD COLUMN stock_restored INTEGER NOT NULL DEFAULT 0");
    }
    if (!orderColNames.has("customer_name")) {
      db.exec("ALTER TABLE orders ADD COLUMN customer_name TEXT NOT NULL DEFAULT ''");
    }
    if (!orderColNames.has("customer_phone")) {
      db.exec("ALTER TABLE orders ADD COLUMN customer_phone TEXT NOT NULL DEFAULT ''");
    }
    if (!orderColNames.has("customer_email")) {
      db.exec("ALTER TABLE orders ADD COLUMN customer_email TEXT");
    }
    if (!orderColNames.has("shipping_address")) {
      db.exec("ALTER TABLE orders ADD COLUMN shipping_address TEXT NOT NULL DEFAULT ''");
    }
    if (!orderColNames.has("city")) {
      db.exec("ALTER TABLE orders ADD COLUMN city TEXT NOT NULL DEFAULT ''");
    }
    if (!orderColNames.has("country")) {
      db.exec("ALTER TABLE orders ADD COLUMN country TEXT NOT NULL DEFAULT ''");
    }
    if (!orderColNames.has("notes")) {
      db.exec("ALTER TABLE orders ADD COLUMN notes TEXT");
    }

    const itemCols = db.prepare("PRAGMA table_info(order_items)").all() as Array<{ name: string }>;
    const itemColNames = new Set(itemCols.map((c) => c.name));

    if (!itemColNames.has("product_name_en")) {
      db.exec("ALTER TABLE order_items ADD COLUMN product_name_en TEXT NOT NULL DEFAULT ''");
    }
    if (!itemColNames.has("product_name_ar")) {
      db.exec("ALTER TABLE order_items ADD COLUMN product_name_ar TEXT NOT NULL DEFAULT ''");
    }
    if (!itemColNames.has("color_name_en")) {
      db.exec("ALTER TABLE order_items ADD COLUMN color_name_en TEXT NOT NULL DEFAULT ''");
    }
    if (!itemColNames.has("color_name_ar")) {
      db.exec("ALTER TABLE order_items ADD COLUMN color_name_ar TEXT NOT NULL DEFAULT ''");
    }
    if (!itemColNames.has("price_per_unit")) {
      db.exec("ALTER TABLE order_items ADD COLUMN price_per_unit REAL NOT NULL DEFAULT 0");
    }
    if (!itemColNames.has("line_total")) {
      db.exec("ALTER TABLE order_items ADD COLUMN line_total REAL NOT NULL DEFAULT 0");
    }

    const storefrontCols = db.prepare("PRAGMA table_info(storefront_sections)").all() as Array<{ name: string }>;
    const storefrontColNames = new Set(storefrontCols.map((c) => c.name));

    if (!storefrontColNames.has("draft_title_en")) {
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_title_en TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_title_ar TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_subtitle_en TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_subtitle_ar TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_body_en TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_body_ar TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_cta_label_en TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_cta_label_ar TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_cta_url TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_featured_product_id TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_image_url TEXT");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_visible INTEGER");
      db.exec("ALTER TABLE storefront_sections ADD COLUMN draft_sort_order INTEGER");

      db.exec(`
        UPDATE storefront_sections SET
          draft_title_en = title_en,
          draft_title_ar = title_ar,
          draft_subtitle_en = subtitle_en,
          draft_subtitle_ar = subtitle_ar,
          draft_body_en = body_en,
          draft_body_ar = body_ar,
          draft_cta_label_en = cta_label_en,
          draft_cta_label_ar = cta_label_ar,
          draft_cta_url = cta_url,
          draft_featured_product_id = featured_product_id,
          draft_image_url = image_url,
          draft_visible = visible,
          draft_sort_order = sort_order
      `);
    }

    const productCols = db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>;
    const productColNames = new Set(productCols.map((c) => c.name));

    if (!productColNames.has("status")) {
      db.exec("ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'PUBLISHED'");
    }
    if (!productColNames.has("sort_order")) {
      db.exec("ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
    }
    if (!productColNames.has("compare_at_price")) {
      db.exec("ALTER TABLE products ADD COLUMN compare_at_price REAL");
    }
  } catch {
    // Migration check failsafe
  }
}
