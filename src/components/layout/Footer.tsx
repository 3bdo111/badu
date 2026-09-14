"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./footer.module.css";

interface DynamicFooterLink {
  id: string;
  label: { en: string; ar: string };
  url: string;
}

interface DynamicFooterGroup {
  id: string;
  title: { en: string; ar: string };
  links: DynamicFooterLink[];
}

interface DynamicSocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
}

const DEFAULT_GROUPS: DynamicFooterGroup[] = [
  {
    id: "explore",
    title: { en: "EXPLORE", ar: "استكشف" },
    links: [
      { id: "store", label: { en: "Store", ar: "المتجر" }, url: "/store" },
      { id: "story", label: { en: "Our Story", ar: "قصتنا" }, url: "/#story" },
      { id: "artwork", label: { en: "Artwork Symbolism", ar: "رمزية العمل الفني" }, url: "/#artwork" },
    ],
  },
  {
    id: "customer",
    title: { en: "CUSTOMER CARE", ar: "خدمة العملاء" },
    links: [
      { id: "sizeguide", label: { en: "Size Guide", ar: "دليل المقاسات" }, url: "/#size-guide" },
      { id: "faq", label: { en: "FAQ & Support", ar: "الأسئلة الشائعة" }, url: "/#faq" },
    ],
  },
];

const DEFAULT_SOCIALS: DynamicSocialLink[] = [
  { id: "ig", platform: "instagram", label: "Instagram", url: "https://www.instagram.com/badu_hoodie?stkn=a3RycWdocjB4YzU0" },
  { id: "tt", platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@z25662?_r=1&_t=ZS-99XBSM5c8Ky" },
  { id: "fb", platform: "facebook", label: "Facebook", url: "https://www.facebook.com/share/1DU4rE5HDG/?mibextid=wwXIfr" },
];

export function Footer() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();
  const [groups, setGroups] = useState<DynamicFooterGroup[]>(DEFAULT_GROUPS);
  const [socials, setSocials] = useState<DynamicSocialLink[]>(DEFAULT_SOCIALS);

  useEffect(() => {
    async function loadFooter() {
      try {
        const res = await fetch("/api/admin/footer");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.groups) && data.groups.length > 0) {
            setGroups(data.groups);
          }
          if (Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
            setSocials(data.socialLinks.filter((s: DynamicSocialLink) => (s as { visible?: boolean }).visible !== false));
          }
        }
      } catch {
        // Fall back to default
      }
    }
    loadFooter();
  }, []);

  return (
    <footer className={styles.footer}>
      <Container>
        <Reveal>
          <div className={styles.top}>
            <div className={styles.brand}>
              <Logo dark />
              <p className={styles.tagline}>{t("footer.tagline")}</p>
            </div>

            {groups.map((group) => (
              <nav key={group.id} aria-label={group.title.en} className={styles.navColumn}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-accent, #c8a77d)", marginBottom: "0.75rem" }}>
                  {group.title[locale] || group.title.en}
                </p>
                <ul role="list" className={styles.navList}>
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <Link href={link.url} className={styles.navLink}>
                        {link.label[locale] || link.label.en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className={styles.social}>
              <p className={styles.socialLabel}>{t("footer.socialLabel")}</p>
              <ul role="list" className={styles.socialList}>
                {socials.map((soc) => (
                  <li key={soc.id}>
                    <a
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.navLink}
                    >
                      {soc.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            © {year} BADU — {t("footer.rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
