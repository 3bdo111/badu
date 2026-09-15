'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import styles from './customers.module.css';

interface OrderSummary {
  id: string;
  items: string | any[];
  totalAmount: number;
  status: string;
  createdAt: string;
  governorate: string;
}

interface CustomerProfile {
  phone: string;
  name: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  tier: 'VIP' | 'RETURNING' | 'NEW';
  lastOrderDate: string;
  orders: OrderSummary[];
}

interface CustomerMetrics {
  totalCustomers: number;
  vipCount: number;
  returningCount: number;
  totalCrmRevenue: number;
}

export default function AdminCustomersPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    vipCount: 0,
    returningCount: 0,
    totalCrmRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState<'ALL' | 'VIP' | 'RETURNING' | 'NEW'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
          if (data.metrics) {
            setMetrics(data.metrics);
          }
        }
      } catch (err) {
        console.error('Failed loading customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesTier = activeTier === 'ALL' || c.tier === activeTier;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query);
    return matchesTier && matchesSearch;
  });

  const formatPrice = (amount: number) => {
    return isAr ? `${amount.toLocaleString()} ج.م` : `${amount.toLocaleString()} EGP`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTierBadge = (tier: 'VIP' | 'RETURNING' | 'NEW') => {
    if (tier === 'VIP') {
      return (
        <span className={`${styles.tierBadge} ${styles.tierVip}`}>
          {isAr ? 'عميل مميز' : 'VIP Customer'}
        </span>
      );
    }
    if (tier === 'RETURNING') {
      return (
        <span className={`${styles.tierBadge} ${styles.tierReturning}`}>
          {isAr ? 'عميل متكرر' : 'Returning Customer'}
        </span>
      );
    }
    return (
      <span className={`${styles.tierBadge} ${styles.tierNew}`}>
        {isAr ? 'عميل جديد' : 'New Customer'}
      </span>
    );
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>
            {isAr ? 'إدارة العملاء' : 'Customer Management'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isAr
              ? 'دليل العملاء، السجل الشرائي، وإجمالي إنفاق كل عميل.'
              : 'Customer directory, purchase history, and lifetime value analytics.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{isAr ? 'إجمالي العملاء' : 'Total Customers'}</span>
          <span className={styles.metricValue}>{loading ? '...' : metrics.totalCustomers}</span>
          <span className={styles.metricSubtext}>
            {isAr ? 'عميل مسجل في النظام' : 'Registered customers'}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{isAr ? 'العملاء المميزون' : 'VIP Customers'}</span>
          <span className={styles.metricValue}>{loading ? '...' : metrics.vipCount}</span>
          <span className={styles.metricSubtext}>
            {isAr ? 'أكثر من 3 طلبات أو 3,000 ج.م' : '3+ orders or 3,000 EGP+'}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>{isAr ? 'العملاء المتكررون' : 'Returning Customers'}</span>
          <span className={styles.metricValue}>{loading ? '...' : metrics.returningCount}</span>
          <span className={styles.metricSubtext}>
            {isAr ? 'أكثر من طلب واحد' : 'More than 1 order'}
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>
            {isAr ? 'إجمالي إنفاق العملاء' : 'Total Revenue'}
          </span>
          <span className={styles.metricValue}>
            {loading ? '...' : formatPrice(metrics.totalCrmRevenue)}
          </span>
          <span className={styles.metricSubtext}>
            {isAr ? 'إجمالي مبيعات كافة العملاء' : 'Total customer spend'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.searchBarRow}>
        <input
          type="text"
          placeholder={
            isAr
              ? 'ابحث باسم العميل، رقم الهاتف، المحافظة، أو العنوان...'
              : 'Search by customer name, phone, city, or address...'
          }
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterTabs}>
          <button
            className={`${styles.tabBtn} ${activeTier === 'ALL' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('ALL')}
          >
            {isAr ? 'الكل' : 'All'} ({customers.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTier === 'VIP' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('VIP')}
          >
            {isAr ? 'المميزون' : 'VIP'} ({customers.filter((c) => c.tier === 'VIP').length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTier === 'RETURNING' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('RETURNING')}
          >
            {isAr ? 'المتكررون' : 'Returning'} ({customers.filter((c) => c.tier === 'RETURNING').length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTier === 'NEW' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('NEW')}
          >
            {isAr ? 'الجدد' : 'New'} ({customers.filter((c) => c.tier === 'NEW').length})
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          {isAr ? 'جاري تحميل بيانات العملاء...' : 'Loading customers...'}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          {isAr ? 'لا يوجد عملاء يطابقون نتائج البحث.' : 'No customers match your search.'}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{isAr ? 'العميل' : 'Customer'}</th>
                  <th>{isAr ? 'الهاتف' : 'Phone'}</th>
                  <th>{isAr ? 'المحافظة / المدينة' : 'City'}</th>
                  <th>{isAr ? 'التصنيف' : 'Tier'}</th>
                  <th>{isAr ? 'عدد الطلبات' : 'Orders'}</th>
                  <th>{isAr ? 'إجمالي الإنفاق' : 'Total Spent'}</th>
                  <th>{isAr ? 'آخر طلب' : 'Last Order'}</th>
                  <th>{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.phone}>
                    <td style={{ fontWeight: 600 }}>{customer.name || (isAr ? 'عميل بدون اسم' : 'Unnamed Customer')}</td>
                    <td dir="ltr" style={{ textAlign: isAr ? 'end' : 'start', fontFamily: 'monospace' }}>
                      {customer.phone}
                    </td>
                    <td>{customer.city || (isAr ? 'غير محدد' : 'N/A')}</td>
                    <td>{getTierBadge(customer.tier)}</td>
                    <td style={{ fontWeight: 700 }}>{customer.totalOrders}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                      {formatDate(customer.lastOrderDate)}
                    </td>
                    <td>
                      <button
                        className={styles.actionsBtn}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        {isAr ? 'عرض السجل' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards List View */}
          <div className={styles.cardsList}>
            {filteredCustomers.map((customer) => (
              <div key={customer.phone} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{customer.name || (isAr ? 'عميل بدون اسم' : 'Unnamed Customer')}</h3>
                    <span className={styles.cardSub} dir="ltr">
                      {customer.phone} • {customer.city || (isAr ? 'غير محدد' : 'N/A')}
                    </span>
                  </div>
                  <div>{getTierBadge(customer.tier)}</div>
                </div>

                <div className={styles.cardStats}>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block' }}>
                      {isAr ? 'الطلبات' : 'Orders'}
                    </span>
                    <strong style={{ fontSize: '1rem' }}>{customer.totalOrders}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block' }}>
                      {isAr ? 'إجمالي الإنفاق' : 'Total Spent'}
                    </span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-foreground)' }}>
                      {formatPrice(customer.totalSpent)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block' }}>
                      {isAr ? 'آخر طلب' : 'Last Order'}
                    </span>
                    <span style={{ fontSize: '0.8rem' }}>{formatDate(customer.lastOrderDate)}</span>
                  </div>
                </div>

                <button
                  className={styles.actionsBtn}
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  {isAr ? 'عرض سجل طلبات العميل' : 'View Customer History'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Customer History Drawer Modal */}
      {selectedCustomer && (
        <div className={styles.drawerBackdrop} onClick={() => setSelectedCustomer(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  {isAr ? `ملف العميل: ${selectedCustomer.name}` : `Customer: ${selectedCustomer.name}`}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                  {isAr ? 'تفاصيل السجل الشرائي والتواصل' : 'Purchase history and contact options'}
                </span>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedCustomer(null)}
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                &times;
              </button>
            </div>

            {/* Customer Details Header */}
            <div
              style={{
                backgroundColor: 'var(--color-surface, rgba(255,255,255,0.03))',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  {isAr ? 'التصنيف' : 'Tier'}
                </span>
                {getTierBadge(selectedCustomer.tier)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  {isAr ? 'رقم الهاتف' : 'Phone'}
                </span>
                <strong dir="ltr">{selectedCustomer.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  {isAr ? 'المحافظة / المدينة' : 'City'}
                </span>
                <span>{selectedCustomer.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  {isAr ? 'العنوان' : 'Address'}
                </span>
                <span style={{ fontSize: '0.85rem', maxWidth: '60%', textAlign: isAr ? 'end' : 'start' }}>
                  {selectedCustomer.address}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <a
                  href={`https://wa.me/${getCleanPhone(selectedCustomer.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionsBtn}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    backgroundColor: '#25D366',
                    color: '#fff',
                    border: 'none',
                    textDecoration: 'none',
                  }}
                >
                  {isAr ? 'مراسلة عبر واتساب' : 'WhatsApp'}
                </a>
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className={styles.actionsBtn}
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  {isAr ? 'اتصال هاتفي' : 'Call'}
                </a>
              </div>
            </div>

            {/* Customer Summary Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>
                  {isAr ? 'الطلبات' : 'Orders'}
                </span>
                <strong style={{ fontSize: '1.1rem' }}>{selectedCustomer.totalOrders}</strong>
              </div>
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>
                  {isAr ? 'إجمالي الإنفاق' : 'Total Spent'}
                </span>
                <strong style={{ fontSize: '1.1rem' }}>
                  {formatPrice(selectedCustomer.totalSpent)}
                </strong>
              </div>
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>
                  {isAr ? 'متوسط الطلب' : 'Average Order'}
                </span>
                <strong style={{ fontSize: '1.1rem' }}>
                  {formatPrice(
                    selectedCustomer.totalOrders > 0
                      ? Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders)
                      : 0
                  )}
                </strong>
              </div>
            </div>

            {/* Orders Timeline */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                {isAr
                  ? `سجل الطلبات السابقة (${selectedCustomer.orders.length})`
                  : `Order History (${selectedCustomer.orders.length})`}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedCustomer.orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      backgroundColor: 'var(--color-background)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      <strong dir="ltr">#{ord.id.slice(0, 8)}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        {formatDate(ord.createdAt)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>{isAr ? `الحالة: ${ord.status || 'PENDING'}` : `Status: ${ord.status || 'PENDING'}`}</span>
                      <strong style={{ color: 'var(--color-foreground)' }}>
                        {formatPrice(ord.totalAmount)}
                      </strong>
                    </div>

                    {/* Items detail preview */}
                    {Array.isArray(ord.items) && ord.items.length > 0 && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-muted)',
                          borderTop: '1px dashed var(--color-border)',
                          paddingTop: '0.4rem',
                          marginTop: '0.2rem',
                        }}
                      >
                        {ord.items.map((it: any, idx: number) => (
                          <div key={idx}>
                            • {it.productName || it.name || (isAr ? 'منتج' : 'Product')} ({it.size || (isAr ? 'المقاس' : 'Size')} -{' '}
                            {it.color || (isAr ? 'اللون' : 'Color')}) x{it.quantity || 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
