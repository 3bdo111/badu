/**
 * Analytics event bridge.
 *
 * Nothing fires until an ID is configured in Vercel:
 *   NEXT_PUBLIC_META_PIXEL_ID          Meta pixel
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID      optional GA4
 * The helpers no-op when the pixels are not loaded, so wiring events now is
 * safe and the ID can be switched on later without touching components.
 */
type EventName = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | "Lead";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: EventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, params);
    window.gtag?.("event", event, params);
  } catch {
    // Analytics must never break the storefront.
  }
}
