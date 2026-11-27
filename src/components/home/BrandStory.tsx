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

  const secondaryDetailImg = product.images[3] ?? product.images[1];

  /**
   * Brand-partner photo for the story frame (plain concrete wall with the
   * BADU statement). The CMS still points at the old street-pair shot, so
   * that legacy value is treated as unset and falls back to this asset.
   * Any other CMS image keeps working as an override.
   */
  const STORY_IMAGE = "/images/story-badu-wall.jpg";
  const LEGACY_STORY_IMAGE_MARKERS = ["/images/story.jpg", "story-street-pair"];
  const cmsStoryImage = section?.imageUrl ?? "";
  const storyImage =
    cmsStoryImage && !LEGACY_STORY_IMAGE_MARKERS.some((marker) => cmsStoryImage.includes(marker))
      ? cmsStoryImage
      : STORY_IMAGE;

  const title = section
    ? (isAr ? section.titleAr || t("sections.story.heading") : section.titleEn || t("sections.story.heading"))
    : t("sections.story.heading");
  const body = section
    ? (isAr ? section.bodyAr || t("sections.story.body") : section.bodyEn || t("sections.story.body"))
    : t("sections.story.body");

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
                  <Image
                    src={storyImage}
                    alt={title}
                    fill
                    sizes="(min-width: 64rem) 42vw, 100vw"
                    style={{ objectFit: "cover" }}
                  />
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
