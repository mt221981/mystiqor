---
phase: 04-tools-tier-1
plan: "04"
subsystem: ui
tags: [astrology, react-query, framer-motion, date-fns, llm, caching, subscription]

# Dependency graph
requires:
  - phase: 04-tools-tier-1/04-01
    provides: BirthChart component, astrology constants, API route patterns
  - phase: 02-auth-onboarding
    provides: Supabase auth, user profiles, SubscriptionGuard
  - phase: 01-infrastructure-hardening
    provides: invokeLLM service, daily_insights table, database types

provides:
  - GET /api/tools/astrology/forecast — personalized daily zodiac forecast via LLM, cached per user/day
  - GET /api/tools/astrology/calendar — monthly astro events (5-8) via LLM, cached per user/month
  - DailyForecast component — zodiac-themed card with energy/love/career/health sections + lucky number
  - AstroCalendar component — monthly grid with event dots, day selection, event detail panel
  - forecast/page.tsx — useQuery-driven forecast page with SubscriptionGuard
  - calendar/page.tsx — month-navigable calendar page with SubscriptionGuard

affects:
  - 04-07 (phase verification — both pages included in final audit)
  - 11-06 (MD3 reskin of forecast and calendar components)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - GET-only API routes for read-only AI tools (not POST)
    - Forecast cache via daily_insights table with mood_type='forecast' per user/day
    - Calendar cache via daily_insights table with mood_type='calendar' per user/month/year
    - invokeLLM with responseSchema + zodSchema for structured JSON validation
    - ForecastResponse validated by Zod; calendar events validated by z.array(AstroEventSchema)
    - date-fns v4 locale import: import { he } from 'date-fns/locale/he'
    - parseLocalDate helper for timezone-safe YYYY-MM-DD to Date conversion
    - AstroEvent type exported from route.ts and imported by component and page

key-files:
  created:
    - mystiqor-build/src/app/api/tools/astrology/forecast/route.ts
    - mystiqor-build/src/components/features/astrology/DailyForecast/index.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/forecast/page.tsx
    - mystiqor-build/src/app/api/tools/astrology/calendar/route.ts
    - mystiqor-build/src/components/features/astrology/AstroCalendar/index.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/calendar/page.tsx
  modified: []

key-decisions:
  - "GET handler (not POST) for forecast — forecast is read-only for a given day, GET is semantically correct"
  - "mood_type='forecast' used to differentiate from 'daily' insights in the shared daily_insights table"
  - "AstroEvent type exported from calendar/route.ts — component and page import from single source of truth"
  - "parseLocalDate helper for YYYY-MM-DD strings — avoids timezone drift from new Date(dateString)"
  - "date-fns v4 locale path: date-fns/locale/he (not date-fns/locale)"
  - "Zodiac derivation via ZODIAC_DATE_RANGES array on server — no client lib needed"

patterns-established:
  - "Caching pattern: check daily_insights by user_id + mood_type + insight_date before calling LLM"
  - "LLM structured output: responseSchema (JSON schema) + zodSchema (Zod) for validated typed responses"
  - "Calendar month key: '{year}-{month}-01' as insight_date for per-month cache bucket"

requirements-completed:
  - ASTR-06
  - ASTR-07

# Metrics
duration: 20min
completed: "2026-03-25"
---

# Phase 4 Plan 04: Daily Forecast + Astro Calendar Summary

**GET-only LLM forecast cached per user/day in daily_insights, monthly astro calendar with 5-8 events cached per month, both with Hebrew zodiac content and SubscriptionGuard**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-25T00:00:00Z
- **Completed:** 2026-03-25T00:20:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Daily forecast API route (GET) caches per user per day using `daily_insights` with `mood_type='forecast'` — LLM called only once per day per user
- Astro calendar API route (GET) generates 5-8 Hebrew events per month via structured LLM output, cached in `daily_insights` with `mood_type='calendar'`
- `DailyForecast` component renders zodiac emoji header, Hebrew sign name, energy/love/career/health sections with lucide icons, and lucky number card
- `AstroCalendar` component renders monthly grid with event dots, animated day selection, event detail panel, and full event list — all using date-fns v4 with Hebrew locale
- Both pages wrapped in `SubscriptionGuard feature="analyses"` with framer-motion transitions
- TypeScript compiles with zero errors (`tsc --noEmit` exits 0)

## Task Commits

1. **Task 1: Daily forecast API route + component + page** - `6c0b5d1` (feat(04-04): daily forecast + astro calendar pages and API routes)
2. **Task 2: Astro calendar API route + component + page** - `6c0b5d1` (included in same commit)
3. **MD3 reskin applied later** - `5ddd8dd` (feat(11-06): reskin career, relationships, document, forecast, calendar pages with MD3 tokens)

## Files Created/Modified

- `mystiqor-build/src/app/api/tools/astrology/forecast/route.ts` — GET handler: auth check, zodiac derivation from birth_date, daily_insights cache check, invokeLLM call with ForecastResponseSchema, save + return
- `mystiqor-build/src/components/features/astrology/DailyForecast/index.tsx` — Card with zodiac emoji/name, summary via ReactMarkdown, 4-section grid (energy/love/career/health), lucky number display, skeleton loading
- `mystiqor-build/src/app/(auth)/tools/astrology/forecast/page.tsx` — useQuery auto-fetch on mount, SubscriptionGuard, framer-motion transition, sonner error toast
- `mystiqor-build/src/app/api/tools/astrology/calendar/route.ts` — GET handler: Zod query validation (month/year coerce), cache check, invokeLLM with CalendarResponseSchema (array of events), save to daily_insights
- `mystiqor-build/src/components/features/astrology/AstroCalendar/index.tsx` — Monthly grid with 7-column layout, Hebrew day names, event dot indicators, AnimatePresence detail panel, event list sorted by date
- `mystiqor-build/src/app/(auth)/tools/astrology/calendar/page.tsx` — State-driven month/year, useQuery refetch on change, CalendarSkeleton, SubscriptionGuard

## Decisions Made

- Used GET not POST for forecast — forecast is read-only and idempotent, GET is semantically correct and enables browser/CDN caching
- `mood_type='forecast'` differentiates forecast cache from `'daily'` and `'calendar'` rows in the shared `daily_insights` table
- `AstroEvent` type exported directly from `calendar/route.ts` — avoids type duplication between route, component, and page
- `parseLocalDate` helper converts `YYYY-MM-DD` strings to `new Date(year, month-1, day)` — avoids `new Date("2026-03-15")` UTC midnight timezone drift
- date-fns v4 locale path is `date-fns/locale/he` (not `date-fns/locale`) — per STATE.md decision from Phase 3

## Deviations from Plan

None — plan executed exactly as written. All 6 files created per spec, all acceptance criteria pass.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Both ASTR-06 (daily forecast) and ASTR-07 (astro calendar) requirements fulfilled
- Pages available at `/tools/astrology/forecast` and `/tools/astrology/calendar`
- Ready for Phase 4 Plan 05 (daily insights + tarot tools)

---
*Phase: 04-tools-tier-1*
*Completed: 2026-03-25*
