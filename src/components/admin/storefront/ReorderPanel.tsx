"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { formatSectionLabel } from "./SectionSidebar";
import styles from "./storefront-manager.module.css";

interface ReorderPanelProps {
  sections: StorefrontSectionRecord[];
  onMove: (index: number, direction: "up" | "down") => void;
}

export function ReorderPanel({ sections, onMove }: ReorderPanelProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.formTitle}>{isAr ? "ترتيب أقسام الصفحة" : "Section Order"}</h2>
          <p className={styles.formSubtitle}>
            {isAr
              ? "استخدم الأسهم لتحديد ترتيب ظهور الأقسام في الصفحة الرئيسية."
              : "Use the arrows to set the order sections appear on the landing page."}
          </p>
        </div>
      </div>

      <div className={styles.orderList}>
        {sections.map((sec, index) => (
          <div key={sec.sectionKey} className={styles.orderItem}>
            <div className={styles.orderItemInfo}>
              <span className={styles.orderNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.orderName}>{formatSectionLabel(sec.sectionKey, isAr)}</span>
              {!sec.visible && (
                <span className={styles.hiddenTag}>{isAr ? "مخفي" : "Hidden"}</span>
              )}
            </div>
            <div className={styles.orderControls}>
              <button
                type="button"
                onClick={() => onMove(index, "up")}
                disabled={index === 0}
                className={styles.orderBtn}
                aria-label={isAr ? "تحريك لأعلى" : "Move up"}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, "down")}
                disabled={index === sections.length - 1}
                className={styles.orderBtn}
                aria-label={isAr ? "تحريك لأسفل" : "Move down"}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
