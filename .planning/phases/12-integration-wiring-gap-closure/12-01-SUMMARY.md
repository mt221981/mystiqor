---
phase: 12-integration-wiring-gap-closure
plan: "01"
subsystem: navigation-wiring
tags: [sidebar, navigation, onboarding, subscription, bug-fix]
dependency_graph:
  requires: []
  provides: [fixed-sidebar-hrefs, astrology-sub-tool-entries, live-usage-bar, correct-onboarding-redirect]
  affects: [Sidebar.tsx, OnboardingWizard.tsx]
tech_stack:
  added: []
  patterns: [useSubscription hook in client component, live data replacing hardcoded constants]
key_files:
  created: []
  modified:
    - mystiqor-build/src/components/layouts/Sidebar.tsx
    - mystiqor-build/src/components/features/onboarding/OnboardingWizard.tsx
decisions:
  - "UsageBar calls useSubscription() directly inside the component — cleanest pattern, avoids prop drilling, matches React Query caching layer"
  - "Premium detection via plan_type !== 'free' shows 'ללא הגבלה' text and 0% bar — matches existing plan logic"
  - "New 'אסטרולוגיה מתקדמת' section added as a separate NavSection after 'כלים מיסטיים' — cleanest approach, no nesting required"
  - "/question mapped to /tools/relationships per audit — question page does not exist, relationships is correct mapping"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_modified: 2
---

# Phase 12 Plan 01: Navigation Wiring Gap Closure Summary

Fixed all navigation wiring gaps from the v1.0 audit — 12 broken sidebar hrefs corrected with `/tools/` prefix, 5 astrology sub-tool entries added, UsageBar wired to live `useSubscription()` data replacing hardcoded 42%, and OnboardingWizard redirects to `/dashboard` instead of the 404-producing `/tools`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix Sidebar hrefs, add astrology sub-tools, wire live UsageBar | be9f045 | Sidebar.tsx |
| 2 | Fix OnboardingWizard post-completion redirect | 85995e8 | OnboardingWizard.tsx |

## What Was Built

### Task 1 — Sidebar.tsx (3 groups of changes)

**Group A — Fixed 12+ broken tool hrefs:**
- All "כלים מיסטיים" items now include `/tools/` prefix: `/numerology` → `/tools/numerology`, `/astrology` → `/tools/astrology`, `/graphology` → `/tools/graphology`, `/drawing` → `/tools/drawing`, `/palmistry` → `/tools/palmistry`, `/tarot` → `/tools/tarot`, `/human-design` → `/tools/human-design`
- `/dreams` → `/tools/dream` (corrected page path — `dream` not `dreams`)
- All "מתקדם" items fixed: `/compatibility` → `/tools/compatibility`, `/career` → `/tools/career`, `/document` → `/tools/document`, `/question` → `/tools/relationships` (question page does not exist), `/personality` → `/tools/personality`
- `/daily-insights` → `/tools/daily-insights`
- `/tools/synthesis` was already correct — unchanged

**Group B — 5 astrology sub-tool entries:**
Added new "אסטרולוגיה מתקדמת" section after "כלים מיסטיים" with:
- `/tools/astrology/forecast` (Sun icon)
- `/tools/astrology/calendar` (CalendarDays icon)
- `/tools/astrology/transits` (Navigation icon)
- `/tools/astrology/solar-return` (RotateCcw icon)
- `/tools/astrology/synastry` (Users icon)

New lucide-react imports added: `Sun`, `CalendarDays`, `Navigation`, `RotateCcw`, `Users`

**Group C — Live UsageBar:**
- Removed `PLACEHOLDER_USAGE_PERCENT = 42` constant
- Imported `useSubscription` from `@/hooks/useSubscription`
- `UsageBar` now calls `useSubscription()` directly, computes `clampedPercent` from `analyses_used / analyses_limit * 100`
- Premium users (`plan_type !== 'free'`) see "ללא הגבלה" text and 0% bar
- All existing styles, animations, and ARIA attributes preserved

### Task 2 — OnboardingWizard.tsx

Single-line fix in `handleComplete`: `router.push('/tools')` → `router.push('/dashboard')`. New users completing onboarding now land on `/dashboard` instead of a 404.

## Verification Results

- `grep "href.*'/tools/numerology'" Sidebar.tsx` — MATCH (line 91)
- `grep "href.*'/tools/astrology'" Sidebar.tsx` — MATCH (line 92)
- `grep "href.*'/tools/astrology/forecast'" Sidebar.tsx` — MATCH (line 104)
- `grep "href.*'/tools/astrology/calendar'" Sidebar.tsx` — MATCH (line 105)
- `grep "href.*'/tools/astrology/transits'" Sidebar.tsx` — MATCH (line 106)
- `grep "href.*'/tools/astrology/solar-return'" Sidebar.tsx` — MATCH (line 107)
- `grep "href.*'/tools/astrology/synastry'" Sidebar.tsx` — MATCH (line 108)
- `grep "href.*'/tools/dream'" Sidebar.tsx` — MATCH (line 98, not /dreams)
- `grep "PLACEHOLDER_USAGE_PERCENT" Sidebar.tsx` — NO MATCH (deleted)
- `grep "useSubscription" Sidebar.tsx` — MATCH (lines 53, 241)
- `grep "router.push('/tools')" OnboardingWizard.tsx` — NO MATCH
- `grep "router.push('/dashboard')" OnboardingWizard.tsx` — MATCH (line 141)
- `npx tsc --noEmit` — 0 errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is live. UsageBar reads from Supabase via useSubscription React Query hook.

## File Score

**mystiqor-build/src/components/layouts/Sidebar.tsx**

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict, typed interfaces, no any |
| Error Handling | 8/10 | useSubscription handles loading/fallback via FREE_SUBSCRIPTION default |
| Validation | 8/10 | clampedPercent guards 0-100 range |
| Documentation | 9/10 | JSDoc in Hebrew on all components and interfaces |
| Clean Code | 9/10 | Max 300 lines respected, clear separation |
| Security | 8/10 | No client secrets, subscription data from authenticated hook |
| Performance | 8/10 | useCallback, React Query cache in useSubscription |
| Accessibility | 9/10 | role=progressbar, aria-valuenow/min/max, aria-current, aria-expanded |
| RTL | 10/10 | start/end classes used, Hebrew labels |
| Edge Cases | 9/10 | Premium users, zero limit, clamp to 0-100 |
| **TOTAL** | **88/100** | Above 78% threshold |

**mystiqor-build/src/components/features/onboarding/OnboardingWizard.tsx**

Single-line change. File score unchanged from prior plan — still passing threshold.

## Self-Check: PASSED
