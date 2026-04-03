---
phase: 25-critical-integration-fixes
plan: 01
subsystem: ui
tags: [navigation, middleware, auth-redirect, mobile, bottom-tab-bar]

# Dependency graph
requires:
  - phase: 14-hebrew-typography
    provides: Stable layout components including BottomTabBar
  - phase: 01-core-infrastructure
    provides: Supabase middleware with PROTECTED_PATHS pattern
provides:
  - Corrected mobile BottomTabBar Insights tab linking to /tools/daily-insights
  - Complete PROTECTED_PATHS array with /notifications, /referrals, /pricing
affects: [mobile-navigation, auth-redirect-ux, middleware]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/components/layouts/BottomTabBar.tsx
    - src/lib/supabase/middleware.ts

key-decisions:
  - "BottomTabBar Insights tab href corrected from /daily-insights to /tools/daily-insights — aligns with Sidebar which already used correct path"
  - "PROTECTED_PATHS extended with /notifications, /referrals, /pricing — ensures ?next= redirect-back UX works for all protected routes, not just layout guard"

patterns-established: []

requirements-completed: [FIX-01, FIX-02]

# Metrics
duration: 1min
completed: 2026-04-03
---

# Phase 25 Plan 01: Critical Integration Fixes Summary

**Fixed mobile Insights 404 (BottomTabBar href corrected) and completed middleware PROTECTED_PATHS with /notifications, /referrals, /pricing for full auth redirect-back UX**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-03T11:52:59Z
- **Completed:** 2026-04-03T11:54:00Z
- **Tasks:** 2 completed
- **Files modified:** 2

## Accomplishments

- Mobile Insights tab no longer 404s — BottomTabBar href corrected from `/daily-insights` to `/tools/daily-insights`, matching the actual page location and aligning with the Sidebar
- Auth redirect-back UX now complete — `/notifications`, `/referrals`, `/pricing` added to `PROTECTED_PATHS` in middleware so unauthenticated users land at `/login?next=<path>` instead of falling through to layout guard
- Build health maintained — TypeScript compiles with 0 errors, all 103 tests pass (no regressions)

## Task Commits

1. **Task 1: Fix BottomTabBar insights href (FIX-01)** - `db5bce2` (fix)
2. **Task 2: Add missing paths to PROTECTED_PATHS (FIX-02)** - `fb5aab4` (fix)

## Files Created/Modified

- `src/components/layouts/BottomTabBar.tsx` - Changed Insights tab href from `/daily-insights` to `/tools/daily-insights`
- `src/lib/supabase/middleware.ts` - Added `/notifications`, `/referrals`, `/pricing` to PROTECTED_PATHS array (14 entries → 17 entries)

## Decisions Made

- No architectural decisions required — both were surgical one-line/multi-line additions to existing correct patterns
- Sidebar already used `/tools/daily-insights` correctly; BottomTabBar was simply out of sync
- `/pricing` added to PROTECTED_PATHS despite being a pricing page — it is in the `(auth)` directory and requires authentication per system design

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 3 audit gaps closed: INT-01-BOTTOMTAB-404, INT-02-MIDDLEWARE-PATHS, FLOW-MOBILE-INSIGHTS-404
- Phase 25 plan 01 (the only plan) complete — phase is done
- No blockers for subsequent phases

---
*Phase: 25-critical-integration-fixes*
*Completed: 2026-04-03*
