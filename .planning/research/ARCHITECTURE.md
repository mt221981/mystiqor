# Architecture Patterns — MystiQor v1.3 Feature Integration

**Domain:** Hebrew mystical self-discovery platform (Next.js 16 + Supabase)
**Researched:** 2026-04-03
**Mode:** Integration architecture for subsequent milestone

---

## Executive Summary

The v1.3 codebase is extensively pre-built. All major API routes exist. All pages exist. All DB tables are typed and all service files are in place. The dominant pattern throughout is: **API route (Zod validated) → service function → Supabase (server client or admin client) → React Query on client**. Every new feature must follow this same groove.

The most important architectural insight: **nothing is truly missing at the skeleton level**. What is missing is (a) page bodies that are still stubs, (b) a few service functions called by routes that do not yet exist, and (c) vercel.json for cron scheduling. Integration work is completion, not construction.

---

## Existing Architecture Map

### Route Groups

```
src/app/
├── (auth)/          — All protected pages, all have layout.tsx with Supabase auth check
│   ├── coach/       — AI Coach page (BUILT, full component)
│   ├── analytics/   — Analytics page (BUILT, full component)
│   ├── goals/       — Goals CRUD page (BUILT, full component)
│   ├── journal/     — Journal CRUD page (BUILT, full component)
│   ├── mood/        — Mood tracker page (BUILT, full component)
│   ├── profile/     — Profile + guest profiles (BUILT, full component)
│   ├── settings/    — Settings page (BUILT, full component)
│   ├── notifications/ — Reminders page (BUILT, full component)
│   ├── referrals/   — Referral code page (BUILT, full component)
│   ├── subscription/ — Subscription management (BUILT, thin wrapper over SubscriptionManagement)
│   └── daily-insights/ — Daily insights page (EXISTS as page stub only)
├── (public)/
│   ├── login/       — Auth page
│   ├── pricing/     — Public pricing
│   └── share/       — Public analysis share
└── api/             — 60+ route handlers (see below)
```

### API Routes Inventory

All routes already exist. Completion status:

| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/webhooks/stripe` | BUILT | Signature verify, idempotency, 4 event types |
| `POST /api/subscription/checkout` | BUILT | Stripe session creation |
| `POST /api/subscription/portal` | BUILT | Stripe portal redirect |
| `GET/PATCH /api/subscription/route` | BUILT | Read/update subscription row |
| `GET /api/subscription/usage` | EXISTS | Check current analyses_used |
| `POST /api/subscription/cancel` | MISSING ROUTE FILE | cancel/route.ts directory exists but no file |
| `GET/POST /api/coach/conversations` | BUILT | Full CRUD |
| `GET/POST /api/coach/messages` | BUILT | Request/response (not streaming) |
| `GET/POST /api/coach/journeys` | BUILT | AI journey creation |
| `PATCH /api/coach/journeys/[id]` | BUILT | Step completion |
| `GET /api/analytics` | BUILT | Aggregated personal analytics |
| `GET/POST /api/notifications` | BUILT | Reminders CRUD |
| `DELETE /api/notifications` | BUILT | Via query param |
| `GET/POST /api/referrals` | BUILT | Code generation |
| `POST /api/referrals/claim` | BUILT | Claim a referral code |
| `GET/PATCH /api/profile` | BUILT | Profile read/update |
| `GET/POST /api/goals` | BUILT | Goals CRUD |
| `GET/PATCH/DELETE /api/goals/[id]` | BUILT | Per-goal operations |
| `GET/POST /api/mood` | BUILT | Mood entry CRUD |
| `GET/PATCH/DELETE /api/mood/[id]` | BUILT | Per-entry operations |
| `GET/POST /api/journal` | BUILT | Journal CRUD |
| `GET/PATCH/DELETE /api/journal/[id]` | BUILT | Per-entry operations |
| `GET /api/tools/daily-insights` | BUILT | Cache-or-generate pattern |
| `POST /api/tools/synthesis` | BUILT | Multi-tool personality synthesis |
| `POST /api/tools/personality` | BUILT | Big Five analysis |
| `POST /api/tools/document` | BUILT | Document analyzer |
| `GET /api/cron/daily-insights` | MISSING | Directory exists, no file |
| `GET /api/cron/reset-usage` | MISSING | Directory exists, no file |
| `GET/POST /api/guest-profiles` | BUILT | Guest profile CRUD |
| `GET/POST /api/onboarding/complete` | BUILT | Onboarding completion |
| `POST /api/upload` | BUILT | File upload |
| `POST /api/upload/presign` | BUILT | Presigned URL |
| `GET /api/geocode` | BUILT | Location search |
| `GET /api/analysis` | BUILT | Analysis list |
| `GET/DELETE /api/analysis/[id]` | BUILT | Per-analysis |
| `POST /api/analysis/share` | BUILT | Share token |

### Services Layer

```
src/services/
├── analysis/
│   ├── llm.ts              — invokeLLM() — single OpenAI entry point (gpt-4o-mini/gpt-4o)
│   ├── personal-context.ts — getPersonalContext() — user zodiac/life path for prompts
│   └── response-schemas/   — Zod schemas for LLM output validation
├── coach/
│   ├── api.ts              — Client-side fetch wrappers (fetchConversations, sendMessage, etc.)
│   └── context-builder.ts  — buildCoachingContext() — aggregates analyses/goals/mood into prompt
├── astrology/              — Birth chart, VSOP87, aspects (GEMs 1, 14)
├── numerology/             — Gematria, life path, calculations (GEMs 2)
├── drawing/                — Vision AI analysis
├── personality/            — Big Five scoring
├── email/
│   ├── welcome.ts          — Resend welcome email
│   ├── payment-failed.ts   — Resend payment failed email
│   ├── referral-accepted.ts — Resend referral email
│   └── usage-limit.ts      — Resend usage limit warning
└── geocode.ts              — Location lookup
```

### DB Tables (20 total, all typed in database.ts)

```
Core data:
  profiles                  — User personal data, completion score
  subscriptions             — Plan, Stripe IDs, usage counters
  analyses                  — Tool analysis results (18 tool types)
  analysis_features         — Extracted features from analyses

Personal journey:
  goals                     — User goals with AI recommendations
  mood_entries              — Daily mood/energy/stress tracking
  journal_entries           — Personal reflective writing
  daily_insights            — AI-generated daily insights

AI Coach:
  conversations             — Chat conversation headers
  coaching_messages         — Individual messages (user + assistant)
  coaching_journeys         — Structured 7-12 step journeys

System:
  reminders                 — Notifications/reminders
  payment_history           — Stripe payment records
  processed_webhook_events  — Idempotency for Stripe webhooks
  analytics_events          — Usage tracking events
  referrals                 — Referral codes and status

Content:
  tarot_cards               — Static tarot card data (seeded)
  blog_posts                — Marketing/educational content
  rulebook                  — Rule engine for insight generation
  learning_progress         — User learning tracking
  guest_profiles            — Related persons for analysis
  dreams                    — Dream tracking and AI interpretation
```

---

## New Feature Integration Patterns

### Pattern 1: Stripe Webhooks (Public API Route)

**Location:** `src/app/api/webhooks/stripe/route.ts` — ALREADY BUILT

**Critical architectural constraint:** This route MUST remain outside the `(auth)` group and MUST NOT use the server client that validates user sessions. The Stripe webhook caller has no user session.

**Auth model:**
```
Stripe → POST /api/webhooks/stripe
         ↓
         stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
         ↓ (signature valid)
         createAdminClient()  ← service-role key, bypasses RLS
         ↓
         processed_webhook_events (idempotency check)
         ↓
         subscriptions table update
         ↓
         sendPaymentFailedEmail() (invoice.payment_failed)
```

**Integration with existing code:** The webhook handler imports `createAdminClient` from `@/lib/supabase/admin` and email services from `@/services/email/`. Both exist and work.

**What is missing:** `vercel.json` to configure the route as bypassing middleware size limits for raw body reading. Next.js App Router requires `export const runtime = 'nodejs'` on this route to ensure `request.text()` works (not Edge). This should be verified.

### Pattern 2: AI Coach — Synchronous (Current Implementation)

**Location:** `src/app/api/coach/messages/route.ts` — BUILT

The current coach uses **synchronous request/response** (not streaming SSE). The client POSTs a message, waits for the full LLM response, then receives it as JSON. This is simpler and already working.

**Data flow:**
```
Client POST /api/coach/messages
  { conversation_id, message }
  ↓
  createClient() ← user session validated
  ↓
  getPersonalContext() ← zodiac sign, life path
  ↓
  fetch conversation (ownership check)
  ↓
  fetch last 5 analyses (dynamic context injection)
  ↓
  INSERT coaching_messages (user message)
  ↓
  invokeLLM() → gpt-4o-mini
    systemPrompt = COACH_PERSONA + user identity + recent analyses + history
  ↓
  INSERT coaching_messages (assistant response)
  ↓
  UPDATE conversations (message_count, last_message_at)
  ↓
  Return { role: 'assistant', content: replyText }
```

**Streaming consideration:** The `services/coach/api.ts` client uses a plain `fetch` POST call — no EventSource, no ReadableStream handling. If streaming is added later, both the route handler AND the client-side service must change simultaneously. **Do not add streaming unless explicitly required** — the current synchronous pattern works and is simpler.

**FloatingCoachBubble integration:** `src/components/features/floating-coach/FloatingCoachBubble.tsx` and `FloatingCoachPanel.tsx` share the same `sendMessage()` from `services/coach/api.ts` and the `useFloatingCoachStore` (Zustand). This store holds `isOpen`, `activeConversationId`, `messages`, `isLoading`. Both the main coach page and the floating bubble must use the same store to avoid duplicate conversation creation.

### Pattern 3: Cron Jobs (Vercel Cron)

**What exists:** `src/app/api/cron/daily-insights/` and `src/app/api/cron/reset-usage/` directories exist but have **no route.ts files**. These are the two missing cron route handlers.

**Integration pattern for cron routes:**
```typescript
// src/app/api/cron/daily-insights/route.ts

export async function GET(request: NextRequest) {
  // 1. Verify caller is Vercel Cron (not public)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 2. Use createAdminClient() — no user session, runs for ALL users
  const supabase = createAdminClient()
  
  // 3. Fetch users who need insights (active subscriptions, onboarding complete)
  // 4. For each user: invoke daily-insights generation logic
  // 5. INSERT daily_insights rows
  // Return { processed: N }
}
```

**vercel.json** is entirely absent from the project. It must be created at the repo root. Structure:
```json
{
  "crons": [
    { "path": "/api/cron/daily-insights", "schedule": "0 6 * * *" },
    { "path": "/api/cron/reset-usage", "schedule": "0 0 1 * *" }
  ]
}
```

The daily-insights cron runs at 06:00 UTC daily (09:00 Israel time). The reset-usage cron runs at midnight on the 1st of each month. The `reset_monthly_usage` DB function is already defined in `database.ts` Functions section.

**Security:** Cron routes are publicly accessible URLs. Vercel injects `Authorization: Bearer $CRON_SECRET` on each invocation. The route must validate this header before doing any work. `CRON_SECRET` is a new env var to add.

### Pattern 4: Analytics (Existing DB + Aggregation)

**Location:** `src/app/api/analytics/route.ts` — BUILT

The analytics API already aggregates from existing tables (`analyses`, `mood_entries`, `goals`). It does NOT use the `analytics_events` table yet — that table is typed and created in the DB but not written to from anywhere.

**What is already working:** Tool distribution, activity by date, mood trend, stats (total analyses, avg mood, goal completion rate).

**What is missing:** Event tracking writes to `analytics_events`. The pattern when adding event tracking:
```
// In any client action (not in a React Query mutation — use a fire-and-forget)
// src/lib/utils/track-event.ts  (NEW utility)
export async function trackEvent(eventType: string, eventData: Record<string, unknown>) {
  fetch('/api/analytics/events', {  // NEW route needed
    method: 'POST',
    body: JSON.stringify({ event_type: eventType, event_data: eventData }),
  }).catch(() => {}) // fire and forget — never block UI
}
```

The dashboard components (`ToolUsageChart`, `ActivityHeatmap`, `UsageStats`) exist and consume the `GET /api/analytics` response format. They only need the page to pass them `period` state.

### Pattern 5: Email (Resend — Existing Service)

**Resend** is already installed (`resend: ^4.8.0`) and four email functions exist:
- `sendWelcomeEmail(email, name)` — called after registration
- `sendPaymentFailedEmail(email, name, amount)` — called from Stripe webhook
- `sendReferralAcceptedEmail(...)` — called from referral claim
- `sendUsageLimitEmail(...)` — called when analyses_used reaches limit

**Integration point:** All email functions are called server-side only (from API routes or webhooks). Never import them in client code. The `FROM_ADDRESS` is `noreply@masapnima.co.il` — the domain must be verified in Resend dashboard before any email sends.

**Where welcome email fires:** The `POST /api/onboarding/complete` route is the logical trigger — after the user completes onboarding, the welcome email should fire. Currently there is no such call in that route. This is a missing integration, not a missing service.

### Pattern 6: Data Migration from BASE44

**What exists:** `temp_source/` contains the original BASE44 source (293 files). The migration is a one-time data operation, not a new feature.

**Integration pattern:**
```
BASE44 export JSON
  ↓
  src/scripts/migrate-base44.ts  (NEW script)
  ↓
  Parse user records, analysis records, subscription records
  ↓
  createAdminClient()  ← bypasses RLS, bulk insert
  ↓
  Insert into: profiles, analyses, subscriptions
  ↓
  Log migration report (inserted N users, M analyses)
```

This script runs ONCE via `npx ts-node scripts/migrate-base44.ts` — it is NOT an API route. It uses the admin client directly. The existing DB types (`TablesInsert<'profiles'>`, `TablesInsert<'analyses'>`) are the target types.

**Key risk:** The BASE44 data format will not match the new schema column-for-column. A mapping layer is required. Inspect `temp_source/` data models before writing the migration script.

---

## Component Integration Points

### New Components Needed

The following components are imported by page files but do not exist in `src/components/features/`:

| Imported Component | Importing Page | Directory |
|---|---|---|
| `ReferralCard` or full referrals UI | `referrals/page.tsx` | Build inline in page (it's already self-contained) |
| Settings UI sections | `settings/page.tsx` | Build inline in page (already uses shadcn) |
| `DailyInsightsPage` body | `daily-insights/page.tsx` | Needs full page implementation |

The coach page, analytics page, goals page, journal page, mood page, and profile page are all **self-contained** — they build UI inline with shadcn/ui components without needing separate feature components (or they import from already-existing feature component directories).

### Floating Coach Integration

The floating coach (`FloatingCoachBubble` + `FloatingCoachPanel`) must be mounted in the `(auth)` layout, not in individual pages. This ensures it persists across navigation.

**Current state of layout:**
```
src/app/(auth)/layout-client.tsx  — Client layout with sidebar, header, providers
```

The `FloatingCoachBubble` should be rendered at the bottom of `layout-client.tsx` so it appears on all authenticated pages. The Zustand store (`useFloatingCoachStore`) handles open/close state without any prop drilling.

### Subscription Guard

`SubscriptionGuard` is already built and wraps premium features. It reads subscription state from `useSubscription` hook (React Query). Every new premium feature page should be wrapped:

```tsx
<SubscriptionGuard requiredPlan="basic">
  <PremiumFeatureContent />
</SubscriptionGuard>
```

The AI Coach page already uses this pattern correctly.

---

## Data Flow Changes for v1.3

### Stripe Payment Flow (complete picture)

```
User clicks "שדרג" on pricing page
  ↓
  POST /api/subscription/checkout { planId: 'basic' | 'premium' }
  ↓
  Stripe Checkout Session created (metadata: user_id, plan_id)
  ↓
  Redirect to Stripe hosted page
  ↓
  Payment completes
  ↓
  Stripe → POST /api/webhooks/stripe (checkout.session.completed)
    ↓ verify signature
    ↓ idempotency check (processed_webhook_events)
    ↓ UPDATE subscriptions SET plan_type, status='active', stripe_*
    ↓ INSERT payment_history
  ↓
  User redirected to /subscription/success?session_id=X
  ↓
  React Query invalidates subscription cache → UI updates
```

### Daily Insights Flow

```
Vercel Cron 06:00 UTC
  ↓
  GET /api/cron/daily-insights (Authorization: Bearer CRON_SECRET)
  ↓
  createAdminClient() — fetch all active users
  ↓
  For each user: check daily_insights for today (cache-check)
  ↓
  If not cached: build prompt from profile + recent analyses
  ↓
  invokeLLM() → gpt-4o-mini
  ↓
  INSERT daily_insights (insight_date = today)
  ↓
  Return { processed: N }

User visits /daily-insights
  ↓
  GET /api/tools/daily-insights (same cache-check pattern)
  ↓
  If already generated by cron → return cached
  ↓
  If not generated → generate on-demand (same LLM call)
```

The on-demand route at `/api/tools/daily-insights` already implements the cache-or-generate pattern. The cron job is purely a pre-generation optimization — it prevents the first user load from being slow.

### Monthly Usage Reset Flow

```
Vercel Cron 00:00 UTC 1st of month
  ↓
  GET /api/cron/reset-usage (Authorization: Bearer CRON_SECRET)
  ↓
  createAdminClient()
  ↓
  Call DB function: reset_monthly_usage()  ← already defined
  ↓
  Return { reset: true }
```

This is the simplest cron — it calls a single PostgreSQL function that already exists.

---

## Build Order (Dependencies First)

The following ordering respects what each feature depends on:

**Tier 1 — Infrastructure (no feature dependencies)**
1. `vercel.json` — cron schedules (blocks cron routes being useful)
2. `src/app/api/cron/reset-usage/route.ts` — calls existing DB function
3. `src/app/api/subscription/cancel/route.ts` — missing route in existing directory

**Tier 2 — Foundational features (depend on Tier 1 or only on existing services)**
4. Welcome email trigger in `POST /api/onboarding/complete` — add one `sendWelcomeEmail()` call
5. `src/app/api/cron/daily-insights/route.ts` — depends on `invokeLLM` and admin client (both exist)
6. Usage limit email trigger in analysis routes — add `sendUsageLimitEmail()` when `analyses_used >= analyses_limit`

**Tier 3 — Features that depend on working data (depend on Tier 1+2)**
7. Daily insights page full implementation — needs cron to generate data, but can fall back to on-demand
8. Analytics event tracking — `trackEvent()` utility + `POST /api/analytics/events` route
9. Data migration script — `scripts/migrate-base44.ts` — needs all DB tables stable

**Tier 4 — Performance and quality (depend on features being complete)**
10. Performance optimization (Lighthouse, lazy loading heavy tool pages)
11. Test suite (vitest already configured — `vitest.config.ts` exists)
12. Accessibility audit

---

## Architectural Constraints to Preserve

### Do Not Change

1. **`invokeLLM()` signature** — every tool route uses it. Changing the interface breaks 20+ routes.
2. **Supabase client selection rules:**
   - `createClient()` from `@/lib/supabase/server` — authenticated routes (reads `user` from session)
   - `createAdminClient()` from `@/lib/supabase/admin` — webhooks and crons only (no user session)
   - `createClient()` from `@/lib/supabase/client` — React components that need direct DB access
3. **`database.ts` type file** — All DB operations use `TablesInsert<'table_name'>`, `Tables<'table_name'>`. Do not bypass by using raw objects.
4. **`zodValidationError()` from `@/lib/utils/api-error`** — all Zod failures in API routes use this helper. It hides schema details in production.
5. **Rate limiting via `checkRateLimit(llmRateLimit, user.id)`** — All LLM-calling routes must run this check. It degrades gracefully (returns true) if Upstash env vars are absent.

### Patterns That Must Continue

Every new API route must follow:
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

    const body: unknown = await request.json()
    const parsed = MySchema.safeParse(body)
    if (!parsed.success) return zodValidationError('קלט לא תקין', parsed.error.flatten())

    // business logic
    // ...

    return NextResponse.json({ data: result }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}
```

Every new client data fetch must use React Query:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.someEntity(userId),
  queryFn: () => fetch('/api/...').then(r => r.json()),
})
```

---

## Missing Files Summary

Files that need to be created (not modified) to complete v1.3:

| File | Priority | Why Missing |
|------|----------|-------------|
| `vercel.json` | Critical | Cron jobs will not run without it |
| `src/app/api/cron/daily-insights/route.ts` | High | Directory created, file absent |
| `src/app/api/cron/reset-usage/route.ts` | High | Directory created, file absent |
| `src/app/api/subscription/cancel/route.ts` | High | Directory created, file absent |
| `src/app/api/analytics/events/route.ts` | Medium | Event tracking not implemented |
| `src/lib/utils/track-event.ts` | Medium | Client-side event tracking helper |
| `scripts/migrate-base44.ts` | Medium | One-time data migration script |

Files that need completion (have stub or partial content):

| File | What is Incomplete |
|------|-------------------|
| `src/app/(auth)/daily-insights/page.tsx` | Page exists as thin stub, needs full UI with daily_insights display |
| `src/app/api/onboarding/complete/route.ts` | Does not call `sendWelcomeEmail()` after completion |
| Analysis routes (tools/* POST handlers) | Do not call `sendUsageLimitEmail()` when limit reached |

---

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| Route inventory | HIGH | Direct file inspection of all 60+ routes |
| DB schema | HIGH | Direct read of database.ts (1103 lines, fully typed) |
| Service layer | HIGH | Direct read of service files |
| Missing files | HIGH | find + ls confirmed directory exists, file absent |
| Cron architecture | HIGH | Vercel docs pattern, confirmed by absence of vercel.json |
| Stripe webhook pattern | HIGH | Route fully built, logic readable |
| LLM streaming (not used) | HIGH | coach API uses synchronous JSON, no SSE code anywhere |
| Email trigger gaps | MEDIUM | Code inspection shows no call to sendWelcomeEmail in onboarding/complete |
| BASE44 migration complexity | LOW | temp_source structure not deeply inspected |

---

## Sources

- Direct codebase inspection: `src/app/api/`, `src/services/`, `src/types/database.ts`, `src/stores/`
- Vercel cron architecture: standard `vercel.json` crons pattern (HIGH confidence from known docs)
- Resend integration: `src/services/email/` — all four email functions fully implemented
- Stripe: `src/app/api/webhooks/stripe/route.ts` — full implementation readable
