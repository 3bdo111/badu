import { serverStorefrontRepository, type StorefrontSectionRecord } from "@/lib/repositories/server-storefront-repository";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { Hero } from "@/components/home/Hero";
import { ProductIntro } from "@/components/home/ProductIntro";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { BrandStory } from "@/components/home/BrandStory";
import { ArtworkStory } from "@/components/home/ArtworkStory";
import { CraftFeatures } from "@/components/home/CraftFeatures";
import { PurchaseSection } from "@/components/home/PurchaseSection";
import { SizeGuide } from "@/components/home/SizeGuide";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";

export default function Home() {
  const publicSections = serverStorefrontRepository.getPublicSections();
  const allProducts = serverProductRepository.getVisible();

  const heroSection = publicSections.find((s) => s.sectionKey === "hero");
  const featuredProductSection = publicSections.find((s) => s.sectionKey === "featured_product");

  // Determine featured product from CMS or fallback to first visible product
  let featuredProduct = undefined;
  const targetProdId =
    featuredProductSection?.featuredProductId || heroSection?.featuredProductId;

  if (targetProdId) {
    featuredProduct = serverProductRepository.getById(targetProdId);
    if (featuredProduct && !featuredProduct.available) {
      featuredProduct = undefined;
    }
  }

  if (!featuredProduct && allProducts.length > 0) {
    featuredProduct = allProducts[0];
  }

  // Filter out hero for the body sections list since Hero is pinned at top
  const bodyCmsSections = publicSections.filter((s) => s.sectionKey !== "hero");

  const renderCmsSection = (sec: StorefrontSectionRecord) => {
    switch (sec.sectionKey) {
      case "story":
        return <BrandStory key="story" section={sec} />;
      case "artwork":
        return <ArtworkStory key="artwork" section={sec} />;
      case "features":
        return <CraftFeatures key="features" section={sec} />;
      case "featured_product":
        return (
          <PurchaseSection
            key="featured_product"
            section={sec}
            featuredProduct={featuredProduct}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {heroSection && <Hero section={heroSection} featuredProduct={featuredProduct} />}
      <ProductIntro />
      <ProductShowcase />
      {bodyCmsSections.map(renderCmsSection)}
      <SizeGuide />
      <Reviews />
      <Faq />
      <FinalCta />
    </>
  );
}
