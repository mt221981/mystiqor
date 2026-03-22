# Roadmap: MystiQor

## Overview

MystiQor is a migration project — a fully functional BASE44 application (53 pages, 100+ components, 34 backend functions) being rebuilt on Next.js 15 / TypeScript strict / Supabase. Phase 0 (Foundation: 127 files, clean compilation) is already complete. The roadmap starts at Phase 1 and delivers all 86 v1 requirements across 10 phases, ordered by dependency: infrastructure foundations first, then auth and user lifecycle, then the UX shell, then tools in three tiers by complexity, then AI synthesis, then monetization, then learning content, and finally PWA polish and export.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 0: Foundation** - Next.js 15 project scaffold, TypeScript strict config, Supabase clients, shadcn/ui, middleware — COMPLETE
- [ ] **Phase 1: Infrastructure Hardening** - LLM service layer, file upload, atomic usage counter, DB schema + types
- [ ] **Phase 2: Auth + Onboarding** - Supabase Auth flows, multi-step onboarding, protected routes
- [ ] **Phase 3: UX Shell + Profile + Dashboard + Tracking** - App shell, profile editing, dashboard charts, mood/journal/goals
- [ ] **Phase 4: Tools Tier 1 — Astrology Core + Numerology + Light Tools** - Natal chart, daily forecast, numerology, tarot, dream, personality
- [ ] **Phase 5: Tools Tier 2 — Image Upload Tools** - Drawing analysis, graphology suite, palmistry, compatibility
- [ ] **Phase 6: Tools Tier 3 — Advanced Astrology (Ephemeris)** - Transits, Solar Return, synastry, timing tools, career, relationships, documents
- [ ] **Phase 7: AI Coach + Mystic Synthesis** - Conversational coach, coaching journeys, cross-tool synthesis
- [ ] **Phase 8: Growth + Monetization** - Stripe checkout, subscription management, referral, email flows, rate limiting
- [ ] **Phase 9: Learning + History + Analytics** - Analysis history, tutorials, astrology tutor, drawing tutor, self-analytics
- [ ] **Phase 10: Polish + PWA + Export** - PDF export, social sharing, PWA manifest + service worker, notifications

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
**Plans**: TBD

Plans:
- [ ] 01-01: LLM service layer with Zod response schemas for all 20+ call sites
- [ ] 01-02: File upload endpoint (multipart, magic-byte validation, Supabase Storage routing)
- [ ] 01-03: Atomic usage counter (increment_usage DB function + subscription enforcement)
- [ ] 01-04: Supabase three-client verification + DB schema migration + generated TypeScript types
- [ ] 01-05: Geocoding service (birth place → coordinates + timezone)

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
**Plans**: TBD

Plans:
- [ ] 02-01: Supabase Auth flows (sign-up, sign-in, sign-out, OAuth callback)
- [ ] 02-02: Protected route middleware and auth callback route
- [ ] 02-03: Multi-step onboarding UI (name, birth date/time, birth place, gender)
- [ ] 02-04: Onboarding server action with geocoding + UserProfile creation

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
**Plans**: TBD

Plans:
- [ ] 03-01: App shell (sidebar, breadcrumbs, navigation, theme toggle, RTL layout)
- [ ] 03-02: Profile edit page + guest profiles (PROF-01, PROF-02, PROF-03)
- [ ] 03-03: Dashboard charts (biorhythm, mood trend, goal progress, analysis distribution) using Recharts
- [ ] 03-04: Mood tracker (entry form, 5-point scale, energy level, trend charts)
- [ ] 03-05: Personal journal (CRUD with mood_score, energy_level, gratitude, goals fields)
- [ ] 03-06: Goals (CRUD, progress tracking, AI recommendations, goal-analysis linker)
- [ ] 03-07: UX polish (loading skeletons, empty states, error boundaries, mobile responsiveness)

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
**Plans**: TBD

Plans:
- [ ] 04-01: Astrology natal chart (SVG decomposition: ZodiacRing, PlanetPositions, AspectLines, HouseOverlay)
- [ ] 04-02: Natal chart AI interpretation + astro calendar + daily forecast
- [ ] 04-03: Numerology (life path, destiny, soul, sub-numbers, compatibility)
- [ ] 04-04: Daily insights (tarot + numerology + astrology combined, date-keyed caching)
- [ ] 04-05: Tarot reading with AI interpretation
- [ ] 04-06: Dream analysis and personality analysis (Big Five radar)
- [ ] 04-07: SubscriptionGuard integration across all Tier 1 tools

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
**Plans**: TBD

Plans:
- [ ] 05-01: Drawing analysis (upload, HTP analysis, Koppitz scoring, FDM visualization, annotation viewer)
- [ ] 05-02: Digital canvas (HTML5 Canvas, touch events, base64 export for analysis)
- [ ] 05-03: Drawing comparison and concept cards
- [ ] 05-04: Graphology analysis (upload, 9-component analysis, quick stats, tooltips)
- [ ] 05-05: Graphology timeline, comparison, PDF export, reminders
- [ ] 05-06: Human Design chart (type, authority, profile, centers)
- [ ] 05-07: Palmistry (palm photo upload + AI interpretation) and compatibility analysis

### Phase 6: Tools Tier 3 — Advanced Astrology (Ephemeris)
**Goal**: Users access the full astrology suite — real transit calculations against their natal chart, Solar Return forecast, synastry overlay for relationships, timing tools for favorable days, plus career and relationship analysis — all backed by real ephemeris data (not mocked calculations).
**Depends on**: Phase 4 (natal chart must exist)
**Requirements**: ASTR-03, ASTR-04, ASTR-05, TOOL-05, TOOL-08, TOOL-09, TOOL-10
**Success Criteria** (what must be TRUE):
  1. Transit page shows current planetary positions overlaid on the user's natal chart with active aspect calculations — numbers match Swiss Ephemeris or an equivalent real ephemeris source
  2. Solar Return chart generates an annual forecast for the user's next birthday from real planetary positions
  3. Synastry chart overlays two natal charts and shows inter-chart aspects between two people
  4. Timing tools page returns a list of astrologically favorable days within a user-selected date range, with explanation of which transits make those days favorable
  5. Career guidance analysis returns actionable career insights informed by the user's birth chart
**Plans**: TBD

Plans:
- [ ] 06-01: Ephemeris library integration (Swiss Ephemeris WASM or astronomia) + transit calculations
- [ ] 06-02: Transits page (real planetary positions overlaid on natal chart)
- [ ] 06-03: Solar Return annual chart + synastry dual chart
- [ ] 06-04: Timing tools (favorable day finder) + astrology calendar
- [ ] 06-05: Career guidance, relationship analysis, document analyzer

### Phase 7: AI Coach + Mystic Synthesis
**Goal**: Users can have an ongoing personalized coaching conversation with an AI that knows all their analyses, follow structured multi-session coaching journeys, and generate cross-tool synthesis reports that combine all their mystical and psychological data into a unified personal portrait.
**Depends on**: Phase 4 (analyses must exist to synthesize)
**Requirements**: COCH-01, COCH-02, COCH-03, COCH-04, COCH-05, SYNT-01, SYNT-02, SYNT-03
**Success Criteria** (what must be TRUE):
  1. User can send a message to the AI coach and receive a response that references their actual natal chart, numerology numbers, or recent mood entries — not generic advice
  2. Chat history persists across sessions — returning to the coach page shows the previous conversation
  3. User can start a coaching journey (e.g., "Life Purpose") and see structured sessions with progress tracking
  4. Mystic Synthesis button generates a unified reading that explicitly cross-references at least two different analysis types (e.g., "Your life path 7 aligns with your Saturn in Aquarius…")
  5. User can request a weekly synthesis report and receive a summary of all tool activity from the past 7 days
**Plans**: TBD

Plans:
- [ ] 07-01: AI Coach chat interface (input, messages, quick actions, Supabase Realtime streaming)
- [ ] 07-02: Coach context loader (fetches all user analyses for personalized responses)
- [ ] 07-03: Coaching journeys (structured sessions, journey dashboard, progress tracking)
- [ ] 07-04: Mystic Synthesis (on-demand cross-tool synthesis, weekly report generation)

### Phase 8: Growth + Monetization
**Goal**: The business model is fully operational — users can subscribe to paid plans via Stripe, webhooks process without duplicates, free users see clear upgrade prompts, referrals are tracked and rewarded, and transactional emails are delivered reliably.
**Depends on**: Phase 3 (users and profiles must exist), Phase 4 (SubscriptionGuard must exist)
**Requirements**: SUBS-01, SUBS-02, SUBS-03, SUBS-04, SUBS-05, SUBS-06, TRCK-06, GROW-01, INFRA-07, INFRA-08
**Success Criteria** (what must be TRUE):
  1. Pricing page shows three tiers (Free 3/month, Basic ₪49 20/month, Premium ₪99 unlimited) with clear feature comparison
  2. Clicking "Subscribe" opens a Stripe checkout session and completing payment upgrades the user's plan immediately
  3. Stripe webhook retried 5 times with the same event ID creates exactly one subscription record — not five
  4. A free-tier user who has used 3 analyses sees an upgrade prompt instead of the tool form on the 4th attempt
  5. New user receives a welcome email within 60 seconds of completing onboarding
  6. Sensitive API endpoints (LLM calls, file uploads) reject requests beyond the rate limit with a 429 response
**Plans**: TBD

Plans:
- [ ] 08-01: Pricing page + Stripe checkout session creation
- [ ] 08-02: Stripe webhook with idempotency (stripe_event_id deduplication)
- [ ] 08-03: Subscription management page (view plan, cancel, success page)
- [ ] 08-04: SubscriptionGuard enforcement across all tool forms
- [ ] 08-05: Referral program (tracking, rewards, referral link generation)
- [ ] 08-06: Email service (welcome, daily insights, usage limit, payment failed) via Resend
- [ ] 08-07: Notifications + reminders system
- [ ] 08-08: Rate limiting on sensitive endpoints (Upstash Redis)

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
**Plans**: TBD

Plans:
- [ ] 09-01: Analysis history page (filterable list, timeline visualization, pagination)
- [ ] 09-02: Analysis comparison view (side-by-side diff)
- [ ] 09-03: Blog with educational content (astrology, numerology guides)
- [ ] 09-04: Tutorials page + astrology tutor (concept cards, AI teaching)
- [ ] 09-05: Drawing tutor (concept cards, AI teaching)
- [ ] 09-06: Self-analytics dashboard (usage patterns, tool distribution, mood trends)

### Phase 10: Polish + PWA + Export
**Goal**: The platform is installable as a PWA, all analyses can be exported to PDF or shared via link, notifications are active, and the app is verified accessible with keyboard navigation and ARIA labels — production-ready at every surface.
**Depends on**: Phase 9
**Requirements**: EXPO-01, EXPO-02, UX-04
**Success Criteria** (what must be TRUE):
  1. User can install MystiQor from the browser on iOS or Android and launch it from the home screen like a native app
  2. User can export any analysis to a PDF that renders the Hebrew RTL content correctly
  3. User can share an analysis result via a link or social media button
**Plans**: TBD

Plans:
- [ ] 10-01: PDF export using pdf-lib (RTL Hebrew, all analysis types)
- [ ] 10-02: Social sharing (link generation, share buttons)
- [ ] 10-03: PWA manifest, service worker, install prompt
- [ ] 10-04: Accessibility audit (ARIA, keyboard navigation, screen reader verification)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Foundation | 8/8 | Complete | 2026-03-22 |
| 1. Infrastructure Hardening | 0/5 | Not started | - |
| 2. Auth + Onboarding | 0/4 | Not started | - |
| 3. UX Shell + Profile + Dashboard + Tracking | 0/7 | Not started | - |
| 4. Tools Tier 1 — Astrology Core + Numerology + Light Tools | 0/7 | Not started | - |
| 5. Tools Tier 2 — Image Upload Tools | 0/7 | Not started | - |
| 6. Tools Tier 3 — Advanced Astrology (Ephemeris) | 0/5 | Not started | - |
| 7. AI Coach + Mystic Synthesis | 0/4 | Not started | - |
| 8. Growth + Monetization | 0/8 | Not started | - |
| 9. Learning + History + Analytics | 0/6 | Not started | - |
| 10. Polish + PWA + Export | 0/4 | Not started | - |
