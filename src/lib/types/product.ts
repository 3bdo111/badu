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
  title: LocalizedString;
  body: LocalizedString;
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
