---
phase: 04-tools-tier-1
plan: 05
subsystem: ui, api
tags: [astrology, birth-chart, svg, llm, react-query, react-hook-form, zod, shadcn, rtl]

# Dependency graph
requires:
  - phase: 04-tools-tier-1
    provides: BirthChart SVG component (Plan 01), astrology services (chart.ts, aspects.ts, solar-return.ts, prompts/interpretation.ts), astrology constants
provides:
  - POST /api/tools/astrology/birth-chart — LLM planet approximation + chart assembly + AI interpretation
  - AIInterpretation component — react-markdown panel with expand/collapse
  - PlanetTable component — shadcn Table with planet symbols, Hebrew sign names, degrees, houses
  - AspectList component — colored aspect badges + strength progress bars
  - QuickSummary component — Sun/Moon/Rising 3-card layout
  - /tools/astrology page — full natal chart page with form, SVG, 4 info panels
  - table.tsx — new shadcn Table UI component
affects: [phase-05, phase-06]

# Tech tracking
tech-stack:
  added: [table.tsx (shadcn UI component, RTL-compatible)]
  patterns:
    - LLM planet approximation with Zod validation + fallback positions
    - next/dynamic for heavy SVG components (ssr:false)
    - useQuery for profile pre-fill + useMutation for tool submission
    - Tabs-based info panels for natal chart data

key-files:
  created:
    - mystiqor-build/src/app/api/tools/astrology/birth-chart/route.ts
    - mystiqor-build/src/components/features/astrology/ChartInfoPanels/AIInterpretation.tsx
    - mystiqor-build/src/components/features/astrology/ChartInfoPanels/PlanetTable.tsx
    - mystiqor-build/src/components/features/astrology/ChartInfoPanels/AspectList.tsx
    - mystiqor-build/src/components/features/astrology/ChartInfoPanels/QuickSummary.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/page.tsx
    - mystiqor-build/src/components/ui/table.tsx
  modified: []

key-decisions:
  - "LLM called with responseSchema+zodSchema to approximate 10 planet longitudes — validation falls back to evenly-spread positions (0, 30, 60...) on failure"
  - "isApproximate: true flag in API response drives UI disclaimer banner — transparent about Phase 4 limitation (no ephemeris)"
  - "findHouseForPlanet handles 0°/360° boundary crossing — prevents all planets defaulting to house 1"
  - "table.tsx added as new shadcn UI component — required by PlanetTable and AspectList, was missing from ui/"
  - "next/dynamic with ssr:false for BirthChart — SVG component is client-only and heavy"
  - "useQuery(['profile']) for form pre-fill — birth_date, birth_time, latitude, longitude from profile"

patterns-established:
  - "Pattern: LLM approximation with JSON mode + Zod validation + safe fallback — use for any computation requiring LLM-estimated numeric data"
  - "Pattern: findHouseForPlanet boundary-safe — handles 0°/360° crossing for all house lookups"

requirements-completed: [ASTR-02]

# Metrics
duration: 25min
completed: 2026-03-23
---

# Phase 04 Plan 05: Astrology Natal Chart Page Summary

**Natal chart page with LLM-approximated planet positions, BirthChart SVG, 4 info panels (AI interpretation, planet table, aspect list, quick summary), and isApproximate disclaimer**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-23T00:00:00Z
- **Completed:** 2026-03-23T00:25:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Birth-chart API route: LLM approximates 10 planet longitudes, calls assembleChart + buildInterpretationPrompt, saves to analyses table with tool_type='astrology'
- Four info panels: AIInterpretation (react-markdown + expand), PlanetTable (symbols + Hebrew signs), AspectList (colored badges + strength bars), QuickSummary (Sun/Moon/Rising)
- Astrology page: birth form pre-filled from profile, BirthChart SVG via next/dynamic, isApproximate disclaimer, tabbed panels, SubscriptionGuard

## Task Commits

1. **Task 1: Create birth-chart API route with LLM planet approximation** - `8e265cc` (feat)
2. **Task 2: Create 4 info panels + astrology page** - `cde330c` (feat)

**Plan metadata:** [pending docs commit]

## Files Created/Modified

- `mystiqor-build/src/app/api/tools/astrology/birth-chart/route.ts` — POST endpoint: auth, Zod validation, LLM planet approximation, assembleChart, buildInterpretationPrompt, DB save, isApproximate response
- `mystiqor-build/src/components/features/astrology/ChartInfoPanels/AIInterpretation.tsx` — react-markdown panel with skeleton loading and expand/collapse
- `mystiqor-build/src/components/features/astrology/ChartInfoPanels/PlanetTable.tsx` — shadcn Table with planet symbols, Hebrew sign names, degrees, house numbers
- `mystiqor-build/src/components/features/astrology/ChartInfoPanels/AspectList.tsx` — colored aspect type badges + strength progress bars
- `mystiqor-build/src/components/features/astrology/ChartInfoPanels/QuickSummary.tsx` — 3 cards: Sun/Moon/Rising with emoji, Hebrew name, element description
- `mystiqor-build/src/app/(auth)/tools/astrology/page.tsx` — natal chart page: form, SVG, disclaimer, tabbed panels
- `mystiqor-build/src/components/ui/table.tsx` — new shadcn Table component (RTL-compatible)

## Decisions Made

- LLM called with responseSchema+zodSchema to approximate 10 planet longitudes — validation falls back to evenly-spread positions on failure
- isApproximate: true flag in API response drives UI disclaimer banner — transparent about Phase 4 limitation (no ephemeris)
- findHouseForPlanet handles 0°/360° boundary crossing — prevents all planets defaulting to house 1
- table.tsx added as new shadcn UI component — required by PlanetTable and AspectList, was missing from ui/
- next/dynamic with ssr:false for BirthChart — SVG component is client-only and heavy
- useQuery(['profile']) for form pre-fill — birth_date, birth_time, latitude, longitude from profile

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing shadcn Table component**
- **Found during:** Task 2 (PlanetTable + AspectList creation)
- **Issue:** PlanetTable and AspectList both import from `@/components/ui/table` but table.tsx didn't exist in the ui/ directory
- **Fix:** Created full RTL-compatible shadcn/ui Table component with Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
- **Files modified:** mystiqor-build/src/components/ui/table.tsx
- **Verification:** tsc --noEmit passes cleanly
- **Committed in:** cde330c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing dependency)
**Impact on plan:** Required for correct operation. No scope creep.

## Issues Encountered

None - plan executed smoothly once table.tsx was added.

## Known Stubs

None - all data flows are wired. Planet positions are approximated (acknowledged via isApproximate flag), not stubbed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ASTR-02 fulfilled: natal chart page with BirthChart SVG + AI interpretation + 4 info panels
- Approximate positions clearly flagged for future ephemeris upgrade (Phase 6)
- table.tsx now available for other components needing tabular data

---
*Phase: 04-tools-tier-1*
*Completed: 2026-03-23*
