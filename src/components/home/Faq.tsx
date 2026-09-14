"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import styles from "./faq.module.css";

export function Faq() {
  const { t, dict } = useI18n();

  return (
    <section id="faq" aria-labelledby="faq-heading" className={styles.faq}>
      <Container narrow>
        <Reveal>
          <p className="label">{t("sections.faq.label")}</p>
        </Reveal>
        <Reveal delay={80}>
          <Heading level={2} id="faq-heading" className={styles.heading}>
            {t("sections.faq.heading")}
          </Heading>
        </Reveal>

        <Reveal delay={160}>
          <Accordion
            variant="editorial"
            className={styles.list}
            items={dict.sections.faq.items.map((item) => ({
              title: item.q,
              content: item.a,
            }))}
          />
        </Reveal>
      </Container>
    </section>
  );
}
