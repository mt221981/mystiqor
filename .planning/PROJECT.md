# MystiQor — פלטפורמת ניתוח מיסטי-פסיכולוגי אישי

## What This Is

MystiQor היא פלטפורמה מקיפה לניתוח אישי המשלבת כלים מיסטיים ופסיכולוגיים — אסטרולוגיה (כולל אפמריס אמיתי), נומרולוגיה, ניתוח ציורים, גרפולוגיה, טארוט, Human Design, palmistry ועוד — עם AI Coach שמסנתז תובנות מכל הכלים לתמונה אחת שלמה. עם מנוי Stripe, PWA, ועיצוב MD3 כהה-קוסמי. בנויה ב-Next.js 14 + TypeScript strict + Supabase, בעברית (RTL).

## Core Value

**ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים** — אסטרולוגיה, נומרולוגיה, ציורים, גרפולוגיה — עם AI שמסנתז את הכל לתובנות אישיות אחודות. לא כלים בודדים, אלא תמונה שלמה.

## Current State

**All milestones shipped** (v1.0 - v1.5, 2026-03-25 to 2026-04-07)

- v1.0: 12 phases, 66 plans — full MVP with 16 tools, AI coach, Stripe, PWA
- v1.1: 5 phases, 7 plans — onboarding fix, Hebrew typography, icon migration, CSS polish, animations
- v1.2: 4 phases, 13 plans — rich content layer + personalized AI soul
- v1.3: 4 phases, 10 plans — atmospheric UX, floating coach, mobile tabs, accessibility
- v1.4: 5 phases, 7 plans — Lucide icon system, holistic sidebar, dashboard tool cards
- v1.5: 2 phases, 4 plans — usage guard, LLM resilience, WCAG/RTL/ARIA, empty states
- 344 source files, ~48,600 LOC TypeScript
- Unified Lucide icon system across sidebar (29 icons) and 17 tool page headers
- Holistic sidebar with backdrop-blur, MystiQorLogo SVG, dramatic gradient active state
- Dashboard ToolCard renders tool.name + tool.description for hero and grid variants
- Usage quota guard on all 24 tool routes before LLM — no cost overruns
- OpenAI timeout 9s + retry 2x + Hebrew error messages (5 error types mapped)
- RTL margins clean, WCAG AA contrast verified (10.43:1), ARIA on coach tabs
- EmptyState with CTA for coach + history, mobile-responsive astrology forms
- Floating AI coach bubble on every page with breathing animation + context-aware opener messages
- 22 tool pages with atmospheric StandardSectionHeader, pageEntry animation, mystical Hebrew loading
- WCAG AA contrast on all secondary text + global z-index scale + prefers-reduced-motion
- Mobile bottom tab bar (5 tabs) + sidebar reorganized from 8 to 6 categories
- All 8/8 v1.4 requirements satisfied

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

### Validated (v1.1)

- ✓ **Onboarding** — OnboardingWizard hydration fixed, all 4 steps to dashboard — v1.1
- ✓ **Typography** — Heebo Hebrew font on all text, English display terms translated — v1.1
- ✓ **Icons** — All icons migrated to react-icons/gi thematic set — v1.1
- ✓ **CSS Polish** — GlassCard/NebulaButton variants, mystic-hover, text-gradient-gold — v1.1
- ✓ **Animations** — MysticSkeleton shimmer + ProgressiveReveal stagger — v1.1

### Validated (v1.3)

- ✓ **Accessibility** — WCAG AA contrast on all secondary text, global z-index scale, prefers-reduced-motion — v1.3
- ✓ **Floating Coach** — Breathing bubble on all pages, smart opener messages, per-message context injection — v1.3
- ✓ **Mobile Navigation** — 5 bottom tabs (dashboard, coach, insights, tools, profile) — v1.3
- ✓ **Atmospheric UX** — StandardSectionHeader with glow, pageEntry animation, mystical Hebrew loading phrases, glowing AI headings on all 22 tool pages — v1.3
- ✓ **Sidebar Polish** — Categories merged from 8 to 6, localStorage persistence for collapse state — v1.3

### Validated (v1.4)

- ✓ **Icon System** — 36 files migrated to Lucide, react-icons fully removed, centralized tool-icons mapping — v1.4
- ✓ **Sidebar** — Holistic redesign with backdrop-blur, MystiQorLogo SVG, dramatic gradient active state, hover states — v1.4
- ✓ **Dashboard Cards** — ToolCard renders tool.name + tool.description for all variants — v1.4

### Validated (v1.5)

- ✓ **Usage Guard** — checkUsageQuota() wired into all 24 tool routes before LLM calls — v1.5
- ✓ **LLM Resilience** — OpenAI timeout 9s + retry 2x + 5 Hebrew error mappings — v1.5
- ✓ **Response Validation** — Zod schemas on tarot/palmistry/dream + DB insert error handling on 22 routes — v1.5
- ✓ **RTL/Contrast/ARIA** — 12 RTL fixes, 3 WCAG AA fixes, coach tab ARIA roles — v1.5
- ✓ **UX** — EmptyState for coach/history, mobile-responsive forms, coach context limit(10) — v1.5

### Active (v1.6 Enriched Experience)

- [ ] **PROF-01**: טפסי כלים ממולאים אוטומטית מפרופיל המשתמש — שם, תאריך לידה, מיקום
- [ ] **NUM-01**: תוצאות נומרולוגיה מציגות אותיות עבריות, ספירות, כותרות ומילות מפתח ויזואלית
- [ ] **NUM-02**: סינתזת AI עמוקה יותר (3000 tokens) מוצגת כמגילה מסכמת
- [ ] **JOUR-01**: מסע אישי מורם בסיידבר — מעל כלים נוספים
- [ ] **JOUR-02**: ויג'ט מסע בדשבורד עם התקדמות וצעד הבא
- [ ] **JOUR-03**: עמוד מסע עצמאי ב-/journey

## Current Milestone: v1.6 Enriched Experience

**Goal:** העשרת חוויית המשתמש — פרופיל קבוע, נומרולוגיה עשירה, מסע אישי בולט

### Out of Scope

- אפליקציה מובייל native — Web-first, PWA מספיק
- Multi-language (EN) — עברית בלבד
- Real-time collaboration — לא נדרש
- Video/audio content — טקסט ותמונות בלבד
- Self-hosted deployment — Vercel בלבד

## Context

### Tech Stack (Current)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript strict (~48,600 LOC)
- **Database:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling:** Tailwind CSS + shadcn/ui + MD3 dark cosmic design system
- **State:** React Query (server) + Zustand (client)
- **Payments:** Stripe (checkout, webhooks, subscription management)
- **Astrology:** astronomy-engine (real ephemeris calculations)
- **Deployment:** Vercel + PWA

### Known Tech Debt
- INFRA-05: database.ts is manual, not auto-generated from Supabase schema
- Rate limiting only on usage route, not individual tool LLM endpoints
- DrawingAnalysisForm + BigFiveQuestionnaire bypass MysticLoadingText pulse animation (cosmetic)
- 3 phases (22, 23, 25) missing VERIFICATION.md (code verified by integration checker)
- Dual icon libraries: lucide-react (sidebar/headers) + @phosphor-icons/react (dashboard cards)

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
| CSS custom property z-index | 10-level --z-* scale prevents z-index collision across coach, nav, modals | ✓ Good |
| Shared coach API service | services/coach/api.ts consumed by both full page and floating panel | ✓ Good |
| StandardSectionHeader | Single atmospheric header component for all 22 tool pages — DRY, consistent | ✓ Good |
| Per-message context injection | Coach fetches 5 recent analyses on every POST — always up-to-date | ✓ Good |
| Lucide for nav, Phosphor for cards | Lucide icons in sidebar/headers, Phosphor duotone in dashboard cards — each suited to its context | — Pending |
| Unified ToolCard with variants | Single ToolCard component with hero/grid variants instead of separate HeroToolCard | ✓ Good |
| Retroactive verification | Gap closure phase (30) to verify code-complete requirements without re-executing | ✓ Good |

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
*Last updated: 2026-04-07 after v1.6 milestone start*
