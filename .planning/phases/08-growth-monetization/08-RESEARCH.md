# Phase 8: Growth + Monetization — Research

**Researched:** 2026-03-24
**Domain:** Stripe payments, Resend email, Upstash rate limiting, referral systems, Next.js 14 App Router
**Confidence:** HIGH

---

## Summary

Phase 8 wires up the full business model on top of a solid subscription foundation that already exists.
The DB schema is complete (subscriptions, payment_history, processed_webhook_events, referrals, reminders
tables are all live), the core hooks and UI components exist (useSubscription, SubscriptionGuard, PlanCard,
UsageBar), and three of the four email templates are implemented in src/services/email/.

The primary work is: (1) Stripe checkout API + pricing page, (2) Stripe webhook with the idempotency
check against processed_webhook_events, (3) a subscription management page, (4) referral code generation
and reward logic, (5) wiring email sends into the correct trigger points, (6) Upstash Redis rate limiting
on LLM and upload endpoints, and (7) a notifications/reminders UI backed by the existing reminders table.

The Stripe and Resend npm packages are already installed (stripe@20.4.1, resend@4.8.0). Upstash packages
(@upstash/ratelimit@2.0.8, @upstash/redis@1.37.0) are NOT installed and must be added. GEM 4 from the
reverse engineering document contains the exact BASE44 Stripe webhook handler to port — this is the
authoritative reference for the webhook implementation.

**Primary recommendation:** Port GEM 4 webhook handler first (idempotency check is the hardest part),
then build the checkout session API + pricing page, then subscription management, then referral, then
email wiring, then rate limiting. Each plan is independently deployable.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUBS-01 | Pricing page with 3 tiers (Free ₪0, Basic ₪49/mo, Premium ₪99/mo) | PlanCard component exists, needs page at /pricing + Stripe Price IDs |
| SUBS-02 | Stripe checkout session creation and redirect | stripe.checkout.sessions.create + metadata.user_id + metadata.plan_id |
| SUBS-03 | Stripe webhook with idempotency (prevents duplicate subscriptions) | processed_webhook_events table exists; upsert pattern from GEM 4 |
| SUBS-04 | SubscriptionGuard enforces usage limits on paid features | Component exists; needs canUseFeature to gate by plan_type not just usage count |
| SUBS-05 | User can view and cancel subscription | Stripe customer portal OR cancel_at_period_end flag via API |
| SUBS-06 | Success page after subscription purchase | /subscription/success page reading ?session_id= param |
| TRCK-06 | Notifications and reminders system | reminders table exists in DB; needs CRUD API + UI |
| GROW-01 | Referral program with tracking and rewards | referrals table exists; needs code generation, tracking API, reward credit |
| INFRA-07 | Rate limiting on sensitive endpoints (Upstash Redis) | @upstash/ratelimit@2.0.8 + @upstash/redis@1.37.0 must be installed |
| INFRA-08 | Email service (welcome, daily insights, usage limit, payment failed) | All 3 transactional templates exist; welcome must fire from onboarding route |
</phase_requirements>

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^20.4.1 | Payment processing, checkout sessions, webhooks | Official Node.js SDK, already in package.json |
| resend | ^4.8.0 | Transactional email delivery | Already in package.json; email templates already use it |
| @supabase/supabase-js | ^2.99.3 | DB writes in webhook + admin client | Already installed, admin client exists at src/lib/supabase/admin.ts |

### Supporting (must install)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @upstash/ratelimit | 2.0.8 | Sliding window / fixed window rate limiting | Rate limiting LLM + upload endpoints (INFRA-07) |
| @upstash/redis | 1.37.0 | Redis client for Upstash (required by ratelimit) | Peer dependency of @upstash/ratelimit |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @upstash/ratelimit | Custom in-memory Map | Map does not survive Vercel cold starts; Upstash Redis is serverless-safe |
| @upstash/ratelimit | next-rate-limit | Less maintained; Upstash is industry standard for Next.js/Vercel |
| Stripe Customer Portal | Custom cancel UI | Portal saves weeks of work; handles card updates, invoices, cancellation |

**Installation (new packages only):**
```bash
npm install @upstash/ratelimit@2.0.8 @upstash/redis@1.37.0
```

**Version verification:** Confirmed via `npm view` on 2026-03-24:
- @upstash/ratelimit: 2.0.8 (latest)
- @upstash/redis: 1.37.0 (latest)
- stripe: 20.4.1 (already installed at latest)
- resend: 4.8.0 installed; latest is 6.9.4 — do NOT upgrade mid-phase; existing templates use 4.x API

---

## Architecture Patterns

### Recommended New Files

```
src/
├── app/
│   ├── (auth)/
│   │   ├── pricing/page.tsx              # SUBS-01: 3-tier pricing page
│   │   ├── subscription/
│   │   │   ├── page.tsx                  # SUBS-05: management (plan, usage, cancel)
│   │   │   └── success/page.tsx          # SUBS-06: post-checkout confirmation
│   │   └── notifications/page.tsx        # TRCK-06: reminders UI
│   └── api/
│       ├── webhooks/
│       │   └── stripe/route.ts           # SUBS-03: webhook + idempotency
│       ├── subscription/
│       │   ├── checkout/route.ts         # SUBS-02: create checkout session
│       │   ├── portal/route.ts           # SUBS-05: create customer portal session
│       │   └── cancel/route.ts           # SUBS-05: cancel_at_period_end fallback
│       ├── referrals/
│       │   ├── route.ts                  # GROW-01: GET my code + POST generate
│       │   └── claim/route.ts            # GROW-01: POST claim referral reward
│       └── notifications/
│           └── route.ts                  # TRCK-06: CRUD reminders
├── lib/
│   └── rate-limit.ts                     # INFRA-07: Upstash wrapper
└── components/features/
    └── subscription/
        └── SubscriptionManagement.tsx    # SUBS-05: current plan + usage + cancel
```

### Pattern 1: Stripe Checkout Session Creation (SUBS-02)

**What:** Server-side route creates a Stripe Checkout session with user metadata, returns URL.
**When to use:** User clicks "Subscribe" on pricing page or SubscriptionGuard upgrade prompt.

```typescript
// src/app/api/subscription/checkout/route.ts
// Source: GEM 4 (stripeWebhook/entry.ts) + Stripe docs
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,    // from Stripe dashboard
  premium: process.env.STRIPE_PRICE_PREMIUM!, // from Stripe dashboard
};

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(); // createClient().auth.getUser()
  const { planId } = await request.json();   // 'basic' | 'premium'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_IDS[planId], quantity: 1 }],
    metadata: { user_id: user.id, plan_id: planId },  // CRITICAL: used in webhook
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    customer_email: user.email,
  });

  return NextResponse.json({ url: session.url });
}
```

### Pattern 2: Stripe Webhook with Idempotency (SUBS-03)

**What:** POST /api/webhooks/stripe — verifies signature, deduplicates via processed_webhook_events, handles 4 event types.
**When to use:** Stripe calls this automatically on subscription events.

```typescript
// src/app/api/webhooks/stripe/route.ts
// Source: GEM 4 from 02b_GEMS.md — ported to Next.js App Router
import Stripe from 'stripe';

export const config = { api: { bodyParser: false } }; // NOT NEEDED in App Router

export async function POST(request: NextRequest) {
  // CRITICAL: use request.text() not request.json() — Stripe needs raw body for signature
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency check
  const supabase = createAdminClient(); // admin bypasses RLS
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true }); // already processed
  }

  // Record event BEFORE processing (prevents duplicate on crash+retry)
  await supabase.from('processed_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
  });

  switch (event.type) {
    case 'checkout.session.completed': { /* upgrade subscription */ break; }
    case 'customer.subscription.updated': { /* update status/plan */ break; }
    case 'customer.subscription.deleted': { /* mark cancelled */ break; }
    case 'invoice.payment_failed': { /* record + send email */ break; }
  }

  return NextResponse.json({ received: true });
}
```

**CRITICAL:** The webhook route must NOT be in the `(auth)` route group (no auth middleware). It lives under `app/api/webhooks/stripe/route.ts`.

**CRITICAL:** In Next.js App Router, raw body reading uses `request.text()` — no `bodyParser: false` config export needed. This is different from Pages Router.

### Pattern 3: Upstash Rate Limiting (INFRA-07)

**What:** Sliding window rate limiter applied to LLM and upload API routes.
**When to use:** Any endpoint that calls OpenAI or accepts file uploads.

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create once — Upstash Redis from env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 10 requests per 60 seconds per user
export const llmRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'mystiqor:llm',
});

// 5 file uploads per 60 seconds per user
export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'mystiqor:upload',
});

// Usage in API routes:
// const { success } = await llmRateLimit.limit(user.id);
// if (!success) return NextResponse.json({ error: 'מגבלת בקשות הגיעה' }, { status: 429 });
```

### Pattern 4: Referral Code Generation (GROW-01)

**What:** Generate unique 8-char uppercase code, store in referrals table, reward referrer on completion.
**When to use:** User visits their referral dashboard, or referral link is clicked by new user.

```typescript
// Referral code pattern — crypto.randomUUID() sliced, not nanoid (no extra dep)
function generateReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
}

// Reward: add N bonus analyses to referrer's subscription
// reward_analyses field in referrals table already exists (default value TBD — suggest 5)
// On claim: UPDATE subscriptions SET analyses_limit = analyses_limit + reward_analyses
//           WHERE user_id = referrer_id
```

### Pattern 5: Email Trigger Points (INFRA-08)

**What:** Wire existing email services into the correct API route triggers.
**When to use:** Each trigger is a specific event in the request lifecycle.

| Email | Trigger Location | Status |
|-------|-----------------|--------|
| Welcome | `POST /api/onboarding/complete` — after profile insert succeeds | Template exists, NOT wired yet |
| Payment Failed | Stripe webhook `invoice.payment_failed` handler | Template exists, NOT wired yet |
| Usage Limit | `POST /api/subscription/usage` — when increment_usage returns 429 | Template exists, NOT wired yet |
| Referral Accepted | `POST /api/referrals/claim` — after reward applied | Template does NOT exist, must create |

### Pattern 6: Subscription Management Page (SUBS-05)

**What:** Page showing current plan + UsageBar + cancel option. Cancel uses Stripe Customer Portal.
**When to use:** User navigates to /subscription.

The Stripe Customer Portal is the recommended approach — it handles:
- Card updates
- Invoice history
- Plan cancellation / reactivation
- Addresses legal compliance (billing portal)

```typescript
// POST /api/subscription/portal — creates portal session URL
const portalSession = await stripe.billingPortal.sessions.create({
  customer: subscription.stripe_customer_id,
  return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`,
});
return NextResponse.json({ url: portalSession.url });
```

### Anti-Patterns to Avoid

- **Don't parse Stripe webhook body as JSON:** Use `request.text()` in App Router. `request.json()` breaks signature verification because it consumes the raw body.
- **Don't use the browser Supabase client in webhook routes:** Use the admin client (`createAdminClient`) — webhooks have no user session, so RLS would block all writes.
- **Don't insert to processed_webhook_events AFTER processing:** Insert BEFORE processing so a crash+retry doesn't double-process. The table has a unique constraint on stripe_event_id.
- **Don't store Stripe Price IDs in code:** Keep in environment variables — they differ between test and production.
- **Don't use the plans.ts PLAN_INFO `basic: { analyses: 20 }` value for the checkout session:** The analyses_limit for a paid plan is set by the webhook handler from Stripe metadata, not from PLAN_INFO. Keep them in sync.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC comparison | `stripe.webhooks.constructEvent()` | Edge cases around timing attacks, header parsing |
| Billing portal | Custom cancel/update UI | `stripe.billingPortal.sessions.create()` | Legal compliance, card vault, PCI scope |
| Rate limiting counter | In-memory Map or DB counter | `@upstash/ratelimit` sliding window | Map dies on cold start; DB adds latency per request |
| Email HTML templates | Inline styles by hand | Existing templates in src/services/email/ | Three are already built (welcome, payment-failed, usage-limit) |
| Referral code uniqueness | UUID4 + check loop | `crypto.randomUUID().slice(0,8).toUpperCase()` + DB unique constraint | Constraint handles collision; no loop needed |
| Subscription status sync | Poll Stripe API | Stripe webhooks + local DB mirror | Webhooks are push; polling is N API calls per page load |

**Key insight:** Stripe handles the hard parts — PCI compliance, retry logic, card vault. The webhook pattern (verify → deduplicate → update DB) is the only custom code needed.

---

## Common Pitfalls

### Pitfall 1: Webhook Body Parsing in App Router
**What goes wrong:** `request.json()` consumes the stream; subsequent `stripe.webhooks.constructEvent(body, sig, secret)` receives an empty string and throws "No signatures found matching the expected signature".
**Why it happens:** App Router request bodies are streams read once. JSON parsing is destructive.
**How to avoid:** Always use `const body = await request.text()` in the Stripe webhook route, then pass `body` directly to `constructEvent`. Do not touch `request.json()` in this route.
**Warning signs:** 400 errors from the webhook route with "Invalid signature" in production, but works in Stripe CLI testing where you re-post.

### Pitfall 2: Duplicate Subscription on Webhook Retry
**What goes wrong:** Stripe retries webhook delivery if it doesn't get a 200. Without idempotency, the same `checkout.session.completed` event creates two subscription rows.
**Why it happens:** Network timeouts, slow DB writes, or Vercel function restarts.
**How to avoid:** Insert to `processed_webhook_events` BEFORE the DB update for the subscription. The table has a unique constraint on `stripe_event_id` — a second insert will fail, and you return 200 early. This is the pattern in GEM 4.
**Warning signs:** Users reporting double charges or two active subscriptions.

### Pitfall 3: Admin Client vs Server Client in Webhook
**What goes wrong:** Using `createClient()` (server) in the webhook route returns RLS-blocked queries because there's no user session in a webhook request.
**Why it happens:** RLS policies require `auth.uid()` to match the row's `user_id`. Webhooks have no JWT.
**How to avoid:** Use `createAdminClient()` from `src/lib/supabase/admin.ts` — it uses the service role key and bypasses RLS entirely. Admin client is already implemented in the project.
**Warning signs:** Webhook handler receives 200 but subscription in DB is unchanged.

### Pitfall 4: Stripe Price ID Mismatch
**What goes wrong:** Test mode Price IDs (price_test_xxx) hard-coded in source, deployed to production with live mode keys — checkouts fail or create wrong plan.
**Why it happens:** Different Stripe environments (test/live) have different Price IDs.
**How to avoid:** Store Price IDs in `STRIPE_PRICE_BASIC` and `STRIPE_PRICE_PREMIUM` environment variables. Use Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local testing.
**Warning signs:** "No such price" errors from Stripe API in production.

### Pitfall 5: Upstash Redis Env Vars Not Set
**What goes wrong:** `@upstash/redis` throws at module init time if `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are undefined. This crashes the entire API route, not just the rate limit check.
**Why it happens:** The Redis client is instantiated at module scope, not inside the request handler.
**How to avoid:** Guard with a `createRateLimiter()` factory that returns null if env vars are missing, and skip rate limiting gracefully. Alternatively, set the env vars in `.env.local` before testing.
**Warning signs:** All LLM API routes return 500 after adding rate limiting, not just rate-limited requests.

### Pitfall 6: Referral Code Collision
**What goes wrong:** Two users generate the same 8-char code (probability ~1/4 billion, but possible at scale).
**Why it happens:** Random generation without uniqueness enforcement.
**How to avoid:** The `referrals.referral_code` column needs a UNIQUE constraint in the DB. Check `database.generated.ts` — if the constraint is missing, add it in the Phase 8 migration. On insert failure, retry once with a new code.
**Warning signs:** "duplicate key value violates unique constraint" errors on referral creation.

### Pitfall 7: resend@4.8.0 vs resend@6.9.4 API Differences
**What goes wrong:** Upgrading resend mid-phase breaks existing email templates — the v4 API (`resend.emails.send`) works differently in v6 (different import paths, response shape changes).
**Why it happens:** Major version bumps in Resend SDK.
**How to avoid:** Keep resend@4.8.0 as installed. The existing templates are tested with v4. Upgrade is a separate task, not in scope for Phase 8.
**Warning signs:** TypeScript errors on `resend.emails.send` method signature after upgrade.

### Pitfall 8: PLAN_INFO Inconsistency Between plans.ts and types/subscription.ts
**What goes wrong:** `plans.ts` says `basic: { analyses: 20 }` but `types/subscription.ts` PLAN_CONFIG says `basic: { analyses: 15 }`. These two sources of truth are already out of sync in the codebase.
**Why it happens:** Duplicate plan definition files. `useSubscription.ts` imports from `plans.ts` (GEM 7). `types/subscription.ts` has a second definition.
**How to avoid:** Phase 8 must canonicalize: `plans.ts` PLAN_INFO is the source of truth (GEM 7, matches the requirements spec: Basic=20, Premium=unlimited). Remove or deprecate PLAN_CONFIG from `types/subscription.ts`. The webhook handler writes `analyses_limit` based on `planId` from metadata, so it must use the same values as `plans.ts`.

---

## Code Examples

### Stripe Webhook — Full Handler Skeleton
```typescript
// Source: GEM 4 (02b_GEMS.md) ported to Next.js App Router
// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentFailedEmail } from '@/services/email/payment-failed';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text(); // NEVER request.json()
  const sig = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient(); // bypass RLS

  // Idempotency: insert first, process second
  const { error: dupError } = await supabase
    .from('processed_webhook_events')
    .insert({ stripe_event_id: event.id, event_type: event.type });
  if (dupError) {
    // unique constraint violation = already processed
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;
      if (!userId || !planId) break;
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_type: planId,
        status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        analyses_limit: planId === 'basic' ? 20 : -1,
        analyses_used: 0,
        start_date: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions')
        .update({ status: sub.status, cancel_at_period_end: sub.cancel_at_period_end })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions')
        .update({ status: 'cancelled', plan_type: 'free' })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // Look up user by stripe_customer_id to get email + name
      // Then call sendPaymentFailedEmail(email, name, amount)
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### Upstash Rate Limiter Wrapper
```typescript
// Source: @upstash/ratelimit docs — official pattern
// src/lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createLimiter(prefix: string, requests: number, window: string) {
  // Guard: return null if env vars not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `mystiqor:${prefix}`,
  });
}

export const llmRateLimit = createLimiter('llm', 10, '60 s');
export const uploadRateLimit = createLimiter('upload', 5, '60 s');

// Usage helper:
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<boolean> {
  if (!limiter) return true; // skip if not configured
  const { success } = await limiter.limit(identifier);
  return success;
}
```

### Referral Code Generation + Claim
```typescript
// GET /api/referrals — returns referrer's own code (creates if absent)
// POST /api/referrals/claim — claim a code, credit referrer

// Generate code (no extra deps)
const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();

// Claim reward: add bonus analyses to referrer
await supabase.rpc('apply_referral_reward', {
  p_referrer_id: referral.referrer_id,
  p_reward_analyses: referral.reward_analyses ?? 5,
});
// OR direct update if no RPC:
await supabase.from('subscriptions')
  .update({ analyses_limit: supabase.rpc('coalesce_add', {...}) }) // use raw SQL
  // simpler: fetch current limit, add reward, update
```

---

## Existing Assets Inventory

### Already Built — Do Not Rebuild

| Asset | File | State | Phase 8 Usage |
|-------|------|-------|---------------|
| useSubscription hook | src/hooks/useSubscription.ts | Complete | Use as-is; PLAN_INFO already imported |
| SubscriptionGuard | src/components/features/subscription/SubscriptionGuard.tsx | Complete | Links to /pricing — page must exist |
| PlanCard | src/components/features/subscription/PlanCard.tsx | Complete | Reuse on /pricing page |
| UsageBar | src/components/features/subscription/UsageBar.tsx | Complete | Reuse on /subscription page |
| GET /api/subscription | src/app/api/subscription/route.ts | Complete | Powers subscription management page |
| POST /api/subscription/usage | src/app/api/subscription/usage/route.ts | Complete | Triggers usage limit email |
| sendWelcomeEmail | src/services/email/welcome.ts | Complete | Wire into /api/onboarding/complete |
| sendPaymentFailedEmail | src/services/email/payment-failed.ts | Complete | Wire into Stripe webhook |
| sendUsageLimitEmail | src/services/email/usage-limit.ts | Complete | Wire into /api/subscription/usage |
| PLAN_INFO | src/lib/constants/plans.ts | Complete | Source of truth for plan limits |
| subscriptions table | database.generated.ts (live) | Complete | stripe_customer_id + stripe_subscription_id columns ready |
| processed_webhook_events | database.generated.ts (live) | Complete | stripe_event_id unique for idempotency |
| referrals table | database.generated.ts (live) | Complete | referral_code, referrer_id, reward_analyses, status |
| reminders table | database.generated.ts (live) | Complete | TRCK-06 backend ready |

### Must Create in Phase 8

| Asset | Location | Requirement |
|-------|----------|-------------|
| /pricing page | app/(auth)/pricing/page.tsx | SUBS-01 |
| /subscription/success page | app/(auth)/subscription/success/page.tsx | SUBS-06 |
| /subscription management page | app/(auth)/subscription/page.tsx | SUBS-05 |
| /notifications page | app/(auth)/notifications/page.tsx | TRCK-06 |
| POST /api/subscription/checkout | app/api/subscription/checkout/route.ts | SUBS-02 |
| POST /api/subscription/portal | app/api/subscription/portal/route.ts | SUBS-05 |
| POST /api/webhooks/stripe | app/api/webhooks/stripe/route.ts | SUBS-03 |
| GET+POST /api/referrals | app/api/referrals/route.ts | GROW-01 |
| POST /api/referrals/claim | app/api/referrals/claim/route.ts | GROW-01 |
| GET+POST+DELETE /api/notifications | app/api/notifications/route.ts | TRCK-06 |
| src/lib/rate-limit.ts | lib/rate-limit.ts | INFRA-07 |
| Referral accepted email | src/services/email/referral-accepted.ts | GROW-01 |
| DB migration 005 | supabase/migrations/005_phase8_fixes.sql | Unique constraint on referral_code if missing |

### Inconsistency to Resolve

`src/lib/constants/plans.ts` (PLAN_INFO) and `src/types/subscription.ts` (PLAN_CONFIG) both define plan limits but with different values:
- `plans.ts`: basic=20 analyses, premium=unlimited (-1)
- `subscription.ts`: basic=15 analyses, premium=unlimited (-1)

The requirement spec (REQUIREMENTS.md) says Basic = 20/month. The onboarding route uses `analyses_limit: 3` for free. The webhook handler must use `planId === 'basic' ? 20 : -1`. Plan 08-01 or 08-02 must explicitly resolve this by marking `PLAN_CONFIG` in `subscription.ts` as deprecated and pointing callers to `plans.ts`.

---

## Environment Variables Required

New variables needed in .env.local and Vercel:

```bash
# Stripe (required for all payment plans)
STRIPE_SECRET_KEY=sk_test_...          # or sk_live_ in production
STRIPE_WEBHOOK_SECRET=whsec_...        # from Stripe CLI or dashboard
STRIPE_PRICE_BASIC=price_...           # Basic plan Price ID from Stripe dashboard
STRIPE_PRICE_PREMIUM=price_...         # Premium plan Price ID from Stripe dashboard

# Upstash Redis (required for rate limiting — INFRA-07)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Resend (already in use — confirm set)
RESEND_API_KEY=re_...                  # already used by email templates

# Site URL (already in use — confirm set)
NEXT_PUBLIC_SITE_URL=https://...       # used by email templates for CTA links
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `config.api.bodyParser = false` (Pages Router) | `await request.text()` in App Router | Next.js 13 | Webhook raw body reading is simpler |
| Custom billing portal | `stripe.billingPortal.sessions.create()` | Stripe 2022 | Handle cancellation without custom UI |
| In-memory rate limiting | Upstash Redis sliding window | 2023 | Serverless-safe, survives cold starts |
| Polling Stripe for subscription status | Webhook-driven local DB mirror | Stripe best practice | Zero API calls at render time |

**Deprecated/outdated:**
- `stripe.webhooks.constructEventAsync`: Still valid but `constructEvent` (sync) works with `await request.text()` — same result, simpler.
- Pages Router `export const config = { api: { bodyParser: false } }`: Not applicable in App Router. Remove from any ported code.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | None detected — see Wave 0 |
| Quick run command | `npm test -- --run` (from mystiqor-build/) |
| Full suite command | `npm test -- --run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUBS-02 | checkout route returns URL when planId is valid | unit | `npm test -- --run tests/api/subscription/checkout.test.ts` | Wave 0 |
| SUBS-03 | webhook route deduplicates on second call with same stripe_event_id | unit | `npm test -- --run tests/api/webhooks/stripe.test.ts` | Wave 0 |
| SUBS-03 | webhook route returns 400 on invalid signature | unit | `npm test -- --run tests/api/webhooks/stripe.test.ts` | Wave 0 |
| INFRA-07 | rate limiter returns false after N requests | unit | `npm test -- --run tests/lib/rate-limit.test.ts` | Wave 0 |
| GROW-01 | referral code generation produces 8-char uppercase string | unit | `npm test -- --run tests/api/referrals.test.ts` | Wave 0 |
| SUBS-01 | pricing page renders 3 tier cards | smoke | manual / browser | n/a |
| SUBS-05 | cancel flow sets cancel_at_period_end | integration | manual / browser | n/a |

### Wave 0 Gaps

- [ ] `mystiqor-build/tests/api/subscription/checkout.test.ts` — covers SUBS-02
- [ ] `mystiqor-build/tests/api/webhooks/stripe.test.ts` — covers SUBS-03 (idempotency + invalid sig)
- [ ] `mystiqor-build/tests/lib/rate-limit.test.ts` — covers INFRA-07
- [ ] `mystiqor-build/tests/api/referrals.test.ts` — covers GROW-01 code generation

*(No vitest config file detected — create `mystiqor-build/vitest.config.ts` pointing to `mystiqor-build/src`)*

---

## Open Questions

1. **Stripe Billing Portal activation**
   - What we know: `stripe.billingPortal.sessions.create()` requires the Customer Portal to be enabled in the Stripe dashboard under Settings > Billing > Customer Portal.
   - What's unclear: Whether the Stripe account has this configured for this project.
   - Recommendation: Document a manual step in plan 08-03 — developer must enable the Customer Portal in the Stripe dashboard before the portal link works. Provide the cancel-via-API fallback as an alternative if portal setup is blocked.

2. **referral_code unique constraint**
   - What we know: The referrals table in database.generated.ts has `referral_code: string` in the Row type. There is no explicit mention of a UNIQUE constraint in the generated types.
   - What's unclear: Whether the live DB has a UNIQUE constraint or just an index on referral_code.
   - Recommendation: Plan 08-04 includes a migration step that runs `ALTER TABLE referrals ADD CONSTRAINT IF NOT EXISTS referrals_referral_code_unique UNIQUE (referral_code)` idempotently.

3. **Daily insights email (INFRA-08 partial)**
   - What we know: INFRA-08 includes "daily insights" email. REQUIREMENTS.md lists it. No template exists for it.
   - What's unclear: Whether this is a scheduled email (requires cron) or on-demand. Vercel Cron is the obvious solution but needs a separate `vercel.json` config.
   - Recommendation: Scope Phase 8 to transactional emails only (welcome, payment-failed, usage-limit, referral-accepted). Mark "daily digest" email as deferred to Phase 9/10 — it needs scheduling infrastructure (Vercel Cron + `/api/cron/daily-digest`) that is out of scope for the current phase plan.

4. **/pricing page route group**
   - What we know: All protected pages are under `app/(auth)/`. The pricing page should be accessible without login (to convert visitors) but also usable when logged in.
   - What's unclear: Should /pricing be in `(public)` or `(auth)`?
   - Recommendation: Place in `(auth)` group since SubscriptionGuard already links to `/pricing` and the existing upgrade flow assumes the user is logged in. Anonymous users convert via signup → onboarding → pricing. Adding a public /pricing page is a nice-to-have but not a SUBS-01 requirement.

---

## Sources

### Primary (HIGH confidence)

- GEM 4 in `mystiqor-build/02b_GEMS.md` — Stripe webhook handler (BASE44 source, vetted)
- `mystiqor-build/src/types/database.generated.ts` — Live DB schema for all tables used in Phase 8
- `mystiqor-build/package.json` — Confirmed installed packages and versions
- `npm view @upstash/ratelimit version` (2026-03-24) — Version 2.0.8 confirmed
- `npm view @upstash/redis version` (2026-03-24) — Version 1.37.0 confirmed
- `mystiqor-build/src/services/email/` — All three existing email templates confirmed
- `mystiqor-build/src/components/features/subscription/` — All three subscription UI components confirmed

### Secondary (MEDIUM confidence)

- Stripe Next.js App Router docs (request.text() for webhook raw body) — standard Next.js 13+ pattern, widely documented
- @upstash/ratelimit sliding window pattern — matches official Upstash README

### Tertiary (LOW confidence)

- Stripe Billing Portal setup requirement (must be enabled in dashboard) — based on Stripe docs knowledge, not verified against current Stripe account state

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed via npm view or package.json inspection
- Architecture: HIGH — DB schema confirmed live, existing components confirmed in codebase
- Pitfalls: HIGH — webhook body parsing and admin client issues are known Next.js App Router patterns
- Rate limiting: HIGH — Upstash packages confirmed, pattern is standard
- Referral system: MEDIUM — DB schema confirmed, but unique constraint status unclear without DB query

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (Stripe and Upstash APIs are stable; 30-day window is safe)
