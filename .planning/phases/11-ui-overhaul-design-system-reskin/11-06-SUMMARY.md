---
phase: 11-ui-overhaul-design-system-reskin
plan: 06
subsystem: ui
tags: [tailwind, md3, design-system, astrology, career, relationships, document]

# Dependency graph
requires:
  - phase: 11-01
    provides: MD3 color tokens in tailwind.config.ts + globals.css
  - phase: 11-02
    provides: App shell reskinned with glass-nav + font families established

provides:
  - Reskinned transits page with surface-container cards and primary/tertiary indicators
  - Reskinned synastry page with font-headline headers and MD3 dual-chart layout
  - Reskinned solar-return page with surface-container cards and MD3 element colors
  - Reskinned timing page with tertiary score indicators and activity type badges
  - Reskinned career page with surface-container insight sections and gradient progress bars
  - Reskinned relationships page with MD3 relationship type badges
  - Reskinned document page with surface-container-lowest upload area
  - Reskinned DailyForecast component with surface-container cards and font-headline
  - Reskinned AstroCalendar component with MD3 day cells and primary event dots

affects:
  - 11-07 (tools page overview)
  - Any future plans referencing Tier 3 tool pages

# Tech tracking
tech-stack:
  added: []
  patterns:
    - MD3 token replacement across all Tier 3 tool pages
    - font-headline for all card titles and section headings
    - font-label for badges, indicators, and form labels
    - font-body for prose and descriptive text
    - bg-surface-container as base card background
    - bg-surface-container-lowest for upload/input areas
    - bg-surface-container-high for secondary items and hover states
    - Gradient bg-gradient-to-br from-primary-container to-secondary-container for submit buttons
    - text-tertiary for positive/success indicators (scores, strengths)
    - text-error for warnings and failure states
    - text-primary / text-secondary for highlights and dynamic states

key-files:
  created: []
  modified:
    - mystiqor-build/src/app/(auth)/tools/astrology/transits/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/synastry/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/solar-return/page.tsx
    - mystiqor-build/src/app/(auth)/tools/timing/page.tsx
    - mystiqor-build/src/app/(auth)/tools/career/page.tsx
    - mystiqor-build/src/app/(auth)/tools/relationships/page.tsx
    - mystiqor-build/src/app/(auth)/tools/document/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/forecast/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/calendar/page.tsx
    - mystiqor-build/src/components/features/astrology/DailyForecast/index.tsx
    - mystiqor-build/src/components/features/astrology/AstroCalendar/index.tsx

key-decisions:
  - "DailyForecast SECTION_ICONS color map updated from hardcoded indigo/pink/blue/green to MD3 tertiary/primary/secondary tokens"
  - "AstroCalendar EVENT_TYPE_COLORS updated from indigo-950 to surface-container tokens with MD3 semantic colors"
  - "scoreColor() in synastry/timing updated to use text-tertiary (high), text-secondary (mid), text-error (low) instead of green/yellow/red"
  - "Upload area in document page uses surface-container-lowest + border-outline-variant/30 hover:border-primary/40"
  - "Solar return ELEMENT_COLORS mapped to MD3 semantic: fire=error, earth=tertiary, air=secondary, water=primary"

patterns-established:
  - "Pattern: All Tier 3 astrology pages use bg-surface-container rounded-xl for card containers"
  - "Pattern: All submit buttons use bg-gradient-to-br from-primary-container to-secondary-container"
  - "Pattern: Score/strength indicators use text-tertiary (high), text-secondary (medium), text-error (low)"
  - "Pattern: Activity/relationship type badges use bg-primary-container/10 text-primary font-label text-xs px-2 py-1 rounded-full"

requirements-completed: [UI-13]

# Metrics
duration: 20min
completed: 2026-03-24
---

# Phase 11 Plan 06: Tier 3 Tool Pages + Forecast + Calendar Reskin Summary

**11 files updated with MD3 surface-container cards, font-headline titles, and semantic color tokens replacing all hardcoded gray/purple/indigo classes across advanced astrology tools, career, relationships, document, and calendar pages.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-03-24T18:40:00Z
- **Completed:** 2026-03-24T19:00:00Z
- **Tasks:** 2/2
- **Files modified:** 11

## Accomplishments

- Tier 3 astrology pages (transits, synastry, solar-return, timing) fully reskinned with MD3 tokens
- LLM-only tool pages (career, relationships, document) reskinned with surface-container insight sections
- DailyForecast and AstroCalendar sub-components updated from indigo/purple hardcoded colors to MD3 semantic tokens
- Zero gray-[0-9] or purple-[0-9] color classes remain in any of the 11 files
- TypeScript compiles clean with zero errors across all changes

## Task Commits

1. **Task 1: Reskin transits + synastry + solar return + timing pages** - `f6a11ad` (feat)
2. **Task 2: Reskin career + relationships + document + forecast + calendar pages** - `5ddd8dd` (feat)

## Files Created/Modified

- `src/app/(auth)/tools/astrology/transits/page.tsx` — surface-container cards, primary planet labels, font-headline titles
- `src/app/(auth)/tools/astrology/synastry/page.tsx` — font-headline person headers, MD3 compatibility score colors
- `src/app/(auth)/tools/astrology/solar-return/page.tsx` — surface-container chart card, MD3 element colors
- `src/app/(auth)/tools/timing/page.tsx` — tertiary score indicators, activity type MD3 badges
- `src/app/(auth)/tools/career/page.tsx` — surface-container insight sections, tertiary growth indicators
- `src/app/(auth)/tools/relationships/page.tsx` — MD3 relationship type badges, surface-container cards
- `src/app/(auth)/tools/document/page.tsx` — surface-container-lowest upload area, MD3 insight category colors
- `src/app/(auth)/tools/astrology/forecast/page.tsx` — wrapper page (no direct card changes, DailyForecast handles display)
- `src/app/(auth)/tools/astrology/calendar/page.tsx` — wrapper page (AstroCalendar handles display)
- `src/components/features/astrology/DailyForecast/index.tsx` — surface-container cards, font-headline, MD3 section colors
- `src/components/features/astrology/AstroCalendar/index.tsx` — surface-container grid, primary-container day cells, MD3 event dots

## Decisions Made

- DailyForecast SECTION_ICONS color map: replaced `text-yellow-400 / text-pink-400 / text-blue-400 / text-green-400` with MD3 `text-tertiary / text-primary / text-secondary / text-tertiary` tokens for consistent theming
- AstroCalendar EVENT_TYPE_COLORS: replaced `bg-indigo-950/60` base card with `bg-surface-container`, event dot colors mapped to MD3 semantic meanings (full moon=tertiary, retrograde=error, sign ingress=primary)
- Solar return element colors: mapped fire=error, earth=tertiary, air=secondary, water=primary for semantic correctness
- scoreColor() in synastry and timing: tertiary (>=75/70), secondary (>=50), error (<50) replaces green/yellow/red hardcoding

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all files compiled cleanly, no blocking issues.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All Tier 3 tool pages, forecast, and calendar are now using MD3 design tokens
- No remaining hardcoded gray or purple color classes in the modified files
- Ready for Phase 11-07 (goals/notifications) and final polish plans

---
*Phase: 11-ui-overhaul-design-system-reskin*
*Completed: 2026-03-24*
