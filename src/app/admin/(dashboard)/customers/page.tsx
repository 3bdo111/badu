'use client';

import React, { useEffect, useState } from 'react';
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

interface CrmMetrics {
  totalCustomers: number;
  vipCount: number;
  returningCount: number;
  totalCrmRevenue: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [metrics, setMetrics] = useState<CrmMetrics>({
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
        console.error('Failed loading CRM customers:', err);
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
    return `${amount.toLocaleString()} ج.م`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
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
      return <span className={`${styles.tierBadge} ${styles.tierVip}`}>👑 VIP عميل مميز</span>;
    }
    if (tier === 'RETURNING') {
      return <span className={`${styles.tierBadge} ${styles.tierReturning}`}>🔄 عميل متكرر</span>;
    }
    return <span className={`${styles.tierBadge} ${styles.tierNew}`}>✨ عميل جديد</span>;
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>إدارة العملاء والـ CRM</h1>
          <p className={styles.pageSubtitle}>
            قاعدة بيانات العملاء، السجل الشرائي، وتحليلات القيمة الممتدة للعميل (LTV).
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>إجمالي العملاء</span>
          <span className={styles.metricValue}>{loading ? '...' : metrics.totalCustomers}</span>
          <span className={styles.metricSubtext}>عميل مسجل في النظام</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>عملاء VIP</span>
          <span className={styles.metricValue}>{loading ? '...' : metrics.vipCount}</span>
          <span className={styles.metricSubtext}>أكثر من 3 طلبات أو 3,000 ج.م</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>عملاء متكررين</span>
          <span className={styles.metricValue}>{loading ? '...' : metrics.returningCount}</span>
          <span className={styles.metricSubtext}>أكثر من طلب واحد</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>إجمالي مبيعات CRM</span>
          <span className={styles.metricValue}>
            {loading ? '...' : formatPrice(metrics.totalCrmRevenue)}
          </span>
          <span className={styles.metricSubtext}>إجمالي إنفاق كافة العملاء</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.searchBarRow}>
        <input
          type="text"
          placeholder="ابحث باسم العميل، الهاتف، المحافظة، أو العنوان..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterTabs}>
          <button
            className={`${styles.tabBtn} ${activeTier === 'ALL' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('ALL')}
          >
            الكل ({customers.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTier === 'VIP' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('VIP')}
          >
            👑 VIP ({customers.filter((c) => c.tier === 'VIP').length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTier === 'RETURNING' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('RETURNING')}
          >
            🔄 متكرر ({customers.filter((c) => c.tier === 'RETURNING').length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTier === 'NEW' ? styles.tabActive : ''}`}
            onClick={() => setActiveTier('NEW')}
          >
            ✨ جديد ({customers.filter((c) => c.tier === 'NEW').length})
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          جاري تحميل بيانات العملاء...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          لا يوجد عملاء يطابقون نتائج البحث.
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>الهاتف</th>
                  <th>المحافظة / المدينة</th>
                  <th>تصنيف العميل</th>
                  <th>عدد الطلبات</th>
                  <th>إجمالي الإنفاق</th>
                  <th>آخر طلب</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.phone}>
                    <td style={{ fontWeight: 600 }}>{customer.name || 'عميل بدون اسم'}</td>
                    <td dir="ltr" style={{ textAlign: 'end', fontFamily: 'monospace' }}>
                      {customer.phone}
                    </td>
                    <td>{customer.city || 'غير محدد'}</td>
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
                        عرض السجل
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
                    <h3 className={styles.cardTitle}>{customer.name || 'عميل بدون اسم'}</h3>
                    <span className={styles.cardSub} dir="ltr">
                      {customer.phone} • {customer.city || 'غير محدد'}
                    </span>
                  </div>
                  <div>{getTierBadge(customer.tier)}</div>
                </div>

                <div className={styles.cardStats}>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block' }}>الطلبات</span>
                    <strong style={{ fontSize: '1rem' }}>{customer.totalOrders}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block' }}>
                      إجمالي الإنفاق
                    </span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-foreground)' }}>
                      {formatPrice(customer.totalSpent)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block' }}>آخر طلب</span>
                    <span style={{ fontSize: '0.8rem' }}>{formatDate(customer.lastOrderDate)}</span>
                  </div>
                </div>

                <button
                  className={styles.actionsBtn}
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  عرض سجل طلبات العميل
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
                  ملف العميل: {selectedCustomer.name}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                  تاريخ العميل والسجل الشرائي
                </span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedCustomer(null)}>
                ✕
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
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>تصنيف العميل</span>
                {getTierBadge(selectedCustomer.tier)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>رقم الهاتف</span>
                <strong dir="ltr">{selectedCustomer.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>المحافظة / المدينة</span>
                <span>{selectedCustomer.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>العنوان المسجل</span>
                <span style={{ fontSize: '0.85rem', maxWidth: '60%', textAlign: 'end' }}>
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
                  💬 مراسلة واتساب
                </a>
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className={styles.actionsBtn}
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  📞 اتصال هاتفي
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
                  الطلبات
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
                  إجمالي الإنفاق
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
                  متوسط الطلب
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
                سجل الطلبات السابقة ({selectedCustomer.orders.length})
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
                      <span>الحالة: {ord.status || 'PENDING'}</span>
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
                            • {it.productName || it.name || 'منتج'} ({it.size || 'مقاس'} -{' '}
                            {it.color || 'اللون'}) x{it.quantity || 1}
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
