"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import { productService } from "@/lib/services/product-service";
import type { Product } from "@/lib/types/product";
import { productName, productDescription } from "@/lib/types/product";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./product-intro.module.css";

interface ProductIntroProps {
  section?: StorefrontSectionRecord;
}

export function ProductIntro({ section }: ProductIntroProps = {}) {
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<Product | undefined>(getFeaturedProduct);

  useEffect(() => {
    return productService.subscribe(() => {
      setProduct(getFeaturedProduct());
    });
  }, []);

  const cmsHeading = locale === "ar" ? section?.titleAr : section?.titleEn;
  const cmsBody = locale === "ar" ? section?.bodyAr : section?.bodyEn;

  const labelText = product ? productName(product, locale) : t("sections.intro.label");
  const headingText = cmsHeading || t("sections.intro.heading");
  const bodyText = cmsBody || (product ? productDescription(product, locale) : t("sections.intro.body"));

  return (
    <section aria-labelledby="intro-heading" className={styles.intro}>
      <Container narrow>
        <Reveal>
          <p className="label">{labelText}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="intro-heading" className={styles.heading}>
            {headingText}
          </Heading>
        </Reveal>
        <Reveal delay={160}>
          <p className={styles.body}>{bodyText}</p>
        </Reveal>
      </Container>
    </section>
  );
}
