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
import styles from "./artwork-story.module.css";

interface ArtworkStoryProps {
  section?: StorefrontSectionRecord;
}

/**
 * Dedicated Artwork Section — statement typography beside the back embroidery
 * with scene elements breakdown (Sun, Mountains, Camel, Traveler, Birds).
 */
export function ArtworkStory({ section }: ArtworkStoryProps = {}) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const product = getFeaturedProduct();

  if (!product) return null;

  const backImage = product.images[1] ?? product.images[3] ?? product.images[0];
  const macroImage = product.images[3] ?? product.images[2];

  const statement = section
    ? (isAr ? section.titleAr || t("sections.artwork.statement") : section.titleEn || t("sections.artwork.statement"))
    : t("sections.artwork.statement");

  const body = section
    ? (isAr ? section.bodyAr || t("sections.artwork.body") : section.bodyEn || t("sections.artwork.body"))
    : t("sections.artwork.body");

  const sceneItems = [
    t("sections.artwork.scene.sun"),
    t("sections.artwork.scene.mountains"),
    t("sections.artwork.scene.camel"),
    t("sections.artwork.scene.traveler"),
    t("sections.artwork.scene.birds"),
  ];

  return (
    <section aria-labelledby="artwork-heading" className={styles.artwork}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Reveal>
              <div className={styles.headingRow}>
                <SunMark className={styles.sun} />
                <p className="label">{t("sections.artwork.label")}</p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <Heading level={2} id="artwork-heading" className={styles.statement}>
                {statement}
              </Heading>
            </Reveal>

            <Reveal delay={160}>
              <p className={styles.body}>{body}</p>
            </Reveal>

            <Reveal delay={240}>
              <div className={styles.sceneGroup}>
                <div className={styles.scenePills}>
                  {sceneItems.map((item) => (
                    <span key={item} className={styles.pill}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <figure className={styles.figure}>
              <div className={styles.frame}>
                <ProductImage
                  product={product}
                  image={backImage}
                  sizes="(min-width: 64rem) 44vw, 100vw"
                />
              </div>
              <figcaption className={styles.caption}>
                {t("sections.artwork.caption")}
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {(macroImage || section?.imageUrl) && (
          <Reveal delay={280} className={styles.macroBanner}>
            <div className={styles.macroFrame}>
              {macroImage ? (
                <ProductImage
                  product={product}
                  image={macroImage}
                  sizes="100vw"
                />
              ) : (
                <Image
                  src={section!.imageUrl}
                  alt={statement}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className={styles.macroOverlay}>
                <p className={styles.macroText}>
                  {product.translations[locale].artwork}
                </p>
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
