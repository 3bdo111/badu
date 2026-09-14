"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import { ProductImage } from "@/components/product/ProductImage";
import styles from "./brand-story.module.css";

interface BrandStoryProps {
  section?: StorefrontSectionRecord;
}

export function BrandStory({ section }: BrandStoryProps) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const product = getFeaturedProduct();

  if (!product) return null;

  const primaryDetailImg = product.images[2] ?? product.images[0];
  const secondaryDetailImg = product.images[3] ?? product.images[1];

  const title = section ? (isAr ? section.titleAr : section.titleEn) : t("sections.story.heading");
  const body = section ? (isAr ? section.bodyAr : section.bodyEn) : t("sections.story.body");

  return (
    <section id="story" aria-labelledby="story-heading" className={styles.story}>
      <Container>
        <div className={styles.grid}>
          {/* Left / Copy Column */}
          <div className={styles.contentColumn}>
            <Reveal>
              <div className={styles.eyebrowGroup}>
                <SunMark className={styles.sunMark} />
                <span className={styles.sectionIndex}>04</span>
                <span className={styles.dotSeparator} aria-hidden="true">•</span>
                <p className={styles.label}>{t("sections.story.label")}</p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <Heading level={2} id="story-heading" className={styles.heading}>
                {title}
              </Heading>
            </Reveal>

            <Reveal delay={160}>
              <p className={styles.body}>{body}</p>
            </Reveal>

            <Reveal delay={240}>
              <div className={styles.philosophyBlock}>
                <div className={styles.dividerLine} aria-hidden="true" />
                <h3 className={styles.philosophyHeading}>
                  {t("sections.story.philosophyHeading")}
                </h3>
                <p className={styles.philosophyBody}>
                  {t("sections.story.philosophyBody")}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right / Asymmetrical Visual Composition */}
          <div className={styles.visualColumn}>
            <Reveal delay={140}>
              <div className={styles.visualComposition}>
                <div className={styles.mainFrame}>
                  {section?.imageUrl ? (
                    <Image
                      src={section.imageUrl}
                      alt={title}
                      fill
                      sizes="(min-width: 64rem) 42vw, 100vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <ProductImage
                      product={product}
                      image={primaryDetailImg}
                      sizes="(min-width: 64rem) 42vw, 100vw"
                    />
                  )}
                  <div className={styles.frameGradient} />
                </div>

                {secondaryDetailImg && (
                  <div className={styles.floatingFrame}>
                    <ProductImage
                      product={product}
                      image={secondaryDetailImg}
                      sizes="(min-width: 64rem) 18vw, 40vw"
                    />
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
