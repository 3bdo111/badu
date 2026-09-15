"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./quick-trust-bar.module.css";

export function QuickTrustBar() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const trustItems = [
    {
      icon: "🧵",
      textAr: "قطن عضوي ثقيل 480GSM",
      textEn: "480GSM Organic Cotton Fleece",
    },
    {
      icon: "🚚",
      textAr: "شحن سريع خلال 2-4 أيام",
      textEn: "Express 2-4 Day Delivery",
    },
    {
      icon: "🔄",
      textAr: "استبدال وإرجاع مجاني 14 يومًا",
      textEn: "14-Day Free Returns & Exchange",
    },
    {
      icon: "💵",
      textAr: "الدفع عند الاستلام متاح (COD)",
      textEn: "Cash on Delivery Available",
    },
    {
      icon: "🔒",
      textAr: "ضمان الجودة والرضا التام",
      textEn: "100% Premium Quality Guarantee",
    },
  ];

  return (
    <section className={styles.trustBar} aria-label="Store guarantees">
      <Container>
        <Reveal>
          <div className={styles.grid}>
            {trustItems.map((item, idx) => (
              <div key={idx} className={styles.item}>
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                <span>{isAr ? item.textAr : item.textEn}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
