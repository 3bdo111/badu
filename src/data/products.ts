import type { Product } from "@/lib/types/product";
import { initialProducts } from "./initial-products";
import { productRepository } from "@/lib/services/product-service";

export const products: Product[] = initialProducts;

/** Returns all storefront-visible products */
export function getVisibleProducts(): Product[] {
  return productRepository.getVisible();
}

/** Returns the featured storefront-visible product */
export function getFeaturedProduct(): Product | undefined {
  const visible = productRepository.getVisible();
  return visible.find((product) => product.featured) ?? visible[0];
}

/** Returns product by slug if available and visible to public */
export function getProductBySlug(slug: string): Product | undefined {
  const found = productRepository.getBySlug(slug);
  if (!found || !found.available) return undefined;
  return found;
}

/** Explicit alias for storefront visible product query */
export function getVisibleProductBySlug(slug: string): Product | undefined {
  return getProductBySlug(slug);
}
