# Requirements — v1.3 Full Platform

**Source:** Research (STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md) + user scoping session
**Coverage:** 0/37 satisfied

## Mystical Features

- [ ] **MYST-01**: User can view a Mystic Synthesis profile that cross-references all completed tool analyses into one unified personality portrait
- [ ] **MYST-02**: Mystic Synthesis handles partial data gracefully (user completed 3 of 13 tools) with clear indication of what's missing
- [ ] **MYST-03**: User can take a Big Five personality analysis via LLM-guided questionnaire with mystical framing
- [ ] **MYST-04**: Big Five results display OCEAN dimensions with scores, descriptions, and Hebrew labels
- [ ] **MYST-05**: User can upload a document and receive AI analysis of its content
- [ ] **MYST-06**: User receives a personalized daily insight automatically each day
- [ ] **MYST-07**: Daily insight cron runs idempotently (no duplicates on retry/double-fire)
- [ ] **MYST-08**: Daily insight cron uses CRON_SECRET header for authentication

## Personal Journey

- [ ] **JOUR-01**: User can chat with AI Coach in real-time with context-aware responses based on their analysis history
- [ ] **JOUR-02**: AI Coach system prompt is length-capped to prevent context overflow with large analysis histories
- [ ] **JOUR-03**: User can start and follow coaching journeys (structured multi-session paths)
- [ ] **JOUR-04**: FloatingCoachBubble is mounted and functional on all auth pages
- [ ] **JOUR-05**: User can write journal entries with free-text input
- [ ] **JOUR-06**: User can request AI insights on any journal entry on demand
- [ ] **JOUR-07**: Journal entries are private (RLS enforced, user can only see their own)

## Payments & Account

- [ ] **PAY-01**: User can subscribe to a paid plan via Stripe Checkout
- [ ] **PAY-02**: Stripe webhooks handle subscription lifecycle events (created, updated, cancelled, payment failed)
- [ ] **PAY-03**: Stripe webhook handler verifies signatures and processes events idempotently
- [ ] **PAY-04**: User can cancel their subscription (via Stripe Customer Portal or cancel route)
- [ ] **PAY-05**: Monthly usage counter resets via cron job using existing reset_monthly_usage() function
- [ ] **PAY-06**: User receives welcome email after completing onboarding
- [ ] **PAY-07**: User receives email when payment fails
- [ ] **PAY-08**: User receives email when approaching usage limit
- [ ] **PAY-09**: User can view and edit their profile (name, email, preferences)
- [ ] **PAY-10**: User can manage settings (theme, notifications, language preferences)
- [ ] **PAY-11**: Guest profiles supported (limited access without full registration)

## Referrals & Notifications

- [ ] **REF-01**: User can generate a referral code and share it
- [ ] **REF-02**: Referred user gets a bonus (extra usage or trial extension)
- [ ] **REF-03**: User can view and manage their notifications
- [ ] **REF-04**: Notification page shows system alerts, analysis completions, and referral events

## Infrastructure & Quality

- [ ] **INFRA-01**: Analytics dashboard shows user engagement metrics (tool usage, retention, active users)
- [ ] **INFRA-02**: Analytics queries use composite indexes on (user_id, created_at) for performance
- [ ] **INFRA-03**: All pages achieve Lighthouse performance score > 90
- [ ] **INFRA-04**: All pages pass WCAG 2.1 AA accessibility audit
- [ ] **INFRA-05**: Core services have unit test coverage (numerology, astrology, compatibility, subscription)
- [ ] **INFRA-06**: Data migration script imports BASE44 user data into Supabase with ID mapping
- [ ] **INFRA-07**: Tech debt resolved: missing SubscriptionGuard.test.tsx, empty summary one-liners, human verification items from audit

## Future Requirements (Deferred to v2.0)

- Goals management with AI recommendations
- Mood tracker with auto AI analysis
- Learning (Astrology tutor, Drawing tutor, Blog, Tutorials)

## Out of Scope

- Mobile app (React Native) — Web-first
- Multi-language — Hebrew-only
- Admin panel — Use Supabase Studio
- Social features — Future v3.0
- Stripe subscription portal UI (use Stripe's built-in Customer Portal)
- Push notifications (email only for v1.3)

## Traceability

| REQ-ID | Description | Phase | Status | Checked |
|--------|-------------|-------|--------|---------|
| MYST-01 | Mystic Synthesis unified profile | Phase 33 | Pending | [ ] |
| MYST-02 | Synthesis partial data handling | Phase 33 | Pending | [ ] |
| MYST-03 | Big Five LLM questionnaire | Phase 33 | Pending | [ ] |
| MYST-04 | Big Five OCEAN display | Phase 33 | Pending | [ ] |
| MYST-05 | Document analyzer upload + AI | Phase 35 | Pending | [ ] |
| MYST-06 | Daily insight auto-generation | Phase 30 | Pending | [ ] |
| MYST-07 | Daily insight cron idempotency | Phase 30 | Pending | [ ] |
| MYST-08 | Daily insight CRON_SECRET auth | Phase 30 | Pending | [ ] |
| JOUR-01 | AI Coach real-time chat | Phase 31 | Pending | [ ] |
| JOUR-02 | Coach prompt length cap | Phase 31 | Pending | [ ] |
| JOUR-03 | Coaching journeys | Phase 31 | Pending | [ ] |
| JOUR-04 | FloatingCoachBubble mounted | Phase 31 | Pending | [ ] |
| JOUR-05 | Journal free-text entries | Phase 32 | Pending | [ ] |
| JOUR-06 | Journal AI insights on demand | Phase 32 | Pending | [ ] |
| JOUR-07 | Journal RLS privacy | Phase 32 | Pending | [ ] |
| PAY-01 | Stripe Checkout subscription | Phase 29 | Pending | [ ] |
| PAY-02 | Stripe webhook lifecycle | Phase 29 | Pending | [ ] |
| PAY-03 | Webhook signature + idempotency | Phase 29 | Pending | [ ] |
| PAY-04 | Subscription cancellation | Phase 29 | Pending | [ ] |
| PAY-05 | Monthly usage reset cron | Phase 28 | Pending | [ ] |
| PAY-06 | Welcome email on onboarding | Phase 36 | Pending | [ ] |
| PAY-07 | Payment failed email | Phase 36 | Pending | [ ] |
| PAY-08 | Usage limit warning email | Phase 36 | Pending | [ ] |
| PAY-09 | Profile view + edit | Phase 36 | Pending | [ ] |
| PAY-10 | Settings management | Phase 36 | Pending | [ ] |
| PAY-11 | Guest profiles | Phase 35 | Pending | [ ] |
| REF-01 | Referral code generation | Phase 35 | Pending | [ ] |
| REF-02 | Referral bonus | Phase 35 | Pending | [ ] |
| REF-03 | Notifications management | Phase 36 | Pending | [ ] |
| REF-04 | Notification types | Phase 36 | Pending | [ ] |
| INFRA-01 | Analytics dashboard | Phase 34 | Pending | [ ] |
| INFRA-02 | Analytics DB indexes | Phase 34 | Pending | [ ] |
| INFRA-03 | Lighthouse > 90 | Phase 37 | Pending | [ ] |
| INFRA-04 | WCAG 2.1 AA | Phase 37 | Pending | [ ] |
| INFRA-05 | Core service tests | Phase 38 | Pending | [ ] |
| INFRA-06 | BASE44 data migration | Phase 39 | Pending | [ ] |
| INFRA-07 | Tech debt resolution | Phase 28 | Pending | [ ] |
