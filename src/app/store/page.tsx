import type { Metadata } from "next";
import { cookies } from "next/headers";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { dictionaries, defaultLocale } from "@/i18n/dictionaries";
import { LOCALE_COOKIE, type Locale } from "@/i18n/types";
import { getSiteUrl, SITE_CONFIG } from "@/lib/config/site";
import { Container } from "@/components/ui/Container";
import { StoreClient } from "@/components/store/StoreClient";
import styles from "./store.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = rawLocale === "ar" ? "ar" : "en";
  const siteUrl = getSiteUrl();
  const storeUrl = getSiteUrl("/store");

  const title = locale === "ar" ? "كتالوج متجر بادو — BADU Store" : "The Collection — BADU Store";
  const description =
    locale === "ar"
      ? "اكتشف تشكيلة ملابس الشارع من بادو. هودي قطن عضوي 480GSM بقصة واسعة وتطريز عربي فاخر عالي الكثافة."
      : "Explore BADU desert-inspired streetwear collection. Heavyweight 480GSM organic cotton hoodies with high-density embroidery.";

  return {
    title,
    description,
    keywords: [
      "BADU collection",
      "BADU store",
      "heavyweight hoodie",
      "oversized hoodie 480gsm",
      "متجر بادو",
      "هودي بادو",
      "كتالوج بادو",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    alternates: {
      canonical: storeUrl,
    },
    openGraph: {
      title,
      description,
      url: storeUrl,
      siteName: SITE_CONFIG.name,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: getSiteUrl("/images/products/badu-hoodie/front-v6.jpg"),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getSiteUrl("/images/products/badu-hoodie/front-v6.jpg")],
    },
  };
}

function isLocale(val?: string): val is Locale {
  return val === "en" || val === "ar";
}

export default async function StorePage() {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = dictionaries[locale];

  const products = await serverProductRepository.getVisible();
  const storeUrl = getSiteUrl("/store");

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": dict.store.title,
    "description": dict.store.subtitle,
    "url": storeUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": getSiteUrl(`/products/${p.slug}`),
        "name": p.translations[locale]?.name || p.translations.en.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className={styles.page}>
        <Container>
          <div className={styles.header}>
            <p className="label">{dict.cart.label}</p>
            <h1 className={styles.title}>{dict.store.title}</h1>
            <p className={styles.subtitle}>{dict.store.subtitle}</p>
          </div>

          <StoreClient products={products} locale={locale} dict={dict} />
        </Container>
      </div>
    </>
  );
}
