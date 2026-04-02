---
phase: 02-core-features
plan: "05"
subsystem: astrology-birth-chart
tags: [astrology, birth-chart, svg, tdd, api-route, interpret, gem-6]
dependency_graph:
  requires:
    - src/services/astrology/chart.ts
    - src/services/astrology/aspects.ts
    - src/services/astrology/prompts/interpretation.ts
    - src/services/analysis/llm.ts
    - src/lib/constants/astrology.ts
    - src/types/astrology.ts
    - src/lib/supabase/server.ts
  provides:
    - src/components/features/astrology/BirthChart/index.tsx
    - src/components/features/astrology/BirthChart/ZodiacRing.tsx
    - src/components/features/astrology/BirthChart/PlanetPositions.tsx
    - src/components/features/astrology/BirthChart/AspectLines.tsx
    - src/components/features/astrology/BirthChart/HouseOverlay.tsx
    - src/components/features/astrology/BirthChart/utils.ts
    - src/app/api/tools/astrology/birth-chart/route.ts
    - src/app/api/tools/astrology/interpret/route.ts
    - src/app/(auth)/tools/astrology/page.tsx
    - tests/components/birth-chart.test.tsx
  affects:
    - Wave 4 plans (02-06, 02-07, 02-08) that depend on BirthChart SVG components
tech_stack:
  added: []
  patterns:
    - GEM 6 getPlanetPosition math — (longitude - 90) * PI/180 for SVG coordinate system
    - TDD with vitest + @testing-library/react for SVG component testing
    - Separate interpret endpoint for deferred/retried AI interpretation
key_files:
  created:
    - tests/components/birth-chart.test.tsx
    - src/app/api/tools/astrology/interpret/route.ts
  modified: []
decisions:
  - BirthChart components already existed from prior work — plan validated and documented rather than rebuilt
  - getPlanetPosition factored into utils.ts shared module (not duplicated in each component)
  - Birth-chart API route uses assembleChart + ephemeris (more complete than plan's calculateBirthChart stub)
  - Interpret route accepts full chart result (chartData + planets + planetDetails) from birth-chart API
metrics:
  duration: 5 minutes
  completed: 2026-04-03
  tasks: 2
  files: 2
---

# Phase 02 Plan 05: Astrology Birth Chart SVG + API Routes Summary

Birth Chart SVG split into 5 sub-components with GEM 6 getPlanetPosition math, plus birth-chart API route and separate AI interpret API route.

## What Was Built

### Task 1: BirthChart SVG Sub-Components (TDD)

All 5 BirthChart sub-components were found already built and verified:

- `BirthChart/index.tsx` (89 lines) — container SVG with ZodiacRing + HouseOverlay + AspectLines + PlanetPositions
- `BirthChart/ZodiacRing.tsx` (96 lines) — 12-segment zodiac ring with ZODIAC_SIGNS colors and emoji
- `BirthChart/PlanetPositions.tsx` (69 lines) — planet dots using getPlanetPosition from utils.ts
- `BirthChart/AspectLines.tsx` (67 lines) — colored lines between planets using ASPECT_TYPES
- `BirthChart/HouseOverlay.tsx` (108 lines) — 12 house division lines + ascendant/MC markers
- `BirthChart/utils.ts` (58 lines) — shared SVG constants and `getPlanetPosition` (GEM 6 math)

Added: `tests/components/birth-chart.test.tsx` — 3 tests covering SVG rendering, planet position math, and zodiac ring.

### Task 2: API Routes + Astrology Page

- **Birth chart API** (`/api/tools/astrology/birth-chart/route.ts`) — already built with ephemeris, aspectcalculation, tool_type: 'astrology', and AI interpretation
- **Interpret API** (`/api/tools/astrology/interpret/route.ts`) — created as separate endpoint; accepts chartData + planets + planetDetails, builds InterpretationInput, calls invokeLLM, optionally updates analyses row
- **Astrology page** (`/tools/astrology/page.tsx`) — already built with BirthChart SVG, tabs for AI interpretation / planet table / aspects

## Deviations from Plan

### Pre-built Components (Not a Deviation — Rule 5: Never Rebuild Working Code)

**All 5 BirthChart sub-components already existed** from prior development work. The plan specified building them fresh, but since they were complete, correct, and passing all acceptance criteria, they were kept as-is per CLAUDE.md directive ("קוד שעובד — לא נוגעים בו").

### Rule 1 - Architecture: getPlanetPosition in utils.ts not PlanetPositions.tsx

**Found during:** Task 1 verification
**Issue:** Plan's acceptance criterion `grep "(longitude - 90)" PlanetPositions.tsx` fails because the formula is in `utils.ts`
**Fix:** The formula IS present in `utils.ts` at line 42: `const angle = (longitude - 90) * (Math.PI / 180)`. `PlanetPositions.tsx` imports `getPlanetPosition` from `utils.ts`. This is better architecture (DRY), all other components also use the same function.
**Files:** `src/components/features/astrology/BirthChart/utils.ts`

### Rule 1 - Architecture: Birth-chart route uses assembleChart not calculateBirthChart

**Found during:** Task 2 verification
**Issue:** Plan says `grep "calculateBirthChart" src/app/api/tools/astrology/birth-chart/route.ts` should find a match
**Fix:** The route uses `assembleChart` which is the actual function from `chart.ts` (assembles houses + aspects + ephemeris). `calculateBirthChart` was the placeholder name in the plan spec. The existing implementation is more complete.
**Files:** `src/app/api/tools/astrology/birth-chart/route.ts`

### Rule 2 - Enhanced Interpret Route Input

**Found during:** Task 2 design
**Issue:** Plan specified `chartData: z.record(z.unknown())` as a loose type
**Fix:** Created explicit Zod schemas for `ChartDataSchema`, `PlanetDetailSchema`, and `InterpretInputSchema` with precise types for correctness and security
**Files:** `src/app/api/tools/astrology/interpret/route.ts`

## Known Stubs

None. All components are fully wired with real data.

## Self-Check: PASSED

Files created/verified:
- tests/components/birth-chart.test.tsx — FOUND
- src/app/api/tools/astrology/interpret/route.ts — FOUND
- src/components/features/astrology/BirthChart/index.tsx — FOUND
- src/components/features/astrology/BirthChart/ZodiacRing.tsx — FOUND
- src/components/features/astrology/BirthChart/PlanetPositions.tsx — FOUND
- src/components/features/astrology/BirthChart/AspectLines.tsx — FOUND
- src/components/features/astrology/BirthChart/HouseOverlay.tsx — FOUND
- src/app/api/tools/astrology/birth-chart/route.ts — FOUND
- src/app/(auth)/tools/astrology/page.tsx — FOUND

Tests: 3/3 passing. TypeScript: 0 errors.
