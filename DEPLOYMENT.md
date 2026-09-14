# BADU E-Commerce — Production Deployment, Backup & Operational Guide

This document provides complete instructions for deploying, persisting, backing up, restoring, monitoring, and operating the **BADU** bilingual luxury streetwear e-commerce platform in production environments.

---

## 1. System & Runtime Requirements

- **Node.js**: `v20.x` or higher (LTS recommended)
- **Runtime Model**: Server instance with persistent local filesystem access (VPS, Docker with mounted persistent volumes, AWS EC2, DigitalOcean Droplet, Railway with Persistent Disk, etc.)
- **Database**: SQLite 3 (managed via `better-sqlite3` with WAL journal mode)
- **Payment Method**: Cash-on-Delivery (COD) Only — 100% offline payment flow
- **Storage Requirement**: Persistent disk mounts for:
  - Database Directory: `./data/`
  - Uploaded Media Directory: `./public/uploads/`

> [!IMPORTANT]
> **Ephemeral Containers Alert**: If deploying via containerized platforms (e.g. AWS ECS, Kubernetes, Railway), you **MUST** mount persistent volume storage for `./data/` and `./public/uploads/`. Ephemeral container restarts without persistent storage will lose live database records and CMS media uploads!

---

## 2. Production Environment Configuration

Copy `.env.example` to `.env.local` or configure container environment variables:

```env
# Production Environment Flag
NODE_ENV=production

# Database Persistence Path
DATABASE_PATH=./data/badu.db

# Admin Authentication & Bootstrap Credentials
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=CHANGE_THIS_TO_A_STRONG_ADMIN_PASSWORD

# Public Application URL & Domain Settings
APP_URL=https://badu.store
NEXT_PUBLIC_SITE_URL=https://badu.store

# Session Security Secret
SESSION_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY
```

> [!CAUTION]
> Never commit real production secrets, passwords, or production database files into git.

---

## 3. Database Persistence & Initialization

The database auto-initializes on startup via [`src/lib/db/db.ts`](file:///c:/Users/abdel/Downloads/Badu/src/lib/db/db.ts):
- Creates `./data/` directory if missing.
- Sets SQLite pragmas: `journal_mode = WAL` and `foreign_keys = ON`.
- Runs idempotent table schema creation (`products`, `product_images`, `product_colors`, `product_stock`, `admin_users`, `admin_sessions`, `orders`, `order_items`, `storefront_sections`).
- Executes schema migrations safely if upgrading an existing database without data loss.
- Seeds default catalog and admin user **ONLY if database tables are empty**.

---

## 4. Production Build & Runtime Commands

To build and run the application in production:

```bash
# 1. Install production dependencies
npm ci

# 2. Run production pre-flight check
npm run production:check

# 3. Compile optimized production build
npm run build

# 4. Start production server
npm run start
```

---

## 5. Health & Readiness Monitoring

The platform provides lightweight, unauthenticated health and readiness endpoints for load balancers, uptime monitors, and Kubernetes probes:

### 5.1 System Health (`GET /api/health`)
- **URL**: `https://your-domain.com/api/health`
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-15T00:15:00.000Z"
  }
  ```
- Returns `503 Service Unavailable` if database connectivity fails.

### 5.2 Application Readiness (`GET /api/ready`)
- **URL**: `https://your-domain.com/api/ready`
- **Response**: `200 OK`
  ```json
  {
    "status": "ready",
    "database": true,
    "schema": true,
    "timestamp": "2026-09-15T00:15:00.000Z"
  }
  ```

---

## 6. Database Backup System

### 6.1 Creating a Live Backup (`npm run db:backup`)
Execute the CLI database backup script:

```bash
npm run db:backup
```

- **Mechanism**: Calls `better-sqlite3` native `.backup()` API, creating a transactionally consistent, online snapshot without locking live database queries.
- **Location**: `data/backups/badu-YYYY-MM-DDTHH-mm-ssZ.db`
- **Integrity**: Runs `PRAGMA integrity_check` on the generated backup file automatically before returning success.
- **Custom Location**: Specify custom output path if desired:
  ```bash
  npx tsx src/scripts/db-backup.ts /mnt/external-backups/daily.db
  ```

---

## 7. Database Restoration System

### 7.1 Restoring from Backup (`npm run db:restore`)
To restore the live database from a target backup file:

```bash
npm run db:restore -- ./data/backups/badu-2026-09-15T001500Z.db
```

### 7.2 Safety Protocol Enforced During Restore:
1. Validates `PRAGMA integrity_check` on the backup file prior to restore.
2. Creates an automatic safety copy of the live database (`data/backups/safety-before-restore-TIMESTAMP.db`) before modifying any files.
3. Overwrites live database file and purges stale `-wal` / `-shm` sidecars.
4. Verifies post-restoration database integrity.

---

## 8. Database Integrity Check

Run an on-demand integrity check against the live database or backup file:

```bash
# Check live database
npm run db:integrity

# Check specific backup file
npx tsx src/scripts/db-integrity.ts ./data/backups/badu-2026-09-15T001500Z.db
```

---

## 9. Media & Product Asset Protection

- Uploaded storefront images are saved under `public/uploads/storefront/`.
- Authentic product imagery (`front-v6.jpg`, `back-v6.jpg`, `detail-1-v2.jpg`, `detail-2-v2.jpg`) in `public/images/products/badu-hoodie/` are version-controlled hero assets and MUST NOT be removed or overwritten by upload operations.
- Ensure automated server backup tasks include `public/uploads/` alongside `data/backups/`.

---

## 10. Security & Cookie Guidelines

- **HTTPS Requirement**: Production deployment MUST run behind HTTPS (SSL/TLS terminated via reverse proxy like Nginx, Caddy, Cloudflare, or Vercel).
- **Admin Session Cookies**: When `NODE_ENV=production`, `badu_admin_session` cookies automatically set `Secure`, `HttpOnly`, `SameSite=Lax`, and check active expiration times.
- **HTTP Security Headers**: Native headers configured in `next.config.ts` (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, `Permissions-Policy`).
- **Crawler Privacy**: `robots.txt` disallows `/admin`, `/checkout`, `/confirmation/*`, `/cart`, and `/api/*`.

---

## 11. Rollback Procedure

In the event of a deployment issue:

### Application Code Rollback
1. Revert to previous Git release tag or Docker image tag.
2. Re-run `npm run build`.
3. Restart Next.js server (`npm run start`).

### Database Rollback
1. Stop incoming web traffic or place site in maintenance mode.
2. Run `npm run db:backup` to capture current state.
3. Identify target known-good backup file in `data/backups/`.
4. Run `npm run db:restore -- <backup-file-path>`.
5. Run `npm run db:integrity` to confirm database health.
6. Restart Next.js server (`npm run start`).

---

## 12. Pre-Launch Checklist

- [x] **Lint & Type Safety**: `npm run lint` and `npx tsc --noEmit` pass with zero errors.
- [x] **Production Build**: `npm run build` compiles cleanly.
- [x] **Pre-Flight Verification**: `npm run production:check` passes 100%.
- [x] **Secrets Hygiene**: `.env.local` contains strong production passwords and secrets.
- [x] **Persistent Storage**: `./data/` and `./public/uploads/` are mounted on persistent storage.
- [x] **Database Backup**: `npm run db:backup` tested and verified.
- [x] **Recovery Pipeline**: E2E backup/restore tested (`scratch/test-phase18.ts`).
- [x] **Health Probes**: `/api/health` and `/api/ready` returning 200 OK.
- [x] **Cash-on-Delivery**: Order placement & state machine verified COD-only.
- [x] **Visual CMS**: Live preview, draft isolation, and publishing verified.
- [x] **Production Server Launch**: `npm run start` running on `NODE_ENV=production`.
- [x] **Restart Persistence**: Server restart verified with 100% data preservation.

---

## 13. Phase 19 — Production Verification Summary

- **Production Server**: Launched via `npm run start` (`NODE_ENV=production`)
- **API Health (`/api/health`)**: Verified `200 OK` (`{"status":"ok"}`)
- **API Readiness (`/api/ready`)**: Verified `200 OK` (`{"status":"ready"}`)
- **Security Response Headers**: Verified `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN`
- **Robots Disallow Rules**: Verified `/admin`, `/checkout`, `/cart` disallows
- **Browser E2E Smoke Test**: Verified Admin Login, Dashboard, Visual CMS Preview, Dynamic Store, Product Page, Cart Drawer, COD Checkout, and Order Confirmation (`BADU-597332`)
- **Restart Persistence**: Production server restarted; database records, orders, and storefront sections verified 100% intact.

---

## 14. Phase 19.2 — Vercel Production Deployment Guide

Phase 19.2 makes BADU 100% compatible with Vercel serverless platform without breaking local development.

### 14.1 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS EDGE                   │
│                                                             │
│   Next.js App Router API & Server Components (Stateless)    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│    MANAGED POSTGRESQL       │  │      VERCEL BLOB          │
│   (Neon / Vercel Postgres)  │  │    (Durable CMS Uploads)   │
│                             │  │                             │
│  - Products & Categories    │  │  - Uploaded CMS Images    │
│  - Dynamic Storefront CMS   │  │  - Visual Editor Media    │
│  - Orders & COD State       │  │                             │
│  - Admin Sessions           │  │                             │
└─────────────────────────────┘  └─────────────────────────────┘
```

- **Dual-Database Driver**: 
  - **Local Development**: Auto-selects SQLite (`better-sqlite3` at `./data/badu.db`) when `DATABASE_URL` is unconfigured.
  - **Vercel Production**: Auto-selects Managed PostgreSQL (`@neondatabase/serverless`) when `DATABASE_URL` or `POSTGRES_URL` is set.
- **Dual-Media Storage**:
  - **Local Development**: Saves CMS uploads locally to `public/uploads/storefront/`.
  - **Vercel Production**: Saves CMS uploads to durable Vercel Blob storage when `BLOB_READ_WRITE_TOKEN` is configured.

---

### 14.2 Managed PostgreSQL Database Setup

1. **Create Database**:
   - Provision a serverless PostgreSQL instance via [Neon.tech](https://neon.tech) or Vercel Marketplace (`Vercel Postgres`).
2. **Execute DDL Schema**:
   - Run the Postgres DDL script located at [`src/lib/db/pg-schema.sql`](file:///c:/Users/abdel/Downloads/Badu/src/lib/db/pg-schema.sql) in your database query editor.
3. **Copy PostgreSQL Connection String**:
   - Copy the Pooled Connection String (e.g. `postgres://user:pass@ep-xyz.us-east-1.aws.neon.tech/badu?sslmode=require`).

---

### 14.3 Data & Media Migration Commands

Before going live on Vercel, migrate existing SQLite products, orders, and storefront sections into PostgreSQL:

```bash
# 1. Export SQLite data and print SQL INSERT statements / Migrate directly to PostgreSQL
# Set DATABASE_URL in your environment first:
export DATABASE_URL="postgres://user:pass@ep-xyz.us-east-1.aws.neon.tech/badu?sslmode=require"

# Run data migration script:
npm run db:migrate-pg

# 2. Upload local CMS media files to Vercel Blob (requires BLOB_READ_WRITE_TOKEN):
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxx"
export CONFIRM=MIGRATE

npm run media:migrate
```

---

### 14.4 Vercel Environment Variables Configuration

In Vercel Dashboard $\rightarrow$ **Project Settings** $\rightarrow$ **Environment Variables**, configure:

| Variable Name | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Pooled PostgreSQL Connection URI | `postgres://user:pass@ep-xyz.us-east-1.neon.tech/badu?sslmode=require` |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Vercel Blob Access Token | `vercel_blob_rw_123456789...` |
| `ADMIN_BOOTSTRAP_EMAIL` | **Yes** | Initial Admin Email | `admin@example.com` |
| `ADMIN_BOOTSTRAP_PASSWORD` | **Yes** | Initial Admin Password | `StrongAdminPassword123!` |
| `SESSION_SECRET` | **Yes** | 64+ char session secret key | `super-secret-random-hex-string-here` |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Public Production URL | `https://badu.vercel.app` |

---

### 14.5 Preview vs. Production Database Safety Rules

- **Production Branch (`main`)**: Point `DATABASE_URL` to your **Production PostgreSQL Database**.
- **Preview Deployments (Pull Requests)**: Point `DATABASE_URL` to a **Branch / Staging PostgreSQL Database** (Neon supports instant zero-copy DB branching) to avoid pollution of production orders and products during feature previews.

---

### 14.6 Step-by-Step Vercel Handover Guide

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework Preset: **Next.js**.
4. Configure all Environment Variables listed in Section 14.4.
5. Click **Deploy**.
6. Run `npm run db:migrate-pg` locally (with `DATABASE_URL` pointing to production PostgreSQL) to populate live products, storefront CMS sections, and orders.
7. Run `npm run media:migrate` locally (with `BLOB_READ_WRITE_TOKEN` and `DATABASE_URL`) to upload media assets to Vercel Blob.
8. Verify production URL:
   - Perform order lookup / test COD checkout.
   - Access `/admin` dashboard and Visual CMS Editor.


