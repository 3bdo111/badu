"use client";

import { useI18n } from "@/i18n/I18nProvider";
import styles from "./marquee.module.css";

/** Full-bleed ticker of brand facts — the seam between hero and product. */
export function Marquee() {
  const { t } = useI18n();
  const items = t("hook.marquee").split("·").map((s) => s.trim()).filter(Boolean);
  const row = [...items, ...items, ...items];

  return (
    <div className={styles.band} aria-hidden="true">
      <div className={styles.track}>
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className={styles.item}>
            {item}
            <span className={styles.dot}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
