"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./lifestyle-campaign.module.css";

interface LifestyleCampaignProps {
  section?: StorefrontSectionRecord;
}

/**
 * Immersive full-bleed lifestyle campaign banner. The imagery and copy come
 * from the CMS (section image / title / subtitle / CTA); when no image is
 * set we fall back to the story asset so the banner never renders broken.
 */
export function LifestyleCampaign({ section }: LifestyleCampaignProps = {}) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const title =
    (isAr ? section?.titleAr : section?.titleEn) ||
    (isAr ? "وُلِد من الصحراء" : "BORN OF THE DESERT");
  const subtitle =
    (isAr ? section?.subtitleAr : section?.subtitleEn) ||
    (isAr ? "بادو حوارٌ بين الأصالة والشارع." : "BADU is a conversation between heritage and the street.");
  const ctaLabel =
    (isAr ? section?.ctaLabelAr : section?.ctaLabelEn) ||
    (isAr ? "تسوّق المجموعة" : "SHOP THE COLLECTION");
  const ctaUrl = section?.ctaUrl || "/store";
  const imageUrl = section?.imageUrl || "/images/story.jpg";

  return (
    <section aria-labelledby="campaign-heading" className={styles.campaign}>
      <div className={styles.banner}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority={false}
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.overlay} />
        <Reveal className={styles.copyWrap}>
          <div className={styles.copy}>
            <p className={styles.label}>
              {isAr ? "٠٦ — الحملة" : "06 — THE CAMPAIGN"}
            </p>
            <h2 id="campaign-heading" className={styles.heading}>
              {title}
            </h2>
            <p className={styles.subtitle}>{subtitle}</p>
            <Button href={ctaUrl} size="lg" variant="inverse" className={styles.cta}>
              {ctaLabel}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
