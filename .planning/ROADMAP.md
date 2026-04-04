# Roadmap — MystiQor

## Milestones

- ✅ **v1.0 Foundation** - Phases 1-12 (shipped 2026-03-10)
- ✅ **v1.1 Rich Content** - Phases 13-24 (shipped 2026-03-20)
- ✅ **v1.2 Gap Closure** - Phases 25-27 (shipped 2026-03-29)
- 🚧 **v1.3 Full Platform** - Phases 28-39 (in progress)

---

## Phases

<details>
<summary>✅ v1.0–v1.2 (Phases 1–27) — SHIPPED</summary>

Phases 1–27 are complete. See previous milestone summaries in MILESTONES.md.

</details>

### 🚧 v1.3 Full Platform (In Progress)

**Milestone Goal:** Complete all features, payments, infrastructure, and quality work — production ready.

- [x] **Phase 28: Infrastructure Wiring** - vercel.json, cron routes, subscription cancel, tech debt (completed 2026-04-04)
- [ ] **Phase 29: Stripe End-to-End** - checkout, webhooks, cancellation, usage reset
- [ ] **Phase 30: Daily Insights** - cron generation at 06:00 UTC, page, feedback
- [ ] **Phase 31: AI Coach Hardening** - prompt overflow guard, coaching journeys, FloatingCoachBubble
- [ ] **Phase 32: Journal** - free-text entries, on-demand AI insights, RLS
- [ ] **Phase 33: Mystic Synthesis + Big Five** - cross-tool personality portrait, OCEAN analysis
- [ ] **Phase 34: Analytics Dashboard** - event tracking, composite DB indexes, charts
- [ ] **Phase 35: Document Analyzer + Guest Profiles + Referrals** - vision AI, guest access, referral codes
- [ ] **Phase 36: Email + Notifications + Profile + Settings** - all email triggers, notifications page, account pages
- [ ] **Phase 37: Performance + Accessibility** - Lighthouse > 90, WCAG 2.1 AA
- [ ] **Phase 38: Core Service Tests** - unit tests for services, subscription, email
- [ ] **Phase 39: BASE44 Data Migration** - historical data import with ID mapping

---

## Phase Details

### Phase 28: Infrastructure Wiring
**Goal**: The application has working cron scheduling infrastructure, a subscription cancel route, and all v1.2 tech debt items resolved
**Depends on**: Phase 27
**Requirements**: PAY-05, INFRA-07
**Success Criteria** (what must be TRUE):
  1. `vercel.json` exists at repo root with cron schedule entries for daily-insights and reset-usage
  2. POST `/api/cron/reset-usage` returns 200, resets monthly usage counters, and rejects requests without valid CRON_SECRET header
  3. POST `/api/subscription/cancel` cancels a subscription via Stripe and updates the subscriptions table
  4. SubscriptionGuard.test.tsx exists with passing tests — the only artifact flagged as missing from the Phase 26 verification
  5. All INFRA-07 tech debt items (empty summary one-liners, human verification items) are resolved or formally deferred
**Plans**: 3 plans
Plans:
- [x] 28-01-PLAN.md — Vercel cron infrastructure (vercel.json + reset-usage route + daily-insights skeleton)
- [x] 28-02-PLAN.md — Subscription cancel route + SubscriptionGuard tests
- [x] 28-03-PLAN.md — Tech debt closure (INFRA-07 audit and formal disposition)
**UI hint**: no

### Phase 29: Stripe End-to-End
**Goal**: A user can subscribe to a paid plan, have their subscription state reflect in the app, and cancel — all flows verified end-to-end
**Depends on**: Phase 28
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04
**Success Criteria** (what must be TRUE):
  1. User can click "Subscribe" and complete Stripe Checkout — subscription row appears in Supabase with correct plan_id and user_id
  2. Stripe webhook handler processes `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed` events correctly
  3. Webhook handler rejects requests with invalid Stripe signature (returns 400)
  4. User can cancel their subscription — status changes to `cancelled` in Supabase and SubscriptionGuard shows downgrade notice
  5. No duplicate subscription rows created on Stripe webhook retry (idempotency confirmed via processed_webhook_events check)
**Plans**: TBD
**UI hint**: no

### Phase 30: Daily Insights
**Goal**: Users receive a personalized daily insight automatically each morning, can view it on a dedicated page, and give feedback
**Depends on**: Phase 28
**Requirements**: MYST-06, MYST-07, MYST-08
**Success Criteria** (what must be TRUE):
  1. The daily-insights page renders today's insight (or an on-demand generated fallback if cron missed)
  2. POST `/api/cron/daily-insights` generates insights for all active users and rejects requests without valid CRON_SECRET header
  3. Running the cron route twice for the same day produces no duplicate insight rows (idempotency via unique constraint on user_id + insight_date)
  4. User can give thumbs-up or thumbs-down feedback on a daily insight
**Plans**: TBD
**UI hint**: yes

### Phase 31: AI Coach Hardening
**Goal**: The AI Coach works reliably for power users without context overflow, persists as a floating bubble across all auth pages, and supports structured coaching journeys
**Depends on**: Phase 29
**Requirements**: JOUR-01, JOUR-02, JOUR-03, JOUR-04
**Success Criteria** (what must be TRUE):
  1. User can send a message in the AI Coach and receive a context-aware response referencing their analysis history
  2. Coach system prompt is capped at ~6,000 characters and conversation history is limited to the last 10 messages — confirmed by code inspection
  3. FloatingCoachBubble is visible and functional on every authenticated page without navigating to /coach
  4. User can start and progress through a coaching journey (structured multi-session path with named steps)
**Plans**: TBD
**UI hint**: yes

### Phase 32: Journal
**Goal**: Users can write private journal entries and request AI insights on any entry on demand
**Depends on**: Phase 31
**Requirements**: JOUR-05, JOUR-06, JOUR-07
**Success Criteria** (what must be TRUE):
  1. User can create, view, and delete journal entries with free-text input
  2. User can tap "Request AI Insight" on any journal entry and receive a personalized analysis within the same view
  3. A user cannot read or modify another user's journal entries — RLS policy enforced at DB level
**Plans**: TBD
**UI hint**: yes

### Phase 33: Mystic Synthesis + Big Five
**Goal**: Users can view a unified personality portrait combining all completed tools, and take a Big Five personality assessment with mystical framing
**Depends on**: Phase 32
**Requirements**: MYST-01, MYST-02, MYST-03, MYST-04
**Success Criteria** (what must be TRUE):
  1. User with 3+ completed tools can view a Mystic Synthesis page with a unified personality portrait
  2. Synthesis page clearly indicates which tools are missing and what completing them would add — no misleading partial reads
  3. User can complete a Big Five questionnaire via LLM-guided flow (Hebrew questions, 10–15 exchanges)
  4. Big Five results page shows all five OCEAN dimensions with numeric scores, Hebrew labels, and descriptions
**Plans**: TBD
**UI hint**: yes

### Phase 34: Analytics Dashboard
**Goal**: Admin-facing analytics dashboard shows real engagement data and DB queries run on indexed columns
**Depends on**: Phase 30
**Requirements**: INFRA-01, INFRA-02
**Success Criteria** (what must be TRUE):
  1. Analytics dashboard page renders with charts showing tool usage counts, active users over time, and retention indicators
  2. Composite indexes on `(user_id, created_at DESC)` exist on analyses, mood_entries, and goals tables — confirmed via Supabase migration
  3. `POST /api/analytics/events` accepts and stores event records; `trackEvent()` utility is callable from any page
**Plans**: TBD
**UI hint**: yes

### Phase 35: Document Analyzer + Guest Profiles + Referrals
**Goal**: Users can analyze uploaded documents via vision AI, maintain guest profiles for family members, and generate referral codes
**Depends on**: Phase 33
**Requirements**: MYST-05, PAY-11, REF-01, REF-02
**Success Criteria** (what must be TRUE):
  1. User can upload a PDF, image, or text file and receive an AI analysis of its content
  2. User can create a guest profile (name + birth data) and run tool analyses attributed to that profile
  3. User can generate a unique referral code in the format `MASAPNIMA-{username}-{6chars}` and share it
  4. A new user who registers with a valid referral code receives a bonus (extra analyses or trial extension)
**Plans**: TBD
**UI hint**: yes

### Phase 36: Email + Notifications + Profile + Settings
**Goal**: All transactional emails are wired and sent, the notifications page is functional, and users can view and edit their profile and settings
**Depends on**: Phase 29
**Requirements**: PAY-06, PAY-07, PAY-08, PAY-09, PAY-10, REF-03, REF-04
**Success Criteria** (what must be TRUE):
  1. User receives a welcome email after completing the onboarding wizard
  2. User receives an email when a payment fails (Stripe `invoice.payment_failed` webhook triggers email)
  3. User receives an email warning when approaching their monthly usage limit
  4. User can view, mark-as-read, and dismiss notifications — page shows system alerts, analysis completions, and referral events
  5. User can edit their display name, email preferences, and language/theme settings and see changes persist on reload
**Plans**: TBD
**UI hint**: yes

### Phase 37: Performance + Accessibility
**Goal**: All pages score above 90 on Lighthouse performance and pass WCAG 2.1 AA accessibility checks
**Depends on**: Phase 36
**Requirements**: INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Lighthouse performance score is >= 90 on dashboard, tools index, and coach pages (three heaviest pages)
  2. No WCAG 2.1 AA contrast violations on mystical dark theme — axe-core CLI reports zero critical errors
  3. All interactive elements have visible focus indicators and ARIA labels
**Plans**: TBD
**UI hint**: yes

### Phase 38: Core Service Tests
**Goal**: Core service functions have unit test coverage with vitest so regressions are caught automatically
**Depends on**: Phase 37
**Requirements**: INFRA-05
**Success Criteria** (what must be TRUE):
  1. `npm test` passes with zero failures
  2. numerology service, astrology service, compatibility service, and subscription service each have at least 5 unit tests covering happy path and edge cases
  3. SubscriptionGuard.test.tsx exists and all assertions pass (closes v1.2 audit gap)
**Plans**: TBD
**UI hint**: no

### Phase 39: BASE44 Data Migration
**Goal**: Historical BASE44 user data is imported into Supabase with a dry-run safety mechanism, full ID mapping, and a reconciliation report
**Depends on**: Phase 38
**Requirements**: INFRA-06
**Success Criteria** (what must be TRUE):
  1. `scripts/migrate-base44.ts` runs with `--dry-run` flag and produces a reconciliation report without modifying the DB
  2. All users with a valid BASE44-to-Supabase ID mapping have their analyses, profiles, and settings migrated
  3. Records with no valid ID mapping are written to a `migration_errors` table — none are silently dropped
  4. Running the migration script twice produces no duplicate rows (idempotent via ON CONFLICT DO NOTHING)
**Plans**: TBD
**UI hint**: no

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1–27 (previous) | v1.0–v1.2 | — | Complete | 2026-03-29 |
| 28. Infrastructure Wiring | v1.3 | 3/3 | Complete    | 2026-04-04 |
| 29. Stripe End-to-End | v1.3 | 0/TBD | Not started | - |
| 30. Daily Insights | v1.3 | 0/TBD | Not started | - |
| 31. AI Coach Hardening | v1.3 | 0/TBD | Not started | - |
| 32. Journal | v1.3 | 0/TBD | Not started | - |
| 33. Mystic Synthesis + Big Five | v1.3 | 0/TBD | Not started | - |
| 34. Analytics Dashboard | v1.3 | 0/TBD | Not started | - |
| 35. Document Analyzer + Guest Profiles + Referrals | v1.3 | 0/TBD | Not started | - |
| 36. Email + Notifications + Profile + Settings | v1.3 | 0/TBD | Not started | - |
| 37. Performance + Accessibility | v1.3 | 0/TBD | Not started | - |
| 38. Core Service Tests | v1.3 | 0/TBD | Not started | - |
| 39. BASE44 Data Migration | v1.3 | 0/TBD | Not started | - |
