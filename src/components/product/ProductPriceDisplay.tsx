"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types/product";
import { getDiscountInfo } from "@/lib/types/product";
import styles from "./product-price-display.module.css";

interface ProductPriceDisplayProps {
  product: Product;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  variant?: "default" | "inverse";
  className?: string;
}

export function ProductPriceDisplay({
  product,
  size = "md",
  showBadge = true,
  variant = "default",
  className,
}: ProductPriceDisplayProps) {
  const { locale } = useI18n();
  const discount = getDiscountInfo(product);

  const formattedPrice = formatPrice(product.price, product.currency, locale);
  const containerClasses = [styles.container, styles[size], styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (!discount) {
    return (
      <div className={containerClasses}>
        <span className={styles.currentPrice}>{formattedPrice}</span>
      </div>
    );
  }

  const formattedOriginalPrice = formatPrice(
    discount.originalPrice,
    product.currency,
    locale
  );

  const discountBadgeText =
    locale === "ar"
      ? `خصم ${discount.discountPercent}%`
      : `${discount.discountPercent}% OFF`;

  return (
    <div className={containerClasses}>
      <span className={styles.currentPrice}>{formattedPrice}</span>
      <s className={styles.originalPrice}>{formattedOriginalPrice}</s>
      {showBadge && (
        <span className={styles.discountBadge}>{discountBadgeText}</span>
      )}
    </div>
  );
}

