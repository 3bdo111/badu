import type { Locale } from "@/i18n/types";

export interface LocalizedString {
  en: string;
  ar: string;
}

export interface ProductImage {
  id?: string;
  src: string;
  alt: LocalizedString;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductColor {
  name: LocalizedString;
  /** Representative swatch of the garment color. */
  hex: string;
}

export interface ProductFeature {
  id?: string;
  title: LocalizedString;
  body: LocalizedString;
  icon?: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface ProductFaq {
  id?: string;
  question: LocalizedString;
  answer: LocalizedString;
  sortOrder?: number;
  visible?: boolean;
}

export interface ProductSizeGuide {
  enabled: boolean;
  title?: LocalizedString;
  description?: LocalizedString;
  unit: string; // e.g. "cm" or "in"
  columns: string[]; // e.g. ["Size", "Chest", "Length", "Sleeve"]
  rows: Array<Record<string, string>>; // e.g. [{ "Size": "S", "Chest": "58", "Length": "68", "Sleeve": "60" }]
  notes?: LocalizedString;
}

export interface ProductStoryContent {
  title: LocalizedString;
  description: LocalizedString;
  images: string[];
}

export interface ProductArtworkContent {
  title: LocalizedString;
  description: LocalizedString;
  images: string[];
  captions: LocalizedString[];
}

export interface ProductSeo {
  title: LocalizedString;
  metaDescription: LocalizedString;
  ogImage?: string;
  canonicalOverride?: string;
  indexable: boolean;
}

/** Garment measurements in centimetres. Null = not yet available. */
export interface SizeMeasurement {
  size: string;
  chest: number | null;
  length: number | null;
  sleeve: number | null;
}

/**
 * BADU canonical product model.
 * Single source of truth consumed by Admin and Storefront.
 */
export interface Product {
  id: string;
  slug: string;
  price: number;
  /** Original price before discount (optional). If greater than price, product is on sale. */
  compareAtPrice?: number | null;
  /** ISO 4217 code, formatted with Intl.NumberFormat per locale. */
  currency: string;
  images: ProductImage[];
  sizes: string[];
  /** Stock quantity mapped per size string e.g. { S: 10, M: 10, L: 5, XL: 0 } */
  stock?: Record<string, number>;
  colors: ProductColor[];
  /** e.g. { en: "Relaxed fit", ar: "قصة مريحة" } */
  fit: LocalizedString;
  features: ProductFeature[];
  faqs?: ProductFaq[];
  sizeGuide?: ProductSizeGuide;
  storyContent?: ProductStoryContent;
  artworkContent?: ProductArtworkContent;
  seo?: ProductSeo;
  /** Storefront status: DRAFT | PUBLISHED | ARCHIVED */
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sortOrder?: number;
  /** Populated once real measurements exist; UI falls back to placeholders. */
  measurements?: SizeMeasurement[];
  /** Storefront visibility toggle */
  available: boolean;
  /** Featured product status toggle */
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations: Record<
    Locale,
    {
      name: string;
      description: string;
      /** Short artwork story shown in the product details area. */
      artwork: string;
    }
  >;
}

export interface DiscountInfo {
  hasDiscount: boolean;
  originalPrice: number;
  discountedPrice: number;
  savingsAmount: number;
  discountPercent: number;
}

export function getDiscountInfo(product: Product): DiscountInfo | null {
  if (
    typeof product.compareAtPrice === "number" &&
    !isNaN(product.compareAtPrice) &&
    product.compareAtPrice > product.price
  ) {
    const savingsAmount = product.compareAtPrice - product.price;
    const discountPercent = Math.round((savingsAmount / product.compareAtPrice) * 100);
    return {
      hasDiscount: true,
      originalPrice: product.compareAtPrice,
      discountedPrice: product.price,
      savingsAmount,
      discountPercent,
    };
  }
  return null;
}

export function productName(product: Product, locale: Locale): string {
  return product.translations[locale]?.name || product.translations.en.name;
}

export function productDescription(product: Product, locale: Locale): string {
  return product.translations[locale]?.description || product.translations.en.description;
}

export function productArtworkText(product: Product, locale: Locale): string {
  return product.translations[locale]?.artwork || product.translations.en.artwork;
}

export function productImageAlt(image: ProductImage, locale: Locale): string {
  return image.alt[locale] || image.alt.en;
}

export function isProductAvailable(product?: Product | null): boolean {
  if (!product) return false;
  return Boolean(product.available);
}

export function getProductStockForSize(product: Product, size: string): number {
  if (!product.stock) {
    // If no explicit stock object exists, fall back to product availability
    return product.available ? 999 : 0;
  }
  return typeof product.stock[size] === "number" ? Math.max(0, product.stock[size]) : (product.available ? 999 : 0);
}

export function isSizeAvailable(product: Product, size: string): boolean {
  if (!product.available) return false;
  if (!product.sizes.includes(size)) return false;
  return getProductStockForSize(product, size) > 0;
}
