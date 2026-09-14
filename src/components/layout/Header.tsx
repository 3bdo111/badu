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

interface DynamicNavItem {
  id: string;
  label: { en: string; ar: string };
  url: string;
  isExternal?: boolean;
  targetBlank?: boolean;
}

const DEFAULT_NAV: DynamicNavItem[] = [
  { id: "home", label: { en: "Home", ar: "الرئيسية" }, url: "/" },
  { id: "store", label: { en: "Store", ar: "المتجر" }, url: "/store" },
  { id: "hoodie", label: { en: "The Hoodie", ar: "الهودي" }, url: "/#hoodie" },
  { id: "story", label: { en: "Our Story", ar: "قصتنا" }, url: "/#story" },
];

/**
 * Minimal storefront header.
 * Desktop: wordmark | nav | switcher + cart.
 * Mobile: wordmark | switcher + menu button, nav in a light dropdown.
 */
export function Header() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState<DynamicNavItem[]>(DEFAULT_NAV);

  useEffect(() => {
    async function loadNav() {
      try {
        const res = await fetch("/api/admin/navigation");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items.filter((item: DynamicNavItem) => (item as { visible?: boolean }).visible !== false));
          }
        }
      } catch {
        // Fall back to default
      }
    }
    loadNav();
  }, []);

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
            {items.map((item) => {
              const itemLabel = item.label[locale] || item.label.en;
              const isActive =
                item.url === "/store"
                  ? pathname.startsWith("/store") || pathname.startsWith("/products")
                  : item.url === "/"
                  ? pathname === "/"
                  : false;

              return (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    target={item.targetBlank ? "_blank" : undefined}
                    rel={item.targetBlank ? "noopener noreferrer" : undefined}
                    className={[
                      styles.navLink,
                      isActive ? styles.activeNavLink : "",
                    ].join(" ")}
                  >
                    {itemLabel}
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
              {items.map((item) => {
                const itemLabel = item.label[locale] || item.label.en;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      target={item.targetBlank ? "_blank" : undefined}
                      rel={item.targetBlank ? "noopener noreferrer" : undefined}
                      className={styles.mobileNavLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      {itemLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
