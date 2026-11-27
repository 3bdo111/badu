import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Alexandria, Inter } from "next/font/google";
import { I18nProvider } from "@/i18n/I18nProvider";
import { dictionaries, defaultLocale } from "@/i18n/dictionaries";
import {
  directionFor,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/types";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { getSiteUrl, SITE_CONFIG } from "@/lib/config/site";
import "./globals.css";

// Display: Bricolage Grotesque — a modern editorial grotesque with a bit of
// grit; reads as streetwear rather than corporate. Latin only, so Arabic
// falls through to Alexandria below.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

// Alexandria — modern geometric Arabic, designed in Egypt. Carries display
// and body Arabic, and doubles as the Latin body fallback.
const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});



async function getInitialLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const meta = dictionaries[locale].meta;
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: meta.title,
      template: "%s — BADU",
    },
    description: meta.description,
    keywords: [
      "BADU",
      "BADU Store",
      "streetwear",
      "desert streetwear",
      "heavyweight hoodie",
      "oversized hoodie 350gsm",
      "arabic calligraphy hoodie",
      "بادو",
      "هودي بادو",
      "ملابس الشارع",
      "هودي واسع",
      "هودي 350GSM",
    ],
    authors: [{ name: "BADU" }],
    creator: "BADU",
    publisher: "BADU",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        en: siteUrl,
        ar: siteUrl,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: siteUrl,
      siteName: SITE_CONFIG.name,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: getSiteUrl("/images/products/badu-hoodie/front-v6.jpg"),
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      creator: SITE_CONFIG.twitterHandle,
      images: [getSiteUrl("/images/products/badu-hoodie/front-v6.jpg")],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getInitialLocale();
  const siteUrl = getSiteUrl();

  // JSON-LD Organization & Website Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BADU",
    "url": siteUrl,
    "logo": getSiteUrl("/images/products/badu-hoodie/front-v6.jpg"),
    "sameAs": [
      "https://instagram.com/badu.store",
      "https://tiktok.com/@badu.store",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BADU Store",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/store?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={locale}
      dir={directionFor(locale)}
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${alexandria.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider initialLocale={locale}>
          <CartProvider>
            <CartDrawer />
            <SkipLink />
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
