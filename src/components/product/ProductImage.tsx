"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { productImageAlt, productName } from "@/lib/types/product";
import type { Product, ProductImage as ProductImageData } from "@/lib/types/product";
import styles from "./product-image.module.css";

/**
 * Renders a product image from the Product data model.
 *
 * Until real photography is added to /public/images/products/...,
 * a missing file renders a quiet labelled frame instead of a broken image.
 * This is intentionally NOT a generated stand-in photo.
 */
export function ProductImage({
  product,
  image,
  priority = false,
  sizes = "(min-width: 64rem) 50vw, 100vw",
}: {
  product: Product;
  image: ProductImageData;
  priority?: boolean;
  sizes?: string;
}) {
  const { locale } = useI18n();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={styles.pending}
        role="img"
        aria-label={productImageAlt(image, locale)}
      >
        <span className={styles.pendingMark}>BADU</span>
        <span className={styles.pendingLabel}>
          {productName(product, locale)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={productImageAlt(image, locale)}
      fill
      priority={priority}
      sizes={sizes}
      className={styles.image}
      onError={() => setFailed(true)}
    />
  );
}
