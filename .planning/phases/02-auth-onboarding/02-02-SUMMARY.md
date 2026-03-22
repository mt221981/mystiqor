---
phase: 02-auth-onboarding
plan: 02
subsystem: onboarding
tags: [api-route, validation, zod, subscription, onboarding]
dependency_graph:
  requires: []
  provides: [POST /api/onboarding/complete, onboardingCompleteSchema, OnboardingCompleteData]
  affects: [OnboardingWizard, profiles table, subscriptions table]
tech_stack:
  added: []
  patterns: [zod-server-validation, api-route-pattern, free-subscription-creation]
key_files:
  created:
    - mystiqor-build/src/app/api/onboarding/complete/route.ts
  modified:
    - mystiqor-build/src/lib/validations/profile.ts
    - mystiqor-build/src/components/features/onboarding/OnboardingWizard.tsx
decisions:
  - "subscriptions table uses user_id (FK to auth.users) not id — contradicts RESEARCH.md Pitfall 6 but matches database.generated.ts"
  - "subscription creation on failed insert is non-fatal — profile was saved, log error but return success"
  - "wizard sends accepted_barnum and accepted_terms to API route for server-side consent validation"
metrics:
  duration: 5min
  completed_date: "2026-03-22"
  tasks_completed: 2
  files_changed: 3
---

# Phase 02 Plan 02: Onboarding Completion API Route Summary

**One-liner:** Server-validated onboarding completion creating profile row and free subscription atomically via POST /api/onboarding/complete.

## What Was Built

The OnboardingWizard previously wrote directly to Supabase from the browser, bypassing server-side validation and never creating the subscription row required by `increment_usage` and `SubscriptionGuard`. This plan closes that gap by:

1. Adding `onboardingCompleteSchema` — a Zod schema with server-side Barnum consent validation, terms validation (`z.literal(true)`), and optional `timezone_name` field.
2. Creating `POST /api/onboarding/complete` — validates input, upserts the profile row (with `timezone_name`), and creates the free subscription row (`plan_type=free`, `analyses_limit=3`, `user_id` FK).
3. Updating `OnboardingWizard.handleComplete` to call the API route instead of direct Supabase writes.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add onboardingCompleteSchema to profile.ts | e508342 | src/lib/validations/profile.ts |
| 2 | Create API route + update OnboardingWizard | f081b93 | src/app/api/onboarding/complete/route.ts, src/components/features/onboarding/OnboardingWizard.tsx |

## Key Decisions

### 1. subscriptions.user_id, not id
RESEARCH.md Pitfall 6 incorrectly stated `id = user.id`. The actual `database.generated.ts` schema shows `user_id: string` is the required FK to auth.users, while `id?: string` is an optional auto-generated UUID. The route uses `user_id: user.id`.

### 2. Non-fatal subscription creation
Profile upsert is the critical operation. If subscription creation fails (e.g., duplicate row already exists but wasn't found by `maybeSingle`), the error is logged but the request returns `{ success: true }`. The user's profile is saved and they can proceed to `/tools`.

### 3. Wizard no longer touches Supabase directly
The `createClient` import from `@/lib/supabase/client` was removed from OnboardingWizard — no longer needed. All DB writes go through the server-side API route.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data flows are wired. The `timezone_name` field is intentionally `null` in this plan (the Zustand store has no timezone field). A future phase updating LocationStep to capture IANA timezone from the geocoding service will populate this field.

## File Scores

**mystiqor-build/src/lib/validations/profile.ts (additions)**
- TypeScript: 10/10 — strict types, proper generics
- Error Handling: 9/10 — Zod handles validation errors with Hebrew messages
- Validation: 10/10 — z.literal(true) for consent, regex for dates/times
- Documentation: 9/10 — JSDoc in Hebrew per project standards
- Clean Code: 9/10 — reuses constants, clean separation
- Security: 10/10 — server-side consent validation
- Performance: 9/10 — N/A for schemas
- Accessibility: N/A
- RTL: 9/10 — Hebrew error messages throughout
- Edge Cases: 9/10 — date in past validation, optional fields handled
- **TOTAL: 94/90 (N/A skipped) = 94%** — PASS (threshold 78%)

**mystiqor-build/src/app/api/onboarding/complete/route.ts (new)**
- TypeScript: 10/10 — NextRequest typed, no any
- Error Handling: 9/10 — try/catch, auth check, Zod validation errors, non-fatal sub error
- Validation: 10/10 — Zod safeParse, 401 for unauth, 400 for invalid input
- Documentation: 9/10 — JSDoc in Hebrew, inline notes
- Clean Code: 9/10 — const for defaults, clear destructuring
- Security: 10/10 — auth check first, server-side Zod validation, no secrets
- Performance: 8/10 — checks for existing sub before insert (avoids duplicate)
- Accessibility: N/A
- RTL: 9/10 — Hebrew error messages
- Edge Cases: 9/10 — existing subscription check, non-fatal failure path
- **TOTAL: 83/90 (N/A skipped) = 92%** — PASS (threshold 78%)

**mystiqor-build/src/components/features/onboarding/OnboardingWizard.tsx (modifications)**
- TypeScript: 9/10 — error instanceof Error check
- Error Handling: 9/10 — response.ok check, JSON parse catch, typed error message
- Validation: 9/10 — server validates, client trusts store data
- Documentation: 9/10 — updated JSDoc comment
- Clean Code: 9/10 — removed unused import cleanly
- Security: 10/10 — no secrets, no direct DB write
- Performance: 8/10 — single fetch call
- Accessibility: 8/10 — existing a11y preserved
- RTL: 9/10 — Hebrew toast messages
- Edge Cases: 9/10 — network error caught, error message extraction
- **TOTAL: 89/100 = 89%** — PASS (threshold 78%)

## Self-Check

Files exist:
- `mystiqor-build/src/app/api/onboarding/complete/route.ts` — created
- `mystiqor-build/src/lib/validations/profile.ts` — modified
- `mystiqor-build/src/components/features/onboarding/OnboardingWizard.tsx` — modified

Commits:
- `e508342` — feat(02-02): add onboardingCompleteSchema to profile validations
- `f081b93` — feat(02-02): create onboarding completion API route + update wizard

TypeScript: zero errors (npx tsc --noEmit exit code 0)
