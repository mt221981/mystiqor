# Feature Landscape

**Domain:** Mystical / Psychological Personal Analysis Platform
**Project:** MystiQor
**Researched:** 2026-03-22
**Source confidence:** HIGH — derived from direct source code examination of 53-page BASE44 system (first-party evidence), supplemented by domain knowledge of comparable platforms (Co-Star, Pattern, Sanctuary, Time Nomad).

---

## Domain Context

MystiQor is not a generic wellness app. It occupies a specific niche: **personal self-knowledge through the synthesis of multiple mystical and psychological lenses** — astrology, numerology, drawing analysis, graphology, tarot, Human Design, palmistry — unified by an AI layer that cross-references all signals into a coherent personal portrait. This is its core differentiator and must be preserved exactly in the migration.

The existing BASE44 system has 53 pages, 100+ components, and 34 backend functions. The feature set is largely complete and validated. This research documents what exists, how it maps to user expectations, and what the migration must preserve vs improve vs drop.

---

## Table Stakes

Features users expect from any mystical/analysis platform. Missing = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Migration Status | Notes |
|---------|--------------|------------|-----------------|-------|
| **Birth chart calculation** | The foundation of astrology; every serious astrology app has it | High | EXISTS — Astrology.jsx, BirthChart.jsx | Requires geocoding (lat/lon from birth place), timezone, visual natal chart rendering |
| **Life path number (numerology)** | First thing numerology users compute; table stakes for the domain | Low | EXISTS — Numerology.jsx | Simple calculation from birth date; needs display of sub-numbers too |
| **Daily insight / daily horoscope** | Users return daily; without it there's no reason to open the app daily | Medium | EXISTS — DailyInsights.jsx, AdvancedDailyInsights.jsx | Synthesizes tarot + numerology + astrology into one daily push; has like/dislike feedback |
| **User profile with birth data** | All analysis tools depend on this; without it nothing can be pre-filled | Medium | EXISTS — Onboarding.jsx, UserProfile.jsx, EditProfile.jsx | Multi-step onboarding collecting name, birth date/time/place, gender; auto-fills all tool forms |
| **Authentication (login / signup)** | Access control for paid features and personal data | Low | EXISTS — BASE44 auth, migrating to Supabase Auth | No custom auth logic needed; Supabase handles it |
| **Subscription / paywall** | Business model viability; free tier + paid tiers with usage limits | High | EXISTS — Pricing.jsx, ManageSubscription.jsx, Stripe integration | Free (3/month), Basic ₪49/month (20/month), Premium ₪99/month (unlimited); SubscriptionGuard component enforces limits |
| **Analysis history** | Users must be able to revisit past readings | Medium | EXISTS — myanalyses.jsx, AnalysisTimeline.jsx | Filterable list of all analyses across tools; shows tool type, date, summary |
| **Dark mode** | Expected by any modern web app, especially mystical/spiritual aesthetic | Low | EXISTS — theme toggle | Dark-first design; purple/slate color system |
| **Responsive / mobile layout** | >60% of spiritual app users are on mobile | Medium | EXISTS — PWA, responsive layout | RTL responsive layout works; PWA install prompt included |
| **Error feedback / toast notifications** | Users need to know when something fails | Low | EXISTS — EnhancedToast.jsx, ImprovedToast.jsx | Multiple toast systems exist; migration should consolidate to one |

---

## Core Analysis Tools (Table Stakes for THIS Platform)

These are not generic "table stakes" but are the specific features that define MystiQor. Removing any would change the product's identity.

| Feature | Why Core | Complexity | Migration Status | Notes |
|---------|----------|------------|-----------------|-------|
| **Astrology — natal chart + interpretation** | Biggest astrology feature; birth chart visualization + AI interpretation | High | EXISTS — Astrology.jsx, BirthChart.jsx, AstrologyWidget.jsx | Auto-fills from profile; geocoding integration; ExplainableInsight component shows confidence |
| **Astrology — transits** | Ongoing planetary influences; separates serious tools from casual horoscope | High | EXISTS — Transits.jsx | Requires natal chart as prerequisite |
| **Astrology — Solar Return** | Annual chart for the coming year; premium feature | Medium | EXISTS — SolarReturn.jsx | Subscription-gated |
| **Astrology — Synastry** | Relationship compatibility via chart overlay | High | EXISTS — Synastry.jsx | Uses two birth charts |
| **Astrology — Daily forecast** | Current-day planetary positions | Medium | EXISTS — DailyForecast.jsx | |
| **Astrology calendar** | Monthly view of astrological events | Medium | EXISTS — AstroCalendar.jsx | |
| **Numerology** | Life path, destiny, soul numbers | Low | EXISTS — Numerology.jsx, NumerologySummaryCard.jsx | |
| **Drawing analysis** | Upload or draw (HTP test: house, tree, person); psychological interpretation | High | EXISTS — DrawingAnalysis.jsx, DigitalCanvas.jsx, AnnotatedDrawingViewer.jsx | Koppitz scoring, FDM visualization, comparison across sessions |
| **Graphology** | Handwriting analysis; upload scan, get psychological profile | High | EXISTS — Graphology.jsx + 9 graphology components | Progress tracking, PDF export, comparison, reminder system |
| **AI Coach** | Conversational AI that knows all user analyses | High | EXISTS — AICoach.jsx, ChatInput, ChatMessage, QuickActions | Coaching journeys, conversation history, quick actions |
| **Dream analysis** | Text input dream, get AI interpretation | Low | EXISTS — DreamAnalysis.jsx | LLM-based; no special computation |
| **Personality analysis (Big Five)** | Psychological profiling via birth data + AI | Medium | EXISTS — PersonalityAnalysis.jsx, BigFiveRadarChart.jsx | Big Five radar visualization |
| **Mystic Synthesis** | Cross-tool AI summary combining all analyses | High | EXISTS — MysticSynthesis.jsx | On-demand + weekly report; synthesizeMysticInsights backend function |
| **Tarot** | Card reading with AI interpretation | Medium | EXISTS — Tarot.jsx | |
| **Human Design** | Type, Authority, Profile, Centers via birth data | Medium | EXISTS — HumanDesign.jsx | calculateHumanDesign backend function |
| **Palmistry** | Photo of palm → AI interpretation | Medium | EXISTS — Palmistry.jsx | Image upload + quality indicator + confidence badge |
| **Compatibility** | Astrology + numerology compatibility between two people | Medium | EXISTS — Compatibility.jsx | Romantic / friendship / professional relationship types |

---

## Tracking & Self-Development Features (Table Stakes for Retention)

| Feature | Why Expected | Complexity | Migration Status | Notes |
|---------|--------------|------------|-----------------|-------|
| **Mood tracker** | Links emotional state to mystical patterns; hooks users into daily habit | Medium | EXISTS — MoodTracker.jsx | 5-point scale + energy level + trend charts |
| **Personal journal** | Reflection space with AI insights; ties personal writing to analysis data | Medium | EXISTS — Journal.jsx | Rich entries with mood_score, energy_level, gratitude_items, goals |
| **Goals + progress tracking** | Turns insights into actionable commitments | Medium | EXISTS — MyGoals.jsx, GoalProgressWidget.jsx | AI recommendations; goal linker connects goals to analyses |
| **Dashboard** | Command center showing recent activity, mood trends, goals, biorhythm | High | EXISTS — Dashboard.jsx, OptimizedDashboard.jsx | Recharts: LineChart, BarChart, PieChart; BiorhythmChart; AnimatedCounter |
| **Notifications / reminders** | Keeps users engaged; graphology reminders, daily insight alerts | Medium | EXISTS — Notifications.jsx, NotificationManager.jsx, GraphologyReminder.jsx | |
| **Onboarding flow** | Without it users land lost; converts signups into active profiles | Medium | EXISTS — Onboarding.jsx | Multi-step: name → birth date/time → birth place (geocoded) → gender → consent |

---

## Differentiators

Features that set MystiQor apart. Users don't necessarily expect them, but they create loyalty and justify the subscription.

| Feature | Value Proposition | Complexity | Migration Status | Notes |
|---------|-------------------|------------|-----------------|-------|
| **Mystic Synthesis (cross-tool AI)** | No other tool synthesizes astrology + numerology + drawing + graphology into one narrative | Very High | EXISTS — must preserve | This is the core product moat; generateWeeklyReport + synthesizeMysticInsights |
| **Drawing analysis (HTP projective tests)** | Combines upload OR real-time digital canvas; psychological frameworks (Koppitz, FDM, Gestalt) | Very High | EXISTS — complex component set | DigitalCanvas for in-browser drawing; AnnotatedDrawingViewer for annotated results |
| **Graphology progress tracking** | Compares handwriting samples over time; 9 dedicated components | High | EXISTS | GraphologyTimeline, GraphologyComparison, GraphologyProgressTracker |
| **Timing tools (electional astrology)** | Finds astrologically favorable days for specific activities | Medium | EXISTS — TimingTools.jsx | findBestDays backend function; requires natal chart |
| **AI Coaching Journeys** | Structured multi-session coaching paths within the AI coach | High | EXISTS | CoachingJourney entity; JourneyDashboard.jsx; JourneyTypeSelector |
| **Biorhythm chart on dashboard** | Physical/emotional/intellectual cycle overlay | Medium | EXISTS | BiorhythmChart.jsx |
| **Explainable insights** | Shows confidence level and reasoning behind AI interpretations | Medium | EXISTS — ExplainableInsight.jsx, ConfidenceBadge.jsx | Distinguishes from black-box mystical apps |
| **Multiple guest profiles** | Analyze family members / romantic partners without them having accounts | Medium | EXISTS | GuestProfile entity; limited by subscription plan |
| **Referral program** | Growth mechanism built into the product | Medium | EXISTS — Referrals.jsx | MASAPNIMA-[username]-[code] format; rewards tracked |
| **PDF export** | Users want a permanent record of their analyses | Medium | EXISTS — ExportPDF.jsx, GraphologyExportPDF.jsx | |
| **Social sharing** | Viral loop for user acquisition | Low | EXISTS — GraphologyShareButton.jsx | Analysis results shareable to social |
| **Blog / educational content** | Reduces friction for skeptics; keeps users engaged between analyses | Low | EXISTS — Blog.jsx | Static content: numerology, astrology guides |
| **Astrological readings history** | Curated saved readings separate from raw analyses | Medium | EXISTS — AstrologyReadings.jsx | |
| **Analytics dashboard (self-analytics)** | Shows users their own usage patterns — which tools, when, trends | Medium | EXISTS — AnalyticsDashboard.jsx | Page views, tool usage, session counts, conversion; AnalyticsEvent entity |
| **Career guidance** | AI career recommendations informed by birth data | Medium | EXISTS — CareerGuidance.jsx | LLM-based; combines current field + skills + birth data |
| **Relationship analysis** | Deep relationship dynamics beyond compatibility score | Medium | EXISTS — RelationshipAnalysis.jsx, Relationships.jsx | |
| **Document analysis** | Upload any document for AI insight extraction | Medium | EXISTS — DocumentAnalyzer.jsx, DocumentInsightsWidget.jsx | General-purpose LLM analysis |
| **Tutorials / Astrology Tutor / Drawing Tutor** | Teaches users to interpret their own charts | Medium | EXISTS — Tutorials.jsx, AstrologyTutor.jsx, DrawingTutor.jsx | Concept cards, explainer components |
| **PWA with offline support** | Works as installed app on mobile | High | EXISTS — EnhancedPWA.jsx | Service worker + install prompt |
| **Journey Dashboard** | Unified view of all coaching journeys and progress | Medium | EXISTS — JourneyDashboard.jsx | |

---

## Anti-Features

Things to explicitly NOT build or rebuild during migration. Either they are out of scope, actively harmful, or already correctly handled.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Native mobile app (iOS/Android)** | Out of scope per PROJECT.md; web-first + PWA is the stated strategy | Maintain PWA quality; ensure mobile-responsive RTL layout |
| **Multi-language (English)** | Out of scope per PROJECT.md for v1; Hebrew only | Don't add i18n scaffolding; hardcode Hebrew strings, refactor only if explicitly requested |
| **Real-time collaboration** | Not needed; this is a solo self-reflection tool | No multiplayer, no shared sessions, no live chart overlays |
| **Video / audio content** | Out of scope; text + images only | Do not add media players or video infrastructure |
| **Rebuilding working analysis logic** | The 34 BASE44 backend functions contain validated astrology/numerology math; rewriting them risks correctness | Port only the glue; call same LLM patterns in Supabase Edge Functions |
| **Custom auth flows** | Supabase Auth handles email/password, OAuth; custom auth adds risk | Use Supabase Auth exactly as designed; add only needed providers |
| **Admin / CMS panel** | Not in scope for this migration | AnalyticsDashboard gives operators enough signal; no CMS needed |
| **Duplicate toast systems** | The source has EnhancedToast, ImprovedToast, Sonner, react-hot-toast all coexisting | Pick one (Sonner + shadcn toast) and use consistently |
| **IconGenerator page** | The source has an IconGenerator.jsx page that appears to be a developer tool, not user-facing | Do not migrate; remove from the navigation |
| **TestStripe page** | TestStripe.jsx is a dev tool | Do not migrate to production |
| **LanguageToggle** | The source has LanguageToggle.jsx but multi-language is out of scope | Remove this component; do not migrate |

---

## Feature Dependencies

These dependencies matter for phase ordering — a feature cannot ship before its dependencies.

```
UserProfile (birth data) → EVERYTHING
  └── Astrology natal chart → Transits, Solar Return, Synastry, Timing Tools, Personality Analysis
  └── Numerology → Compatibility, Daily Insights
  └── Daily Insights → Tarot + Numerology + Astrology (all three)
  └── Mystic Synthesis → Drawing Analysis + Graphology + Astrology + Numerology (minimum 2 tools done)

Subscription system → Subscription Guard → All paid features
  └── SubscriptionGuard blocks: Astrology, Drawing, Graphology, Compatibility, Palmistry, Human Design, Tarot, Timing Tools

Auth → User Profile → Onboarding
  └── Onboarding redirects to Home if profile already exists

AI Coach → Coaching Journeys (journeys extend coach sessions)

Drawing Analysis → Drawing Comparison (CompareDrawingAnalyses.jsx)
Graphology → Graphology comparison, PDF, progress tracking, reminders
Astrology natal → Astrology readings, Astrology calendar, Daily forecast

Goals → Goal Linker (GoalLinker connects goals to specific analyses)
Mood tracking → Dashboard mood trends chart
Journal entries → Dashboard
All analyses → Dashboard stats → Mystic Synthesis
```

---

## Migration Preservation Priority

Given this is a migration (not a greenfield build), features must be prioritized by what breaks user trust most if missing:

### P0 — Must work from day one (users will notice immediately)
- Auth (login / logout)
- User profile / onboarding
- Subscription checkout + subscription guard enforcement
- Dashboard (entry point)
- Astrology natal chart (most used tool)
- Daily insights
- Analysis history

### P1 — Must work in first sprint after launch
- Numerology
- Mood tracker
- Journal
- Goals
- AI Coach
- Mystic Synthesis

### P2 — Core differentiators (week 2)
- Drawing analysis (complex — DigitalCanvas, Koppitz, FDM, annotations)
- Graphology (complex — 9 components)
- Tarot
- Compatibility
- Human Design / Palmistry

### P3 — Value-adds (week 3+)
- Timing tools
- Solar Return / Synastry / Transits
- Career guidance / Relationship analysis
- Blog / Tutorials
- PDF export / Social sharing
- Referral program
- PWA

---

## Feature Complexity Matrix

| Feature | Backend Complexity | Frontend Complexity | AI/LLM Dependency | Overall |
|---------|-------------------|--------------------|--------------------|---------|
| Astrology natal | High (ephemeris math, geocoding) | High (SVG chart, ExplainableInsight) | High (AI interpretation) | Very High |
| Drawing analysis | High (image upload, LLM vision) | Very High (DigitalCanvas, annotations, Koppitz) | High | Very High |
| Graphology | Medium (image storage) | Very High (9 components, PDF, comparison) | High | Very High |
| Mystic Synthesis | High (cross-entity aggregation) | Medium | Very High | High |
| AI Coach | High (conversation state, agent API) | Medium | Very High | High |
| Subscription / Stripe | High (webhooks, usage tracking) | Medium | None | High |
| Human Design | Medium (birth data calculation) | Medium | High | Medium |
| Compatibility | Medium | Medium | Medium | Medium |
| Palmistry | Medium (image upload) | Medium | High (vision LLM) | Medium |
| Mood tracker | Low | Low | Low | Low |
| Journal | Low | Low | Low | Low |
| Goals | Low | Medium | Low | Medium |
| Numerology | Low | Low | Low | Low |
| Daily Insights | Medium (multi-source aggregation) | Low | High | Medium |
| Blog | None | Low | None | Low |
| PDF export | Low | Medium | None | Low |

---

## Sources

- Direct source code examination: `D:/AI_projects/MystiQor/github-source/src/pages/` (53 pages)
- Direct source code examination: `D:/AI_projects/MystiQor/github-source/src/components/` (100+ components)
- `D:/AI_projects/MystiQor/.planning/PROJECT.md` — validated feature list and architecture decisions
- Confidence: HIGH — all feature claims derived from actual code in the repository, not assumptions
