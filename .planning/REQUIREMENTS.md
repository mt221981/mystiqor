# Requirements: MystiQor

**Defined:** 2026-03-20
**Core Value:** Every user gets personalized mystical insights grounded in their specific data — not generic content. Anti-Barnum by design.

## v1 Requirements

Requirements for production rebuild. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: Services layer — numerology (gematria, calculations, compatibility), astrology (solar return, aspects, chart), drawing analysis, rule engine
- [x] **INFRA-02**: LLM invocation wrapper (OpenAI/Anthropic API) with sanitized prompts
- [x] **INFRA-03**: Geocoding service (Nominatim proxy)
- [x] **INFRA-04**: Zod validation schemas for all tool inputs — Complete (Plan 01-05)
- [x] **INFRA-05**: useSubscription hook with Supabase + optimistic updates (GEM 7) — Complete (Plan 01-06)
- [x] **INFRA-06**: Analytics tracking hooks (page view, tool usage) — Complete (Plan 01-05)
- [x] **INFRA-07**: Reusable form components (BirthDataForm, LocationSearch, FormInput) — Complete (Plan 01-06)
- [x] **INFRA-08**: SubscriptionGuard component enforcing plan limits — Complete (Plan 01-07)
- [x] **INFRA-09**: ExplainableInsight component with provenance display (GEM 9) — Complete (Plan 01-07)
- [x] **INFRA-10**: API route handlers skeleton (analysis CRUD, subscription, upload, geocode) — Complete (Plan 01-08)

### Onboarding & Dashboard

- [x] **ONBR-01**: User completes 4-step onboarding (info → location → ethics/Barnum → preferences)
- [x] **ONBR-02**: Dashboard shows stats (goals, mood, analyses, reminders) with charts
- [x] **ONBR-03**: Home page with tool grid, daily insight widget, recent analyses

### Mystical Tools

- [x] **TOOL-01**: Numerology — Hebrew gematria calculation (life path, destiny, soul, personality, personal year) — Complete (Plan 02-02)
- [ ] **TOOL-02**: Astrology birth chart — geocoding + calculation + interactive SVG + AI interpretation
- [ ] **TOOL-03**: Astrology Solar Return — VSOP87 binary search + Placidus houses (GEM 1)
- [ ] **TOOL-04**: Astrology Transits — real ephemeris calculation (rebuild from mocked data)
- [ ] **TOOL-05**: Astrology Synastry — dual chart comparison with compatibility scoring
- [ ] **TOOL-06**: Astrology Readings — 8 reading types with type-specific inputs
- [ ] **TOOL-07**: Graphology — image upload + AI analysis + radar chart comparison
- [ ] **TOOL-08**: Drawing Analysis — HTP with Koppitz indicators, digital canvas, annotations (GEM 8 pattern)
- [x] **TOOL-09**: Palmistry — image upload + AI palm analysis — Complete (Plan 02-02)
- [x] **TOOL-10**: Tarot — card draw (from DB, not hardcoded) + AI interpretation — Complete (Plan 02-02)
- [x] **TOOL-11**: Human Design — calculation + centers visualization — Complete (Plan 02-04)
- [x] **TOOL-12**: Dream Analysis — dream journal + async AI interpretation + image generation — Complete (Plan 02-04)
- [ ] **TOOL-13**: Compatibility — numerology + astrology combined, anti-Barnum prompting

### Personal Journey

- [ ] **JOUR-01**: AI Coach — real-time chat via Supabase Realtime + coaching journeys (7-12 steps)
- [ ] **JOUR-02**: Goals — CRUD with AI recommendations + obstacle analysis (8 categories)
- [ ] **JOUR-03**: Mood Tracker — log mood/energy/stress/sleep + auto AI analysis (≥6 entries)
- [ ] **JOUR-04**: Journal — CRUD with on-demand AI insights
- [ ] **JOUR-05**: Daily Insights — auto-generated combining numerology + tarot + transits + goals
- [ ] **JOUR-06**: Mystic Synthesis — multi-tool personality profile + predictive insights
- [ ] **JOUR-07**: Personality Analysis — Big Five radar chart
- [ ] **JOUR-08**: Career Guidance — AI recommendations based on skills/interests
- [ ] **JOUR-09**: Document Analyzer — PDF/image upload + AI analysis
- [ ] **JOUR-10**: Ask Question — open-ended Q&A with forceToString (GEM 5)
- [ ] **JOUR-11**: Analysis history with comparison view

### Payments & Account

- [ ] **ACCT-01**: Stripe checkout (Basic ₪49/mo, Premium ₪99/mo) with 7-day trial
- [ ] **ACCT-02**: Stripe webhook handling (checkout, subscription update/delete, payment failed)
- [ ] **ACCT-03**: Subscription management (view, cancel at period end)
- [ ] **ACCT-04**: Monthly usage reset (cron)
- [ ] **ACCT-05**: Profile view/edit with completion score
- [ ] **ACCT-06**: Settings (notifications, display, privacy)
- [ ] **ACCT-07**: Guest profiles CRUD
- [ ] **ACCT-08**: Referral system (code generation, 3 free analyses reward)
- [ ] **ACCT-09**: Notifications management (pending/sent/dismissed)
- [ ] **ACCT-10**: Email notifications (welcome, payment failed, usage limit) via Resend

### Learning

- [ ] **LERN-01**: Astrology Tutor — 3 learning paths (13 topics) + AI chat
- [ ] **LERN-02**: Drawing Tutor — quick questions + personalized suggestions from analysis
- [ ] **LERN-03**: Blog — articles from DB (SSG), category filtering, search
- [ ] **LERN-04**: Tutorials — module-based learning with lock/unlock progression

### Quality

- [ ] **QUAL-01**: Lighthouse > 90 (mobile + desktop)
- [ ] **QUAL-02**: Initial JS bundle < 200KB
- [ ] **QUAL-03**: Accessibility audit (ARIA, keyboard, contrast, focus)
- [ ] **QUAL-04**: Test suite for core services (numerology, astrology, rule engine, subscription)
- [ ] **QUAL-05**: Data migration from BASE44 (scripts + validation + rollback)

## v2 Requirements

- **V2-01**: English language support
- **V2-02**: Mobile app (React Native)
- **V2-03**: Social features (friends, groups)
- **V2-04**: Marketplace for practitioners
- **V2-05**: Admin panel
- **V2-06**: Video content

## Out of Scope

| Feature | Reason |
|---------|--------|
| React Native mobile app | Web-first, PWA sufficient for v2.0 |
| English language | Hebrew-only focus for initial release |
| Admin panel | Use Supabase Studio for admin |
| Social features | Low priority, complex, defer to v3.0 |
| Marketplace | Future business model expansion |
| Video content | Text + images sufficient |
| White-label | Enterprise feature for future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 (01-05) | Complete |
| INFRA-05 | Phase 1 (01-06) | Complete |
| INFRA-06 | Phase 1 (01-05) | Complete |
| INFRA-07 | Phase 1 (01-06) | Complete |
| INFRA-08 | Phase 1 (01-07) | Complete |
| INFRA-09 | Phase 1 (01-07) | Complete |
| INFRA-10 | Phase 1 (01-08) | Complete |
| ONBR-01 | Phase 2 | Complete |
| ONBR-02 | Phase 2 | Complete |
| ONBR-03 | Phase 2 | Complete |
| TOOL-01 | Phase 2 (02-02) | Complete |
| TOOL-02 | Phase 2 | Pending |
| TOOL-03 | Phase 2 | Pending |
| TOOL-04 | Phase 2 | Pending |
| TOOL-05 | Phase 2 | Pending |
| TOOL-06 | Phase 2 | Pending |
| TOOL-07 | Phase 2 | Pending |
| TOOL-08 | Phase 2 | Pending |
| TOOL-09 | Phase 2 (02-02) | Complete |
| TOOL-10 | Phase 2 (02-02) | Complete |
| TOOL-11 | Phase 2 (02-04) | Complete |
| TOOL-12 | Phase 2 (02-04) | Complete |
| TOOL-13 | Phase 2 | Pending |
| JOUR-01 | Phase 3 | Pending |
| JOUR-02 | Phase 3 | Pending |
| JOUR-03 | Phase 3 | Pending |
| JOUR-04 | Phase 3 | Pending |
| JOUR-05 | Phase 3 | Pending |
| JOUR-06 | Phase 3 | Pending |
| JOUR-07 | Phase 3 | Pending |
| JOUR-08 | Phase 3 | Pending |
| JOUR-09 | Phase 3 | Pending |
| JOUR-10 | Phase 3 | Pending |
| JOUR-11 | Phase 3 | Pending |
| ACCT-01 | Phase 4 | Pending |
| ACCT-02 | Phase 4 | Pending |
| ACCT-03 | Phase 4 | Pending |
| ACCT-04 | Phase 4 | Pending |
| ACCT-05 | Phase 4 | Pending |
| ACCT-06 | Phase 4 | Pending |
| ACCT-07 | Phase 4 | Pending |
| ACCT-08 | Phase 4 | Pending |
| ACCT-09 | Phase 4 | Pending |
| ACCT-10 | Phase 4 | Pending |
| LERN-01 | Phase 4 | Pending |
| LERN-02 | Phase 4 | Pending |
| LERN-03 | Phase 4 | Pending |
| LERN-04 | Phase 4 | Pending |
| QUAL-01 | Phase 5 | Pending |
| QUAL-02 | Phase 5 | Pending |
| QUAL-03 | Phase 5 | Pending |
| QUAL-04 | Phase 5 | Pending |
| QUAL-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-22 — synced with actual completion status from git history*
