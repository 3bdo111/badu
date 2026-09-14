"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types/product";
import type { Dictionary, Locale } from "@/i18n/types";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "@/app/store/store.module.css";

interface StoreClientProps {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
}

const STORAGE_KEY = "badu-store-view";

function CardsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6.25" height="6.25" rx="1" />
      <rect x="8.75" y="1" width="6.25" height="6.25" rx="1" />
      <rect x="1" y="8.75" width="6.25" height="6.25" rx="1" />
      <rect x="8.75" y="8.75" width="6.25" height="6.25" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="2" width="14" height="2.75" rx="0.75" />
      <rect x="1" y="6.625" width="14" height="2.75" rx="0.75" />
      <rect x="1" y="11.25" width="14" height="2.75" rx="0.75" />
    </svg>
  );
}

export function StoreClient({ products, locale, dict }: StoreClientProps) {
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Hydration-safe localStorage initialization
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_KEY);
      if (savedView === "cards" || savedView === "list") {
        setTimeout(() => {
          setViewMode(savedView);
        }, 0);
      }
    } catch {
      // Browser storage error fallback
    }
  }, []);

  const handleViewChange = (mode: "cards" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Browser storage error fallback
    }
  };

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{dict.store.noProducts}</p>
      </div>
    );
  }

  const isRtl = locale === "ar";
  const arrowSymbol = isRtl ? "←" : "→";

  return (
    <div>
      {/* Toolbar / View Switcher */}
      <div className={styles.toolbarRow}>
        <div
          className={styles.viewSwitcher}
          role="group"
          aria-label={isRtl ? "طريقة عرض المنتجات" : "Product view options"}
        >
          <button
            type="button"
            className={`${styles.switchBtn} ${viewMode === "cards" ? styles.switchBtnActive : ""}`}
            onClick={() => handleViewChange("cards")}
            aria-pressed={viewMode === "cards"}
          >
            <CardsIcon />
            <span>{dict.store.cardsView}</span>
          </button>
          <button
            type="button"
            className={`${styles.switchBtn} ${viewMode === "list" ? styles.switchBtnActive : ""}`}
            onClick={() => handleViewChange("list")}
            aria-pressed={viewMode === "list"}
          >
            <ListIcon />
            <span>{dict.store.listView}</span>
          </button>
        </div>
      </div>

      {/* Product Display Mode */}
      {viewMode === "cards" ? (
        <div className={styles.grid}>
          {products.map((product) => {
            const primaryImage =
              product.images.find((img) => img.isPrimary) || product.images[0];

            const totalStock = Object.values(product.stock || {}).reduce(
              (sum, qty) => sum + qty,
              0
            );
            const inStock = totalStock > 0;
            const name = isRtl ? product.translations.ar.name : product.translations.en.name;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={styles.card}
              >
                <div className={styles.imageWrap}>
                  <span
                    className={[
                      styles.badge,
                      inStock ? styles.badgeInStock : styles.badgeOutOfStock,
                    ].join(" ")}
                  >
                    {inStock ? dict.store.inStock : dict.store.outOfStock}
                  </span>
                  {primaryImage && (
                    <ProductImage
                      product={product}
                      image={primaryImage}
                      sizes="(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw"
                    />
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.productName}>{name}</h2>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>
                      {formatPrice(product.price, product.currency, locale)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      {dict.store.exploreProduct} {arrowSymbol}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.list}>
          {products.map((product) => {
            const primaryImage =
              product.images.find((img) => img.isPrimary) || product.images[0];

            const totalStock = Object.values(product.stock || {}).reduce(
              (sum, qty) => sum + qty,
              0
            );
            const inStock = totalStock > 0;
            const name = isRtl ? product.translations.ar.name : product.translations.en.name;
            const description = isRtl
              ? product.translations.ar.description
              : product.translations.en.description;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={styles.listRow}
              >
                <div className={styles.listRowMain}>
                  <div className={styles.listThumbWrap}>
                    {primaryImage && (
                      <ProductImage
                        product={product}
                        image={primaryImage}
                        sizes="90px"
                      />
                    )}
                  </div>
                  <div className={styles.listContent}>
                    <div className={styles.listHeaderRow}>
                      <h2 className={styles.listName}>{name}</h2>
                      <span
                        className={[
                          styles.badge,
                          inStock ? styles.badgeInStock : styles.badgeOutOfStock,
                        ].join(" ")}
                        style={{ position: "static" }}
                      >
                        {inStock ? dict.store.inStock : dict.store.outOfStock}
                      </span>
                    </div>
                    {description && (
                      <p className={styles.listDescription}>{description}</p>
                    )}
                  </div>
                </div>

                <div className={styles.listActions}>
                  <span className={styles.price}>
                    {formatPrice(product.price, product.currency, locale)}
                  </span>
                  <span className={styles.listCta}>
                    {dict.store.exploreProduct} {arrowSymbol}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
