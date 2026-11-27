/**
 * Shipping rules for the BADU store.
 *
 * Flat EGP 50 per order, confirmed by the store owner on 28 Nov 2026.
 * The checkout summary and the server-side order total both read from here,
 * so the customer never sees a different number than the stored order.
 */
export const SHIPPING_FLAT_RATE_EGP = 50;
export const SHIPPING_CURRENCY = "EGP";

export function calculateShipping(subtotal: number, currency: string): number {
  if (!subtotal || subtotal <= 0) return 0;
  if (currency !== SHIPPING_CURRENCY) return 0;
  return SHIPPING_FLAT_RATE_EGP;
}
