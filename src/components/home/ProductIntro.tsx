"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { productName, productDescription } from "@/lib/types/product";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./product-intro.module.css";

export function ProductIntro() {
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<Product | undefined>(getFeaturedProduct);

  useEffect(() => {
    return productService.subscribe(() => {
      setProduct(getFeaturedProduct());
    });
  }, []);

  const labelText = product ? productName(product, locale) : t("sections.intro.label");
  const bodyText = product ? productDescription(product, locale) : t("sections.intro.body");

  return (
    <section aria-labelledby="intro-heading" className={styles.intro}>
      <Container narrow>
        <Reveal>
          <p className="label">{labelText}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="intro-heading" className={styles.heading}>
            {t("sections.intro.heading")}
          </Heading>
        </Reveal>
        <Reveal delay={160}>
          <p className={styles.body}>{bodyText}</p>
        </Reveal>
      </Container>
    </section>
  );
}
