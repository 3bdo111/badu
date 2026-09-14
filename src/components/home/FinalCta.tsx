"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SunMark } from "@/components/ui/SunMark";
import styles from "./final-cta.module.css";

export function FinalCta() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="final-cta-heading" className={styles.finalCta}>
      <Container>
        <Reveal>
          <div className={styles.inner}>
            <SunMark className={styles.sun} />
            <Heading level={2} display id="final-cta-heading" className={styles.heading}>
              {t("sections.finalCta.heading")}
            </Heading>
            <Button href="#hoodie" size="lg" variant="inverse">
              {t("sections.finalCta.cta")}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
