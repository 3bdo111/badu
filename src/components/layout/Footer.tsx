"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./footer.module.css";

const FOOTER_NAV = [
  { key: "nav.home", href: "/" },
  { key: "nav.store", href: "/store" },
  { key: "nav.hoodie", href: "/#hoodie" },
  { key: "nav.story", href: "/#story" },
] as const;

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <Reveal>
          <div className={styles.top}>
            <div className={styles.brand}>
              <Logo dark />
              <p className={styles.tagline}>{t("footer.tagline")}</p>
            </div>

            <nav aria-label="Footer" className={styles.navColumn}>
              <ul role="list" className={styles.navList}>
                {FOOTER_NAV.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className={styles.navLink}>
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.social}>
              <p className={styles.socialLabel}>{t("footer.socialLabel")}</p>
              {/* STEP 8/9: connect real profile URLs — intentionally inert until then */}
              <ul role="list" className={styles.socialList}>
                <li>
                  <span className={styles.socialPlaceholder} aria-disabled="true">
                    {t("footer.instagram")}
                  </span>
                </li>
                <li>
                  <span className={styles.socialPlaceholder} aria-disabled="true">
                    {t("footer.tiktok")}
                  </span>
                </li>
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
