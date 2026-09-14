# BADU

Modern desert-inspired streetwear. Bilingual (English / Arabic) storefront.

## Stack

- **Next.js 16** (App Router, TypeScript)
- Plain CSS with **design tokens** — no Tailwind, no UI kit
- `next/font` self-hosted fonts: **Fraunces** (Latin display), **Inter** (Latin body), **IBM Plex Sans Arabic** (Arabic)

## Structure

```
src/
  app/                 # routes: layout, page, globals.css
  i18n/                # locale types, dictionaries (locales/en, ar), I18nProvider
  data/products.ts     # static product catalogue (replaced by admin data in STEP 5–7)
  lib/                 # shared types & helpers (product model, price formatting)
  components/
    ui/                # Container, Section, Heading, Button, Logo, Badge, Divider,
                       # LanguageSwitcher
    layout/            # Header, Footer, SkipLink
    product/           # ProductImage
    home/              # Hero
public/images/products/badu-hoodie/   # real hoodie photography goes here (see README)
```

## Bilingual model

- All visible copy lives in `src/i18n/locales/{en,ar}.ts` — nothing is hardcoded in components.
- Locale is stored in a `badu-locale` cookie; the server reads it to render
  `<html lang dir>` and translated metadata, the client `I18nProvider`
  re-renders instantly on switch.
- Styles use logical CSS properties (`padding-inline`, `text-align: start`, …)
  so one component set serves both LTR and RTL.

## Commands

```bash
npm run dev              # Development server
npm run build            # Compile production build
npm run start            # Start production server
npm run lint             # ESLint check
npm run production:check # Production pre-flight verification check
npm run db:backup        # Create transactionally consistent SQLite backup
npm run db:restore       # Restore SQLite database from backup snapshot
npm run db:integrity     # Verify database integrity (PRAGMA integrity_check)
```

## Production Deployment & Operations

For complete deployment instructions, database persistence rules, backup schedules, recovery procedures, and pre-launch checklists, refer to [`DEPLOYMENT.md`](file:///c:/Users/abdel/Downloads/Badu/DEPLOYMENT.md).

## Roadmap

STEP 1 (this): foundation — tokens, typography, i18n, header/footer, hero, product model.
Next: landing page completion, product details, cart, admin, polish.
