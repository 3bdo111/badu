"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import { colorSelectionStore } from "@/lib/services/color-selection";
import type { Product } from "@/lib/types/product";
import { colorKeyFromName } from "@/lib/types/product";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "./product-showcase.module.css";

interface ProductShowcaseProps {
  product?: Product;
  section?: StorefrontSectionRecord;
}

/**
 * Editorial front/back composition — the photography dominates,
 * no cards, no floating UI over the photos.
 */
export function ProductShowcase({ product: initialProduct, section }: ProductShowcaseProps = {}) {
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<Product | undefined>(initialProduct || getFeaturedProduct());

  useEffect(() => {
    if (!initialProduct) {
      return productService.subscribe(() => {
        setProduct(getFeaturedProduct());
      });
    }
  }, [initialProduct]);

  // Follow the color selected in the purchase section.
  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(
    colorSelectionStore.get()
  );
  useEffect(
    () => colorSelectionStore.subscribe(() => setSelectedColorKey(colorSelectionStore.get())),
    []
  );

  if (!product) return null;

  const labelText = (locale === "ar" ? section?.titleAr : section?.titleEn) || t("sections.showcase.label");

  const labels = [
    t("sections.showcase.frontLabel"),
    t("sections.showcase.backLabel"),
    t("sections.showcase.detail1Label"),
    t("sections.showcase.detail2Label"),
  ];

  // Color-tagged gallery: show only the images matching the selected color
  // (plus untagged ones). Falls back to everything when no tag applies.
  const hasColorTaggedImages = product.images.some((img) => img.colorKey);
  const fallbackKey = colorKeyFromName(product.colors[0]?.name?.en || "");
  const activeKey = selectedColorKey || fallbackKey;
  const visibleImages = hasColorTaggedImages
    ? product.images.filter((img) => !img.colorKey || img.colorKey === activeKey)
    : product.images;
  const displayImages =
    visibleImages.length > 0 ? visibleImages : product.images;

  return (
    <section aria-label={t("sections.showcase.label")} className={styles.showcase}>
      <Container>
        <Reveal>
          <p className={["label", styles.label].join(" ")}>
            {labelText}
          </p>
        </Reveal>
        <div className={styles.grid}>
          {displayImages.map((image, index) => (
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
