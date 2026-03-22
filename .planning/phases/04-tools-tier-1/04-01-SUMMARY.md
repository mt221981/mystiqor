---
phase: 04-tools-tier-1
plan: 01
subsystem: ui
tags: [svg, astrology, birthchart, typescript, react, components]

# Dependency graph
requires:
  - phase: 01-infrastructure-hardening
    provides: astrology service layer (chart.ts, aspects.ts)
  - phase: 00-foundation
    provides: constants/astrology.ts with ZODIAC_SIGNS, PLANET_SYMBOLS, ASPECT_TYPES
provides:
  - BirthChart SVG component composed from 4 typed sub-components
  - ZodiacRing — outer zodiac ring with 12 sign emojis and colored segments
  - PlanetPositions — planet circles at longitude positions with symbols
  - AspectLines — colored lines connecting aspecting planet pairs
  - HouseOverlay — 12 house divider lines and house numbers + ascendant/MC lines
  - utils.ts — shared SVG geometry constants and getPlanetPosition helper
affects: [04-tools-tier-1, 06-advanced-tools, synastry]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SVG sub-component decomposition — each visual concern is a separate typed component
    - Shared geometry constants in utils.ts — single source of truth for all radii
    - getPlanetPosition formula — angle = (lon - 90) * PI/180, x/y from center+radius*cos/sin

key-files:
  created:
    - mystiqor-build/src/components/features/astrology/BirthChart/utils.ts
    - mystiqor-build/src/components/features/astrology/BirthChart/ZodiacRing.tsx
    - mystiqor-build/src/components/features/astrology/BirthChart/HouseOverlay.tsx
    - mystiqor-build/src/components/features/astrology/BirthChart/PlanetPositions.tsx
    - mystiqor-build/src/components/features/astrology/BirthChart/AspectLines.tsx
    - mystiqor-build/src/components/features/astrology/BirthChart/index.tsx
  modified: []

key-decisions:
  - "ZodiacRing takes no props — zodiac signs are static constants, no runtime data needed"
  - "PlanetPositions skips unknown planet names via optional chaining on PLANET_SYMBOLS[planetName as PlanetKey]"
  - "AspectLines opacity formula: 0.3 + strength * 0.5 — keeps faint aspects visible while strong ones stand out"
  - "BirthChart index exports both named (BirthChart) and default — callers can use either"
  - "next/dynamic wrapping is left to the page — BirthChart index is not self-wrapped"

patterns-established:
  - "SVG composition pattern: each layer is a <g> element, composed in index.tsx inside single viewBox"
  - "textAnchor=middle + dominantBaseline=middle on all SVG text — RTL-safe, no CSS dir interference"
  - "getPlanetPosition(longitude, radius) — reused by HouseOverlay, PlanetPositions, AspectLines"

requirements-completed: [ASTR-01]

# Metrics
duration: 12min
completed: 2026-03-22
---

# Phase 4 Plan 01: BirthChart SVG Decomposition Summary

**Ported 922-line BASE44 BirthChart.jsx into 6 typed TypeScript SVG sub-components (ZodiacRing, PlanetPositions, AspectLines, HouseOverlay, utils, index) with zero `any` and all radii matching the original**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-22T19:30:00Z
- **Completed:** 2026-03-22T19:42:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created shared `utils.ts` with all 7 SVG geometry constants (CHART_CENTER, OUTER_RADIUS, ZODIAC_RADIUS, ZODIAC_SEPARATOR_RADIUS, PLANET_ORBIT_RADIUS, PLANET_RING_RADIUS, HOUSE_NUMBER_RADIUS) and `getPlanetPosition` + `getAngleForSign` helpers
- Built `ZodiacRing.tsx` — static component rendering 12 zodiac emojis with correct colors, outer circle, dashed separator, and 30-degree segment dividers
- Built `HouseOverlay.tsx` — 12 house dividers, house numbers 1-12 at r=135, gold ascendant line (#FFD700), silver MC line (#C0C0C0)
- Built `PlanetPositions.tsx` — planet circles at longitude positions with colored backgrounds and astronomical symbols, skips unknown planets gracefully
- Built `AspectLines.tsx` — colored lines between aspecting planet pairs with opacity derived from aspect strength
- Built `index.tsx` — composed BirthChart SVG viewBox="0 0 500 500" with dark navy background, all sub-components in correct render order

## Task Commits

1. **Task 1: Create shared utils + ZodiacRing + HouseOverlay** - `3318b62` (feat)
2. **Task 2: Create PlanetPositions + AspectLines + BirthChart index** - `1b0bd6b` (feat)

## Files Created/Modified

- `mystiqor-build/src/components/features/astrology/BirthChart/utils.ts` — SVG geometry constants + getPlanetPosition + getAngleForSign (Hebrew JSDoc)
- `mystiqor-build/src/components/features/astrology/BirthChart/ZodiacRing.tsx` — outer zodiac ring, 12 emojis with sign colors
- `mystiqor-build/src/components/features/astrology/BirthChart/HouseOverlay.tsx` — house dividers, numbers, ascendant+MC lines
- `mystiqor-build/src/components/features/astrology/BirthChart/PlanetPositions.tsx` — planet circles with symbols at correct longitude positions
- `mystiqor-build/src/components/features/astrology/BirthChart/AspectLines.tsx` — aspect lines colored by type, opacity from strength
- `mystiqor-build/src/components/features/astrology/BirthChart/index.tsx` — composed BirthChart with named + default exports

## Decisions Made

- ZodiacRing takes no props — zodiac signs are static and come entirely from constants
- PlanetPositions skips unknown planet names via `PLANET_SYMBOLS[planetName as PlanetKey]` optional chaining — handles any string input gracefully
- AspectLines opacity: `0.3 + aspect.strength * 0.5` — keeps weak aspects visible while strong ones stand out
- HouseOverlay house dividers run from r=160 to r=200 (planet ring to zodiac separator), matching BASE44 original
- BirthChart exports both `export function BirthChart` and `export default BirthChart` for flexible imports
- next/dynamic wrapping delegated to the consuming page

## Deviations from Plan

None — plan executed exactly as written. All 6 files match the specified geometry constants, component APIs, and acceptance criteria.

## Issues Encountered

Pre-existing TypeScript errors in unrelated files (forecast route, calendar route, numerology compatibility route) were present before this plan and remain out of scope. Zero errors in any BirthChart file.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 6 BirthChart files compile without errors
- BirthChart/index.tsx ready for import by the astrology page (Phase 4 Plan 05 or similar)
- Radii match BASE44 source exactly — synastry chart (Phase 6) can reuse the same sub-components
- ZodiacRing is stateless — can be shared across any chart variant

## Self-Check: PASSED

All 6 created files exist on disk. Both task commits (3318b62, 1b0bd6b) confirmed in git log.

---
*Phase: 04-tools-tier-1*
*Completed: 2026-03-22*
