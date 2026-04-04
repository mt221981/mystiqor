# Technology Stack: v1.3 New Feature Additions

**Project:** MystiQor
**Researched:** 2026-04-03
**Mode:** Subsequent milestone — additions only. Existing stack is locked and working.

---

## Critical Finding: Most Libraries Are Already Installed

Examining `package.json` directly (no assumptions) reveals that the vast majority of
v1.3 needs are **already present**:

| Feature Area | Needed | Already Installed | Version |
|---|---|---|---|
| Stripe payments | `stripe` + `@stripe/react-stripe-js` + `@stripe/stripe-js` | YES | `^20.4.1` / `^5.6.1` / `^8.11.0` |
| OpenAI / LLM | `openai` | YES | `^4.104.0` |
| Email (transactional) | `resend` | YES | `^4.8.0` |
| Charts / analytics | `recharts` | YES | `^3.8.0` |
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` | YES | `^2.0.8` / `^1.37.0` |
| PDF export | `@react-pdf/renderer` | YES | `^4.3.2` |
| Markdown rendering | `react-markdown` + `remark-gfm` | YES | `^10.1.0` / `^4.0.1` |
| Animations | `framer-motion` | YES | `^12.38.0` |
| Testing | `vitest` + `@testing-library/*` | YES | `^4.1.0` |
| Date handling | `date-fns` | YES | `^4.1.0` |
| Sharing | `react-share` | YES | `^5.3.0` |

**Conclusion: Zero new npm packages are required for v1.3.** The question shifts from
"what to install" to "what integration patterns and configuration are missing."

---

## What IS Missing (Not Packages — Patterns and Config)

### 1. AI Streaming for Coach Chat

**Current state:** `src/app/api/coach/messages/route.ts` uses `invokeLLM()` which calls
`openai.chat.completions.create()` — a blocking, non-streaming call. The response is
returned as a single JSON object.

**What's needed:** Server-Sent Events (SSE) streaming so the coach response appears
word-by-word in the UI — dramatically better UX for chat.

**How to implement with existing `openai ^4.104.0`:**

```typescript
// In the API route — use stream: true
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  stream: true,
});

// Return a ReadableStream via Next.js Response
return new Response(
  new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) controller.enqueue(new TextEncoder().encode(delta));
      }
      controller.close();
    },
  }),
  { headers: { 'Content-Type': 'text/event-stream' } }
);
```

**Client consumption:** Native `fetch` with `ReadableStream` reader — no additional
package needed. The existing `react-markdown` handles progressive rendering.

**Confidence:** HIGH — openai SDK v4 has native async iterator streaming, this is the
documented approach.

**Note:** The coach `api.ts` service (`sendMessage()`) needs a separate streaming
variant. The existing non-streaming path should be preserved for non-chat uses.

---

### 2. Cron Jobs for Daily Insights

**Current state:** `/api/cron/daily-insights/` directory exists but the route file
does not exist (confirmed by directory listing returning empty). `/api/cron/reset-usage/`
also exists as a directory only.

**What's needed:** Vercel Cron configuration via `vercel.json` and the route implementations.

**How to configure:**

```json
// vercel.json — at project root
{
  "crons": [
    {
      "path": "/api/cron/daily-insights",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

**Route protection pattern (already used in project):**

```typescript
// Verify Vercel cron secret — same pattern as webhook signature
const cronSecret = request.headers.get('authorization');
if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Confidence:** HIGH — Vercel Cron is the documented approach for Next.js on Vercel.
No extra packages. The `CRON_SECRET` env var needs adding to `.env.local`.

---

### 3. Data Migration from BASE44

**Current state:** `temp_source/` contains the full BASE44 source. `scripts/` directory
exists with `seed-blog-posts.ts` and `sync-tarot-meta.ts`. No migration script exists yet.

**What's needed:** A Node.js migration script that reads BASE44's data format and
writes to Supabase. BASE44 uses their own `@base44/sdk` — the data is in their cloud,
not local files.

**Migration approach:**

The BASE44 source uses `@base44/sdk ^0.8.0` with entity calls like
`User.list()`, `Analysis.list()`. Migration must:
1. Export data via BASE44 API (requires BASE44 API key from original project)
2. Transform to new Supabase schema
3. Upsert via Supabase admin client (already set up in `src/lib/supabase/admin.ts`)

**Recommended pattern:** A standalone `scripts/migrate-from-base44.ts` using `tsx`
for TypeScript execution without compilation.

**Install needed (dev only):**
```bash
npm install -D tsx
```

`tsx` is not in current `devDependencies`. It's needed to run migration scripts
directly without `ts-node` or compilation steps. Alternatively, `ts-node` works but
`tsx` is faster and ESM-native.

**Confidence:** MEDIUM — Migration approach depends on BASE44 API availability and data
export format. Requires manual validation of BASE44 data structure against new schema.

---

### 4. Performance Optimization (Lighthouse > 90)

**Current state:** `next.config.ts` has security headers but no bundle analysis config.
No `@next/bundle-analyzer` is installed.

**What's needed:**

**Bundle analysis (dev only):**
```bash
npm install -D @next/bundle-analyzer
```

This is the only missing dev dependency for performance work. It wraps `next build`
to visualize what's in each bundle.

**next.config.ts addition:**
```typescript
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(nextConfig);
```

**Existing packages that cover performance needs:**
- `sharp ^0.34.5` — already installed, handles `next/image` optimization
- `next/dynamic` — built into Next.js, no package needed
- React Query caching — already configured

**Confidence:** HIGH — `@next/bundle-analyzer` is the standard Next.js bundle tool.

---

### 5. Accessibility Audit

**What's needed:** A CLI audit tool. No runtime packages.

**Recommended approach:** `axe-core` via `@axe-core/playwright` or manual audit with
browser DevTools. For automated CI:

```bash
npm install -D @axe-core/playwright playwright
```

However, for a production audit focused on "accessibility audit" as a milestone task,
the practical path is:
- Run `npx axe-cli https://your-app.vercel.app` on deployed build
- Fix reported issues in existing components (RTL, aria-label, focus management)
- No new runtime packages needed

**Confidence:** HIGH — axe-core CLI is the industry standard, no runtime dependency.

---

### 6. Stripe Customer Portal

**Current state:** `src/app/api/subscription/portal/` and `cancel/` directories exist.
The `checkout` route is implemented (reviewed). Portal route likely needs implementation.

**What's needed:** The Stripe Billing Portal session creation route — uses the already-installed
`stripe ^20.4.1` SDK. No new packages.

```typescript
// Pattern for portal session
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
});
```

**Confidence:** HIGH — standard Stripe Billing Portal, fully covered by installed SDK.

---

### 7. Environment Variables Required (Not Yet in .env.example)

Based on code audit, these env vars are used in code but may be missing from the
`.env.example` reference:

| Variable | Used By | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe SDK init | Already used in checkout route |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature | Already used |
| `STRIPE_PRICE_BASIC` | Checkout session | Already used |
| `STRIPE_PRICE_PREMIUM` | Checkout session | Already used |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe | Needed for Elements |
| `RESEND_API_KEY` | Email sending | Already used |
| `UPSTASH_REDIS_REST_URL` | Rate limiting | Already used |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Already used |
| `OPENAI_API_KEY` | LLM calls | Already used |
| `CRON_SECRET` | Cron job auth | NEW — not yet referenced |
| `NEXT_PUBLIC_APP_URL` | Stripe return URLs | NEW — needed for portal |

---

## What NOT to Add

**Do NOT install:**

| Package | Why Not |
|---|---|
| `@ai-sdk/openai` (Vercel AI SDK) | Overkill — `openai ^4.104.0` already handles streaming natively. Adding Vercel AI SDK would duplicate OpenAI integration and create two patterns in the codebase. |
| `@sendgrid/mail` | `resend ^4.8.0` already installed and implemented in 4 email services. |
| `nodemailer` | Same as above — Resend is already the email provider. |
| `chart.js` / `victory` | `recharts ^3.8.0` already installed and used in dashboard. Consistent charting library. |
| `react-query-devtools` | Not needed for production; vitest testing framework is already in place. |
| `@stripe/stripe-js` v9+ | Already at `^8.11.0` — no need to upgrade mid-milestone. |
| `canvas-confetti` | BASE44 had it. Not needed in current feature set. |
| `lodash` | Not installed in new build; no use case identified. Use native JS. |
| `moment` | BASE44 had it. `date-fns ^4.1.0` is already installed and is the correct choice (tree-shakeable, TypeScript-native). |
| `react-quill` | BASE44 rich text editor. Journal uses `Textarea` (simpler, correct for this use case). |
| `html2canvas` / `jspdf` | BASE44 had these for PDF export. `@react-pdf/renderer ^4.3.2` is already installed and is the better approach for structured PDFs. |
| `three` | BASE44 had Three.js for 3D. Not in v1.3 scope. |

---

## Packages to ADD (Summary)

| Package | Type | Version | Reason |
|---|---|---|---|
| `tsx` | devDependency | `^4.19.2` | Run TypeScript migration scripts without compilation |
| `@next/bundle-analyzer` | devDependency | `^15.x` (match Next.js 16) | Bundle size analysis for Lighthouse > 90 target |

**That's it. Two dev-only packages. No new runtime dependencies.**

---

## External Services Required (Not Packages)

| Service | Purpose | Status | Notes |
|---|---|---|---|
| Stripe | Payments + webhooks + portal | CONFIGURED (keys in use) | Needs `STRIPE_PRICE_BASIC/PREMIUM` price IDs |
| OpenAI | LLM + vision | CONFIGURED | `gpt-4o-mini` for text, `gpt-4o` for vision |
| Resend | Transactional email | CONFIGURED | Domain `masapnima.co.il` must be verified in Resend |
| Upstash Redis | Rate limiting | CONFIGURED | Sliding window limiter already implemented |
| Supabase | DB + Auth + Storage + Realtime | CONFIGURED | Admin client already set up |
| Vercel | Deployment + Cron | DEPLOYMENT TARGET | `vercel.json` for cron schedules needed |

---

## Integration Architecture Notes

### Stripe Flow (Already Implemented)
```
Client → /api/subscription/checkout → Stripe Checkout → Stripe Webhook → /api/webhooks/stripe
                                                         ↓
                                              Supabase subscriptions table
```
The webhook handler already handles: `checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`, `invoice.payment_failed`. This is complete.

### AI Coach Streaming (Needs Implementation)
```
Client (EventSource/fetch stream) ← /api/coach/messages/stream (NEW route) ← openai.stream()
                                                                              ↑
                                                                    personal-context service
```
Keep existing non-streaming `/api/coach/messages` POST for message persistence.
Add a separate `/api/coach/messages/stream` POST that streams and then persists
after the stream completes.

### Cron Jobs (Needs Implementation)
```
Vercel Scheduler → /api/cron/daily-insights (protected by CRON_SECRET)
                → /api/cron/reset-usage    (protected by CRON_SECRET)
                      ↓
               Supabase admin client (already set up)
```

### Data Migration (Needs Implementation)
```
BASE44 API → scripts/migrate-from-base44.ts → Supabase admin client
```
Run once, locally. Not a deployed route.

---

## Confidence Assessment

| Area | Level | Basis |
|---|---|---|
| Installed packages | HIGH | Direct inspection of `package.json` |
| Stripe integration | HIGH | Webhook + checkout routes read directly |
| OpenAI streaming | HIGH | openai v4 SDK async iterator is documented and in training data |
| Cron via Vercel | HIGH | Standard Vercel feature, in training data |
| BASE44 migration | MEDIUM | Data format unverified — depends on BASE44 API export |
| tsx package version | MEDIUM | Training data knowledge; verify with `npm show tsx version` |
| @next/bundle-analyzer version | MEDIUM | Match to Next.js 16 major; verify on npmjs.com |

---

## Sources

- Direct inspection: `D:/AI_projects/MystiQor/mystiqor-build/package.json`
- Direct inspection: `src/app/api/webhooks/stripe/route.ts`
- Direct inspection: `src/app/api/coach/messages/route.ts`
- Direct inspection: `src/services/analysis/llm.ts`
- Direct inspection: `src/services/email/welcome.ts`
- Direct inspection: `src/lib/rate-limit.ts`
- Direct inspection: `temp_source/package.json` (BASE44 original dependencies)
- Training data: Vercel Cron configuration format (MEDIUM confidence)
- Training data: OpenAI Node.js SDK v4 streaming (HIGH confidence — well-established API)
