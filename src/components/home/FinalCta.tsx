"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPriceDisplay } from "@/components/product/ProductPriceDisplay";
import styles from "./final-cta.module.css";

interface FinalCtaProps {
  featuredProduct?: Product;
}

export function FinalCta({ featuredProduct }: FinalCtaProps) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const [product, setProduct] = useState<Product | undefined>(featuredProduct || getFeaturedProduct());

  useEffect(() => {
    if (!featuredProduct) {
      return productService.subscribe(() => {
        setProduct(getFeaturedProduct());
      });
    } else {
      setProduct(featuredProduct);
    }
  }, [featuredProduct]);

  return (
    <section aria-labelledby="final-cta-heading" className={styles.finalCta}>
      <Container>
        <Reveal>
          <div className={styles.inner}>
            <SunMark className={styles.sun} />
            <Heading level={2} display id="final-cta-heading" className={styles.heading}>
              {t("sections.finalCta.heading")}
            </Heading>

            {product && (
              <div className={styles.productSnippet}>
                <div className={styles.snippetImageFrame}>
                  {product.images[0] && (
                    <ProductImage product={product} image={product.images[0]} sizes="120px" />
                  )}
                </div>
                <div className={styles.snippetDetails}>
                  <span className={styles.snippetTitle}>
                    {product.translations[locale]?.name || product.translations.en.name}
                  </span>
                  <ProductPriceDisplay product={product} size="md" variant="inverse" />
                  <span className={styles.snippetBadge}>
                    💵 {isAr ? "الدفع عند الاستلام متاح" : "Cash on Delivery Supported"}
                  </span>
                </div>
              </div>
            )}

            <Button href="#hoodie" size="lg" variant="inverse" className={styles.ctaButton}>
              {t("sections.finalCta.cta")}
            </Button>

            <div className={styles.trustBadgesGrid}>
              <div className={styles.trustBadgeItem}>
                <span className={styles.badgeIcon}>🔒</span>
                <span>{isAr ? "دفع آمن 100%" : "100% Secure Checkout"}</span>
              </div>
              <div className={styles.trustBadgeItem}>
                <span className={styles.badgeIcon}>💵</span>
                <span>{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
              </div>
              <div className={styles.trustBadgeItem}>
                <span className={styles.badgeIcon}>🚚</span>
                <span>{isAr ? "شحن 2-4 أيام عمل" : "Express 2-4 Day Delivery"}</span>
              </div>
              <div className={styles.trustBadgeItem}>
                <span className={styles.badgeIcon}>🔄</span>
                <span>{isAr ? "إرجاع مجاني خلال 14 يوم" : "14-Day Free Returns"}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}


