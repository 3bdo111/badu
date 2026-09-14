"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import type { OrderRecord, OrderStatus } from "@/lib/repositories/server-order-repository";
import styles from "./order-detail.module.css";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");
  const [updating, setUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (isMounted) {
            if (res.status === 404) {
              setError(isAr ? "الطلب غير موجود." : "Order not found.");
            } else {
              setError(isAr ? "حدث خطأ أثناء تحميل الطلب." : "Failed to load order.");
            }
          }
          return;
        }
        const data: OrderRecord = await res.json();
        if (isMounted) {
          setOrder(data);
          setSelectedStatus(data.status);
        }
      } catch {
        if (isMounted) {
          setError(isAr ? "تعذر الاتصال بالخادم." : "Could not connect to server.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [id, isAr]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) return;
    setUpdating(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const result = await res.json();

      if (!res.ok) {
        setFeedbackMessage({
          text: result.error || (isAr ? "فشل تحديث الحالة." : "Failed to update status."),
          type: "error",
        });
        return;
      }

      setOrder(result.order);
      setSelectedStatus(result.order.status);

      let msg = isAr
        ? `تم تحديث حالة الطلب إلى ${result.order.status}`
        : `Order status updated to ${result.order.status}`;

      if (result.order.status === "CANCELLED" && result.order.stockRestored) {
        msg += isAr ? " وتمت إرجاع المنتجات إلى المخزون." : " and stock has been restored to inventory.";
      }

      setFeedbackMessage({
        text: msg,
        type: "success",
      });
    } catch {
      setFeedbackMessage({
        text: isAr ? "حدث خطأ أثناء التحديث." : "An error occurred while updating.",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return styles.statusPending;
      case "CONFIRMED":
        return styles.statusConfirmed;
      case "PROCESSING":
        return styles.statusProcessing;
      case "SHIPPED":
        return styles.statusShipped;
      case "DELIVERED":
        return styles.statusDelivered;
      case "CANCELLED":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Link href="/admin/orders" className={styles.backLink}>
          ← {isAr ? "العودة للطلبات" : "Back to Orders"}
        </Link>
        <div className={styles.emptyState}>
          {isAr ? "جاري تحميل تفاصيل الطلب..." : "Loading order details..."}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.pageContainer}>
        <Link href="/admin/orders" className={styles.backLink}>
          ← {isAr ? "العودة للطلبات" : "Back to Orders"}
        </Link>
        <div className={styles.emptyState}>
          {error || (isAr ? "الطلب غير موجود." : "Order not found.")}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Link href="/admin/orders" className={styles.backLink}>
        ← {isAr ? "العودة لقائمة الطلبات" : "Back to Orders"}
      </Link>

      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <h1 className={styles.orderTitle}>{order.orderNumber}</h1>
          <span className={styles.orderDate}>
            {isAr ? "تم الإنشاء في: " : "Placed on: "}
            {new Date(order.createdAt).toLocaleString(isAr ? "ar-SA" : "en-US")}
          </span>
        </div>

        <div className={styles.statusSection}>
          <div className={styles.badgeWrap}>
            <span className={[styles.statusBadge, getStatusBadgeClass(order.status)].join(" ")}>
              {order.status}
            </span>
            {order.stockRestored && (
              <span className={styles.stockRestoredBadge}>
                {isAr ? "المخزون مُسترجع" : "Stock Restored"}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className={styles.selectInput}
              disabled={updating}
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === order.status}
              className={styles.updateBtn}
            >
              {updating
                ? isAr
                  ? "جاري التحديث..."
                  : "Updating..."
                : isAr
                ? "تحديث الحالة"
                : "Update Status"}
            </button>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={[
            styles.feedbackBanner,
            feedbackMessage.type === "success"
              ? styles.feedbackSuccess
              : styles.feedbackError,
          ].join(" ")}
        >
          {feedbackMessage.text}
        </div>
      )}

      <div className={styles.gridTwoCol}>
        {/* Customer Info Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{isAr ? "بيانات العميل" : "Customer Information"}</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{isAr ? "الاسم" : "Full Name"}</span>
              <span className={styles.infoValue}>{order.customerName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{isAr ? "رقم الهاتف" : "Phone Number"}</span>
              <span className={styles.infoValue}>{order.customerPhone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{isAr ? "البريد الإلكتروني" : "Email"}</span>
              <span className={styles.infoValue}>{order.customerEmail || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{isAr ? "المدينة / الدولة" : "City / Country"}</span>
              <span className={styles.infoValue}>
                {order.city}, {order.country}
              </span>
            </div>
            <div className={styles.infoItem} style={{ gridColumn: "1 / -1" }}>
              <span className={styles.infoLabel}>{isAr ? "عنوان التوصيل" : "Delivery Address"}</span>
              <span className={styles.infoValue}>{order.shippingAddress}</span>
            </div>
            {order.notes && (
              <div className={styles.infoItem} style={{ gridColumn: "1 / -1" }}>
                <span className={styles.infoLabel}>{isAr ? "ملاحظات الطلب" : "Order Notes"}</span>
                <span className={styles.infoValue}>{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Order Meta Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{isAr ? "تفاصيل الدفع والملخص" : "Payment & Summary"}</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{isAr ? "طريقة الدفع" : "Payment Method"}</span>
              <span className={styles.infoValue}>
                {isAr ? "الدفع عند الاستلام (COD)" : "Cash on Delivery (COD)"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{isAr ? "حالة الدفع" : "Payment Status"}</span>
              <span className={styles.infoValue}>
                {order.paymentStatus === "PAID"
                  ? isAr
                    ? "تم المدفوعات"
                    : "Paid"
                  : isAr
                  ? "معلق (عند التسليم)"
                  : "Pending (On Delivery)"}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
            <div className={styles.totalRow}>
              <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
              <span>{formatPrice(order.subtotalAmount, order.currency, locale)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>{isAr ? "الشحن:" : "Shipping:"}</span>
              <span style={{ color: "var(--color-accent-gold, #c8a77d)" }}>
                {isAr ? "مجاني" : "Free"}
              </span>
            </div>
            <div className={styles.grandTotalRow}>
              <span>{isAr ? "الإجمالي الكلي:" : "Total Amount:"}</span>
              <span>{formatPrice(order.totalAmount, order.currency, locale)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
          <h2 className={styles.cardTitle} style={{ margin: 0, border: "none", padding: 0 }}>
            {isAr ? "المنتجات المطلوبة" : "Ordered Items"} ({order.items.length})
          </h2>
        </div>
        <div className={styles.tableWrap} style={{ border: "none", borderRadius: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{isAr ? "المنتج" : "PRODUCT"}</th>
                <th>{isAr ? "المقاس" : "SIZE"}</th>
                <th>{isAr ? "اللون" : "COLOR"}</th>
                <th>{isAr ? "السعر الفردي" : "UNIT PRICE"}</th>
                <th>{isAr ? "الكمية" : "QTY"}</th>
                <th style={{ textAlign: "end" }}>{isAr ? "الإجمالي" : "TOTAL"}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    {isAr ? item.productNameAr : item.productNameEn}
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 600 }}>
                      {item.size}
                    </span>
                  </td>
                  <td>{isAr ? item.colorNameAr : item.colorNameEn}</td>
                  <td>{formatPrice(item.pricePerUnit, order.currency, locale)}</td>
                  <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: "end", fontWeight: 700 }}>
                    {formatPrice(item.lineTotal, order.currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
