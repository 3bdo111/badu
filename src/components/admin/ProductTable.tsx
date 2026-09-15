"use client";

import { useState } from "react";
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

  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});

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

  const openStockModal = (product: Product) => {
    const sizesList = product.sizes || ["S", "M", "L", "XL"];
    const initialMap: Record<string, number> = {};
    sizesList.forEach((sz) => {
      initialMap[sz] = getProductStockForSize(product, sz);
    });
    setStockInputs(initialMap);
    setEditingStockProduct(product);
  };

  const saveStockChanges = () => {
    if (!editingStockProduct) return;
    const updated = productService.updateProduct(editingStockProduct.id, {
      stock: stockInputs,
    });
    if (updated && onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setEditingStockProduct(null);
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

                  {/* Sizes & Stock breakdown - Click to edit */}
                  <td>
                    <button
                      type="button"
                      onClick={() => openStockModal(product)}
                      className={styles.toggleBtn}
                      title={isAr ? "انقر لتعديل كميات المقاسات" : "Click to edit size stock quantities"}
                    >
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
                              <span style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                                ({count})
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </button>
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
                      title={isAr ? "انقر لتغيير حالة الظهور في المتجر" : "Click to toggle storefront visibility"}
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
                      <button
                        type="button"
                        onClick={() => openStockModal(product)}
                        className={styles.editBtn}
                        style={{ color: "var(--color-primary)", fontWeight: 600 }}
                      >
                        {isAr ? "تعديل الكميات" : "Edit Stock"}
                      </button>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                    {isAr ? "المقاسات والمخزون:" : "Sizes & Stock:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openStockModal(product)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isAr ? "تعديل الكميات" : "Edit Stock"}
                  </button>
                </div>

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
                        <span style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                          ({count})
                        </span>
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

      {/* Quick Stock Editor Modal */}
      {editingStockProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setEditingStockProduct(null)}
        >
          <div
            style={{
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              width: "24rem",
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                  {isAr ? "تعديل كميات المخزون" : "Edit Stock Quantities"}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                  {productName(editingStockProduct, locale)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingStockProduct(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  color: "var(--color-foreground)",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {/* Inputs list for each size */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Object.keys(stockInputs).map((sizeKey) => (
                <div
                  key={sizeKey}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-surface, rgba(255,255,255,0.03))",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <strong style={{ fontSize: "0.9rem" }}>
                    {isAr ? `المقاس ${sizeKey}` : `Size ${sizeKey}`}
                  </strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                      {isAr ? "الكمية:" : "Qty:"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={stockInputs[sizeKey]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setStockInputs({
                          ...stockInputs,
                          [sizeKey]: isNaN(val) ? 0 : Math.max(0, val),
                        });
                      }}
                      style={{
                        width: "5rem",
                        padding: "0.35rem 0.5rem",
                        backgroundColor: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-foreground)",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={saveStockChanges}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  backgroundColor: "var(--color-foreground)",
                  color: "var(--color-background)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                {isAr ? "حفظ التعديلات" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingStockProduct(null)}
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: "transparent",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
