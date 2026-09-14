"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./craft-features.module.css";

interface CraftFeaturesProps {
  section?: StorefrontSectionRecord;
}

/**
 * Product qualities — numbered editorial feature rows.
 * Qualitative copy only: no invented GSM, blends or origins.
 */
export function CraftFeatures({ section }: CraftFeaturesProps = {}) {
  const { t, dict, locale } = useI18n();
  const isAr = locale === "ar";

  const headingText = section
    ? (isAr ? section.titleAr || t("sections.craft.heading") : section.titleEn || t("sections.craft.heading"))
    : t("sections.craft.heading");

  return (
    <section
      id="details"
      aria-labelledby="craft-heading"
      className={styles.craft}
    >
      <Container>
        <Reveal>
          <p className="label">{t("sections.craft.label")}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="craft-heading" className={styles.heading}>
            {headingText}
          </Heading>
        </Reveal>

        <div className={styles.features}>
          {(dict.sections.craft?.features ?? []).map((feature, index) => (
            <Reveal key={feature.title} delay={index * 80}>
              <div className={styles.feature}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.featureBody}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureText}>{feature.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
