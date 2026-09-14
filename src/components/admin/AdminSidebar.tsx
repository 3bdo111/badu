"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import styles from "./admin-sidebar.module.css";

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();

  const navItems = [
    { label: t("admin.dashboard"), href: "/admin", exact: true },
    { label: t("admin.products"), href: "/admin/products", exact: false },
    { label: t("admin.orders"), href: "/admin/orders", exact: false },
    { label: t("admin.storefront"), href: "/admin/storefront", exact: false },
    { label: t("admin.settings"), href: "#", disabled: true, tag: t("admin.comingSoon") },
  ];

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.disabled) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <Logo />
          <span className={styles.adminBadge}>{t("admin.adminLabel")}</span>
        </div>
      </div>

      <nav aria-label="Admin Navigation" className={styles.nav}>
        <ul role="list" className={styles.navList}>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.label} className={styles.navItem}>
                {item.disabled ? (
                  <span className={[styles.navLink, styles.disabled].join(" ")}>
                    <span>{item.label}</span>
                    {item.tag && <span className={styles.tag}>{item.tag}</span>}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[styles.navLink, active ? styles.active : ""].join(" ")}
                  >
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <LanguageSwitcher />
          <Link href="/" className={styles.storeLink}>
            ← {t("admin.backToStore")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
