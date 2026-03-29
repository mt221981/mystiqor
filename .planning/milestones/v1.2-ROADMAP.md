# Roadmap: MystiQor

## Overview

Production rebuild from BASE44 no-code platform to Next.js 16 + TypeScript + Supabase. Phase 0 (Foundation — 69 files, 7,252 lines) is complete with tsc + build passing. Phases 1-5 deliver the full platform: services and API infrastructure, 13 mystical tools, personal journey features (AI Coach, goals, mood, journal), Stripe payments and account management, and final polish with testing and data migration.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 0: Foundation** - Project setup, auth, layout, types, GEMs 5/6/7/8/10/11 — COMPLETE
- [x] **Phase 1: Core Infrastructure** - Services layer, API skeleton, hooks, form components — COMPLETE (2026-03-20)
- [ ] **Phase 2: Core Features** - Onboarding, dashboard, 13 mystical tool pages end-to-end
- [ ] **Phase 3: Advanced Features** - AI Coach, goals, mood, journal, insights, synthesis
- [ ] **Phase 4: Integrations & Account** - Stripe, email, profile, learning, referrals
- [ ] **Phase 5: Polish & QA** - Performance, accessibility, test suite, data migration

## Phase Details

### Phase 1: Core Infrastructure
**Goal**: All services, hooks, form components, and API route handlers are in place — the typed "plumbing" that every feature plugs into
**Depends on**: Phase 0 (complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09, INFRA-10
**Success Criteria** (what must be TRUE):
  1. A developer can import any service (numerology, astrology, drawing, rule engine) and call its functions without TypeScript errors
  2. The geocoding API route returns location results for a Hebrew city name
  3. The subscription hook returns the current user's plan and usage from Supabase, and SubscriptionGuard blocks access when the limit is reached
  4. BirthDataForm and LocationSearch render with RTL layout, validate with Zod, and display Hebrew error messages
  5. All API route skeletons (geocode, upload, subscription, analysis) respond with typed JSON — no 404s or 500s on valid requests
**Plans**: 8 plans

Plans:
- [x] 01-01-PLAN.md — Test infrastructure (vitest), packages (openai, resend), DB migrations (20 tables, 3 functions)
- [x] 01-02-PLAN.md — GEM 2: Hebrew gematria + numerology services; GEM 3: rule engine
- [x] 01-03-PLAN.md — Geocode service, LLM wrapper, GEM 1: solar return VSOP87, GEM 14: aspects, chart assembly
- [x] 01-04-PLAN.md — GEM 12: astrology prompts, drawing analysis service, email services, Header signOut fix
- [x] 01-05-PLAN.md — 5 Zod validation schemas (analysis, subscription, goals, mood, journal), onboarding store, analytics hook
- [x] 01-06-PLAN.md — GEM 7: useSubscription hook with optimistic updates; FormInput, LocationSearch, BirthDataForm
- [x] 01-07-PLAN.md — SubscriptionGuard, UsageBar, PlanCard; GEM 9: ExplainableInsight, ConfidenceBadge; ToolGrid, AnalysisHistory
- [x] 01-08-PLAN.md — API routes: geocode, upload, subscription, subscription/usage, analysis, analysis/[id]

### Phase 2: Core Features
**Goal**: Users can complete onboarding and use all 13 mystical tools end-to-end, receiving personalized, non-generic AI-generated insights
**Depends on**: Phase 1
**Requirements**: ONBR-01, ONBR-02, ONBR-03, TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, TOOL-08, TOOL-09, TOOL-10, TOOL-11, TOOL-12, TOOL-13
**Success Criteria** (what must be TRUE):
  1. A new user completes the 4-step onboarding wizard (info, location, Barnum ethics, preferences) and their profile is saved to Supabase
  2. The dashboard displays real stats (goals count, mood entries, analyses count) and the home page renders the tool grid with daily insight widget
  3. The numerology tool calculates and displays Hebrew gematria (life path, destiny, soul, personality, personal year) for a given name
  4. The birth chart tool renders an interactive SVG with planet positions and aspect lines, and Solar Return finds the exact solar return moment via VSOP87 binary search
  5. All 13 tool pages accept input, call their API routes, and display AI-generated results — none return errors on valid input
**Plans**: 9 plans

Plans:
- [x] 02-01-PLAN.md — Onboarding wizard (GEM 13 Barnum ethics step), dashboard (real Supabase stats + Recharts), home page (ToolGrid + insight widget)
- [x] 02-02-PLAN.md — TOOL-01: Numerology (NumberCard); TOOL-09: Palmistry (vision AI); TOOL-10: Tarot (DB cards + seed)
- [ ] 02-03-PLAN.md — TOOL-07: Graphology (Comparison RadarChart + QuickStats); TOOL-08: Drawing (DigitalCanvas + AnnotatedViewer + KoppitzIndicators + MetricsBreakdown)
- [x] 02-04-PLAN.md — TOOL-11: Human Design (9-center SVG + LLM simulation); TOOL-12: Dream (async fire-and-forget)
- [ ] 02-05-PLAN.md — TOOL-02: Astrology birth chart (BirthChart SVG split into 5 sub-components, API + interpret route)
- [ ] 02-06-PLAN.md — TOOL-03: Solar Return (GEM 1 binary search); TOOL-04: Transits (REBUILD real ephemeris)
- [ ] 02-07-PLAN.md — TOOL-05: Synastry (dual chart + compatibility scoring); TOOL-06: Readings (8 types + ReadingCard)
- [ ] 02-08-PLAN.md — TOOL-13: Compatibility (numerology + astrology combined, anti-Barnum)
- [ ] 02-09-PLAN.md — Phase 2 human verification checkpoint (build clean + 13 tools confirmed working)

### Phase 3: Advanced Features
**Goal**: Users have a complete personal journey layer — AI coaching, goal tracking, mood logging, journaling, daily insights, and multi-tool synthesis
**Depends on**: Phase 2
**Requirements**: JOUR-01, JOUR-02, JOUR-03, JOUR-04, JOUR-05, JOUR-06, JOUR-07, JOUR-08, JOUR-09, JOUR-10, JOUR-11
**Success Criteria** (what must be TRUE):
  1. A user can send a message to the AI Coach and receive a streaming response via Supabase Realtime; coaching journeys (7-12 steps) can be generated and tracked
  2. A user can create, update, and delete goals with 8 category types; goals with sufficient data receive AI recommendations and obstacle analysis
  3. A user can log mood/energy/stress/sleep entries; after 6 or more entries the system automatically generates an AI analysis of patterns
  4. A user can write journal entries and request on-demand AI insights; daily insights combine numerology, tarot, transits, and goals into a single personalized summary
  5. The mystic synthesis page generates a multi-tool personality profile from existing analysis data; analysis history shows all past analyses with a side-by-side comparison view
**Plans**: TBD

### Phase 4: Integrations & Account
**Goal**: Payments work end-to-end, account management is complete, and learning content is accessible
**Depends on**: Phase 3
**Requirements**: ACCT-01, ACCT-02, ACCT-03, ACCT-04, ACCT-05, ACCT-06, ACCT-07, ACCT-08, ACCT-09, ACCT-10, LERN-01, LERN-02, LERN-03, LERN-04
**Success Criteria** (what must be TRUE):
  1. A user can upgrade to Basic (₪49/mo) or Premium (₪99/mo) via Stripe checkout with a 7-day trial; the Stripe webhook correctly activates the subscription in Supabase and sends a Hebrew welcome email via Resend
  2. A user can view their active subscription, cancel at period end, and receive a payment-failed email when a charge fails; monthly usage resets via cron on the first of each month
  3. A user can view and edit their profile (with completion score), manage settings (notifications, display, privacy), and create/edit/delete guest profiles
  4. A user can generate a referral code, share it, and receive 3 free analyses when a referred user subscribes; in-app notifications show pending/sent/dismissed states
  5. A user can access the astrology tutor (3 learning paths, 13 topics), drawing tutor, public blog (SSG with category filtering), and module-based tutorials with lock/unlock progression
**Plans**: TBD

### Phase 5: Polish & QA
**Goal**: The application is production-ready — Lighthouse > 90, accessible, fully tested, and BASE44 data migrated to Supabase
**Depends on**: Phase 4
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05
**Success Criteria** (what must be TRUE):
  1. Lighthouse scores exceed 90 on both mobile and desktop; initial JS bundle is under 200KB as measured by next build bundle analysis
  2. All ARIA labels, keyboard navigation paths, color contrast ratios, and focus management pass automated and manual accessibility audit
  3. The test suite passes for core services: numerology calculations, solar return binary search, rule engine evaluation, subscription hook, and forceToString utility
  4. BASE44 data migration scripts complete with zero data loss — validation script confirms row counts and integrity match between source and Supabase
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Foundation | - | Complete | 2026-03-20 |
| 1. Core Infrastructure | 8/8 | Complete | 2026-03-20 |
| 2. Core Features | 3/9 | In Progress |  |
| 3. Advanced Features | 0/TBD | Not started | - |
| 4. Integrations & Account | 0/TBD | Not started | - |
| 5. Polish & QA | 0/TBD | Not started | - |
| 19. Astrology Knowledge Base | 2/2 | Complete | 2026-03-29 |
