---
phase: 09-learning-history-analytics
plan: 03
subsystem: learn
tags: [tutor, chat, llm, astrology, drawing, education]
dependency_graph:
  requires:
    - "09-02: learning_progress table and API"
    - "services/analysis/llm.ts: invokeLLM function"
    - "app/api/coach/messages: LLM chat pattern"
  provides:
    - "POST /api/learn/tutor/astrology"
    - "POST /api/learn/tutor/drawing"
    - "/learn/astrology page"
    - "/learn/drawing page"
    - "TutorChat component"
    - "QuickConceptButtons component"
  affects:
    - "Learn navigation routes"
tech_stack:
  added: []
  patterns:
    - "Stateless tutor pattern: each LLM request independent, no DB persistence"
    - "Page-owned state: page manages messages[], useMutation, passes props down"
    - "Context enrichment: fetch user analyses + learning_progress before LLM call"
key_files:
  created:
    - "mystiqor-build/src/lib/validations/tutor.ts"
    - "mystiqor-build/src/app/api/learn/tutor/astrology/route.ts"
    - "mystiqor-build/src/app/api/learn/tutor/drawing/route.ts"
    - "mystiqor-build/src/components/features/learn/TutorChat.tsx"
    - "mystiqor-build/src/components/features/learn/QuickConceptButtons.tsx"
    - "mystiqor-build/src/app/(auth)/learn/astrology/page.tsx"
    - "mystiqor-build/src/app/(auth)/learn/drawing/page.tsx"
  modified: []
decisions:
  - "Stateless tutor (no conversation persistence) — simpler than coach, each request independent"
  - "Page-owned state pattern: TutorChat and QuickConceptButtons are presentational only"
  - "externalInput prop on TutorChat allows QuickConceptButtons to seed the input field"
  - "Pre-existing tsc errors in ActivityHeatmap.tsx and ToolUsageChart.tsx are from parallel executor 09-04 — out of scope for this plan"
metrics:
  duration: "6 minutes"
  completed: "2026-03-24"
  tasks: 2
  files: 7
---

# Phase 09 Plan 03: Astrology + Drawing Tutor Pages Summary

**One-liner:** Stateless AI tutor pages for astrology and drawing with context-aware LLM responses, 6+5 quick concept buttons, and shared TutorChat component.

## What Was Built

Two interactive AI tutoring pages where users can learn astrology concepts and drawing analysis techniques through natural language chat. The tutors are context-aware — they fetch the user's existing analyses and learning progress before each LLM call to provide personalized educational responses.

**Architecture:**
- Stateless tutor pattern — no DB persistence, each request stands alone
- Page manages messages[] array and useMutation
- TutorChat and QuickConceptButtons are pure presentational components
- Quick concept buttons trigger the same `handleSend` function as manual input

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Tutor API routes + Zod validation | `60e6442` | tutor.ts, astrology/route.ts, drawing/route.ts |
| 2 | Tutor chat components + pages | `e177358` | TutorChat.tsx, QuickConceptButtons.tsx, astrology/page.tsx, drawing/page.tsx |

## Deviations from Plan

None — plan executed exactly as written. Used the "REVISED approach" from the plan (page-owned state) without modification.

## Known Stubs

None — both tutor pages are fully wired to their API endpoints. Quick concept buttons trigger actual LLM calls. The `learning_progress` fetch uses `(supabase as any)` cast because the table may not be in `database.generated.ts` yet (per plan guidance), but returns null gracefully if the table doesn't exist — the feature degrades without error.

## Pre-existing Issues (Out of Scope)

The following TypeScript errors existed before this plan and are caused by parallel executor work (plan 09-04 analytics components):
- `src/components/features/analytics/ActivityHeatmap.tsx` — Recharts Tooltip formatter types
- `src/components/features/analytics/ToolUsageChart.tsx` — Recharts PieLabel and Tooltip types

These are deferred to the analytics plan owner.

## Self-Check: PASSED

Files created:
- `mystiqor-build/src/lib/validations/tutor.ts` — FOUND
- `mystiqor-build/src/app/api/learn/tutor/astrology/route.ts` — FOUND
- `mystiqor-build/src/app/api/learn/tutor/drawing/route.ts` — FOUND
- `mystiqor-build/src/components/features/learn/TutorChat.tsx` — FOUND
- `mystiqor-build/src/components/features/learn/QuickConceptButtons.tsx` — FOUND
- `mystiqor-build/src/app/(auth)/learn/astrology/page.tsx` — FOUND
- `mystiqor-build/src/app/(auth)/learn/drawing/page.tsx` — FOUND

Commits verified:
- `60e6442` — FOUND
- `e177358` — FOUND
