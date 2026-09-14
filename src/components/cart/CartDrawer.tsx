"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";
import { CartItemRow } from "./CartItemRow";
import { EmptyCart } from "./EmptyCart";
import { Button } from "@/components/ui/Button";
import styles from "./cart-drawer.module.css";

export function CartDrawer() {
  const { t, locale } = useI18n();
  const { items, subtotal, isOpen, closeCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currency = "USD";

  return (
    <div className={styles.backdrop} onClick={closeCart} aria-hidden="true">
      <div
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="cart-drawer-title" className={styles.title}>
            {t("cart.title")}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className={styles.closeBtn}
            aria-label={t("cart.closeDrawer")}
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <EmptyCart onAction={closeCart} />
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.size}`}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>{t("cart.subtotal")}</span>
              <span className={styles.subtotalAmount}>
                {formatPrice(subtotal, currency, locale)}
              </span>
            </div>

            <div className={styles.actionButtons}>
              <Button
                href="/cart"
                onClick={closeCart}
                variant="primary"
                size="md"
                className={styles.actionBtn}
              >
                {t("cart.viewCart")}
              </Button>

              <div className={styles.checkoutBlock}>
                <Button
                  href="/checkout"
                  onClick={closeCart}
                  variant="primary"
                  size="md"
                  className={styles.actionBtn}
                >
                  {t("cart.checkout")}
                </Button>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className={styles.continueLink}
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
