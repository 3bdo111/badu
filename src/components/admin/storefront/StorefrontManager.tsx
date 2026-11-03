"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import type { Product } from "@/lib/types/product";
import { SectionSidebar } from "./SectionSidebar";
import { SectionForm } from "./SectionForm";
import { ReorderPanel } from "./ReorderPanel";
import type { SectionFormData } from "./types";
import { isDirty } from "./types";
import styles from "./storefront-manager.module.css";

export function StorefrontManager() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [sections, setSections] = useState<StorefrontSectionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [mode, setMode] = useState<"edit" | "reorder">("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingAll, setPublishingAll] = useState(false);
  const [banner, setBanner] = useState<{ text: string; textAr: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState<SectionFormData | null>(null);
  const [formDirty, setFormDirty] = useState(false);

  const showBanner = (text: string, textAr: string, type: "success" | "error") =>
    setBanner({ text, textAr, type });

  // Banner auto-dismiss
  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [secRes, prodRes] = await Promise.all([
          fetch("/api/admin/storefront"),
          fetch("/api/products"),
        ]);
        if (!isMounted) return;
        if (secRes.ok) {
          const secData: StorefrontSectionRecord[] = await secRes.json();
          const list = Array.isArray(secData) ? secData : [];
          setSections(list);
          if (list.length > 0) {
            setActiveKey(list[0].sectionKey);
            setFormData(toFormData(list[0]));
          }
        }
        if (prodRes.ok) {
          const prodData: Product[] = await prodRes.json();
          setProducts(Array.isArray(prodData) ? prodData : []);
        }
      } catch {
        if (isMounted) showBanner("Failed to load storefront data.", "حدث خطأ أثناء تحميل البيانات.", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
     
  }, []);

  const activeSection = sections.find((s) => s.sectionKey === activeKey);

  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null);

  const doSwitch = (key: string) => {
    const target = sections.find((s) => s.sectionKey === key);
    if (!target) return;
    setActiveKey(key);
    setFormData(toFormData(target));
    setFormDirty(false);
    setMode("edit");
  };

  const handleSelect = (key: string) => {
    if (key === activeKey) return;
    if (formDirty) {
      // Defer to the in-page confirm dialog (native confirm misbehaves in
      // embedded browsers).
      setPendingSwitch(key);
      return;
    }
    doSwitch(key);
  };

  const updateField = <K extends keyof SectionFormData>(field: K, value: SectionFormData[K]) => {
    setFormData((p) => (p ? { ...p, [field]: value } : p));
    setFormDirty(true);
  };

  const handleSaved = (updated: StorefrontSectionRecord, published: boolean) => {
    setSections((prev) => prev.map((s) => (s.sectionKey === updated.sectionKey ? updated : s)));
    setFormDirty(false);
    showBanner(
      published ? "Section published successfully!" : "Draft saved successfully.",
      published ? "تم نشر القسم بنجاح!" : "تم حفظ المسودة بنجاح.",
      "success"
    );
  };

  const handlePublishAll = async () => {
    setPublishingAll(true);
    try {
      const res = await fetch("/api/admin/storefront/publish", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.sections) {
        setSections(data.sections);
        const current = data.sections.find((s: StorefrontSectionRecord) => s.sectionKey === activeKey);
        if (current) setFormData(toFormData(current));
        setFormDirty(false);
        showBanner("All sections published!", "تم نشر جميع الأقسام!", "success");
      } else {
        showBanner(data.error || "Failed to publish.", "فشل النشر.", "error");
      }
    } catch {
      showBanner("Connection error while publishing.", "خطأ في الاتصال أثناء النشر.", "error");
    } finally {
      setPublishingAll(false);
    }
  };

  const handleReordered = (list: StorefrontSectionRecord[]) => {
    setSections(list);
    showBanner("Section order updated.", "تم تحديث ترتيب الأقسام.", "success");
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
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
      if (res.ok && data.sections) handleReordered(data.sections);
    } catch {
      showBanner("Failed to update section order.", "فشل تحديث الترتيب.", "error");
    }
  };

  const pendingCount = sections.filter(isDirty).length;

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        {isAr ? "جاري تحميل إعدادات الواجهة…" : "Loading storefront settings…"}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitleBlock}>
          <h1 className={styles.pageTitle}>
            {isAr ? "إدارة الواجهة (اللاندينج)" : "Storefront CMS"}
          </h1>
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>
              {pendingCount} {isAr ? "قيد الانتظار" : "pending"}
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          <a href="/admin/storefront/preview" className={styles.visualEditorLink}>
            🎨 {isAr ? "المحرر البصري" : "Visual Editor"}
          </a>
          <button
            type="button"
            onClick={handlePublishAll}
            disabled={publishingAll || pendingCount === 0}
            className={styles.publishAllBtn}
          >
            {publishingAll
              ? isAr
                ? "جاري النشر…"
                : "Publishing…"
              : isAr
                ? `نشر الكل${pendingCount > 0 ? ` (${pendingCount})` : ""}`
                : `Publish All${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
          </button>
        </div>
      </header>

      {banner && (
        <div
          role="status"
          className={banner.type === "success" ? styles.bannerSuccess : styles.bannerError}
        >
          {isAr ? banner.textAr : banner.text}
        </div>
      )}

      <div className={styles.mainLayout}>
        <SectionSidebar
          sections={sections}
          activeKey={activeKey}
          mode={mode}
          onSelect={handleSelect}
          onModeChange={setMode}
        />

        <main className={styles.content}>
          {mode === "reorder" ? (
            <ReorderPanel sections={sections} onMove={handleMove} />
          ) : activeSection && formData ? (
            <SectionForm
              key={activeSection.sectionKey}
              section={activeSection}
              formData={formData}
              products={products}
              isDirty={formDirty}
              saving={saving}
              onChange={updateField}
              onSaved={handleSaved}
              onSavingChange={setSaving}
              onError={(msg, msgAr) => showBanner(msg, msgAr, "error")}
            />
          ) : (
            <div className={styles.emptyState}>
              {isAr ? "اختر قسماً من القائمة للبدء." : "Select a section from the list to start editing."}
            </div>
          )}
        </main>
      </div>

      {pendingSwitch && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>
              {isAr ? "تغييرات غير محفوظة" : "Unsaved changes"}
            </h3>
            <p className={styles.modalBody}>
              {isAr
                ? "لديك تغييرات غير محفوظة في هذا القسم. التبديل إلى قسم آخر سيؤدي لفقدانها."
                : "You have unsaved changes in this section. Switching to another section will discard them."}
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setPendingSwitch(null)}
                className={styles.modalBtnSecondary}
              >
                {isAr ? "البقاء والتحرير" : "Keep editing"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingSwitch;
                  setPendingSwitch(null);
                  doSwitch(target);
                }}
                className={styles.modalBtnDanger}
              >
                {isAr ? "مغادرة وفقدان التغييرات" : "Discard & leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toFormData(sec: StorefrontSectionRecord): SectionFormData {
  return {
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
  };
}
