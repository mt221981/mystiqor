---
phase: 08-growth-monetization
plan: 01
subsystem: payments
tags: [stripe, checkout, subscription, pricing, nextjs, zod]

# Dependency graph
requires:
  - phase: 02-auth-onboarding
    provides: Supabase auth + createClient server helper
  - phase: 03-ux-shell-profile-dashboard-tracking
    provides: useSubscription hook and subscription data model
provides:
  - Pricing page at /pricing with 3-tier PlanCard layout (free/basic/premium)
  - POST /api/subscription/checkout Stripe session creation endpoint
  - PLAN_CONFIG deprecated in favor of PLAN_INFO (plans.ts is now sole source of truth)
affects: [08-02-stripe-webhook, 08-03-rate-limiting, subscription-guard, checkout-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Stripe checkout session created server-side with user_id in metadata for webhook correlation
    - Zod schema guards planId input at API boundary (enum only basic|premium)
    - onSelect handler in pricing page disables card button during async checkout creation
    - Free plan selection is a client-side no-op — no API call made

key-files:
  created:
    - mystiqor-build/src/app/(auth)/pricing/page.tsx
    - mystiqor-build/src/app/api/subscription/checkout/route.ts
  modified:
    - mystiqor-build/src/types/subscription.ts

key-decisions:
  - "PLAN_CONFIG marked @deprecated with Hebrew comment pointing to PLAN_INFO — not removed to avoid breaking any remaining importers"
  - "planId enum excludes free and enterprise — free has no checkout, enterprise is not user-facing per SUBS-01"
  - "customer_email pre-filled in Stripe Checkout from authenticated user's email for smoother UX"
  - "loadingPlan state drives onSelect=undefined on the in-flight card — PlanCard omits button when onSelect is falsy"

patterns-established:
  - "Stripe checkout: POST /api/subscription/checkout → session.url → window.location.href redirect"
  - "Auth gate pattern: createClient() + getUser() → 401 {error: 'לא מחובר'} on failure"
  - "Zod enum guard: z.enum(['basic','premium']) rejects free/enterprise at API boundary"

requirements-completed: [SUBS-01, SUBS-02]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 08 Plan 01: Pricing Page + Stripe Checkout Session Summary

**3-tier pricing page (/pricing) with PlanCard components + POST /api/subscription/checkout that creates a Stripe session with user_id metadata for webhook correlation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T11:55:29Z
- **Completed:** 2026-03-24T12:00:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created /pricing page displaying Free, Basic (₪49/mo), and Premium (₪99/mo) PlanCards using the existing PlanCard component and PLAN_INFO constants
- Created POST /api/subscription/checkout with Zod validation, auth guard, and Stripe session creation including user_id in metadata
- Deprecated PLAN_CONFIG in types/subscription.ts with JSDoc pointing to PLAN_INFO as the correct source of truth

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pricing page + deprecate PLAN_CONFIG** - `736cbb2` (feat — included in 08-03 parallel agent commit)
2. **Task 2: Create Stripe checkout session API route** - `4625e21` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `mystiqor-build/src/app/(auth)/pricing/page.tsx` - 3-tier pricing page with PlanCard grid, loading state, Stripe redirect via fetch POST
- `mystiqor-build/src/app/api/subscription/checkout/route.ts` - Stripe checkout session creation with auth guard, Zod validation, metadata
- `mystiqor-build/src/types/subscription.ts` - Added @deprecated JSDoc on PLAN_CONFIG

## Decisions Made

- PLAN_CONFIG marked @deprecated but NOT removed — preserves any remaining importers while signaling migration to PLAN_INFO
- planId enum is `basic | premium` only — free plan has no checkout flow, enterprise is not user-facing per SUBS-01
- Loading state sets `onSelect={undefined}` on the active card — PlanCard hides the button entirely when onSelect is falsy, preventing double-submit
- customer_email pre-filled from authenticated user's email to improve Stripe Checkout UX

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Task 1 files (pricing/page.tsx + types/subscription.ts) were already committed by the parallel 08-03 agent in commit `736cbb2` before this agent could commit them. This agent verified the committed content matched the plan spec exactly, then proceeded to Task 2.

## User Setup Required

None — all env vars (STRIPE_SECRET_KEY, STRIPE_PRICE_BASIC, STRIPE_PRICE_PREMIUM, NEXT_PUBLIC_SITE_URL) are documented in the plan and used but not configured here. These require the Stripe dashboard setup which is covered by 08-USER-SETUP.md if it exists.

## Next Phase Readiness

- /pricing page renders 3 PlanCards and POSTs to checkout API on click
- Checkout route creates Stripe session — ready to be tested once STRIPE_SECRET_KEY and price IDs are configured
- Webhook handler (08-02) can receive checkout.session.completed and use user_id from metadata
- Rate limiting middleware (08-03) is already wired into /api/subscription/usage route

---
*Phase: 08-growth-monetization*
*Completed: 2026-03-24*
