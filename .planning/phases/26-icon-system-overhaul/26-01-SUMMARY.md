---
phase: 26-icon-system-overhaul
plan: 01
subsystem: ui
tags: [lucide-react, icons, react-icons, migration, constants]

# Dependency graph
requires: []
provides:
  - "Centralized tool-icons.ts with 17 unique tool-to-Lucide-icon mappings and getToolIcon() helper"
  - "tools.ts PrimaryTool interface using LucideIcon type"
  - "All shared infrastructure files migrated from react-icons/gi to lucide-react"
affects: [26-02, 26-03]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Centralized tool-icon mapping via TOOL_ICONS record + getToolIcon() helper"]

key-files:
  created:
    - "src/lib/constants/tool-icons.ts"
  modified:
    - "src/lib/constants/tools.ts"
    - "src/components/layouts/Sidebar.tsx"
    - "src/components/layouts/BottomTabBar.tsx"
    - "src/components/layouts/Header.tsx"
    - "src/components/common/LoadingSpinner.tsx"
    - "src/components/common/EmptyState.tsx"
    - "src/components/features/dashboard/StatCards.tsx"

key-decisions:
  - "Gem icon for EmptyState (distinct from Sparkles used for coach)"
  - "Orbit reused for transits and astrology sub-pages (acceptable shared semantics)"
  - "Sunrise for Solar Return (distinct from Sun used for daily insights)"

patterns-established:
  - "Centralized icon mapping: all tool icons imported from tool-icons.ts, not scattered across files"
  - "LucideIcon type replaces IconType from react-icons for all tool icon typing"

requirements-completed: [ICON-01, ICON-03]

# Metrics
duration: 5min
completed: 2026-04-05
---

# Phase 26 Plan 01: Icon Infrastructure Summary

**Centralized tool-icons.ts mapping with 17 Lucide icons and 7 shared infrastructure files migrated from react-icons/gi**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-05T22:02:55Z
- **Completed:** 2026-04-05T22:08:31Z
- **Tasks:** 3
- **Files modified:** 8 (1 created, 7 modified)

## Accomplishments
- Created centralized tool-icons.ts with 17 unique tool-to-Lucide-icon mappings and getToolIcon() helper
- Migrated tools.ts from IconType/react-icons to LucideIcon/lucide-react
- Replaced all 25 Gi imports in Sidebar.tsx with Lucide equivalents (removed 2 dead imports)
- Migrated 5 remaining infrastructure files (BottomTabBar, Header, LoadingSpinner, EmptyState, StatCards)
- Zero react-icons imports remain in shared infrastructure layer

## Task Commits

Each task was committed atomically:

1. **Task 1: Create centralized tool-icons.ts and migrate tools.ts type** - `088db4a` (feat)
2. **Task 2: Migrate Sidebar.tsx -- replace 25 Gi imports with Lucide** - `2a86302` (feat)
3. **Task 3: Migrate BottomTabBar, Header, LoadingSpinner, EmptyState, StatCards** - `90c3dcf` (feat)

## Files Created/Modified
- `src/lib/constants/tool-icons.ts` - Centralized tool-to-icon mapping with 17 entries and getToolIcon() helper
- `src/lib/constants/tools.ts` - PrimaryTool interface migrated to LucideIcon type, 6 tool icons updated
- `src/components/layouts/Sidebar.tsx` - 25 Gi icons replaced with Lucide, 2 dead imports removed, single import block
- `src/components/layouts/BottomTabBar.tsx` - GiCrystalBall replaced with Sparkles for coach tab
- `src/components/layouts/Header.tsx` - GiSparkles replaced with Sparkles for mobile logo
- `src/components/common/LoadingSpinner.tsx` - GiSparkles replaced with Sparkles for spinner
- `src/components/common/EmptyState.tsx` - GiCrystalBall replaced with Gem for empty state
- `src/components/features/dashboard/StatCards.tsx` - 4 Gi icons replaced with Target, Smile, Award, AlarmClock

## Decisions Made
- Used Gem (not Sparkles) for EmptyState to keep it distinct from coach's Sparkles
- Orbit reused for transits sidebar item since transits is an astrology sub-page
- Sunrise for Solar Return (distinct from Sun for daily insights)
- Removed 2 dead imports (GiSparkles, GiMountainRoad) from Sidebar instead of replacing them

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all icon mappings are wired to actual Lucide components.

## Next Phase Readiness
- Wave 1 complete: centralized mapping established, all shared infrastructure migrated
- Wave 2 (plan 26-02) can now reference tool-icons.ts for tool page migrations
- Wave 3 (plan 26-03) can migrate remaining files and uninstall react-icons

## Self-Check: PASSED

All 9 files verified present. All 3 commit hashes verified in git log.

---
*Phase: 26-icon-system-overhaul*
*Plan: 01*
*Completed: 2026-04-05*
