# Roadmap: MystiQor

## Overview

MystiQor is a migration project — a fully functional BASE44 application (53 pages, 100+ components, 34 backend functions) being rebuilt on Next.js 15 / TypeScript strict / Supabase. Phase 0 (Foundation: 127 files, clean compilation) is already complete. The roadmap starts at Phase 1 and delivers all 86 v1 requirements across 10 phases, ordered by dependency: infrastructure foundations first, then auth and user lifecycle, then the UX shell, then tools in three tiers by complexity, then AI synthesis, then monetization, then learning content, and finally PWA polish and export.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 0: Foundation** - Next.js 15 project scaffold, TypeScript strict config, Supabase clients, shadcn/ui, middleware — COMPLETE
- [x] **Phase 1: Infrastructure Hardening** - LLM service layer, file upload, atomic usage counter, DB schema + types
- [x] **Phase 2: Auth + Onboarding** - Supabase Auth flows, multi-step onboarding, protected routes
- [x] **Phase 3: UX Shell + Profile + Dashboard + Tracking** - App shell, profile editing, dashboard charts, mood/journal/goals (completed 2026-03-22)
- [x] **Phase 4: Tools Tier 1 — Astrology Core + Numerology + Light Tools** - Natal chart, daily forecast, numerology, tarot, dream, personality
- [x] **Phase 5: Tools Tier 2 — Image Upload Tools** - Drawing analysis, graphology suite, palmistry, compatibility (completed 2026-03-23)
- [x] **Phase 6: Tools Tier 3 — Advanced Astrology (Ephemeris)** - Transits, Solar Return, synastry, timing tools, career, relationships, documents
- [x] **Phase 7: AI Coach + Mystic Synthesis** - Conversational coach, coaching journeys, cross-tool synthesis
- [x] **Phase 8: Growth + Monetization** - Stripe checkout, subscription management, referral, email flows, rate limiting
- [x] **Phase 9: Learning + History + Analytics** - Analysis history, tutorials, astrology tutor, drawing tutor, self-analytics
- [x] **Phase 10: Polish + PWA + Export** - PDF export, social sharing, PWA manifest + service worker, notifications
- [x] **Phase 11: UI Overhaul — Design System Reskin** - MD3 color tokens, new fonts, glassmorphism, nebula gradients, bento layouts, reskin all pages
- [ ] **Phase 12: Integration Wiring — Gap Closure** - Fix sidebar navigation, onboarding redirect, usage enforcement, export/share rendering, astrology sub-nav, usage bar live data

## Phase Details

### Phase 1: Infrastructure Hardening
**Goal**: Every subsequent feature can be built on a validated, safe foundation — LLM calls never crash on malformed responses, file uploads never hit Vercel's 4.5MB body limit, usage increments are atomic and race-condition-free, and DB types are generated from the live schema.
**Depends on**: Phase 0 (complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. Any LLM response with an unexpected shape returns a typed error to the caller — never an uncaught exception
  2. A 5MB image uploaded via the drawing or graphology form is stored in Supabase Storage without hitting a 413 or body-limit error
  3. Two simultaneous tool submissions from a free-tier user cannot both pass the usage limit check — exactly one succeeds
  4. TypeScript types for all 20 DB tables are generated from the live Supabase schema — no manual type file needed
  5. Birth place input resolves to latitude, longitude, and timezone via the geocoding service
**Plans:** 5/5 plans executed — PHASE COMPLETE

Plans:
- [x] 01-01-PLAN.md — DB schema migration (003_schema_fixes.sql with 9 fixes) + npm deps + usage route Zod hardening
- [x] 01-02-PLAN.md — LLM service Zod validation layer (invokeLLM enhancement + 7 response schemas + LLMValidationError type)
- [x] 01-03-PLAN.md — File upload hardening (presign endpoint + magic-byte validation + EXIF stripping)
- [x] 01-04-PLAN.md — Geocoding service enhancement (IANA timezone via tz-lookup + 1hr cache + 5s timeout)
- [x] 01-05-PLAN.md — Integration verification (TypeScript compilation + Phase 1 approval)

### Phase 2: Auth + Onboarding
**Goal**: A new visitor can create an account, complete onboarding with their birth data, and arrive at the app ready to use every tool — and an existing user can log in, stay logged in, and log out safely.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ONBD-01, ONBD-02, ONBD-03
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password and receives a working session
  2. User can log in and the session persists across browser refresh and new tabs
  3. User can log out from any page and is redirected to the login screen
  4. Navigating to a protected route while logged out redirects to login, then back after sign-in
  5. Onboarding form collects name, birth date/time, birth place (geocoded to coordinates), and gender — and this data pre-fills all analysis tools
**Plans:** 3/3 plans complete

Plans:
- [x] 02-01-PLAN.md — Auth infrastructure fixes (middleware path bug, x-pathname header, signOut action, login redirect-after-login, callback default)
- [x] 02-02-PLAN.md — Onboarding completion (Zod schema with Barnum consent, API route for profile upsert + free subscription creation, wizard update)
- [x] 02-03-PLAN.md — Auth layout onboarding guard + sign-out button + end-to-end verification checkpoint

### Phase 3: UX Shell + Profile + Dashboard + Tracking
**Goal**: A logged-in user experiences a complete, responsive Hebrew RTL app shell with navigation, theme toggle, and error recovery; can edit their profile; and sees a meaningful dashboard populated with their biorhythm, mood trends, goal progress, and daily insights tracking.
**Depends on**: Phase 2
**Requirements**: PROF-01, PROF-02, PROF-03, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, TRCK-01, TRCK-02, TRCK-03, TRCK-04, UX-01, UX-02, UX-03, UX-05, UX-06, UX-07, UX-08
**Success Criteria** (what must be TRUE):
  1. Every page renders with correct RTL layout, Hebrew labels, and Hebrew error messages — no LTR leakage
  2. User can switch between light and dark theme and the choice persists across sessions
  3. Dashboard displays biorhythm chart, mood trend line, goal progress, and analysis distribution using real user data — not placeholder content
  4. User can log a mood entry (5-point scale + energy level) and see it appear in the dashboard trend chart within the same session
  5. User can edit their profile (name, birth data, preferences) and the update reflects immediately in the UI
  6. An uncaught render error shows the error boundary recovery UI — not a blank white screen
**Plans:** 7/7 plans complete

Plans:
- [x] 03-01-PLAN.md — App shell wiring (replace placeholder sidebar with real Sidebar + Header + MobileNav, dir="rtl")
- [x] 03-02-PLAN.md — Mood tracker (API routes + 5-emoji picker + sliders + page with CRUD)
- [x] 03-03-PLAN.md — Personal journal (API routes + form with mood/gratitude/goals + CRUD page)
- [x] 03-04-PLAN.md — Goals system (API routes + 8 categories + progress tracking + goal-analysis linker)
- [x] 03-05-PLAN.md — Profile edit + guest profiles + settings (profile form, subscription-gated guests, theme toggle)
- [x] 03-06-PLAN.md — Dashboard rebuild (daily insight card, biorhythm, mood trend, goals progress, analysis chart, period selector, stat cards)
- [x] 03-07-PLAN.md — Integration verification (TypeScript build + human-verify all pages)

### Phase 4: Tools Tier 1 — Astrology Core + Numerology + Light Tools
**Goal**: Users can run the platform's five most-used analysis tools — natal chart, daily astrology forecast, astro calendar, numerology calculations, tarot reading, dream analysis, and personality analysis — with AI interpretation on each, all subscription-gated.
**Depends on**: Phase 3
**Requirements**: ASTR-01, ASTR-02, ASTR-06, ASTR-07, NUMR-01, NUMR-02, NUMR-03, TRCK-05, TOOL-01, TOOL-06, TOOL-07
**Success Criteria** (what must be TRUE):
  1. User sees their natal chart rendered as an SVG with zodiac ring, planet positions, aspect lines, and house overlay — birth data pre-filled from profile
  2. User reads an AI interpretation of their natal chart that references specific planetary placements
  3. Numerology page shows life path, destiny, and soul number with sub-number breakdown and numerology compatibility between two people
  4. Daily insights page shows a combined tarot + numerology + astrology reading that changes each day
  5. Dream analysis accepts a text description and returns an AI interpretation
  6. Personality analysis generates a Big Five radar chart from user responses
  7. Every tool form is wrapped in SubscriptionGuard — free users see an upgrade prompt after 3 analyses
**Plans:** 7/7 plans executed — PHASE COMPLETE

Plans:
- [x] 04-01-PLAN.md — Natal chart SVG decomposition (ZodiacRing, PlanetPositions, AspectLines, HouseOverlay, utils, index)
- [x] 04-02-PLAN.md — Numerology enhancements (sub-number breakdown + compatibility card + API route)
- [x] 04-03-PLAN.md — Personality Big Five (20-question questionnaire + scoring + radar chart + AI interpretation) + dream SubscriptionGuard fix
- [x] 04-04-PLAN.md — Daily astrology forecast + astro calendar (API routes + components + pages)
- [x] 04-05-PLAN.md — Astrology page + AI interpretation (birth-chart API with LLM planet approximation + 4 info panels)
- [x] 04-06-PLAN.md — Daily insights (cache-or-generate API + hero card + history list + module toggles)
- [x] 04-07-PLAN.md — Integration verification (TypeScript build + SubscriptionGuard audit + human-verify all tools)

### Phase 5: Tools Tier 2 — Image Upload Tools
**Goal**: Users can upload drawings and handwriting samples for psychological analysis, sketch directly in-browser, and run compatibility analysis between two people — all using the file upload infrastructure from Phase 1.
**Depends on**: Phase 4
**Requirements**: DRAW-01, DRAW-02, DRAW-03, DRAW-04, DRAW-05, DRAW-06, GRPH-01, GRPH-02, GRPH-03, GRPH-04, GRPH-05, GRPH-06, TOOL-02, TOOL-03, TOOL-04
**Success Criteria** (what must be TRUE):
  1. User can upload a drawing image (up to 5MB) and receive an HTP psychological analysis with Koppitz scoring and FDM visualization
  2. User can draw directly in-browser on the digital canvas and submit it for analysis without any file upload
  3. User can compare two drawing analyses side-by-side and see differences highlighted
  4. User can upload a handwriting sample and receive a graphology analysis with a PDF export option
  5. User can view graphology progress over multiple sessions on a timeline chart
  6. Compatibility analysis accepts birth data for two people and returns combined astrology + numerology compatibility scores
**Plans:** 7/7 plans complete

Plans:
- [x] 05-01-PLAN.md — Drawing analysis core (API route + KoppitzVisualization + FDMVisualization + AnnotatedDrawingViewer + page with upload)
- [x] 05-02-PLAN.md — Digital canvas (DigitalCanvas component + page integration as upload/canvas toggle)
- [x] 05-03-PLAN.md — Drawing comparison (DrawingCompare + DrawingConceptCards + page tabs)
- [x] 05-04-PLAN.md — Graphology analysis core (API route + GraphologyQuickStats radar + page with upload)
- [x] 05-05-PLAN.md — Graphology extras (GraphologyTimeline + GraphologyCompare + GraphologyReminder + PDF print CSS + page tabs)
- [x] 05-06-PLAN.md — Compatibility analysis (API route + dual-person form page)
- [x] 05-07-PLAN.md — Integration verification (TypeScript build + TOOL-02/TOOL-03 audit + human-verify all Phase 5 pages)

### Phase 6: Tools Tier 3 — Advanced Astrology (Ephemeris)
**Goal**: Users access the full astrology suite — real transit calculations against their natal chart, Solar Return forecast, synastry overlay for relationships, timing tools for favorable days, plus career and relationship analysis — all backed by real ephemeris data (not mocked calculations).
**Depends on**: Phase 4 (natal chart must exist)
**Requirements**: ASTR-03, ASTR-04, ASTR-05, TOOL-05, TOOL-08, TOOL-09, TOOL-10
**Success Criteria** (what must be TRUE):
  1. Transit page shows current planetary positions overlaid on the user's natal chart with active aspect calculations — numbers match astronomy-engine ephemeris source
  2. Solar Return chart generates an annual forecast for the user's next birthday from real planetary positions
  3. Synastry chart overlays two natal charts and shows inter-chart aspects between two people
  4. Timing tools page returns a list of astrologically favorable days within a user-selected date range, with explanation of which transits make those days favorable
  5. Career guidance analysis returns actionable career insights informed by the user's birth chart
**Plans:** 5/5 plans complete

Plans:
- [x] 06-01-PLAN.md — Ephemeris adapter (astronomy-engine install + ephemeris.ts + transit/inter-chart aspect functions + birth-chart upgrade to real data)
- [x] 06-02-PLAN.md — Transits page + Solar Return page (API routes + UI pages with real ephemeris)
- [x] 06-03-PLAN.md — Synastry dual-chart + Timing tools (API routes + timing scoring service + UI pages)
- [x] 06-04-PLAN.md — LLM-only tools: Career guidance + Relationship analysis + Document analyzer (API routes + UI pages)
- [x] 06-05-PLAN.md — Integration verification (TypeScript build + SubscriptionGuard audit + human-verify all Phase 6 pages)

### Phase 7: AI Coach + Mystic Synthesis
**Goal**: Users can have an ongoing personalized coaching conversation with an AI that knows all their analyses, follow structured multi-session coaching journeys, and generate cross-tool synthesis reports that combine all their mystical and psychological data into a unified personal portrait.
**Depends on**: Phase 4 (analyses must exist to synthesize)
**Requirements**: COCH-01, COCH-02, COCH-03, COCH-04, COCH-05, SYNT-01, SYNT-02, SYNT-03
**Success Criteria** (what must be TRUE):
  1. User can send a message to the AI coach and receive a response that references their actual natal chart, numerology numbers, or recent mood entries — not generic advice
  2. Chat history persists across sessions — returning to the coach page shows the previous conversation
  3. User can start a coaching journey (e.g., "Life Purpose") and see structured sessions with progress tracking
  4. Mystic Synthesis button generates a unified reading that explicitly cross-references at least two different analysis types (e.g., "Your life path 7 aligns with your Saturn in Aquarius...")
  5. User can request a weekly synthesis report and receive a summary of all tool activity from the past 7 days
**Plans:** 4/4 plans executed — PHASE COMPLETE

Plans:
- [x] 07-01-PLAN.md — AI Coach core: context builder + conversations/messages API routes + chat UI components + coach page (COCH-01, COCH-02, COCH-05)
- [x] 07-02-PLAN.md — Coaching journeys: DB migration (004_schema_fixes.sql) + journeys API routes + JourneyCard component (COCH-03, COCH-04)
- [x] 07-03-PLAN.md — Mystic Synthesis: synthesis API route + SynthesisResult component + synthesis page (SYNT-01, SYNT-02, SYNT-03)
- [x] 07-04-PLAN.md — Integration: journeys tab in coach page + sidebar nav fixes + TypeScript check + human verification

### Phase 8: Growth + Monetization
**Goal**: The business model is fully operational — users can subscribe to paid plans via Stripe, webhooks process without duplicates, free users see clear upgrade prompts, referrals are tracked and rewarded, and transactional emails are delivered reliably.
**Depends on**: Phase 3 (users and profiles must exist), Phase 4 (SubscriptionGuard must exist)
**Requirements**: SUBS-01, SUBS-02, SUBS-03, SUBS-04, SUBS-05, SUBS-06, TRCK-06, GROW-01, INFRA-07, INFRA-08
**Success Criteria** (what must be TRUE):
  1. Pricing page shows three tiers (Free 3/month, Basic 49/month, Premium 99 unlimited) with clear feature comparison
  2. Clicking "Subscribe" opens a Stripe checkout session and completing payment upgrades the user's plan immediately
  3. Stripe webhook retried 5 times with the same event ID creates exactly one subscription record — not five
  4. A free-tier user who has used 3 analyses sees an upgrade prompt instead of the tool form on the 4th attempt
  5. New user receives a welcome email within 60 seconds of completing onboarding
  6. Sensitive API endpoints (LLM calls, file uploads) reject requests beyond the rate limit with a 429 response
**Plans:** 6/6 plans executed — PHASE COMPLETE

Plans:
- [x] 08-01-PLAN.md — Pricing page with 3 PlanCards + Stripe checkout session API + PLAN_CONFIG deprecation (SUBS-01, SUBS-02)
- [x] 08-02-PLAN.md — Stripe webhook with idempotency via processed_webhook_events + 4 event handlers (SUBS-03)
- [x] 08-03-PLAN.md — Upstash rate limiting library + wiring into usage route (INFRA-07)
- [x] 08-04-PLAN.md — Subscription management page + success page + Stripe billing portal route (SUBS-04, SUBS-05, SUBS-06)
- [x] 08-05-PLAN.md — Referral program (code generation + claim + rewards) + email wiring (welcome, usage-limit, referral-accepted) (GROW-01, INFRA-08)
- [x] 08-06-PLAN.md — Notifications/reminders CRUD + sidebar nav updates + integration verification (TRCK-06)

### Phase 9: Learning + History + Analytics
**Goal**: Users can explore their complete analysis history across all tools, compare analyses side-by-side, learn astrology and drawing interpretation through structured tutorials, and see a self-analytics dashboard of their usage patterns.
**Depends on**: Phase 4 (analyses must exist in history)
**Requirements**: ASTR-08, HIST-01, HIST-02, HIST-03, GROW-02, GROW-03, GROW-04, GROW-05, UX-09
**Success Criteria** (what must be TRUE):
  1. Analysis history page shows a filterable, paginated list of all past analyses across all tool types
  2. User can select two analyses of the same type and see them compared side-by-side with differences highlighted
  3. Tutorials page displays educational content for astrology and drawing interpretation that can be navigated without running an analysis
  4. Astrology tutor presents concept cards and allows AI-driven Q&A about astrological concepts
  5. Self-analytics dashboard shows which tools the user uses most, mood score trends over time, and goal completion rate
**Plans:** 5/5 plans executed — PHASE COMPLETE

Plans:
- [x] 09-01-PLAN.md — Shared infrastructure (TOOL_NAMES constant, PROTECTED_PATHS, Sidebar) + History page (filterable list, timeline, pagination) + Compare page (side-by-side diff) (HIST-01, HIST-02, HIST-03, ASTR-08)
- [x] 09-02-PLAN.md — Blog page with seeded articles + Tutorials hub with learning paths + Learning progress API (GROW-02, GROW-03)
- [x] 09-03-PLAN.md — Astrology tutor + Drawing tutor (AI chat pages with concept buttons, tutor API routes) (GROW-04, GROW-05)
- [x] 09-04-PLAN.md — Self-analytics dashboard (tool usage pie chart, activity timeline, mood trend, stat cards) (UX-09)
- [x] 09-05-PLAN.md — Integration verification (TypeScript build + TOOL_NAMES dedup + route audit + human-verify all pages)

### Phase 10: Polish + PWA + Export
**Goal**: The platform is installable as a PWA, all analyses can be exported to PDF or shared via link — production-ready at every surface.
**Depends on**: Phase 9
**Requirements**: EXPO-01, EXPO-02, UX-04
**Success Criteria** (what must be TRUE):
  1. User can install MystiQor from the browser on iOS or Android and launch it from the home screen like a native app
  2. User can export any analysis to a PDF that renders the Hebrew RTL content correctly
  3. User can share an analysis result via a link or social media button
**Plans:** 3/3 plans executed — PHASE COMPLETE

Plans:
- [x] 10-01-PLAN.md — PDF export (@react-pdf/renderer + Heebo font + RTL) + social sharing infrastructure (DB migration, share API, public page, SharePanel) + next.config.ts updates (EXPO-01, EXPO-02)
- [x] 10-02-PLAN.md — PWA manifest + minimal service worker + icons + InstallPrompt component + SW registration (UX-04)
- [x] 10-03-PLAN.md — Integration verification (TypeScript build + component audit + human-verify PDF, sharing, PWA)

### Phase 11: UI Overhaul — Design System Reskin
**Goal**: Reskin the entire application to match the Stitch design system: dark cosmic theme (#131315), Material Design 3 color tokens, Plus Jakarta Sans + Inter + Manrope typography, glassmorphism panels, nebula gradients, bento grid layouts, Material Symbols Outlined icons — applied to every page and component.
**Depends on**: Phase 10
**Requirements**: UI-10, UI-11, UI-12, UI-13, UI-14
**Success Criteria** (what must be TRUE):
  1. Every page uses the new color palette (#131315 background, #ddb8ff primary, #8f2de6 container, #4edea3 tertiary, #3626ce secondary)
  2. Typography uses Plus Jakarta Sans for headlines, Inter for body, Manrope for labels — no Assistant font remnants
  3. All cards use glassmorphism (backdrop-blur, semi-transparent backgrounds) matching the Stitch designs
  4. Header is fixed with glass-nav effect, nebula glow shadow, and Material Symbols icons
  5. Dashboard shows bento grid layout with personalized greeting, daily insight widget with nebula gradient, and stat cards matching the design
  6. Tool pages (numerology, graphology, palmistry, human design) match their respective Stitch screen designs
  7. AI chat interface matches the cosmic chat bubble design with history navigation
**Plans:** 10/10 plans complete

Plans:
- [x] 11-01-PLAN.md — Design system foundation: Tailwind MD3 color palette + font families + custom CSS utilities + 4 shared UI primitives (UI-10, UI-11)
- [x] 11-02-PLAN.md — App shell reskin: Header glass-nav + Sidebar glass-panel + MobileNav + PageHeader + auth layout stars-bg (UI-12)
- [x] 11-03-PLAN.md — Dashboard bento grid + DailyInsightCard nebula gradient + StatCards + charts + onboarding reskin (UI-13)
- [x] 11-04-PLAN.md — Tier 1 tool pages reskin: numerology, astrology, tarot, dream, personality, daily insights (UI-13)
- [x] 11-05-PLAN.md — Tier 2 tool pages reskin: graphology, drawing, palmistry, human design, compatibility (UI-13)
- [x] 11-06-PLAN.md — Tier 3 tool pages reskin: transits, synastry, solar return, timing, career, relationships, document, forecast, calendar (UI-13)
- [x] 11-07-PLAN.md — Tracking pages reskin: mood, journal, goals, notifications (UI-13)
- [x] 11-08-PLAN.md — AI + Growth pages reskin: coach chat, synthesis, pricing, subscription, referrals, settings, profile, guards (UI-14)
- [x] 11-09-PLAN.md — Learning + Analytics reskin: history, compare, tutorials, blog, analytics, tutors, shared components (UI-13)
- [x] 11-10-PLAN.md — Integration verification: remaining components + codebase-wide color audit + visual QA checkpoint (UI-10, UI-11, UI-12, UI-13, UI-14)

### Phase 12: Integration Wiring — Gap Closure
**Goal**: Fix all cross-phase wiring gaps found in the v1.0 milestone audit — sidebar navigation reaches all tools, onboarding completes cleanly, subscription usage enforces limits, export/share are accessible from the UI, astrology sub-tools have navigation paths, and the usage bar shows real data.
**Depends on**: Phase 11
**Requirements**: ONBD-03, INFRA-03, SUBS-04, EXPO-01, EXPO-02, ASTR-03, ASTR-04, ASTR-05, ASTR-06, ASTR-07
**Gap Closure**: Closes all 6 integration gaps from v1.0-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. Every tool link in the sidebar navigates to the correct `/tools/*` page (0 broken links)
  2. Completing onboarding redirects to a valid page (not 404)
  3. Each tool API call increments the usage counter — free users hit the 3/month limit
  4. Every analysis result page shows Export and Share buttons
  5. All 5 astrology sub-tools (forecast, calendar, transits, solar-return, synastry) are reachable from navigation
  6. Sidebar usage bar shows the user's real usage percentage from useSubscription

Plans: 0/4

Plans:
- [x] 12-01-PLAN.md — Fix sidebar hrefs, astrology sub-tools, live UsageBar, onboarding redirect
- [x] 12-02-PLAN.md — Wire incrementUsage() into all 16 tool pages
- [x] 12-03-PLAN.md — Wire ExportButton + SharePanel into AnalysisCard
- [ ] 12-04-PLAN.md — Integration verification + human approval checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Foundation | 8/8 | Complete | 2026-03-22 |
| 1. Infrastructure Hardening | 5/5 | Complete |  |
| 2. Auth + Onboarding | 3/3 | Complete   | 2026-03-22 |
| 3. UX Shell + Profile + Dashboard + Tracking | 7/7 | Complete   | 2026-03-22 |
| 4. Tools Tier 1 — Astrology Core + Numerology + Light Tools | 7/7 | Complete   | 2026-03-23 |
| 5. Tools Tier 2 — Image Upload Tools | 7/7 | Complete   | 2026-03-23 |
| 6. Tools Tier 3 — Advanced Astrology (Ephemeris) | 5/5 | Complete   | 2026-03-25 |
| 7. AI Coach + Mystic Synthesis | 4/4 | Complete   | 2026-03-24 |
| 8. Growth + Monetization | 6/6 | Complete   | 2026-03-24 |
| 9. Learning + History + Analytics | 5/5 | Complete   | 2026-03-24 |
| 10. Polish + PWA + Export | 3/3 | Complete   | 2026-03-24 |
| 11. UI Overhaul — Design System Reskin | 10/10 | Complete   | 2026-03-25 |
| 12. Integration Wiring — Gap Closure | 3/4 | In Progress|  |
