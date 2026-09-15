"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import type {
  Product,
  ProductImage,
  ProductColor,
  ProductFeature,
  ProductFaq,
} from "@/lib/types/product";
import { productRepository } from "@/lib/services/product-service";
import { slugify } from "@/lib/services/product-validator";
import { ImageManager } from "./ImageManager";
import styles from "./product-form.module.css";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

type TabType =
  | "basic"
  | "media"
  | "colors"
  | "sizes"
  | "sizeguide"
  | "features_faqs"
  | "story_artwork"
  | "seo";

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: Product;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  // 1. Basic & Commerce State
  const [nameEn, setNameEn] = useState(product?.translations.en.name ?? "");
  const [nameAr, setNameAr] = useState(product?.translations.ar.name ?? "");
  const [descEn, setDescEn] = useState(product?.translations.en.description ?? "");
  const [descAr, setDescAr] = useState(product?.translations.ar.description ?? "");
  const [artworkTextEn, setArtworkTextEn] = useState(product?.translations.en.artwork ?? "Embroidered artwork");
  const [artworkTextAr, setArtworkTextAr] = useState(product?.translations.ar.artwork ?? "تطريز مستوحى من الرحلة");
  const [fitEn, setFitEn] = useState(product?.fit?.en ?? "Relaxed fit");
  const [fitAr, setFitAr] = useState(product?.fit?.ar ?? "قصة مريحة");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [price, setPrice] = useState<string>(product?.price !== undefined ? String(product.price) : "120");
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    product?.compareAtPrice !== undefined && product?.compareAtPrice !== null
      ? String(product.compareAtPrice)
      : ""
  );
  const [currency, setCurrency] = useState(product?.currency ?? "USD");
  const [available, setAvailable] = useState<boolean>(product?.available ?? true);
  const [featured, setFeatured] = useState<boolean>(product?.featured ?? true);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(product?.status ?? "PUBLISHED");

  // 2. Media State
  const [images, setImages] = useState<ProductImage[]>(
    product?.images ?? [
      {
        src: "/images/products/badu-hoodie/front-v6.jpg",
        alt: { en: "BADU Hoodie front", ar: "هودي BADU من الأمام" },
        isPrimary: true,
      },
      {
        src: "/images/products/badu-hoodie/back-v6.jpg",
        alt: { en: "BADU Hoodie back", ar: "هودي BADU من الخلف" },
      },
    ]
  );

  // 3. Colors State
  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors ?? [
      { name: { en: "Desert Sand", ar: "رمال الصحراء" }, hex: "#C8A77D" },
    ]
  );

  // 4. Sizes & Stock State
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M", "L", "XL"]);
  const [stockMap, setStockMap] = useState<Record<string, number>>(
    product?.stock ?? { S: 10, M: 10, L: 8, XL: 5 }
  );

  // 5. Product Size Guide State
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState<boolean>(
    product?.sizeGuide?.enabled ?? true
  );
  const [sgTitleEn, setSgTitleEn] = useState<string>(product?.sizeGuide?.title?.en ?? "Size Guide");
  const [sgTitleAr, setSgTitleAr] = useState<string>(product?.sizeGuide?.title?.ar ?? "دليل المقاسات");
  const [sgUnit, setSgUnit] = useState<string>(product?.sizeGuide?.unit ?? "cm");
  const [sgColumns, setSgColumns] = useState<string[]>(
    product?.sizeGuide?.columns ?? ["Size", "Chest", "Length", "Sleeve"]
  );
  const [sgRows, setSgRows] = useState<Array<Record<string, string>>>(
    product?.sizeGuide?.rows ?? [
      { Size: "S", Chest: "58", Length: "68", Sleeve: "60" },
      { Size: "M", Chest: "60", Length: "70", Sleeve: "61" },
      { Size: "L", Chest: "62", Length: "72", Sleeve: "62" },
      { Size: "XL", Chest: "64", Length: "74", Sleeve: "64" },
    ]
  );
  const [sgNotesEn, setSgNotesEn] = useState<string>(product?.sizeGuide?.notes?.en ?? "Relaxed oversized fit. Take your normal size.");
  const [sgNotesAr, setSgNotesAr] = useState<string>(product?.sizeGuide?.notes?.ar ?? "قصة واسعة مريحة. خذ مقاسك المعتاد.");

  // 6. Features & FAQs State
  const [featuresList, setFeaturesList] = useState<ProductFeature[]>(
    product?.features ?? [
      {
        title: { en: "HEAVYWEIGHT FABRIC", ar: "قماش ثقيل" },
        body: { en: "Substantial feel for structure and wear.", ar: "خامة متينة للراحة والشكل." },
        visible: true,
      },
      {
        title: { en: "RELAXED FIT", ar: "قصة مريحة" },
        body: { en: "Relaxed silhouette for everyday wear.", ar: "قصة واسعة مريحة." },
        visible: true,
      },
      {
        title: { en: "EMBROIDERED ARTWORK", ar: "تطريز مستوحى من الرحلة" },
        body: { en: "Back artwork defining character.", ar: "التطريز الخلفي المميز." },
        visible: true,
      },
    ]
  );
  const [faqsList, setFaqsList] = useState<ProductFaq[]>(
    product?.faqs ?? [
      {
        question: { en: "How does the hoodie fit?", ar: "كيف تبدو قصة الهودي؟" },
        answer: { en: "It features a relaxed streetwear fit.", ar: "يأتي بقصة مريحة واسعة لمظهر عصري." },
        visible: true,
      },
    ]
  );

  // 7. Story & Artwork State
  const [storyTitleEn, setStoryTitleEn] = useState<string>(product?.storyContent?.title?.en ?? "BUILT FOR THE JOURNEY");
  const [storyTitleAr, setStoryTitleAr] = useState<string>(product?.storyContent?.title?.ar ?? "مصمم للرحلة");
  const [storyDescEn, setStoryDescEn] = useState<string>(
    product?.storyContent?.description?.en ?? "Inspired by open desert landscapes and open paths."
  );
  const [storyDescAr, setStoryDescAr] = useState<string>(
    product?.storyContent?.description?.ar ?? "مستوحى من الرمال الذهبية والطرق المفتوحة."
  );
  const [storyImages, setStoryImages] = useState<string[]>(
    product?.storyContent?.images ?? ["/images/products/badu-hoodie/detail-1-v2.jpg"]
  );

  const [artTitleEn, setArtTitleEn] = useState<string>(product?.artworkContent?.title?.en ?? "ARTWORK & SYMBOLISM");
  const [artTitleAr, setArtTitleAr] = useState<string>(product?.artworkContent?.title?.ar ?? "الرمزية والعمل الفني");
  const [artDescEn, setArtDescEn] = useState<string>(
    product?.artworkContent?.description?.en ?? "Detailed back embroidery celebrating movement."
  );
  const [artDescAr, setArtDescAr] = useState<string>(
    product?.artworkContent?.description?.ar ?? "تطريز خلفي يدوي يعبر عن الحركة والأناقة."
  );
  const [artImages, setArtImages] = useState<string[]>(
    product?.artworkContent?.images ?? ["/images/products/badu-hoodie/detail-2-v2.jpg"]
  );

  // 8. SEO State
  const [seoTitleEn, setSeoTitleEn] = useState<string>(product?.seo?.title?.en ?? nameEn);
  const [seoTitleAr, setSeoTitleAr] = useState<string>(product?.seo?.title?.ar ?? nameAr);
  const [seoDescEn, setSeoDescEn] = useState<string>(product?.seo?.metaDescription?.en ?? descEn);
  const [seoDescAr, setSeoDescAr] = useState<string>(product?.seo?.metaDescription?.ar ?? descAr);
  const [seoOgImage, setSeoOgImage] = useState<string>(product?.seo?.ogImage ?? "");
  const [seoIndexable, setSeoIndexable] = useState<boolean>(product?.seo?.indexable ?? true);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

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

  const addColor = () => {
    setColors([...colors, { name: { en: "New Color", ar: "لون جديد" }, hex: "#000000" }]);
  };

  const removeColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent, targetStatus?: "DRAFT" | "PUBLISHED") => {
    e.preventDefault();
    setSaving(true);
    setFeedbackMsg(null);
    setErrors({});

    const chosenStatus = targetStatus || status;

    // Validation
    const errs: Record<string, string> = {};
    if (!nameEn.trim()) errs.nameEn = "English name is required";
    if (!nameAr.trim()) errs.nameAr = "Arabic name is required";
    if (isNaN(Number(price)) || Number(price) < 0) errs.price = "Valid price >= 0 is required";
    if (sizes.length === 0) errs.sizes = "Select at least one size";

    for (let idx = 0; idx < colors.length; idx++) {
      if (!HEX_COLOR_REGEX.test(colors[idx].hex)) {
        errs[`color_${idx}`] = `Invalid HEX color format: ${colors[idx].hex}`;
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSaving(false);
      setFeedbackMsg({ text: "Please fix validation errors before saving.", error: true });
      return;
    }

    const parsedComparePrice =
      compareAtPrice.trim() !== "" && !isNaN(Number(compareAtPrice))
        ? Number(compareAtPrice)
        : undefined;

    const payload: Partial<Product> = {
      id: product?.id,
      slug: slug || slugify(nameEn),
      price: Number(price),
      compareAtPrice: parsedComparePrice,
      currency: currency || "USD",
      available: chosenStatus === "PUBLISHED" ? available : false,
      featured,
      status: chosenStatus,
      sizes,
      stock: stockMap,
      images,
      colors,
      fit: { en: fitEn, ar: fitAr },
      features: featuresList,
      faqs: faqsList,
      sizeGuide: {
        enabled: sizeGuideEnabled,
        title: { en: sgTitleEn, ar: sgTitleAr },
        unit: sgUnit,
        columns: sgColumns,
        rows: sgRows,
        notes: { en: sgNotesEn, ar: sgNotesAr },
      },
      storyContent: {
        title: { en: storyTitleEn, ar: storyTitleAr },
        description: { en: storyDescEn, ar: storyDescAr },
        images: storyImages,
      },
      artworkContent: {
        title: { en: artTitleEn, ar: artTitleAr },
        description: { en: artDescEn, ar: artDescAr },
        images: artImages,
        captions: [
          { en: artworkTextEn, ar: artworkTextAr },
        ],
      },
      seo: {
        title: { en: seoTitleEn || nameEn, ar: seoTitleAr || nameAr },
        metaDescription: { en: seoDescEn || descEn, ar: seoDescAr || descAr },
        ogImage: seoOgImage || (images[0]?.src ?? ""),
        indexable: seoIndexable,
      },
      translations: {
        en: { name: nameEn, description: descEn, artwork: artworkTextEn },
        ar: { name: nameAr, description: descAr, artwork: artworkTextAr },
      },
    };

    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      productRepository.refreshClient();
      setFeedbackMsg({ text: `Product saved as ${chosenStatus}!` });
      setTimeout(() => {
        router.push("/admin/products");
      }, 700);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Save failed";
      setFeedbackMsg({ text: errMsg, error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>
            {mode === "create" ? "Create New Product" : `Edit Product — ${nameEn || product?.id}`}
          </h1>
          <p className={styles.pageSubtitle}>Universal CMS — Configure customer-facing content without code</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, "DRAFT")}
            className={styles.secondaryButton}
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, "PUBLISHED")}
            className={styles.primaryButton}
          >
            {saving ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={feedbackMsg.error ? styles.errorBanner : styles.successBanner}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className={styles.tabNav}>
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={[styles.tabItem, activeTab === "basic" ? styles.tabActive : ""].join(" ")}
        >
          1. Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={[styles.tabItem, activeTab === "media" ? styles.tabActive : ""].join(" ")}
        >
          2. Media ({images.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={[styles.tabItem, activeTab === "colors" ? styles.tabActive : ""].join(" ")}
        >
          3. Colors ({colors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sizes")}
          className={[styles.tabItem, activeTab === "sizes" ? styles.tabActive : ""].join(" ")}
        >
          4. Sizes & Stock
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sizeguide")}
          className={[styles.tabItem, activeTab === "sizeguide" ? styles.tabActive : ""].join(" ")}
        >
          5. Size Guide
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("features_faqs")}
          className={[styles.tabItem, activeTab === "features_faqs" ? styles.tabActive : ""].join(" ")}
        >
          6. Features & FAQs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("story_artwork")}
          className={[styles.tabItem, activeTab === "story_artwork" ? styles.tabActive : ""].join(" ")}
        >
          7. Story & Artwork
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={[styles.tabItem, activeTab === "seo" ? styles.tabActive : ""].join(" ")}
        >
          8. SEO
        </button>
      </div>

      {/* TAB 1: BASIC INFO */}
      {activeTab === "basic" && (
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Product Identity & Pricing</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Product Name (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                className={styles.input}
                required
              />
              {errors.nameEn && <span className={styles.errorText}>{errors.nameEn}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Product Name (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className={styles.input}
                required
              />
              {errors.nameAr && <span className={styles.errorText}>{errors.nameAr}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Selling Price & Currency (سعر البيع الحالي)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={styles.input}
                  style={{ flex: 2 }}
                  required
                />
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className={styles.input}
                  style={{ flex: 1 }}
                />
              </div>
              {errors.price && <span className={styles.errorText}>{errors.price}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Original Price before Discount (السعر الأصلي قبل الخصم)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 150 (Leave empty if no discount)"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className={styles.input}
              />
              {compareAtPrice.trim() !== "" &&
                !isNaN(Number(compareAtPrice)) &&
                !isNaN(Number(price)) &&
                Number(compareAtPrice) > Number(price) && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.4rem 0.75rem",
                      backgroundColor: "rgba(109, 127, 87, 0.15)",
                      border: "1px solid #6d7f57",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      color: "#6d7f57",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>🏷️ الخصم مفعل:</span>
                    <span>
                      خصم {Math.round(((Number(compareAtPrice) - Number(price)) / Number(compareAtPrice)) * 100)}%
                      (توفير {Number(compareAtPrice) - Number(price)} {currency})
                    </span>
                  </div>
                )}
              {errors.compareAtPrice && <span className={styles.errorText}>{errors.compareAtPrice}</span>}
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Full Description (English)</label>
              <textarea
                rows={3}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Full Description (Arabic)</label>
              <textarea
                rows={3}
                dir="rtl"
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Fit Callout (English)</label>
              <input
                type="text"
                value={fitEn}
                onChange={(e) => setFitEn(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Fit Callout (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={fitAr}
                onChange={(e) => setFitAr(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Product Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                className={styles.select}
              >
                <option value="DRAFT">DRAFT (Hidden from Storefront)</option>
                <option value="PUBLISHED">PUBLISHED (Publicly Visible)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.checkboxLabel} style={{ marginTop: "1.5rem" }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                Featured Product on Home
              </label>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: MEDIA LIBRARY */}
      {activeTab === "media" && (
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Product Media & Photography</h2>
          <ImageManager images={images} onChange={setImages} />
        </section>
      )}

      {/* TAB 3: COLORS & HEX */}
      {activeTab === "colors" && (
        <section className={styles.sectionCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className={styles.sectionHeading} style={{ borderBottom: "none", paddingBottom: 0 }}>
              Color Swatches & HEX Codes
            </h2>
            <button type="button" onClick={addColor} className={styles.secondaryButton}>
              + Add Color Swatch
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {colors.map((col, idx) => (
              <div key={idx} className={styles.listRow}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    backgroundColor: HEX_COLOR_REGEX.test(col.hex) ? col.hex : "#ccc",
                    border: "2px solid rgba(255,255,255,0.2)",
                    flexShrink: 0,
                  }}
                  title={col.hex}
                />
                <input
                  type="text"
                  placeholder="HEX Code (#C8A77D)"
                  value={col.hex}
                  onChange={(e) => {
                    const copy = [...colors];
                    copy[idx].hex = e.target.value;
                    setColors(copy);
                  }}
                  className={styles.input}
                  style={{ width: "8rem" }}
                  required
                />
                <input
                  type="text"
                  placeholder="Color Name EN"
                  value={col.name.en}
                  onChange={(e) => {
                    const copy = [...colors];
                    copy[idx].name.en = e.target.value;
                    setColors(copy);
                  }}
                  className={styles.input}
                  style={{ flex: 1 }}
                  required
                />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="Color Name AR"
                  value={col.name.ar}
                  onChange={(e) => {
                    const copy = [...colors];
                    copy[idx].name.ar = e.target.value;
                    setColors(copy);
                  }}
                  className={styles.input}
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className={styles.dangerButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: SIZES & STOCK */}
      {activeTab === "sizes" && (
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Available Sizes & Stock Quantities</h2>
          <div className={styles.sizesRow} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {ALL_SIZES.map((size) => {
              const checked = sizes.includes(size);
              return (
                <label
                  key={size}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    border: `1px solid ${checked ? "var(--color-accent, #c8a77d)" : "var(--color-border, #333)"}`,
                    backgroundColor: checked ? "rgba(200, 167, 125, 0.15)" : "transparent",
                    color: checked ? "var(--color-accent, #c8a77d)" : "inherit",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSizeToggle(size)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {size}
                </label>
              );
            })}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 className={styles.label} style={{ marginBottom: "0.75rem" }}>PER-SIZE STOCK QUANTITIES</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {sizes.map((s) => (
                <div key={s} className={styles.fieldGroup}>
                  <label className={styles.label}>Size {s} Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stockMap[s] ?? 0}
                    onChange={(e) => handleStockChange(s, e.target.value)}
                    className={styles.input}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: SIZE GUIDE EDITOR */}
      {activeTab === "sizeguide" && (
        <section className={styles.sectionCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className={styles.sectionHeading} style={{ borderBottom: "none", paddingBottom: 0 }}>
              Product Size Guide Table Editor
            </h2>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={sizeGuideEnabled}
                onChange={(e) => setSizeGuideEnabled(e.target.checked)}
              />
              Enable Size Guide on Product Page
            </label>
          </div>

          {sizeGuideEnabled && (
            <div className={styles.fieldGrid} style={{ marginTop: "1rem" }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Title (English)</label>
                <input
                  type="text"
                  value={sgTitleEn}
                  onChange={(e) => setSgTitleEn(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sgTitleAr}
                  onChange={(e) => setSgTitleAr(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Measurement Unit */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Measurement Unit</label>
                <select
                  value={sgUnit}
                  onChange={(e) => setSgUnit(e.target.value)}
                  className={styles.select}
                >
                  <option value="cm">Centimetres (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              {/* Rows Table */}
              <div className={styles.fieldGroupFull} style={{ marginTop: "1rem" }}>
                <span className={styles.label}>MEASUREMENT TABLE ROWS</span>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255,255,255,0.05)", textAlign: "left" }}>
                        {sgColumns.map((col) => (
                          <th key={col} style={{ padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sgRows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: "1px solid var(--color-border, #262320)" }}>
                          {sgColumns.map((col) => (
                            <td key={col} style={{ padding: "0.375rem" }}>
                              <input
                                type="text"
                                value={row[col] || ""}
                                onChange={(e) => {
                                  const copyRows = [...sgRows];
                                  copyRows[rIdx] = { ...copyRows[rIdx], [col]: e.target.value };
                                  setSgRows(copyRows);
                                }}
                                className={styles.input}
                                style={{ padding: "0.375rem 0.5rem", fontSize: "0.85rem" }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Fit Notes (English)</label>
                <input
                  type="text"
                  value={sgNotesEn}
                  onChange={(e) => setSgNotesEn(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Fit Notes (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={sgNotesAr}
                  onChange={(e) => setSgNotesAr(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 6: FEATURES & FAQS */}
      {activeTab === "features_faqs" && (
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Product Features & FAQs</h2>
          
          {/* Features */}
          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.label}>PRODUCT FEATURES ({featuresList.length})</span>
              <button
                type="button"
                onClick={() =>
                  setFeaturesList([
                    ...featuresList,
                    {
                      title: { en: "NEW FEATURE", ar: "ميزة جديدة" },
                      body: { en: "Feature description...", ar: "وصف الميزة..." },
                      visible: true,
                    },
                  ])
                }
                className={styles.secondaryButton}
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
              >
                + Add Feature
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              {featuresList.map((feat, idx) => (
                <div key={idx} className={styles.listRow}>
                  <input
                    type="text"
                    placeholder="Title EN"
                    value={feat.title.en}
                    onChange={(e) => {
                      const copy = [...featuresList];
                      copy[idx].title.en = e.target.value;
                      setFeaturesList(copy);
                    }}
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Title AR"
                    value={feat.title.ar}
                    onChange={(e) => {
                      const copy = [...featuresList];
                      copy[idx].title.ar = e.target.value;
                      setFeaturesList(copy);
                    }}
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Body EN"
                    value={feat.body.en}
                    onChange={(e) => {
                      const copy = [...featuresList];
                      copy[idx].body.en = e.target.value;
                      setFeaturesList(copy);
                    }}
                    className={styles.input}
                    style={{ flex: 2 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturesList(featuresList.filter((_, i) => i !== idx))}
                    className={styles.dangerButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.label}>PRODUCT FAQS ({faqsList.length})</span>
              <button
                type="button"
                onClick={() =>
                  setFaqsList([
                    ...faqsList,
                    {
                      question: { en: "New Question?", ar: "سؤال جديد؟" },
                      answer: { en: "Answer details...", ar: "تفاصيل الإجابة..." },
                      visible: true,
                    },
                  ])
                }
                className={styles.secondaryButton}
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
              >
                + Add FAQ
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              {faqsList.map((faq, idx) => (
                <div key={idx} className={styles.listRow}>
                  <input
                    type="text"
                    placeholder="Question EN"
                    value={faq.question.en}
                    onChange={(e) => {
                      const copy = [...faqsList];
                      copy[idx].question.en = e.target.value;
                      setFaqsList(copy);
                    }}
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Question AR"
                    value={faq.question.ar}
                    onChange={(e) => {
                      const copy = [...faqsList];
                      copy[idx].question.ar = e.target.value;
                      setFaqsList(copy);
                    }}
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Answer EN"
                    value={faq.answer.en}
                    onChange={(e) => {
                      const copy = [...faqsList];
                      copy[idx].answer.en = e.target.value;
                      setFaqsList(copy);
                    }}
                    className={styles.input}
                    style={{ flex: 2 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFaqsList(faqsList.filter((_, i) => i !== idx))}
                    className={styles.dangerButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 7: STORY & ARTWORK */}
      {activeTab === "story_artwork" && (
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Product Story & Artwork Storytelling</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Story Title (English)</label>
              <input
                type="text"
                value={storyTitleEn}
                onChange={(e) => setStoryTitleEn(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Story Title (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={storyTitleAr}
                onChange={(e) => setStoryTitleAr(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Story Description (English)</label>
              <textarea
                rows={2}
                value={storyDescEn}
                onChange={(e) => setStoryDescEn(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Story Description (Arabic)</label>
              <textarea
                rows={2}
                dir="rtl"
                value={storyDescAr}
                onChange={(e) => setStoryDescAr(e.target.value)}
                className={styles.textarea}
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 8: SEO */}
      {activeTab === "seo" && (
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionHeading}>Product Search Engine Optimization (SEO)</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>SEO Title (English)</label>
              <input
                type="text"
                value={seoTitleEn}
                onChange={(e) => setSeoTitleEn(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>SEO Title (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={seoTitleAr}
                onChange={(e) => setSeoTitleAr(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Meta Description (English)</label>
              <textarea
                rows={2}
                value={seoDescEn}
                onChange={(e) => setSeoDescEn(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>Meta Description (Arabic)</label>
              <textarea
                rows={2}
                dir="rtl"
                value={seoDescAr}
                onChange={(e) => setSeoDescAr(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={seoIndexable}
                  onChange={(e) => setSeoIndexable(e.target.checked)}
                />
                Indexable by Search Engines (Sitemap & Robots)
              </label>
            </div>
          </div>
        </section>
      )}

      <div className={styles.bottomBar} style={{ gap: "0.75rem" }}>
        <button
          type="button"
          disabled={saving}
          onClick={(e) => handleSubmit(e, "DRAFT")}
          className={styles.secondaryButton}
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={(e) => handleSubmit(e, "PUBLISHED")}
          className={styles.primaryButton}
        >
          {saving ? "Publishing..." : "Publish Product"}
        </button>
      </div>
    </div>
  );
}
