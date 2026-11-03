"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { parseSectionBodyLines } from "@/lib/storefront/section-definitions";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./quick-trust-bar.module.css";

interface QuickTrustBarProps {
  section?: StorefrontSectionRecord;
}

const DEFAULT_TRUST_ITEMS = [
  { icon: "🧵", textAr: "قطن عضوي ثقيل 480GSM", textEn: "480GSM Organic Cotton Fleece" },
  { icon: "🚚", textAr: "شحن سريع خلال 2-4 أيام", textEn: "Express 2-4 Day Delivery" },
  { icon: "🔄", textAr: "استبدال وإرجاع مجاني 14 يومًا", textEn: "14-Day Free Returns & Exchange" },
  { icon: "💵", textAr: "الدفع عند الاستلام متاح (COD)", textEn: "Cash on Delivery Available" },
  { icon: "🔒", textAr: "ضمان الجودة والرضا التام", textEn: "100% Premium Quality Guarantee" },
];

export function QuickTrustBar({ section }: QuickTrustBarProps = {}) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  // Admin-managed items (one per line: "icon | text"); fall back to defaults.
  const cmsRows = parseSectionBodyLines(isAr ? section?.bodyAr : section?.bodyEn);
  const trustItems =
    cmsRows.length > 0
      ? cmsRows.map((cells) => ({ icon: cells[0] || "•", text: cells[1] || "" }))
      : DEFAULT_TRUST_ITEMS.map((item) => ({
          icon: item.icon,
          text: isAr ? item.textAr : item.textEn,
        }));

  const ariaLabel =
    (isAr ? section?.titleAr : section?.titleEn) ||
    (isAr ? "ضمانات المتجر" : "Store guarantees");

  return (
    <section className={styles.trustBar} aria-label={ariaLabel}>
      <Container>
        <Reveal>
          <div className={styles.grid}>
            {trustItems.map((item, idx) => (
              <div key={`${item.text}-${idx}`} className={styles.item}>
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
