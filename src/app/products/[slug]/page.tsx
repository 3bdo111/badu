import type { Metadata } from "next";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { productName, productDescription } from "@/lib/types/product";
import { getSiteUrl } from "@/lib/config/site";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await serverProductRepository.getBySlug(resolvedParams.slug);

  const isPublished = product && (!product.status || product.status === "PUBLISHED");
  const isIndexable = product?.seo?.indexable !== false;

  if (!product || !product.available || !isPublished) {
    return {
      title: "Product Not Found",
      description: "The requested product is not available.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const nameEn = product.seo?.title?.en || productName(product, "en");
  const descEn = product.seo?.metaDescription?.en || productDescription(product, "en");
  const canonicalUrl = product.seo?.canonicalOverride || getSiteUrl(`/products/${product.slug}`);
  const primaryImage = product.seo?.ogImage || (product.images[0]?.src ? getSiteUrl(product.images[0].src) : undefined);

  return {
    title: `${nameEn} — BADU`,
    description: descEn,
    robots: {
      index: isIndexable,
      follow: isIndexable,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${nameEn} — BADU`,
      description: descEn,
      url: canonicalUrl,
      type: "website",
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 1200,
              height: 630,
              alt: nameEn,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${nameEn} — BADU`,
      description: descEn,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await serverProductRepository.getBySlug(resolvedParams.slug);

  const jsonLd = product && product.available ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName(product, "en"),
    "description": productDescription(product, "en"),
    "image": product.images.map((img) => getSiteUrl(img.src)),
    "offers": {
      "@type": "Offer",
      "priceCurrency": product.currency || "USD",
      "price": product.price,
      "availability": product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": getSiteUrl(`/products/${product.slug}`),
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient
        slug={resolvedParams.slug}
        initialProduct={product}
      />
    </>
  );
}
