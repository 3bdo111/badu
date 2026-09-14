import type { Metadata } from "next";
import { cookies } from "next/headers";
import { serverOrderRepository } from "@/lib/repositories/server-order-repository";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { formatPrice } from "@/lib/format";
import { dictionaries, defaultLocale } from "@/i18n/dictionaries";
import { LOCALE_COOKIE, type Locale } from "@/i18n/types";
import { Container } from "@/components/ui/Container";
import { SunMark } from "@/components/ui/SunMark";
import { Button } from "@/components/ui/Button";
import styles from "../confirmation.module.css";

export const metadata: Metadata = {
  title: "Order Confirmation — BADU",
  description: "Your BADU order confirmation.",
  robots: {
    index: false,
    follow: false,
  },
};

function isLocale(val?: string): val is Locale {
  return val === "en" || val === "ar";
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = await params;
  const orderNumber = resolvedParams.orderNumber;

  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = dictionaries[locale];

  const accessCookie = cookieStore.get(`badu_order_access_${orderNumber}`)?.value;
  const adminSession = await verifyAdminSession();

  const isAuthorized = Boolean(accessCookie || adminSession);
  const order = isAuthorized ? serverOrderRepository.getOrderByNumber(orderNumber) : undefined;

  if (!order) {
    return (
      <div className={styles.page}>
        <Container narrow>
          <div className={styles.card} style={{ textAlign: "center" }}>
            <h1 className={styles.title} style={{ marginBottom: "1rem" }}>
              {dict.checkout.orderNotFound}
            </h1>
            <p style={{ color: "var(--color-muted)", marginBottom: "2rem" }}>
              {!isAuthorized
                ? locale === "ar"
                  ? "غير مصرح بالوصول لتفاصيل هذا الطلب."
                  : "Access to this order confirmation is restricted."
                : dict.checkout.orderNotFound}
            </p>
            <Button href="/" variant="primary" size="lg">
              {dict.checkout.backToShop}
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Container narrow>
        <div className={styles.card}>
          <div className={styles.header}>
            <SunMark className={styles.sun} />
            <h1 className={styles.title}>{dict.checkout.confirmationTitle}</h1>
            <div className={styles.orderBadge}>{order.orderNumber}</div>
          </div>

          <div className={styles.noticeBox}>{dict.checkout.confirmationMsg}</div>

          {/* Customer Details */}
          <div className={styles.detailsBlock}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{dict.checkout.fullName}</span>
              <span className={styles.detailValue}>{order.customerName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{dict.checkout.phone}</span>
              <span className={styles.detailValue}>{order.customerPhone}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{dict.checkout.address}</span>
              <span className={styles.detailValue}>
                {order.shippingAddress}, {order.city}, {order.country}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{dict.checkout.paymentMethod}</span>
              <span className={styles.detailValue}>
                {locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery (COD)"}
              </span>
            </div>
          </div>

          {/* Order Items Table */}
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: "center" }}>Size</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "end" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {locale === "ar" ? item.productNameAr : item.productNameEn}
                  </td>
                  <td style={{ textAlign: "center" }}>{item.size}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "end" }}>
                    {formatPrice(item.lineTotal, order.currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className={styles.totalRow}>
            <span>{dict.checkout.total}</span>
            <span className={styles.totalValue}>
              {formatPrice(order.totalAmount, order.currency, locale)}
            </span>
          </div>

          <div className={styles.actions}>
            <Button href="/" variant="primary" size="lg" className={styles.actionBtn}>
              {dict.checkout.backToShop}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
