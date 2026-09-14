"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice } from "@/lib/format";
import type { OrderRecord, OrderStatus } from "@/lib/repositories/server-order-repository";
import styles from "./orders-list.module.css";

type StatusTab = "ALL" | OrderStatus;

export default function AdminOrdersPage() {
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const isAr = locale === "ar";
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        const queryParams = new URLSearchParams();
        if (activeTab !== "ALL") queryParams.set("status", activeTab);
        if (searchQuery.trim()) queryParams.set("query", searchQuery.trim());

        const res = await fetch(`/api/orders?${queryParams.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch {
        // Keep state
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [activeTab, searchQuery]);

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "ALL", label: isAr ? "الكل" : "ALL" },
    { key: "PENDING", label: isAr ? "قيد الانتظار" : "PENDING" },
    { key: "CONFIRMED", label: isAr ? "مؤكد" : "CONFIRMED" },
    { key: "PROCESSING", label: isAr ? "قيد التجهيز" : "PROCESSING" },
    { key: "SHIPPED", label: isAr ? "تم الشحن" : "SHIPPED" },
    { key: "DELIVERED", label: isAr ? "تم التسليم" : "DELIVERED" },
    { key: "CANCELLED", label: isAr ? "ملغي" : "CANCELLED" },
  ];

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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>{t("admin.orders")}</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                styles.tabBtn,
                activeTab === tab.key ? styles.tabActive : "",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث برقم الطلب أو العميل..." : "Search order # or customer..."}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.emptyState}>{isAr ? "جاري التحميل..." : "Loading orders..."}</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            {isAr ? "لا توجد طلبات مطابقة." : "No orders found."}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{isAr ? "رقم الطلب" : "ORDER #"}</th>
                <th>{isAr ? "العميل" : "CUSTOMER"}</th>
                <th>{isAr ? "الهاتف" : "PHONE"}</th>
                <th>{isAr ? "طريقة الدفع" : "PAYMENT"}</th>
                <th>{isAr ? "الإجمالي" : "TOTAL"}</th>
                <th>{isAr ? "الحالة" : "STATUS"}</th>
                <th>{isAr ? "التاريخ" : "DATE"}</th>
                <th style={{ textAlign: "end" }}>{isAr ? "الإجراء" : "ACTION"}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                    {ord.orderNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>{ord.customerName}</td>
                  <td>{ord.customerPhone}</td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                      {isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {formatPrice(ord.totalAmount, ord.currency, locale)}
                  </td>
                  <td>
                    <span className={[styles.statusBadge, getStatusBadgeClass(ord.status)].join(" ")}>
                      {ord.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                    {new Date(ord.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                  </td>
                  <td style={{ textAlign: "end" }}>
                    <Link href={`/admin/orders/${ord.id}`} className={styles.viewBtn}>
                      {isAr ? "التفاصيل" : "View"} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
