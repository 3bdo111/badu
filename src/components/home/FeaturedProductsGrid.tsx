"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { productName } from "@/lib/types/product";
import type { Product } from "@/lib/types/product";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPriceDisplay } from "@/components/product/ProductPriceDisplay";
import styles from "./featured-products-grid.module.css";

interface FeaturedProductsGridProps {
  products: Product[];
  section?: StorefrontSectionRecord;
}

/**
 * Editorial product grid — real catalogue data only: names, prices,
 * currencies and photography all come from the product system. The optional
 * section subtitle may hold a number overriding the default grid size.
 */
export function FeaturedProductsGrid({ products, section }: FeaturedProductsGridProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const headingText =
    (isAr ? section?.titleAr : section?.titleEn) || (isAr ? "المجموعة" : "THE COLLECTION");
  const subtitleText = isAr ? section?.subtitleAr : section?.subtitleEn;

  const parsedCount = parseInt(subtitleText || "", 10);
  const count = Number.isFinite(parsedCount) && parsedCount > 0 ? Math.min(parsedCount, 12) : 4;
  // Admin-controlled landing grid: featured products first; fall back to the
  // whole available catalogue only when nothing is flagged as featured.
  const available = products.filter((p) => p.available);
  const featured = available.filter((p) => p.featured);
  const visibleProducts = (featured.length > 0 ? featured : available).slice(0, count);

  if (visibleProducts.length === 0) return null;

  return (
    <section aria-labelledby="collection-grid-heading" className={styles.gridSection}>
      <Container>
        <Reveal>
          <div className={styles.headerRow}>
            <div>
              <p className="label">
                {isAr ? "التشكيلة الكاملة" : "FULL COLLECTION"}
              </p>
              <Heading level={2} id="collection-grid-heading" className={styles.heading}>
                {headingText}
              </Heading>
            </div>
            <Link href="/store" className={styles.viewAllLink}>
              {isAr ? "عرض الكل ←" : "VIEW ALL →"}
            </Link>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {visibleProducts.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 70}>
              <Link
                href={`/products/${product.slug}`}
                className={styles.card}
                aria-label={productName(product, locale)}
              >
                <div className={styles.frame}>
                  {product.images[0] && (
                    <ProductImage
                      product={product}
                      image={product.images[0]}
                      sizes="(min-width: 64rem) 25vw, 50vw"
                    />
                  )}
                </div>
                <div className={styles.meta}>
                  <span className={styles.name}>{productName(product, locale)}</span>
                  <ProductPriceDisplay product={product} size="sm" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
