"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { parseSectionBodyLines } from "@/lib/storefront/section-definitions";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Icon, iconFromEmoji, type IconName } from "@/components/ui/Icon";
import styles from "./quick-trust-bar.module.css";

interface QuickTrustBarProps {
  section?: StorefrontSectionRecord;
}

const DEFAULT_TRUST_ITEMS: Array<{ icon: IconName; textAr: string; textEn: string }> = [
  { icon: "fabric", textAr: "قطن عضوي تقيل 350 جرام", textEn: "350GSM Organic Cotton Fleece" },
  { icon: "truck", textAr: "الشحن في 2-4 أيام", textEn: "Express 2-4 Day Delivery" },
  { icon: "return", textAr: "استبدال واسترجاع مجاني 14 يوم", textEn: "14-Day Free Returns & Exchange" },
  { icon: "cash", textAr: "الدفع عند الاستلام متاح", textEn: "Cash on Delivery Available" },
  { icon: "shield", textAr: "ضمان الجودة", textEn: "100% Premium Quality Guarantee" },
];

export function QuickTrustBar({ section }: QuickTrustBarProps = {}) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  // Admin-managed items (one per line: "icon | text"); fall back to defaults.
  const cmsRows = parseSectionBodyLines(isAr ? section?.bodyAr : section?.bodyEn);
  const trustItems =
    cmsRows.length > 0
      ? cmsRows.map((cells) => ({
          icon: iconFromEmoji(cells[0]),
          text: cells[1] || "",
        }))
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
                {item.icon && (
                  <span className={styles.icon} aria-hidden="true">
                    <Icon name={item.icon} />
                  </span>
                )}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
