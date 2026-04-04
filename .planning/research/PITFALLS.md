# Domain Pitfalls — MystiQor v1.3 Full Platform

**Domain:** Adding Stripe, AI chat, cron, analytics, and data migration to an existing Next.js 16 + Supabase platform
**Researched:** 2026-04-03
**Context:** Codebase has working auth, tools, and a typed services layer. v1.3 adds payments, AI Coach chat, cron-driven daily insights, personal analytics, and BASE44 data migration.

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or production outages.

---

### Pitfall 1: Stripe Webhook — Body Already Parsed Before Signature Check

**What goes wrong:** Stripe computes its HMAC signature over the **raw byte string** of the request body. If anything consumes or transforms the body before `stripe.webhooks.constructEvent()` — including `await request.json()`, a middleware body parser, or any logging middleware — the bytes change and the signature check throws `No signatures found matching the expected signature`. Every webhook call is then rejected with 400.

**Why it happens:** Next.js App Router's `Request` object uses the Web Fetch API. Calling `.json()` consumes the body stream. A second call (even `.text()`) returns an empty string. Old Pages Router patterns used `bodyParser: false` in config; App Router does not need this, but many copy-paste examples use `.json()` first.

**Consequences:** Payment events (subscription created, payment failed) never reach the DB. Users pay but stay on the free plan. No automated error — the 400 looks like a transient Stripe retry, and after 3 days Stripe stops retrying.

**Prevention:** Always use `await request.text()` (not `.json()`) as the **very first** read in the webhook route handler. The existing stub at `src/app/api/webhooks/stripe/route.ts` already does this correctly — do not refactor it.

**Detection:** Stripe Dashboard > Developers > Webhooks > Event log shows 400 responses with message "No signatures found". Also: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` locally will surface this immediately.

**Phase:** Stripe integration phase. Already correctly handled in stub — flag as "do not touch".

---

### Pitfall 2: Stripe Webhook — Idempotency Check After Processing (Race Condition)

**What goes wrong:** Checking for duplicate events *after* executing the business logic (i.e., "process first, then record") causes the same event to be processed twice if two simultaneous webhook deliveries arrive (Stripe retries within seconds on network errors). The result: a user gets two subscriptions inserted, or `analyses_used` is reset twice.

**Why it happens:** Developers place the idempotency INSERT after the business logic because it feels more natural ("record what happened"). Stripe retries on 5xx and also occasionally sends duplicates from its own infrastructure.

**Consequences:** Double-billing effects (credits applied twice), duplicate email sends, data corruption in subscription table.

**Prevention:** Insert the event ID into `processed_webhook_events` table **before** any business logic. Use a `UNIQUE` constraint on `stripe_event_id`. If the INSERT fails with a unique violation — the event was already processed — return `200` immediately. The existing stub does this correctly (lines 59–70). Preserve this ordering in all future modifications.

**Detection:** Verify with `EXPLAIN` that `processed_webhook_events.stripe_event_id` has a UNIQUE index. Check that the idempotency INSERT precedes any `supabase.from('subscriptions').upsert(...)` call.

**Phase:** Stripe integration phase. Already implemented — verify index exists in Supabase.

---

### Pitfall 3: Stripe Checkout — Missing or Mismatched `metadata.user_id`

**What goes wrong:** The checkout session is created without attaching `metadata: { user_id, plan_id }`. When `checkout.session.completed` fires, the webhook handler cannot determine which user paid and silently skips the subscription upsert (logged, not thrown).

**Why it happens:** The checkout creation API call is built in a hurry; metadata is treated as optional and forgotten. Stripe does not validate custom metadata.

**Consequences:** Payment goes through, user sees a success page, but their plan stays "free" in the DB. Support ticket storm after launch.

**Prevention:** In the checkout session creation endpoint, always include:
```typescript
metadata: {
  user_id: user.id,     // UUID from Supabase auth
  plan_id: selectedPlan // 'basic' | 'premium' | 'enterprise'
}
```
Add a Zod schema server-side validation that rejects the checkout request if `user_id` is not a valid UUID. Write a local test that creates a mock session and verifies metadata is present.

**Detection:** In `handleCheckoutSessionCompleted`, the guard already logs `console.error` when metadata is missing (line 149). Add a Sentry/Datadog alert on that log pattern in production.

**Phase:** Stripe checkout creation phase.

---

### Pitfall 4: Vercel Cron — No Authorization Check (Open Endpoint)

**What goes wrong:** The cron endpoint `GET /api/cron/daily-insights` has no auth check. Anyone who discovers the URL can invoke it repeatedly — draining OpenAI token budget and spamming the DB with duplicate insights.

**Why it happens:** Cron routes feel "internal" and don't get the same auth treatment as user-facing routes. The Next.js middleware skips them because they're under `/api/` without session cookies.

**Consequences:** Malicious or accidental repeated invocations exhaust the OpenAI budget. On Hobby plan, the cron fires at most once per day, but on Pro it could fire every minute if misconfigured.

**Prevention:** Add `CRON_SECRET` environment variable to Vercel. Check the `Authorization: Bearer <CRON_SECRET>` header at the top of every cron handler — Vercel injects this header automatically when it fires the cron. Return `401` if missing or wrong. Template (confirmed from Vercel official docs):
```typescript
export const GET = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... cron logic
};
```

**Detection:** Try `curl https://your-app.vercel.app/api/cron/daily-insights` without any auth header. If it runs — it is unprotected.

**Phase:** Cron/daily-insights phase.

---

### Pitfall 5: Vercel Cron — No Idempotency on Daily Insights Generation

**What goes wrong:** Vercel's event-driven scheduler occasionally delivers the same cron invocation more than once (documented in official Vercel cron docs). If `daily-insights` cron has no guard, the same user receives two insight records for the same day, and the notification fires twice.

**Why it happens:** Developers assume cron fires exactly once. Vercel explicitly warns this is not guaranteed.

**Consequences:** Duplicate daily insights in the DB. Duplicate push/email notifications. User confusion ("why did I get two insights?"). Also wastes OpenAI tokens.

**Prevention:** Before generating insights, check if a record already exists for `(user_id, DATE(created_at) = TODAY)`. If yes — skip. Use `ON CONFLICT DO NOTHING` or a `UNIQUE` constraint on `(user_id, insight_date)` in the `daily_insights` table. Process users in batches and log which batch ran per day.

**Detection:** Run the cron twice in quick succession in staging. Verify only one insight record exists per user per day.

**Phase:** Cron/daily-insights phase.

---

### Pitfall 6: AI Coach — Missing `maxDuration` for LLM Route

**What goes wrong:** `POST /api/coach/messages` calls `invokeLLM()` which makes a synchronous OpenAI API call with `maxTokens: 2048`. On the default Vercel Function duration (300s on all plans), this is technically within limits — but the default is 300s and OpenAI gpt-4o-mini typically responds in 5–15s. The real danger: if the user has a large conversation history (20 messages x 500 tokens each = 10,000 tokens of history) plus a long system prompt, the total context can exceed `gpt-4o-mini`'s 128K context limit silently, causing a 400 from OpenAI that surfaces as a generic 500 to the user.

**Why it happens:** The existing `invokeLLM` wrapper does not cap system prompt length. The coach message route builds `fullSystemPrompt` by concatenating persona + user context + analysis summaries + conversation history without any total-length guard.

**Consequences:** For power users with many analyses and long conversations, the LLM call silently fails. The assistant message is never saved. The user sees "שגיאה בשליחת ההודעה" with no diagnostic information.

**Prevention:**
1. Measure total prompt token count before calling OpenAI. Use `tiktoken` or approximate (1 token ≈ 4 chars) and cap the system prompt at ~6,000 chars before adding conversation history.
2. Limit conversation history to the last 10 messages (not 20) in the coach route.
3. Export `maxDuration = 60` in the route file to avoid any edge-case timeouts.
4. Handle OpenAI error code `context_length_exceeded` explicitly and return a user-friendly Hebrew message.

**Detection:** Log `fullSystemPrompt.length` in the coach messages route. Watch for values exceeding 20,000 characters.

**Phase:** AI Coach phase.

---

### Pitfall 7: Analytics — Full Table Scan on Every Dashboard Load

**What goes wrong:** The analytics route (`GET /api/analytics`) issues three parallel Supabase queries without column-level indexes on `(user_id, created_at)`. On the `analyses` table, which will grow to thousands of rows per active user, a sequential scan is run every time the analytics dashboard loads.

**Why it happens:** The queries work fine in development (10–50 rows). In production with real data, Postgres falls back to a sequential scan unless indexes exist for `WHERE user_id = $1 AND created_at >= $2`.

**Consequences:** Analytics page load times of 3–8 seconds for active users. Supabase database CPU spikes. On Supabase free tier, this can cause query timeouts.

**Prevention:** Add composite indexes in the migration:
```sql
CREATE INDEX idx_analyses_user_created ON analyses (user_id, created_at DESC);
CREATE INDEX idx_mood_entries_user_created ON mood_entries (user_id, created_at DESC);
CREATE INDEX idx_goals_user ON goals (user_id);
```
Also: the aggregation (summing mood scores, grouping by date) is done in JavaScript on the full dataset. For large datasets (90d period = potentially 3,000+ mood entries), this should move to a Postgres aggregate query with `GROUP BY DATE(created_at)`.

**Detection:** Run `EXPLAIN ANALYZE` in Supabase SQL editor on the analytics queries after adding test data. Look for "Seq Scan" on large tables.

**Phase:** Analytics dashboard phase.

---

### Pitfall 8: Data Migration — No Dry-Run / Rollback Strategy

**What goes wrong:** The BASE44 export is imported directly into production tables without a staging pass. If the export has format quirks (Hebrew date strings as `DD/MM/YYYY` instead of ISO, null fields where the app expects strings, duplicate UUIDs), the migration fails mid-run, leaving the DB in a partial state.

**Why it happens:** Migration scripts are written once and run once. No rollback logic is included because "it should work."

**Consequences:** Production DB has partial data. Rolling back requires restoring from a Supabase backup (which may have diverged by hours). Users who registered after migration started are caught in a mixed state.

**Prevention:**
1. Always run migration in a Supabase **branch** or staging environment first.
2. Wrap the migration in a transaction: all inserts succeed or none do.
3. Validate every row against the Zod schemas before inserting (`UserMigrationSchema.safeParse(row)`).
4. Add a `--dry-run` flag that validates without writing.
5. Log every skipped/failed row to a separate `migration_errors` table for manual review.
6. After migration, run a reconciliation check: count rows in source vs. target.

**Detection:** Run `SELECT COUNT(*) FROM <target_table>` before and after. Diff against BASE44 export row count.

**Phase:** Data migration phase (last, after all features are verified).

---

## Moderate Pitfalls

### Pitfall 9: Email — Resend Domain Not Verified, Emails Land in Spam

**What goes wrong:** `FROM_ADDRESS` is set to `noreply@masapnima.co.il` in the existing email services. If the DNS records for `masapnima.co.il` (SPF, DKIM, DMARC) are not configured with Resend, all emails go to spam or are rejected by major providers (Gmail, Yahoo).

**Prevention:** In Resend dashboard: add domain, copy TXT/CNAME DNS records, verify. Do this **before** testing any email flow. Allow 24–48 hours for DNS propagation. Hebrew content in email body does not itself cause spam triggers as long as the `Content-Type: text/html; charset=UTF-8` header is set (Resend handles this automatically).

**Phase:** Email notifications phase. Prerequisite: DNS configuration before first email test.

---

### Pitfall 10: Resend — Rate Limit on Free Tier Causes Silent Drops

**What goes wrong:** Resend free tier allows 100 emails/day and 3,000/month. The `invoice.payment_failed` webhook could fire for many users simultaneously after a billing cycle, exceeding the daily limit. Emails after the limit are silently dropped (Resend returns `429`).

**Prevention:** Handle the `429` status from Resend explicitly. Log it as a warning (not a fatal error). Consider adding the email to a retry queue (use a Supabase table `email_queue` with a cron to drain it). Upgrade to Resend paid plan before launch.

**Phase:** Email notifications phase.

---

### Pitfall 11: Stripe — Test vs. Live Key Confusion in Vercel Env Vars

**What goes wrong:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` exist in two variants (test and live). Setting test keys in the Vercel Production environment (instead of Preview/Development) means real payments are charged against test mode — or vice versa, test webhook events trigger subscription downgrades in the live DB.

**Prevention:** In Vercel, set environment variable scope carefully:
- **Development**: test keys only
- **Preview**: test keys only
- **Production**: live keys only

Add a boot-time check in the webhook handler: if `STRIPE_SECRET_KEY` starts with `sk_test_` and `NODE_ENV === 'production'`, log a critical warning.

**Phase:** Stripe integration phase. Must verify before going live.

---

### Pitfall 12: AI Coach — Context Built on Every Message (N+1 Queries)

**What goes wrong:** `POST /api/coach/messages` fetches recent analyses (`limit(5)`) and conversation history (`limit(20)`) **on every single message send**. If the user sends 10 messages in quick succession, this fires 20+ queries against the same tables.

**Prevention:** Cache the coaching context in the `conversations.context` JSONB column at conversation creation time (this is already done via `buildCoachingContext`). For per-message analysis injection (the 5 recent analyses), use React Query on the client with a 5-minute stale time to avoid re-fetching the same data per keystroke. On the server, the query is a `limit(5)` with an index on `(user_id, created_at DESC)` — acceptable, but add the index.

**Phase:** AI Coach phase / analytics phase.

---

### Pitfall 13: Cron — Hobby Plan Scheduling Precision Is ±59 Minutes

**What goes wrong:** On a Vercel Hobby plan, a cron set for `0 6 * * *` (6:00 AM UTC daily) can fire anywhere from 6:00 to 6:59 AM. For "daily insights", this is fine. But if the product ever adds time-sensitive crons (e.g., "send reminder at 8:00 AM local time"), the Hobby plan's ±59-minute window breaks the UX promise.

**Prevention:** Accept the imprecision for daily insights. Document the constraint clearly. If Israeli time matters (UTC+2/UTC+3), remember Vercel cron timezone is **always UTC** — there is no way to set a local timezone in `vercel.json`.

**Phase:** Cron/daily-insights phase.

---

### Pitfall 14: Bundle Size Regression from New Dependencies

**What goes wrong:** Adding `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`, and `openai` to the client bundle (by accidentally importing them in a client component or page) blows past the 200KB initial JS budget.

**Why it happens:** Forgetting to mark files as server-only. `stripe` and `openai` are large Node.js SDKs not suitable for the browser. If imported in a file that lacks `'use server'` or `import 'server-only'`, Next.js bundles them client-side.

**Prevention:**
- Add `import 'server-only'` at the top of `src/services/analysis/llm.ts` and any file that imports `stripe` or `openai`.
- Run `next build` and check the bundle analyzer output (`ANALYZE=true next build`) after adding each new dependency.
- The existing `package.json` shows `stripe@^20.4.1` and `openai@^4.104.0` — these are already present. The risk is in future refactors that accidentally import them client-side.

**Detection:** `next build` output shows chunk sizes. Watch for any client chunk exceeding 100KB that wasn't there before.

**Phase:** All phases. Ongoing concern.

---

### Pitfall 15: Supabase RLS — New Tables Ship Without Policies

**What goes wrong:** New tables for v1.3 (`daily_insights`, `coaching_messages`, `conversations`, `goals`, `mood_entries`, `journal_entries`, `processed_webhook_events`) are created with migrations but without RLS policies. By default, Supabase tables with RLS enabled block all access; tables with RLS disabled allow anyone with the `anon` key to read/write all rows.

**Why it happens:** Developers write the migration for the table structure and forget the matching policy migration. Or they test with `service_role` (which bypasses RLS) and never notice the gap.

**Consequences:** Either users can read each other's coaching messages and journal entries, or the app silently fails for all authenticated users because RLS blocks their legitimate queries.

**Prevention:** Every `CREATE TABLE` migration must be followed immediately by:
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own data" ON <table>
  FOR ALL USING (auth.uid() = user_id);
```
The `processed_webhook_events` table only needs service-role access — never expose it to the `anon` or `authenticated` role.

**Detection:** In Supabase Studio, open Authentication > Policies. Any table with 0 policies and RLS enabled = all access blocked. Any table with RLS disabled = publicly accessible.

**Phase:** Every DB migration phase.

---

### Pitfall 16: BASE44 Migration — User IDs Do Not Match Supabase Auth UUIDs

**What goes wrong:** BASE44 uses its own internal user IDs (likely incrementing integers or BASE44-specific UUIDs). When migrating analyses, goals, and mood entries, the `user_id` field in each row references the BASE44 ID, not the Supabase `auth.uid()`. The migrated rows are orphaned — no user can see their own data.

**Prevention:**
1. Before migration, create a mapping table: `{ base44_user_id: string, supabase_user_id: uuid }`.
2. Users must log in to MystiQor and "claim" their BASE44 data via email verification (or admin manually maps them).
3. The migration script replaces every `base44_user_id` with the Supabase UUID from the mapping table before inserting.
4. Rows with no mapping → `migration_errors` table, not silently dropped.

**Phase:** Data migration phase.

---

### Pitfall 17: Hebrew RTL in Chat — Text Alignment Breaks on Mixed Content

**What goes wrong:** AI coach responses mix Hebrew text with English words (tool names, plan names, numbers). CSS `direction: rtl` causes English words to visually flip position within a sentence. In a chat bubble rendered as raw `innerHTML`, markdown-formatted responses (with `**bold**`, bullet lists) lose their RTL directionality.

**Prevention:**
- Use `dir="auto"` on individual chat message elements (not `dir="rtl"`) — this lets the browser detect per-paragraph direction based on the first strong-directional character.
- Render markdown with `react-markdown` (or a lightweight parser) rather than `dangerouslySetInnerHTML` — it creates proper DOM elements that inherit RTL styling.
- Test chat UI with responses containing mixed Hebrew/English content before shipping.

**Phase:** AI Coach UI phase.

---

### Pitfall 18: Accessibility — WCAG 2.1 AA Failures in New Features

**What goes wrong:** The mystical dark theme has low contrast by design. Purple-on-near-black text (`#8b5cf6` on `#0f0a1e`) has a contrast ratio of approximately 3.5:1 — below the WCAG AA minimum of 4.5:1 for normal text. This affects the analytics dashboard labels, chat message text, and form inputs added in v1.3.

**Prevention:**
- Use a contrast checker (WebAIM) on every new color combination before shipping.
- Chat messages must use at least `text-slate-100` on dark backgrounds.
- Stripe payment form elements use Stripe's hosted `<CardElement>` — style it with `iconColor: '#8b5cf6'` and `color: '#e2e8f0'` to maintain readability.
- All new interactive elements (buttons, inputs) must have visible focus rings. Do not use `outline: none` without a replacement.

**Phase:** Accessibility audit phase.

---

## Minor Pitfalls

### Pitfall 19: `window is not defined` in Analytics Charts

**What goes wrong:** Recharts (used in the existing dashboard) relies on `window` for responsive container sizing. If the analytics chart component is server-rendered without `'use client'`, it crashes with `ReferenceError: window is not defined` during Next.js build.

**Prevention:** Wrap all Recharts components in `dynamic(() => import(...), { ssr: false })` or ensure the containing file has `'use client'`. The existing dashboard components likely already do this — verify before adding new chart components.

**Phase:** Analytics dashboard phase.

---

### Pitfall 20: Vercel Cron — No Retry on Failure

**What goes wrong:** Vercel does NOT retry a failed cron invocation (documented in official Vercel cron docs: "Vercel will not retry an invocation if a cron job fails"). If the daily insights cron crashes for any reason (OpenAI timeout, DB error), that day's insights are never generated and there is no automatic recovery.

**Prevention:**
- Implement internal retry logic within the cron handler itself (process each user independently, catch per-user errors, continue to the next user).
- Write a `last_run_at` and `success` status to a `cron_runs` table so you can detect missed days.
- Do not rely on "it will run again tomorrow" — for daily insights, a missed day is a UX regression.

**Phase:** Cron/daily-insights phase.

---

### Pitfall 21: Stripe Checkout — Price ID Hardcoded Instead of Using Env Vars

**What goes wrong:** Stripe Price IDs (`price_xxxxxx`) differ between test mode and live mode. Hardcoding the test Price ID in the checkout session creation code means live checkouts fail with "No such price" 400 errors.

**Prevention:** Store Price IDs as environment variables:
```
STRIPE_PRICE_BASIC=price_xxx
STRIPE_PRICE_PREMIUM=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
```
Map from plan name to env var in a constants file. Never hardcode `price_` strings.

**Phase:** Stripe integration phase.

---

### Pitfall 22: Date Handling — UTC vs Israel Time in Analytics and Cron

**What goes wrong:** Supabase stores all timestamps as UTC. The analytics route groups by `DATE(created_at)`, which is correct in UTC but incorrect from the Israeli user's perspective. A midnight event in Israel (UTC+2/UTC+3 summer) shows up on the wrong day in the analytics chart.

**Prevention:**
- For display purposes, convert dates client-side using `Intl.DateTimeFormat` with `timeZone: 'Asia/Jerusalem'` before rendering.
- The cron timezone is always UTC (confirmed from official Vercel docs). Document this. If "send insights at 7 AM Israel time" is required, set the cron to `0 5 * * *` (5 AM UTC = 7 AM IDT in summer, 7 AM IST in winter — UTC+2).
- Note: Israel switches between UTC+2 (winter) and UTC+3 (summer DST). A fixed UTC offset won't be correct year-round. For precision, use a `tzinfo` lookup or accept a 1-hour seasonal offset.

**Phase:** Analytics phase, cron phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Stripe checkout creation | Missing `metadata.user_id` causes silent subscription failure | Validate metadata presence before creating session |
| Stripe webhook handler | Body read via `.json()` breaks signature verification | Use `.text()` only — existing stub is correct |
| Stripe webhook handler | Race condition: event processed before idempotency check | Insert to `processed_webhook_events` FIRST — existing stub is correct |
| Stripe webhook handler | Test vs. live key confusion | Separate Vercel env var scopes per environment |
| Stripe Price IDs | Hardcoded test Price IDs used in live mode | Env vars for all Price IDs |
| AI Coach messages route | System prompt too long for gpt-4o-mini context | Cap `fullSystemPrompt` at ~6,000 chars |
| AI Coach messages route | No `maxDuration` export — edge case timeouts | Add `export const maxDuration = 60` |
| AI Coach UI | Mixed Hebrew/English breaks RTL alignment | Use `dir="auto"` on message elements |
| Cron: daily-insights | No auth on endpoint | Add `CRON_SECRET` Bearer check |
| Cron: daily-insights | Duplicate invocations create duplicate insights | Idempotency check: `(user_id, insight_date)` unique |
| Cron: daily-insights | No retry on failure | Per-user error isolation + `cron_runs` log table |
| Cron: all | Hobby plan ±59-min precision | Accept for daily jobs; document UTC offset for Israeli time |
| Analytics dashboard | Sequential table scans at scale | Add composite indexes `(user_id, created_at DESC)` |
| Analytics dashboard | `window` not defined in SSR | `dynamic()` with `ssr: false` for Recharts |
| Analytics dashboard | Date grouping in UTC misaligns with Israeli time | Client-side timezone conversion for display |
| Email: all | Domain DNS not verified → spam | Verify SPF/DKIM/DMARC in Resend before first email |
| Email: all | Resend free tier rate limit | Handle 429, add retry queue for high-volume events |
| Data migration | BASE44 user IDs ≠ Supabase UUIDs | Build user ID mapping table before migration |
| Data migration | No rollback on partial failure | Transaction wrapping + dry-run mode |
| All DB migrations | New tables shipped without RLS policies | Template: `ENABLE RLS` + user_id policy in every migration |
| All phases | Node.js server-only SDKs accidentally bundled client-side | `import 'server-only'` in llm.ts, stripe service files |
| Accessibility | Mystical dark theme fails WCAG contrast | Minimum `text-slate-100` on dark backgrounds, check contrast ratios |

---

## Existing Code — Do Not Break

The following items in the existing codebase already correctly handle known pitfalls. Do not refactor them:

| File | What it handles correctly | Risk if changed |
|---|---|---|
| `src/app/api/webhooks/stripe/route.ts` | `request.text()` for raw body (Pitfall 1) | Refactoring to `.json()` = all webhooks fail |
| `src/app/api/webhooks/stripe/route.ts` | Idempotency INSERT before business logic (Pitfall 2) | Moving insert after logic = race condition on retries |
| `src/services/analysis/llm.ts` | Server-side only, no `window` references | Importing in client component = Node.js SDK crash |
| `src/services/email/payment-failed.ts` | `dir="rtl" lang="he"` on email HTML root | Removing = email RTL breaks in Outlook |

---

## Sources

| Source | Confidence | Notes |
|---|---|---|
| Vercel Cron Jobs official docs (vercel.com/docs/cron-jobs) | HIGH | Directly fetched — idempotency warning, no-retry behavior, CRON_SECRET pattern, timezone = UTC only |
| Vercel Function Duration docs (vercel.com/docs/functions/configuring-functions/duration) | HIGH | Directly fetched — Hobby max 300s, Pro max 800s |
| Vercel Cron Usage & Pricing docs | HIGH | Directly fetched — Hobby: once/day max, ±59 min precision |
| Existing codebase inspection | HIGH | Reviewed actual route handlers and service files |
| OpenAI API knowledge (training data, Aug 2025 cutoff) | MEDIUM | gpt-4o-mini context window 128K tokens, typical latency 5–15s |
| Stripe webhook behavior (training data) | MEDIUM | Raw body requirement is well-established; verify against Stripe docs when implementing |
| Resend rate limits (training data) | LOW | Free tier limits may have changed — verify in Resend dashboard before launch |
| WCAG 2.1 AA contrast ratios (standard) | HIGH | 4.5:1 normal text, 3:1 large text — stable specification |
