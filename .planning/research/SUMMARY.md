# Project Research Summary

**Project:** MystiQor v1.3
**Domain:** Hebrew-first mystical self-discovery SaaS — AI coaching, personal journey tracking, payments, subscription management
**Researched:** 2026-04-03
**Confidence:** HIGH

## Executive Summary

MystiQor v1.3 is a completion milestone, not a greenfield build. The codebase already has 60+ API routes, 20 typed DB tables, a full service layer, and every page skeleton in place. What is missing is a small set of critical integrations: two cron route files, one subscription cancel route, vercel.json for scheduling, the welcome email trigger in onboarding, and the AI coach context limits. The architecture is mature — the dominant pattern (Zod-validated API route → service → Supabase → React Query) is established and consistent throughout. The work is filling in stubs and wiring missing connections, not designing new systems.

The recommended approach is to work in dependency order: infrastructure first (vercel.json, missing routes), then foundational features (Stripe webhooks are already built — validate they work end-to-end), then user-facing completion work (daily insights, coach, analytics), then polish and quality passes (email, performance, accessibility, testing, data migration). Every phase should treat the existing working code as immovable — the risk of regression is far greater than the risk of leaving imperfect code in place.

The two highest-risk areas are Stripe and data migration. Stripe failures are silent (users pay but stay on free plan) and the existing webhook handler already handles this correctly — the risk is someone refactoring it. BASE44 data migration has the most unknowns: user ID mapping is the hard part, and a dry-run/transaction strategy is mandatory to prevent partial-state disasters. All other features follow well-established patterns with HIGH-confidence implementation paths.

---

## Key Findings

### Recommended Stack

The stack is locked. Zero new runtime packages are required. The codebase already has `openai ^4.104.0`, `stripe ^20.4.1`, `resend ^4.8.0`, `recharts ^3.8.0`, `@upstash/ratelimit`, `framer-motion`, `react-markdown`, `@react-pdf/renderer`, and `vitest`. The only additions are two dev-only packages: `tsx` (run TypeScript migration scripts) and `@next/bundle-analyzer` (Lighthouse performance work).

**Core technologies — why they stay:**
- **Next.js 16 + App Router**: All routing, middleware, and API patterns are built on it. Not changeable.
- **Supabase**: DB, Auth, Storage, Realtime — all configured with typed schema in `database.ts`. Admin client for webhooks/crons already set up.
- **OpenAI SDK v4**: Native async iterator streaming supported. Current synchronous coach is correct for now; streaming is optional enhancement.
- **Stripe SDK v20**: Checkout, webhooks, billing portal — all supported. Webhook handler already implements raw body + idempotency correctly.
- **Resend**: Four email service functions already implemented. Domain DNS verification is the only blocker.
- **Upstash Redis**: Rate limiting already wired to all LLM routes.
- **Vercel**: Deployment target. `vercel.json` is the only missing config file.

**New env vars needed:** `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` (for Stripe portal return URL).

### Expected Features

Research source: direct inspection of all BASE44 source pages (`temp_source/src/pages/`). Every feature has an existing reference implementation.

**Must have (table stakes) — these block other things or define the core UX:**
- Stripe checkout + webhooks — subscriptions are fake without it; already built, needs end-to-end validation
- AI Coach persistent chat — center of the product per UX priority feedback; synchronous implementation already built
- Goals CRUD with progress tracking — fast win, no complex dependencies
- Mood tracker log + AI pattern analysis (fires after 6+ entries) — daily habit loop
- Journal CRUD + on-demand AI insights — completes the personal journey trio
- Daily insights display + generation cron — reason-to-return-daily mechanism
- Mystic synthesis on-demand — headline feature connecting all 13 tools
- Profile edit + Settings page — required for personalization to function
- Email: welcome + payment-failed minimum — trust signals

**Should have (differentiators — meaningful UX lift):**
- Coaching journeys dashboard (structured step-by-step plans with progress)
- Personality analysis with Big Five framing linked to mystical data
- Document analyzer (PDF/image/text upload + vision AI + follow-up Q&A)
- Goal AI recommendations with mystical-tool-linked action steps
- Analytics dashboard (already has API; needs page and charts)
- Referral system with unique codes
- Guest profiles for family member analyses
- Notifications page (pending/dismissed/sent tabs)

**Defer (v2+):**
- Real-time mood charts (card lists are sufficient for v1.3)
- Social sharing of analyses
- Mobile push notifications (email only for now)
- Multi-language UI (Hebrew-only per constraint)
- Document analysis history persistence (session-only is intentional)
- Referral reward application via Stripe coupons (complex, defer)
- Full E2E test suite (core service unit tests only)

**Behaviors to preserve exactly from BASE44 source:**
- Mood AI analysis fires only after 6+ entries
- AI Coach auto-creates conversation on first message
- Synthesis supports both on-demand and weekly modes
- Goals have 8 categories with Hebrew labels + icons + gradient colors
- Journal gratitude is an array (not a single text field)
- Referral code format: `MASAPNIMA-{username}-{6chars}`
- Daily insights feedback: thumbs-up/down + text comment

### Architecture Approach

The architecture is already determined by what exists. The pattern is: typed Zod-validated API route → service function → Supabase server or admin client → React Query on the client. Every new file must follow this groove. The most important constraint: `invokeLLM()` signature is used by 20+ routes — do not change it. Three Supabase client variants have distinct scopes (server client for authenticated user routes, admin client for webhooks and crons, browser client for React components with direct DB access) — do not mix them.

**Major components and their current status:**
1. **API routes layer** (60+ routes, `src/app/api/`) — mostly BUILT; 4 files missing: `cron/daily-insights/route.ts`, `cron/reset-usage/route.ts`, `subscription/cancel/route.ts`, `analytics/events/route.ts`
2. **Services layer** (`src/services/`) — COMPLETE; email services, LLM wrapper, coach context builder, astrology/numerology engines all present
3. **DB schema** (`src/types/database.ts`, 1103 lines) — COMPLETE; 20 tables fully typed
4. **Page components** (`src/app/(auth)/`) — mostly BUILT; `daily-insights/page.tsx` is stub only; coach, goals, journal, mood, analytics, profile, settings, notifications, referrals are self-contained full implementations
5. **Floating Coach** (`FloatingCoachBubble` + `FloatingCoachPanel`) — must be mounted in `(auth)/layout-client.tsx` to persist across navigation; shares Zustand store with main coach page
6. **Cron infrastructure** — directories exist, no route files, no `vercel.json`
7. **SubscriptionGuard** — already built, wraps premium features; every new premium page must use it

**Missing files inventory (complete):**

| File | Priority |
|------|----------|
| `vercel.json` (repo root) | Critical |
| `src/app/api/cron/daily-insights/route.ts` | High |
| `src/app/api/cron/reset-usage/route.ts` | High |
| `src/app/api/subscription/cancel/route.ts` | High |
| `src/app/api/analytics/events/route.ts` | Medium |
| `src/lib/utils/track-event.ts` | Medium |
| `scripts/migrate-base44.ts` | Medium |

**Missing integrations (files exist, wire-up missing):**
- `sendWelcomeEmail()` call absent from `POST /api/onboarding/complete`
- `sendUsageLimitEmail()` call absent from tool analysis routes when limit reached
- `FloatingCoachBubble` not mounted in `(auth)/layout-client.tsx`

### Critical Pitfalls

Eight critical pitfalls identified with high confidence from direct code inspection and Vercel/Stripe official docs.

1. **Stripe webhook body parsing** — `request.text()` must be the first read; calling `.json()` first destroys the raw bytes Stripe uses for HMAC verification. The existing stub is correct — do not refactor it. Risk: silent payment failures with no user-visible error.

2. **Stripe idempotency insert order** — insert to `processed_webhook_events` BEFORE any business logic, not after. Existing stub does this correctly. Risk: duplicate subscription records or double email sends on Stripe retries.

3. **Stripe missing `metadata.user_id`** — the checkout session must include `metadata: { user_id, plan_id }`. Without it, the webhook handler cannot match the payment to a user. Risk: users pay and stay on free plan permanently.

4. **Cron endpoint has no auth** — every cron route must check `Authorization: Bearer ${CRON_SECRET}`. Without it, any caller can drain the OpenAI budget. Risk: token budget exhaustion.

5. **Cron daily insights idempotency** — Vercel can fire the same cron twice. Must check `(user_id, insight_date)` uniqueness before generating. Unique constraint on DB + `ON CONFLICT DO NOTHING`. Risk: duplicate insights, duplicate notification sends.

6. **AI Coach system prompt overflow** — `invokeLLM()` does not cap total prompt length. Power users with many analyses + long conversation history can push past gpt-4o-mini's 128K context limit. Prevention: cap `fullSystemPrompt` at ~6,000 chars, limit history to last 10 messages, export `maxDuration = 60` from the route.

7. **Analytics table scans at scale** — analytics queries on `analyses`, `mood_entries`, `goals` hit sequential scans without composite indexes on `(user_id, created_at DESC)`. Prevention: add these indexes via Supabase migration before data grows.

8. **BASE44 migration user ID mismatch** — BASE44 user IDs will not match Supabase auth UUIDs. Must build a user ID mapping table before migration. All rows with no mapping go to `migration_errors`, not dropped silently. Must use transaction wrapping + dry-run flag.

---

## Implications for Roadmap

Based on dependency analysis and pitfall severity, the following phase structure is recommended. Features are ordered by what blocks other things first.

### Phase 1: Infrastructure — Cron + Subscription Cancel
**Rationale:** These are non-user-facing but block everything else. `vercel.json` must exist before cron routes are useful. `subscription/cancel/route.ts` is a directory with no file — a gap in the existing feature. Zero user-visible impact but required for production completeness.
**Delivers:** Working cron scheduling infrastructure; complete subscription management API
**Creates:** `vercel.json`, `cron/reset-usage/route.ts`, `subscription/cancel/route.ts`
**Avoids:** Pitfalls 4 (cron auth), 5 (cron idempotency)
**Research flag:** SKIP — standard Vercel cron and Stripe portal patterns, HIGH confidence

### Phase 2: Stripe End-to-End Validation
**Rationale:** Stripe checkout is built but must be validated end-to-end with real webhook events before any other feature is considered "working." Subscription state gates all premium features. Email triggers (welcome, payment-failed) should be wired here too.
**Delivers:** Verified subscription flow from checkout through webhook to DB; welcome email on onboarding; payment-failed email on failed invoice
**Validates:** Checkout → webhook → subscriptions table → SubscriptionGuard
**Avoids:** Pitfalls 1, 2, 3 (webhook body, idempotency, metadata) — existing code is correct but must be tested
**Research flag:** SKIP — Stripe webhook patterns are HIGH confidence and already implemented

### Phase 3: Daily Insights Cron + Page
**Rationale:** Daily insights is the "reason to return" loop. The API route (`/api/tools/daily-insights`) already has cache-or-generate logic. The cron is a pre-generation optimization. The page is currently a stub. These three things ship together.
**Delivers:** Full daily insights feature: cron generates at 06:00 UTC, page displays with thumbs feedback, on-demand fallback if cron missed
**Creates:** `cron/daily-insights/route.ts`, full `daily-insights/page.tsx`
**Avoids:** Pitfalls 4, 5, 20 (cron auth, idempotency, no-retry) — per-user error isolation required
**Research flag:** SKIP — patterns are established; Vercel cron + invokeLLM + DB insert

### Phase 4: AI Coach Hardening
**Rationale:** Chat is the center of the UX. The coach is built but has a known risk (Pitfall 6 — system prompt overflow). This phase adds the prompt length guard, history limit, `maxDuration` export, and Hebrew RTL chat bubble fix. Also mounts FloatingCoachBubble in the auth layout.
**Delivers:** Production-hardened coach with prompt overflow protection; floating coach persisting across all auth pages; coaching journeys UI completion
**Avoids:** Pitfall 6 (context overflow), Pitfall 17 (RTL mixed content), Pitfall 12 (N+1 per message)
**Research flag:** SKIP — synchronous coach is already built; this is defensive hardening only

### Phase 5: Personal Journey Trio (Goals, Mood, Journal)
**Rationale:** These three features share no complex dependencies — Goals CRUD, Mood tracker, and Journal are all fully built with service functions in place. This phase verifies they work end-to-end with TypeScript strict compliance, adds any missing RLS policies, and ensures AI insight calls (mood pattern analysis, journal on-demand insights) fire correctly.
**Delivers:** Verified goals + mood + journal with AI insights, correct 6-entry mood threshold behavior, journal AI insight trigger
**Avoids:** Pitfall 15 (RLS on all tables)
**Research flag:** SKIP — all patterns established, direct code inspection confirms implementation

### Phase 6: Mystic Synthesis + Personality Analysis
**Rationale:** These are the headline differentiators but depend on the personal journey data (Phase 5) to have meaningful content. Both have high complexity (cross-tool data aggregation, structured LLM output). They should be verified with partial-data graceful handling tested explicitly.
**Delivers:** On-demand synthesis reading all 13 tool types; Big Five framing linked to mystical profile data; weekly report generation
**Avoids:** LLM context window issues with large analysis history (same prompt-cap discipline as Phase 4)
**Research flag:** CONSIDER — LLM structured output schema for Big Five mapping may need verification

### Phase 7: Analytics Dashboard + Event Tracking
**Rationale:** The analytics API is built but the `analytics_events` table is not being written to. This phase adds the `trackEvent()` utility, the `POST /api/analytics/events` route, and verifies the dashboard page renders correctly. Composite DB indexes (Pitfall 7) are applied here.
**Delivers:** Working analytics dashboard with event tracking; DB indexes on `(user_id, created_at DESC)` for all queried tables
**Creates:** `analytics/events/route.ts`, `lib/utils/track-event.ts`
**Avoids:** Pitfall 7 (table scans), Pitfall 19 (Recharts SSR)
**Research flag:** SKIP — aggregation queries and Recharts patterns are standard

### Phase 8: Document Analyzer + Guest Profiles + Referrals
**Rationale:** These three differentiator features are self-contained with no inter-dependencies. Document analyzer is the highest complexity (vision AI + file upload + multi-turn Q&A). Guest profiles and referrals are medium complexity. Group together as a differentiator batch.
**Delivers:** Document analyzer with 4 file types, 10MB max, Q&A context; guest profile switcher; referral code generation and claim flow
**Avoids:** Session-only document history (intentional — do not add DB persistence)
**Research flag:** CONSIDER for document analyzer — vision AI multi-turn context management needs care

### Phase 9: Email Notifications + Notification Page
**Rationale:** Email infrastructure exists (Resend, 4 service functions) but DNS must be verified and usage-limit trigger is missing from analysis routes. Notification page (reminders CRUD) is already built — needs end-to-end verification.
**Delivers:** All email triggers wired; domain DNS verified; notifications page functional
**Avoids:** Pitfall 9 (domain not verified), Pitfall 10 (Resend rate limit handling)
**Research flag:** SKIP — Resend integration is already implemented; this is wiring and DNS

### Phase 10: Performance + Accessibility
**Rationale:** Quality pass after all features are complete. Lighthouse > 90 target. WCAG 2.1 AA contrast check on mystical dark theme. Bundle analysis with `@next/bundle-analyzer`.
**Delivers:** Lighthouse > 90; WCAG AA compliance on new UI; server-only guards on llm.ts and stripe service files
**Avoids:** Pitfall 14 (client-side SDK bundling), Pitfall 18 (contrast failures)
**Research flag:** SKIP — axe-core CLI + @next/bundle-analyzer are standard tools

### Phase 11: Core Service Unit Tests
**Rationale:** Vitest is already configured. Testing after features are stable, not while they're being completed. Core services (invokeLLM, analysis services, email services) are the test targets — not E2E.
**Delivers:** Unit tests for service layer; regression protection for future changes
**Research flag:** SKIP — vitest configuration already in place

### Phase 12: BASE44 Data Migration
**Rationale:** Migration is last, not first. All DB tables must be stable and verified before migrating data into them. Migration is one-time, irreversible, and requires the most defensive engineering (dry-run, transaction, mapping table).
**Delivers:** Historical user data migrated from BASE44 to Supabase with full reconciliation report
**Avoids:** Pitfall 8 (no rollback), Pitfall 16 (user ID mismatch)
**Research flag:** NEEDS RESEARCH — BASE44 data format and API export mechanism not fully inspected; run `/gsd:research-phase` before execution

---

### Phase Ordering Rationale

- Infrastructure before features: `vercel.json` and missing route files gate everything downstream
- Stripe before personal features: subscription state gates all premium content; broken payments are invisible to developers but catastrophic for users
- Daily insights before analytics: insights generate the events that populate analytics
- Personal journey trio before synthesis: synthesis reads goals, mood, journal data — needs that data to exist
- All features before performance: no point optimizing until the feature set is stable
- Migration last: irreversible operation; all tables must be verified, all features tested

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 6 (Mystic Synthesis / Personality Analysis):** LLM structured JSON schema for Big Five mapping to mystical dimensions — verify output schema design before implementation
- **Phase 8 (Document Analyzer):** Vision AI multi-turn Q&A context management pattern — particularly how to preserve analysis context across follow-up questions within a session
- **Phase 12 (BASE44 Migration):** BASE44 API export format is not fully inspected; user ID mapping strategy needs validation against actual BASE44 data structure; run `/gsd:research-phase` before starting

Phases with standard patterns (skip research-phase):
- **Phase 1:** Vercel cron config is documented and straightforward
- **Phase 2:** Stripe checkout/webhook pattern is built and verified in existing code
- **Phase 3:** Vercel cron + invokeLLM is the established project pattern
- **Phase 4:** Coach is already synchronous and working; this is hardening only
- **Phase 5:** Goals/mood/journal CRUD follows identical patterns to existing routes
- **Phase 7:** Analytics aggregation and Recharts are standard
- **Phase 9:** Resend email is already implemented; DNS and wiring only
- **Phase 10:** Bundle analyzer and axe-core are standard tools
- **Phase 11:** Vitest already configured

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct inspection of `package.json`; all packages confirmed; zero new runtime deps |
| Features | HIGH | Direct inspection of all BASE44 source pages; full feature inventory with source file mapping |
| Architecture | HIGH | Direct inspection of all 60+ routes, `database.ts`, service files; missing files confirmed with `find` |
| Pitfalls | HIGH | Cron/Stripe pitfalls sourced from official Vercel + Stripe docs directly; existing code inspection confirms 4 pitfalls already handled correctly |

**Overall confidence: HIGH**

### Gaps to Address

- **BASE44 data export format**: The `temp_source/` directory has the source code but not data exports. The actual data shape (column names, ID format, date format) is unknown until export is attempted. Handle during Phase 12 research.
- **Resend domain DNS state**: `masapnima.co.il` domain verification status in Resend is unknown. Must verify before Phase 9 email testing. If unverified, allow 24-48 hours for DNS propagation.
- **Stripe Price IDs**: `STRIPE_PRICE_BASIC` and `STRIPE_PRICE_PREMIUM` env vars are referenced in code but their actual Stripe dashboard values are not in scope here. Must be confirmed before Phase 2 checkout validation.
- **BASE44 user count**: Unknown how many users to migrate. Migration batch size strategy depends on this. Assess during Phase 12 research.
- **tsx version compatibility**: `tsx` is not in devDependencies; version `^4.19.2` recommended but should be verified against Node.js version in use.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `D:/AI_projects/MystiQor/mystiqor-build/package.json`
- Direct file inspection: `src/types/database.ts` (1103 lines, 20 tables fully typed)
- Direct file inspection: `src/app/api/webhooks/stripe/route.ts` (raw body + idempotency confirmed)
- Direct file inspection: `src/app/api/coach/messages/route.ts` (synchronous pattern confirmed)
- Direct file inspection: `src/services/email/` (four email functions present)
- Direct file inspection: `src/services/analysis/llm.ts` (single invokeLLM entry point)
- Vercel Cron Jobs official docs (vercel.com/docs/cron-jobs) — idempotency, no-retry, CRON_SECRET pattern, UTC-only timezone
- Vercel Function Duration docs — Hobby max 300s, Pro max 800s
- WCAG 2.1 AA specification — 4.5:1 contrast ratio for normal text

### Secondary (MEDIUM confidence)
- Direct inspection: `temp_source/src/pages/` — all 12 BASE44 source pages reviewed for feature behaviors
- Training data: OpenAI SDK v4 async iterator streaming API — well-established, in training data through Aug 2025
- Training data: Stripe webhook raw body requirement — well-established pattern

### Tertiary (LOW confidence)
- Resend free tier rate limits (100/day, 3,000/month) — may have changed; verify in Resend dashboard before launch
- BASE44 API export format — entirely unverified; flagged as gap for Phase 12

---

*Research completed: 2026-04-03*
*Ready for roadmap: yes*
