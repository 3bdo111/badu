"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { Product } from "@/lib/types/product";
import { productName } from "@/lib/types/product";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "./product-table.module.css";

export function ProductTable({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (product: Product) => void;
}) {
  const { t, locale } = useI18n();

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
              <th scope="col">{t("admin.colStock")}</th>
              <th scope="col">{t("admin.colStatus")}</th>
              <th scope="col">{t("admin.colFeatured")}</th>
              <th scope="col" className={styles.alignEnd}>{t("admin.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const primaryImg = product.images[0];
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
                    {formatPrice(product.price, product.currency, locale)}
                  </td>
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
                  <td>
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
                  </td>
                  <td>
                    <span className={styles.badgeText}>
                      {product.featured
                        ? t("admin.statusFeatured")
                        : t("admin.statusNotFeatured")}
                    </span>
                  </td>
                  <td className={styles.alignEnd}>
                    <div className={styles.actionsGroup}>
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className={styles.editBtn}
                        style={{ color: "var(--color-muted)", textDecoration: "underline" }}
                      >
                        {locale === "ar" ? "عرض" : "View"}
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
                  <span className={styles.priceCell}>
                    {formatPrice(product.price, product.currency, locale)}
                  </span>
                </div>
              </div>

              <div className={styles.cardBadges}>
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
                {product.featured && (
                  <span className={styles.badgeText}>
                    {t("admin.statusFeatured")}
                  </span>
                )}
              </div>

              <div className={styles.cardFooter}>
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className={styles.editBtn}
                  style={{ color: "var(--color-muted)", textDecoration: "underline" }}
                >
                  {locale === "ar" ? "عرض" : "View"}
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
