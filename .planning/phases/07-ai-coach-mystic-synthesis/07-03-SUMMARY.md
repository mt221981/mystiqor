---
phase: 07-ai-coach-mystic-synthesis
plan: "03"
subsystem: synthesis
tags: [synthesis, llm, api-route, react-query, subscription-guard, weekly-report]
dependency_graph:
  requires:
    - mystiqor-build/src/services/analysis/llm.ts
    - mystiqor-build/src/components/features/subscription/SubscriptionGuard.tsx
    - mystiqor-build/src/types/database.ts
    - mystiqor-build/src/lib/supabase/server.ts
  provides:
    - "POST /api/tools/synthesis — on_demand + weekly synthesis"
    - "SynthesisResult component — full synthesis display"
    - "/tools/synthesis — synthesis page"
  affects:
    - "analyses table (new tool_type: synthesis rows)"
tech_stack:
  added: []
  patterns:
    - "Promise.all for parallel data fetching (profile + analyses + goals + moods)"
    - "invokeLLM with responseSchema + zodSchema for structured output"
    - "useQuery + useMutation for data fetching and generation"
    - "framer-motion staggered section entrance"
key_files:
  created:
    - mystiqor-build/src/app/api/tools/synthesis/route.ts
    - mystiqor-build/src/components/features/synthesis/SynthesisResult.tsx
    - mystiqor-build/src/app/(auth)/tools/synthesis/page.tsx
  modified: []
decisions:
  - "synthesis stored in existing analyses table with tool_type='synthesis' — no new table needed"
  - "weekly type filters analyses by last 7 days (.gte created_at sevenDaysAgo) — on_demand uses last 20"
  - "minimum 2 analyses enforced at both API level (400 response) and UI level (disabled buttons)"
  - "supabase client used directly in page for analyses query — no dedicated API endpoint needed"
  - "WeeklySections extracted as sub-component to keep SynthesisResult under 250 lines"
  - "inputSources excludes synthesis tool_type — avoids circular self-reference in prompts"
metrics:
  duration: "6 minutes"
  completed: "2026-03-24"
  tasks_completed: 2
  files_created: 3
requirements: [SYNT-01, SYNT-02, SYNT-03]
---

# Phase 7 Plan 3: Mystic Synthesis Summary

**One-liner:** Cross-tool AI synthesis via POST /api/tools/synthesis — on-demand (last 20 analyses) and weekly (last 7 days) modes, saved to analyses table, rendered in staggered SynthesisResult component with SubscriptionGuard gating.

## What Was Built

### Task 1: Synthesis API Route
`mystiqor-build/src/app/api/tools/synthesis/route.ts`

- POST handler with `SynthesisInputSchema` validating `type: 'on_demand' | 'weekly'`
- Parallel data fetch via `Promise.all`: profile, analyses, goals (active), moods (14 days)
- Weekly mode adds `.gte('created_at', sevenDaysAgo.toISOString())` filter on analyses
- Minimum data check: returns 400 with Hebrew error if analyses count < 2
- `SynthesisResponseSchema` (Zod) with full type hierarchy
- `SYNTHESIS_RESPONSE_SCHEMA` (JSON Schema) as plain object for invokeLLM `responseSchema`
- `invokeLLM<SynthesisResponse>` with `maxTokens: 6000`, both `responseSchema` and `zodSchema`
- Hebrew prompt builds cross-tool synthesis context; weekly adds usage/integration/period instructions
- Saves to `analyses` table with `tool_type: 'synthesis'`, `input_data.sources`, `input_data.type`
- Returns `{ data: { ...result, analysis_id } }`

### Task 2: SynthesisResult Component + Synthesis Page

**`SynthesisResult.tsx`:**
- `personality_profile` section: summary paragraph + 3-column grid (strengths/challenges/hidden_talents)
- `predictive_insights` grid: timeframe badge, area, prediction, probability colored badge
- `recommendations` numbered list with action, reason, optional related_tool badge
- `WeeklySections` sub-component: usage_analysis (badges + pattern insight), practical_integration (difficulty dots), period_summary paragraph
- framer-motion `containerVariants` / `itemVariants` for staggered entrance

**`synthesis/page.tsx`:**
- `useQuery(['synthesis-latest'])` — direct Supabase client query for latest synthesis analysis
- `useQuery(['synthesis-analysis-count'])` — count of non-synthesis analyses for gate check
- `useMutation` POSTing to `/api/tools/synthesis` with `type` parameter
- Dual hero cards: on_demand (indigo/purple gradient) + weekly (cyan/blue gradient)
- Both buttons disabled when `analysisCount < 2`, showing Hebrew message
- `SubscriptionGuard feature="analyses"` wrapping all content
- Loading states: Loader2 spinner during generation, skeleton cards during initial load
- Stats row showing analysis count with amber warning when below threshold

## Acceptance Criteria Verification

- `export async function POST` in synthesis route.ts: PASS
- `SynthesisResponseSchema` with personality_profile, predictive_insights, recommendations: PASS
- `tool_type: 'synthesis'` in analyses insert: PASS
- `maxTokens: 6000` in invokeLLM call: PASS
- `z.enum(['on_demand', 'weekly'])` in input validation: PASS
- `usage_analysis`, `practical_integration`, `period_summary` optional fields: PASS
- `analyses.length < 2` returns 400: PASS
- `responseSchema` AND `zodSchema` in invokeLLM: PASS
- `export function SynthesisResult` exists: PASS
- `personality_profile` rendering with strengths, challenges, hidden_talents: PASS
- `predictive_insights` rendering with timeframe, area, prediction, probability: PASS
- `recommendations` rendering with action, reason: PASS
- Conditional rendering for `usage_analysis` (weekly-only): PASS
- `'use client'` in synthesis page: PASS
- `SubscriptionGuard` wrapping in page: PASS
- `useMutation` for generation: PASS
- Both `on_demand` and `weekly` type buttons: PASS
- `tool_type.*synthesis` query for fetching latest: PASS
- `tsc --noEmit` exits 0 for synthesis files: PASS (pre-existing errors in coach routes are out of scope)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Out-of-Scope Pre-existing Issues (Deferred)

Pre-existing TypeScript errors in `src/app/api/coach/conversations/route.ts` and `src/app/api/coach/messages/route.ts` (Database type mismatch between database.ts and database.generated.ts) were observed but not fixed. These existed before this plan and are unrelated to synthesis work.

Logged to deferred items.

## Known Stubs

None — all data flows are wired: API fetches real analyses from DB, SynthesisResult renders real LLM output, page displays actual stored synthesis data.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `mystiqor-build/src/app/api/tools/synthesis/route.ts` exists | FOUND |
| `mystiqor-build/src/components/features/synthesis/SynthesisResult.tsx` exists | FOUND |
| `mystiqor-build/src/app/(auth)/tools/synthesis/page.tsx` exists | FOUND |
| Commit 229d93c (Task 1) exists | FOUND |
| Commit b4ce2d5 (Task 2) exists | FOUND |
