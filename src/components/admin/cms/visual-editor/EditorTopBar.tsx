"use client";

import Link from "next/link";
import type { EditorLocale, Viewport } from "./types";
import styles from "./visual-editor.module.css";

interface EditorTopBarProps {
  locale: EditorLocale;
  viewport: Viewport;
  pendingCount: number;
  saving: boolean;
  canSave: boolean;
  onViewportChange: (viewport: Viewport) => void;
  onLocaleChange: (locale: EditorLocale) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const VIEWPORTS: { key: Viewport; icon: string; labelEn: string; labelAr: string }[] = [
  { key: "desktop", icon: "🖥️", labelEn: "Desktop", labelAr: "سطح المكتب" },
  { key: "tablet", icon: "📱", labelEn: "Tablet", labelAr: "تابلت" },
  { key: "mobile", icon: "📲", labelEn: "Mobile", labelAr: "جوال" },
];

export function EditorTopBar({
  locale,
  viewport,
  pendingCount,
  saving,
  canSave,
  onViewportChange,
  onLocaleChange,
  onSaveDraft,
  onPublish,
}: EditorTopBarProps) {
  const isAr = locale === "ar";

  return (
    <header className={styles.topBar}>
      <div className={styles.titleBlock}>
        <Link href="/admin/storefront" className={styles.backLink}>
          ← {isAr ? "العودة" : "Back"}
        </Link>
        <h1 className={styles.pageTitle}>
          {isAr ? "محرر الواجهة" : "Storefront Editor"}
        </h1>
        {pendingCount > 0 && (
          <span
            className={styles.pendingBadge}
            title={isAr ? "أقسام بها تغييرات غير منشورة" : "Sections with unpublished changes"}
          >
            {pendingCount} {isAr ? "قيد الانتظار" : "pending"}
          </span>
        )}
      </div>

      <div className={styles.controlsGroup}>
        <div className={styles.toggleGroup} role="group" aria-label="Device viewport">
          {VIEWPORTS.map((v) => (
            <button
              key={v.key}
              type="button"
              className={`${styles.toggleBtn} ${viewport === v.key ? styles.toggleBtnActive : ""}`}
              onClick={() => onViewportChange(v.key)}
              title={isAr ? v.labelAr : v.labelEn}
            >
              <span aria-hidden="true">{v.icon}</span>
              <span className={styles.toggleLabel}>{isAr ? v.labelAr : v.labelEn}</span>
            </button>
          ))}
        </div>

        <div className={styles.toggleGroup} role="group" aria-label="Editor language">
          <button
            type="button"
            className={`${styles.toggleBtn} ${locale === "en" ? styles.toggleBtnActive : ""}`}
            onClick={() => onLocaleChange("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${locale === "ar" ? styles.toggleBtnActive : ""}`}
            onClick={() => onLocaleChange("ar")}
          >
            عربي
          </button>
        </div>
      </div>

      <div className={styles.actionsGroup}>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving || !canSave}
          className={styles.saveDraftBtn}
          title={
            canSave
              ? undefined
              : isAr
                ? "لا توجد تغييرات في القسم المحدد"
                : "No changes in the selected section"
          }
        >
          {saving ? (isAr ? "جاري الحفظ…" : "Saving…") : isAr ? "حفظ المسودة" : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={saving || pendingCount === 0}
          className={styles.publishBtn}
        >
          {saving
            ? isAr
              ? "جاري النشر…"
              : "Publishing…"
            : isAr
              ? `نشر التغييرات${pendingCount > 0 ? ` (${pendingCount})` : ""}`
              : `Publish Changes${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
        </button>
      </div>
    </header>
  );
}
