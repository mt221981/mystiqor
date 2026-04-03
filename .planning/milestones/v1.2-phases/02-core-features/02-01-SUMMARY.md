---
phase: 02-core-features
plan: "01"
subsystem: onboarding-dashboard-home
tags: [onboarding, wizard, barnum-ethics, dashboard, recharts, home-page, tool-grid]
dependency_graph:
  requires:
    - src/stores/onboarding.ts
    - src/components/features/shared/ToolGrid.tsx
    - src/components/forms/BirthDataForm.tsx
    - src/components/forms/LocationSearch.tsx
    - src/lib/animations/presets.ts
    - src/lib/constants/categories.ts
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - src/types/database.ts
    - src/lib/query/cache-config.ts
  provides:
    - src/app/(auth)/onboarding/page.tsx
    - src/components/features/onboarding/OnboardingWizard.tsx
    - src/components/features/onboarding/BarnumEthicsStep.tsx
    - src/components/features/onboarding/PreferencesStep.tsx
    - src/components/features/onboarding/steps.tsx
    - src/app/(auth)/dashboard/page.tsx
    - src/app/(public)/page.tsx
    - src/components/features/shared/AnalysesChart.tsx
  affects:
    - src/stores/onboarding.ts (added gender, focusAreas, aiSuggestionsEnabled fields)
tech_stack:
  added:
    - "@testing-library/dom (missing peer dep — installed)"
    - "recharts@3.8.0 (BarChart in dashboard)"
  patterns:
    - "4-step wizard with Zustand persist store"
    - "Promise.allSettled parallel Supabase queries"
    - "Server component auth gate + redirect pattern"
    - "TDD: RED tests first, then GREEN implementation"
key_files:
  created:
    - src/app/(auth)/onboarding/page.tsx
    - src/components/features/onboarding/OnboardingWizard.tsx
    - src/components/features/onboarding/BarnumEthicsStep.tsx
    - src/components/features/onboarding/PreferencesStep.tsx
    - src/components/features/onboarding/steps.tsx
    - src/components/features/shared/AnalysesChart.tsx
    - tests/components/onboarding.test.tsx
    - tests/components/tool-grid.test.tsx
  modified:
    - src/stores/onboarding.ts
    - src/app/(auth)/dashboard/page.tsx
    - src/app/(public)/page.tsx
decisions:
  - "BarnumEthicsStep split into dedicated file (BarnumEthicsStep.tsx) — GEM 13 logic isolated, testable as named export"
  - "OnboardingWizard split into 4 files (OnboardingWizard, steps, BarnumEthicsStep, PreferencesStep) to stay under 300-line limit"
  - "AnalysesChart extracted from dashboard to shared/features for reuse and line-count compliance"
  - "Home page redirects anonymous users to /login — home is authenticated-only per plan spec"
  - "onboarding store extended with gender/focusAreas/aiSuggestionsEnabled — plan interface required these fields"
  - "aria-checked set as string literal ('true'/'false') not boolean — ARIA spec requires string values"
metrics:
  duration: 21
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_created: 8
  files_modified: 3
---

# Phase 02 Plan 01: Onboarding Wizard, Dashboard, Home Page Summary

**One-liner:** 4-step onboarding wizard with GEM 13 Barnum ethics gate, real-data dashboard using Promise.allSettled + Recharts BarChart, and authenticated home page with ToolGrid.

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | OnboardingWizard + onboarding page (TDD) | 261cb34 | Done |
| 2 | Dashboard (real stats) + Home page (ToolGrid + insight widget) | 7d884d2 | Done |

## What Was Built

### Task 1: OnboardingWizard + onboarding page

**Files created:**
- `src/app/(auth)/onboarding/page.tsx` — Server component: checks auth + `profile.onboarding_completed`, redirects to `/tools` if complete, else renders wizard
- `src/components/features/onboarding/OnboardingWizard.tsx` — Main wizard orchestrator (161 lines): step indicator, step routing, profile upsert on completion
- `src/components/features/onboarding/BarnumEthicsStep.tsx` — GEM 13 implementation (86 lines): two checkboxes that both must be checked before "המשך" is enabled
- `src/components/features/onboarding/PreferencesStep.tsx` — Step 4 (143 lines): discipline multi-select, focus areas, AI toggle
- `src/components/features/onboarding/steps.tsx` — Steps 1-2 (242 lines): PersonalInfoStep + LocationStep with geocoding
- `tests/components/onboarding.test.tsx` — 4 vitest tests for BarnumEthicsStep checkbox behavior

**Files modified:**
- `src/stores/onboarding.ts` — Added `gender`, `focusAreas`, `aiSuggestionsEnabled` fields to `OnboardingData` interface and `INITIAL_DATA`

### Task 2: Dashboard + Home Page

**Files created:**
- `src/components/features/shared/AnalysesChart.tsx` — Recharts BarChart wrapper (83 lines): shows analyses by tool type, Hebrew labels, empty state with link to `/tools`
- `tests/components/tool-grid.test.tsx` — 2 vitest tests: renders without crash, shows Hebrew tool name

**Files modified:**
- `src/app/(auth)/dashboard/page.tsx` — `useQuery` with `Promise.allSettled` for 4 tables, 4 stat cards with Hebrew labels, BarChart via AnalysesChart, Skeleton loading state
- `src/app/(public)/page.tsx` — Server component: redirects anonymous to `/login`, shows ToolGrid + DailyInsightWidget placeholder

## Test Results

```
Tests: 6 passed (2 test files)
- onboarding.test.tsx: 4/4 (BarnumEthicsStep checkbox behavior)
- tool-grid.test.tsx: 2/2 (ToolGrid render + Hebrew names)
TypeScript: 0 errors
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Fields] Extended onboarding store with gender/focusAreas/aiSuggestionsEnabled**
- **Found during:** Task 1 — plan's interface spec listed these fields but store only had disciplines/acceptedBarnum/acceptedTerms
- **Fix:** Added `gender`, `focusAreas`, `aiSuggestionsEnabled` to `OnboardingData` interface and `INITIAL_DATA`
- **Files modified:** `src/stores/onboarding.ts`
- **Commit:** 261cb34

**2. [Rule 3 - Blocking] Installed @testing-library/dom missing peer dependency**
- **Found during:** Task 1 test run — `@testing-library/react` requires `@testing-library/dom` which was not installed
- **Fix:** `npm install @testing-library/dom --save-dev --legacy-peer-deps`
- **Commit:** 261cb34

**3. [Rule 1 - Bug] Fixed aria-checked boolean vs string**
- **Found during:** Task 2 refactor — IDE diagnostic flagged `aria-checked={boolean}` as invalid ARIA
- **Fix:** Changed to `aria-checked={data.aiSuggestionsEnabled ? 'true' : 'false'}` in PreferencesStep
- **Files modified:** `src/components/features/onboarding/PreferencesStep.tsx`
- **Commit:** 7d884d2

**4. [Rule 1 - Bug] Fixed progressbar ARIA numeric attributes**
- **Found during:** Task 2 — IDE flagged `aria-valuenow={expression}` as invalid ARIA value
- **Fix:** React handles numeric-to-string conversion correctly for aria-valuenow; added `aria-label` to satisfy accessible name requirement
- **Files modified:** `src/components/features/onboarding/OnboardingWizard.tsx`
- **Commit:** 7d884d2

### Structural Split (300-line compliance)
The plan specified OnboardingWizard as a single file but the combined size exceeded 300 lines. Split into 4 files following the single-responsibility principle: `OnboardingWizard.tsx` (orchestrator), `BarnumEthicsStep.tsx` (GEM 13), `PreferencesStep.tsx` (step 4), `steps.tsx` (steps 1-2). `AnalysesChart.tsx` extracted from dashboard for same reason. All named exports maintained so tests and imports work unchanged.

## File Score

| Criterion | /10 | Notes |
|-----------|-----|-------|
| TypeScript | 9 | Strict, no any, no ts-ignore |
| Error Handling | 8 | try/catch on Supabase calls, toast errors |
| Validation | 8 | Required field validation in wizard steps |
| Documentation | 8 | Hebrew JSDoc on all functions |
| Clean Code | 8 | Under 300 lines all files, clear naming |
| Security | 8 | Server-side auth check on onboarding page |
| Performance | 8 | Promise.allSettled parallel queries, CACHE_TIMES.SHORT |
| Accessibility | 8 | ARIA labels, roles, progressbar, group roles |
| RTL | 9 | dir="rtl" on all forms, start/end alignment |
| Edge Cases | 7 | Empty state on dashboard, redirect if onboarding done |
| **TOTAL** | **83/100** | Above 78% threshold |

## Self-Check: PASSED

- `src/app/(auth)/onboarding/page.tsx` — EXISTS
- `src/components/features/onboarding/OnboardingWizard.tsx` — EXISTS
- `src/components/features/onboarding/BarnumEthicsStep.tsx` — EXISTS
- `src/components/features/onboarding/PreferencesStep.tsx` — EXISTS
- `src/components/features/onboarding/steps.tsx` — EXISTS
- `src/components/features/shared/AnalysesChart.tsx` — EXISTS
- `src/app/(auth)/dashboard/page.tsx` — EXISTS
- `src/app/(public)/page.tsx` — EXISTS
- `tests/components/onboarding.test.tsx` — EXISTS
- `tests/components/tool-grid.test.tsx` — EXISTS
- Commit 261cb34 — EXISTS
- Commit 7d884d2 — EXISTS
- All 6 tests: PASS
- TypeScript errors: 0
