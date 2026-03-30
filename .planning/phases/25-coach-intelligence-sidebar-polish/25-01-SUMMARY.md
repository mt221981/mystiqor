---
phase: 25-coach-intelligence-sidebar-polish
plan: 01
subsystem: api
tags: [coach, llm, supabase, typescript, system-prompt, hebrew]

# Dependency graph
requires:
  - phase: 21-prompt-enrichment
    provides: getPersonalContext helper used in messages route
  - phase: 12-integration-audit
    provides: analyses table schema and query patterns
provides:
  - Per-message analysis context injection into coach system prompt
  - RecentAnalysisRow interface for typed analysis row shape
  - relativeTimeHebrew helper for Hebrew relative time display
affects:
  - 25-02-sidebar (same phase, parallel)
  - Any future coach intelligence work

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Per-message lightweight DB fetch (5 rows, 3 fields) injected into LLM system prompt
    - Hebrew relative time calculation without external library

key-files:
  created: []
  modified:
    - mystiqor-build/src/app/api/coach/messages/route.ts

key-decisions:
  - "Fetch 5 analyses per message (lighter than context-builder.ts 20) — only tool_type, summary, created_at (no results field)"
  - "Inject analyses between identity block and history block — maintains prompt section ordering"
  - "Use TOOL_NAMES constant for Hebrew tool labels — reuses existing shared constant"
  - "relativeTimeHebrew implemented inline in route (no external lib) — diffMin/diffHours/diffDays cascade"

patterns-established:
  - "Pattern: Per-message analysis injection — fetch fresh context on every POST, inject as markdown list before history"
  - "Pattern: Hebrew relative time — לפני X דקות/שעות/ימים/אתמול/הרגע — reusable cascade function"

requirements-completed:
  - COACH-04

# Metrics
duration: 2min
completed: 2026-03-30
---

# Phase 25 Plan 01: Coach Intelligence Summary

**Per-message analysis context injection — coach now fetches 5 recent analyses on every POST and injects Hebrew tool name, 80-char summary, and relative time into system prompt between identity and history sections**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T17:39:14Z
- **Completed:** 2026-03-30T17:41:14Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `TOOL_NAMES` import for Hebrew tool labels
- Added `RecentAnalysisRow` interface (tool_type, summary, created_at)
- Added `relativeTimeHebrew` helper — returns Hebrew strings like "לפני 3 שעות", "אתמול", "הרגע"
- Added per-message analyses fetch: `.from('analyses').select('tool_type, summary, created_at').limit(5)` — 3 fields only, no `results`
- Injected `### ניתוחים אחרונים בשיחה:` block between identity and history sections
- COACH_PERSONA constant unchanged; GET handler unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add per-message analysis context injection to coach messages route** - `9c50373` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `mystiqor-build/src/app/api/coach/messages/route.ts` — Added TOOL_NAMES import, RecentAnalysisRow interface, relativeTimeHebrew helper, analyses fetch, and system prompt injection block

## Decisions Made

- Used `.limit(5)` and only 3 fields (`tool_type, summary, created_at`) vs. context-builder.ts which uses `.limit(20)` with `results` — lighter per-message fetch per D-03
- Injected analyses between `### זהות הפונה` and `### היסטוריית שיחה` per D-02 — preserves existing prompt ordering
- `relativeTimeHebrew` implemented as a module-level function (not imported) — no dependency, self-contained

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compilation passes cleanly with `--skipLibCheck` (project tsconfig has `skipLibCheck: true`). The pre-existing node_modules type errors in Next.js dist files are not related to this change.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 01 complete — coach now answers "what did I do today" with real analysis data
- Plan 02 (sidebar reorganization + localStorage persistence) is independent and can proceed
- No blockers

---
*Phase: 25-coach-intelligence-sidebar-polish*
*Completed: 2026-03-30*
