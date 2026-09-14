"use client";

import { LOCALES } from "@/i18n/types";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./language-switcher.module.css";

const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  en: "EN",
  ar: "عربي",
};

/**
 * Reusable EN / عربي switcher.
 * Updates the i18n context (text, direction) and persists the choice
 * in a cookie so the server renders the right language on the next visit.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={styles.switcher}
      role="group"
      aria-label={t("languageSwitcher.label")}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={locale === option}
          className={[
            styles.option,
            locale === option && styles.active,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setLocale(option)}
        >
          {LOCALE_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
