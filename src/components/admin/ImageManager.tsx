"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { ProductColor, ProductImage } from "@/lib/types/product";
import { colorKeyFromName } from "@/lib/types/product";
import { MediaPickerModal } from "./cms/MediaPickerModal";
import styles from "./image-manager.module.css";

export function ImageManager({
  images,
  onChange,
  colors = [],
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  /** Product colors — enables tagging each image with a color variant. */
  colors?: ProductColor[];
}) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const [pickerOpen, setPickerOpen] = useState(false);

  /**
   * Single source of truth: the FIRST image in the array is the primary one
   * (the storefront renders images[0] as primary). Keep the isPrimary flag
   * consistent with position after every mutation.
   */
  const normalize = (list: ProductImage[]): ProductImage[] =>
    list.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));

  const commit = (list: ProductImage[]) => onChange(normalize(list));

  const handleAdd = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    commit([
      ...images,
      {
        src: trimmed,
        alt: { en: "", ar: "" },
        isPrimary: images.length === 0,
      },
    ]);
    setPickerOpen(false);
  };

  const handleRemove = (index: number) => {
    if (images.length <= 1) return; // Keep at least one
    commit(images.filter((_, idx) => idx !== index));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    commit(next);
  };

  const handleSetPrimary = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    // Promote to primary by moving the image to the front of the gallery.
    const target = images[index];
    commit([target, ...images.filter((_, idx) => idx !== index)]);
  };

  const handleAltChange = (
    index: number,
    lang: "en" | "ar",
    value: string
  ) => {
    const next = images.map((img, idx) =>
      idx === index ? { ...img, alt: { ...img.alt, [lang]: value } } : img
    );
    onChange(next);
  };

  const handleColorChange = (index: number, colorKey: string) => {
    const next = images.map((img, idx) =>
      idx === index ? { ...img, colorKey: colorKey || null } : img
    );
    onChange(next);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <label className={styles.label}>{t("admin.fieldImages")}</label>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={styles.addBtn}
        >
          + {isAr ? "إضافة صورة" : "Add Image"}
        </button>
      </div>

      <div className={styles.grid}>
        {images.map((img, idx) => (
          <div key={`${img.src}-${idx}`} className={styles.imgCard}>
            <div className={styles.previewFrame}>
              {/* Admin preview of an already-uploaded asset — plain img is fine here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt.en || img.alt.ar || "Product image"} className={styles.img} />
              {Boolean(img.isPrimary) && (
                <span className={styles.primaryBadge}>PRIMARY</span>
              )}
            </div>

            <div className={styles.cardActions}>
              <button
                type="button"
                onClick={() => handleMove(idx, "up")}
                disabled={idx === 0}
                className={styles.actionBtn}
                aria-label={isAr ? "تحريك لأعلى" : "Move earlier"}
                title={isAr ? "تحريك لأعلى" : "Move earlier"}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, "down")}
                disabled={idx === images.length - 1}
                className={styles.actionBtn}
                aria-label={isAr ? "تحريك لأسفل" : "Move later"}
                title={isAr ? "تحريك لأسفل" : "Move later"}
              >
                →
              </button>
              <button
                type="button"
                onClick={() => handleSetPrimary(idx)}
                disabled={idx === 0}
                className={styles.actionBtn}
                aria-label={isAr ? "تعيين كصورة أساسية" : "Set as primary"}
                title={isAr ? "تعيين كصورة أساسية" : "Set as primary"}
              >
                ★
              </button>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className={styles.removeBtn}
                  aria-label={isAr ? "حذف الصورة" : "Remove image"}
                >
                  {t("admin.delete")}
                </button>
              )}
            </div>

            <div className={styles.altFields}>
              <input
                type="text"
                placeholder="Alt EN"
                value={img.alt.en}
                onChange={(e) => handleAltChange(idx, "en", e.target.value)}
                className={styles.altInput}
                dir="ltr"
              />
              <input
                type="text"
                placeholder="Alt AR"
                value={img.alt.ar}
                onChange={(e) => handleAltChange(idx, "ar", e.target.value)}
                className={styles.altInput}
                dir="rtl"
              />
            </div>

            {colors.length > 0 && (
              <select
                className={`${styles.altInput} ${styles.colorSelect}`}
                value={img.colorKey || ""}
                onChange={(e) => handleColorChange(idx, e.target.value)}
                aria-label={isAr ? "لون الصورة" : "Image color"}
                title={
                  isAr
                    ? "اربط الصورة بلون معيّن — تظهر فقط عند اختياره في المتجر"
                    : "Tag this image to a color — it only shows when that color is selected in the store"
                }
              >
                <option value="">
                  {isAr ? "كل الألوان" : "All colors"}
                </option>
                {colors.map((c) => (
                  <option key={colorKeyFromName(c.name.en)} value={colorKeyFromName(c.name.en)}>
                    {c.name[isAr ? "ar" : "en"]}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={styles.addPlaceholder}
        >
          <span className={styles.plusIcon}>+</span>
          <span className={styles.noticeText}>
            {isAr
              ? "رفع صورة جديدة أو الاختيار من مكتبة الوسائط"
              : "Upload a new image or pick from the media library"}
          </span>
        </button>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectImage={handleAdd}
        isAr={isAr}
      />
    </div>
  );
}
