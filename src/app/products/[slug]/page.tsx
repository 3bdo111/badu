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
  const nameAr = product.seo?.title?.ar || productName(product, "ar");
  const descEn = product.seo?.metaDescription?.en || productDescription(product, "en");
  const descAr = product.seo?.metaDescription?.ar || productDescription(product, "ar");

  const canonicalUrl = product.seo?.canonicalOverride || getSiteUrl(`/products/${product.slug}`);
  const primaryImage = product.seo?.ogImage || (product.images[0]?.src ? getSiteUrl(product.images[0].src) : undefined);

  return {
    title: `${nameEn} (${nameAr}) — BADU`,
    description: `${descEn} | ${descAr}`,
    keywords: [
      nameEn,
      nameAr,
      "BADU Hoodie",
      "heavyweight hoodie 480gsm",
      "oversized hoodie",
      "arabic embroidery hoodie",
      "بادو هودي",
    ],
    robots: {
      index: isIndexable,
      follow: isIndexable,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
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

  const siteUrl = getSiteUrl();
  const productUrl = getSiteUrl(`/products/${resolvedParams.slug}`);

  // Rich Product JSON-LD Schema for Google Shopping & Rich Snippets
  const productSchema = product && product.available ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName(product, "en"),
    "description": productDescription(product, "en"),
    "sku": product.id,
    "mpn": product.slug,
    "brand": {
      "@type": "Brand",
      "name": "BADU",
    },
    "image": product.images.map((img) => getSiteUrl(img.src)),
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": product.currency || "USD",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "BADU",
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "EG",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": product.currency || "USD",
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "EG",
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY",
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 4,
            "unitCode": "DAY",
          },
        },
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1280",
    },
  } : null;

  // BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = product ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Store",
        "item": `${siteUrl}/store`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productName(product, "en"),
        "item": productUrl,
      },
    ],
  } : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ProductDetailClient
        slug={resolvedParams.slug}
        initialProduct={product}
      />
    </>
  );
}
