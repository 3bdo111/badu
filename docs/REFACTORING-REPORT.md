# BADU — Audit, Refactoring & Modernization Report

**Date:** 2026-11-03
**Scope:** Full-stack audit and targeted refactoring of the BADU e-commerce application (Next.js 16 App Router, React 19, SQLite dev / PostgreSQL prod, bilingual AR/EN).

---

## 1. What Was Changed

### Security
| Change | Files |
| --- | --- |
| Added missing admin authentication to `GET /api/admin/customers` (previously exposed every customer's name, phone, address, and spend publicly) | `src/app/api/admin/customers/route.ts` |
| Removed hardcoded Neon PostgreSQL credentials from a scratch script; now requires `DATABASE_URL` from the environment. **The exposed password must be rotated.** | `scratch/migrate-discount-col.ts` |
| Added brute-force throttling to admin login: max 5 failed attempts per IP+email per 10 minutes → HTTP 429 | `src/app/api/admin/auth/login/route.ts` |
| Server-side validation + normalization of the WhatsApp number in admin settings (E.164-style, rejects invalid input with 400) | `src/app/api/admin/settings/route.ts` |

### Admin dashboard
| Change | Files |
| --- | --- |
| Fixed dashboard "Total Orders" metric: page called a non-existent `/api/admin/orders` (always 404 → always 0); now uses `/api/orders` and parses the array response | `src/app/admin/(dashboard)/page.tsx` |
| Fixed broken Customers page: UI expected `tier`/`totalOrders`/`lastOrderDate` while the API returns `customerTier`/`ordersCount`/`lastOrderAt` — every customer showed as "New", tab counts were 0, dates showed "Invalid Date" | `src/app/admin/(dashboard)/customers/page.tsx` |
| Fixed order-history drawer: real order numbers, product names (`productNameEn/Ar`), size and color per line | `src/app/admin/(dashboard)/customers/page.tsx` |
| Fixed product visibility logic in the editor: `available` was bound to a hidden state no UI could change, so publishing a hidden product kept it hidden. Now derived from the chosen status | `src/components/admin/ProductForm.tsx` |
| Added the missing "Social Share Image (OG Image URL)" field to the SEO tab (state existed but had no input) | `src/components/admin/ProductForm.tsx` |
| Rebuilt `ImageManager`: add images via upload or media library (`MediaPickerModal`), reorder gallery, set primary image (first = primary, matching storefront rendering), edit alt text EN/AR | `src/components/admin/ImageManager.tsx` |
| Added WhatsApp Business Number field to Global Settings with inline format validation | `src/components/admin/cms/SettingsEditor.tsx`, `src/lib/types/cms.ts`, `src/lib/repositories/server-settings-repository.ts` |
| Login page now redirects an already-authenticated admin to the dashboard | `src/app/admin/login/page.tsx` |

### Storefront
| Change | Files |
| --- | --- |
| **New: WhatsApp ordering path.** Checkout shows an "Order via WhatsApp" button when a number is configured. Flow: validate form → persist the order server-side (same idempotent pipeline, stock deducted) → open `wa.me` with a pre-filled bilingual message (order number, items, sizes, quantities, totals, customer details) → redirect to the confirmation page. Button and note are hidden when no number is configured | `src/components/checkout/CheckoutForm.tsx`, `src/app/checkout/checkout.module.css` |
| Checkout total now uses the **actual cart currency** (from the products) instead of a hardcoded `"USD"` | `src/components/checkout/CheckoutForm.tsx` |
| Removed fabricated social proof: hardcoded "5.0 ★★★★★" and "1,200+ verified customers" in Hero and Reviews, plus unverifiable "Verified Purchase" badges. The reviews section now renders **only** when genuine review data exists (`src/data/reviews.ts` is intentionally empty) and otherwise shows only the real store-policy trust banner | `src/components/home/Hero.tsx`, `src/components/home/Reviews.tsx`, `src/data/reviews.ts` |
| Fixed React anti-pattern in `FinalCta` (setState called synchronously in an effect) | `src/components/home/FinalCta.tsx` |

### Infrastructure
| Change | Files |
| --- | --- |
| New public, allow-listed settings endpoint exposing only `whatsappNumber`, `currency`, `brandName` | `src/app/api/storefront/settings/route.ts` |
| New i18n keys for the WhatsApp flow (EN + AR + type declarations) | `src/i18n/locales/en.ts`, `src/i18n/locales/ar.ts`, `src/i18n/types.ts` |
| Editor CSS: `.errorText` / `.helpText` utilities | `src/components/admin/cms/cms-editor.module.css`, `src/app/checkout/checkout.module.css` (WhatsApp button styles) |

---

## 2. Most Important Issues Found in the Original Project

1. **Publicly accessible customer PII** — `/api/admin/customers` had no authentication (critical).
2. **Hardcoded production database credential** committed in `scratch/migrate-discount-col.ts` (critical — rotate the Neon password).
3. **Fabricated marketing claims presented as fact** — invented 5.0 rating, "1,200+ verified customers", and "Verified Purchase" badges (violates the project's own content rules and consumer-trust expectations).
4. **Dashboard order metrics permanently zero** — call to a non-existent API route.
5. **Customers CRM page completely non-functional** — wholesale field-name mismatch between UI and API.
6. **No WhatsApp ordering path** despite it being a core business requirement for a COD-based regional store.
7. **Admin product image management was delete-only** — no upload, no reordering, no primary-image control.
8. **Publishing a hidden product from the editor kept it hidden** — broken availability logic.
9. **Checkout currency hardcoded to USD** regardless of actual product currency.
10. **No brute-force protection** on the admin login endpoint.

## 3. Architecture & Design System (current state)

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, CSS Modules. No UI framework — deliberate, design-token-driven.
- **Data:** dual-adapter database layer (`src/lib/db`) — PostgreSQL (Neon, production via `DATABASE_URL`) or SQLite (`data/badu.db`, development). Explicit, no silent production fallback.
- **Auth:** bcrypt password hashes + database-backed session tokens (httpOnly, `sameSite=lax`, 7-day expiry), enforced server-side per route; admin layout redirects unauthenticated users.
- **Admin mutations** flow through `/api/admin/*` (session-guarded); public product/order reads through `/api/products`, `/api/storefront`; order creation validates and reserves stock atomically with idempotency keys.
- **Design system:** warm desert tokens in `globals.css` (`--color-background #f5f0e8`, `--color-foreground #2b2119`, `--color-primary #c8a77d`, spacing/radii/shadow/typography scales), Fraunces display + Inter body + IBM Plex Sans Arabic, `:focus-visible` outlines, `prefers-reduced-motion` support, RTL-aware utilities (`:lang(ar)` rules, logical properties).
- **i18n:** cookie-persisted locale, full dictionary types (`src/i18n/types.ts`), server renders correct `lang`/`dir`.

## 4. Feature Status

**Fully implemented and verified:**
- Bilingual storefront (AR/EN, RTL/LTR), CMS-driven landing sections, product catalog + PDP with size/stock validation
- Cart (persistent, stock-capped) and COD checkout with idempotent server-side order creation and atomic stock reservation
- Admin: products CRUD with media upload/reorder/primary, stock editor, orders with status state machine, customers CRM with tiers, storefront/navigation/footer/settings CMS
- **WhatsApp ordering** (new) — configurable number, order persisted before redirect, encoded bilingual message
- Security: session auth on all admin routes, login throttling, validated uploads (type/size/server-generated filenames)

**Requires configuration:**
- `whatsappNumber` in Global Settings (Admin → Settings) — empty disables the feature
- `BLOB_READ_WRITE_TOKEN` in production for durable image uploads (Vercel Blob)
- `DATABASE_URL` (production PostgreSQL), `ADMIN_BOOTSTRAP_*`, `SESSION_SECRET` — see `.env.example`

**Known limitations:**
- Login throttling is in-memory per server instance; add edge/WAF rate limiting for multi-instance production.
- Reviews system is data-file-driven and intentionally empty until genuine reviews exist.
- No automated test suite ships with the repo; verification was done via typecheck, lint, production build, and scripted browser flows (see §5).

## 5. Tests Actually Executed

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (19 benign unused-var warnings remain) |
| `npm run build` | ✅ Compiled successfully, all routes generated |
| Unauthorized `GET /api/admin/customers` | ✅ 401 |
| Login throttle (6 wrong attempts) | ✅ 5×401 then 429 |
| Settings: invalid WhatsApp `abc123` | ✅ 400; valid `+20 100 537 1029` saved + normalized; public API returns digits-only number |
| WhatsApp checkout end-to-end (AR locale) | ✅ Order `BADU-479720` created server-side (PENDING, COD, correct totals/items), WhatsApp button + note rendered, redirected to confirmation; test order deleted afterwards |
| Dashboard metrics | ✅ Orders count = 10 (was 0) |
| Customers page | ✅ Tiers 1 VIP / 2 Returning / 3 New, real dates, order history with items |
| Homepage | ✅ No fabricated rating/count remains; trust banner intact; WhatsApp number not leaked publicly except via public settings endpoint (allow-listed fields only) |
| Image manager | ✅ Add/upload via media picker modal, primary badge, reorder controls, alt inputs render |

## 6. Remaining Risks / Recommendations

1. **Rotate the Neon database password** that was committed to git history (in `scratch/migrate-discount-col.ts`).
2. Purge the credential from git history if this repository is or will be shared (`git filter-repo` / BFG).
3. Consider adding edge rate limiting + bot protection in front of `/api/admin/auth/login` for production.
4. Add an automated test suite (the repo has none) — Vitest for business logic + Playwright for purchase flows.
5. Orders list loads all rows; add server-side pagination when order volume grows.

## 7. Sample Environment Configuration

See `.env.example` (placeholders only). Required for production: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`/`APP_URL`, `SESSION_SECRET`, `ADMIN_BOOTSTRAP_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD` (first boot only).

## 8. Database & Migrations

- Dev (SQLite): automatic schema init + seed on first run (`data/badu.db`).
- Prod (PostgreSQL): `DATABASE_URL` required; schema init + seed run at startup. One-off scripts live in `src/scripts/` (`db:backup`, `db:restore`, `db:integrity`, `db:migrate:up`, `db:migrate:media`, `db:migrate-pg`).
- Backup: `npm run db:backup`.

## 9. Run Locally

```bash
npm install
npm run dev        # http://localhost:3000 (SQLite dev DB)
npm run build && npm start
```

## 10. Production Deployment

1. Provision PostgreSQL (e.g. Neon) and Vercel Blob; set env vars from `.env.example`.
2. Set `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` — the first admin is created only when `admin_users` is empty, then remove them from env.
3. Configure `NEXT_PUBLIC_SITE_URL` / `APP_URL` to the canonical domain.
4. Deploy to Vercel (or any Node host); the app refuses to start in production without `DATABASE_URL`.
5. Admin → Settings: set currency + WhatsApp number.

## 11. Features: Implemented vs. Needs Configuration

| Feature | Status |
| --- | --- |
| Storefront AR/EN, RTL/LTR | ✅ Implemented |
| Cart + COD checkout + order persistence | ✅ Implemented |
| WhatsApp ordering | ✅ Implemented — needs `whatsappNumber` in Settings |
| Admin product/media/orders/customers/CMS | ✅ Implemented |
| Full landing-page CMS control (all 14 sections: content, visibility, order) | ✅ Implemented — see §12 |
| Reviews display | ✅ Implemented — renders only with genuine/owner-entered data (currently none) |
| Online card payment | ❌ Not in scope (COD + WhatsApp only) |
| Automated tests | ❌ Not implemented — recommended next |

## 12. Landing Page ↔ Admin Full Control (2026-11-03)

Every section of the landing page is now driven by the `storefront_sections`
CMS table — no hard-coded sections remain.

**Section registry** — `src/lib/storefront/section-definitions.ts` is the
single source of truth: 14 section keys (`hero`, `trust_bar`, `product_intro`,
`product_showcase`, `product_grid`, `story`, `artwork`, `campaign`,
`featured_product`, `features`, `size_guide`, `reviews`, `faq`, `final_cta`),
each with bilingual admin labels, default content, field metadata (CTA /
image / featured product) and structured-body format hints.

**Seeding** — `ensureLandingSections()` in `src/lib/db/seed.ts` runs at every
startup (SQLite + PostgreSQL): inserts registry keys missing from the
database and renumbers `sort_order` to the canonical order. Existing content
and draft columns are never touched. Verified: dev DB migrated from 5 → 14
rows with zero content loss.

**Rendering** — `src/app/page.tsx` renders `getPublicSections()` (published +
visible, admin-ordered) through a key→component map; a full legacy fallback
renders if the database is unavailable. Structured section bodies use a pipe
format, one item per line (`icon | text`, `title | body`, `question |
answer`, `author | rating | text`, `size | chest | length | sleeve`); empty
fields fall back to the built-in translations so out-of-the-box rendering is
unchanged.

**New sections**
- `product_grid` — `FeaturedProductsGrid`: editorial grid of real catalogue
  products (availability- and status-filtered), links to `/products/[slug]`,
  real prices/currency; grid size configurable via section subtitle.
- `campaign` — `LifestyleCampaign`: full-bleed campaign banner with CMS
  image, headline, subline and CTA (defaults to the story asset).

**Admin UIs updated**
- `/admin/storefront` — tabs, labels, per-section field visibility and body
  format hints all derive from the shared registry (14 tabs verified).
- `/admin/storefront/preview` (visual editor) — canvas renders all visible
  sections in draft order with click-to-select + reorder; sidebar edits
  expose every registry field (CTA fields, media picker, featured product,
  visibility).

**Verified end-to-end** — hide + publish a section (landing drops it),
structured FAQ override renders custom items, restore returns the page to
all 14 sections; AR/RTL and EN/LTR both render every section; `tsc --noEmit`
0 errors, `eslint` 0 errors (2 pre-existing unused-var warnings),
`npm run build` succeeds.
