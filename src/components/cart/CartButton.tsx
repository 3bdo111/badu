"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "./CartProvider";
import styles from "./cart-button.module.css";

/**
 * Cart entry point for the header.
 * Triggers the direction-aware Cart Drawer.
 */
export function CartButton() {
  const { count, openCart } = useCart();
  const { t } = useI18n();

  const label =
    count > 0 ? `${t("cart.openDrawer")} (${count})` : t("cart.openDrawer");

  return (
    <button
      type="button"
      className={styles.cartButton}
      aria-label={label}
      onClick={openCart}
    >
      <span aria-hidden="true" className={styles.cartIcon}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8h12l-1 12H7L6 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      </span>
      <span className={styles.cartLabel}>{t("cart.label")}</span>
      {count > 0 && <span className={styles.count}>{count}</span>}
    </button>
  );
}
