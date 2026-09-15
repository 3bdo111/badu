"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types/product";
import { productName } from "@/lib/types/product";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPriceDisplay } from "@/components/product/ProductPriceDisplay";
import styles from "./mobile-sticky-buy-bar.module.css";

interface MobileStickyBuyBarProps {
  product: Product;
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onAddToCart: () => void;
  isAdded: boolean;
}

export function MobileStickyBuyBar({
  product,
  selectedSize,
  onSelectSize,
  onAddToCart,
  isAdded,
}: MobileStickyBuyBarProps) {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 350px down
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
        setSizePickerOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible || !product) return null;

  const primaryImage = product.images[0];

  const handleBuyClick = () => {
    if (!selectedSize) {
      setSizePickerOpen((prev) => !prev);
    } else {
      onAddToCart();
      setSizePickerOpen(false);
    }
  };

  return (
    <div className={styles.stickyContainer} role="region" aria-label="Quick Purchase Bar">
      {sizePickerOpen && !selectedSize && (
        <div className={styles.sizeDrawer}>
          <div className={styles.sizeDrawerHeader}>
            <span>{t("product.sizeLabel")}:</span>
            <button
              type="button"
              className={styles.closePicker}
              onClick={() => setSizePickerOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className={styles.sizePills}>
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={[
                  styles.sizePill,
                  selectedSize === s ? styles.activePill : "",
                ].join(" ")}
                onClick={() => {
                  onSelectSize(s);
                  setSizePickerOpen(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.barContent}>
        <div className={styles.productBrief}>
          <div className={styles.thumbWrap}>
            <ProductImage product={product} image={primaryImage} sizes="48px" />
          </div>
          <div className={styles.meta}>
            <span className={styles.title}>{productName(product, locale)}</span>
            <div className={styles.priceRow}>
              <ProductPriceDisplay product={product} size="sm" showBadge={false} />
              <button
                type="button"
                className={styles.sizeBadge}
                onClick={() => setSizePickerOpen((prev) => !prev)}
              >
                {selectedSize ? `${t("product.sizeLabel")}: ${selectedSize}` : t("sections.purchase.selectSize")}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBuyClick}
          className={[
            styles.ctaButton,
            isAdded ? styles.addedCta : "",
          ].join(" ")}
        >
          {isAdded
            ? t("sections.purchase.added")
            : selectedSize
            ? t("sections.purchase.addToCart")
            : locale === "ar"
            ? "اختر المقاس"
            : "SELECT SIZE"}
        </button>
      </div>
    </div>
  );
}
