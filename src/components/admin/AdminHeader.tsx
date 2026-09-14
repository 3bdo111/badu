"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import styles from "./admin-header.module.css";

export function AdminHeader({
  title,
  onToggleMobileMenu,
}: {
  title?: string;
  onToggleMobileMenu?: () => void;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore network failure
    }
    router.push("/admin/login");
    router.refresh();
  };

  const isAr = locale === "ar";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className={styles.mobileMenuBtn}
          aria-label="Open Admin Menu"
        >
          ☰
        </button>
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>

      <div className={styles.right}>
        <LanguageSwitcher />
        <span className={styles.userBadge}>{t("admin.adminLabel")}</span>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutBtn}
          aria-label={isAr ? "تسجيل الخروج" : "Logout"}
        >
          {isAr ? "خروج" : "LOGOUT"}
        </button>
      </div>
    </header>
  );
}
