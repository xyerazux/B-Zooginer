# B-Zooginer Deployment Guide

> Local development setup, Supabase configuration, Vercel deployment, and production readiness checklist.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Variables](#environment-variables)
4. [Supabase Project Setup](#supabase-project-setup)
5. [Storage Bucket Setup](#storage-bucket-setup)
6. [Edge Function Deployment](#edge-function-deployment)
7. [Database Migration Strategy](#database-migration-strategy)
8. [Git Branching Strategy](#git-branching-strategy)
9. [Vercel Deployment](#vercel-deployment)
10. [Pre-Launch Checklist](#pre-launch-checklist)

---

## Prerequisites

| Tool | Min Version | Install |
|------|-------------|---------|
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) |
| npm | 10.x | Bundled with Node |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| Supabase CLI | latest | `npm install -g supabase` |
| Docker Desktop | 4.x | Required for `supabase start` |

```bash
# Verify versions
node -v    # v20.x.x
npm -v     # 10.x.x
supabase --version
docker --version
```

---

## Local Development Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/b-zooginer.git
cd b-zooginer
npm install
```

### 2. Start Supabase Local Stack

```bash
# Initialize (only on first clone)
supabase init

# Start the local stack (requires Docker Desktop running)
supabase start
```

After starting, Supabase CLI prints the local service URLs:

```
API URL:     http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL:      postgresql://postgres:postgres@localhost:54322/postgres
Studio URL:  http://localhost:54323
Inbucket:    http://localhost:54324   ← email testing
anon key:    eyJ...
service_role key: eyJ...
```

> [!IMPORTANT]
> Copy the `anon key` from the output — you will need it for `.env.local`.

### 3. Apply Migrations

```bash
# Push all migrations to local DB
supabase db push

# Or run a specific migration
supabase db push --include-seed
```

### 4. Configure Local Environment

```bash
# Copy the template
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon key from supabase start output>
```

### 5. Start the Dev Server

```bash
npm run dev
```

App available at: `http://localhost:5173`

### 6. Seed Development Data (Optional)

```bash
# Apply seed file (if present)
supabase db reset  # resets + re-applies migrations + seed

# Or run seed manually
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/seed.sql
```

### Full Local Dev Workflow

```bash
# Terminal 1 — Supabase
supabase start

# Terminal 2 — Frontend
npm run dev

# Terminal 3 — Tests (optional, watch mode)
npm run test:watch
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project API URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |

> [!CAUTION]
> **Never** expose the `service_role` key in the frontend. The `service_role` key bypasses all RLS policies and must only ever be used in server-side Edge Functions, never in client code or committed to version control.

### Optional / Future Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_ENV` | Environment label | `development` |
| `VITE_MAX_UPLOAD_MB` | Max image upload size in MB | `2` |
| `VITE_SITE_NAME` | Display name override | `B-Zooginer` |

### .env.example

```env
# .env.example — commit this file; never commit .env.local or .env.production

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App
VITE_APP_ENV=development
```

### .gitignore entries

```gitignore
.env.local
.env.production
.env.*.local
```

### Supabase Client Initialization

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

---

## Supabase Project Setup

### 1. Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Fill in:
   - **Name:** `b-zooginer`
   - **Database Password:** Generate a strong password and save it in a password manager
   - **Region:** Choose closest to your users (e.g., Southeast Asia)
4. Wait for provisioning (~2 minutes)

### 2. Link CLI to Project

```bash
# From project root
supabase login
supabase link --project-ref <your-project-ref>
# Project ref is in: Dashboard → Settings → General → Reference ID
```

### 3. Push Migrations to Production

```bash
supabase db push
```

### 4. Configure Auth

In Supabase Dashboard → **Authentication** → **Settings**:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-domain.vercel.app` |
| Redirect URLs | `https://your-domain.vercel.app/auth/callback` |
| Email confirmations | Disabled (admin accounts are created manually) |
| JWT expiry | 3600 seconds (1 hour) |

> [!NOTE]
> Since MASTER_ADMIN and GROUP_ADMIN accounts are provisioned manually by the platform owner, there is no self-registration flow. Email confirmation can remain off.

### 5. Create Admin Accounts

Admin accounts are created via Supabase Dashboard or CLI — not via the app's signup flow:

```bash
# Create master admin via Supabase CLI
supabase auth users create --email master@bzooginer.id --password "strong-password-here"

# Then in DB, insert profile record:
# In Supabase Studio SQL editor:
INSERT INTO public.profiles (id, role, group_id, full_name)
SELECT id, 'master_admin', NULL, 'Master Admin'
FROM auth.users
WHERE email = 'master@bzooginer.id';
```

For GROUP_ADMIN accounts, provide the correct `group_id`:

```sql
INSERT INTO public.profiles (id, role, group_id, full_name)
SELECT id, 'group_admin', 'g1-uuid-here', 'Admin Kelompok A'
FROM auth.users
WHERE email = 'admin.kelompok-a@bzooginer.id';
```

---

## Storage Bucket Setup

Three storage buckets are required. Each has specific access policies.

### Bucket Definitions

| Bucket Name | Public? | Contents | Max File Size |
|-------------|---------|----------|--------------|
| `groups-media` | ✅ Public read | Group logos, posters | 2 MB |
| `products-media` | ✅ Public read | Product images | 2 MB |
| `site-assets` | ✅ Public read | Hero banners, site logo | 2 MB |

### Create via Supabase Dashboard

1. Go to **Storage** → **New Bucket**
2. Create each bucket with the name from the table above
3. For each: toggle **Public bucket** ON (files are served publicly via CDN URL)

### Create via SQL Migration

```sql
-- supabase/migrations/20261121_storage_buckets.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('groups-media',   'groups-media',   true, 2097152, '{image/webp,image/jpeg,image/png}'),
  ('products-media', 'products-media', true, 2097152, '{image/webp,image/jpeg,image/png}'),
  ('site-assets',    'site-assets',    true, 2097152, '{image/webp,image/jpeg,image/png,image/svg+xml}');
```

### Storage RLS Policies

```sql
-- Allow public read on all three buckets (already handled by public=true)

-- Allow authenticated admins to upload to groups-media
CREATE POLICY "Admins can upload to groups-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'groups-media'
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('master_admin', 'group_admin')
  )
);

-- Allow admins to delete their own group's files
CREATE POLICY "Admins can delete from groups-media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'groups-media'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('master_admin', 'group_admin')
);

-- Similar policies for products-media (group_admin restricted to own group_id prefix)
-- Similar policies for site-assets (master_admin only)
```

### File Path Conventions

```
groups-media/
  {group_id}/
    poster.webp
    logo.webp

products-media/
  {group_id}/
    {product_id}.webp

site-assets/
  hero.webp
  logo.webp
  logo.svg
```

### Accessing Storage URLs in Code

```ts
// src/lib/storage.ts
import { supabase } from './supabase'

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Usage
const posterUrl = getPublicUrl('groups-media', `${groupId}/poster.webp`)
```

---

## Edge Function Deployment

Edge Functions handle operations that must bypass client-side RLS restrictions, such as public order submission.

### Function: `submit-order`

**Purpose:** Accept a public order submission, validate it server-side, generate an order code, deduct stock atomically, and insert the order record. This function runs with the `service_role` key on the server — never exposed to the client.

### Local Development

```bash
# Serve all functions locally
supabase functions serve --env-file .env.local

# Or serve a specific function
supabase functions serve submit-order --env-file .env.local

# Functions run at: http://localhost:54321/functions/v1/<function-name>
```

### Function Structure

```
supabase/
  functions/
    submit-order/
      index.ts
    confirm-order/        # future: admin webhook or automation
      index.ts
```

```ts
// supabase/functions/submit-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Safe: server-side only
    )

    const body = await req.json()
    // Validate body, generate order_code, deduct stock, insert order...
    // (full implementation in src reference)

    return new Response(JSON.stringify({ order_code: 'BZG-...' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

### Deploy to Production

```bash
# Deploy a single function
supabase functions deploy submit-order --project-ref <your-project-ref>

# Deploy all functions
supabase functions deploy --project-ref <your-project-ref>
```

### Set Function Secrets

```bash
# In production, set the service role key as a secret (not in .env)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Verify secrets
supabase secrets list
```

> [!CAUTION]
> Never commit the `service_role` key to source control. Use `supabase secrets set` exclusively. The key is automatically available as `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` inside Edge Functions.

---

## Database Migration Strategy

### Migration Files

All schema changes live in `supabase/migrations/`. Each file is prefixed with a UTC timestamp.

```
supabase/
  migrations/
    20261121000001_initial_schema.sql
    20261121000002_storage_buckets.sql
    20261121000003_rls_policies.sql
    20261121000004_seed_functions.sql
    20261122000001_add_activity_logs.sql
```

### Creating a New Migration

```bash
# Generate a timestamped file
supabase migration new add_product_featured_flag

# Edit the file
# supabase/migrations/20261122000002_add_product_featured_flag.sql

# Apply locally
supabase db push

# Apply to production
supabase db push --project-ref <your-project-ref>
```

> [!WARNING]
> **Never** edit existing migration files after they have been applied to any environment. Create a new migration instead. Modifying applied migrations will cause checksum mismatches.

### Migration Rules

1. **Additive preferred:** `ADD COLUMN`, `CREATE TABLE`, `CREATE INDEX` are safe to apply without downtime.
2. **Destructive changes** (`DROP COLUMN`, `DROP TABLE`) require a deprecation migration first (e.g., mark column as `NOT NULL DEFAULT` with a safe value, then remove in a follow-up migration after deploy is confirmed).
3. **RLS policies** are always in their own migration file, separate from table DDL.
4. **Seed data** (initial groups, site settings) lives in `supabase/seed.sql` — this is for local development only, not applied to production.

### Production Migration Workflow

```bash
# 1. Test locally
supabase db push

# 2. Verify on local stack
supabase db diff  # view pending changes

# 3. Push to production (runs in a transaction, rolls back on failure)
supabase db push --project-ref <your-project-ref>

# 4. Verify in Supabase Studio
# Dashboard → Table Editor — confirm schema looks correct
```

### Schema Version Tracking

```sql
-- Check applied migrations
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

---

## Git Branching Strategy

```
main          ← production (Vercel auto-deploys on push)
│
└─ dev        ← integration branch (merge target for features)
   │
   ├─ feature/public-order-form
   ├─ feature/admin-dashboard
   ├─ feature/product-variants
   └─ fix/order-code-collision
```

### Branch Rules

| Branch | Purpose | Merge Target | CI Required |
|--------|---------|--------------|-------------|
| `main` | Production — always stable | — | Yes (must pass all tests) |
| `dev` | Integration — latest development | `main` (PR) | Yes |
| `feature/*` | New feature development | `dev` (PR) | Yes |
| `fix/*` | Bug fixes | `dev` or `main` (hotfix) | Yes |
| `chore/*` | Config, deps, non-code | `dev` | Yes |

### Workflow

```bash
# Start a new feature
git checkout dev
git pull origin dev
git checkout -b feature/admin-product-form

# Work, commit, push
git add .
git commit -m "feat: add product form with variant support"
git push origin feature/admin-product-form

# Open PR: feature/admin-product-form → dev
# After review + CI pass → merge to dev

# When dev is stable and ready for release:
# Open PR: dev → main
# After final review → merge → Vercel auto-deploys
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add product variant support
fix: resolve concurrent stock deduction race condition
chore: update supabase-js to v2.39
docs: update deployment guide with storage bucket policies
refactor: extract order code generation to standalone util
test: add RLS tests for group_admin isolation
```

---

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Install command: `npm ci`

### 2. Configure Environment Variables in Vercel

In Vercel project → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xyzcompany.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview |
| `VITE_APP_ENV` | `production` | Production only |
| `VITE_APP_ENV` | `preview` | Preview only |

> [!IMPORTANT]
> Never put `SUPABASE_SERVICE_ROLE_KEY` in Vercel. It is not needed by the frontend. It lives only in Supabase's own function secrets.

### 3. Configure Vercel for SPA Routing

Create `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

This ensures React Router handles all client-side routes without 404s on page refresh.

### 4. Configure Supabase Auth Redirect URLs

After getting your Vercel preview and production URLs, add them to Supabase:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL:** `https://b-zooginer.vercel.app`
3. **Redirect URLs:** Add:
   - `https://b-zooginer.vercel.app/auth/callback`
   - `https://*.vercel.app/auth/callback` (for preview deployments)

### 5. Custom Domain (Optional)

In Vercel project → **Settings** → **Domains** → Add your domain → Follow DNS instructions.

After adding:
1. Update Supabase **Site URL** to the custom domain
2. Update **Redirect URLs** to include `https://your-domain.com/auth/callback`

### 6. Deployment Verification

After every deploy, verify:

```bash
# Check the deployment URL
curl -I https://b-zooginer.vercel.app

# Verify env vars are picked up (check Network tab in browser DevTools)
# API calls should go to: https://xyzcompany.supabase.co/rest/v1/...
```

### Preview Deployments

Vercel automatically creates a preview deployment for every PR. This is useful for QA. Preview deployments use the same `VITE_SUPABASE_*` values set for the **Preview** environment in Vercel settings.

---

## Pre-Launch Checklist

Complete every item before going live. Items marked 🔴 are hard blockers.

### Security

- [ ] 🔴 `service_role` key is NOT in any frontend file or Vercel env
- [ ] 🔴 All RLS policies are applied and tested (run RLS test suite against production)
- [ ] 🔴 anon role cannot directly INSERT into `orders` table
- [ ] 🔴 anon role cannot SELECT `payment_status` or `order_status` by direct table query
- [ ] 🔴 Storage buckets are set to public **read**, authenticated **write** only
- [ ] 🔴 `.env.local` and `.env.production` are in `.gitignore` and not committed
- [ ] Auth redirect URLs in Supabase match the Vercel production URL
- [ ] Admin accounts exist with correct roles and group assignments
- [ ] No `console.log` statements leaking sensitive data in production build

### Database

- [ ] 🔴 All migrations applied to production (`supabase db push` verified)
- [ ] `order_code` has UNIQUE constraint
- [ ] `deduct_variant_stock` DB function exists and tested
- [ ] All indexes created (order_code, group_id FKs, payment_status, order_status)
- [ ] Supabase Realtime is enabled on `orders` table (if used for live dashboard)
- [ ] Database backups are enabled in Supabase dashboard

### Storage

- [ ] 🔴 All 3 buckets created: `groups-media`, `products-media`, `site-assets`
- [ ] 🔴 Storage RLS policies applied
- [ ] File size limit set to 2 MB per bucket
- [ ] MIME type restrictions applied (`image/webp`, `image/jpeg`, `image/png`)
- [ ] Test image upload and retrieval via public URL

### Edge Functions

- [ ] 🔴 `submit-order` function deployed to production
- [ ] 🔴 Function secrets (`SUPABASE_SERVICE_ROLE_KEY`) set via `supabase secrets set`
- [ ] Function tested end-to-end with a real order submission
- [ ] CORS headers configured correctly in function

### Frontend

- [ ] 🔴 `npm run build` completes without errors or TypeScript errors
- [ ] `npm run test` passes (all unit + integration tests green)
- [ ] RLS test suite passes against production
- [ ] Vercel environment variables set for `production` environment
- [ ] `vercel.json` with SPA rewrite rule committed
- [ ] No hardcoded localhost URLs remaining in source code
- [ ] `console.log` statements removed or stripped in production build
- [ ] All pages tested on mobile viewport (375px)

### Content & UX

- [ ] All groups created with correct slugs, poster, logo
- [ ] All products created with correct images, prices, variant data
- [ ] Site logo and hero banner uploaded to `site-assets`
- [ ] Public storefront accessible without login
- [ ] Order submission tested end-to-end (place a real test order)
- [ ] Order code is received and displays correctly in `JetBrains Mono`
- [ ] Admin login tested for both MASTER_ADMIN and GROUP_ADMIN roles
- [ ] Order status update flow tested (new → confirmed → completed)
- [ ] Payment status update restricted to MASTER_ADMIN (confirmed in test)

### Performance

- [ ] Lighthouse score ≥ 85 (Performance) on mobile
- [ ] All product/group images are WebP format
- [ ] Images lazy-loaded where appropriate
- [ ] Google Fonts loaded with `display=swap` and `preconnect`
- [ ] Vite bundle analyzed (`npm run build -- --report`) — no unexpectedly large chunks

### Monitoring

- [ ] Supabase Dashboard alerts configured (connection pool, storage usage)
- [ ] Vercel deployment notifications enabled
- [ ] Error tracking considered for Phase 7+ (e.g., Sentry)

---

## Quick Reference

```bash
# Local dev (full stack)
supabase start && npm run dev

# Apply migrations locally
supabase db push

# Apply migrations to production
supabase db push --project-ref <ref>

# Deploy edge functions
supabase functions deploy --project-ref <ref>

# Set a production secret
supabase secrets set KEY=value --project-ref <ref>

# Generate TypeScript types from DB schema
supabase gen types typescript --project-ref <ref> > src/types/supabase.ts

# Reset local DB (drops all data, re-applies migrations + seed)
supabase db reset

# Stop local Supabase
supabase stop
```
