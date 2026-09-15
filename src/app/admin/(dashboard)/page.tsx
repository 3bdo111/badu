"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { ProductTable } from "@/components/admin/ProductTable";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { Button } from "@/components/ui/Button";
import styles from "./admin-overview.module.css";

interface CrmMetrics {
  totalCustomers: number;
  vipCount: number;
  returningCount: number;
  totalCrmRevenue: number;
}

export default function AdminOverviewPage() {
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [crmMetrics, setCrmMetrics] = useState<CrmMetrics>({
    totalCustomers: 0,
    vipCount: 0,
    returningCount: 0,
    totalCrmRevenue: 0,
  });
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    // Subscribe to product state changes
    const unsubscribe = productService.subscribe(() => {
      setProducts([...productService.getProducts()]);
    });

    // Fetch CRM & Order overview data
    async function fetchCrmOverview() {
      try {
        setLoadingMetrics(true);
        const [custRes, ordRes] = await Promise.all([
          fetch('/api/admin/customers'),
          fetch('/api/admin/orders'),
        ]);

        if (custRes.ok) {
          const custData = await custRes.json();
          if (custData.metrics) {
            setCrmMetrics(custData.metrics);
          }
        }

        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (Array.isArray(ordData.orders)) {
            setOrdersCount(ordData.orders.length);
          }
        }
      } catch (err) {
        console.error("Failed fetching CRM overview:", err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchCrmOverview();

    return () => unsubscribe();
  }, []);

  // Product metrics
  const totalCount = products.length;
  const visibleCount = products.filter((p) => p.available).length;
  const outOfStockCount = products.filter((p) => !p.available).length;

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
      {/* Executive CRM & Sales Metrics Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            🚀 نظرة عامة على المبيعات والعملاء (CRM)
          </h2>
          <Link
            href="/admin/customers"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            فتح لوحة CRM الكاملة ←
          </Link>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>إجمالي إيرادات المبيعات</span>
            <span className={styles.metricValue}>
              {loadingMetrics ? '...' : `${crmMetrics.totalCrmRevenue.toLocaleString()} ج.م`}
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>إجمالي العملاء المسجلين</span>
            <span className={styles.metricValue}>
              {loadingMetrics ? '...' : crmMetrics.totalCustomers}
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>إجمالي طلبات المتجر</span>
            <span className={styles.metricValue}>
              {loadingMetrics ? '...' : ordersCount}
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>عملاء VIP المميزون</span>
            <span className={styles.metricValue}>
              {loadingMetrics ? '...' : crmMetrics.vipCount}
            </span>
          </div>
        </div>
      </div>

      {/* Product Catalog Overview Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
          📦 إحصائيات المنتجات والمعروضات
        </h2>
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
        </div>
      </div>

      {/* Quick Action & Header */}
      <div className={styles.sectionHeader} style={{ marginTop: '1rem' }}>
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
