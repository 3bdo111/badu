"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { productName } from "@/lib/types/product";
import { ProductTable } from "@/components/admin/ProductTable";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { Button } from "@/components/ui/Button";
import styles from "./products-list.module.css";

type FilterTab = "all" | "visible" | "hidden" | "inStock" | "outOfStock" | "featured";

export default function AdminProductsPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = productService.subscribe(() => {
      setProducts([...productService.getProducts()]);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      productService.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const checkInStock = (p: Product) => {
    if (!p.available) return false;
    if (!p.stock) return true;
    return Object.values(p.stock).some((qty) => qty > 0);
  };

  const checkOutOfStock = (p: Product) => {
    if (!p.available) return true;
    if (!p.stock) return false;
    return Object.values(p.stock).every((qty) => qty === 0);
  };

  // Live Counts per Tab
  const counts = {
    all: products.length,
    visible: products.filter((p) => p.available).length,
    hidden: products.filter((p) => !p.available).length,
    inStock: products.filter(checkInStock).length,
    outOfStock: products.filter(checkOutOfStock).length,
    featured: products.filter((p) => p.featured).length,
  };

  // Filter products by active tab & search query
  const filteredProducts = products.filter((p) => {
    // Tab filtering
    if (activeTab === "visible" && !p.available) return false;
    if (activeTab === "hidden" && p.available) return false;
    if (activeTab === "inStock" && !checkInStock(p)) return false;
    if (activeTab === "outOfStock" && !checkOutOfStock(p)) return false;
    if (activeTab === "featured" && !p.featured) return false;

    // Search query filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = productName(p, locale).toLowerCase();
      const nameEn = p.translations.en.name.toLowerCase();
      const nameAr = p.translations.ar.name.toLowerCase();
      const slug = p.slug.toLowerCase();

      return (
        name.includes(query) ||
        nameEn.includes(query) ||
        nameAr.includes(query) ||
        slug.includes(query)
      );
    }

    return true;
  });

  const tabs = [
    { key: "all" as FilterTab, labelKey: "admin.filterAll" as const, count: counts.all },
    { key: "visible" as FilterTab, labelKey: "admin.filterVisible" as const, count: counts.visible },
    { key: "hidden" as FilterTab, labelKey: "admin.filterHidden" as const, count: counts.hidden },
    { key: "inStock" as FilterTab, labelKey: "admin.filterInStock" as const, count: counts.inStock },
    { key: "outOfStock" as FilterTab, labelKey: "admin.filterOutOfStock" as const, count: counts.outOfStock },
    { key: "featured" as FilterTab, labelKey: "admin.filterFeatured" as const, count: counts.featured },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>{t("admin.products")}</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", margin: "0.2rem 0 0 0" }}>
            {isAr
              ? "إدارة كتالوج المنتجات، المقاسات المخزونة، وحالة العرض في المتجر."
              : "Manage product catalog, sizes stock, and storefront visibility."}
          </p>
        </div>
        <Button href="/admin/products/new" variant="primary" size="md">
          + {t("admin.addProduct")}
        </Button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                styles.tabBtn,
                activeTab === tab.key ? styles.tabActive : "",
              ].join(" ")}
            >
              {t(tab.labelKey)} ({tab.count})
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.searchPlaceholder")}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Products Table */}
      <ProductTable
        products={filteredProducts}
        onDelete={handleDeleteClick}
        onUpdateProduct={() => setProducts([...productService.getProducts()])}
      />

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
