---
phase: 03-ux-shell-profile-dashboard-tracking
plan: 04
subsystem: ui
tags: [goals, crud, react-query, zod, rhf, supabase, shadcn, progress, tabs]

# Dependency graph
requires:
  - phase: 03-01
    provides: App shell with auth layout wrapping all (auth) pages
  - phase: 01-infra
    provides: database.generated.ts with goals table type, Supabase server/browser clients
provides:
  - Goals CRUD API routes (POST, GET, PATCH, DELETE) at /api/goals and /api/goals/[id]
  - Goals page at /goals with status tab filtering
  - Goal-analysis linking (TRCK-04) via recommendations JSON field
affects:
  - dashboard (goal progress display)
  - tracking phases using goal data

# Tech tracking
tech-stack:
  added: []
  patterns:
    - GoalFormSchema extends GoalCreateSchema with optional edit-only fields (no .default(), use z.input<> for form type)
    - GoalFormSubmit explicit interface decouples form values from API types
    - status/category query params validated via Zod in GET route before passing to Supabase (type-safe enum filtering)

key-files:
  created:
    - mystiqor-build/src/app/api/goals/route.ts
    - mystiqor-build/src/app/api/goals/[id]/route.ts
    - mystiqor-build/src/components/features/goals/GoalForm.tsx
    - mystiqor-build/src/components/features/goals/GoalCard.tsx
    - mystiqor-build/src/app/(auth)/goals/page.tsx
  modified: []

key-decisions:
  - "GoalQuerySchema validates status/category GET params as enums to satisfy Supabase typed .eq() — string literal from searchParams not assignable to GoalStatus"
  - "GoalFormSchema uses z.input<> (not z.infer) for useForm type — .default() fields produce mismatched resolver types with React Hook Form"
  - "GoalFormSubmit interface defined for explicit onSubmit prop type — avoids zodResolver type union collapse issue"
  - "linked_analyses stored in goals.recommendations JSON field as { linked_analyses: string[] } — fulfills TRCK-04 without schema change"
  - "GoalForm separates create/edit concerns with isEdit flag — edit adds progress Slider, status Select, and analysis linking checkbox list"

patterns-established:
  - "Pattern: Goals tab page uses StatusFilter union type and queryKeys.goals.list({ status }) for per-tab React Query caching"
  - "Pattern: GoalCard onProgressUpdate increments by +10% via PATCH mutation, invalidates all goals cache"

requirements-completed: [TRCK-03, TRCK-04]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 03 Plan 04: Goals System Summary

**Goals CRUD with 8-category select, progress slider, status tabs, and TRCK-04 analysis linking via recommendations JSON field**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-22T15:03:17Z
- **Completed:** 2026-03-22T15:11:32Z
- **Tasks:** 2
- **Files modified:** 5 (all created)

## Accomplishments

- Full goals API: POST creates with status=active/progress=0, GET filters by status+category (Zod-validated enums), PATCH updates fields+progress+status+linked_analyses, DELETE with user_id guard
- GoalForm handles both create and edit modes — progress Slider, status Select, analysis linking checkbox list (TRCK-04) appear only in edit mode
- Goals page at `/goals` with Tabs for all/active/in_progress/completed, Skeleton, EmptyState, ErrorBoundary, Breadcrumbs, and React Query cache invalidation on all mutations

## Task Commits

1. **Task 1: Goals API routes** - `f6c1bdb` (feat)
2. **Task 2: GoalForm, GoalCard, goals page** - `d82fe89` (feat)

## Files Created/Modified

- `mystiqor-build/src/app/api/goals/route.ts` - POST (create) + GET (list with status/category filter)
- `mystiqor-build/src/app/api/goals/[id]/route.ts` - PATCH (update/progress/TRCK-04) + DELETE
- `mystiqor-build/src/components/features/goals/GoalForm.tsx` - Create/edit form, 8 categories, preferred tools, progress slider, linked_analyses
- `mystiqor-build/src/components/features/goals/GoalCard.tsx` - Card with progress bar, +10% button, category/status badges
- `mystiqor-build/src/app/(auth)/goals/page.tsx` - Full CRUD page with status tabs, dialogs, mutations

## Decisions Made

- `GoalQuerySchema` validates GET query params as typed enums — Supabase `.eq()` requires `GoalStatus`/`GoalCategory` literals, not plain strings
- `z.input<typeof GoalFormSchema>` used instead of `z.infer` — avoids React Hook Form resolver type mismatch caused by `.default()` fields
- `GoalFormSubmit` exported interface as onSubmit contract — separates form values from API schema types
- `linked_analyses` stored in `goals.recommendations` JSON as `{ linked_analyses: string[] }` — TRCK-04 fulfilled without additional migration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Supabase enum type safety in GET query filters**
- **Found during:** Task 1 (Goals API routes)
- **Issue:** `query.eq('status', string)` fails TypeScript — Supabase typed client requires `GoalStatus` literal, not plain `string` from `searchParams.get()`
- **Fix:** Added `GoalQuerySchema` with `z.enum([...statuses])` and `z.enum([...categories])` to validate/type-narrow query params before passing to Supabase
- **Files modified:** mystiqor-build/src/app/api/goals/route.ts
- **Verification:** `npx tsc --noEmit` passes with zero errors in my files
- **Committed in:** f6c1bdb (Task 1 commit)

**2. [Rule 1 - Bug] React Hook Form resolver type mismatch with Zod `.default()`**
- **Found during:** Task 2 (GoalForm)
- **Issue:** `zodResolver(schema)` with `.default()` fields produces `Resolver<InputType>` but `useForm<OutputType>` inferred by `z.infer<>` — TypeScript error on resolver prop
- **Fix:** Changed `z.infer<typeof GoalFormSchema>` to `z.input<typeof GoalFormSchema>` for the form type; removed `.default()` calls in favor of `defaultValues` in `useForm`
- **Files modified:** mystiqor-build/src/components/features/goals/GoalForm.tsx
- **Verification:** Zero TypeScript errors in goals files
- **Committed in:** d82fe89 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for TypeScript correctness. No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors in `mood/page.tsx`, `JournalEntryForm.tsx`, `ProfileEditForm.tsx` and `profile/page.tsx` were present before this plan. Out of scope per deviation rules. Logged to deferred-items.

## Known Stubs

None — all goals CRUD wired to real Supabase API routes with auth guard.

## Next Phase Readiness

- Goals CRUD complete at `/goals` — dashboard can link to `/goals` for goal progress
- TRCK-03 (goals CRUD + progress) and TRCK-04 (goal-analysis linking) requirements fulfilled
- No blockers for next plan

## Self-Check: PASSED

- FOUND: mystiqor-build/src/app/api/goals/route.ts
- FOUND: mystiqor-build/src/app/api/goals/[id]/route.ts
- FOUND: mystiqor-build/src/components/features/goals/GoalForm.tsx
- FOUND: mystiqor-build/src/components/features/goals/GoalCard.tsx
- FOUND: mystiqor-build/src/app/(auth)/goals/page.tsx
- FOUND: commit f6c1bdb (Task 1)
- FOUND: commit d82fe89 (Task 2)

---
*Phase: 03-ux-shell-profile-dashboard-tracking*
*Completed: 2026-03-22*
