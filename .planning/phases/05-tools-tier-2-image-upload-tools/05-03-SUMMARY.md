---
phase: 05-tools-tier-2-image-upload-tools
plan: 03
subsystem: drawing-tool
tags: [drawing, comparison, htp, koppitz, educational, components]
requires: [05-01, 05-02]
provides: [DrawingCompare, DrawingConceptCards, DrawingAnalysisForm, 3-tab drawing page]
affects: [drawing-page, analysis-api]
tech_stack:
  added: []
  patterns: [dynamic-imports, react-query, tab-state]
key_files:
  created:
    - mystiqor-build/src/components/features/drawing/DrawingCompare.tsx
    - mystiqor-build/src/components/features/drawing/DrawingConceptCards.tsx
    - mystiqor-build/src/components/features/drawing/DrawingAnalysisForm.tsx
  modified:
    - mystiqor-build/src/app/(auth)/tools/drawing/page.tsx
    - mystiqor-build/src/lib/validations/analysis.ts
    - mystiqor-build/src/app/api/analysis/route.ts
decisions:
  - "DrawingAnalysisForm extracted to keep page.tsx under 300 lines — SubscriptionGuard lives in form component"
  - "include_results query param added to /api/analysis for single-query results fetch (avoids N+1)"
  - "DrawingCompare userId prop is a passthrough — API uses server-side auth session, not client userId"
metrics:
  duration_min: 25
  tasks_completed: 2
  files_created: 3
  files_modified: 3
  completed_date: "2026-03-23"
---

# Phase 05 Plan 03: Drawing Comparison + Concept Cards + Page Tabs Summary

**One-liner:** Drawing comparison (2-picker + Koppitz delta + emotional indicator diff) and 4 HTP educational concept cards wired into drawing page as 3-tab navigation.

## Objective Achieved

Built DRAW-05 (DrawingCompare) and DRAW-06 (DrawingConceptCards) and integrated them into the drawing page as tab-based navigation. All drawing requirements (DRAW-01 through DRAW-06) are now accessible from `/tools/drawing`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | DrawingCompare + DrawingConceptCards components | 8e8a77a | DrawingCompare.tsx, DrawingConceptCards.tsx, analysis.ts, route.ts |
| 2 | Wire into drawing page tabs | 17bf2f0 | page.tsx, DrawingAnalysisForm.tsx |

## What Was Built

### DrawingCompare (DRAW-05)
- Two Select dropdowns to pick analysis A and analysis B from user's past drawing analyses (single query, no N+1)
- Side-by-side display: date, drawing type, summary, Koppitz score, emotional indicators
- KoppitzDelta component showing score change with up/down arrows and color coding
- Highlighted added/removed emotional indicators between the two analyses
- Message when fewer than 2 analyses exist: "נדרשים לפחות 2 ניתוחים להשוואה"

### DrawingConceptCards (DRAW-06)
- 4 static educational cards about HTP methodology:
  - "מהו מבחן HTP?" — House-Tree-Person test explanation (1948, John Buck)
  - "מדדי Koppitz" — 30 emotional indicators by Dr. Elizabeth Koppitz (1968)
  - "FDM — שיטת ציור משפחה" — Family Drawing Method (Burns & Kaufman, 1972)
  - "כיצד לפרש את התוצאות" — Responsible interpretation guidance
- Lucide-react icons, Hebrew titles, 2-column grid layout

### Drawing Page Tabs
- 3-tab navigation: "ניתוח חדש", "השוואה", "מושגים"
- Tab 1 (ניתוח חדש): DrawingAnalysisForm with SubscriptionGuard (analysis protected, tabs not)
- Tab 2 (השוואה): DrawingCompare (free for all users)
- Tab 3 (מושגים): DrawingConceptCards (free for all users)
- Page.tsx: 110 lines (well under 300 limit)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Data] API /api/analysis lacked results field in list response**
- **Found during:** Task 1 — DrawingCompare needs DrawingResponse shape from each analysis
- **Issue:** GET /api/analysis only returned `id, tool_type, summary, confidence_score, created_at` — no `results` field needed for comparison
- **Fix:** Added `include_results=true` query param to API; AnalysisQuerySchema extended; route conditionally includes `results, input_data` in SELECT when param is true. Single query preserved (no N+1).
- **Files modified:** src/lib/validations/analysis.ts, src/app/api/analysis/route.ts
- **Commits:** 8e8a77a

**2. [Rule 2 - 300-line compliance] DrawingAnalysisForm extracted to separate component**
- **Found during:** Task 2 — adding tabs + form + results to page.tsx produced 379 lines
- **Issue:** 300-line limit exceeded
- **Fix:** Extracted DrawingAnalysisForm.tsx (284 lines) from page.tsx; page.tsx reduced to 110 lines. SubscriptionGuard lives inside DrawingAnalysisForm.tsx (not page.tsx directly).
- **Files created:** src/components/features/drawing/DrawingAnalysisForm.tsx
- **Note:** Acceptance criteria grep for SubscriptionGuard in page.tsx will not match — guard is in DrawingAnalysisForm.tsx which is rendered exclusively on tab 1.

**3. [Rule 1 - Bug] Insight field names fixed**
- **Found during:** Task 2 — original page used `insight.category` and `insight.text` which are from the LLM response schema (InsightSchema in common.ts), not the types/analysis.ts Insight interface
- **Fix:** Confirmed InsightSchema in response-schemas/common.ts uses `category`/`text` — kept original field names correct.

## Success Criteria Check

- DrawingCompare loads past analyses with single query and shows side-by-side with diff highlighting: PASS
- DrawingConceptCards shows 4 educational HTP cards: PASS
- Drawing page has tab navigation for all 3 sections: PASS
- TypeScript compiles with zero errors: PASS

## Self-Check: PASSED

Files created/exist:
- FOUND: mystiqor-build/src/components/features/drawing/DrawingCompare.tsx
- FOUND: mystiqor-build/src/components/features/drawing/DrawingConceptCards.tsx
- FOUND: mystiqor-build/src/components/features/drawing/DrawingAnalysisForm.tsx

Commits confirmed:
- 8e8a77a: feat(05-03): add DrawingCompare and DrawingConceptCards components
- 17bf2f0: feat(05-03): wire drawing comparison + concept cards into page tabs

TypeScript: zero errors (npx tsc --noEmit = no output)
