"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { Product } from "@/lib/types/product";
import { productName, getProductStockForSize } from "@/lib/types/product";
import { productService } from "@/lib/services/product-service";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPriceDisplay } from "@/components/product/ProductPriceDisplay";
import styles from "./product-table.module.css";

export function ProductTable({
  products,
  onDelete,
  onUpdateProduct,
}: {
  products: Product[];
  onDelete: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
}) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  const handleToggleAvailable = (product: Product) => {
    const updated = productService.updateProduct(product.id, {
      available: !product.available,
    });
    if (updated && onUpdateProduct) {
      onUpdateProduct(updated);
    }
  };

  const handleToggleFeatured = (product: Product) => {
    const updated = productService.updateProduct(product.id, {
      featured: !product.featured,
    });
    if (updated && onUpdateProduct) {
      onUpdateProduct(updated);
    }
  };

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{t("admin.noProducts")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Desktop Table View */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t("admin.colProduct")}</th>
              <th scope="col">{t("admin.colPrice")}</th>
              <th scope="col">{isAr ? "المقاسات والمخزون" : "Sizes & Stock"}</th>
              <th scope="col">{t("admin.colStock")}</th>
              <th scope="col">{t("admin.colStatus")}</th>
              <th scope="col">{t("admin.colFeatured")}</th>
              <th scope="col" className={styles.alignEnd}>{t("admin.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const primaryImg = product.images[0];
              const sizeList = product.sizes || ["S", "M", "L", "XL"];

              return (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.thumbFrame}>
                        {primaryImg && (
                          <ProductImage
                            product={product}
                            image={primaryImg}
                            sizes="48px"
                          />
                        )}
                      </div>
                      <div className={styles.productMeta}>
                        <span className={styles.productTitle}>
                          {productName(product, locale)}
                        </span>
                        <span className={styles.productSlug}>{product.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className={styles.priceCell}>
                    <ProductPriceDisplay product={product} size="sm" />
                  </td>

                  {/* Sizes & Stock breakdown */}
                  <td>
                    <div className={styles.sizesList}>
                      {sizeList.map((sz) => {
                        const count = getProductStockForSize(product, sz);
                        const isOut = count === 0;
                        return (
                          <span
                            key={sz}
                            className={`${styles.sizeChip} ${
                              isOut ? styles.sizeChipOutOfStock : ""
                            }`}
                          >
                            <strong>{sz}</strong>
                            {product.stock ? (
                              <span style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                                ({count})
                              </span>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* In Stock Badge */}
                  <td>
                    <span
                      className={[
                        styles.badge,
                        product.available ? styles.badgeSuccess : styles.badgeMuted,
                      ].join(" ")}
                    >
                      {product.available
                        ? t("admin.statusInStock")
                        : t("admin.statusOutOfStock")}
                    </span>
                  </td>

                  {/* Toggle Store Visibility */}
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailable(product)}
                      className={styles.toggleBtn}
                      title={isAr ? "انقر لتغيير حالة الظهور" : "Click to toggle storefront visibility"}
                    >
                      <span
                        className={[
                          styles.badge,
                          product.available ? styles.badgePrimary : styles.badgeMuted,
                        ].join(" ")}
                      >
                        {product.available
                          ? t("admin.statusVisible")
                          : t("admin.statusHidden")}
                      </span>
                    </button>
                  </td>

                  {/* Toggle Featured */}
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product)}
                      className={styles.toggleBtn}
                      title={isAr ? "انقر لتغيير حالة التمييز" : "Click to toggle featured status"}
                    >
                      <span
                        className={[
                          styles.badge,
                          product.featured ? styles.badgeSuccess : styles.badgeMuted,
                        ].join(" ")}
                      >
                        {product.featured
                          ? t("admin.statusFeatured")
                          : t("admin.statusNotFeatured")}
                      </span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className={styles.alignEnd}>
                    <div className={styles.actionsGroup}>
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className={styles.editBtn}
                        style={{ color: "var(--color-muted)", textDecoration: "underline" }}
                      >
                        {isAr ? "عرض" : "View"}
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className={styles.editBtn}
                      >
                        {t("admin.edit")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className={styles.deleteBtn}
                      >
                        {t("admin.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className={styles.cardsList}>
        {products.map((product) => {
          const primaryImg = product.images[0];
          const sizeList = product.sizes || ["S", "M", "L", "XL"];

          return (
            <div key={product.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.thumbFrame}>
                  {primaryImg && (
                    <ProductImage
                      product={product}
                      image={primaryImg}
                      sizes="48px"
                    />
                  )}
                </div>
                <div className={styles.productMeta}>
                  <h4 className={styles.productTitle}>
                    {productName(product, locale)}
                  </h4>
                  <div className={styles.priceCell}>
                    <ProductPriceDisplay product={product} size="sm" />
                  </div>
                </div>
              </div>

              {/* Mobile Sizes display */}
              <div style={{ marginBlock: "0.25rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-muted)",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  {isAr ? "المقاسات والمخزون:" : "Sizes & Stock:"}
                </span>
                <div className={styles.sizesList}>
                  {sizeList.map((sz) => {
                    const count = getProductStockForSize(product, sz);
                    const isOut = count === 0;
                    return (
                      <span
                        key={sz}
                        className={`${styles.sizeChip} ${
                          isOut ? styles.sizeChipOutOfStock : ""
                        }`}
                      >
                        <strong>{sz}</strong>
                        {product.stock ? (
                          <span style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                            ({count})
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className={styles.cardBadges}>
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(product)}
                  className={styles.toggleBtn}
                >
                  <span
                    className={[
                      styles.badge,
                      product.available ? styles.badgeSuccess : styles.badgeMuted,
                    ].join(" ")}
                  >
                    {product.available
                      ? t("admin.statusInStock")
                      : t("admin.statusOutOfStock")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleAvailable(product)}
                  className={styles.toggleBtn}
                >
                  <span
                    className={[
                      styles.badge,
                      product.available ? styles.badgePrimary : styles.badgeMuted,
                    ].join(" ")}
                  >
                    {product.available
                      ? t("admin.statusVisible")
                      : t("admin.statusHidden")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFeatured(product)}
                  className={styles.toggleBtn}
                >
                  <span
                    className={[
                      styles.badge,
                      product.featured ? styles.badgeSuccess : styles.badgeMuted,
                    ].join(" ")}
                  >
                    {product.featured
                      ? t("admin.statusFeatured")
                      : t("admin.statusNotFeatured")}
                  </span>
                </button>
              </div>

              <div className={styles.cardFooter}>
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className={styles.editBtn}
                  style={{ color: "var(--color-muted)", textDecoration: "underline" }}
                >
                  {isAr ? "عرض" : "View"}
                </Link>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className={styles.editBtn}
                >
                  {t("admin.edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className={styles.deleteBtn}
                >
                  {t("admin.delete")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
