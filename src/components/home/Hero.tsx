"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPriceDisplay } from "@/components/product/ProductPriceDisplay";
import styles from "./hero.module.css";

interface HeroProps {
  section?: StorefrontSectionRecord;
  featuredProduct?: Product;
}

export function Hero({ section, featuredProduct }: HeroProps) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const [product, setProduct] = useState<Product | undefined>(featuredProduct || getFeaturedProduct());

  useEffect(() => {
    if (!featuredProduct) {
      return productService.subscribe(() => {
        setProduct(getFeaturedProduct());
      });
    }
  }, [featuredProduct]);

  const title = section ? (isAr ? section.titleAr : section.titleEn) : t("hero.title");
  const subtitle = section ? (isAr ? section.subtitleAr : section.subtitleEn) : t("hero.subtitle");
  const ctaLabel = section
    ? isAr
      ? section.ctaLabelAr || t("hero.cta")
      : section.ctaLabelEn || t("hero.cta")
    : t("hero.cta");
  const ctaUrl = section?.ctaUrl || "#hoodie";

  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <Container>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Reveal>
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} />
                <span className={styles.badgeText}>{t("hero.eyebrow")}</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <Heading
                level={1}
                display
                id="hero-title"
                className={styles.title}
              >
                {title}
              </Heading>
            </Reveal>
            <Reveal delay={160}>
              <p className={styles.subtitle}>{subtitle}</p>
            </Reveal>

            {product && (
              <Reveal delay={200}>
                <div className={styles.productSpotlight}>
                  <div className={styles.spotlightHeader}>
                    <span className={styles.productName}>{product.translations[locale]?.name || product.translations.en.name}</span>
                    <ProductPriceDisplay product={product} size="md" />
                  </div>
                  <div className={styles.highlightPills}>
                    <span className={styles.pill}>480GSM Organic Cotton</span>
                    <span className={styles.pill}>Heavyweight Embroidery</span>
                    <span className={styles.pill}>Relaxed Fit</span>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={240}>
              <div className={styles.ctaRow}>
                <Button href={ctaUrl} size="lg" className={styles.primaryCta}>
                  {ctaLabel}
                </Button>
                <Button href="#story" size="lg" variant="ghost">
                  {t("hero.secondaryCta")}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div className={styles.heroTrustRow}>
                <span>💵 {locale === "ar" ? "الدفع عند الاستلام متاح" : "Cash on Delivery Available"}</span>
                <span>•</span>
                <span>🚚 {locale === "ar" ? "شحن سريع" : "Express Shipping"}</span>
              </div>
            </Reveal>
          </div>

          {product && product.images[0] && (
            <Reveal delay={120} className={styles.visual}>
              <figure className={styles.figure}>
                <div className={styles.frame}>
                  <ProductImage
                    product={product}
                    image={product.images[0]}
                    priority
                    sizes="(min-width: 64rem) 46vw, 100vw"
                  />
                  <div className={styles.priceBadgeOverlay}>
                    <ProductPriceDisplay product={product} size="sm" showBadge={false} />
                  </div>
                </div>
                <span className={styles.index} aria-hidden="true">
                  {t("hero.index")}
                </span>
              </figure>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
