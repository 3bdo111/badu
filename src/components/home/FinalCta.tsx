"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import { getFeaturedProduct } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "./final-cta.module.css";

export function FinalCta() {
  const { t, locale } = useI18n();
  const product = getFeaturedProduct();

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
                  <span className={styles.snippetTitle}>{product.translations[locale]?.name || product.translations.en.name}</span>
                  <span className={styles.snippetPrice}>{formatPrice(product.price, product.currency, locale)}</span>
                  <span className={styles.snippetBadge}>💵 {locale === "ar" ? "الدفع عند الاستلام متاح" : "Cash on Delivery Available"}</span>
                </div>
              </div>
            )}
            <Button href="#hoodie" size="lg" variant="inverse" className={styles.ctaButton}>
              {t("sections.finalCta.cta")}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
