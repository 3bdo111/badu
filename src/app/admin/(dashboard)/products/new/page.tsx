"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { ProductForm } from "@/components/admin/ProductForm";
import styles from "../products-list.module.css";

export default function AddProductPage() {
  const { t } = useI18n();

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
          <h1 className={styles.pageTitle}>{t("admin.addProduct")}</h1>
        </div>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
