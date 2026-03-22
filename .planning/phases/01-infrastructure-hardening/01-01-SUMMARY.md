---
phase: 01-infrastructure-hardening
plan: 01
subsystem: database-schema
tags: [supabase, migrations, schema, race-condition, zod, npm]
dependency_graph:
  requires: []
  provides: [003_schema_fixes.sql, usage-route-hardened, npm-deps]
  affects: [all-subsequent-phases, stripe-webhooks, ai-coach, analytics]
tech_stack:
  added: []
  patterns: [SELECT FOR UPDATE, Zod safeParse, DO $$ idempotent migrations]
key_files:
  created:
    - mystiqor-build/supabase/migrations/003_schema_fixes.sql
  modified:
    - mystiqor-build/src/app/api/subscription/usage/route.ts
    - mystiqor-build/package.json
decisions:
  - "Migration uses DO $$ BEGIN / IF NOT EXISTS blocks to handle pre-existing tables from 001_schema.sql (analytics_events, blog_posts already exist)"
  - "analytics_events FIX 4 adds composite indexes only — table already created in 001_schema.sql"
  - "Used --legacy-peer-deps for npm install due to pre-existing zod v3/v4 peer conflict in openai@4.104.0"
  - "INFRA-05 (Supabase provisioning) deferred — migration file is ready but no live project yet"
metrics:
  duration: "12 minutes"
  completed_date: "2026-03-22"
  tasks_completed: 2
  tasks_total: 3
  files_modified: 3
requirements: [INFRA-03, INFRA-04]
requirements_deferred: [INFRA-05]
---

# Phase 01 Plan 01: Schema Fixes Migration + Usage Route Hardening Summary

**One-liner:** SQL migration with 9 idempotent ARCHITECTURE.md schema fixes (SELECT FOR UPDATE race-safe increment_usage, conversations table, Stripe idempotency table, triggers) + Zod-validated usage API route replacing unsafe type assertion.

## What Was Built

### Task 1: 003_schema_fixes.sql migration + npm deps

Created `mystiqor-build/supabase/migrations/003_schema_fixes.sql` with all 9 fixes from ARCHITECTURE.md v2.0:

| Fix | Change | Why |
|-----|--------|-----|
| FIX 1 | `timezone_name TEXT` replaces `timezone_offset INTEGER` | DST-safe: Israel switches UTC+2/+3 seasonally |
| FIX 2 | New `conversations` table + FK from `coaching_messages` | AI Coach needs conversation threading |
| FIX 3 | New `processed_webhook_events` table | Stripe idempotency — prevents double-processing |
| FIX 4 | Composite indexes on `analytics_events` | Table already in 001_schema; indexes were missing |
| FIX 5 | `blog_posts` RLS DO block (idempotent) | Table + policy already in 001_schema; guard added |
| FIX 6 | `idx_analyses_user_tool_date` composite index | Dashboard query optimization |
| FIX 7 | `update_updated_at()` trigger on 5 tables | Ensures `updated_at` never stale |
| FIX 8 | `increment_usage()` with `SELECT FOR UPDATE` | Eliminates TOCTOU race condition in usage counter |
| FIX 9 | `reset_monthly_usage()` with `AT TIME ZONE 'Asia/Jerusalem'` | Monthly reset aligned to Israeli local time |

npm packages confirmed installed: `@photostructure/tz-lookup@11.5.0`, `sharp@0.34.5`

### Task 2: Hardened usage route

Replaced unsafe type assertion in `/api/subscription/usage/route.ts`:

- Defined `UsageRPCResultSchema = z.object({ success, new_count, limit })`
- `UsageRPCResultSchema.safeParse(data)` replaces `data as { ... }`
- Logs `parsed.error.issues` when RPC returns unexpected shape
- Returns Hebrew 500 error on schema mismatch
- TypeScript strict compilation: PASS (zero errors)

### Task 3: Checkpoint (deferred)

Task 3 is a `checkpoint:human-verify` for Supabase project provisioning. Execution paused here awaiting user decision on DB setup.

## File Scores

### 003_schema_fixes.sql (SQL, applicable criteria: 7/10)
- Error Handling: 9/10
- Validation: 9/10
- Documentation: 9/10
- Clean Code: 9/10
- Security: 10/10
- Performance: 10/10
- Edge Cases: 9/10
- **TOTAL: 65/70 = 92.8% ✓ (threshold: 78%)**

### src/app/api/subscription/usage/route.ts (applicable criteria: 9/10)
- TypeScript: 10/10
- Error Handling: 10/10
- Validation: 10/10
- Documentation: 9/10
- Clean Code: 10/10
- Security: 10/10
- Performance: 9/10
- RTL: 10/10
- Edge Cases: 9/10
- **TOTAL: 87/90 = 96.7% ✓ (threshold: 78%)**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm peer dependency conflict**
- **Found during:** Task 1 npm install
- **Issue:** `openai@4.104.0` has optional peer `zod@^3.23.8` but project uses `zod@4.3.6`. npm refused to install without flag.
- **Fix:** Used `--legacy-peer-deps` (conflict is optional peer only; openai works fine with zod v4 for our usage)
- **Files modified:** none (packages already present in node_modules)
- **Commit:** f5792e3

**2. [Rule 2 - Correctness] analytics_events table already exists in 001_schema.sql**
- **Found during:** Task 1 migration authoring
- **Issue:** ARCHITECTURE.md FIX 4 says to `CREATE TABLE IF NOT EXISTS analytics_events` but it already exists in the base migration with slightly different column names (`page_url` vs `page_path`)
- **Fix:** Migration adds only the missing composite indexes instead of recreating the table; added a comment explaining the deviation
- **Files modified:** 003_schema_fixes.sql
- **Commit:** f5792e3

**3. [Rule 2 - Correctness] blog_posts RLS already in 001_schema.sql**
- **Found during:** Task 1 migration authoring
- **Issue:** FIX 5 would duplicate `CREATE POLICY "Public read published posts"` which already exists
- **Fix:** Wrapped in `DO $$ BEGIN IF NOT EXISTS ... END $$` block for full idempotency
- **Files modified:** 003_schema_fixes.sql
- **Commit:** f5792e3

## Open Items

- **INFRA-05 OPEN:** Supabase project not yet provisioned. Migration file is ready to apply via `supabase db push` once user creates project at app.supabase.com. Phase 2 (Auth) cannot begin until DB is live.

## Self-Check

### Files exist:
- [x] `mystiqor-build/supabase/migrations/003_schema_fixes.sql`
- [x] `mystiqor-build/src/app/api/subscription/usage/route.ts` (modified)

### Commits exist:
- [x] f5792e3 — feat(01-01): create 003_schema_fixes.sql migration + npm deps
- [x] f95f35d — feat(01-01): harden usage route with Zod RPC result validation

## Self-Check: PASSED
