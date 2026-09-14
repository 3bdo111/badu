"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { productRepository } from "@/lib/services/product-service";
import { productName } from "@/lib/types/product";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import styles from "@/app/checkout/checkout.module.css";

export function CheckoutForm() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("United Arab Emirates");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => `idempotent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  const isAr = locale === "ar";
  const currency = "USD";

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <Container narrow>
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              border: "1px dashed var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <Heading level={1} className={styles.heading}>
              {t("cart.empty")}
            </Heading>
            <p style={{ color: "var(--color-muted)", marginBottom: "2rem" }}>
              {t("cart.emptySubtitle")}
            </p>
            <Button href="/#hoodie" variant="primary" size="lg">
              {t("cart.exploreCta")}
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = isAr ? "الاسم الكامل مطلوب." : "Full name is required.";
    if (!phone.trim()) errs.phone = isAr ? "رقم الهاتف مطلوب." : "Phone number is required.";
    if (!address.trim()) errs.address = isAr ? "عنوان التوصيل مطلوب." : "Delivery address is required.";
    if (!city.trim()) errs.city = isAr ? "المدينة مطلوبة." : "City is required.";
    if (!country.trim()) errs.country = isAr ? "الدولة مطلوبة." : "Country is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        idempotencyKey,
        customer: {
          name,
          phone,
          email,
          address,
          city,
          country,
          notes,
        },
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(
          data.message?.[locale] || data.message?.en || (isAr ? "تعذر إتمام الطلب." : "Order creation failed.")
        );
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/checkout/confirmation/${data.orderNumber}`);
    } catch {
      setServerError(
        isAr ? "حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى." : "Connection error. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.titleBlock}>
          <p className="label">{t("cart.label")}</p>
          <Heading level={1} className={styles.heading}>
            {t("checkout.title")}
          </Heading>
        </div>

        {serverError && (
          <div className={styles.errorBanner} role="alert" style={{ marginBottom: "1.5rem" }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.grid}>
          {/* Customer Information & Payment */}
          <div className={styles.formCard}>
            <div>
              <h2 className={styles.sectionTitle}>{t("checkout.customerInfo")}</h2>

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name-input">
                    {t("checkout.fullName")} *
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    className={[styles.input, errors.name ? styles.inputError : ""].join(" ")}
                  />
                  {errors.name && <span id="err-name" className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone-input">
                    {t("checkout.phone")} *
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    className={[styles.input, errors.phone ? styles.inputError : ""].join(" ")}
                  />
                  {errors.phone && <span id="err-phone" className={styles.errorText}>{errors.phone}</span>}
                </div>

                <div className={[styles.field, styles.fullWidth].join(" ")}>
                  <label className={styles.label} htmlFor="email-input">
                    {t("checkout.email")}
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className={styles.input}
                  />
                </div>

                <div className={[styles.field, styles.fullWidth].join(" ")}>
                  <label className={styles.label} htmlFor="address-input">
                    {t("checkout.address")} *
                  </label>
                  <input
                    id="address-input"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Building, Apartment"
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "err-address" : undefined}
                    className={[styles.input, errors.address ? styles.inputError : ""].join(" ")}
                  />
                  {errors.address && <span id="err-address" className={styles.errorText}>{errors.address}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="city-input">
                    {t("checkout.city")} *
                  </label>
                  <input
                    id="city-input"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? "err-city" : undefined}
                    className={[styles.input, errors.city ? styles.inputError : ""].join(" ")}
                  />
                  {errors.city && <span id="err-city" className={styles.errorText}>{errors.city}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="country-input">
                    {t("checkout.country")} *
                  </label>
                  <input
                    id="country-input"
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    aria-invalid={Boolean(errors.country)}
                    aria-describedby={errors.country ? "err-country" : undefined}
                    className={[styles.input, errors.country ? styles.inputError : ""].join(" ")}
                  />
                  {errors.country && <span id="err-country" className={styles.errorText}>{errors.country}</span>}
                </div>

                <div className={[styles.field, styles.fullWidth].join(" ")}>
                  <label className={styles.label} htmlFor="notes-input">
                    {t("checkout.notes")}
                  </label>
                  <textarea
                    id="notes-input"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={styles.textarea}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className={styles.sectionTitle}>{t("checkout.paymentMethod")}</h2>
              <div className={styles.paymentBox}>
                <input
                  type="radio"
                  id="cod-radio"
                  name="paymentMethod"
                  checked
                  readOnly
                  className={styles.codRadio}
                />
                <div>
                  <label htmlFor="cod-radio" className={styles.codLabel}>
                    {isAr ? "الدفع عند الاستلام" : "Cash on Delivery (COD)"}
                  </label>
                  <p className={styles.codNotice}>{t("checkout.codNotice")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className={styles.summaryCard}>
            <h2 className={styles.sectionTitle}>{t("checkout.orderSummary")}</h2>

            <div className={styles.itemList}>
              {items.map((item) => {
                const product =
                  productRepository.getProductById(item.productId) ||
                  productRepository.getProductBySlug(item.slug);

                return (
                  <div key={`${item.productId}-${item.size}`} className={styles.itemRow}>
                    <div>
                      <div className={styles.itemName}>
                        {product ? productName(product, locale) : item.slug}
                      </div>
                      <div className={styles.itemMeta}>
                        {t("cart.sizePrefix")} {item.size} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div>
                      {formatPrice((product?.price || 0) * item.quantity, currency, locale)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.summaryRow}>
              <span>{t("checkout.total")}</span>
              <span className={styles.totalAmount}>
                {formatPrice(subtotal, currency, locale)}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? t("checkout.submitting") : t("checkout.placeOrder")}
            </Button>

            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <Link
                href="/cart"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-muted)",
                  textDecoration: "underline",
                }}
              >
                ← {t("cart.continueShopping")}
              </Link>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
