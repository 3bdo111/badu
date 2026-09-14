"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "./product-showcase.module.css";

interface ProductShowcaseProps {
  product?: Product;
}

/**
 * Editorial front/back composition — the photography dominates,
 * no cards, no floating UI over the photos.
 */
export function ProductShowcase({ product: initialProduct }: ProductShowcaseProps = {}) {
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<Product | undefined>(initialProduct || getFeaturedProduct());

  useEffect(() => {
    if (!initialProduct) {
      return productService.subscribe(() => {
        setProduct(getFeaturedProduct());
      });
    }
  }, [initialProduct]);

  if (!product) return null;

  const labels = [
    t("sections.showcase.frontLabel"),
    t("sections.showcase.backLabel"),
    t("sections.showcase.detail1Label"),
    t("sections.showcase.detail2Label"),
  ];

  return (
    <section aria-label={t("sections.showcase.label")} className={styles.showcase}>
      <Container>
        <Reveal>
          <p className={["label", styles.label].join(" ")}>
            {t("sections.showcase.label")}
          </p>
        </Reveal>
        <div className={styles.grid}>
          {product.images.map((image, index) => (
            <Reveal key={image.src} delay={(index + 1) * 80}>
              <figure className={styles.figure}>
                <div className={styles.frame}>
                  <ProductImage
                    product={product}
                    image={image}
                    sizes="(min-width: 64rem) 46vw, 100vw"
                  />
                </div>
                <figcaption className={styles.caption}>
                  {labels[index] || image.alt[locale] || image.alt.en}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
