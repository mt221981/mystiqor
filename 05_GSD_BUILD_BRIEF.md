# 05_GSD_BUILD_BRIEF.md — Build Plan

> **תאריך:** 2026-03-20
> **מבוסס על:** 01-04 (Map, RE, Architecture, PRD)
> **סדר בנייה:** לפי גרף תלויות (02_RE §3) — Level 0 → Level 6

---

## Overview: 6 Phases

| Phase | Name | Files | Focus | Checkpoint |
|-------|------|-------|-------|------------|
| **0** | Foundation | ~35 | Setup, config, auth, base layout, types | `tsc` + `build` = 0 errors |
| **1** | Core Infrastructure | ~30 | DB types, services, API skeleton, base UI | All services typed, API routes respond |
| **2** | Core Features | ~45 | Main mystical tools (Numerology, Astrology, Drawing, etc.) | 10 tools working end-to-end |
| **3** | Advanced Features | ~35 | AI Coach, Goals, Mood, Journal, Insights, Synthesis | Personal journey features complete |
| **4** | Integrations & Account | ~25 | Stripe, Email, Referrals, Notifications, Learning | Payments + emails working |
| **5** | Polish & QA | ~15 | Performance, accessibility, migration, testing, final QA | FINAL SCORE ≥ 85 |
| **TOTAL** | | **~185** | | |

---

## Phase 0: Foundation

**Goal:** Project setup, configuration, auth flow, base layout, type system — everything needed before any feature code.

### Files to Create (in order)

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `package.json` | 🔴 NEW | Next.js 14+, TypeScript, Supabase, shadcn/ui, React Query, Zustand, Zod, Stripe, Recharts, framer-motion |
| 2 | `tsconfig.json` | 🔴 NEW | Strict mode, paths aliases (@/*), target ES2022 |
| 3 | `next.config.ts` | 🔴 NEW | Images (supabase domain), experimental features |
| 4 | `tailwind.config.ts` | 🟡 FROM `tailwind.config.js` | Convert to TS, keep theme variables + dark mode |
| 5 | `postcss.config.js` | 🟢 KEEP | Tailwind + autoprefixer |
| 6 | `components.json` | 🟡 FROM `components.json` | Update for TSX, new-york style |
| 7 | `.env.local.example` | 🔴 NEW | All env vars documented |
| 8 | `.eslintrc.json` | 🔴 NEW | Next.js + TypeScript rules |
| 9 | `.gitignore` | 🟡 UPDATE | Add .env.local, .next, node_modules |
| 10 | `src/app/layout.tsx` | 🔴 NEW | Root layout: RTL, Hebrew fonts, theme, metadata |
| 11 | `src/app/globals.css` | 🟡 FROM `src/index.css` | Keep CSS variables, add Tailwind directives |
| 12 | `src/app/loading.tsx` | 🔴 NEW | Global loading spinner |
| 13 | `src/app/not-found.tsx` | 🟡 FROM `PageNotFound.jsx` | TypeScript, simplified |
| 14 | `src/app/error.tsx` | 🔴 NEW | Root error boundary (GEM 10 pattern) |
| 15 | `src/middleware.ts` | 🔴 NEW | Supabase auth check, redirect logic |
| 16 | `src/lib/supabase/client.ts` | 🔴 NEW | Browser Supabase client |
| 17 | `src/lib/supabase/server.ts` | 🔴 NEW | Server Supabase client (cookies) |
| 18 | `src/lib/supabase/middleware.ts` | 🔴 NEW | Middleware helper for auth refresh |
| 19 | `src/lib/supabase/admin.ts` | 🔴 NEW | Service role client (webhooks) |
| 20 | `src/types/database.ts` | 🔴 NEW | Generated Supabase types (`supabase gen types`) |
| 21 | `src/types/analysis.ts` | 🔴 NEW | AnalysisResult, InsightType, ToolType unions |
| 22 | `src/types/astrology.ts` | 🔴 NEW | Planet, Aspect, House, Sign, ZodiacSign |
| 23 | `src/types/numerology.ts` | 🔴 NEW | NumerologyResult, GematriaResult |
| 24 | `src/types/subscription.ts` | 🔴 NEW | PlanType, SubscriptionStatus, PlanInfo |
| 25 | `src/lib/utils/cn.ts` | 🟢 FROM `lib/utils.js` | clsx + tailwind-merge (keep as-is + add types) |
| 26 | `src/lib/utils/dates.ts` | 🔴 NEW | Israeli date formatting helpers |
| 27 | `src/lib/utils/sanitize.ts` | 🔴 NEW | XSS prevention (DOMPurify wrapper) |
| 28 | `src/lib/utils/llm-response.ts` | 🟢 FROM `AskQuestion.jsx` | GEM 5: forceToString + cleanArray (typed) |
| 29 | `src/lib/constants/astrology.ts` | 🟢 FROM `BirthChart.jsx` | GEM 6: ZODIAC_SIGNS, PLANET_SYMBOLS, HOUSE_MEANINGS, ASPECT_TYPES |
| 30 | `src/lib/constants/plans.ts` | 🟢 FROM `useSubscription.jsx` | PLAN_INFO typed |
| 31 | `src/lib/constants/categories.ts` | 🔴 NEW | Goal categories, mood types, insight types, tag translations |
| 32 | `src/lib/animations/presets.ts` | 🟢 FROM `AdvancedAnimations.jsx` | GEM 11: animations, transitions, hoverEffects |
| 33 | `src/lib/query/cache-config.ts` | 🟢 FROM `CachedQuery.jsx` | GEM 8: CACHE_TIMES + query factory hooks |
| 34 | `src/lib/validations/auth.ts` | 🔴 NEW | Login, register, reset password Zod schemas |
| 35 | `src/lib/validations/profile.ts` | 🔴 NEW | Profile, onboarding Zod schemas |
| 36 | `src/stores/theme.ts` | 🟡 FROM `ThemeContext.jsx` | Zustand store: dark/light + localStorage |
| 37 | `src/hooks/useMobile.ts` | 🟢 FROM `use-mobile.jsx` | MediaQuery hook, typed |
| 38 | `src/hooks/useDebounce.ts` | 🟢 FROM `useDebounce.jsx` | GEM: debounce + throttle hooks, typed |
| 39 | `src/app/(public)/login/page.tsx` | 🔴 NEW | Login page with Supabase Auth |
| 40 | `src/app/(auth)/layout.tsx` | 🔴 NEW | Auth layout with sidebar + header |
| 41 | `src/components/layouts/Sidebar.tsx` | 🟡 FROM `Layout.jsx` | Extract sidebar (< 300 lines), typed |
| 42 | `src/components/layouts/Header.tsx` | 🟡 FROM `Layout.jsx` | Extract header bar |
| 43 | `src/components/layouts/MobileNav.tsx` | 🟡 FROM `Layout.jsx` | Extract mobile hamburger |
| 44 | `src/components/layouts/PageHeader.tsx` | 🟡 FROM `PageHeader.jsx` | Typed props + breadcrumbs |
| 45 | `src/components/common/LoadingSpinner.tsx` | 🟡 FROM `LoadingSpinner.jsx` | Typed, simplified |
| 46 | `src/components/common/EmptyState.tsx` | 🟡 FROM `EmptyState.jsx` | Single consolidated version |
| 47 | `src/components/common/ErrorBoundary.tsx` | 🟡 FROM `AdvancedErrorBoundary.jsx` | GEM 10: auto-recovery, typed |
| 48 | `src/components/common/Breadcrumbs.tsx` | 🟡 FROM `Breadcrumbs.jsx` | Typed |
| 49 | `src/components/common/PageTransition.tsx` | 🟡 FROM `PageTransition.jsx` | Typed |

**shadcn/ui Components (generated via CLI — not manually coded):**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label textarea select badge dialog sheet tabs accordion alert avatar breadcrumb calendar checkbox collapsible command dropdown-menu form hover-card navigation-menu pagination popover progress radio-group scroll-area separator skeleton slider switch table toast toggle tooltip sonner
```

### Phase 0 Checkpoint
- [ ] `npm run dev` starts without errors
- [ ] `tsc --noEmit` = 0 errors
- [ ] `npm run build` = 0 errors
- [ ] Login/logout flow works with Supabase Auth
- [ ] Sidebar navigation renders with RTL
- [ ] Dark/light theme toggles
- [ ] Mobile responsive layout works
- [ ] All shadcn/ui components installed

---

## Phase 1: Core Infrastructure

**Goal:** Services layer, API route handlers, hooks, shared form components — the "plumbing" that features plug into.

### Files to Create

| # | File | Action | Description |
|---|------|--------|-------------|
| 50 | `src/services/geocode.ts` | 🟡 FROM `geocodeLocation/entry.ts` | Nominatim wrapper, typed |
| 51 | `src/services/analysis/llm.ts` | 🔴 NEW | LLM invocation wrapper (OpenAI/Anthropic) |
| 52 | `src/services/analysis/rule-engine.ts` | 🟢 FROM `ruleEngine/entry.ts` | GEM 3: evaluateCondition, typed |
| 53 | `src/services/numerology/gematria.ts` | 🟢 FROM `calculateNumerologyCompatibility` | GEM 2: GEMATRIA, cleanHebrewText, calculateGematria |
| 54 | `src/services/numerology/calculations.ts` | 🟢 FROM `calculateNumerologyCompatibility` | GEM 2: reduceToSingleDigit, calculateLifePath, calculateNumerologyNumbers |
| 55 | `src/services/numerology/compatibility.ts` | 🟢 FROM `calculateNumerologyCompatibility` | GEM 2: COMPATIBILITY_MATRIX + scoring |
| 56 | `src/services/astrology/solar-return.ts` | 🟢 FROM `calculateSolarReturn` | GEM 1: VSOP87, binary search, chart assembly |
| 57 | `src/services/astrology/aspects.ts` | 🟢 FROM `calculateSolarReturn` | GEM 14: aspect calculation + element/modality |
| 58 | `src/services/astrology/chart.ts` | 🟡 FROM `calculateSolarReturn` | Full chart assembly (extract from monolith) |
| 59 | `src/services/astrology/prompts/interpretation.ts` | 🟢 FROM `interpretAstrology` | GEM 12: v6.0 interpretation prompt template |
| 60 | `src/services/astrology/prompts/solar-return.ts` | 🟢 FROM `interpretSolarReturn` | SR interpretation prompt |
| 61 | `src/services/astrology/prompts/transits.ts` | 🟢 FROM `interpretTransits` | Transit interpretation prompt |
| 62 | `src/services/drawing/analysis.ts` | 🟡 FROM `processDrawingFeatures` | Drawing feature extraction (typed) |
| 63 | `src/services/email/welcome.ts` | 🟡 FROM `sendWelcomeEmail` | Resend template |
| 64 | `src/services/email/payment-failed.ts` | 🟡 FROM `sendPaymentFailedEmail` | Resend template |
| 65 | `src/services/email/usage-limit.ts` | 🟡 FROM `sendUsageLimitEmail` | Resend template |
| 66 | `src/lib/validations/analysis.ts` | 🔴 NEW | Zod schemas for all tool inputs |
| 67 | `src/lib/validations/subscription.ts` | 🔴 NEW | Subscription Zod schemas |
| 68 | `src/lib/validations/goals.ts` | 🔴 NEW | Goal Zod schemas |
| 69 | `src/lib/validations/mood.ts` | 🔴 NEW | Mood entry Zod schemas |
| 70 | `src/lib/validations/journal.ts` | 🔴 NEW | Journal Zod schemas |
| 71 | `src/hooks/useSubscription.ts` | 🟢 FROM `useSubscription.jsx` | GEM 7: Full hook, typed |
| 72 | `src/hooks/useAnalytics.ts` | 🟡 FROM various | Page view + tool usage tracking hook |
| 73 | `src/components/forms/BirthDataForm.tsx` | 🔴 NEW | Reusable: name + birth date/time/place |
| 74 | `src/components/forms/LocationSearch.tsx` | 🟡 FROM `Astrology.jsx` | Nominatim autocomplete, typed |
| 75 | `src/components/forms/FormInput.tsx` | 🟡 FROM `FormInput.jsx` | RHF + Zod integrated, typed |
| 76 | `src/components/features/subscription/SubscriptionGuard.tsx` | 🟡 FROM `SubscriptionGuard.jsx` | Typed |
| 77 | `src/components/features/subscription/UsageBar.tsx` | 🔴 NEW | Subscription usage progress bar |
| 78 | `src/components/features/subscription/PlanCard.tsx` | 🔴 NEW | Plan display card |
| 79 | `src/components/features/insights/ExplainableInsight.tsx` | 🟡 FROM `ExplainableInsight.jsx` | GEM 9: Provenance, typed |
| 80 | `src/components/features/insights/ConfidenceBadge.tsx` | 🟡 FROM `ConfidenceBadge.jsx` | Typed |
| 81 | `src/components/features/shared/ToolGrid.tsx` | 🟡 FROM `Home.jsx` | Tool grid component |
| 82 | `src/components/features/shared/AnalysisHistory.tsx` | 🟡 FROM `myanalyses.jsx` | Analysis list with filters |
| 83 | `src/app/api/geocode/route.ts` | 🔴 NEW | GET: location search proxy |
| 84 | `src/app/api/upload/route.ts` | 🔴 NEW | POST: file upload to Supabase Storage |
| 85 | `src/app/api/subscription/route.ts` | 🔴 NEW | GET: subscription status |
| 86 | `src/app/api/subscription/usage/route.ts` | 🔴 NEW | POST: increment usage |
| 87 | `src/app/api/analysis/route.ts` | 🔴 NEW | POST: create analysis (generic save) |
| 88 | `src/app/api/analysis/[id]/route.ts` | 🔴 NEW | GET: single analysis |
| 89 | `src/stores/onboarding.ts` | 🔴 NEW | Zustand: onboarding wizard state |

### Phase 1 Checkpoint
- [ ] `tsc --noEmit` = 0 errors
- [ ] `npm run build` = 0 errors
- [ ] All services compile and are importable
- [ ] API routes respond (geocode, upload, subscription, analysis)
- [ ] useSubscription hook returns correct data from Supabase
- [ ] BirthDataForm renders with validation
- [ ] LocationSearch returns geocoding results
- [ ] SubscriptionGuard blocks/allows correctly

---

## Phase 2: Core Features

**Goal:** All main mystical tools working end-to-end (Level 1-2 from dependency graph).

### Files to Create

| # | File | Action | Description |
|---|------|--------|-------------|
| **Onboarding** | | | |
| 90 | `src/app/(auth)/onboarding/page.tsx` | 🟡 FROM `Onboarding.jsx` | Multi-step wizard, typed |
| 91 | `src/components/features/onboarding/OnboardingWizard.tsx` | 🟡 FROM `OnboardingFlow.jsx` | 4-step form, typed |
| **Dashboard & Home** | | | |
| 92 | `src/app/(auth)/dashboard/page.tsx` | 🟡 FROM `Dashboard.jsx` | Stats + charts, typed |
| 93 | `src/app/(public)/page.tsx` | 🟡 FROM `Home.jsx` | Landing / logged-in home, typed |
| **Numerology** | | | |
| 94 | `src/app/api/tools/numerology/route.ts` | 🔴 NEW | POST: numerology calculation API |
| 95 | `src/app/(auth)/tools/numerology/page.tsx` | 🟡 FROM `Numerology.jsx` | Split into form + results (< 300 lines each) |
| 96 | `src/components/features/numerology/NumberCard.tsx` | 🟡 FROM `NumerologySummaryCard.jsx` | Number display, typed |
| **Astrology — Birth Chart** | | | |
| 97 | `src/app/api/tools/astrology/birth-chart/route.ts` | 🔴 NEW | POST: birth chart calculation |
| 98 | `src/app/api/tools/astrology/interpret/route.ts` | 🔴 NEW | POST: AI interpretation |
| 99 | `src/app/(auth)/tools/astrology/page.tsx` | 🟡 FROM `Astrology.jsx` | Birth chart page, typed |
| 100 | `src/components/features/astrology/BirthChart/index.tsx` | 🟡 FROM `BirthChart.jsx` | Main chart container (< 200 lines) |
| 101 | `src/components/features/astrology/BirthChart/ZodiacRing.tsx` | 🔴 NEW | SVG zodiac ring (extracted) |
| 102 | `src/components/features/astrology/BirthChart/PlanetPositions.tsx` | 🔴 NEW | Planet dots on circle (GEM 6 math) |
| 103 | `src/components/features/astrology/BirthChart/AspectLines.tsx` | 🔴 NEW | Lines connecting planets |
| 104 | `src/components/features/astrology/BirthChart/HouseOverlay.tsx` | 🔴 NEW | House divisions |
| **Astrology — Solar Return** | | | |
| 105 | `src/app/api/tools/astrology/solar-return/route.ts` | 🔴 NEW | POST: SR calculation |
| 106 | `src/app/(auth)/tools/astrology/solar-return/page.tsx` | 🟡 FROM `SolarReturn.jsx` | SR page, typed |
| **Astrology — Transits** | | | |
| 107 | `src/app/api/tools/astrology/transits/route.ts` | 🔴 NEW | POST: transit calculation (REBUILD) |
| 108 | `src/app/(auth)/tools/astrology/transits/page.tsx` | 🟡 FROM `Transits.jsx` | Transits page, typed |
| **Astrology — Synastry** | | | |
| 109 | `src/app/(auth)/tools/astrology/synastry/page.tsx` | 🟡 FROM `Synastry.jsx` | Synastry page, typed |
| **Astrology — Readings** | | | |
| 110 | `src/app/api/tools/astrology/readings/route.ts` | 🔴 NEW | POST: generate reading |
| 111 | `src/app/(auth)/tools/astrology/readings/page.tsx` | 🟡 FROM `AstrologyReadings.jsx` | Readings page, typed |
| 112 | `src/components/features/astrology/ReadingCard.tsx` | 🟡 FROM `AstrologyReadingCard.jsx` | Split from 1206 → < 300 lines |
| **Graphology** | | | |
| 113 | `src/app/api/tools/graphology/route.ts` | 🔴 NEW | POST: handwriting analysis |
| 114 | `src/app/(auth)/tools/graphology/page.tsx` | 🟡 FROM `Graphology.jsx` | Graphology page, typed |
| 115 | `src/components/features/graphology/Comparison.tsx` | 🟡 FROM `GraphologyComparison.jsx` | Radar chart comparison |
| 116 | `src/components/features/graphology/QuickStats.tsx` | 🟡 FROM `GraphologyQuickStats.jsx` | Key metrics |
| **Drawing Analysis** | | | |
| 117 | `src/app/api/tools/drawing/route.ts` | 🔴 NEW | POST: drawing analysis |
| 118 | `src/app/(auth)/tools/drawing/page.tsx` | 🟡 FROM `DrawingAnalysis.jsx` | Drawing page, typed |
| 119 | `src/components/features/drawing/DigitalCanvas.tsx` | 🟡 FROM `DigitalCanvas.jsx` | GEM: Canvas with pressure tracking |
| 120 | `src/components/features/drawing/AnnotatedViewer.tsx` | 🟡 FROM `AnnotatedDrawingViewer.jsx` | Split (< 300 lines) |
| 121 | `src/components/features/drawing/KoppitzIndicators.tsx` | 🟡 FROM `KoppitzIndicatorsVisualization.jsx` | Typed |
| 122 | `src/components/features/drawing/MetricsBreakdown.tsx` | 🟡 FROM `QuantitativeDrawingMetrics.jsx` | Split (< 300 lines) |
| **Palmistry** | | | |
| 123 | `src/app/api/tools/palmistry/route.ts` | 🔴 NEW | POST: palm analysis |
| 124 | `src/app/(auth)/tools/palmistry/page.tsx` | 🟡 FROM `Palmistry.jsx` | Palmistry page, typed |
| **Tarot** | | | |
| 125 | `src/app/api/tools/tarot/route.ts` | 🔴 NEW | POST: tarot reading |
| 126 | `src/app/(auth)/tools/tarot/page.tsx` | 🟡 FROM `Tarot.jsx` | Tarot page, typed |
| **Human Design** | | | |
| 127 | `src/app/api/tools/human-design/route.ts` | 🔴 NEW | POST: HD calculation |
| 128 | `src/app/(auth)/tools/human-design/page.tsx` | 🟡 FROM `HumanDesign.jsx` | HD page, typed |
| **Dream** | | | |
| 129 | `src/app/api/tools/dream/route.ts` | 🔴 NEW | POST: dream interpretation |
| 130 | `src/app/(auth)/tools/dream/page.tsx` | 🟡 FROM `DreamAnalysis.jsx` | Dream page, typed |
| **Compatibility** | | | |
| 131 | `src/app/api/tools/compatibility/route.ts` | 🔴 NEW | POST: compatibility |
| 132 | `src/app/(auth)/tools/compatibility/page.tsx` | 🟡 FROM `Compatibility.jsx` | Compatibility page, typed |
| **Career** | | | |
| 133 | `src/app/api/tools/career/route.ts` | 🔴 NEW | POST: career guidance |
| 134 | `src/app/(auth)/tools/career/page.tsx` | 🟡 FROM `CareerGuidance.jsx` | Career page, typed |
| **Question** | | | |
| 135 | `src/app/api/tools/question/route.ts` | 🔴 NEW | POST: ask question |
| 136 | `src/app/(auth)/tools/question/page.tsx` | 🟡 FROM `AskQuestion.jsx` | Question page, typed |

### Phase 2 Checkpoint
- [ ] `tsc --noEmit` = 0 errors
- [ ] `npm run build` = 0 errors
- [ ] Onboarding flow complete (4 steps → profile created)
- [ ] Dashboard shows stats from real data
- [ ] All 13 tool pages render + produce results
- [ ] Numerology gematria calculates correctly
- [ ] BirthChart SVG renders with planet positions
- [ ] Solar Return binary search finds moment (±0.01°)
- [ ] Drawing analysis with Koppitz indicators displays
- [ ] SubscriptionGuard enforces limits
- [ ] PHASE SCORE ≥ 52/60

---

## Phase 3: Advanced Features

**Goal:** Personal journey features (Level 4-5 from dependency graph).

### Files to Create

| # | File | Action | Description |
|---|------|--------|-------------|
| **AI Coach** | | | |
| 137 | `src/app/api/coach/message/route.ts` | 🔴 NEW | POST: send message to AI coach |
| 138 | `src/app/api/coach/journey/route.ts` | 🔴 NEW | POST: generate coaching journey |
| 139 | `src/app/(auth)/coach/page.tsx` | 🟡 FROM `AICoach.jsx` | Chat + journeys, typed |
| 140 | `src/components/features/coach/ChatMessage.tsx` | 🟡 FROM `AICoach/ChatMessage.jsx` | Typed |
| 141 | `src/components/features/coach/ChatInput.tsx` | 🟡 FROM `AICoach/ChatInput.jsx` | Typed |
| 142 | `src/components/features/coach/JourneyCard.tsx` | 🟡 FROM `JourneyCard.jsx` | Typed |
| 143 | `src/stores/coach-chat.ts` | 🔴 NEW | Zustand: active conversation state |
| **Goals** | | | |
| 144 | `src/app/api/goals/route.ts` | 🔴 NEW | GET/POST: goals |
| 145 | `src/app/api/goals/[id]/route.ts` | 🔴 NEW | PATCH/DELETE: goal |
| 146 | `src/app/api/goals/[id]/recommendations/route.ts` | 🔴 NEW | POST: AI recommendations |
| 147 | `src/app/(auth)/goals/page.tsx` | 🟡 FROM `MyGoals.jsx` | Goals page, typed |
| 148 | `src/components/features/goals/GoalCard.tsx` | 🟡 FROM `GoalProgressWidget.jsx` | Typed |
| 149 | `src/components/features/goals/ProgressModal.tsx` | 🟡 FROM `GoalProgressModal.jsx` | Typed |
| **Mood Tracker** | | | |
| 150 | `src/app/(auth)/mood/page.tsx` | 🟡 FROM `MoodTracker.jsx` | Mood page, typed |
| **Journal** | | | |
| 151 | `src/app/(auth)/journal/page.tsx` | 🟡 FROM `Journal.jsx` | Journal page, typed |
| **Daily Insights** | | | |
| 152 | `src/app/api/insights/daily/route.ts` | 🔴 NEW | POST: generate daily insight |
| 153 | `src/app/(auth)/daily-insights/page.tsx` | 🟡 FROM `DailyInsights.jsx` | Insights page, typed |
| 154 | `src/components/features/insights/DailyInsightCard.tsx` | 🟡 FROM `DailyInsightCard.jsx` | Typed |
| **Synthesis** | | | |
| 155 | `src/app/api/tools/synthesis/route.ts` | 🔴 NEW | POST: mystic synthesis |
| 156 | `src/app/(auth)/tools/synthesis/page.tsx` | 🟡 FROM `MysticSynthesis.jsx` | Synthesis page, typed |
| **Personality** | | | |
| 157 | `src/app/api/tools/personality/route.ts` | 🔴 NEW | POST: personality analysis |
| 158 | `src/app/(auth)/tools/personality/page.tsx` | 🟡 FROM `PersonalityAnalysis.jsx` | Personality page, typed |
| **Document Analyzer** | | | |
| 159 | `src/app/api/tools/document/route.ts` | 🔴 NEW | POST: document analysis |
| 160 | `src/app/(auth)/tools/document/page.tsx` | 🟡 FROM `DocumentAnalyzer.jsx` | Document page, typed |
| **History** | | | |
| 161 | `src/app/(auth)/history/page.tsx` | 🟡 FROM `myanalyses.jsx` | All analyses, typed |
| 162 | `src/app/(auth)/history/compare/page.tsx` | 🟡 FROM `CompareAnalyses.jsx` | Comparison page, typed |
| **Relationships** | | | |
| 163 | `src/app/(auth)/tools/relationships/page.tsx` | 🟡 FROM `RelationshipAnalysis.jsx` | Relationship analysis, typed |

### Phase 3 Checkpoint
- [ ] `tsc --noEmit` = 0 errors
- [ ] `npm run build` = 0 errors
- [ ] AI Coach chat works with Supabase Realtime
- [ ] Goals CRUD + AI recommendations working
- [ ] Mood tracker logs + auto AI analysis (≥6 entries)
- [ ] Journal CRUD + on-demand AI insights
- [ ] Daily insight generation works
- [ ] Synthesis combines multiple tool results
- [ ] Analysis history with comparison view
- [ ] PHASE SCORE ≥ 52/60

---

## Phase 4: Integrations & Account

**Goal:** Stripe payments, email notifications, learning features, account management.

### Files to Create

| # | File | Action | Description |
|---|------|--------|-------------|
| **Stripe** | | | |
| 164 | `src/app/api/webhooks/stripe/route.ts` | 🟢 FROM `stripeWebhook` | GEM 4: Webhook handler, typed |
| 165 | `src/app/api/subscription/checkout/route.ts` | 🟡 FROM `createCheckoutSession` | Stripe checkout, typed |
| 166 | `src/app/api/subscription/cancel/route.ts` | 🟡 FROM `cancelSubscription` | Cancel at period end |
| 167 | `src/app/(auth)/subscription/page.tsx` | 🟡 FROM `ManageSubscription.jsx` | Manage subscription, typed |
| 168 | `src/app/(auth)/subscription/success/page.tsx` | 🟡 FROM `SubscriptionSuccess.jsx` | Success page, typed |
| 169 | `src/app/(public)/pricing/page.tsx` | 🟡 FROM `Pricing.jsx` | Pricing page (SSG), typed |
| **Email (Cron)** | | | |
| 170 | `src/app/api/cron/daily-insights/route.ts` | 🟡 FROM `sendDailyInsights` | Cron: batch generate + email |
| 171 | `src/app/api/cron/reset-usage/route.ts` | 🔴 NEW | Cron: monthly usage reset |
| **Profile & Settings** | | | |
| 172 | `src/app/(auth)/profile/page.tsx` | 🟡 FROM `UserProfile.jsx` | Profile view, typed |
| 173 | `src/app/(auth)/profile/edit/page.tsx` | 🟡 FROM `EditProfile.jsx` | Profile edit, typed |
| 174 | `src/app/(auth)/settings/page.tsx` | 🟡 FROM `UserSettings.jsx` | Settings page, typed |
| **Guest Profiles** | | | |
| 175 | `src/app/(auth)/profiles/page.tsx` | 🟡 FROM `ManageProfiles.jsx` | Guest profiles, typed |
| **Notifications** | | | |
| 176 | `src/app/(auth)/notifications/page.tsx` | 🟡 FROM `Notifications.jsx` | Notifications, typed |
| **Referrals** | | | |
| 177 | `src/app/(auth)/referrals/page.tsx` | 🟡 FROM `Referrals.jsx` | Referrals page, typed |
| **Learning** | | | |
| 178 | `src/app/(auth)/learn/page.tsx` | 🟡 FROM `Tutorials.jsx` | Tutorials list, typed |
| 179 | `src/app/(auth)/learn/astrology/page.tsx` | 🟡 FROM `AstrologyTutor.jsx` | Astro tutor, typed |
| 180 | `src/app/(auth)/learn/drawing/page.tsx` | 🟡 FROM `DrawingTutor.jsx` | Drawing tutor, typed |
| **Blog** | | | |
| 181 | `src/app/(public)/blog/page.tsx` | 🟡 FROM `Blog.jsx` | Blog list (SSG) |
| 182 | `src/app/(public)/blog/[slug]/page.tsx` | 🔴 NEW | Single post (SSG) |
| **Analytics** | | | |
| 183 | `src/app/(auth)/analytics/page.tsx` | 🟡 FROM `AnalyticsDashboard.jsx` | Analytics, typed |
| **Timing Tools** | | | |
| 184 | `src/app/(auth)/tools/timing/page.tsx` | 🟡 FROM `TimingTools.jsx` | Timing analysis, typed |

### Phase 4 Checkpoint
- [ ] `tsc --noEmit` = 0 errors
- [ ] `npm run build` = 0 errors
- [ ] Stripe checkout → webhook → subscription active (end-to-end)
- [ ] Cancel subscription works (period end)
- [ ] Email templates render correctly (Hebrew + RTL)
- [ ] Profile edit + settings work
- [ ] Guest profiles CRUD works
- [ ] Referral code generation + sharing works
- [ ] Astrology tutor chat works
- [ ] Blog renders with SSG
- [ ] Monthly usage reset cron works
- [ ] PHASE SCORE ≥ 52/60

---

## Phase 5: Polish & QA

**Goal:** Performance optimization, accessibility, data migration, testing, final quality report.

### Files to Create

| # | File | Action | Description |
|---|------|--------|-------------|
| 185 | `src/components/common/SearchBar.tsx` | 🟡 FROM | Global search |
| 186 | `vitest.config.ts` | 🔴 NEW | Test configuration |
| 187 | `tests/services/numerology.test.ts` | 🔴 NEW | Numerology calculation tests |
| 188 | `tests/services/astrology.test.ts` | 🔴 NEW | Solar Return, aspects tests |
| 189 | `tests/services/rule-engine.test.ts` | 🔴 NEW | Rule engine tests |
| 190 | `tests/hooks/useSubscription.test.ts` | 🔴 NEW | Subscription hook tests |
| 191 | `tests/utils/llm-response.test.ts` | 🔴 NEW | forceToString tests |
| 192 | `scripts/migrate/export-base44.ts` | 🔴 NEW | Export from Base44 |
| 193 | `scripts/migrate/import-supabase.ts` | 🔴 NEW | Import to Supabase |
| 194 | `scripts/migrate/validate.ts` | 🔴 NEW | Data integrity validation |
| 195 | `PROGRESS.md` | 🔴 NEW | Build progress tracking |

### Phase 5 Tasks
1. **Performance audit:** Lighthouse, bundle analysis, dynamic imports for heavy components
2. **Accessibility audit:** ARIA labels, keyboard navigation, contrast, focus management
3. **RTL audit:** All pages checked for alignment issues
4. **Security audit:** RLS test (try accessing other user's data), input validation, XSS test
5. **Data migration:** Run scripts, validate, document in `07_MIGRATION_LOG.md`
6. **Test suite:** Core services (numerology, astrology, rule engine) + critical hooks
7. **Final QA:** Create `08_QA_REPORT.md` with FINAL SCORE

### Phase 5 Checkpoint
- [ ] `tsc --noEmit` = 0 errors
- [ ] `npm run build` = 0 errors
- [ ] Lighthouse > 90 (mobile + desktop)
- [ ] Initial JS < 200KB
- [ ] All tests pass
- [ ] RLS verified (can't access other user's data)
- [ ] Data migration complete (0 data loss)
- [ ] Accessibility audit passed
- [ ] FINAL SCORE ≥ 85/100

---

## Migration Matrix (Source → Target)

| # | Source File | Target File | Action | Logic to Keep | Improvements |
|---|-----------|-------------|--------|--------------|--------------|
| 1 | `calculateSolarReturn/entry.ts` | `services/astrology/solar-return.ts` | 🟢 KEEP | VSOP87, binary search, Placidus | TypeScript, extract JD utility |
| 2 | `calculateNumerologyCompatibility/entry.ts` | `services/numerology/*.ts` (3 files) | 🟢 KEEP | Gematria, life path, matrix | TypeScript, split into modules |
| 3 | `interpretAstrology/entry.ts` | `services/astrology/prompts/interpretation.ts` | 🟢 KEEP | v6.0 prompt template | TypeScript, Zod response validation |
| 4 | `processDrawingFeatures/entry.ts` | `services/drawing/analysis.ts` | 🟡 IMPROVE | Machover/Koppitz prompts | TypeScript, split prompts |
| 5 | `ruleEngine/entry.ts` | `services/analysis/rule-engine.ts` | 🟢 KEEP | evaluateCondition, weighting | TypeScript, strict operators |
| 6 | `stripeWebhook/entry.ts` | `app/api/webhooks/stripe/route.ts` | 🟢 KEEP | Signature verify, event handling | TypeScript, Supabase admin, idempotency |
| 7 | `BirthChart.jsx` | `components/features/astrology/BirthChart/` (5 files) | 🟡 IMPROVE | SVG math, constants | TypeScript, split into sub-components |
| 8 | `ExplainableInsight.jsx` | `components/features/insights/ExplainableInsight.tsx` | 🟡 IMPROVE | Provenance display, tag translations | TypeScript, Props interface |
| 9 | `useSubscription.jsx` | `hooks/useSubscription.ts` | 🟢 KEEP | Plan info, gating, optimistic updates | TypeScript |
| 10 | `CachedQuery.jsx` | `lib/query/cache-config.ts` | 🟢 KEEP | CACHE_TIMES, retry strategy, prefetch | TypeScript |
| 11 | `AdvancedAnimations.jsx` | `lib/animations/presets.ts` | 🟢 KEEP | 20+ animation variants | TypeScript |
| 12 | `AdvancedErrorBoundary.jsx` | `components/common/ErrorBoundary.tsx` | 🟡 IMPROVE | Auto-recovery pattern | TypeScript, Next.js error.tsx integration |
| 13 | `AskQuestion.jsx` (forceToString) | `lib/utils/llm-response.ts` | 🟢 KEEP | Robust LLM response cleaning | TypeScript, add tests |
| 14 | `Layout.jsx` | `components/layouts/Sidebar.tsx` + `Header.tsx` + `MobileNav.tsx` | 🟡 IMPROVE | RTL, navigation, theme | TypeScript, split from 614 lines |
| 15 | `Numerology.jsx` | `tools/numerology/page.tsx` + components | 🟡 IMPROVE | Calculation flow | TypeScript, split from 1332 lines |
| 16 | `Graphology.jsx` | `tools/graphology/page.tsx` + components | 🟡 IMPROVE | Analysis flow | TypeScript, split from 936 lines |
| 17 | `Tarot.jsx` | `tools/tarot/page.tsx` | 🟡 IMPROVE | Card draw + AI interpretation | TypeScript, cards to DB |
| 18 | `calculateTransits/entry.ts` | `app/api/tools/astrology/transits/route.ts` | 🔴 REBUILD | None (mocked data) | Real ephemeris calculation |
| 19 | `cleanupDailyInsights/entry.ts` | — | 🔴 DELETE | None | Replace with safe soft-delete |
| 20 | `TestStripe.jsx` | — | 🔴 DELETE | None | Test page, not needed |
| 21 | `pages.config.js` | — | 🔴 DELETE | None | Next.js file-based routing |
| 22 | `base44Client.js` | — | 🔴 DELETE | None | Replaced by Supabase client |

---

## Build Order Summary

```
Phase 0: Foundation (Files 1-49)
  ├── Project setup + config
  ├── Supabase clients + types
  ├── Auth flow (login → middleware → layout)
  ├── Constants + utilities (GEMs 5,6,8,11)
  └── Base components (shadcn/ui + common)

Phase 1: Core Infrastructure (Files 50-89)
  ├── Services layer (GEMs 1,2,3,12,14)
  ├── Validation schemas (Zod)
  ├── Hooks (GEM 7 + analytics)
  ├── Form components
  ├── API route skeleton
  └── Subscription guard + UI

Phase 2: Core Features (Files 90-136)
  ├── Onboarding + Dashboard + Home
  ├── Numerology
  ├── Astrology (5 sub-features)
  ├── Graphology + Drawing + Palmistry
  ├── Tarot + Human Design + Dream
  └── Compatibility + Career + Question

Phase 3: Advanced Features (Files 137-163)
  ├── AI Coach (chat + journeys)
  ├── Goals + Mood + Journal
  ├── Daily Insights + Synthesis
  ├── Personality + Document
  └── History + Comparison

Phase 4: Integrations (Files 164-184)
  ├── Stripe (checkout → webhook → subscription)
  ├── Email (welcome, payment, usage)
  ├── Profile + Settings + Guests
  ├── Referrals + Notifications
  ├── Learning (tutors + blog)
  └── Cron jobs

Phase 5: Polish & QA (Files 185-195)
  ├── Performance optimization
  ├── Accessibility audit
  ├── Test suite
  ├── Data migration
  └── Final QA report
```

---

> **שלב 5 הושלם.** מחכה לאישורך לפני שמתחיל בשלב 6: בנייה בפועל.
