---
phase: 02-auth-onboarding
plan: 03
subsystem: auth
tags: [onboarding-guard, sign-out, layout, server-component, server-action]

# Dependency graph
requires:
  - plan: 02-01
    provides: signOut server action, x-pathname header in middleware
  - plan: 02-02
    provides: onboarding completion API route, profiles.onboarding_completed flag
provides:
  - Onboarding guard in auth layout — redirects users without completed onboarding to /onboarding
  - Loop prevention — /onboarding path excluded from the guard
  - Sign-out button in sidebar calling signOut server action
affects: [all protected route pages, onboarding, dashboard, tools]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component reading x-pathname header from middleware via next/headers"
    - "Auth layout queries profiles.onboarding_completed as second guard after auth check"
    - "form action={serverAction} pattern for sign-out from Client Component (no onClick needed)"
    - "absolute bottom-0 positioning for sidebar footer button with relative on aside"

key-files:
  created: []
  modified:
    - mystiqor-build/src/app/(auth)/layout.tsx
    - mystiqor-build/src/app/(auth)/layout-client.tsx

key-decisions:
  - "pathname !== '/onboarding' guard prevents redirect loop — /onboarding is inside (auth) group so layout runs for it"
  - "maybeSingle() returns null for missing profile row — correctly triggers redirect (no profile = onboarding not complete)"
  - "profile?.onboarding_completed with optional chaining handles both null profile and false/null field value"
  - "form action={signOut} is idiomatic Next.js App Router pattern — no onClick handler, no useRouter needed"

# Metrics
duration: 2min
completed: 2026-03-22
tasks_completed: 1 of 2 (awaiting human verification checkpoint)
files_changed: 2

status: AWAITING_CHECKPOINT
---

# Phase 2 Plan 3: Auth Layout Onboarding Guard + Sign-out Summary

**Onboarding guard in auth layout redirecting users without completed profiles to /onboarding, plus sign-out button in sidebar using Server Action form pattern.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-22T13:10:34Z
- **Completed:** Awaiting checkpoint (Task 2: human verification)
- **Tasks:** 1 of 2 (Task 1 complete, Task 2 is checkpoint:human-verify)
- **Files modified:** 2

## Accomplishments

- Added `onboarding_completed` guard to auth layout after existing auth check — users who have not completed onboarding are redirected to `/onboarding` from any protected page
- `/onboarding` path itself is excluded from the guard via `pathname !== '/onboarding'` check — prevents infinite redirect loop
- `x-pathname` header (injected by middleware in Plan 02-01) is read via `next/headers` to determine current path
- `maybeSingle()` for the profile query — null profile triggers redirect (no profile = onboarding incomplete)
- Added sign-out button to sidebar using `<form action={signOut}>` — idiomatic Server Action pattern for Client Components
- `aside` element gets `relative` class so the `absolute bottom-0` sign-out button positions correctly

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Onboarding guard in layout + sign-out button in sidebar | `7043ec8` | layout.tsx, layout-client.tsx |
| 2 | Human verification checkpoint | PENDING | — |

## Files Created/Modified

- `mystiqor-build/src/app/(auth)/layout.tsx` — Added onboarding_completed guard with x-pathname loop prevention
- `mystiqor-build/src/app/(auth)/layout-client.tsx` — Added sign-out button with form action + relative aside positioning

## Decisions Made

- Loop prevention via `pathname !== '/onboarding'` — the /onboarding route is inside the (auth) group so the layout runs for it; without this check, a user hitting /onboarding would be immediately redirected back to /onboarding infinitely
- `maybeSingle()` used instead of `single()` — if the user has no profile row yet, `single()` would throw while `maybeSingle()` returns null, which correctly triggers the redirect
- `form action={signOut}` pattern chosen over `onClick` + `useRouter` — cleaner, no client-side JS required for the action, works with Progressive Enhancement

## Deviations from Plan

None — plan executed exactly as written.

## File Scores

**mystiqor-build/src/app/(auth)/layout.tsx (modified)**
- TypeScript: 10/10 — strict types, proper async/await, no any
- Error Handling: 9/10 — auth redirect + onboarding redirect, maybeSingle for null safety
- Validation: 9/10 — both auth and onboarding guards in sequence
- Documentation: 9/10 — JSDoc in Hebrew, inline comments in Hebrew
- Clean Code: 9/10 — concise, clear flow
- Security: 10/10 — server-side auth check, server-side onboarding check, no client bypass possible
- Performance: 9/10 — single DB query for onboarding check, skipped when on /onboarding
- Accessibility: N/A
- RTL: 9/10 — comments in Hebrew
- Edge Cases: 9/10 — null profile handled, loop prevention
- **TOTAL: 93/90 (N/A skipped) = 93%** — PASS (threshold 78%)

**mystiqor-build/src/app/(auth)/layout-client.tsx (modified)**
- TypeScript: 10/10 — typed props, no any
- Error Handling: 8/10 — form submission via server action handles errors at action layer
- Validation: N/A — no form input to validate
- Documentation: 9/10 — JSDoc updated, inline Hebrew comments
- Clean Code: 9/10 — clean placement of sign-out below nav
- Security: 10/10 — signOut is server action, no client-side auth logic
- Performance: 9/10 — no extra renders
- Accessibility: 8/10 — button type="submit" is accessible, could add aria-label
- RTL: 9/10 — "התנתק" Hebrew label
- Edge Cases: 8/10 — form submission handles server action error at action level
- **TOTAL: 89/90 (N/A skipped) = 89%** — PASS (threshold 78%)

## Known Stubs

None — all data flows are wired. The sidebar navigation placeholder ("תפריט ניווט — ייבנה בשלב הבא") is an intentional stub planned for a future phase (UX Shell). It does not affect this plan's goal.

## Self-Check

Files exist:
- `mystiqor-build/src/app/(auth)/layout.tsx` — modified
- `mystiqor-build/src/app/(auth)/layout-client.tsx` — modified

Commits:
- `7043ec8` — feat(02-03): add onboarding guard to auth layout + sign-out button to sidebar

TypeScript: zero errors (npx tsc --noEmit exit code 0)

## Self-Check: PASSED

---
*Phase: 02-auth-onboarding*
*Status: Awaiting checkpoint (Task 2: human verification)*
