"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { getVisibleProductBySlug } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { productName } from "@/lib/types/product";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { CraftFeatures } from "@/components/home/CraftFeatures";
import { SizeGuide } from "@/components/home/SizeGuide";
import { Faq } from "@/components/home/Faq";
import { PurchaseSection } from "@/components/home/PurchaseSection";
import { Container } from "@/components/ui/Container";
import { track } from "@/lib/analytics/track";

export function ProductDetailClient({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: Product;
}) {
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<Product | undefined>(
    () => initialProduct ?? getVisibleProductBySlug(slug)
  );
  const [loaded] = useState(true);

  useEffect(() => {
    if (!product) return;
    track("ViewContent", {
      content_ids: [product.slug],
      content_name: productName(product, "en"),
      content_type: "product",
      value: product.price,
      currency: product.currency,
    });
  }, [product]);

  useEffect(() => {
    return productService.subscribe(() => {
      const updated = getVisibleProductBySlug(slug);
      setProduct(updated);
    });
  }, [slug]);

  if (!loaded) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-muted)" }}>...</p>
      </div>
    );
  }

  if (!product || !product.available) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1rem" }}>
        <Container narrow>
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              border: "1px dashed var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-background)",
            }}
          >
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "1rem" }}>
              {t("cart.unavailableItem")}
            </h1>
            <p style={{ color: "var(--color-muted)", marginBottom: "2rem" }}>
              {locale === "ar"
                ? "يمكن المنتج ده اتشال أو اتخفي من المتجر."
                : "This product may have been hidden or removed from the storefront."}
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                backgroundColor: "var(--color-foreground)",
                color: "var(--color-background)",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                letterSpacing: "var(--tracking-label)",
              }}
            >
              {t("cart.continueShopping")}
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "1.25rem" }}>
      <Container>
        <nav aria-label="Breadcrumb" style={{ marginBottom: "0.5rem" }}>
          <p className="label" style={{ marginBottom: 0 }}>
            <Link href="/" style={{ textDecoration: "none", color: "var(--color-muted)" }}>
              ← {t("nav.home")}
            </Link>
            {" / "}
            <span>{productName(product, locale)}</span>
          </p>
        </nav>
      </Container>
      {/* Buy first: the gallery + purchase panel is the product hero. */}
      <PurchaseSection featuredProduct={product} />
      <ProductShowcase product={product} />
      <CraftFeatures />
      <SizeGuide />
      <Faq />
    </div>
  );
}
