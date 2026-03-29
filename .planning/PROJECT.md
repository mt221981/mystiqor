# MystiQor — פלטפורמת ניתוח מיסטי-פסיכולוגי אישי

## What This Is

MystiQor היא פלטפורמה מקיפה לניתוח אישי המשלבת כלים מיסטיים ופסיכולוגיים — אסטרולוגיה (כולל אפמריס אמיתי), נומרולוגיה, ניתוח ציורים, גרפולוגיה, טארוט, Human Design, palmistry ועוד — עם AI Coach שמסנתז תובנות מכל הכלים לתמונה אחת שלמה. עם מנוי Stripe, PWA, ועיצוב MD3 כהה-קוסמי. בנויה ב-Next.js 14 + TypeScript strict + Supabase, בעברית (RTL).

## Core Value

**ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים** — אסטרולוגיה, נומרולוגיה, ציורים, גרפולוגיה — עם AI שמסנתז את הכל לתובנות אישיות אחודות. לא כלים בודדים, אלא תמונה שלמה.

## Current State

**Shipped: v1.2 Rich Content & Soul** (2026-03-29)

- v1.0: 12 phases, 66 plans, 308 source files, ~27,300 LOC TypeScript
- v1.2: 4 phases, 13 plans — rich content layer + personalized AI soul
- 78 tarot cards with full Kabbalistic/astrological metadata + 4 spread layouts (including Celtic Cross)
- Astrology dictionary: 12 zodiac signs, 10 planets, 12 houses, 7 aspects — browsable UI
- 3 rich Hebrew blog articles from DB + blog detail pages with Markdown rendering
- 12-emoji dream emotion selector replacing free-text input
- All 21 LLM prompts personalized: name, zodiac, life path number, Kabbalistic-spiritual language
- Shared `getPersonalContext` helper ensures two users always get different AI responses
- All 12/12 v1.2 requirements satisfied

## Requirements

### Validated (v1.0)

- ✓ **Infrastructure** — LLM Zod validation, file upload, atomic usage counter, geocoding, rate limiting, email — v1.0
- ✓ **Auth + Onboarding** — Supabase Auth, multi-step onboarding, protected routes — v1.0
- ✓ **Profile + Settings** — Profile editing, guest profiles, theme/notification settings — v1.0
- ✓ **Dashboard** — Biorhythm chart, stats, mood trends, goals, period selector — v1.0
- ✓ **Astrology (full suite)** — Natal chart, transits, Solar Return, synastry, forecast, calendar, history — v1.0
- ✓ **Numerology** — Life path/destiny/soul, sub-number breakdown, compatibility — v1.0
- ✓ **Drawing Analysis** — Upload/canvas, Koppitz/FDM, annotated viewer, compare, concepts — v1.0
- ✓ **Graphology** — Upload analysis, timeline, compare, PDF export, reminders, quick stats — v1.0
- ✓ **AI Coach** — Chat interface, journey system, cross-analysis context — v1.0
- ✓ **Synthesis** — Cross-tool AI synthesis, on-demand and weekly reports — v1.0
- ✓ **Tracking** — Mood tracker, journal, goals, daily insights, notifications — v1.0
- ✓ **Additional Tools** — Tarot, Human Design, palmistry, compatibility, timing, dream, personality, career, relationships, document — v1.0
- ✓ **History** — Filterable list, timeline, side-by-side compare — v1.0
- ✓ **Growth** — Referral program, blog, tutorials, astrology/drawing tutors — v1.0
- ✓ **Export/Share** — PDF export, social sharing via link — v1.0
- ✓ **UX** — RTL Hebrew, dark/light theme, responsive, PWA, animations, loading states, error boundaries, breadcrumbs, analytics dashboard — v1.0
- ✓ **Subscription** — Stripe 3-tier pricing, checkout, webhook idempotency, usage enforcement, management — v1.0
- ✓ **UI Overhaul** — MD3 dark cosmic theme, glassmorphism, nebula gradients, Plus Jakarta Sans typography — v1.0

### Validated (v1.2)

- ✓ **Tarot Content** — 78 cards with rich metadata (Kabbalah, astrology, numerology, archetypes) + 4 spread layouts — v1.2
- ✓ **Astrology Dictionary** — 12 zodiac, 10 planets, 12 houses, 7 aspects with full Hebrew descriptions — v1.2
- ✓ **Dream Emotions** — 12-emoji toggle grid replacing free-text input — v1.2
- ✓ **Blog Content** — 3 rich Hebrew articles from DB with detail pages — v1.2
- ✓ **Prompt Enrichment** — All 21 LLM prompts personalized with name, zodiac, life path, Kabbalistic tone — v1.2

### Active

(Defined in REQUIREMENTS.md — see milestone v1.3)

## Current Milestone: v1.3 Mystical UX & Coach Prominence

**Goal:** להפוך את MystiQor לחוויה מיסטית אותנטית עם צ'אט AI בולט ונגיש, ניווט פשוט ואינטואיטיבי, וויזואלים שגורמים למשתמש להרגיש שהוא נכנס לעולם מיסטי אמיתי.

**Target features:**
- תיקון ניגודיות טקסט — צבעי variant שנבלעים ברקע הכהה
- אווירה מיסטית — טקסטים זוהרים, אנימציות קוסמיות, סמלים ואייקונים מיסטיים
- מאמן AI בולט — בועה צפה בכל עמוד + עמוד מלא לשיחות עמוקות
- ניווט פשוט — טאבים תחתונים במובייל, סרגל צד מפושט בדסקטופ
- פשטות — חוויה אינטואיטיבית לאנשים פשוטים

## Previous Milestone: v1.2 Rich Content & Soul (SHIPPED 2026-03-29)

All rich content data migrated from original BASE44 system + personal AI soul injected into every prompt.

### Out of Scope

- אפליקציה מובייל native — Web-first, PWA מספיק
- Multi-language (EN) — עברית בלבד
- Real-time collaboration — לא נדרש
- Video/audio content — טקסט ותמונות בלבד
- Self-hosted deployment — Vercel בלבד

## Context

### Tech Stack (Current)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript strict (~27,300 LOC)
- **Database:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling:** Tailwind CSS + shadcn/ui + MD3 dark cosmic design system
- **State:** React Query (server) + Zustand (client)
- **Payments:** Stripe (checkout, webhooks, subscription management)
- **Astrology:** astronomy-engine (real ephemeris calculations)
- **Deployment:** Vercel + PWA

### Known Tech Debt
- INFRA-05: database.ts is manual, not auto-generated from Supabase schema
- Rate limiting only on usage route, not individual tool LLM endpoints

## Constraints

- **Tech Stack:** Next.js 14+ (App Router) + TypeScript strict + Supabase + Tailwind + shadcn/ui
- **Language:** עברית בלבד, RTL, תיעוד בעברית
- **Deployment:** Vercel
- **Security:** RLS על כל טבלה, validation על כל mutation, אין secrets בקליינט
- **Performance:** max 300 שורות לקובץ, lazy loading, pagination
- **Code Quality:** zero `any`, JSDoc בעברית, Zod validation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14+ App Router | SSR, routing, API routes built-in, production-ready | ✓ Good |
| Supabase במקום BASE44 | PostgreSQL + Auth + RLS + Realtime + Storage | ✓ Good |
| TypeScript strict | Type safety, refactoring confidence, better DX | ✓ Good |
| שימוש חוזר בלוגיקה מ-BASE44 | 34 backend functions + UI patterns — לא בונים מאפס | ✓ Good |
| shadcn/ui (מהמקור) | כבר בשימוש במקור, RTL compatible | ✓ Good |
| React Query + Zustand | כבר בשימוש חלקי במקור, proven pattern | ✓ Good |
| astronomy-engine | Real ephemeris instead of LLM approximation | ✓ Good |
| MD3 dark cosmic design | Glassmorphism + nebula gradients — distinctive brand | ✓ Good |
| Stripe 3-tier subscription | Free 3/month, Basic ₪49, Premium ₪99 unlimited | ✓ Good |
| Phase 12 gap closure | Integration audit revealed 6 wiring gaps, all fixed in one phase | ✓ Good |
| getPersonalContext helper | Single shared helper for all 21 routes — DRY, consistent personalization | ✓ Good |
| Tiered prompt enrichment | DEEP/MEDIUM/BASIC tiers — right effort per route complexity | ✓ Good |
| Static data constants | Tarot, astrology, blog data as TS constants + sync scripts — fast, typed, testable | ✓ Good |

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
*Last updated: 2026-03-29 after v1.3 milestone start*
