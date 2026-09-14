import type { Locale } from "@/i18n/types";

/**
 * Locale-aware price formatting.
 * Currency code lives on the product; display adapts to the active locale.
 */
export function formatPrice(
  amount: number,
  currency: string,
  locale: Locale
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
