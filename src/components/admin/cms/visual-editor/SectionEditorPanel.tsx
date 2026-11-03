"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { getSectionDefinition } from "@/lib/storefront/section-definitions";
import type { Product } from "@/lib/types/product";
import type { EditorLocale, SectionField } from "./types";
import { formatSectionLabel } from "./SectionListPanel";
import styles from "./visual-editor.module.css";

interface SectionEditorPanelProps {
  section: StorefrontSectionRecord;
  locale: EditorLocale;
  products: Product[];
  isDirty: boolean;
  onFieldChange: (field: SectionField, value: unknown) => void;
  onOpenMediaPicker: () => void;
  onReset: () => void;
}

/** Collapsible field group with a summary header. */
function FieldGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.fieldGroupCard}>
      <button
        type="button"
        className={styles.fieldGroupHeader}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={styles.fieldGroupChevron} aria-hidden="true">
          {open ? "▾" : "◂"}
        </span>
      </button>
      {open && <div className={styles.fieldGroupBody}>{children}</div>}
    </div>
  );
}

function Field({
  label,
  dir,
  hint,
  children,
}: {
  label: string;
  dir: "ltr" | "rtl";
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      {hint && (
        <p className={styles.fieldHint}>💡 {hint}</p>
      )}
      <div dir={dir}>{children}</div>
    </div>
  );
}

export function SectionEditorPanel({
  section,
  locale,
  products,
  isDirty,
  onFieldChange,
  onOpenMediaPicker,
  onReset,
}: SectionEditorPanelProps) {
  const isAr = locale === "ar";
  const definition = getSectionDefinition(section.sectionKey);

  return (
    <div className={styles.sidebarSection}>
      <div className={styles.editorHeaderRow}>
        <h2 className={styles.sectionTitle}>
          {isAr ? "تعديل" : "Editing"} — {formatSectionLabel(section.sectionKey, locale)}
        </h2>
        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            className={styles.resetBtn}
            title={isAr ? "التراجع عن تغييرات هذا القسم" : "Discard changes to this section"}
          >
            {isAr ? "↺ تراجع" : "↺ Reset"}
          </button>
        )}
      </div>

      <FieldGroup title={isAr ? "المحتوى النصي" : "Text Content"}>
        <Field label="Title (EN)" dir="ltr">
          <input
            type="text"
            value={section.titleEn}
            onChange={(e) => onFieldChange("titleEn", e.target.value)}
            className={styles.input}
          />
        </Field>
        <Field label="العنوان (AR)" dir="rtl">
          <input
            type="text"
            value={section.titleAr}
            onChange={(e) => onFieldChange("titleAr", e.target.value)}
            className={styles.input}
          />
        </Field>
        <Field label="Subtitle (EN)" dir="ltr">
          <input
            type="text"
            value={section.subtitleEn}
            onChange={(e) => onFieldChange("subtitleEn", e.target.value)}
            className={styles.input}
          />
        </Field>
        <Field label="العنوان الفرعي (AR)" dir="rtl">
          <input
            type="text"
            value={section.subtitleAr}
            onChange={(e) => onFieldChange("subtitleAr", e.target.value)}
            className={styles.input}
          />
        </Field>
        <Field label="Body Content (EN)" dir="ltr" hint={definition?.bodyHintEn}>
          <textarea
            value={section.bodyEn}
            onChange={(e) => onFieldChange("bodyEn", e.target.value)}
            className={styles.textarea}
          />
        </Field>
        <Field label="نص الموضوع (AR)" dir="rtl" hint={definition?.bodyHintAr}>
          <textarea
            value={section.bodyAr}
            onChange={(e) => onFieldChange("bodyAr", e.target.value)}
            className={styles.textarea}
          />
        </Field>
      </FieldGroup>

      {definition?.hasCta && (
        <FieldGroup title={isAr ? "زر الإجراء (CTA)" : "Call to Action"}>
          <Field label="CTA Button Text (EN)" dir="ltr">
            <input
              type="text"
              value={section.ctaLabelEn}
              onChange={(e) => onFieldChange("ctaLabelEn", e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="نص زر الإجراء (AR)" dir="rtl">
            <input
              type="text"
              value={section.ctaLabelAr}
              onChange={(e) => onFieldChange("ctaLabelAr", e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="CTA Destination URL" dir="ltr">
            <input
              type="text"
              value={section.ctaUrl}
              onChange={(e) => onFieldChange("ctaUrl", e.target.value)}
              className={styles.input}
            />
          </Field>
        </FieldGroup>
      )}

      {definition?.hasFeaturedProduct && (
        <FieldGroup title={isAr ? "المنتج المرتبط" : "Linked Product"}>
          <Field label={isAr ? "المنتج المميز" : "Featured Product"} dir="ltr">
            <select
              value={section.featuredProductId}
              onChange={(e) => onFieldChange("featuredProductId", e.target.value)}
              className={styles.select}
            >
              <option value="">
                {isAr ? "-- اختر منتجاً --" : "-- Select a product --"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {isAr ? p.translations.ar.name : p.translations.en.name} (${p.price})
                </option>
              ))}
            </select>
          </Field>
        </FieldGroup>
      )}

      {definition?.hasImage && (
        <FieldGroup title={isAr ? "صورة القسم" : "Section Image"}>
          <div className={styles.imagePicker}>
            {section.imageUrl ? (
              <div className={styles.imagePreviewWrap}>
                <Image
                  src={section.imageUrl}
                  alt="Section preview"
                  fill
                  sizes="300px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <div className={styles.imageEmpty}>
                {isAr ? "لم يتم تحديد صورة" : "No image selected"}
              </div>
            )}
            <div className={styles.imageActions}>
              <button
                type="button"
                onClick={onOpenMediaPicker}
                className={styles.pickerBtn}
              >
                📷 {isAr ? "اختر / ارفع صورة" : "Select / Upload"}
              </button>
              {section.imageUrl && (
                <button
                  type="button"
                  onClick={() => onFieldChange("imageUrl", "")}
                  className={`${styles.pickerBtn} ${styles.pickerBtnDanger}`}
                >
                  ✕ {isAr ? "إزالة" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </FieldGroup>
      )}

      <FieldGroup title={isAr ? "الإعدادات" : "Settings"}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={section.visible}
            onChange={(e) => onFieldChange("visible", e.target.checked)}
          />
          <span>
            {isAr
              ? "إظهار هذا القسم في الصفحة الرئيسية"
              : "Show this section publicly on the landing page"}
          </span>
        </label>
        <p className={styles.metaLine}>
          {isAr ? "الحالة:" : "Status:"}{" "}
          <span className={section.status === "PUBLISHED" ? styles.statusPublished : styles.statusDraft}>
            {section.status === "PUBLISHED"
              ? isAr
                ? "منشور"
                : "Published"
              : isAr
                ? "مسودة"
                : "Draft"}
          </span>
        </p>
      </FieldGroup>
    </div>
  );
}
