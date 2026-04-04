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
- ✓ Services layer: numerology, astrology, drawing analysis, rule engine, geocoding, LLM wrapper, email — Phase 1
- ✓ All GEMs migrated: GEM 1 (VSOP87), GEM 2 (gematria), GEM 3 (rule engine), GEM 7 (subscription), GEM 9 (insights), GEM 12 (prompts), GEM 13 (Barnum), GEM 14 (aspects) — Phase 1+2
- ✓ Zod validation schemas for all tool inputs — Phase 1
- ✓ useSubscription hook with optimistic updates (GEM 7) — Phase 1
- ✓ Form components (BirthDataForm, LocationSearch, FormInput) — Phase 1
- ✓ SubscriptionGuard, ExplainableInsight (GEM 9), ToolGrid, AnalysisHistory — Phase 1
- ✓ 6 API route handlers (geocode, upload, subscription, analysis CRUD) — Phase 1
- ✓ Onboarding (4-step wizard with Barnum Effect education, GEM 13) — Phase 2
- ✓ Dashboard with stats + Recharts charts — Phase 2
- ✓ Numerology tool (NumberCard + API) — Phase 2
- ✓ Palmistry tool (vision AI) — Phase 2
- ✓ Tarot tool (DB cards + seed + API) — Phase 2
- ✓ Human Design tool (9-center SVG + LLM simulation) — Phase 2
- ✓ Dream Analysis tool (async fire-and-forget) — Phase 2

### Active (v1.3 — Full Platform)

- [ ] Mystic synthesis (multi-tool personality profile)
- [ ] Personality analysis (Big Five)
- [ ] Document analyzer
- [ ] Daily insights generation (cron)
- [ ] AI Coach (real-time chat + coaching journeys)
- [ ] Goals management with AI recommendations
- [ ] Mood tracker with auto AI analysis
- [ ] Journal with on-demand AI insights
- [ ] Stripe integration (checkout, webhooks, subscription management)
- [ ] Email notifications (welcome, payment failed, usage limit)
- [ ] Profile + settings + guest profiles
- [ ] Referral system
- [ ] Notifications management
- [ ] Analytics dashboard
- [ ] Performance optimization (Lighthouse > 90)
- [ ] Accessibility audit
- [ ] Test suite (core services)
- [ ] Data migration from BASE44
- [ ] Tech debt fixes (missing tests, empty summaries, human verification items)

### Out of Scope

- Mobile app (React Native) — Web-first, PWA sufficient
- Multi-language (English) — Hebrew-only for v2.0
- Admin panel — Use Supabase Studio
- Social features (friends, groups) — Future v3.0
- Marketplace — Future business model expansion

### Deferred (v2.0)

- Learning (Astrology tutor, Drawing tutor, Blog, Tutorials)

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
| Next.js 16 App Router | Latest stable, RSC support, file-based routing | ✓ Working |
| Supabase over Firebase | PostgreSQL + RLS + Realtime + Auth in one | ✓ Working |
| React Query + Zustand | Server state + client state separation | ✓ Working |
| shadcn/ui + Tailwind | Customizable, RTL-friendly, great DX | ✓ Good |
| Hebrew gematria preserved | Core business logic, unique differentiator | ✓ Migrated (GEM 2) |
| Anti-Barnum approach | Ethical AI, builds trust, educates users | ✓ Implemented (GEM 13) |
| VSOP87 for Solar Return | Accurate astronomical calculations (±0.01°) | ✓ Migrated (GEM 1) |

## Current Milestone: v1.3 Full Platform

**Goal:** השלמת כל הפיצ'רים, תשלומים, תשתית ותיקונים — מוכן לפרודקשן

**Target features:**
- פיצ'רים מיסטיים: סינתזה, אישיות Big Five, מנתח מסמכים, תובנות יומיות
- מסע אישי: AI Coach, מטרות, מצב רוח, יומן
- תשלומים וחשבון: Stripe, אימייל, פרופיל, הפניות, התראות
- תשתית: אנליטיקס, ביצועים, נגישות, טסטים, מיגרציה
- תיקונים: tech debt מ-v1.2

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-04 — Milestone v1.3 started*
