---
phase: 01-infrastructure-hardening
plan: 01
subsystem: infra
tags: [schema-fixes, zod, migration, hardening, type-safety, supabase]

# Dependency graph
requires: [01-01, 01-02, 01-03, 01-04, 01-05, 01-06, 01-07, 01-08]
provides:
  - supabase/migrations/003_schema_fixes.sql — 9 idempotent schema fixes
  - UsageRPCResultSchema — Zod-validated RPC result parsing in usage route
  - geocode service hardened with @photostructure/tz-lookup and sharp
affects: [subscriptions, analytics_events, coaching_messages, blog_posts, analyses]

# Tech tracking
tech-stack:
  added:
    - "@photostructure/tz-lookup@11.5.0" (DST-safe timezone lookup — confirmed in package.json)"
    - "sharp@0.34.5" (image processing — confirmed in package.json)"
  patterns:
    - Idempotent SQL migrations using IF NOT EXISTS / OR REPLACE / DO blocks
    - Zod safeParse replacing unsafe TypeScript type assertions on RPC results
    - SELECT FOR UPDATE in increment_usage() for race-safe atomic counter

key-files:
  created:
    - supabase/migrations/003_schema_fixes.sql — 9 idempotent schema fixes (189 lines)
  modified:
    - src/app/api/subscription/usage/route.ts — UsageRPCResultSchema + safeParse
    - src/services/geocode.ts — @photostructure/tz-lookup + timezone_name support
    - package.json — confirmed tz-lookup@11.5.0, sharp@0.34.5

key-decisions:
  - "003_schema_fixes.sql is idempotent — all changes use IF NOT EXISTS/OR REPLACE so it can be rerun safely"
  - "Task 3 (apply migrations to Supabase) deferred by user choice (skip-db) — migration file exists but not applied"
  - "increment_usage() uses SELECT FOR UPDATE instead of raw UPDATE — prevents race conditions under concurrent requests"
  - "reset_monthly_usage() uses Asia/Jerusalem timezone — correct for Hebrew calendar context"

requirements-completed: []

# Metrics
duration: ~15min
completed: 2026-03-22
---

# Infrastructure Hardening Plan 01: Schema Fixes + Route Hardening Summary

**9 idempotent schema fixes in 003_schema_fixes.sql + Zod RPC validation in usage route — DB migration deferred (skip-db)**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-03-22
- **Tasks:** 2 of 3 complete (Task 3 deferred)
- **Files modified:** 4

## Accomplishments

**Task 1: 003_schema_fixes.sql migration + npm deps** (commit: f5792e3)

Applied 9 architecture fixes as a single idempotent migration:
- FIX 1: `timezone_name` column replaces `timezone_offset` — DST-safe via `@photostructure/tz-lookup`
- FIX 2: `conversations` table added + FK from `coaching_messages` references it
- FIX 3: `processed_webhook_events` table for Stripe idempotency
- FIX 4: `analytics_events` composite indexes added
- FIX 5: `blog_posts` RLS policy guard (idempotent DO block)
- FIX 6: Composite index `idx_analyses_user_tool_date`
- FIX 7: `update_updated_at()` trigger applied to 5 tables
- FIX 8: `increment_usage()` rewritten with `SELECT FOR UPDATE` for race-safety
- FIX 9: `reset_monthly_usage()` uses `Asia/Jerusalem` timezone

**Task 2: Harden usage route with Zod RPC result parsing** (commit: f95f35d)

- Replaced `as { success: boolean }` unsafe type assertion with `UsageRPCResultSchema.safeParse(data)`
- Added Hebrew error response on schema mismatch
- Logs unexpected RPC shapes with `parsed.error.issues` for debugging
- TypeScript strict compilation passes (npx tsc --noEmit)

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | 003_schema_fixes.sql + npm deps (tz-lookup, sharp) | f5792e3 |
| 2 | Harden usage route with Zod RPC result validation | f95f35d |
| 3 | Apply migrations to Supabase | DEFERRED |

## Files Created/Modified

- `supabase/migrations/003_schema_fixes.sql` — 9 schema fixes, 189 lines, all idempotent
- `src/app/api/subscription/usage/route.ts` — Zod-safe RPC parsing
- `src/services/geocode.ts` — timezone_name support with @photostructure/tz-lookup
- `package.json` — tz-lookup@11.5.0 and sharp@0.34.5 confirmed

## Deferred Task

### Task 3: Apply Supabase Migrations

**Status:** DEFERRED — User selected "skip-db"

**What was ready:**
- `003_schema_fixes.sql` exists at `supabase/migrations/003_schema_fixes.sql`
- File is idempotent — can be applied at any time without side effects
- Apply command: `supabase db push` or `supabase migration up` in the project root

**When to complete:**
Before Phase 2 tools that use `conversations`, `processed_webhook_events`, or `timezone_name` are tested against a live Supabase instance.

**INFRA-05 status:** Already marked complete (Plan 01-06) — this hardening plan does not affect its status.

## Deviations from Plan

None — plan executed as described. Task 3 deferred by explicit user choice (not a blocker or error).

## Self-Check

- [x] supabase/migrations/003_schema_fixes.sql exists (f5792e3)
- [x] src/app/api/subscription/usage/route.ts has UsageRPCResultSchema (f95f35d)
- [x] Commits f5792e3 and f95f35d exist in git log
- [x] Task 3 documented as deferred with clear resume instructions

## Self-Check: PASSED

## Next Steps

When ready to apply the DB migration:
1. Ensure Supabase project credentials are in `.env.local`
2. Run: `npx supabase db push` (or `npx supabase migration up`)
3. Verify with: `npx supabase db diff` — should show no pending changes

---
*Phase: 01-infrastructure-hardening*
*Completed (partial): 2026-03-22*
