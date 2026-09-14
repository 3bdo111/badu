"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { getFeaturedProduct } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./size-guide.module.css";

/**
 * Size guide.
 *
 * TODO: real measurements are not available yet — cells render "—".
 * Replace the placeholder values below once chest/length/sleeve
 * measurements are confirmed, ideally sourced from product data.
 */
const SIZE_MEASUREMENTS = [
  { size: "S", chest: "58 cm / 22.8\"", length: "68 cm / 26.8\"", sleeve: "61 cm / 24.0\"" },
  { size: "M", chest: "61 cm / 24.0\"", length: "71 cm / 28.0\"", sleeve: "63 cm / 24.8\"" },
  { size: "L", chest: "64 cm / 25.2\"", length: "74 cm / 29.1\"", sleeve: "65 cm / 25.6\"" },
  { size: "XL", chest: "67 cm / 26.4\"", length: "77 cm / 30.3\"", sleeve: "67 cm / 26.4\"" },
];

export function SizeGuide() {
  const { t } = useI18n();

  return (
    <section id="size" aria-labelledby="size-guide-heading" className={styles.sizeGuide}>
      <Container narrow>
        <Reveal>
          <p className="label">{t("sections.sizeGuide.label")}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="size-guide-heading" className={styles.heading}>
            {t("sections.sizeGuide.heading")}
          </Heading>
        </Reveal>

        <Reveal delay={160}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                {t("sections.sizeGuide.label")} — {t("sections.sizeGuide.note")}
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
                {SIZE_MEASUREMENTS.map((m) => (
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
