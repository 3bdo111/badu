"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { parseSectionBodyLines } from "@/lib/storefront/section-definitions";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import styles from "./faq.module.css";

interface FaqProps {
  section?: StorefrontSectionRecord;
}

export function Faq({ section }: FaqProps = {}) {
  const { t, dict, locale } = useI18n();

  const cmsRows = parseSectionBodyLines(locale === "ar" ? section?.bodyAr : section?.bodyEn);
  const cmsItems = cmsRows
    .map((cells) => ({ q: cells[0] || "", a: cells.slice(1).join(" | ") }))
    .filter((item) => item.q.length > 0 && item.a.length > 0);

  const items =
    cmsItems.length > 0 ? cmsItems : dict.sections.faq.items.map((item) => ({ q: item.q, a: item.a }));

  const labelText = (locale === "ar" ? section?.titleAr : section?.titleEn) || t("sections.faq.label");
  const headingText = (locale === "ar" ? section?.subtitleAr : section?.subtitleEn) || t("sections.faq.heading");

  return (
    <section id="faq" aria-labelledby="faq-heading" className={styles.faq}>
      <Container narrow>
        <Reveal>
          <p className="label">{labelText}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="faq-heading" className={styles.heading}>
            {headingText}
          </Heading>
        </Reveal>

        <Reveal delay={160}>
          <Accordion
            variant="editorial"
            className={styles.list}
            items={items.map((item) => ({
              title: item.q,
              content: item.a,
            }))}
          />
        </Reveal>
      </Container>
    </section>
  );
}
