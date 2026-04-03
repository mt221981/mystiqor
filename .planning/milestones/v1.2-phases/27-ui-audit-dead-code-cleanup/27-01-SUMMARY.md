---
phase: 27-ui-audit-dead-code-cleanup
plan: 01
subsystem: ui
tags: [dead-code, cleanup, tarot, glass-card, components, hooks, services]

# Dependency graph
requires:
  - phase: 27-context
    provides: audit decisions D-01 through D-06 identifying orphaned files
provides:
  - "11 orphaned files deleted (~866 lines of dead code removed)"
  - "TarotCardDetailModal updated to use direct CSS classes (mystic-card-gold, bg-surface-container) without GlassCard dependency"
  - "Clean import graph — no references to deleted modules"
  - "TypeScript compiles with 0 errors post-cleanup"
affects: [27-02, 27-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Direct CSS class pattern: use mystic-card-gold/bg-surface-container on plain divs instead of GlassCard wrapper"

key-files:
  created: []
  modified:
    - src/components/features/tarot/TarotCardDetailModal.tsx

key-decisions:
  - "TarotCardDetailModal: GlassCard replaced with plain divs — mystic-card-gold class for gold variant, bg-surface-container + border-outline-variant/5 for default variant (D-06)"
  - "ToolPageHero.tsx was untracked by git — deleted from filesystem, no git staging needed"
  - "comments in categories.ts and tool-names.ts referencing ExplainableInsight/AnalysisHistory are JSDoc provenance notes, not imports — safe to keep"

patterns-established:
  - "Direct CSS class pattern: mystic-card-gold and bg-surface-container can be applied to plain divs without the GlassCard component wrapper"

requirements-completed: [AUDIT-02, AUDIT-03]

# Metrics
duration: 5min
completed: 2026-04-03
---

# Phase 27 Plan 01: Dead Code Cleanup Summary

**Removed 11 orphaned files (~866 lines dead code) and migrated TarotCardDetailModal from GlassCard to direct CSS classes — 0 TypeScript errors, 0 broken imports**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T15:03:52Z
- **Completed:** 2026-04-03T15:08:30Z
- **Tasks:** 1
- **Files modified:** 1 (updated) + 11 (deleted)

## Accomplishments
- Deleted all 11 orphaned files identified in audit decisions D-01 through D-06: nebula-button.tsx, glass-input.tsx, glass-card.tsx, ExplainableInsight.tsx, AnalysisHistory.tsx, ToolPageHero.tsx, BirthDataForm.tsx, useMobile.ts, useAnalytics.ts, rule-engine.ts, auth.ts
- Removed now-empty `src/app/actions/` directory
- Updated TarotCardDetailModal.tsx to replace GlassCard component with plain divs using direct CSS classes (mystic-card-gold + bg-surface-container) — visual parity preserved
- TypeScript compiles with 0 errors after all deletions

## Task Commits

1. **Task 1: Delete all 11 orphaned files and update TarotCardDetailModal** - `0e6816c` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/components/features/tarot/TarotCardDetailModal.tsx` - Removed GlassCard import, replaced two GlassCard usages with plain divs using equivalent CSS classes

## Files Deleted
- `src/components/ui/nebula-button.tsx` - 38 lines, 0 imports (D-02)
- `src/components/ui/glass-input.tsx` - 32 lines, 0 imports (D-02)
- `src/components/ui/glass-card.tsx` - 38 lines, only used by TarotCardDetailModal (D-02)
- `src/components/features/insights/ExplainableInsight.tsx` - 168 lines, 0 page imports (D-02)
- `src/components/features/shared/AnalysisHistory.tsx` - 122 lines, 0 page imports (D-02)
- `src/components/features/shared/ToolPageHero.tsx` - 127 lines, untracked by git (D-02)
- `src/components/forms/BirthDataForm.tsx` - 120 lines, 0 page imports (D-02)
- `src/hooks/useMobile.ts` - 35 lines, 0 imports (D-03)
- `src/hooks/useAnalytics.ts` - 64 lines, 0 imports from pages/layout (D-03)
- `src/services/analysis/rule-engine.ts` - 142 lines, 0 imports from API routes (D-04)
- `src/app/actions/auth.ts` - orphaned signOut action, Header uses @/lib/supabase/auth (D-05)

## Decisions Made
- TarotCardDetailModal: GlassCard variant="gold" becomes `<div className="mystic-card-gold rounded-xl p-4">` and variant="default" becomes `<div className="bg-surface-container rounded-xl border border-outline-variant/5 p-4">` — same visual result without the deleted dependency
- ToolPageHero.tsx was untracked by git (per audit), so deletion required only filesystem removal
- JSDoc comments in categories.ts and tool-names.ts referencing BASE44 source file names (ExplainableInsight.jsx, AnalysisHistory) are provenance notes only, not imports — left untouched

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None. All 11 files existed on disk, all deletions succeeded, TypeScript compiled clean after the first attempt.

## User Setup Required
None — no external service configuration required.

## Known Stubs
None — this plan only deletes files and simplifies one component. No data stubs introduced.

## Next Phase Readiness
- Codebase is now 11 files lighter with clean import graph
- Wave 2 verification (27-02, 27-03) can run against this clean state
- No blockers

---
*Phase: 27-ui-audit-dead-code-cleanup*
*Completed: 2026-04-03*
