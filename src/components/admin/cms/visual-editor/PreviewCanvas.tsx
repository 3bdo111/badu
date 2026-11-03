"use client";

import type { RefCallback } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import type { Product } from "@/lib/types/product";
import { Hero } from "@/components/home/Hero";
import { BrandStory } from "@/components/home/BrandStory";
import { ArtworkStory } from "@/components/home/ArtworkStory";
import { CraftFeatures } from "@/components/home/CraftFeatures";
import { PurchaseSection } from "@/components/home/PurchaseSection";
import { ProductIntro } from "@/components/home/ProductIntro";
import { QuickTrustBar } from "@/components/home/QuickTrustBar";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { FeaturedProductsGrid } from "@/components/home/FeaturedProductsGrid";
import { LifestyleCampaign } from "@/components/home/LifestyleCampaign";
import { SizeGuide } from "@/components/home/SizeGuide";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import type { EditorLocale, Viewport } from "./types";
import { formatSectionLabel } from "./SectionListPanel";
import styles from "./visual-editor.module.css";

interface PreviewCanvasProps {
  sections: StorefrontSectionRecord[];
  activeKey: string;
  locale: EditorLocale;
  viewport: Viewport;
  products: Product[];
  activeFeaturedProd?: Product;
  onSelect: (sectionKey: string) => void;
  setSectionRef: (sectionKey: string) => RefCallback<HTMLDivElement>;
}

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function PreviewCanvas({
  sections,
  activeKey,
  locale,
  viewport,
  products,
  activeFeaturedProd,
  onSelect,
  setSectionRef,
}: PreviewCanvasProps) {
  const visibleSections = sections.filter((s) => s.visible);

  const renderPreviewSection = (sec: StorefrontSectionRecord) => {
    switch (sec.sectionKey) {
      case "hero":
        return <Hero section={sec} featuredProduct={activeFeaturedProd} />;
      case "trust_bar":
        return <QuickTrustBar section={sec} />;
      case "product_intro":
        return <ProductIntro section={sec} />;
      case "product_showcase":
        return <ProductShowcase section={sec} />;
      case "product_grid":
        return <FeaturedProductsGrid section={sec} products={products} />;
      case "story":
        return <BrandStory section={sec} />;
      case "artwork":
        return <ArtworkStory section={sec} />;
      case "campaign":
        return <LifestyleCampaign section={sec} />;
      case "featured_product":
        return <PurchaseSection section={sec} featuredProduct={activeFeaturedProd} />;
      case "features":
        return <CraftFeatures section={sec} />;
      case "size_guide":
        return <SizeGuide section={sec} />;
      case "reviews":
        return <Reviews section={sec} />;
      case "faq":
        return <Faq section={sec} />;
      case "final_cta":
        return <FinalCta section={sec} featuredProduct={activeFeaturedProd} />;
      default:
        return null;
    }
  };

  return (
    <main className={styles.canvasArea}>
      {viewport !== "desktop" && (
        <div className={styles.deviceBar} dir={locale === "ar" ? "rtl" : "ltr"}>
          <span className={styles.deviceBarDot} aria-hidden="true" />
          {viewport === "tablet" ? "768px" : "390px"} —{" "}
          {viewport === "tablet"
            ? locale === "ar"
              ? "تابلت"
              : "Tablet"
            : locale === "ar"
              ? "جوال"
              : "Mobile"}
        </div>
      )}

      <div
        className={`${styles.canvasFrame} ${viewport !== "desktop" ? styles.canvasFrameDevice : ""}`}
        style={{ width: VIEWPORT_WIDTHS[viewport] }}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <I18nProvider initialLocale={locale}>
          {visibleSections.map((sec) => {
            const isActive = activeKey === sec.sectionKey;
            return (
              <div
                key={sec.sectionKey}
                ref={setSectionRef(sec.sectionKey)}
                data-section-key={sec.sectionKey}
                className={`${styles.previewSectionWrap} ${isActive ? styles.previewSectionWrapActive : ""}`}
                onClick={() => onSelect(sec.sectionKey)}
              >
                <span className={styles.sectionTag} aria-hidden="true">
                  {formatSectionLabel(sec.sectionKey, locale)}
                </span>
                {renderPreviewSection(sec)}
              </div>
            );
          })}
        </I18nProvider>
      </div>
    </main>
  );
}
