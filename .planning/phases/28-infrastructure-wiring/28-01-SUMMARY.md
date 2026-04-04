---
phase: 28-infrastructure-wiring
plan: 01
subsystem: cron-infrastructure
tags: [vercel, cron, reset-usage, daily-insights, supabase-rpc]
dependency_graph:
  requires: []
  provides: [vercel-cron-config, reset-usage-route, daily-insights-cron-skeleton]
  affects: [phase-30-daily-insights-llm]
tech_stack:
  added: []
  patterns: [cron-secret-auth, admin-client-rpc, per-user-error-isolation]
key_files:
  created:
    - vercel.json
    - src/app/api/cron/reset-usage/route.ts
    - src/app/api/cron/daily-insights/route.ts
  modified: []
decisions:
  - "CRON_SECRET auth uses authorization header with Bearer scheme — matches Vercel official cron docs pattern"
  - "daily-insights maxDuration=300 for future multi-user LLM generation; reset-usage maxDuration=30 for single RPC"
  - "daily-insights skeleton logs per user rather than calling LLM — Phase 30 adds actual generation"
metrics:
  duration_seconds: 206
  completed_date: "2026-04-04"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 0
requirements: [PAY-05]
---

# Phase 28 Plan 01: Vercel Cron Infrastructure Summary

Vercel cron infrastructure established: vercel.json with schedule entries, reset-usage route calling `reset_monthly_usage()` RPC, and daily-insights skeleton with CRON_SECRET auth and per-user error isolation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create vercel.json with cron schedules | ad95468 | vercel.json |
| 2 | Create reset-usage cron route | 2295be2 | src/app/api/cron/reset-usage/route.ts |
| 3 | Create daily-insights cron route skeleton | 3be3ef6 | src/app/api/cron/daily-insights/route.ts |

## What Was Built

**vercel.json** — Minimal Vercel configuration with two cron entries:
- `/api/cron/daily-insights` at `0 4 * * *` (04:00 UTC daily = 06:00/07:00 Israel)
- `/api/cron/reset-usage` at `0 0 1 * *` (midnight UTC on 1st of each month)

**reset-usage route** — Production-ready cron handler that:
- Validates CRON_SECRET as the very first operation (returns 401 otherwise)
- Calls `supabase.rpc('reset_monthly_usage')` via `createAdminClient`
- Returns `{ success: true, reset_at: ISO_TIMESTAMP }` on success
- Returns Hebrew error message with 500 on DB failure
- `maxDuration = 30`, full try/catch, Hebrew JSDoc

**daily-insights skeleton** — Cron handler infrastructure that:
- Validates CRON_SECRET identically to reset-usage
- Queries `subscriptions` table for `status = 'active'` users
- Per-user try/catch error isolation (one user failure doesn't crash the cron)
- Returns `{ processed, skipped, errors }` summary
- `maxDuration = 300` for future multi-user LLM generation
- Phase 30 will replace the log stub with actual LLM calls + daily_insights inserts

## File Scores

**vercel.json**
- TypeScript: N/A
- Error Handling: N/A
- Validation: 10/10 — valid JSON, correct cron syntax
- Documentation: N/A
- Clean Code: 10/10 — minimal, only crons array
- Security: N/A
- Performance: N/A
- Accessibility: N/A
- RTL: N/A
- Edge Cases: N/A
- **TOTAL (applicable criteria): 100% — PASS**

**src/app/api/cron/reset-usage/route.ts**
- TypeScript: 10/10 — strict, no any, typed return
- Error Handling: 10/10 — auth gate + DB error + unexpected error all handled
- Validation: 10/10 — CRON_SECRET check before any business logic
- Documentation: 9/10 — Hebrew JSDoc on file and function
- Clean Code: 10/10 — 60 lines, single responsibility
- Security: 10/10 — auth check is first operation, uses admin client
- Performance: 10/10 — single RPC call, maxDuration=30
- Accessibility: N/A
- RTL: 9/10 — Hebrew log messages and error strings
- Edge Cases: 9/10 — handles missing header and wrong secret separately via same check
- **TOTAL: 87/90 = 97% — PASS (threshold 78%)**

**src/app/api/cron/daily-insights/route.ts**
- TypeScript: 10/10 — strict, no any, typed return
- Error Handling: 10/10 — per-user isolation + fetch error + auth gate
- Validation: 10/10 — CRON_SECRET as first operation
- Documentation: 9/10 — Hebrew JSDoc + TODO for Phase 30
- Clean Code: 9/10 — 79 lines, clear structure
- Security: 10/10 — auth check first, uses admin client only
- Performance: 9/10 — maxDuration=300 set correctly for future use
- Accessibility: N/A
- RTL: 9/10 — Hebrew logs and comments throughout
- Edge Cases: 10/10 — per-user try/catch, handles empty subscriptions, fetch error
- **TOTAL: 86/90 = 96% — PASS (threshold 78%)**

## Deviations from Plan

None — plan executed exactly as written. All three files created with the exact patterns specified, including CRON_SECRET auth, createAdminClient usage, Hebrew JSDoc, and strict TypeScript.

## Known Stubs

**src/app/api/cron/daily-insights/route.ts:57**
```typescript
// TODO (Phase 30): כאן תבוא קריאת LLM בפועל + שמירה ל-daily_insights
console.log(`[cron/daily-insights] תובנה תיוצר עבור משתמש: ${userId}`);
```
Intentional skeleton — Phase 30 adds LLM generation and `daily_insights` table inserts. The cron fires, authenticates, fetches users, and iterates — it just doesn't generate insights yet. This is by design per the plan objective.

## Self-Check: PASSED

Files verified:
- `vercel.json` — EXISTS at repo root
- `src/app/api/cron/reset-usage/route.ts` — EXISTS
- `src/app/api/cron/daily-insights/route.ts` — EXISTS

Commits verified:
- `ad95468` — feat(28-01): create vercel.json with cron schedules
- `2295be2` — feat(28-01): create reset-usage cron route
- `3be3ef6` — feat(28-01): create daily-insights cron route skeleton

TypeScript: 0 errors (`npx tsc --noEmit`)
