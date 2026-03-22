---
phase: 04-tools-tier-1
plan: 06
subsystem: feature
tags: [daily-insights, llm, cache, tarot, numerology, astrology, react-query, framer-motion]

# Dependency graph
requires:
  - phase: 01-infrastructure-hardening
    provides: invokeLLM service, Supabase client, LLM validation
  - phase: 02-auth-onboarding
    provides: auth middleware, user profiles table
  - phase: 00-foundation
    provides: numerology calculations (reduceToSingleDigit), astrology constants (ZODIAC_SIGNS)
provides:
  - Daily insights API route with date-keyed LLM cache
  - InsightHeroCard — hero display component with markdown + tarot + actionable tip
  - InsightHistoryList — scrollable past insights with expand-on-click
  - daily-insights page with module toggles + SubscriptionGuard
  - DailyInsightModulesSchema — Zod schema for 4 toggleable sections
affects: [04-tools-tier-1, dashboard, subscription-guard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - date-keyed cache pattern — insight_date + user_id + mood_type='daily' uniqueness key
    - single LLM call combining 3 modules (per Pitfall 7)
    - random tarot card selection using count + range offset
    - useQuery with JSON-serialized modules as queryKey for module-aware caching
    - AnimatePresence for expand/collapse in InsightHistoryList

key-files:
  created:
    - mystiqor-build/src/app/api/tools/daily-insights/route.ts
    - mystiqor-build/src/lib/validations/daily-insights.ts
    - mystiqor-build/src/components/features/daily-insights/InsightHeroCard.tsx
    - mystiqor-build/src/components/features/daily-insights/InsightHistoryList.tsx
    - mystiqor-build/src/app/(auth)/tools/daily-insights/page.tsx
  modified:
    - mystiqor-build/src/types/database.ts (InsightMoodType expanded with 'daily' and 'forecast')

key-decisions:
  - "InsightMoodType expanded to include 'daily' and 'forecast' — existing manual type was too narrow vs generated schema which uses string"
  - "UTC date via toISOString().split('T')[0] ?? substring(10) — strict type to avoid string|undefined"
  - "tarot_cards table access wrapped in try/catch with fallback name — table may not exist in all envs"
  - "Single LLM call with all 3 data points in one prompt — avoids 3-call latency and cost"
  - "extractTipFromContent uses last paragraph regex — heuristic that works for structured LLM output"
  - "History endpoint uses separate query param ?history=true rather than separate route — simpler routing"

patterns-established:
  - "date-keyed LLM cache: SELECT ... WHERE user_id=? AND insight_date=today AND mood_type='daily' LIMIT 1 BEFORE any LLM call"
  - "Module toggles stored in React state, serialized as JSON query param to API, tracked in useQuery queryKey"
  - "InsightHistoryItem expand-on-click using AnimatePresence height 0→auto transition"

requirements-completed: [TRCK-05]

# Metrics
duration: 20min
completed: 2026-03-22
---

# Phase 4 Plan 06: Daily Insights Summary

**Daily insights page combining tarot + numerology + astrology into a single personalized LLM reading with date-keyed caching, hero card, history scroll, and module toggles**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-03-22
- **Tasks:** 2
- **Files created:** 5
- **Files modified:** 1

## Accomplishments

- Created `GET /api/tools/daily-insights` with cache-check-first logic: if `daily_insights` row exists for user+today+mood_type='daily', returns it without LLM call
- Random tarot card selection via count + range offset — graceful fallback if `tarot_cards` table empty/absent
- Single `invokeLLM` call combining zodiac sign + numerology day number + tarot card (Pitfall 7 compliance)
- `?history=true` path returns past 30 insights in descending order
- `DailyInsightModulesSchema` with 4 toggleable sections: astrology/numerology/tarot/recommendation
- `InsightHeroCard` — framer-motion entrance, gradient purple/indigo theme, ReactMarkdown content, tarot section, actionable tip box
- `InsightHistoryList` — stagger-animated list, expand-on-click with AnimatePresence, skeleton loading, empty state
- `daily-insights/page.tsx` — module toggles, hero card, history list, SubscriptionGuard, two useQuery hooks

## Task Commits

1. **Task 1: Daily insights API route + validation schema** — `0bc1e64` (feat)
2. **Task 2: InsightHeroCard + InsightHistoryList + page** — UNCOMMITTED (sandbox permission restriction prevented git commit in submodule after Task 1)

## Files Created/Modified

- `mystiqor-build/src/app/api/tools/daily-insights/route.ts` — GET endpoint with cache-or-generate + history path
- `mystiqor-build/src/lib/validations/daily-insights.ts` — DailyInsightModulesSchema + DEFAULT_MODULES
- `mystiqor-build/src/components/features/daily-insights/InsightHeroCard.tsx` — hero card with ReactMarkdown, tarot, tip
- `mystiqor-build/src/components/features/daily-insights/InsightHistoryList.tsx` — scrollable history with expand-on-click
- `mystiqor-build/src/app/(auth)/tools/daily-insights/page.tsx` — module toggles + hero + history + SubscriptionGuard
- `mystiqor-build/src/types/database.ts` — InsightMoodType extended with 'daily' and 'forecast'

## Decisions Made

- InsightMoodType in `database.ts` was `'inspiring' | 'reflective' | 'empowering' | 'cautionary' | 'celebratory'` — didn't include `'daily'` or `'forecast'` used by the cache pattern. Extended the union to fix a pre-existing type error in the astrology forecast route too.
- Tarot card random selection uses count query + `.range(offset, offset)` — avoids sorting by random which isn't performant
- History and today's insight use separate `useQuery` queryKeys — cache isolation so history doesn't re-fetch when modules change
- `useQuery` queryKey for today's insight includes modules object — ensures cache invalidation when user toggles sections

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed InsightMoodType too narrow**
- **Found during:** Task 1
- **Issue:** `InsightMoodType = 'inspiring' | 'reflective' | 'empowering' | 'cautionary' | 'celebratory'` did not include `'daily'` or `'forecast'` — caused TypeScript errors in both new daily-insights route and the pre-existing astrology forecast route
- **Fix:** Extended union to include `'daily'` and `'forecast'` (and `'calendar'` added by another parallel agent)
- **Files modified:** `mystiqor-build/src/types/database.ts`
- **Commit:** included in Task 1 commit `0bc1e64`

**2. [Rule 3 - Blocking] Fixed string|undefined type for UTC date**
- **Found during:** Task 1
- **Issue:** `new Date().toISOString().split('T')[0]` returns `string | undefined` in TypeScript strict mode
- **Fix:** Added explicit `string` type annotation with `?? substring(0, 10)` fallback
- **Files modified:** `mystiqor-build/src/app/api/tools/daily-insights/route.ts`

## Known Stubs

None — all data flows are wired to real API endpoints and database tables.

## Issues Encountered

**Sandbox Permission Restriction (Task 2 commit):** After successfully committing Task 1 (`0bc1e64`), subsequent git commands targeting `mystiqor-build/` were blocked by the sandbox permission system. All Task 2 files have been created and TypeScript passes (0 errors), but the commit could not be made programmatically. The files exist on disk at:
- `mystiqor-build/src/components/features/daily-insights/InsightHeroCard.tsx`
- `mystiqor-build/src/components/features/daily-insights/InsightHistoryList.tsx`
- `mystiqor-build/src/app/(auth)/tools/daily-insights/page.tsx`

Manual commit or retry is needed for these 3 files.

## Self-Check: PARTIAL

**Files verified to exist:**
- `D:/AI_projects/MystiQor/mystiqor-build/src/app/api/tools/daily-insights/route.ts` — FOUND
- `D:/AI_projects/MystiQor/mystiqor-build/src/lib/validations/daily-insights.ts` — FOUND
- `D:/AI_projects/MystiQor/mystiqor-build/src/components/features/daily-insights/InsightHeroCard.tsx` — FOUND
- `D:/AI_projects/MystiQor/mystiqor-build/src/components/features/daily-insights/InsightHistoryList.tsx` — FOUND
- `D:/AI_projects/MystiQor/mystiqor-build/src/app/(auth)/tools/daily-insights/page.tsx` — FOUND

**Commits verified:**
- Task 1: `0bc1e64` — FOUND (in mystiqor-build git log)
- Task 2: UNCOMMITTED — sandbox restriction prevented commit

**TypeScript:** `npx tsc --noEmit` — 0 errors

---
*Phase: 04-tools-tier-1*
*Completed: 2026-03-22*
