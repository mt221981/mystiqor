---
phase: 14-typography-hebrew-localization
plan: 01
subsystem: ui
tags: [typography, hebrew, css, font-loading, cls-prevention, tailwind]

# Dependency graph
requires:
  - phase: 01-core-infrastructure
    provides: "layout.tsx with next/font/google declarations and globals.css with @layer base"
provides:
  - "Global .font-body rule with line-height 1.7, letter-spacing 0, tabular-nums"
  - "Global .font-label rule with letter-spacing 0"
  - "CLS-preventing adjustFontFallback on all 4 font declarations"
affects: [14-typography-hebrew-localization]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Global CSS cascade for Hebrew typography — override via .font-body/.font-label selectors in @layer base"]

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "Hebrew typography rules applied via global .font-body/.font-label CSS selectors in @layer base — eliminates need for per-component overrides"
  - "adjustFontFallback: true on all 4 font declarations — auto-generates size-adjusted fallback fonts to prevent CLS"

patterns-established:
  - "Global Hebrew typography cascade: body has font-body class, globals.css defines .font-body rules, all Hebrew body text inherits automatically"
  - "Font loading CLS prevention via adjustFontFallback on next/font/google declarations"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-04-03
---

# Phase 14 Plan 01: Global Hebrew Typography Overrides Summary

**Global line-height 1.7, zero letter-spacing, and tabular-nums for Hebrew body text via CSS cascade, plus CLS-preventing adjustFontFallback on all 4 font declarations**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T08:44:31Z
- **Completed:** 2026-04-03T08:50:05Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Hebrew body text globally renders with line-height 1.7 (D-01) — no per-component overrides needed
- Zero letter-spacing on both .font-body and .font-label (D-02) — prevents Tailwind tracking utilities from affecting Hebrew text
- Tabular-nums on all numeric values in Hebrew context (D-03) — gematria, scores, dates are tabular-aligned
- CLS prevention via adjustFontFallback on Plus Jakarta Sans, Inter, Manrope, and Heebo (D-04)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add global Hebrew typography overrides to globals.css** - `ed249f1` (feat)
2. **Task 2: Enable adjustFontFallback on all next/font/google declarations in layout.tsx** - `ad7aae8` (feat)

## Files Created/Modified
- `src/app/globals.css` - Added .font-body (line-height 1.7, letter-spacing 0, tabular-nums) and .font-label (letter-spacing 0) rules inside @layer base
- `src/app/layout.tsx` - Added adjustFontFallback: true to all 4 font declarations (Plus_Jakarta_Sans, Inter, Manrope, Heebo)

## Decisions Made
- Hebrew typography rules applied via global CSS selectors matching Tailwind font-family class names (.font-body, .font-label) rather than per-component overrides — leverages existing body className="font-body" cascade root
- adjustFontFallback: true (not false or 'Arial') on all fonts — lets Next.js auto-generate optimal size-adjusted fallback for each font

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Worktree was initially based on the pre-migration base44 codebase instead of the migrated Next.js master branch. Resolved by resetting worktree to master before executing tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Global typography overrides are in place, ready for Plan 02 cleanup pass (D-05, D-06)
- Per-component leading-relaxed and tracking-* classes can now be audited and removed since the global .font-body/.font-label rules supersede them

## Self-Check: PASSED

- [x] src/app/globals.css exists with .font-body and .font-label rules
- [x] src/app/layout.tsx exists with 4x adjustFontFallback: true
- [x] Commit ed249f1 found (Task 1: globals.css)
- [x] Commit ad7aae8 found (Task 2: layout.tsx)
- [x] SUMMARY.md created at correct path
- [x] TypeScript compilation passes with zero errors

---
*Phase: 14-typography-hebrew-localization*
*Completed: 2026-04-03*
