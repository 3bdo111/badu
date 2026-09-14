"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { ProductImage } from "@/lib/types/product";
import styles from "./image-manager.module.css";

export function ImageManager({
  images,
  onChange,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}) {
  const { t } = useI18n();

  const handleRemove = (index: number) => {
    if (images.length <= 1) return; // Keep at least one
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{t("admin.fieldImages")}</label>
      
      <div className={styles.grid}>
        {images.map((img, idx) => (
          <div key={`${img.src}-${idx}`} className={styles.imgCard}>
            <div className={styles.previewFrame}>
              <img src={img.src} alt={img.alt.en || "Product image"} className={styles.img} />
              {idx === 0 && (
                <span className={styles.primaryBadge}>PRIMARY</span>
              )}
            </div>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className={styles.removeBtn}
              >
                {t("admin.delete")}
              </button>
            )}
          </div>
        ))}

        <div className={styles.addPlaceholder}>
          <span className={styles.plusIcon}>+</span>
          <span className={styles.noticeText}>{t("admin.imageNotice")}</span>
        </div>
      </div>
    </div>
  );
}
