# Milestones

## v1.4 UI Polish & Visual Identity (Shipped: 2026-04-06)

**Phases completed:** 3 phases, 6 plans, 8 tasks

**Key accomplishments:**

- Centralized tool-icons.ts mapping with 17 Lucide icons and 7 shared infrastructure files migrated from react-icons/gi
- All 17 tool page files migrated from react-icons/gi to lucide-react -- each header icon now matches the centralized sidebar mapping
- Migrated final 12 files (astrology sub-pages, learn pages, insight components) and fully removed react-icons dependency -- 100% Lucide coverage
- Retroactive summary created during Phase 30 gap closure. Phase 27 was applied to Sidebar.tsx but execution was not formally tracked.

---

## v1.1 UI Polish (Shipped: 2026-04-02)

**Phases completed:** 5 phases, 7 plans | **Timeline:** 9 days (2026-03-25 - 2026-04-02)
**Requirements:** 16/16 satisfied

**Key accomplishments:**

- Fixed OnboardingWizard Zustand hydration bug — new users can complete all 4 steps and reach dashboard
- Heebo Hebrew font propagated to all text (including SVG) + English display terms replaced with Hebrew across 7 files
- All icons migrated to react-icons/gi thematic set — tool pages, dashboard StatCards, header, InsightHeroCard, learn pages
- GlassCard mystic/gold variants + NebulaButton gold + mystic-hover on 16 tool pages + text-gradient-gold titles
- MysticSkeleton shimmer loading + ProgressiveReveal stagger animation across 21 files

---

## v1.2 Rich Content & Soul (Shipped: 2026-03-29)

**Phases completed:** 4 phases, 13 plans | **Timeline:** 2 days (2026-03-28 - 2026-03-29)
**Requirements:** 5/5 satisfied

**Key accomplishments:**

- 78 tarot cards with rich metadata (Kabbalah, astrology, numerology, archetypes) + 4 spread layouts + sync script + UI components
- Astrology knowledge base — 12 zodiac signs, 10 planets, 12 houses, 7 aspects with full Hebrew descriptions and dictionary display
- Dream emotion 12-emoji toggle grid + 3 rich Hebrew blog articles seeded from DB with detail pages
- All 21 LLM prompts enriched with personalization (name, zodiac, life path, Kabbalistic tone) via tiered DEEP/MEDIUM/BASIC system

---

## v1.3 Mystical UX & Coach Prominence (Shipped: 2026-04-01)

**Phases completed:** 4 phases, 10 plans | **Timeline:** 3 days (2026-03-29 - 2026-04-01)
**Files changed:** 91 (+2,304 / -604 lines) | **Requirements:** 15/15 satisfied

**Key accomplishments:**

- Global z-index scale (10 levels as CSS custom properties) + WCAG prefers-reduced-motion silencer across all animations
- WCAG AA contrast fixes on 39 components — all secondary text now readable on dark backgrounds (4.5:1+ ratio)
- Floating AI coach bubble with breathing animation + smart context-aware opener messages on every authenticated page
- Mobile bottom tab bar (5 tabs: dashboard, coach, insights, tools, profile) as primary mobile navigation
- Atmospheric depth on all 22 tool pages — StandardSectionHeader with celestial glow, pageEntry animation, mystical Hebrew loading phrases, glowing AI result headings
- Per-message coach context injection (5 recent analyses with Hebrew tool names + relative time) + sidebar reorganized from 8 to 6 categories with localStorage persistence

**Tech debt accepted:**

- 3 phases missing VERIFICATION.md (code verified by integration checker)
- 2 child components (DrawingAnalysisForm, BigFiveQuestionnaire) bypass MysticLoadingText pulse animation

---

## v1.0 MystiQor MVP (Shipped: 2026-03-25)

**Phases completed:** 12 phases, 66 plans, 118 tasks

**Key accomplishments:**

- Full TypeScript strict Next.js 14 + Supabase app with Stripe 3-tier subscription, PWA, and MD3 dark cosmic theme
- 16 mystical/psychological analysis tools (astrology with real ephemeris, numerology, tarot, drawing analysis, graphology, AI coach, and more)
- AI Coach with cross-analysis synthesis and personalized journey system
- Dashboard with biorhythm chart, daily insights, mood/journal/goals tracking, and analytics
- PDF export, social sharing, referral program, and blog/tutorial content

---
