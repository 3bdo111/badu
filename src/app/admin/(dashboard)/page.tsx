"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { ProductTable } from "@/components/admin/ProductTable";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { Button } from "@/components/ui/Button";
import styles from "./admin-overview.module.css";

export default function AdminOverviewPage() {
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Subscribe to product state changes
    const unsubscribe = productService.subscribe(() => {
      setProducts([...productService.getProducts()]);
    });

    return () => unsubscribe();
  }, []);

  // Real data metrics
  const totalCount = products.length;
  const visibleCount = products.filter((p) => p.available).length;
  const outOfStockCount = products.filter((p) => !p.available).length;
  const featuredCount = products.filter((p) => p.featured).length;

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      productService.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className={styles.overviewContainer}>
      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{t("admin.metricTotal")}</span>
          <span className={styles.metricValue}>{totalCount}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{t("admin.metricVisible")}</span>
          <span className={styles.metricValue}>{visibleCount}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{t("admin.metricOutOfStock")}</span>
          <span className={styles.metricValue}>{outOfStockCount}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{t("admin.metricFeatured")}</span>
          <span className={styles.metricValue}>{featuredCount}</span>
        </div>
      </div>

      {/* Quick Action & Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("admin.products")}</h2>
        <div className={styles.quickActions}>
          <Button href="/admin/products/new" variant="primary" size="md">
            + {t("admin.addProduct")}
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <ProductTable products={products} onDelete={handleDeleteClick} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        productName={
          deletingProduct
            ? deletingProduct.translations[locale]?.name || deletingProduct.translations.en.name
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
