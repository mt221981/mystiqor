# Requirements: MystiQor

**Defined:** 2026-03-22
**Core Value:** ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים — אסטרולוגיה, נומרולוגיה, ציורים, גרפולוגיה — עם AI שמסנתז את הכל לתובנות אישיות אחודות.

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: LLM service layer with Zod response validation for all 20+ call sites
- [x] **INFRA-02**: File upload service (multipart, magic-byte validation, Supabase Storage routing)
- [x] **INFRA-03**: Atomic usage counter (increment_usage DB function with subscription enforcement)
- [x] **INFRA-04**: Three Supabase client instances (browser, server, admin) correctly used
- [ ] **INFRA-05**: Supabase DB schema provisioned with generated TypeScript types (replace manual database.ts)
- [x] **INFRA-06**: Geocoding service for birth place → coordinates + timezone
- [ ] **INFRA-07**: Rate limiting on sensitive endpoints (Upstash Redis)
- [ ] **INFRA-08**: Email service (welcome, daily insights, usage limit, payment failed)

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password via Supabase Auth
- [ ] **AUTH-02**: User can log in and session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Protected routes redirect unauthenticated users to login
- [ ] **AUTH-05**: Auth callback route handles OAuth/magic-link redirects

### Onboarding

- [ ] **ONBD-01**: Multi-step onboarding collecting name, birth date/time, birth place (geocoded), gender
- [ ] **ONBD-02**: Onboarding auto-fills all analysis tools with birth data
- [ ] **ONBD-03**: Onboarding redirects to Home if profile already exists

### User Profile

- [ ] **PROF-01**: User can view and edit profile (name, birth data, preferences)
- [ ] **PROF-02**: User can manage multiple guest profiles (family/partner analysis)
- [ ] **PROF-03**: User can configure settings (theme, notifications)

### Subscription

- [ ] **SUBS-01**: Pricing page with 3 tiers (Free 3/month, Basic ₪49 20/month, Premium ₪99 unlimited)
- [ ] **SUBS-02**: Stripe checkout session creation and redirect
- [ ] **SUBS-03**: Stripe webhook with idempotency (prevents duplicate subscriptions)
- [ ] **SUBS-04**: SubscriptionGuard enforces usage limits on paid features
- [ ] **SUBS-05**: User can view and cancel subscription
- [ ] **SUBS-06**: Success page after subscription purchase

### Dashboard

- [ ] **DASH-01**: Dashboard shows biorhythm chart (physical/emotional/intellectual)
- [ ] **DASH-02**: Key stats cards (active goals, mood score, completed goals, reminders)
- [ ] **DASH-03**: Mood trend line chart (7-day history)
- [ ] **DASH-04**: Goal progress + breakdown charts
- [ ] **DASH-05**: Analysis types distribution bar chart
- [ ] **DASH-06**: Period selector (daily/weekly/monthly)

### Astrology

- [ ] **ASTR-01**: Natal chart calculation and SVG visualization from birth data
- [ ] **ASTR-02**: AI interpretation of natal chart with explainable insights
- [ ] **ASTR-03**: Transit calculations showing current planetary influences on natal chart
- [ ] **ASTR-04**: Solar Return annual chart and forecast
- [ ] **ASTR-05**: Synastry chart overlay for relationship compatibility
- [ ] **ASTR-06**: Daily forecast with current planetary positions
- [ ] **ASTR-07**: Astro calendar with monthly astrological events
- [ ] **ASTR-08**: Astrology readings history (curated saved readings)

### Numerology

- [ ] **NUMR-01**: Life path, destiny, soul number calculations from birth date
- [ ] **NUMR-02**: Numerology summary card with sub-number breakdown
- [ ] **NUMR-03**: Numerology compatibility between two people

### Drawing Analysis

- [ ] **DRAW-01**: Upload drawing image for psychological analysis (HTP: house, tree, person)
- [ ] **DRAW-02**: In-browser digital canvas for real-time drawing (DigitalCanvas)
- [ ] **DRAW-03**: Koppitz scoring and FDM visualization of drawing features
- [ ] **DRAW-04**: Annotated drawing viewer with feature highlights
- [ ] **DRAW-05**: Compare drawing analyses across sessions
- [ ] **DRAW-06**: Drawing concept cards with educational content

### Graphology

- [ ] **GRPH-01**: Upload handwriting scan for psychological analysis
- [ ] **GRPH-02**: Graphology progress tracking across sessions (GraphologyTimeline)
- [ ] **GRPH-03**: Graphology comparison between samples
- [ ] **GRPH-04**: PDF export of graphology analysis
- [ ] **GRPH-05**: Graphology quick stats and tooltips
- [ ] **GRPH-06**: Graphology reminder system

### AI Coach

- [ ] **COCH-01**: Conversational AI coach with chat interface (input, messages, quick actions)
- [ ] **COCH-02**: AI coach accesses all user analyses for personalized advice
- [ ] **COCH-03**: Coaching journeys (structured multi-session coaching paths)
- [ ] **COCH-04**: Journey dashboard showing all active journeys and progress
- [ ] **COCH-05**: Chat history persistence

### Mystic Synthesis

- [ ] **SYNT-01**: Cross-tool AI synthesis combining astrology + numerology + drawing + graphology
- [ ] **SYNT-02**: On-demand synthesis from any combination of analyses
- [ ] **SYNT-03**: Weekly synthesis report generation

### Tracking & Wellness

- [ ] **TRCK-01**: Mood tracker with 5-point scale + energy level + trend charts
- [ ] **TRCK-02**: Personal journal with mood_score, energy_level, gratitude, goals fields
- [ ] **TRCK-03**: Goals with progress tracking and AI recommendations
- [ ] **TRCK-04**: Goal linker connecting goals to specific analyses
- [ ] **TRCK-05**: Daily insights combining tarot + numerology + astrology
- [ ] **TRCK-06**: Notifications and reminders system

### Additional Tools

- [ ] **TOOL-01**: Tarot card reading with AI interpretation
- [ ] **TOOL-02**: Human Design chart (type, authority, profile, centers)
- [ ] **TOOL-03**: Palmistry via palm photo upload + AI interpretation
- [ ] **TOOL-04**: Compatibility analysis (romantic/friendship/professional)
- [ ] **TOOL-05**: Timing tools — find astrologically favorable days
- [ ] **TOOL-06**: Dream analysis via text input + AI interpretation
- [ ] **TOOL-07**: Personality analysis (Big Five) with radar chart
- [ ] **TOOL-08**: Career guidance informed by birth data
- [ ] **TOOL-09**: Relationship analysis beyond compatibility
- [ ] **TOOL-10**: Document analyzer (upload any document for AI insights)

### History & Comparison

- [ ] **HIST-01**: Analysis history with filterable list across all tools
- [ ] **HIST-02**: Analysis timeline visualization
- [ ] **HIST-03**: Compare analyses side-by-side

### Growth & Content

- [ ] **GROW-01**: Referral program with tracking and rewards
- [ ] **GROW-02**: Blog with educational content (astrology, numerology guides)
- [ ] **GROW-03**: Tutorials page with interactive content
- [ ] **GROW-04**: Astrology tutor (concept cards, AI teaching)
- [ ] **GROW-05**: Drawing tutor (concept cards, AI teaching)

### Export & Sharing

- [ ] **EXPO-01**: Export analysis to PDF
- [ ] **EXPO-02**: Share analysis results via link/social media

### UX & Infrastructure

- [ ] **UX-01**: RTL Hebrew UI on all pages (dir="rtl", start/end, Hebrew labels)
- [ ] **UX-02**: Dark/light theme toggle
- [ ] **UX-03**: Responsive mobile layout
- [ ] **UX-04**: PWA support (install prompt, service worker)
- [ ] **UX-05**: Page transitions and micro-animations
- [ ] **UX-06**: Loading skeletons and empty states
- [ ] **UX-07**: Error boundaries with auto-recovery
- [ ] **UX-08**: Breadcrumb navigation
- [ ] **UX-09**: Analytics dashboard (self-analytics — usage patterns, tool distribution)

## v2 Requirements

### Advanced Features
- **ADV-01**: Real-time AI coach streaming (Supabase Realtime)
- **ADV-02**: Push notifications via service worker
- **ADV-03**: Offline mode with cached analyses
- **ADV-04**: Admin panel for content management
- **ADV-05**: A/B testing framework for subscription conversion

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app (iOS/Android) | Web-first + PWA strategy for v1 |
| Multi-language (English) | Hebrew only, no i18n scaffolding |
| Real-time collaboration | Solo self-reflection tool |
| Video/audio content | Text + images only |
| IconGenerator page | Developer tool, not user-facing |
| TestStripe page | Developer tool |
| LanguageToggle | Multi-language out of scope |
| Admin/CMS panel | AnalyticsDashboard sufficient |
| Custom auth flows | Supabase Auth handles everything needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 8 | Pending |
| INFRA-08 | Phase 8 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| ONBD-01 | Phase 2 | Pending |
| ONBD-02 | Phase 2 | Pending |
| ONBD-03 | Phase 2 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Pending |
| PROF-03 | Phase 3 | Pending |
| SUBS-01 | Phase 8 | Pending |
| SUBS-02 | Phase 8 | Pending |
| SUBS-03 | Phase 8 | Pending |
| SUBS-04 | Phase 8 | Pending |
| SUBS-05 | Phase 8 | Pending |
| SUBS-06 | Phase 8 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DASH-06 | Phase 3 | Pending |
| ASTR-01 | Phase 4 | Pending |
| ASTR-02 | Phase 4 | Pending |
| ASTR-03 | Phase 6 | Pending |
| ASTR-04 | Phase 6 | Pending |
| ASTR-05 | Phase 6 | Pending |
| ASTR-06 | Phase 4 | Pending |
| ASTR-07 | Phase 4 | Pending |
| ASTR-08 | Phase 9 | Pending |
| NUMR-01 | Phase 4 | Pending |
| NUMR-02 | Phase 4 | Pending |
| NUMR-03 | Phase 4 | Pending |
| DRAW-01 | Phase 5 | Pending |
| DRAW-02 | Phase 5 | Pending |
| DRAW-03 | Phase 5 | Pending |
| DRAW-04 | Phase 5 | Pending |
| DRAW-05 | Phase 5 | Pending |
| DRAW-06 | Phase 5 | Pending |
| GRPH-01 | Phase 5 | Pending |
| GRPH-02 | Phase 5 | Pending |
| GRPH-03 | Phase 5 | Pending |
| GRPH-04 | Phase 5 | Pending |
| GRPH-05 | Phase 5 | Pending |
| GRPH-06 | Phase 5 | Pending |
| COCH-01 | Phase 7 | Pending |
| COCH-02 | Phase 7 | Pending |
| COCH-03 | Phase 7 | Pending |
| COCH-04 | Phase 7 | Pending |
| COCH-05 | Phase 7 | Pending |
| SYNT-01 | Phase 7 | Pending |
| SYNT-02 | Phase 7 | Pending |
| SYNT-03 | Phase 7 | Pending |
| TRCK-01 | Phase 3 | Pending |
| TRCK-02 | Phase 3 | Pending |
| TRCK-03 | Phase 3 | Pending |
| TRCK-04 | Phase 3 | Pending |
| TRCK-05 | Phase 4 | Pending |
| TRCK-06 | Phase 8 | Pending |
| TOOL-01 | Phase 4 | Pending |
| TOOL-02 | Phase 5 | Pending |
| TOOL-03 | Phase 5 | Pending |
| TOOL-04 | Phase 5 | Pending |
| TOOL-05 | Phase 6 | Pending |
| TOOL-06 | Phase 4 | Pending |
| TOOL-07 | Phase 4 | Pending |
| TOOL-08 | Phase 6 | Pending |
| TOOL-09 | Phase 6 | Pending |
| TOOL-10 | Phase 6 | Pending |
| HIST-01 | Phase 9 | Pending |
| HIST-02 | Phase 9 | Pending |
| HIST-03 | Phase 9 | Pending |
| GROW-01 | Phase 8 | Pending |
| GROW-02 | Phase 9 | Pending |
| GROW-03 | Phase 9 | Pending |
| GROW-04 | Phase 9 | Pending |
| GROW-05 | Phase 9 | Pending |
| EXPO-01 | Phase 10 | Pending |
| EXPO-02 | Phase 10 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 10 | Pending |
| UX-05 | Phase 3 | Pending |
| UX-06 | Phase 3 | Pending |
| UX-07 | Phase 3 | Pending |
| UX-08 | Phase 3 | Pending |
| UX-09 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 86 total
- Mapped to phases: 86
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 — Traceability updated to 10-phase roadmap (original 9-phase split for finer granularity)*
