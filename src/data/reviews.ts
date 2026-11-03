import type { Review } from "@/lib/types/review";

/**
 * Customer reviews shown in the storefront "Community Reviews" section.
 *
 * INTENTIONALLY EMPTY: only genuine, verifiable reviews may be displayed.
 * Never add invented ratings, testimonials, or "verified purchase" claims.
 * To publish real reviews, append Review objects here (or migrate this to a
 * database-backed source in the future) — the section renders only when at
 * least one review exists.
 */
export const reviews: Review[] = [];
