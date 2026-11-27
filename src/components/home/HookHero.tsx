"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { useScrollDrift } from "@/components/ui/useScrollDrift";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types/product";
import styles from "./hook-hero.module.css";

interface HookHeroProps {
  featuredProduct?: Product;
  /** Cheapest visible product price, used for the "from" line. */
  fromPrice?: number;
}

/**
 * Above-the-fold hook: oversized editorial headline on the left, full-bleed
 * campaign portrait on the right. Three short lines carry the hook; the
 * product price and the two entry actions sit underneath.
 */
export function HookHero({ featuredProduct, fromPrice }: HookHeroProps) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  // The garment drifts with the page: a small lift, a fraction of a degree
  // of tilt and a gentle settle. Skipped under reduced motion.
  const heroImageRef = useRef<HTMLDivElement>(null);
  useScrollDrift(heroImageRef, { travel: 30, tilt: 1.1, zoom: 0.05 });

  // The craft section lives on the product page now, so the secondary CTA has
  // to cross pages: on the home page the "#details" anchor does not exist.
  const craftHref = featuredProduct
    ? `/products/${featuredProduct.slug}#details`
    : "/store";

  const priceValue =
    typeof fromPrice === "number" ? fromPrice : featuredProduct?.price;
  const price =
    typeof priceValue === "number" && featuredProduct
      ? formatPrice(priceValue, featuredProduct.currency, locale)
      : null;

  return (
    <section className={styles.hero} aria-labelledby="hook-title">
      <div className={styles.grid}>
        <div className={styles.copyCol}>
          <Container className={styles.copyInner}>
            <p className={styles.eyebrow}>{t("hook.eyebrow")}</p>

            <h1 id="hook-title" className={styles.title}>
              <span>{t("hook.line1")}</span>
              <span>{t("hook.line2")}</span>
              <span className={styles.outline}>{t("hook.line3")}</span>
            </h1>

            <p className={styles.sub}>{t("hook.sub")}</p>

            <div className={styles.ctaRow}>
              <Link href="/store" className={styles.primaryCta}>
                {t("hook.primaryCta")}
              </Link>
              <Link href={craftHref} className={styles.secondaryCta}>
                {t("hook.secondaryCta")}
              </Link>
            </div>

            {price && (
              <p className={styles.priceLine}>
                <span className={styles.priceLabel}>{t("hook.priceLabel")}</span>
                <span className={styles.priceValue}>{price}</span>
                <span className={styles.priceNote}>
                  {isAr ? "دفع عند الاستلام" : "CASH ON DELIVERY"}
                </span>
              </p>
            )}
          </Container>
        </div>

        <figure className={styles.figure}>
          <div ref={heroImageRef} className={styles.imageWrap}>
            <Image
              src="/images/campaign/2026/boy-black-desert.jpg"
              alt={
                isAr
                  ? "موديل لابسة هودي بادو أزرق بقصة واسعة"
                  : "Model wearing the BADU oversized hoodie in slate blue"
              }
              fill
              priority
              sizes="(max-width: 64rem) 100vw, 50vw"
              className={styles.image}
            />
          </div>
          <figcaption className={styles.caption}>
            <span>{t("hook.caption")}</span>
            <span className={styles.captionIndex}>01</span>
          </figcaption>
        </figure>
      </div>

      <div className={styles.scrollRow}>
        <span className={styles.scrollHint}>{t("hook.scroll")}</span>
        <span className={styles.scrollRule} aria-hidden="true" />
      </div>
    </section>
  );
}
