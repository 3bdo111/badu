"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { productName } from "@/lib/types/product";
import { ProductForm } from "@/components/admin/ProductForm";
import styles from "../../products-list.module.css";

export default function EditProductPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [product, setProduct] = useState<Product | null>(() =>
    id ? productService.getProductById(id) || null : null
  );

  useEffect(() => {
    return productService.subscribe(() => {
      if (id) {
        setProduct(productService.getProductById(id) || null);
      }
    });
  }, [id]);

  if (!product) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{t("admin.editProduct")}</h1>
        </div>
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p style={{ color: "var(--color-muted)", marginBottom: "1rem" }}>
            {t("admin.noProducts")}
          </p>
          <Link
            href="/admin/products"
            style={{
              color: "var(--color-foreground)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            ← {t("admin.products")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/admin/products"
            style={{
              fontSize: "0.875rem",
              color: "var(--color-muted)",
              textDecoration: "none",
            }}
          >
            ← {t("admin.products")}
          </Link>
          <h1 className={styles.pageTitle}>
            {t("admin.editProduct")}: {productName(product, locale)}
          </h1>
        </div>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
