---
phase: 09-learning-history-analytics
plan: 04
subsystem: ui
tags: [analytics, recharts, react-query, pie-chart, line-chart, stat-cards, self-analytics, period-selector]

# Dependency graph
requires:
  - phase: 09-01
    provides: TOOL_NAMES constant (local fallback used — shared import deferred to 09-05)
  - phase: 03-ux-shell-profile-dashboard-tracking
    provides: analyses/mood_entries/goals tables with user_id RLS
provides:
  - GET /api/analytics — aggregated self-analytics from analyses + mood_entries + goals
  - AnalyticsQuerySchema at @/lib/validations/analytics
  - ToolUsageChart — PieChart (ssr:false) for tool type distribution
  - ActivityHeatmap — LineChart (ssr:false) for activity over time
  - UsageStats — 4 stat cards: total analyses, avg mood, goals completed, completion rate
  - /analytics page with period selector (7d/30d/90d/all)
affects:
  - 09-05-plan (verification plan; TOOL_NAMES local fallback should be replaced with shared import)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Custom Tooltip components for Recharts v3 type safety (same as Phase 03 decision)
    - dynamic() per-export for Recharts PieChart/LineChart components (ssr:false)
    - Promise.all parallel Supabase queries for multi-table aggregation
    - Server-side aggregation returns pre-computed stats to client (no N+1)
    - Local TOOL_NAMES fallback in page.tsx — deferred shared import (09-05 cleanup)

key-files:
  created:
    - mystiqor-build/src/lib/validations/analytics.ts
    - mystiqor-build/src/app/api/analytics/route.ts
    - mystiqor-build/src/components/features/analytics/ToolUsageChart.tsx
    - mystiqor-build/src/components/features/analytics/ActivityHeatmap.tsx
    - mystiqor-build/src/components/features/analytics/UsageStats.tsx
    - mystiqor-build/src/app/(auth)/analytics/page.tsx
  modified: []

key-decisions:
  - "Custom Tooltip components used for Recharts v3 — ValueType|undefined incompatibility with function formatter types (same decision as Phase 03)"
  - "Local TOOL_NAMES defined in analytics/page.tsx — avoids cross-plan dependency on 09-01; 09-05 can replace with shared import"
  - "ActivityHeatmap reused for moodTrend section — maps mood score to count field; avoids third chart type duplication"
  - "Server-side aggregation in API route — toolDistribution, activityByDate, moodTrend, stats computed server-side; client receives ready-to-render data"
  - "nullable mood_score/energy_level handled with filter(v => v !== null) type guards — database.generated.ts marks both as number|null"

patterns-established:
  - "Analytics feature components in src/components/features/analytics/ — ToolUsageChart, ActivityHeatmap, UsageStats"
  - "Promise.all for parallel multi-table Supabase queries with period-based date cutoff"
  - "period enum ('7d'|'30d'|'90d'|'all') pattern for time-range selectors"

requirements-completed: [UX-09]

# Metrics
duration: 15min
completed: 2026-03-24
---

# Phase 09 Plan 04: Self-Analytics Dashboard Summary

**Personal analytics dashboard at /analytics with PieChart tool distribution, LineChart activity timeline, mood trend, and 4 stat cards; API aggregates analyses + mood_entries + goals with period selector (7d/30d/90d/all)**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-24T13:44:53Z
- **Completed:** 2026-03-24T14:00:00Z
- **Tasks:** 2
- **Files modified:** 6 created

## Accomplishments

- Created `AnalyticsQuerySchema` (Zod) with period enum and `GET /api/analytics` that aggregates 3 tables in parallel
- API computes `toolDistribution`, `activityByDate`, `moodTrend`, `stats` server-side (no N+1, no client-side joins)
- Created `ToolUsageChart` — PieChart with custom Tooltip, 8 purple COLORS, empty state Hebrew message
- Created `ActivityHeatmap` — LineChart with custom Tooltip, date DD/MM formatting, empty state Hebrew message
- Created `UsageStats` — 4 stat cards (total analyses, avg mood, goals completed/total, completion rate %)
- Created `/analytics` page with period selector, useQuery fetching `/api/analytics?period=`, full empty/loading/error states

## Task Commits

Each task was committed atomically:

1. **Task 1: Analytics API route + Zod validation** — `7ed0350` (feat)
2. **Task 2: Analytics dashboard page with charts and stat cards** — `54f4528` (feat)

## Files Created/Modified

- `src/lib/validations/analytics.ts` — AnalyticsQuerySchema: period enum (7d/30d/90d/all)
- `src/app/api/analytics/route.ts` — GET handler: auth check, 3 parallel queries, server-side aggregation
- `src/components/features/analytics/ToolUsageChart.tsx` — PieChart (dynamic, ssr:false) + custom Tooltip
- `src/components/features/analytics/ActivityHeatmap.tsx` — LineChart (dynamic, ssr:false) + custom Tooltip
- `src/components/features/analytics/UsageStats.tsx` — 4 stat cards: BarChart3/Smile/Target/TrendingUp icons
- `src/app/(auth)/analytics/page.tsx` — /analytics page with period selector, useQuery, all chart components

## Decisions Made

- Custom Tooltip components used for Recharts v3 — `ValueType|undefined` incompatibility with function formatter (same pattern as Phase 03 MoodTrendChart decision)
- Local TOOL_NAMES defined in page.tsx — avoids cross-plan dependency; 09-05 verification plan can replace with `@/lib/constants/tool-names` shared import
- ActivityHeatmap reused for mood trend section — maps `mood` field to `count`; avoids a third chart type
- Server-side aggregation: toolDistribution computed as `Record<string, number>`, activityByDate as `Array<{date, count}>`, moodTrend as `Array<{date, mood, energy}>`
- `nullable mood_score/energy_level` handled with `.filter((v): v is number => v !== null)` type guards

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nullable mood_score/energy_level type errors in API route**
- **Found during:** Task 1 verification (tsc --noEmit)
- **Issue:** `database.generated.ts` declares `mood_score: number | null` and `energy_level: number | null` — arithmetic operations on nullable types rejected by TypeScript strict mode
- **Fix:** Added `.filter((v): v is number => v !== null)` type guard before reduce operations; split into `moodScores` and `energyLevels` filtered arrays
- **Files modified:** src/app/api/analytics/route.ts
- **Commit:** 7ed0350 (included in Task 1 commit)

**2. [Rule 1 - Bug] Fixed Recharts v3 Tooltip formatter type incompatibility in charts**
- **Found during:** Task 2 verification (tsc --noEmit)
- **Issue:** `formatter` prop type expects `Formatter<ValueType, NameType>` where `ValueType` includes `undefined` — function signature `(value: number) => [string, string]` is incompatible. Same as Phase 03 pattern.
- **Fix:** Replaced `formatter` prop with custom `<CustomTooltip />` components using `content={<CustomTooltip />}` pattern
- **Files modified:** src/components/features/analytics/ToolUsageChart.tsx, ActivityHeatmap.tsx
- **Commit:** 54f4528 (included in Task 2 commit)

### Out of Scope (Not Fixed)

Pre-existing TypeScript errors in `LearningPathCard.tsx` and `ProgressTracker.tsx` (from parallel plans 09-02/09-03). Confirmed pre-existing by git stash test. Documented per SCOPE BOUNDARY rule.

---

**Total deviations:** 2 auto-fixed (Rule 1 - bugs), 0 scope creep

## Issues Encountered

- Pre-existing TypeScript errors in `src/components/features/learn/LearningPathCard.tsx` and `ProgressTracker.tsx` from other parallel Phase 09 plans. Confirmed pre-existing with `git stash` test. Out of scope per SCOPE BOUNDARY rule.

## Known Stubs

- `TOOL_NAMES` in `src/app/(auth)/analytics/page.tsx` lines 21-42 — local copy with all 18 tool types. Plan specifies this is intentional fallback; 09-05 (or a cleanup pass) should replace with `import { TOOL_NAMES } from '@/lib/constants/tool-names'`. Does NOT prevent plan goal from being achieved.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `/analytics` page is functional and wired to the sidebar (added in Plan 09-01)
- API aggregates analyses + mood_entries + goals with period filtering
- Charts are ready; actual data renders once user has analyses/mood entries/goals
- Plan 09-05 (verification) can refactor TOOL_NAMES to use shared constant

---
*Phase: 09-learning-history-analytics*
*Completed: 2026-03-24*

## Self-Check: PASSED

All created files exist and all commits verified:
- FOUND: src/lib/validations/analytics.ts
- FOUND: src/app/api/analytics/route.ts
- FOUND: src/components/features/analytics/ToolUsageChart.tsx
- FOUND: src/components/features/analytics/ActivityHeatmap.tsx
- FOUND: src/components/features/analytics/UsageStats.tsx
- FOUND: src/app/(auth)/analytics/page.tsx
- COMMIT 7ed0350: feat(09-04): Analytics API route + Zod validation
- COMMIT 54f4528: feat(09-04): analytics dashboard page with charts and stat cards
