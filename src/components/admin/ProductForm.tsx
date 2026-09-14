"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import type { Product, ProductImage } from "@/lib/types/product";
import { productRepository } from "@/lib/services/product-service";
import { validateProduct, slugify } from "@/lib/services/product-validator";
import { ImageManager } from "./ImageManager";
import { Button } from "@/components/ui/Button";
import styles from "./product-form.module.css";

const ALL_SIZES = ["S", "M", "L", "XL"];

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: Product;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [nameEn, setNameEn] = useState(product?.translations.en.name ?? "");
  const [nameAr, setNameAr] = useState(product?.translations.ar.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [price, setPrice] = useState<string>(product?.price !== undefined ? String(product.price) : "120");
  const [currency, setCurrency] = useState(product?.currency ?? "USD");
  const [descEn, setDescEn] = useState(product?.translations.en.description ?? "");
  const [descAr, setDescAr] = useState(product?.translations.ar.description ?? "");
  const [colorEn] = useState(product?.colors[0]?.name.en ?? "Desert Sand");
  const [colorAr] = useState(product?.colors[0]?.name.ar ?? "رمال الصحراء");
  const [colorHex] = useState(product?.colors[0]?.hex ?? "#C8A77D");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M", "L", "XL"]);
  
  // Per size stock numbers
  const [stockMap, setStockMap] = useState<Record<string, number>>(
    product?.stock ?? { S: 10, M: 10, L: 8, XL: 5 }
  );

  const [available, setAvailable] = useState<boolean>(product?.available ?? true);
  const [featured, setFeatured] = useState<boolean>(product?.featured ?? true);
  const [images, setImages] = useState<ProductImage[]>(
    product?.images ?? [
      {
        src: "/images/products/badu-hoodie/front-v6.jpg",
        alt: { en: "BADU Hoodie front", ar: "هودي BADU من الأمام" },
      },
      {
        src: "/images/products/badu-hoodie/back-v6.jpg",
        alt: { en: "BADU Hoodie back", ar: "هودي BADU من الخلف" },
      },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Auto generate slug from EN name if creating
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (mode === "create" && (!slug || slug === slugify(nameEn))) {
      setSlug(slugify(val));
    }
  };

  const handleSizeToggle = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleStockChange = (size: string, qtyStr: string) => {
    const qty = parseInt(qtyStr, 10);
    setStockMap((prev) => ({
      ...prev,
      [size]: isNaN(qty) ? 0 : Math.max(0, qty),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const candidate: Partial<Product> = {
      id: product?.id,
      slug,
      price: Number(price),
      currency: currency || "USD",
      available,
      featured,
      sizes,
      stock: stockMap,
      images,
      colors: [
        {
          name: { en: colorEn, ar: colorAr },
          hex: colorHex,
        },
      ],
      fit: product?.fit ?? { en: "Relaxed fit", ar: "قصة مريحة" },
      features: product?.features ?? [],
      translations: {
        en: {
          name: nameEn,
          description: descEn,
          artwork: product?.translations.en.artwork ?? "Embroidered artwork",
        },
        ar: {
          name: nameAr,
          description: descAr,
          artwork: product?.translations.ar.artwork ?? "تطريز مستوحى من الرحلة",
        },
      },
    };

    const validationResult = validateProduct(candidate);
    if (!validationResult.isValid) {
      const localizedErrors: Record<string, string> = {};
      for (const [k, errStr] of Object.entries(validationResult.errors)) {
        localizedErrors[k] = errStr[locale] || errStr.en;
      }
      setErrors(localizedErrors);
      return;
    }

    setErrors({});

    if (mode === "create") {
      productRepository.create(candidate);
    } else if (mode === "edit" && product) {
      productRepository.update(product.id, candidate);
    }

    setFeedbackMsg(t("admin.productSaved"));
    setTimeout(() => {
      router.push("/admin/products");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {feedbackMsg && (
        <div className={styles.toastSuccess} role="status">
          {feedbackMsg}
        </div>
      )}

      <div className={styles.formLayout}>
        {/* Main Column */}
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t("admin.products")}</h3>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>{t("admin.fieldNameEn")}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  aria-invalid={Boolean(errors.nameEn)}
                  aria-describedby={errors.nameEn ? "err-name-en" : undefined}
                  className={[styles.input, errors.nameEn ? styles.inputError : ""].join(" ")}
                />
                {errors.nameEn && <span id="err-name-en" className={styles.errorText}>{errors.nameEn}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("admin.fieldNameAr")}</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  aria-invalid={Boolean(errors.nameAr)}
                  aria-describedby={errors.nameAr ? "err-name-ar" : undefined}
                  className={[styles.input, errors.nameAr ? styles.inputError : ""].join(" ")}
                />
                {errors.nameAr && <span id="err-name-ar" className={styles.errorText}>{errors.nameAr}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("admin.fieldSlug")}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>{t("admin.fieldDescEn")}</label>
                <textarea
                  rows={4}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("admin.fieldDescAr")}</label>
                <textarea
                  rows={4}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className={styles.textarea}
                />
              </div>
            </div>
          </div>

          {/* Images Management */}
          <div className={styles.card}>
            <ImageManager images={images} onChange={setImages} />
          </div>
        </div>

        {/* Side Column */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t("admin.colPrice")}</h3>
            
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label}>{t("admin.fieldPrice")}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={[styles.input, errors.price ? styles.inputError : ""].join(" ")}
                />
                {errors.price && <span className={styles.errorText}>{errors.price}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("admin.fieldCurrency")}</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Size & Stock Management */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t("admin.fieldSizes")} & {t("admin.colStock")}</h3>
            <div className={styles.sizesRow}>
              {ALL_SIZES.map((size) => {
                const checked = sizes.includes(size);
                return (
                  <label key={size} className={[styles.sizeChip, checked ? styles.sizeActive : ""].join(" ")}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleSizeToggle(size)}
                      className="visually-hidden"
                    />
                    {size}
                  </label>
                );
              })}
            </div>
            {errors.sizes && <span className={styles.errorText}>{errors.sizes}</span>}

            {sizes.length > 0 && (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className={styles.label}>{t("admin.colStock")}</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                  {sizes.map((s) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, width: "1.5rem" }}>{s}:</span>
                      <input
                        type="number"
                        min="0"
                        value={stockMap[s] ?? 0}
                        onChange={(e) => handleStockChange(s, e.target.value)}
                        className={styles.input}
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t("admin.colStatus")}</h3>
            
            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>{t("admin.fieldVisibility")}</span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>{t("admin.fieldFeatured")}</span>
              </label>
            </div>
          </div>

          <div className={styles.actionBlock}>
            <Button type="submit" variant="primary" size="lg" className={styles.saveBtn}>
              {t("admin.saveProduct")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
