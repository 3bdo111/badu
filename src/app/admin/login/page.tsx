"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { SunMark } from "@/components/ui/SunMark";
import { Button } from "@/components/ui/Button";
import styles from "./admin-login.module.css";

export default function AdminLoginPage() {
  const { locale } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAr = locale === "ar";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message?.[locale] || data.message?.en || (isAr ? "فشل تسجيل الدخول." : "Login failed."));
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(isAr ? "حدث خطأ في الاتصال بالخادم." : "Server connection error.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
            <SunMark className={styles.logoSun} />
          </div>
          <h1 className={styles.logo}>BADU ADMIN</h1>
          <p className={styles.subtitle}>
            {isAr ? "سجل الدخول لإدارة متجر بادو" : "Sign in to manage the BADU storefront"}
          </p>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email-input">
              {isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS"}
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@badu.store"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password-input">
              {isAr ? "كلمة المرور" : "PASSWORD"}
            </label>
            <input
              id="password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading
              ? isAr
                ? "جاري التحقق..."
                : "SIGNING IN..."
              : isAr
                ? "تسجيل الدخول"
                : "SIGN IN"}
          </Button>
        </form>
      </div>
    </div>
  );
}
