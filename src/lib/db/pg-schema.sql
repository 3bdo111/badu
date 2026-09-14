-- BADU E-Commerce PostgreSQL DDL Schema

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DOUBLE PRECISION NOT NULL CHECK(price >= 0),
  currency VARCHAR(50) NOT NULL DEFAULT 'USD',
  available INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  fit_en TEXT NOT NULL,
  fit_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  artwork_en TEXT NOT NULL,
  artwork_ar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  alt_en TEXT NOT NULL,
  alt_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_colors (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  hex VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_stock (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
  CONSTRAINT unq_product_size UNIQUE (product_id, size)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  subtotal_amount DOUBLE PRECISION NOT NULL CHECK(subtotal_amount >= 0),
  total_amount DOUBLE PRECISION NOT NULL CHECK(total_amount >= 0),
  currency VARCHAR(50) NOT NULL DEFAULT 'USD',
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  shipping_address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  notes TEXT,
  stock_restored INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_name_en VARCHAR(255) NOT NULL,
  product_name_ar VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  color_name_en VARCHAR(255) NOT NULL,
  color_name_ar VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  price_per_unit DOUBLE PRECISION NOT NULL CHECK(price_per_unit >= 0),
  line_total DOUBLE PRECISION NOT NULL CHECK(line_total >= 0)
);

CREATE TABLE IF NOT EXISTS storefront_sections (
  id VARCHAR(255) PRIMARY KEY,
  section_key VARCHAR(255) UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  subtitle_en TEXT,
  subtitle_ar TEXT,
  body_en TEXT,
  body_ar TEXT,
  cta_label_en TEXT,
  cta_label_ar TEXT,
  cta_url TEXT,
  featured_product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
  image_url TEXT,
  visible INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  draft_title_en TEXT,
  draft_title_ar TEXT,
  draft_subtitle_en TEXT,
  draft_subtitle_ar TEXT,
  draft_body_en TEXT,
  draft_body_ar TEXT,
  draft_cta_label_en TEXT,
  draft_cta_label_ar TEXT,
  draft_cta_url TEXT,
  draft_featured_product_id VARCHAR(255),
  draft_image_url TEXT,
  draft_visible INTEGER,
  draft_sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id VARCHAR(255) PRIMARY KEY,
  label_en VARCHAR(255) NOT NULL,
  label_ar VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  is_external INTEGER NOT NULL DEFAULT 0,
  target_blank INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS footer_groups (
  id VARCHAR(255) PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS footer_links (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL REFERENCES footer_groups(id) ON DELETE CASCADE,
  label_en VARCHAR(255) NOT NULL,
  label_ar VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS social_links (
  id VARCHAR(255) PRIMARY KEY,
  platform VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_size_guides (
  product_id VARCHAR(255) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  enabled INTEGER NOT NULL DEFAULT 1,
  title_en TEXT,
  title_ar TEXT,
  desc_en TEXT,
  desc_ar TEXT,
  unit VARCHAR(50) NOT NULL DEFAULT 'cm',
  columns_json TEXT NOT NULL,
  rows_json TEXT NOT NULL,
  notes_en TEXT,
  notes_ar TEXT
);

CREATE TABLE IF NOT EXISTS product_faqs (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_features (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_ar TEXT NOT NULL,
  icon VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_story (
  product_id VARCHAR(255) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  images_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_artwork (
  product_id VARCHAR(255) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  images_json TEXT NOT NULL,
  captions_en_json TEXT NOT NULL,
  captions_ar_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_seo (
  product_id VARCHAR(255) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  meta_desc_en TEXT NOT NULL,
  meta_desc_ar TEXT NOT NULL,
  og_image TEXT,
  canonical_override TEXT,
  indexable INTEGER NOT NULL DEFAULT 1
);

