"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import styles from "./cart-page.module.css";

export default function CartPage() {
  const { t, locale } = useI18n();
  const { items, subtotal } = useCart();

  const currency = "USD";

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.headerBlock}>
          <p className="label">{t("cart.label")}</p>
          <Heading level={1} className={styles.heading}>
            {t("cart.title")}
          </Heading>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className={styles.cartGrid}>
            <div className={styles.itemsList}>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.size}`}
                  item={item}
                />
              ))}
            </div>

            <div className={styles.summaryColumn}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>{t("cart.subtotal")}</h2>
                
                <div className={styles.summaryRow}>
                  <span>{t("cart.subtotal")}</span>
                  <span className={styles.summaryAmount}>
                    {formatPrice(subtotal, currency, locale)}
                  </span>
                </div>

                <div className={styles.checkoutBlock}>
                  <Button
                    href="/checkout"
                    variant="primary"
                    size="lg"
                    className={styles.checkoutBtn}
                  >
                    {t("cart.checkout")}
                  </Button>
                </div>

                <div className={styles.continueBlock}>
                  <Button
                    href="/#hoodie"
                    variant="outline"
                    size="md"
                    className={styles.continueBtn}
                  >
                    {t("cart.continueShopping")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
