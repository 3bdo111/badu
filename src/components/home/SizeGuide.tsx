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
const PLACEHOLDER = "—";

export function SizeGuide() {
  const { t } = useI18n();
  const product = getFeaturedProduct();
  const sizes = product?.sizes ?? [];

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
                {sizes.map((size) => (
                  <tr key={size}>
                    <th scope="row">{size}</th>
                    <td>{PLACEHOLDER}</td>
                    <td>{PLACEHOLDER}</td>
                    <td>{PLACEHOLDER}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.fitNote}>{t("sections.sizeGuide.fitNote")}</p>
          <p className={styles.note}>{t("sections.sizeGuide.note")}</p>
        </Reveal>
      </Container>
    </section>
  );
}
