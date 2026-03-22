---
phase: 02-auth-onboarding
plan: 01
subsystem: auth
tags: [supabase, middleware, next.js, server-actions, auth, routing]

# Dependency graph
requires:
  - phase: 01-infrastructure-hardening
    provides: Supabase client (server.ts + middleware.ts), TypeScript strict config, clean build
provides:
  - Fixed middleware with PROTECTED_PATHS array replacing dead '/(auth)' path check
  - ?next= param passed in middleware redirects so login page knows where to send user back
  - x-pathname header injected into every response for Server Components
  - signOut server action at src/app/actions/auth.ts callable from any component
  - Login page reads ?next= and redirects there after successful auth
  - handleRegister redirects to /onboarding when data.session is non-null (immediate session)
  - Auth callback defaults to /onboarding for new users (was /dashboard)
affects: [02-02, 02-03, all protected route pages, onboarding, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PROTECTED_PATHS const array at middleware module scope for centralized protected route definition
    - ?next= query param pattern for redirect-after-login
    - Suspense wrapper required around components using useSearchParams in Next.js App Router
    - Server Action in src/app/actions/ with 'use server' directive

key-files:
  created:
    - mystiqor-build/src/app/actions/auth.ts
  modified:
    - mystiqor-build/src/lib/supabase/middleware.ts
    - mystiqor-build/src/app/(public)/login/page.tsx
    - mystiqor-build/src/app/api/auth/callback/route.ts

key-decisions:
  - "PROTECTED_PATHS array defined at module scope (not inside function) so it is not re-created on every request"
  - "x-pathname header set on supabaseResponse directly (not creating new NextResponse) to preserve existing cookie sync logic"
  - "Suspense wraps LoginPageContent because useSearchParams requires Suspense boundary in Next.js App Router"
  - "Auth callback defaults to /onboarding — onboarding page redirects to /tools if already completed, so safe for returning users"

patterns-established:
  - "Protected route guard: PROTECTED_PATHS.some(p => pathname.startsWith(p)) in middleware.ts"
  - "Redirect-after-login: ?next= param set in middleware redirect, read in login page, passed through auth callback"
  - "Server Action pattern: 'use server' file in src/app/actions/, imported by client components"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 2 Plan 1: Auth Infrastructure Fix Summary

**Next.js middleware PROTECTED_PATHS guard + signOut server action + redirect-after-login ?next= flow + /onboarding auth callback default**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-22T14:30:00Z
- **Completed:** 2026-03-22T14:38:00Z
- **Tasks:** 2 of 2
- **Files modified:** 4

## Accomplishments

- Fixed dead middleware path check (`/(auth)` never matches real URLs) — replaced with 10-path PROTECTED_PATHS array
- Created signOut server action at `src/app/actions/auth.ts` — callable from any client component via form action or button
- Login page now reads `?next=` query param and redirects there after successful login; Suspense wrapper added for Next.js App Router compliance
- handleRegister handles immediate-session case (email confirmation disabled): redirects to `/onboarding` instead of showing success message with no redirect
- Auth callback default changed from `/dashboard` to `/onboarding` — new users flow to onboarding, existing users bounce harmlessly (onboarding page checks `onboarding_completed`)

## Task Commits

1. **Task 1: Fix middleware path matching + inject x-pathname header** - `0e7fb47` (fix)
2. **Task 2: signOut server action + redirect-after-login + callback default** - `80fdd0e` (feat)

## Files Created/Modified

- `mystiqor-build/src/lib/supabase/middleware.ts` - PROTECTED_PATHS array, ?next= param in redirect, x-pathname header injection
- `mystiqor-build/src/app/actions/auth.ts` - New file: signOut server action
- `mystiqor-build/src/app/(public)/login/page.tsx` - useSearchParams + Suspense + redirect-after-login + immediate-session register redirect
- `mystiqor-build/src/app/api/auth/callback/route.ts` - Default changed from /dashboard to /onboarding

## Decisions Made

- PROTECTED_PATHS defined at module scope (not inside function) so the array is not re-created on every request
- x-pathname header added via `supabaseResponse.headers.set()` rather than creating a new NextResponse, preserving the existing cookie sync logic in the setAll callback
- Suspense boundary wraps LoginPageContent because useSearchParams() requires it in Next.js App Router (causes hydration error otherwise)
- Auth callback default changed to /onboarding — the onboarding page already redirects to /tools when `onboarding_completed === true`, so existing users who re-authenticate via magic link/email confirmation bounce through harmlessly

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Auth infrastructure is complete: middleware guards all protected paths, signOut is importable, redirect-after-login works, new users go to onboarding
- Plan 02-02 (onboarding flow) and 02-03 (protected layout) can proceed — they depend on x-pathname header and correct redirect targets, both now provided
- No blockers

---
*Phase: 02-auth-onboarding*
*Completed: 2026-03-22*
