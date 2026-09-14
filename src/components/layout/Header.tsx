"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CartButton } from "@/components/cart/CartButton";
import styles from "./header.module.css";

const NAV_ITEMS = [
  { key: "nav.home", href: "/" },
  { key: "nav.store", href: "/store" },
  { key: "nav.hoodie", href: "/#hoodie" },
  { key: "nav.story", href: "/#story" },
] as const;

/**
 * Minimal storefront header.
 * Desktop: wordmark | nav | switcher + cart.
 * Mobile: wordmark | switcher + menu button, nav in a light dropdown.
 */
export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <Logo />

        <nav aria-label="Primary" className={styles.nav}>
          <ul role="list" className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/store"
                  ? pathname.startsWith("/store") || pathname.startsWith("/products")
                  : item.href === "/"
                  ? pathname === "/"
                  : false;

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={[
                      styles.navLink,
                      isActive ? styles.activeNavLink : "",
                    ].join(" ")}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <CartButton />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className={styles.menuIcon}>
              {menuOpen ? "✕" : "☰"}
            </span>
            <span className="visually-hidden">
              {menuOpen ? t("common.menuClose") : t("common.menuOpen")}
            </span>
          </button>
        </div>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          className={styles.mobileNav}
        >
          <Container>
            <ul role="list" className={styles.mobileNavList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={styles.mobileNavLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
