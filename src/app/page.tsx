import { serverStorefrontRepository, type StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import type { Product } from "@/lib/types/product";
import { HookHero } from "@/components/home/HookHero";
import { Marquee } from "@/components/home/Marquee";
import { CampaignBand } from "@/components/home/CampaignBand";
import { QuickTrustBar } from "@/components/home/QuickTrustBar";
import { ProductIntro } from "@/components/home/ProductIntro";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { FeaturedProductsGrid } from "@/components/home/FeaturedProductsGrid";
import { BrandStory } from "@/components/home/BrandStory";
import { ArtworkStory } from "@/components/home/ArtworkStory";
import { PurchaseSection } from "@/components/home/PurchaseSection";
import { CraftFeatures } from "@/components/home/CraftFeatures";
import { SizeGuide } from "@/components/home/SizeGuide";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";

/**
 * Landing page — every section is rendered from the CMS `storefront_sections`
 * table (published + visible, in admin-controlled order). The admin
 * storefront editor controls each section's content, visibility and order.
 */
export default async function Home() {
  let publicSections: StorefrontSectionRecord[] = [];
  let allProducts: Product[] = [];

  try {
    publicSections = await serverStorefrontRepository.getPublicSections();
    allProducts = await serverProductRepository.getVisible();
  } catch (error) {
    console.error("[Home Page] Error fetching storefront data:", error);
  }

  const heroSection = publicSections.find((s) => s.sectionKey === "hero");
  const featuredProductSection = publicSections.find((s) => s.sectionKey === "featured_product");

  // Determine featured product from CMS or fallback to first visible product
  let featuredProduct = undefined;
  const targetProdId =
    featuredProductSection?.featuredProductId || heroSection?.featuredProductId;

  if (targetProdId) {
    try {
      featuredProduct = await serverProductRepository.getById(targetProdId);
      if (featuredProduct && !featuredProduct.available) {
        featuredProduct = undefined;
      }
    } catch {
      featuredProduct = undefined;
    }
  }

  if (!featuredProduct && allProducts.length > 0) {
    featuredProduct = allProducts[0];
  }

  const renderSection = (sec: StorefrontSectionRecord) => {
    switch (sec.sectionKey) {
      case "hero":
        return (
          <div key="hero">
            <HookHero featuredProduct={featuredProduct} />
            <Marquee />
          </div>
        );
      case "trust_bar":
        return <QuickTrustBar key="trust_bar" section={sec} />;
      case "product_intro":
        return <ProductIntro key="product_intro" section={sec} />;
      case "product_showcase":
        return <ProductShowcase key="product_showcase" section={sec} />;
      case "product_grid":
        return <FeaturedProductsGrid key="product_grid" section={sec} products={allProducts} />;
      case "story":
        return <BrandStory key="story" section={sec} />;
      case "artwork":
        return <ArtworkStory key="artwork" section={sec} />;
      case "campaign":
        return <CampaignBand key="campaign" />;
      case "featured_product":
        return (
          <PurchaseSection
            key="featured_product"
            section={sec}
            featuredProduct={featuredProduct}
          />
        );
      case "features":
        return <CraftFeatures key="features" section={sec} />;
      case "size_guide":
        return <SizeGuide key="size_guide" section={sec} />;
      case "reviews":
        return <Reviews key="reviews" section={sec} />;
      case "faq":
        return <Faq key="faq" section={sec} />;
      case "final_cta":
        return <FinalCta key="final_cta" section={sec} featuredProduct={featuredProduct} />;
      default:
        return null;
    }
  };

  // Fallback (e.g. database unavailable): render the canonical sections so
  // the storefront never comes up blank.
  if (publicSections.length === 0) {
    return (
      <>
        <HookHero featuredProduct={featuredProduct} />
        <Marquee />
        <QuickTrustBar />
        <ProductIntro />
        <ProductShowcase />
        <BrandStory />
        <ArtworkStory />
        <PurchaseSection featuredProduct={featuredProduct} />
        <CraftFeatures />
        <SizeGuide />
        <Reviews />
        <Faq />
        <FinalCta featuredProduct={featuredProduct} />
      </>
    );
  }

  // Editorial running order. The CMS still owns each section's content and
  // visibility; the sequence below is the designed narrative.
  // Short narrative: hook, guarantees, the two products, one campaign beat,
  // the story, questions, closing call. Everything else lives on the product
  // page, so the home page never repeats the buy panel.
  const ORDER = [
    "hero",
    "trust_bar",
    "product_grid",
    "campaign",
    "story",
    "faq",
    "final_cta",
  ];
  const ordered = publicSections
    .filter((section) => ORDER.includes(section.sectionKey))
    .sort((a, b) => {
    const ai = ORDER.indexOf(a.sectionKey);
    const bi = ORDER.indexOf(b.sectionKey);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

  return <>{ordered.map(renderSection)}</>;
}
