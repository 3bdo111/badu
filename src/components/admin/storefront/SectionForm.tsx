"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { getSectionDefinition } from "@/lib/storefront/section-definitions";
import type { Product } from "@/lib/types/product";
import { MediaPickerModal } from "@/components/admin/cms/MediaPickerModal";
import type { SectionFormData } from "./types";
import { formatSectionLabel } from "./SectionSidebar";
import styles from "./storefront-manager.module.css";

interface SectionFormProps {
  section: StorefrontSectionRecord;
  formData: SectionFormData;
  products: Product[];
  isDirty: boolean;
  saving: boolean;
  onChange: <K extends keyof SectionFormData>(field: K, value: SectionFormData[K]) => void;
  onSaved: (updated: StorefrontSectionRecord, published: boolean) => void;
  onSavingChange: (saving: boolean) => void;
  onError: (msg: string, msgAr: string) => void;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.formGroupCard}>
      <h3 className={styles.formGroupTitle}>{title}</h3>
      <div className={styles.formGroupBody}>{children}</div>
    </section>
  );
}

function BilingualField({
  label,
  enValue,
  arValue,
  onEn,
  onAr,
  multiline,
  hintEn,
  hintAr,
}: {
  label: string;
  enValue: string;
  arValue: string;
  onEn: (v: string) => void;
  onAr: (v: string) => void;
  multiline?: boolean;
  hintEn?: string;
  hintAr?: string;
}) {
  return (
    <div className={styles.bilingualField}>
      <span className={styles.bilingualLabel}>{label}</span>
      <div className={styles.bilingualRow}>
        <div className={styles.bilingualCol} dir="ltr">
          <span className={styles.langTag}>EN</span>
          {multiline ? (
            <textarea value={enValue} onChange={(e) => onEn(e.target.value)} className={styles.textarea} rows={4} />
          ) : (
            <input type="text" value={enValue} onChange={(e) => onEn(e.target.value)} className={styles.input} />
          )}
          {hintEn && <p className={styles.fieldHint}>💡 {hintEn}</p>}
        </div>
        <div className={styles.bilingualCol} dir="rtl">
          <span className={styles.langTag}>عربي</span>
          {multiline ? (
            <textarea value={arValue} onChange={(e) => onAr(e.target.value)} className={styles.textarea} rows={4} />
          ) : (
            <input type="text" value={arValue} onChange={(e) => onAr(e.target.value)} className={styles.input} />
          )}
          {hintAr && <p className={styles.fieldHint}>💡 {hintAr}</p>}
        </div>
      </div>
    </div>
  );
}

export function SectionForm({
  section,
  formData,
  products,
  isDirty,
  saving,
  onChange,
  onSaved,
  onSavingChange,
  onError,
}: SectionFormProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const definition = getSectionDefinition(section.sectionKey);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSave = async (publish: boolean) => {
    onSavingChange(true);
    try {
      const res = await fetch(`/api/admin/storefront/${section.sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: publish ? "PUBLISHED" : "DRAFT" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.section) {
        onError(data.error || "Failed to save section.", data.error || "فشل حفظ القسم.");
        return;
      }
      onSaved(data.section, publish);
    } catch {
      onError("Connection error while saving.", "حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      onSavingChange(false);
    }
  };

  // Ctrl/Cmd+S saves the draft
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) handleSave(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, formData]);

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.formTitle}>{formatSectionLabel(section.sectionKey, isAr)}</h2>
          <div className={styles.metaWrap}>
            <span
              className={`${styles.badge} ${section.status === "PUBLISHED" ? styles.badgePublished : styles.badgeDraft}`}
            >
              {section.status === "PUBLISHED" ? (isAr ? "منشور" : "PUBLISHED") : isAr ? "مسودة" : "DRAFT"}
            </span>
            <span className={`${styles.badge} ${formData.visible ? styles.badgePublished : styles.badgeHidden}`}>
              {formData.visible ? (isAr ? "مرئي" : "VISIBLE") : isAr ? "مخفي" : "HIDDEN"}
            </span>
            {isDirty && (
              <span className={styles.badgeUnsaved}>{isAr ? "تغييرات غير محفوظة" : "Unsaved changes"}</span>
            )}
          </div>
        </div>
      </div>

      <Group title={isAr ? "المحتوى النصي" : "Text Content"}>
        <BilingualField
          label={isAr ? "العنوان" : "Title"}
          enValue={formData.titleEn}
          arValue={formData.titleAr}
          onEn={(v) => onChange("titleEn", v)}
          onAr={(v) => onChange("titleAr", v)}
        />
        <BilingualField
          label={isAr ? "العنوان الفرعي" : "Subtitle"}
          enValue={formData.subtitleEn}
          arValue={formData.subtitleAr}
          onEn={(v) => onChange("subtitleEn", v)}
          onAr={(v) => onChange("subtitleAr", v)}
        />
        <BilingualField
          label={isAr ? "النص الرئيسي" : "Body Content"}
          enValue={formData.bodyEn}
          arValue={formData.bodyAr}
          onEn={(v) => onChange("bodyEn", v)}
          onAr={(v) => onChange("bodyAr", v)}
          multiline
          hintEn={definition?.bodyHintEn}
          hintAr={definition?.bodyHintAr}
        />
      </Group>

      {definition?.hasCta && (
        <Group title={isAr ? "زر الإجراء (CTA)" : "Call to Action"}>
          <BilingualField
            label={isAr ? "نص الزر" : "Button Text"}
            enValue={formData.ctaLabelEn}
            arValue={formData.ctaLabelAr}
            onEn={(v) => onChange("ctaLabelEn", v)}
            onAr={(v) => onChange("ctaLabelAr", v)}
          />
          <div className={styles.singleField}>
            <span className={styles.bilingualLabel}>{isAr ? "رابط الوجهة" : "Destination URL"}</span>
            <input
              type="text"
              value={formData.ctaUrl}
              onChange={(e) => onChange("ctaUrl", e.target.value)}
              className={styles.input}
              dir="ltr"
              placeholder="#hoodie or /store"
            />
          </div>
        </Group>
      )}

      {definition?.hasFeaturedProduct && (
        <Group title={isAr ? "المنتج المرتبط" : "Linked Product"}>
          <div className={styles.singleField}>
            <span className={styles.bilingualLabel}>{isAr ? "المنتج المميز" : "Featured Product"}</span>
            <select
              value={formData.featuredProductId}
              onChange={(e) => onChange("featuredProductId", e.target.value)}
              className={styles.select}
            >
              <option value="">{isAr ? "-- اختر منتجاً --" : "-- Select a product --"}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {isAr ? p.translations.ar.name : p.translations.en.name} (${p.price})
                </option>
              ))}
            </select>
          </div>
        </Group>
      )}

      {definition?.hasImage && (
        <Group title={isAr ? "صورة القسم" : "Section Image"}>
          <div className={styles.mediaPicker}>
            {formData.imageUrl ? (
              <div className={styles.mediaPreview}>
                <Image src={formData.imageUrl} alt="Section preview" fill sizes="400px" style={{ objectFit: "cover" }} />
              </div>
            ) : (
              <div className={styles.mediaEmpty}>
                {isAr ? "لم يتم تحديد صورة" : "No image selected"}
              </div>
            )}
            <div className={styles.mediaActions}>
              <button type="button" onClick={() => setPickerOpen(true)} className={styles.pickerBtn}>
                📷 {isAr ? "اختر / ارفع صورة" : "Select / Upload"}
              </button>
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => onChange("imageUrl", "")}
                  className={`${styles.pickerBtn} ${styles.pickerBtnDanger}`}
                >
                  ✕ {isAr ? "إزالة" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </Group>
      )}

      <Group title={isAr ? "الإعدادات" : "Settings"}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.visible}
            onChange={(e) => onChange("visible", e.target.checked)}
            className={styles.checkbox}
          />
          {isAr ? "إظهار هذا القسم في الصفحة الرئيسية للمتجر" : "Show this section publicly on the landing page"}
        </label>
      </Group>

      <div className={styles.stickyActions}>
        <span className={styles.stickyHint}>
          {isAr ? "Ctrl+S للحفظ السريع" : "Ctrl+S to save quickly"}
        </span>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className={styles.saveDraftBtn}
        >
          {saving ? (isAr ? "جاري الحفظ…" : "Saving…") : isAr ? "حفظ المسودة" : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className={styles.publishBtn}
        >
          {saving ? (isAr ? "جاري النشر…" : "Publishing…") : isAr ? "نشر القسم" : "Publish Section"}
        </button>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectImage={(url) => onChange("imageUrl", url)}
        isAr={isAr}
      />
    </div>
  );
}
