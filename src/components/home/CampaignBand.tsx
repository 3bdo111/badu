"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./campaign-band.module.css";

/** Dark full-bleed campaign block: two campaign portraits and one statement. */
export function CampaignBand() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section className={styles.band} aria-labelledby="campaign-title">
      <div className={styles.grid}>
        <figure className={styles.figure}>
          <Image
            src="/images/campaign/2026/boy-black-back.jpg"
            alt={isAr ? "موديل لابس هودي بادو أسود" : "Model wearing the BADU hoodie in black"}
            fill
            sizes="(max-width: 64rem) 100vw, 30vw"
            className={styles.image}
          />
        </figure>

        <div className={styles.copy}>
          <p className={styles.label}>{t("hook.campaignLabel")}</p>
          <h2 id="campaign-title" className={styles.title}>
            {t("hook.campaignTitle")}
          </h2>
          <p className={styles.body}>{t("hook.campaignBody")}</p>
          <Link href="/store" className={styles.cta}>
            {t("hook.campaignCta")}
          </Link>
        </div>

        <figure className={styles.figure}>
          <Image
            src="/images/campaign/2026/girl-blue-street.jpg"
            alt={isAr ? "موديل لابسة هودي بادو أسود" : "Model wearing the BADU hoodie in black"}
            fill
            sizes="(max-width: 64rem) 100vw, 30vw"
            className={styles.image}
          />
        </figure>
      </div>
    </section>
  );
}
