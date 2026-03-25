---
phase: 09-learning-history-analytics
plan: 01
subsystem: ui
tags: [react-query, history, analysis, pagination, timeline, comparison, sidebar, middleware]

# Dependency graph
requires:
  - phase: 05-tools-tier-2-image-upload-tools
    provides: include_results query param added to /api/analysis for full results fetch
  - phase: 03-ux-shell-profile-dashboard-tracking
    provides: Sidebar layout and NAV_SECTIONS pattern
provides:
  - TOOL_NAMES shared constant at @/lib/constants/tool-names
  - /history page with filterable paginated analysis list + list/timeline views
  - /history/compare page with side-by-side analysis comparison
  - PROTECTED_PATHS updated for /history /learn /analytics /blog
  - Sidebar updated with Phase 9 navigation entries
affects:
  - 09-02-plan (learn routes use /learn/tutorials, /learn/blog hrefs)
  - 09-03-plan (astrology/drawing tutor hrefs /learn/astrology, /learn/drawing)
  - 09-04-plan (analytics route /analytics in Sidebar)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TOOL_NAMES extracted from component-local to shared constant at @/lib/constants/tool-names
    - HistoryFilters/AnalysisCard/ComparePanel as reusable history feature components
    - Suspense boundary wrapping useSearchParams in compare page (Next.js App Router requirement)
    - useQuery with queryKey ['analyses', toolFilter, page] for cache isolation per filter+page

key-files:
  created:
    - mystiqor-build/src/lib/constants/tool-names.ts
    - mystiqor-build/src/components/features/history/HistoryFilters.tsx
    - mystiqor-build/src/components/features/history/AnalysisCard.tsx
    - mystiqor-build/src/components/features/history/ComparePanel.tsx
    - mystiqor-build/src/app/(auth)/history/page.tsx
    - mystiqor-build/src/app/(auth)/history/compare/page.tsx
  modified:
    - mystiqor-build/src/components/features/shared/AnalysisHistory.tsx
    - mystiqor-build/src/lib/supabase/middleware.ts
    - mystiqor-build/src/components/layouts/Sidebar.tsx

key-decisions:
  - "TOOL_NAMES extracted to @/lib/constants/tool-names — shared by AnalysisHistory, HistoryFilters, AnalysisCard, ComparePanel without duplication"
  - "Compare page uses include_results=true with limit=200 and client-side find — no single-by-ID endpoint exists on /api/analysis"
  - "Astrology filter (tool_type=astrology) fulfills ASTR-08 readings history — no separate /history/astrology page needed"
  - "asChild prop removed from Button in compare page — Button component does not support asChild, replaced with plain Link"
  - "Timeline view uses pure Tailwind alternating layout — no Recharts needed for vertical timeline"

patterns-established:
  - "History feature components in src/components/features/history/ — HistoryFilters, AnalysisCard, ComparePanel"
  - "useQuery queryKey includes all filter params for cache isolation: ['analyses', toolFilter, page]"
  - "Suspense boundary pattern for useSearchParams in App Router client pages"

requirements-completed: [HIST-01, HIST-02, HIST-03, ASTR-08]

# Metrics
duration: 8min
completed: 2026-03-24
---

# Phase 09 Plan 01: Analysis History Page Summary

**Filterable paginated analysis history at /history with list/timeline views, side-by-side /history/compare, shared TOOL_NAMES constant, and all Phase 9 routes wired into middleware and sidebar**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-24T13:43:03Z
- **Completed:** 2026-03-24T13:51:34Z
- **Tasks:** 2
- **Files modified:** 9 (4 modified + 5 created)

## Accomplishments

- Extracted `TOOL_NAMES` from AnalysisHistory.tsx into shared `@/lib/constants/tool-names.ts` with `TOOL_ICONS` also exported
- Built full /history page: paginated filterable grid with HistoryFilters, list/timeline toggle, select-2-to-compare flow
- Built /history/compare page: reads IDs from URL, fetches with include_results=true, renders ComparePanel side-by-side
- Updated PROTECTED_PATHS in middleware to cover all Phase 9 routes: /history /learn /analytics /blog
- Updated Sidebar "למידה" section with correct /learn/... hrefs and added "היסטוריה ואנליטיקה" section

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared infrastructure — TOOL_NAMES constant, PROTECTED_PATHS, Sidebar navigation** - `891ad80` (feat)
2. **Task 2: History page + Compare page with filters, pagination, timeline toggle** - `8743441` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/lib/constants/tool-names.ts` — TOOL_NAMES (18 entries Hebrew) + TOOL_ICONS shared exports
- `src/components/features/shared/AnalysisHistory.tsx` — replaced local TOOL_NAMES with import from shared constant
- `src/lib/supabase/middleware.ts` — added /history /learn /analytics /blog to PROTECTED_PATHS
- `src/components/layouts/Sidebar.tsx` — added History/BarChart3/GitCompare icons; updated "למידה" hrefs; added "היסטוריה ואנליטיקה" section
- `src/components/features/history/HistoryFilters.tsx` — tool type filter buttons component
- `src/components/features/history/AnalysisCard.tsx` — analysis card with selection for compare
- `src/components/features/history/ComparePanel.tsx` — side-by-side diff layout for two analyses
- `src/app/(auth)/history/page.tsx` — main history page (useQuery, pagination, timeline, compare flow)
- `src/app/(auth)/history/compare/page.tsx` — compare page (Suspense + useSearchParams + ComparePanel)

## Decisions Made

- TOOL_NAMES extracted to @/lib/constants/tool-names — eliminates duplication across history feature components
- Compare page uses include_results=true with limit=200 and client-side find — no single-by-ID endpoint exists on /api/analysis (per Phase 5 decision)
- Astrology filter (tool_type=astrology) fulfills ASTR-08 — no separate page needed, filter serves as the readings history view
- Button asChild prop removed — Button component does not support asChild; replaced with plain styled Link element
- Timeline view implemented with pure Tailwind alternating layout — no Recharts needed per plan specification

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `asChild` TypeScript error in compare page back button**
- **Found during:** Task 2 (compare page creation)
- **Issue:** `asChild` prop does not exist on Button component type — caused TS2322 error
- **Fix:** Replaced `<Button asChild>` wrapping `<Link>` with a plain `<Link>` styled with Tailwind classes
- **Files modified:** src/app/(auth)/history/compare/page.tsx
- **Verification:** tsc --noEmit shows 0 errors from files modified in this plan
- **Committed in:** 8743441 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Minimal — only a prop usage fix, functionality unchanged. No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors found in `src/components/features/analytics/ActivityHeatmap.tsx`, `ToolUsageChart.tsx`, `src/components/features/learn/ProgressTracker.tsx`, `LearningPathCard.tsx` (from other parallel plans in Phase 9). Confirmed pre-existing by stash test. Out of scope per SCOPE BOUNDARY rule — documented in deferred-items below.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- History infrastructure (TOOL_NAMES constant, Phase 9 PROTECTED_PATHS, Sidebar sections) ready for Plans 02-04 to use without touching shared files
- /history and /history/compare fully functional with existing /api/analysis endpoint
- HistoryFilters, AnalysisCard, ComparePanel reusable for any future history features

---
*Phase: 09-learning-history-analytics*
*Completed: 2026-03-24*

## Self-Check: PASSED

All created files exist and all commits verified:
- FOUND: src/lib/constants/tool-names.ts
- FOUND: src/components/features/shared/AnalysisHistory.tsx
- FOUND: src/lib/supabase/middleware.ts
- FOUND: src/components/layouts/Sidebar.tsx
- FOUND: src/components/features/history/HistoryFilters.tsx
- FOUND: src/components/features/history/AnalysisCard.tsx
- FOUND: src/components/features/history/ComparePanel.tsx
- FOUND: src/app/(auth)/history/page.tsx
- FOUND: src/app/(auth)/history/compare/page.tsx
- COMMIT 891ad80: feat(09-01): shared infrastructure
- COMMIT 8743441: feat(09-01): history page + compare page
