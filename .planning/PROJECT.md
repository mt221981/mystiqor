# MystiQor

## What This Is

MystiQor is a Hebrew-first mystical self-discovery platform combining traditional tools (numerology, astrology, graphology, tarot, palmistry, drawing analysis) with AI to generate deep, personalized, evidence-based insights. Production rebuild from BASE44 no-code platform to Next.js 16 + TypeScript + Supabase.

## Core Value

Every user gets personalized mystical insights grounded in their specific data (birth date, name, handwriting, drawings) — not generic horoscope-style content. Anti-Barnum by design.

## Requirements

### Validated

- ✓ Project setup with Next.js 16 + TypeScript strict + Tailwind + shadcn/ui — Phase 0
- ✓ Supabase client/server/admin/middleware integration — Phase 0
- ✓ Auth flow (login/register/magic link) with Hebrew UI — Phase 0
- ✓ RTL layout with sidebar navigation (30 items, 6 categories) — Phase 0
- ✓ Dark/light theme with CSS variables — Phase 0
- ✓ Type system (database, analysis, astrology, numerology, subscription) — Phase 0
- ✓ GEMs 5,6,7,8,10,11 migrated (forceToString, zodiac constants, plans, cache, error boundary, animations) — Phase 0

### Active

- [ ] Services layer: numerology (gematria, calculations, compatibility), astrology (solar return, aspects, chart, prompts), drawing analysis, rule engine, geocoding, LLM wrapper, email templates
- [ ] API route handlers for all 13+ tools
- [ ] Subscription hook with Supabase + optimistic updates
- [ ] Form components (BirthDataForm, LocationSearch, FormInput)
- [ ] Onboarding (4-step wizard with Barnum Effect education)
- [ ] Dashboard with stats + charts
- [ ] 13 mystical tool pages: Numerology, Astrology (birth chart, solar return, transits, synastry, readings), Graphology, Drawing, Palmistry, Tarot, Human Design, Dream, Compatibility, Career, Question
- [ ] AI Coach (real-time chat + coaching journeys)
- [ ] Goals management with AI recommendations
- [ ] Mood tracker with auto AI analysis
- [ ] Journal with on-demand AI insights
- [ ] Daily insights generation (cron)
- [ ] Mystic synthesis (multi-tool personality profile)
- [ ] Personality analysis (Big Five)
- [ ] Document analyzer
- [ ] Stripe integration (checkout, webhooks, subscription management)
- [ ] Email notifications (welcome, payment failed, usage limit)
- [ ] Profile + settings + guest profiles
- [ ] Referral system
- [ ] Notifications management
- [ ] Learning (Astrology tutor, Drawing tutor, Blog, Tutorials)
- [ ] Analytics dashboard
- [ ] Performance optimization (Lighthouse > 90)
- [ ] Accessibility audit
- [ ] Test suite (core services)
- [ ] Data migration from BASE44

### Out of Scope

- Mobile app (React Native) — Web-first, PWA sufficient
- Multi-language (English) — Hebrew-only for v2.0
- Admin panel — Use Supabase Studio
- Social features (friends, groups) — Future v3.0
- Marketplace — Future business model expansion

## Context

- Original system built on BASE44 (no-code platform) with 293 files, 59,844 lines
- 26 features identified and documented (02_REVERSE_ENGINEERING.md)
- 14 code GEMs preserved (02b_GEMS.md) — excellent business logic to migrate
- Full architecture designed (03_ARCHITECTURE.md) — 20 DB tables, 35+ API endpoints
- PRD complete (04_PRD.md) — 34 features across 6 modules
- Build plan complete (05_GSD_BUILD_BRIEF.md) — 6 phases, ~195 files
- Phase 0 (Foundation) already built — 69 files, 7,252 lines, tsc + build = 0 errors
- Source code available in temp_source/ for reference

## Constraints

- **Stack**: Next.js 16 + TypeScript strict + Supabase + Tailwind + shadcn/ui (decided)
- **Language**: Hebrew-only UI, RTL throughout, Israeli date format
- **Security**: RLS on every Supabase table, Zod validation on all API routes
- **Performance**: Lighthouse > 90, LCP < 1.5s, initial JS < 200KB
- **Code quality**: No `any`, no `@ts-ignore`, max 300 lines per file, JSDoc in Hebrew
- **GEM preservation**: All 14 GEMs must be migrated with logic intact

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 App Router | Latest stable, RSC support, file-based routing | — Pending |
| Supabase over Firebase | PostgreSQL + RLS + Realtime + Auth in one | — Pending |
| React Query + Zustand | Server state + client state separation | — Pending |
| shadcn/ui + Tailwind | Customizable, RTL-friendly, great DX | ✓ Good |
| Hebrew gematria preserved | Core business logic, unique differentiator | — Pending |
| Anti-Barnum approach | Ethical AI, builds trust, educates users | — Pending |
| VSOP87 for Solar Return | Accurate astronomical calculations (±0.01°) | — Pending |

---
*Last updated: 2026-03-20 after Phase 0 completion*
