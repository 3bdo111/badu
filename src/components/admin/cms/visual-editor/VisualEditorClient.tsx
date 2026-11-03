"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import type { Product } from "@/lib/types/product";
import { MediaPickerModal } from "../MediaPickerModal";
import { EditorTopBar } from "./EditorTopBar";
import { SectionListPanel } from "./SectionListPanel";
import { SectionEditorPanel } from "./SectionEditorPanel";
import { PreviewCanvas } from "./PreviewCanvas";
import type { Banner, EditorLocale, SectionField, Viewport } from "./types";
import { dirtyCount, isSectionDirty } from "./types";
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
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [editorLocale, setEditorLocale] = useState<EditorLocale>("en");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  // Last server-known snapshot per section — the baseline for "Reset".
  const baselineRef = useRef<Map<string, StorefrontSectionRecord>>(
    new Map(initialSections.map((s) => [s.sectionKey, s]))
  );
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  const activeSection = sections.find((s) => s.sectionKey === activeKey);
  const pendingCount = dirtyCount(sections);
  const hasAnyUnsaved = pendingCount > 0;

  const setSectionRef = useCallback(
    (sectionKey: string) => (el: HTMLDivElement | null) => {
      if (el) sectionRefs.current.set(sectionKey, el);
      else sectionRefs.current.delete(sectionKey);
    },
    []
  );

  const updateSection = useCallback(
    (sectionKey: string, field: SectionField, value: unknown) => {
      setSections((prev) =>
        prev.map((s) =>
          s.sectionKey === sectionKey
            ? { ...s, [field]: value, hasUnsavedChanges: true, status: "DRAFT" as const }
            : s
        )
      );
    },
    []
  );

  /** Select a section and bring it into view in the canvas. */
  const handleSelectFromList = useCallback((sectionKey: string) => {
    setActiveKey(sectionKey);
    requestAnimationFrame(() => {
      sectionRefs.current
        .get(sectionKey)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  /** Select from a canvas click — no scrolling needed. */
  const handleSelectFromCanvas = useCallback((sectionKey: string) => {
    setActiveKey(sectionKey);
  }, []);

  const syncBaseline = useCallback((list: StorefrontSectionRecord[]) => {
    const map = new Map(baselineRef.current);
    list.forEach((s) => map.set(s.sectionKey, s));
    baselineRef.current = map;
  }, []);

  // Banner auto-dismiss
  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  // Guard internal navigation while there are unsaved changes.
  // (A beforeunload handler would silently block navigation in embedded
  // browsers, so we intercept in-page link clicks instead.)
  useEffect(() => {
    if (!hasAnyUnsaved) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/")) return; // external links unaffected
      e.preventDefault();
      e.stopPropagation();
      const ok = window.confirm(
        editorLocale === "ar"
          ? "لديك تغييرات غير منشورة. هل تريد المغادرة دون حفظ؟"
          : "You have unpublished changes. Leave without saving?"
      );
      if (ok) window.location.href = href;
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [hasAnyUnsaved, editorLocale]);

  const handleSaveDraft = useCallback(async () => {
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
        syncBaseline([data.section]);
        setBanner({
          text: editorLocale === "ar" ? "تم حفظ المسودة بنجاح." : "Draft saved successfully.",
          type: "success",
        });
      } else {
        setBanner({
          text:
            data.error ||
            (editorLocale === "ar" ? "فشل حفظ المسودة." : "Failed to save draft."),
          type: "error",
        });
      }
    } catch {
      setBanner({
        text:
          editorLocale === "ar"
            ? "حدث خطأ أثناء الاتصال بالخادم."
            : "Connection error while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [activeSection, activeKey, editorLocale, syncBaseline]);

  // Ctrl/Cmd+S saves the active section's draft
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeSection && isSectionDirty(activeSection) && !saving) {
          handleSaveDraft();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeSection, saving, handleSaveDraft]);

  const handlePublishAll = useCallback(async () => {
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetch("/api/admin/storefront/publish", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.sections) {
        setSections(data.sections);
        syncBaseline(data.sections);
        setBanner({
          text:
            editorLocale === "ar"
              ? "تم نشر جميع التغييرات بنجاح!"
              : "All changes published successfully!",
          type: "success",
        });
      } else {
        setBanner({
          text:
            data.error ||
            (editorLocale === "ar" ? "فشل نشر التغييرات." : "Failed to publish changes."),
          type: "error",
        });
      }
    } catch {
      setBanner({
        text:
          editorLocale === "ar"
            ? "حدث خطأ أثناء الاتصال بالخادم."
            : "Connection error while publishing.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [editorLocale, syncBaseline]);

  const handleMoveSection = useCallback(
    async (index: number, direction: "up" | "down") => {
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
          syncBaseline(data.sections);
        }
      } catch {
        // Reorder failsafe: local order is already updated.
      }
    },
    [sections, syncBaseline]
  );

  const handleToggleVisible = useCallback(
    (sectionKey: string) => {
      const sec = sections.find((s) => s.sectionKey === sectionKey);
      if (!sec) return;
      updateSection(sectionKey, "visible", !sec.visible);
    },
    [sections, updateSection]
  );

  const handleResetSection = useCallback(() => {
    const baseline = baselineRef.current.get(activeKey);
    if (!baseline) return;
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === activeKey ? baseline : s))
    );
  }, [activeKey]);

  // Determine featured product from CMS or fallback to first product
  const activeFeaturedProd = useMemo(() => {
    const heroSec = sections.find((s) => s.sectionKey === "hero");
    const featSec = sections.find((s) => s.sectionKey === "featured_product");
    const targetProdId = featSec?.featuredProductId || heroSec?.featuredProductId;
    return products.find((p) => p.id === targetProdId) || products[0];
  }, [sections, products]);

  return (
    <div className={styles.editorPage} dir={editorLocale === "ar" ? "rtl" : "ltr"}>
      <EditorTopBar
        locale={editorLocale}
        viewport={viewport}
        pendingCount={pendingCount}
        saving={saving}
        canSave={activeSection ? isSectionDirty(activeSection) : false}
        onViewportChange={setViewport}
        onLocaleChange={setEditorLocale}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublishAll}
      />

      {banner && (
        <div
          role="status"
          className={banner.type === "success" ? styles.bannerSuccess : styles.bannerError}
        >
          {banner.text}
        </div>
      )}

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <SectionListPanel
            sections={sections}
            activeKey={activeKey}
            locale={editorLocale}
            onSelect={handleSelectFromList}
            onMove={handleMoveSection}
            onToggleVisible={handleToggleVisible}
          />

          {activeSection && (
            <SectionEditorPanel
              section={activeSection}
              locale={editorLocale}
              products={products}
              isDirty={isSectionDirty(activeSection)}
              onFieldChange={(field, value) => updateSection(activeKey, field, value)}
              onOpenMediaPicker={() => setIsMediaModalOpen(true)}
              onReset={handleResetSection}
            />
          )}
        </aside>

        <PreviewCanvas
          sections={sections}
          activeKey={activeKey}
          locale={editorLocale}
          viewport={viewport}
          products={products}
          activeFeaturedProd={activeFeaturedProd}
          onSelect={handleSelectFromCanvas}
          setSectionRef={setSectionRef}
        />
      </div>

      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url) => updateSection(activeKey, "imageUrl", url)}
        isAr={editorLocale === "ar"}
      />
    </div>
  );
}
