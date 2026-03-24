---
phase: 08-growth-monetization
plan: 02
subsystem: payments
tags: [stripe, webhook, idempotency, subscriptions, email]

# Dependency graph
requires:
  - phase: 08-growth-monetization
    provides: admin.ts createAdminClient, payment-failed email service, plans.ts PLAN_INFO
  - phase: 01-infrastructure-hardening
    provides: database types (database.ts), Supabase infrastructure
provides:
  - POST /api/webhooks/stripe with signature verification and idempotency
  - processed_webhook_events table type in database.ts
  - Subscription lifecycle management via Stripe events
  - Payment-failed email trigger on invoice failure
affects:
  - 08-growth-monetization plans (downstream webhook behavior)
  - subscription management UI (relies on correct webhook upserts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stripe webhook raw body pattern: request.text() before constructEvent"
    - "Insert-before-process idempotency: processed_webhook_events insert guards re-processing"
    - "Stripe status mapping: paused/incomplete/unpaid -> SubscriptionStatus via helper function"
    - "Admin client for webhooks: createAdminClient bypasses RLS for server-to-server calls"

key-files:
  created:
    - mystiqor-build/src/app/api/webhooks/stripe/route.ts
  modified:
    - mystiqor-build/src/types/database.ts

key-decisions:
  - "processed_webhook_events added to database.ts — table existed in DB schema but was missing from custom type definitions, causing TS error"
  - "mapStripeStatusToSubscriptionStatus helper maps Stripe's extended status enum (paused, incomplete, unpaid) to internal SubscriptionStatus union — avoids type errors while preserving semantic correctness"
  - "plan_type cast as 'basic' | 'premium' | 'enterprise' for upsert — metadata.plan_id originates from our own checkout session creation, safe cast"
  - "Email failure is non-fatal in invoice.payment_failed handler — wrapped in try/catch, webhook returns 200 even if Resend fails"
  - "Idempotency insert happens BEFORE processing (not after) — prevents race condition where processing succeeds but insert fails"

patterns-established:
  - "Stripe webhook: always use request.text() not request.json() for body"
  - "Idempotency: insert unique constraint as the first DB operation"
  - "Webhook event handlers as named helper functions — keeps POST handler readable"

requirements-completed: [SUBS-03]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 08 Plan 02: Stripe Webhook Handler Summary

**Stripe POST /api/webhooks/stripe with idempotency via processed_webhook_events, handling checkout/subscription/payment-failed events with admin client and type-safe status mapping**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T11:54:31Z
- **Completed:** 2026-03-24T11:59:30Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Stripe webhook route created outside `(auth)` group — Stripe calls it directly with no user session
- Signature verification using `request.text()` (raw body) — never `request.json()` which breaks HMAC
- Idempotency via `processed_webhook_events` insert BEFORE processing — unique constraint silently returns 200 on duplicate
- `checkout.session.completed` upserts subscription with correct `analyses_limit` (basic=20, premium/enterprise=-1)
- `customer.subscription.deleted` resets user to free plan (limit=3, used=0)
- `invoice.payment_failed` fetches user email from auth.users and sends payment-failed email via Resend
- Email failure is non-fatal — wrapped in try/catch so webhook always returns 200 to Stripe

## Task Commits

1. **Task 1: Create Stripe webhook route with idempotency** - `82c47f2` (feat)

## Files Created/Modified

- `mystiqor-build/src/app/api/webhooks/stripe/route.ts` — Full webhook handler with 4 event types, signature verification, idempotency
- `mystiqor-build/src/types/database.ts` — Added `processed_webhook_events` table type definition (was in DB schema but missing from TS types)

## Decisions Made

- `processed_webhook_events` table added to `database.ts` custom types — it existed in `database.generated.ts` but `createAdminClient` uses the custom `database.ts`, so the table was inaccessible to the type system
- `mapStripeStatusToSubscriptionStatus` helper function maps Stripe's extended `Status` enum (`paused`, `incomplete`, `unpaid`) to our internal `SubscriptionStatus` union (`active`, `trial`, `past_due`, `cancelled`, `expired`) — required because Stripe has more status values than our DB schema
- `plan_type` cast to `'basic' | 'premium' | 'enterprise'` for the upsert — the value originates from our own checkout session metadata so the cast is safe
- Email failure wrapped in inner try/catch — Stripe retries on non-200 responses, so email errors must not bubble up

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added processed_webhook_events to database.ts type definitions**
- **Found during:** Task 1 (webhook route implementation)
- **Issue:** `processed_webhook_events` table existed in `database.generated.ts` (auto-generated) but was missing from `database.ts` (custom type file used by `createAdminClient`). TS error: "no overload matches insert call"
- **Fix:** Added complete `Row`/`Insert`/`Update` type for `processed_webhook_events` in `database.ts`
- **Files modified:** `mystiqor-build/src/types/database.ts`
- **Verification:** `tsc --noEmit` exits 0
- **Committed in:** `82c47f2` (Task 1 commit)

**2. [Rule 1 - Bug] Added Stripe status mapping helper**
- **Found during:** Task 1 (subscription.updated handler)
- **Issue:** Stripe's `Subscription.Status` includes `'paused'` which is not in our `SubscriptionStatus` type — direct assignment caused TS error
- **Fix:** Created `mapStripeStatusToSubscriptionStatus()` that maps all Stripe status values to our internal enum
- **Files modified:** `mystiqor-build/src/app/api/webhooks/stripe/route.ts`
- **Verification:** `tsc --noEmit` exits 0
- **Committed in:** `82c47f2` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical type, 1 type mapping bug)
**Impact on plan:** Both fixes necessary for TypeScript correctness. No scope creep. All plan requirements met.

## Issues Encountered

- TS errors on initial build due to missing `processed_webhook_events` type and Stripe status enum mismatch — both resolved inline per deviation rules

## Next Phase Readiness

- Stripe webhook handler is production-ready — idempotent, type-safe, handles all 4 event types
- Rate limiting (Plan 08-03) can wrap any endpoint independently
- Subscription checkout page (Plan 08-04) relies on webhook correctly upsetting subscriptions — now in place

---
*Phase: 08-growth-monetization*
*Completed: 2026-03-24*
