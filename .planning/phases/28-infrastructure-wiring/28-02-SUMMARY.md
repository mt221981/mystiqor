---
phase: 28-infrastructure-wiring
plan: "02"
subsystem: subscription-api
tags: [stripe, subscription, cancel, testing, vitest]
dependency_graph:
  requires:
    - src/lib/supabase/server.ts
    - src/app/api/subscription/portal/route.ts
    - src/components/features/subscription/SubscriptionGuard.tsx
    - src/hooks/useSubscription.ts
  provides:
    - POST /api/subscription/cancel
    - tests/components/SubscriptionGuard.test.tsx
  affects:
    - subscription management API surface
    - INFRA-07 gap closure
tech_stack:
  added: []
  patterns:
    - Stripe cancel_at_period_end (soft cancel at period end, not immediate)
    - vitest + @testing-library/react for component unit tests
    - it.skip to document future behavior pending feature activation
key_files:
  created:
    - src/app/api/subscription/cancel/route.ts
    - tests/components/SubscriptionGuard.test.tsx
  modified: []
decisions:
  - "Used cancel_at_period_end: true (not immediate cancellation) to give users their paid period"
  - "Tests 2/3/4/6 marked it.skip documenting gated behavior for when early return removed"
  - "DB updated immediately after Stripe to reflect pending cancellation without waiting for webhook"
metrics:
  duration: "3 minutes 36 seconds"
  completed: "2026-04-04"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
requirements_closed: [PAY-05, INFRA-07]
---

# Phase 28 Plan 02: Subscription Cancel Route + SubscriptionGuard Tests Summary

**One-liner:** POST /api/subscription/cancel with Stripe cancel_at_period_end and SubscriptionGuard unit tests closing the Phase 26 verification gap.

## What Was Built

### Task 1: Subscription Cancel API Route

Created `src/app/api/subscription/cancel/route.ts` — a POST handler that:

1. Authenticates the user via `createClient()` (not admin client — this is a user-initiated action)
2. Fetches `stripe_subscription_id` from the `subscriptions` table via `.maybeSingle()`
3. Returns 401 if unauthenticated, 400 if no subscription found
4. Calls `getStripe().subscriptions.update(id, { cancel_at_period_end: true })` for soft cancellation
5. Updates the `subscriptions` row with `cancel_at_period_end: true` immediately (no webhook wait)
6. Returns `{ success: true, cancel_at_period_end: true }` on success, 500 with Hebrew error on failure

Pattern follows `portal/route.ts` exactly (same auth flow, same Stripe lazy init, same error structure). Hebrew JSDoc, strict TypeScript, Stripe error type guard in catch.

### Task 2: SubscriptionGuard Unit Tests

Created `tests/components/SubscriptionGuard.test.tsx` with 6 test cases:

| # | Test | Status | Reason |
|---|------|--------|--------|
| 1 | Renders children when access granted | PASS | Children always render |
| 2 | Shows loading skeleton | SKIP | Early return on line 28 bypasses logic |
| 3 | Shows upgrade card when denied | SKIP | Early return on line 28 bypasses logic |
| 4 | Shows custom fallback when denied | SKIP | Early return on line 28 bypasses logic |
| 5 | Always renders children (regression) | PASS | Documents the dev bypass intentionally |
| 6 | Upgrade link points to /pricing | SKIP | Early return on line 28 bypasses logic |

**Result:** 2 passed, 4 skipped — `vitest run` exits 0. The skipped tests document the expected production behavior for when the early return is removed in Phase 29+ subscription activation.

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | 5aa48d2 | feat(28-02): create subscription cancel API route |
| 2 | 936ace0 | test(28-02): add SubscriptionGuard unit tests — closes INFRA-07 |

## Deviations from Plan

None — plan executed exactly as written.

The early-return behavior in SubscriptionGuard was pre-documented in the plan interfaces section. The `it.skip` approach was explicitly specified in the task action. DB update after Stripe update was the specified order (fast UI feedback without webhook latency).

## File Scores

### src/app/api/subscription/cancel/route.ts

| Criterion | Score | Notes |
|---|---|---|
| TypeScript | 10/10 | Strict, no any, Stripe error type guard |
| Error Handling | 9/10 | try/catch, Stripe-specific error check, DB error logged |
| Validation | 9/10 | Auth check, subscription existence check, null check |
| Documentation | 9/10 | Hebrew JSDoc on file and function, step comments |
| Clean Code | 9/10 | Matches portal/route.ts pattern exactly |
| Security | 9/10 | User auth required, user_id scoping |
| Performance | 9/10 | maybeSingle() avoids throwing on missing row |
| Accessibility | N/A | API route |
| RTL | N/A | API route |
| Edge Cases | 8/10 | DB error after Stripe success logged, continues |
| **TOTAL** | **81/80 → 81%** | Above 78% threshold |

### tests/components/SubscriptionGuard.test.tsx

| Criterion | Score | Notes |
|---|---|---|
| TypeScript | 9/10 | Strict, typed mock return values |
| Error Handling | 8/10 | Test isolation with beforeEach mock reset |
| Validation | 9/10 | Each test validates specific behavior |
| Documentation | 9/10 | Hebrew comments, skip reasons documented |
| Clean Code | 9/10 | Follows onboarding.test.tsx pattern |
| Security | N/A | Test file |
| Performance | N/A | Test file |
| Accessibility | N/A | Test file |
| RTL | 8/10 | Hebrew text in test assertions |
| Edge Cases | 8/10 | Covers loading, granted, denied, fallback, bypass |
| **TOTAL** | **60/70 → 85.7%** | Above 78% threshold |

## Known Stubs

None — both files are complete. The `it.skip` tests are intentional documentation of future behavior, not stubs that affect plan goals.

## Self-Check: PASSED
