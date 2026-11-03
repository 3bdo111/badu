"use client";

import { useEffect, useRef } from "react";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { getSectionDefinition } from "@/lib/storefront/section-definitions";
import type { EditorLocale } from "./types";
import { isSectionDirty } from "./types";
import styles from "./visual-editor.module.css";

interface SectionListPanelProps {
  sections: StorefrontSectionRecord[];
  activeKey: string;
  locale: EditorLocale;
  onSelect: (sectionKey: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onToggleVisible: (sectionKey: string) => void;
}

export function formatSectionLabel(key: string, locale: EditorLocale): string {
  const def = getSectionDefinition(key);
  if (!def) return key.toUpperCase();
  return locale === "ar" ? def.labelAr : def.labelEn;
}

export function SectionListPanel({
  sections,
  activeKey,
  locale,
  onSelect,
  onMove,
  onToggleVisible,
}: SectionListPanelProps) {
  const isAr = locale === "ar";
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());

  // Keep the active card visible inside the list when selection changes
  // from the canvas or programmatically.
  useEffect(() => {
    cardRefs.current.get(activeKey)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeKey]);

  return (
    <div className={styles.sidebarSection}>
      <div className={styles.sectionHeaderRow}>
        <h2 className={styles.sectionTitle}>
          {isAr ? "أقسام الصفحة" : "Page Sections"}
        </h2>
        <span className={styles.sectionCount}>
          {sections.filter((s) => s.visible).length}/{sections.length}
        </span>
      </div>

      <div className={styles.sectionsList} ref={listRef} role="listbox" aria-label={isAr ? "أقسام الصفحة" : "Page sections"}>
        {sections.map((sec, index) => {
          const isActive = activeKey === sec.sectionKey;
          const dirty = isSectionDirty(sec);
          return (
            <div
              key={sec.sectionKey}
              className={`${styles.sectionCard} ${isActive ? styles.sectionCardActive : ""} ${!sec.visible ? styles.sectionCardHidden : ""}`}
            >
              <button
                type="button"
                ref={(el) => {
                  if (el) cardRefs.current.set(sec.sectionKey, el);
                  else cardRefs.current.delete(sec.sectionKey);
                }}
                onClick={() => onSelect(sec.sectionKey)}
                className={styles.sectionCardMain}
                role="option"
                aria-selected={isActive}
              >
                <span className={styles.sectionOrder}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.sectionCardName}>
                  {formatSectionLabel(sec.sectionKey, locale)}
                </span>
                <span
                  className={`${styles.statusDot} ${dirty ? styles.statusDotDirty : styles.statusDotClean}`}
                  title={
                    dirty
                      ? isAr
                        ? "تغييرات غير منشورة"
                        : "Unpublished changes"
                      : isAr
                        ? "منشور"
                        : "Published"
                  }
                />
              </button>

              <div className={styles.sectionControls}>
                <button
                  type="button"
                  onClick={() => onToggleVisible(sec.sectionKey)}
                  className={styles.iconBtn}
                  aria-label={sec.visible ? (isAr ? "إخفاء القسم" : "Hide section") : isAr ? "إظهار القسم" : "Show section"}
                  title={sec.visible ? (isAr ? "إخفاء" : "Hide") : isAr ? "إظهار" : "Show"}
                >
                  {sec.visible ? "👁" : "🚫"}
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, "up")}
                  disabled={index === 0}
                  className={styles.iconBtn}
                  aria-label={isAr ? "تحريك لأعلى" : "Move up"}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, "down")}
                  disabled={index === sections.length - 1}
                  className={styles.iconBtn}
                  aria-label={isAr ? "تحريك لأسفل" : "Move down"}
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.listHint}>
        {isAr
          ? "انقر قسماً للتعديل، واستخدم العين لإظهاره أو إخفائه."
          : "Click a section to edit it; use the eye to show or hide it."}
      </p>
    </div>
  );
}
