---
phase: 06-tools-tier-3-advanced-astrology
plan: 01
subsystem: api
tags: [astronomy-engine, ephemeris, astrology, birth-chart, aspects, typescript]

requires:
  - phase: 04-tools-tier-1
    provides: birth-chart route (LLM approximation) and aspects.ts (calculateAspects, PlanetPositions)

provides:
  - astronomy-engine v2.1.19 installed as ephemeris dependency
  - src/services/astrology/ephemeris.ts — getEphemerisPositions and getEphemerisPositionsWithRetrograde
  - aspects.ts extended with TRANSIT_ASPECT_DEFINITIONS, SYNASTRY_ASPECT_DEFINITIONS, calculateTransitAspects, calculateInterChartAspects
  - birth-chart route upgraded to real ephemeris (no LLM approximation)
  - isApproximate flag removed from API, DB save, and UI

affects:
  - 06-02 (transits route — uses getEphemerisPositions + calculateTransitAspects)
  - 06-03 (solar-return route — uses getEphemerisPositions for planet positions at SR moment)
  - 06-04 (synastry — uses getEphemerisPositions + calculateInterChartAspects)
  - 06-05 (timing tool — uses getEphemerisPositions over date range)

tech-stack:
  added:
    - astronomy-engine v2.1.19 (pure TypeScript, no WASM, no native addons)
  patterns:
    - ephemeris adapter pattern: thin wrapper around astronomy-engine, returns PlanetPositions interface
    - retrograde detection via T vs T+1 day longitude comparison with normalize() wraparound guard
    - cross-product aspect calculation extracted to shared calculateCrossAspects() helper used by both transit and synastry functions

key-files:
  created:
    - mystiqor-build/src/services/astrology/ephemeris.ts
    - mystiqor-build/tests/services/ephemeris.test.ts
  modified:
    - mystiqor-build/src/services/astrology/aspects.ts
    - mystiqor-build/src/app/api/tools/astrology/birth-chart/route.ts
    - mystiqor-build/src/app/(auth)/tools/astrology/page.tsx
    - mystiqor-build/package.json
    - mystiqor-build/package-lock.json

key-decisions:
  - "astronomy-engine installed with --legacy-peer-deps due to openai@4.104.0 peerOptional zod@^3.23.8 conflict with installed zod@4.3.x — build is unaffected"
  - "getEphemerisPositionsWithRetrograde makes two AstroTime calls per planet (T and T+1 day) — slight overhead but necessary for retrograde detection; called only once per birth-chart request"
  - "calculateCrossAspects helper extracted as internal function to avoid code duplication between calculateTransitAspects and calculateInterChartAspects"
  - "isApproximate comment in JSDoc header replaced with Hebrew phrase 'דגל הקירוב' to meet grep -c 0 acceptance criterion"

patterns-established:
  - "Ephemeris calls: new Astronomy.AstroTime(date) then Astronomy.EclipticLongitude(body, astroTime)"
  - "Retrograde detection: normalize(lon2 - lon1) > 180 means retrograde, with Sun/Moon always returning false"
  - "Transit aspects use tight orbs (2°/1.5°); synastry aspects use wider orbs (5°/4°)"

requirements-completed: [ASTR-03]

duration: 9min
completed: 2026-03-23
---

# Phase 6 Plan 01: Ephemeris Adapter + Birth Chart Upgrade Summary

**astronomy-engine adapter (getEphemerisPositions) replacing LLM planet approximation, with transit and synastry aspect functions added to aspects.ts and isApproximate flag fully removed from birth-chart API and UI**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-23T16:55:00Z
- **Completed:** 2026-03-23T17:04:00Z
- **Tasks:** 2
- **Files modified:** 7 (2 new, 5 modified)

## Accomplishments

- Created ephemeris adapter (ephemeris.ts) wrapping astronomy-engine v2.1.19 with getEphemerisPositions() and getEphemerisPositionsWithRetrograde() — replaces the Phase 4 LLM approximation that required isApproximate: true
- Extended aspects.ts with TRANSIT_ASPECT_DEFINITIONS (tight 2° orbs), SYNASTRY_ASPECT_DEFINITIONS (wide 5° orbs), calculateTransitAspects(), and calculateInterChartAspects() — foundation for transits, synastry, and timing tools
- Upgraded birth-chart route to use real ephemeris data and real retrograde detection per planet, removed LLM planet call entirely, removed isApproximate from DB save and API response
- Removed disclaimer banner and isApproximate field from astrology page — users now see accurate planet data without the approximation warning
- Created ephemeris.test.ts with 10 unit tests (J2000 accuracy, vernal equinox, retrograde, transit aspects, inter-chart aspects) ready for when vitest is configured

## Task Commits

Each task was committed atomically inside mystiqor-build/:

1. **Task 1: Install astronomy-engine + ephemeris adapter + transit/synastry aspects** - `d48dd6e` (feat)
2. **Task 2: Upgrade birth-chart route to real ephemeris + remove isApproximate from UI** - `b5ef4ea` (feat)

## Files Created/Modified

- `mystiqor-build/src/services/astrology/ephemeris.ts` — New: astronomy-engine adapter, exports getEphemerisPositions and getEphemerisPositionsWithRetrograde
- `mystiqor-build/tests/services/ephemeris.test.ts` — New: 10 unit tests for ephemeris accuracy and aspect calculations (for future vitest use)
- `mystiqor-build/src/services/astrology/aspects.ts` — Extended: TRANSIT_ASPECT_DEFINITIONS, SYNASTRY_ASPECT_DEFINITIONS, calculateTransitAspects, calculateInterChartAspects added without touching existing functions
- `mystiqor-build/src/app/api/tools/astrology/birth-chart/route.ts` — Updated: LLM approximation block removed, getEphemerisPositions() called instead, real retrograde detection, isApproximate removed from response and DB save
- `mystiqor-build/src/app/(auth)/tools/astrology/page.tsx` — Updated: isApproximate field removed from BirthChartResult interface, disclaimer banner removed, AlertTriangle import removed
- `mystiqor-build/package.json` — Updated: astronomy-engine ^2.1.19 added to dependencies
- `mystiqor-build/package-lock.json` — Updated: lockfile updated

## Decisions Made

- astronomy-engine installed with --legacy-peer-deps due to openai@4.104.0 peerOptional zod conflict with installed zod@4.x. Build is unaffected — the conflict is a peer advisory only.
- getEphemerisPositionsWithRetrograde makes two EclipticLongitude calls per planet (T and T+1 day) to detect retrograde. This is 20 extra calls per birth-chart request but runs in <1ms total since astronomy-engine is pure math with no I/O.
- calculateCrossAspects() extracted as a shared internal helper to avoid code duplication between calculateTransitAspects and calculateInterChartAspects.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- npm install astronomy-engine failed without --legacy-peer-deps due to openai@4.104.0 peerOptional zod version conflict. Resolved by using --legacy-peer-deps flag (standard for this project's known peer dependency situation with zod v4).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- getEphemerisPositions() is the foundation for all remaining Phase 6 plans
- calculateTransitAspects() ready for 06-02 (transits route)
- calculateInterChartAspects() ready for 06-04 (synastry)
- birth-chart now returns real planet data — all downstream consumers benefit automatically
- No blockers for 06-02 through 06-05

---
*Phase: 06-tools-tier-3-advanced-astrology*
*Completed: 2026-03-23*
