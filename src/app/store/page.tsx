import type { Metadata } from "next";
import { cookies } from "next/headers";
import { serverProductRepository } from "@/lib/repositories/server-product-repository";
import { dictionaries, defaultLocale } from "@/i18n/dictionaries";
import { LOCALE_COOKIE, type Locale } from "@/i18n/types";
import { Container } from "@/components/ui/Container";
import { StoreClient } from "@/components/store/StoreClient";
import styles from "./store.module.css";

export const metadata: Metadata = {
  title: "The Collection — BADU Store",
  description: "Explore BADU desert-inspired streetwear. Modern silhouettes crafted with intention.",
  robots: {
    index: true,
    follow: true,
  },
};

function isLocale(val?: string): val is Locale {
  return val === "en" || val === "ar";
}

export default async function StorePage() {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = dictionaries[locale];

  const products = serverProductRepository.getVisible();

  return (
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
  );
}
