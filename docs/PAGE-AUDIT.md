# BADU — Full Pages Audit (2026-11-03)

Audit environment: local dev server on SQLite (`data/badu.db`, 14 CMS sections,
6 products, 10 orders), EN + AR locales, throwaway admin user.

## Verdict Summary

| Area | Pages | Status |
| --- | --- | --- |
| Storefront | `/`, `/store`, `/products/[slug]`, `/cart`, `/checkout`, `/checkout/confirmation/*` | ✅ Pass |
| Admin | login, dashboard, products (list/new/edit), orders (list/detail), customers, storefront CMS, visual editor, navigation, footer, settings | ✅ Pass |
| Public APIs | products, storefront, storefront/settings, health, ready, robots, sitemap | ✅ Pass |
| Auth | all `/api/admin/*` + `/api/orders` reject anonymous (401); `/admin` redirects to login (307) | ✅ Pass |
| SEO/JSON-LD | Product + Breadcrumb + Organization + WebSite schema valid | ✅ Pass (after fix) |

## Issues Found & Fixed During This Audit

1. **Product page returned HTTP 200 for non-existent slugs** — SEO flaw (soft
   404). Fixed: `src/app/products/[slug]/page.tsx` now calls `notFound()` for
   missing / unavailable / draft products → real 404. Verified:
   `/products/no-such-product` → 404, real product → 200.

2. **Fabricated `aggregateRating` (4.9 / 1280 reviews) in Product JSON-LD** —
   violated the project's own "no invented ratings" policy and risked Google
   rich-result penalties. Removed. Verified: `aggregateRating` absent from HTML.

## Page-by-Page Notes

- `/` — 14 sections render in CMS order; AR/RTL + EN/LTR verified; new
  products grid (4 real products, unique links) and campaign banner present.
- `/store` — H1, 6 product cards, real prices, unique product links; AR title
  `كتالوج متجر بادو` renders server-side RTL.
- `/products/badu-hoodie` — sizes S–XL, 9 images, 4 JSON-LD blocks, size
  select + add-to-cart verified end-to-end ("ADDED" feedback).
- `/cart` — line item with size, checkout CTA; empty-state copy present.
- `/checkout` — name/phone/email/address/city/country/notes inputs, COD radio,
  WhatsApp ordering button, order summary with currency.
- `/checkout/confirmation/FAKE-123` — graceful handling (200, lookup UI).
- `/admin` — stats + nav; all admin sub-pages return 200 with no error text.
- `/admin/orders` + detail — 10 orders listed; detail shows number, status,
  customer, items, status-update controls.
- `/admin/storefront` — 14 section tabs with bilingual labels + format hints.
- `/admin/storefront/preview` — visual canvas renders all 14 sections in draft
  order with reorder + click-to-select.
- `/admin/settings` — 12 inputs incl. currency + WhatsApp number.
- Sidebar "← Storefront" link is intentional (back to store), not a bug.

## Remaining Notes (not defects)

- Build logs show Neon schema-init warnings when `DATABASE_URL` points at the
  unreachable Neon instance — expected offline; production requires a valid
  `DATABASE_URL`. Local dev should run with `DATABASE_URL=""` for SQLite.
- `/checkout/confirmation/[orderNumber]` returns 200 for unknown orders by
  design (client-side lookup UX).

Checks: `tsc --noEmit` 0 errors · `eslint` 0 errors · `npm run build` succeeds.
