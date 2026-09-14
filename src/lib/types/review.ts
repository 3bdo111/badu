/**
 * Customer review model.
 * Reserved for real, verified reviews only — the storefront must never
 * render fabricated testimonials.
 */
export interface Review {
  id: string;
  author: string;
  /** 1–5 */
  rating: number;
  text: string;
  /** ISO date string, e.g. "2026-09-14". */
  date: string;
  verified: boolean;
}
