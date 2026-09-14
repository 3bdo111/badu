/**
 * PostgreSQL schema for production (managed Neon PostgreSQL).
 * Equivalent to schema-sqlite.ts:
 *   - flag columns are INTEGER (0/1) so application code behaves identically
 *   - timestamps are TEXT (ISO-8601)
 *   - IDs are TEXT (application-generated)
 */

export const POSTGRES_SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    price DOUBLE PRECISION NOT NULL CHECK(price >= 0),
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
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    src TEXT NOT NULL,
    alt_en TEXT NOT NULL,
    alt_ar TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS product_colors (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    hex TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_stock (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
    UNIQUE(product_id, size)
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
    user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_method TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    subtotal_amount DOUBLE PRECISION NOT NULL CHECK(subtotal_amount >= 0),
    total_amount DOUBLE PRECISION NOT NULL CHECK(total_amount >= 0),
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
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name_en TEXT NOT NULL,
    product_name_ar TEXT NOT NULL,
    size TEXT NOT NULL,
    color_name_en TEXT NOT NULL,
    color_name_ar TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price_per_unit DOUBLE PRECISION NOT NULL CHECK(price_per_unit >= 0),
    line_total DOUBLE PRECISION NOT NULL CHECK(line_total >= 0)
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
    featured_product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
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
    draft_sort_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS order_idempotency (
    key TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    created_at TEXT NOT NULL
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
    group_id TEXT NOT NULL REFERENCES footer_groups(id) ON DELETE CASCADE,
    label_en TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
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
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    enabled INTEGER NOT NULL DEFAULT 1,
    title_en TEXT,
    title_ar TEXT,
    desc_en TEXT,
    desc_ar TEXT,
    unit TEXT NOT NULL DEFAULT 'cm',
    columns_json TEXT NOT NULL,
    rows_json TEXT NOT NULL,
    notes_en TEXT,
    notes_ar TEXT
  );

  CREATE TABLE IF NOT EXISTS product_faqs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    question_en TEXT NOT NULL,
    question_ar TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_ar TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS product_features (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    body_en TEXT NOT NULL,
    body_ar TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS product_story (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    desc_en TEXT NOT NULL,
    desc_ar TEXT NOT NULL,
    images_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_artwork (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    desc_en TEXT NOT NULL,
    desc_ar TEXT NOT NULL,
    images_json TEXT NOT NULL,
    captions_en_json TEXT NOT NULL,
    captions_ar_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_seo (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    meta_desc_en TEXT NOT NULL,
    meta_desc_ar TEXT NOT NULL,
    og_image TEXT,
    canonical_override TEXT,
    indexable INTEGER NOT NULL DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_stock_product ON product_stock(product_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_order_idempotency_created ON order_idempotency(created_at);
  CREATE INDEX IF NOT EXISTS idx_footer_links_group ON footer_links(group_id);
  CREATE INDEX IF NOT EXISTS idx_product_faqs_product ON product_faqs(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id);
`;
