"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import type { Product } from "@/lib/types/product";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Hero } from "@/components/home/Hero";
import { BrandStory } from "@/components/home/BrandStory";
import { ArtworkStory } from "@/components/home/ArtworkStory";
import { CraftFeatures } from "@/components/home/CraftFeatures";
import { PurchaseSection } from "@/components/home/PurchaseSection";
import { ProductIntro } from "@/components/home/ProductIntro";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { SizeGuide } from "@/components/home/SizeGuide";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { MediaPickerModal } from "./MediaPickerModal";
import styles from "./visual-editor.module.css";

interface VisualEditorClientProps {
  initialSections: StorefrontSectionRecord[];
  products: Product[];
}

export function VisualEditorClient({
  initialSections,
  products,
}: VisualEditorClientProps) {
  const [sections, setSections] = useState<StorefrontSectionRecord[]>(initialSections);
  const [activeKey, setActiveKey] = useState<string>(
    initialSections[0]?.sectionKey || "hero"
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editorLocale, setEditorLocale] = useState<"en" | "ar">("en");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const activeSection = sections.find((s) => s.sectionKey === activeKey);

  const hasAnyUnsaved = sections.some((s) => s.hasUnsavedChanges || s.status === "DRAFT");

  const handleFieldChange = (field: keyof StorefrontSectionRecord, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionKey === activeKey) {
          return {
            ...s,
            [field]: value,
            hasUnsavedChanges: true,
            status: "DRAFT",
          };
        }
        return s;
      })
    );
  };

  const handleSaveDraft = async () => {
    if (!activeSection) return;
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetch(`/api/admin/storefront/${activeKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: activeSection.titleEn,
          titleAr: activeSection.titleAr,
          subtitleEn: activeSection.subtitleEn,
          subtitleAr: activeSection.subtitleAr,
          bodyEn: activeSection.bodyEn,
          bodyAr: activeSection.bodyAr,
          ctaLabelEn: activeSection.ctaLabelEn,
          ctaLabelAr: activeSection.ctaLabelAr,
          ctaUrl: activeSection.ctaUrl,
          featuredProductId: activeSection.featuredProductId,
          imageUrl: activeSection.imageUrl,
          visible: activeSection.visible,
          status: "DRAFT",
        }),
      });

      const data = await res.json();
      if (res.ok && data.section) {
        setSections((prev) =>
          prev.map((s) => (s.sectionKey === activeKey ? data.section : s))
        );
        setBanner({
          text: editorLocale === "ar" ? "تم حفظ المسودة بنجاح." : "Draft saved successfully.",
          type: "success",
        });
      } else {
        setBanner({
          text: data.error || (editorLocale === "ar" ? "فشل حفظ المسودة." : "Failed to save draft."),
          type: "error",
        });
      }
    } catch {
      setBanner({
        text: editorLocale === "ar" ? "حدث خطأ أثناء الاتصال بالخادم." : "Connection error while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishAll = async () => {
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetch("/api/admin/storefront/publish", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok && data.sections) {
        setSections(data.sections);
        setBanner({
          text: editorLocale === "ar" ? "تم نشر جميع التغييرات بنجاح!" : "All changes published successfully!",
          type: "success",
        });
      } else {
        setBanner({
          text: data.error || (editorLocale === "ar" ? "فشل نشر التغييرات." : "Failed to publish changes."),
          type: "error",
        });
      }
    } catch {
      setBanner({
        text: editorLocale === "ar" ? "حدث خطأ أثناء الاتصال بالخادم." : "Connection error while publishing.",
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
      }
    } catch {
      // Reorder failsafe
    }
  };

  const formatSectionLabel = (key: string) => {
    const isAr = editorLocale === "ar";
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

  // Determine featured product from CMS or fallback to first product
  const heroSec = sections.find((s) => s.sectionKey === "hero");
  const featSec = sections.find((s) => s.sectionKey === "featured_product");
  const targetProdId = featSec?.featuredProductId || heroSec?.featuredProductId;
  const activeFeaturedProd =
    products.find((p) => p.id === targetProdId) || products[0];

  const getCanvasWidth = () => {
    switch (viewport) {
      case "tablet":
        return "768px";
      case "mobile":
        return "390px";
      default:
        return "100%";
    }
  };

  return (
    <div className={styles.editorPage} dir={editorLocale === "ar" ? "rtl" : "ltr"}>
      {/* Top Bar Header */}
      <header className={styles.topBar}>
        <div className={styles.titleBlock}>
          <Link
            href="/admin/storefront"
            style={{ textDecoration: "none", color: "var(--color-muted)", fontSize: "0.85rem" }}
          >
            ← {editorLocale === "ar" ? "العودة" : "Back"}
          </Link>
          <h1 className={styles.pageTitle}>
            {editorLocale === "ar" ? "المحرر البصري للواجهة" : "Visual CMS Editor"}
          </h1>
          {hasAnyUnsaved && (
            <span className={styles.unsavedBadge}>
              {editorLocale === "ar" ? "تغييرات غير محفوظة" : "Unsaved changes"}
            </span>
          )}
        </div>

        <div className={styles.controlsGroup}>
          {/* Viewport Selector */}
          <div className={styles.toggleGroup} role="group" aria-label="Device viewports">
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewport === "desktop" ? styles.toggleBtnActive : ""}`}
              onClick={() => setViewport("desktop")}
            >
              🖥️ {editorLocale === "ar" ? "سطح المكتب" : "Desktop"}
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewport === "tablet" ? styles.toggleBtnActive : ""}`}
              onClick={() => setViewport("tablet")}
            >
              📱 {editorLocale === "ar" ? "تابلت" : "Tablet"}
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewport === "mobile" ? styles.toggleBtnActive : ""}`}
              onClick={() => setViewport("mobile")}
            >
              📲 {editorLocale === "ar" ? "جوال" : "Mobile"}
            </button>
          </div>

          {/* Locale Selector */}
          <div className={styles.toggleGroup} role="group" aria-label="Editor locale">
            <button
              type="button"
              className={`${styles.toggleBtn} ${editorLocale === "en" ? styles.toggleBtnActive : ""}`}
              onClick={() => setEditorLocale("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${editorLocale === "ar" ? styles.toggleBtnActive : ""}`}
              onClick={() => setEditorLocale("ar")}
            >
              عربي
            </button>
          </div>
        </div>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className={styles.saveDraftBtn}
          >
            {saving
              ? editorLocale === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : editorLocale === "ar"
              ? "حفظ مسودة"
              : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handlePublishAll}
            disabled={saving}
            className={styles.publishBtn}
          >
            {saving
              ? editorLocale === "ar"
                ? "جاري النشر..."
                : "Publishing..."
              : editorLocale === "ar"
              ? "نشر التغييرات"
              : "Publish Changes"}
          </button>
        </div>
      </header>

      {banner && (
        <div
          className={
            banner.type === "success" ? styles.bannerSuccess : styles.bannerError
          }
        >
          {banner.text}
        </div>
      )}

      {/* Main Split Layout */}
      <div className={styles.mainLayout}>
        {/* Left Sidebar (Editor Form) */}
        <aside className={styles.sidebar}>
          {/* Section Selection */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitle}>
                {editorLocale === "ar" ? "أقسام الصفحة" : "Page Sections"}
              </h2>
            </div>
            <div className={styles.sectionsList}>
              {sections.map((sec, index) => (
                <div
                  key={sec.sectionKey}
                  onClick={() => setActiveKey(sec.sectionKey)}
                  className={`${styles.sectionCard} ${
                    activeKey === sec.sectionKey ? styles.sectionCardActive : ""
                  }`}
                >
                  <span className={styles.sectionCardName}>
                    {formatSectionLabel(sec.sectionKey)}
                  </span>
                  <div className={styles.sectionControls}>
                    {!sec.visible && (
                      <span style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>
                        ({editorLocale === "ar" ? "مخفي" : "Hidden"})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(index, "up");
                      }}
                      disabled={index === 0}
                      className={styles.iconBtn}
                      aria-label="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(index, "down");
                      }}
                      disabled={index === sections.length - 1}
                      className={styles.iconBtn}
                      aria-label="Move Down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Section Editor */}
          {activeSection && (
            <div className={styles.sidebarSection}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: "1rem" }}>
                {editorLocale === "ar" ? "تعديل المحتوى" : "Edit Content"} — {formatSectionLabel(activeKey)}
              </h2>

              {/* Title Fields */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Title (EN)</label>
                <input
                  type="text"
                  value={activeSection.titleEn}
                  onChange={(e) => handleFieldChange("titleEn", e.target.value)}
                  className={styles.input}
                  dir="ltr"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>العنوان (AR)</label>
                <input
                  type="text"
                  value={activeSection.titleAr}
                  onChange={(e) => handleFieldChange("titleAr", e.target.value)}
                  className={styles.input}
                  dir="rtl"
                />
              </div>

              {/* Subtitle Fields */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Subtitle (EN)</label>
                <input
                  type="text"
                  value={activeSection.subtitleEn}
                  onChange={(e) => handleFieldChange("subtitleEn", e.target.value)}
                  className={styles.input}
                  dir="ltr"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>العنوان الفرعي (AR)</label>
                <input
                  type="text"
                  value={activeSection.subtitleAr}
                  onChange={(e) => handleFieldChange("subtitleAr", e.target.value)}
                  className={styles.input}
                  dir="rtl"
                />
              </div>

              {/* Body Content Fields */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Body Content (EN)</label>
                <textarea
                  value={activeSection.bodyEn}
                  onChange={(e) => handleFieldChange("bodyEn", e.target.value)}
                  className={styles.textarea}
                  dir="ltr"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>نص الموضوع (AR)</label>
                <textarea
                  value={activeSection.bodyAr}
                  onChange={(e) => handleFieldChange("bodyAr", e.target.value)}
                  className={styles.textarea}
                  dir="rtl"
                />
              </div>

              {/* CTA Fields */}
              {activeKey === "hero" && (
                <>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>CTA Button Text (EN)</label>
                    <input
                      type="text"
                      value={activeSection.ctaLabelEn}
                      onChange={(e) => handleFieldChange("ctaLabelEn", e.target.value)}
                      className={styles.input}
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>نص زر الإجراء (AR)</label>
                    <input
                      type="text"
                      value={activeSection.ctaLabelAr}
                      onChange={(e) => handleFieldChange("ctaLabelAr", e.target.value)}
                      className={styles.input}
                      dir="rtl"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>CTA Destination URL</label>
                    <input
                      type="text"
                      value={activeSection.ctaUrl}
                      onChange={(e) => handleFieldChange("ctaUrl", e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </>
              )}

              {/* Featured Product Dropdown */}
              {(activeKey === "hero" || activeKey === "featured_product") && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {editorLocale === "ar" ? "المنتج المميز" : "Featured Product"}
                  </label>
                  <select
                    value={activeSection.featuredProductId}
                    onChange={(e) => handleFieldChange("featuredProductId", e.target.value)}
                    className={styles.select}
                  >
                    <option value="">
                      {editorLocale === "ar"
                        ? "-- اختر منتجاً من قاعدة البيانات --"
                        : "-- Select a product --"}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {editorLocale === "ar" ? p.translations.ar.name : p.translations.en.name} (${p.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section Media Selector */}
              {(activeKey === "story" || activeKey === "artwork") && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {editorLocale === "ar" ? "صورة القسم" : "Section Image"}
                  </label>
                  <div className={styles.imagePicker}>
                    {activeSection.imageUrl ? (
                      <div className={styles.imagePreviewWrap}>
                        <Image
                          src={activeSection.imageUrl}
                          alt="Section preview"
                          fill
                          sizes="300px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-muted)",
                          fontSize: "0.85rem",
                          border: "1px dashed var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {editorLocale === "ar" ? "لم يتم تحديد صورة" : "No image selected"}
                      </div>
                    )}
                    <div className={styles.imageActions}>
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className={styles.pickerBtn}
                      >
                        📷 {editorLocale === "ar" ? "اختر / ارفع صورة" : "Select / Upload Image"}
                      </button>
                      {activeSection.imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange("imageUrl", "")}
                          className={styles.pickerBtn}
                          style={{ color: "#a4574a" }}
                        >
                          ✕ {editorLocale === "ar" ? "إزالة" : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Visibility Toggle */}
              <div className={styles.fieldGroup} style={{ marginTop: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={activeSection.visible}
                    onChange={(e) => handleFieldChange("visible", e.target.checked)}
                  />
                  <span>
                    {editorLocale === "ar"
                      ? "إظهار هذا القسم في الصفحة الرئيسية"
                      : "Show this section publicly on Landing Page"}
                  </span>
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* Right Canvas (Live Landing Page Preview) */}
        <main className={styles.canvasArea}>
          <div
            className={styles.canvasFrame}
            style={{ width: getCanvasWidth() }}
            dir={editorLocale === "ar" ? "rtl" : "ltr"}
          >
            <I18nProvider initialLocale={editorLocale}>
              {sections
                .filter((s) => s.visible)
                .map((sec) => {
                  const isActive = activeKey === sec.sectionKey;
                  const secWrapperClass = `${styles.previewSectionWrap} ${
                    isActive ? styles.previewSectionWrapActive : ""
                  }`;

                  switch (sec.sectionKey) {
                    case "hero":
                      return (
                        <div key="hero" className={secWrapperClass} onClick={() => setActiveKey("hero")}>
                          <Hero section={sec} featuredProduct={activeFeaturedProd} />
                          <ProductIntro />
                          <ProductShowcase />
                        </div>
                      );
                    case "story":
                      return (
                        <div key="story" className={secWrapperClass} onClick={() => setActiveKey("story")}>
                          <BrandStory section={sec} />
                        </div>
                      );
                    case "artwork":
                      return (
                        <div key="artwork" className={secWrapperClass} onClick={() => setActiveKey("artwork")}>
                          <ArtworkStory section={sec} />
                        </div>
                      );
                    case "features":
                      return (
                        <div key="features" className={secWrapperClass} onClick={() => setActiveKey("features")}>
                          <CraftFeatures section={sec} />
                        </div>
                      );
                    case "featured_product":
                      return (
                        <div key="featured_product" className={secWrapperClass} onClick={() => setActiveKey("featured_product")}>
                          <PurchaseSection section={sec} featuredProduct={activeFeaturedProd} />
                        </div>
                      );
                    default:
                      return null;
                  }
                })}

              <SizeGuide />
              <Reviews />
              <Faq />
              <FinalCta />
            </I18nProvider>
          </div>
        </main>
      </div>

      {/* Media Library & Upload Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url) => handleFieldChange("imageUrl", url)}
        isAr={editorLocale === "ar"}
      />
    </div>
  );
}
