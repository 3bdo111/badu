"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { getSectionDefinition } from "@/lib/storefront/section-definitions";
import { isDirty } from "./types";
import styles from "./storefront-manager.module.css";

interface SectionSidebarProps {
  sections: StorefrontSectionRecord[];
  activeKey: string;
  mode: "edit" | "reorder";
  onSelect: (sectionKey: string) => void;
  onModeChange: (mode: "edit" | "reorder") => void;
}

export function formatSectionLabel(key: string, isAr: boolean): string {
  const def = getSectionDefinition(key);
  if (!def) return key.toUpperCase();
  return isAr ? def.labelAr : def.labelEn;
}

export function SectionSidebar({
  sections,
  activeKey,
  mode,
  onSelect,
  onModeChange,
}: SectionSidebarProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [query, setQuery] = useState("");
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());

  const filtered = query.trim()
    ? sections.filter((s) =>
        formatSectionLabel(s.sectionKey, isAr)
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : sections;

  useEffect(() => {
    cardRefs.current.get(activeKey)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeKey]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.modeToggle} role="group" aria-label={isAr ? "وضع العرض" : "View mode"}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "edit" ? styles.modeBtnActive : ""}`}
            onClick={() => onModeChange("edit")}
          >
            ✏️ {isAr ? "تحرير" : "Edit"}
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "reorder" ? styles.modeBtnActive : ""}`}
            onClick={() => onModeChange("reorder")}
          >
            ⇅ {isAr ? "الترتيب" : "Reorder"}
          </button>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAr ? "بحث في الأقسام…" : "Filter sections…"}
          className={styles.searchInput}
          aria-label={isAr ? "بحث في الأقسام" : "Filter sections"}
        />
      </div>

      <div className={styles.sidebarList} role="listbox" aria-label={isAr ? "أقسام الصفحة" : "Page sections"}>
        {filtered.map((sec) => {
          const isActive = mode === "edit" && activeKey === sec.sectionKey;
          return (
            <div
              key={sec.sectionKey}
              className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""} ${!sec.visible ? styles.sidebarItemHidden : ""}`}
            >
              <button
                type="button"
                ref={(el) => {
                  if (el) cardRefs.current.set(sec.sectionKey, el);
                  else cardRefs.current.delete(sec.sectionKey);
                }}
                onClick={() => onSelect(sec.sectionKey)}
                className={styles.sidebarItemMain}
                role="option"
                aria-selected={isActive}
              >
                <span className={styles.sidebarItemOrder}>
                  {String(sections.indexOf(sec) + 1).padStart(2, "0")}
                </span>
                <span className={styles.sidebarItemName}>
                  {formatSectionLabel(sec.sectionKey, isAr)}
                </span>
                {!sec.visible && (
                  <span className={styles.hiddenTag}>{isAr ? "مخفي" : "Hidden"}</span>
                )}
                <span
                  className={`${styles.statusDot} ${isDirty(sec) ? styles.statusDotDirty : styles.statusDotClean}`}
                  title={
                    isDirty(sec)
                      ? isAr
                        ? "تغييرات غير منشورة"
                        : "Unpublished changes"
                      : isAr
                        ? "منشور"
                        : "Published"
                  }
                />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className={styles.noResults}>
            {isAr ? "لا توجد نتائج مطابقة." : "No matching sections."}
          </p>
        )}
      </div>

      <p className={styles.sidebarHint}>
        {isAr
          ? "النقطة الخضراء = منشور، البرتقالية = تغييرات قيد الانتظار."
          : "Green dot = published, amber = changes pending."}
      </p>
    </aside>
  );
}
