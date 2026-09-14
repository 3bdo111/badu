"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import type { Product } from "@/lib/types/product";
import styles from "./storefront.module.css";

export default function AdminStorefrontPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  const [sections, setSections] = useState<StorefrontSectionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Active section form state
  const [formData, setFormData] = useState<{
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    bodyEn: string;
    bodyAr: string;
    ctaLabelEn: string;
    ctaLabelAr: string;
    ctaUrl: string;
    featuredProductId: string;
    imageUrl: string;
    visible: boolean;
  }>({
    titleEn: "",
    titleAr: "",
    subtitleEn: "",
    subtitleAr: "",
    bodyEn: "",
    bodyAr: "",
    ctaLabelEn: "",
    ctaLabelAr: "",
    ctaUrl: "",
    featuredProductId: "",
    imageUrl: "",
    visible: true,
  });

  const populateForm = (sec: StorefrontSectionRecord) => {
    setFormData({
      titleEn: sec.titleEn || "",
      titleAr: sec.titleAr || "",
      subtitleEn: sec.subtitleEn || "",
      subtitleAr: sec.subtitleAr || "",
      bodyEn: sec.bodyEn || "",
      bodyAr: sec.bodyAr || "",
      ctaLabelEn: sec.ctaLabelEn || "",
      ctaLabelAr: sec.ctaLabelAr || "",
      ctaUrl: sec.ctaUrl || "",
      featuredProductId: sec.featuredProductId || "",
      imageUrl: sec.imageUrl || "",
      visible: sec.visible,
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [secRes, prodRes] = await Promise.all([
          fetch("/api/admin/storefront"),
          fetch("/api/products"),
        ]);

        if (secRes.ok && isMounted) {
          const secData: StorefrontSectionRecord[] = await secRes.json();
          setSections(Array.isArray(secData) ? secData : []);

          if (secData.length > 0) {
            const first = secData[0];
            populateForm(first);
            setActiveTab(first.sectionKey);
          }
        }

        if (prodRes.ok && isMounted) {
          const prodData: Product[] = await prodRes.json();
          setProducts(Array.isArray(prodData) ? prodData : []);
        }
      } catch {
        if (isMounted) {
          setBanner({
            text: isAr ? "حدث خطأ أثناء تحميل البيانات." : "Failed to load storefront data.",
            type: "error",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isAr]);

  const handleSelectTab = (key: string) => {
    setActiveTab(key);
    setBanner(null);
    if (key !== "reorder") {
      const target = sections.find((s) => s.sectionKey === key);
      if (target) populateForm(target);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (activeTab === "reorder") return;
    setSaving(true);
    setBanner(null);

    try {
      const payload = {
        ...formData,
        status: publish ? "PUBLISHED" : "DRAFT",
      };

      const res = await fetch(`/api/admin/storefront/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBanner({
          text: data.error || (isAr ? "فشل حفظ التغييرات." : "Failed to save section."),
          type: "error",
        });
        return;
      }

      setSections((prev) =>
        prev.map((s) => (s.sectionKey === activeTab ? data.section : s))
      );

      const actionText = publish
        ? isAr
          ? "تم نشر التغييرات بنجاح!"
          : "Section published successfully!"
        : isAr
        ? "تم حفظ المسودة بنجاح."
        : "Draft saved successfully.";

      setBanner({ text: actionText, type: "success" });
    } catch {
      setBanner({
        text: isAr ? "حدث خطأ أثناء الاتصال بالخادم." : "Connection error while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);

    try {
      const keysOrder = newSections.map((s) => s.sectionKey);
      const res = await fetch("/api/admin/storefront/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keysOrder }),
      });

      const data = await res.json();
      if (res.ok && data.sections) {
        setSections(data.sections);
        setBanner({
          text: isAr ? "تم تحديث ترتيب الأقسام بنجاح." : "Section order updated successfully.",
          type: "success",
        });
      }
    } catch {
      setBanner({
        text: isAr ? "فشل تحديث الترتيب." : "Failed to update section order.",
        type: "error",
      });
    }
  };

  const currentSection = sections.find((s) => s.sectionKey === activeTab);

  const formatSectionLabel = (key: string) => {
    switch (key) {
      case "hero":
        return isAr ? "الواجهة الرئيسية (Hero)" : "Hero Section";
      case "story":
        return isAr ? "قصتنا (Our Story)" : "Our Story";
      case "featured_product":
        return isAr ? "المنتج المميز (Featured Product)" : "Featured Product";
      case "artwork":
        return isAr ? "اللوحة الفنية (Artwork)" : "Artwork";
      case "features":
        return isAr ? "المميزات (Craft & Details)" : "Craft & Details";
      default:
        return key.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
          {isAr ? "جاري تحميل إعدادات الواجهة..." : "Loading storefront CMS..."}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>{t("admin.storefront")}</h1>
        <a
          href="/admin/storefront/preview"
          style={{
            padding: "0.55rem 1.25rem",
            backgroundColor: "var(--color-foreground)",
            color: "var(--color-background)",
            borderRadius: "var(--radius-sm)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          🎨 {isAr ? "فتح المحرر البصري المباشر" : "Open Visual Editor"}
        </a>
      </div>

      {banner && (
        <div
          className={[
            styles.banner,
            banner.type === "success" ? styles.bannerSuccess : styles.bannerError,
          ].join(" ")}
        >
          {banner.text}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.sectionTabs}>
          {sections.map((sec) => (
            <button
              key={sec.sectionKey}
              type="button"
              onClick={() => handleSelectTab(sec.sectionKey)}
              className={[
                styles.tabBtn,
                activeTab === sec.sectionKey ? styles.tabActive : "",
              ].join(" ")}
            >
              {formatSectionLabel(sec.sectionKey)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelectTab("reorder")}
            className={[
              styles.tabBtn,
              activeTab === "reorder" ? styles.tabActive : "",
            ].join(" ")}
          >
            {t("admin.sectionOrder")}
          </button>
        </div>
      </div>

      {activeTab === "reorder" ? (
        <div className={styles.editorCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionName}>{t("admin.sectionOrder")}</h2>
          </div>
          <div className={styles.orderList}>
            {sections.map((sec, index) => (
              <div key={sec.sectionKey} className={styles.orderItem}>
                <div>
                  <span style={{ fontWeight: 700, marginRight: "0.75rem" }}>{index + 1}.</span>
                  <span style={{ fontWeight: 600 }}>{formatSectionLabel(sec.sectionKey)}</span>
                </div>
                <div className={styles.orderControls}>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(index, "up")}
                    disabled={index === 0}
                    className={styles.iconBtn}
                  >
                    ↑ {isAr ? "أعلى" : "Up"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(index, "down")}
                    disabled={index === sections.length - 1}
                    className={styles.iconBtn}
                  >
                    ↓ {isAr ? "أسفل" : "Down"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.editorCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionName}>
              {formatSectionLabel(activeTab)}
            </h2>
            {currentSection && (
              <div className={styles.metaWrap}>
                <span
                  className={[
                    styles.badge,
                    currentSection.status === "PUBLISHED"
                      ? styles.statusPublished
                      : styles.statusDraft,
                  ].join(" ")}
                >
                  {currentSection.status === "PUBLISHED"
                    ? isAr
                      ? "منشور"
                      : "PUBLISHED"
                    : isAr
                    ? "مسودة"
                    : "DRAFT"}
                </span>
                <span
                  className={[
                    styles.badge,
                    currentSection.visible ? styles.statusPublished : styles.statusHidden,
                  ].join(" ")}
                >
                  {currentSection.visible ? t("admin.sectionVisible") : t("admin.sectionHidden")}
                </span>
              </div>
            )}
          </div>

          <div className={styles.gridTwoCol}>
            {/* English Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
                ENGLISH CONTENT (LTR)
              </h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title (EN)</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
                  className={styles.input}
                  dir="ltr"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Subtitle (EN)</label>
                <input
                  type="text"
                  value={formData.subtitleEn}
                  onChange={(e) => setFormData((p) => ({ ...p, subtitleEn: e.target.value }))}
                  className={styles.input}
                  dir="ltr"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Body Content (EN)</label>
                <textarea
                  value={formData.bodyEn}
                  onChange={(e) => setFormData((p) => ({ ...p, bodyEn: e.target.value }))}
                  className={styles.textarea}
                  dir="ltr"
                />
              </div>
              {activeTab === "hero" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>CTA Button Text (EN)</label>
                  <input
                    type="text"
                    value={formData.ctaLabelEn}
                    onChange={(e) => setFormData((p) => ({ ...p, ctaLabelEn: e.target.value }))}
                    className={styles.input}
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* Arabic Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
                ARABIC CONTENT (RTL) — المحتوى العربي
              </h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>العنوان (AR)</label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData((p) => ({ ...p, titleAr: e.target.value }))}
                  className={styles.input}
                  dir="rtl"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>العنوان الفرعي (AR)</label>
                <input
                  type="text"
                  value={formData.subtitleAr}
                  onChange={(e) => setFormData((p) => ({ ...p, subtitleAr: e.target.value }))}
                  className={styles.input}
                  dir="rtl"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>نص الموضوع (AR)</label>
                <textarea
                  value={formData.bodyAr}
                  onChange={(e) => setFormData((p) => ({ ...p, bodyAr: e.target.value }))}
                  className={styles.textarea}
                  dir="rtl"
                />
              </div>
              {activeTab === "hero" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>نص زر الإجراء (AR)</label>
                  <input
                    type="text"
                    value={formData.ctaLabelAr}
                    onChange={(e) => setFormData((p) => ({ ...p, ctaLabelAr: e.target.value }))}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Special Section Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
            {(activeTab === "hero" || activeTab === "featured_product") && (
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("admin.featuredProductSelect")}</label>
                <select
                  value={formData.featuredProductId}
                  onChange={(e) => setFormData((p) => ({ ...p, featuredProductId: e.target.value }))}
                  className={styles.select}
                >
                  <option value="">{isAr ? "-- اختر منتجاً من قاعدة البيانات --" : "-- Select a product --"}</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {isAr ? prod.translations.ar.name : prod.translations.en.name} (${prod.price})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === "hero" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>CTA URL / Destination</label>
                <input
                  type="text"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, ctaUrl: e.target.value }))}
                  className={styles.input}
                  placeholder="#hoodie or /store"
                />
              </div>
            )}

            {(activeTab === "story" || activeTab === "artwork") && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Section Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                  className={styles.input}
                  placeholder="/images/story.jpg"
                />
              </div>
            )}

            <div className={styles.formGroup} style={{ marginTop: "0.5rem" }}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => setFormData((p) => ({ ...p, visible: e.target.checked }))}
                  className={styles.checkbox}
                />
                {isAr ? "إظهار هذا القسم في الصفحة الرئيسية للمتجر" : "Show this section publicly on the Landing Page"}
              </label>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className={styles.saveDraftBtn}
            >
              {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : t("admin.saveDraft")}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className={styles.publishBtn}
            >
              {saving ? (isAr ? "جاري النشر..." : "Publishing...") : t("admin.publish")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
