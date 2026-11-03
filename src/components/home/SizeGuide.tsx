"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { parseSectionBodyLines } from "@/lib/storefront/section-definitions";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./size-guide.module.css";

interface SizeGuideProps {
  section?: StorefrontSectionRecord;
}

/**
 * Size guide.
 *
 * The measurement table can be overridden from the CMS (one row per line:
 * "Size | Chest | Length | Sleeve"). Until real measurements are confirmed,
 * the built-in rows below are used as the fallback.
 */
const SIZE_MEASUREMENTS = [
  { size: "S", chest: "58 cm / 22.8\"", length: "68 cm / 26.8\"", sleeve: "61 cm / 24.0\"" },
  { size: "M", chest: "61 cm / 24.0\"", length: "71 cm / 28.0\"", sleeve: "63 cm / 24.8\"" },
  { size: "L", chest: "64 cm / 25.2\"", length: "74 cm / 29.1\"", sleeve: "65 cm / 25.6\"" },
  { size: "XL", chest: "67 cm / 26.4\"", length: "77 cm / 30.3\"", sleeve: "67 cm / 26.4\"" },
];

export function SizeGuide({ section }: SizeGuideProps = {}) {
  const { t, locale } = useI18n();

  const cmsRows = parseSectionBodyLines(locale === "ar" ? section?.bodyAr : section?.bodyEn);
  const measurements =
    cmsRows.length > 0
      ? cmsRows.map((cells) => ({
          size: cells[0] || "—",
          chest: cells[1] || "—",
          length: cells[2] || "—",
          sleeve: cells[3] || "—",
        }))
      : SIZE_MEASUREMENTS;

  const labelText = (locale === "ar" ? section?.titleAr : section?.titleEn) || t("sections.sizeGuide.label");
  const headingText = (locale === "ar" ? section?.subtitleAr : section?.subtitleEn) || t("sections.sizeGuide.heading");

  return (
    <section id="size" aria-labelledby="size-guide-heading" className={styles.sizeGuide}>
      <Container narrow>
        <Reveal>
          <p className="label">{labelText}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="size-guide-heading" className={styles.heading}>
            {headingText}
          </Heading>
        </Reveal>

        <Reveal delay={160}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                {labelText} — {t("sections.sizeGuide.note")}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t("sections.sizeGuide.columns.size")}</th>
                  <th scope="col">{t("sections.sizeGuide.columns.chest")}</th>
                  <th scope="col">{t("sections.sizeGuide.columns.length")}</th>
                  <th scope="col">{t("sections.sizeGuide.columns.sleeve")}</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.size}>
                    <th scope="row">{m.size}</th>
                    <td>{m.chest}</td>
                    <td>{m.length}</td>
                    <td>{m.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.adviceCard}>
            <span className={styles.adviceBadge}>FIT ADVICE</span>
            <p className={styles.fitNote}>{t("sections.sizeGuide.fitNote")}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
