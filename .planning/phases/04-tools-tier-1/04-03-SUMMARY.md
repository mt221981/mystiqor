---
phase: 04-tools-tier-1
plan: "03"
subsystem: personality-analysis
tags: [big-five, ocean, personality, radar-chart, subscription-guard]
dependency_graph:
  requires:
    - "03-06 (SubscriptionGuard component)"
    - "04-01 (API route patterns established)"
  provides:
    - "Big Five questionnaire + scoring service"
    - "Personality API route (POST /api/tools/personality)"
    - "RadarChart visualization component"
    - "SubscriptionGuard on dream page"
  affects:
    - "04-04 (downstream tools may reference personality scoring pattern)"
tech_stack:
  added:
    - "recharts RadarChart (personality visualization)"
  patterns:
    - "20-question Likert form with RHF + Zod"
    - "Reverse scoring (6 - rawScore) + normalization to 0-100"
    - "dynamic import for Recharts (ssr: false)"
key_files:
  created:
    - "mystiqor-build/src/lib/constants/big-five-questions.ts"
    - "mystiqor-build/src/services/personality/scoring.ts"
    - "mystiqor-build/src/components/features/personality/BigFiveQuestionnaire.tsx"
    - "mystiqor-build/src/components/features/personality/BigFiveRadarChart.tsx"
    - "mystiqor-build/src/app/api/tools/personality/route.ts"
    - "mystiqor-build/src/app/(auth)/tools/personality/page.tsx"
  modified:
    - "mystiqor-build/src/app/(auth)/tools/dream/page.tsx"
decisions:
  - "dynamic import for BigFiveRadarChart — Recharts is heavy and SSR-incompatible"
  - "No inline Tooltip formatter in RadarChart — Recharts v3 type issue (per STATE.md decision)"
  - "z.input<typeof Schema> pattern used for useForm generic (established Phase 3 pattern)"
  - "SubscriptionGuard wraps form CardContent in dream page — matches tarot page pattern"
metrics:
  duration: "15min"
  completed: "2026-03-22"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
requirements:
  - TOOL-07
  - TOOL-01
  - TOOL-06
---

# Phase 04 Plan 03: Big Five Personality Analysis — Summary

**One-liner:** Big Five OCEAN questionnaire with 20 Hebrew Likert questions, reverse-scored normalization to 0-100, Recharts radar chart, and AI interpretation via OpenAI — plus SubscriptionGuard on dream/tarot pages.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Big Five constants + scoring + questionnaire + radar chart | e815013 | big-five-questions.ts, scoring.ts, BigFiveQuestionnaire.tsx, BigFiveRadarChart.tsx |
| 2 | Personality API route + page + dream SubscriptionGuard fix | 98c8dd1 | route.ts, personality/page.tsx, dream/page.tsx |

## What Was Built

### Task 1: Core personality analysis infrastructure

**`src/lib/constants/big-five-questions.ts`**
- `BigFiveDimension` type: `openness | conscientiousness | extraversion | agreeableness | neuroticism`
- `BigFiveQuestion` interface with `id`, `text`, `dimension`, `isReversed`
- `BIG_FIVE_QUESTIONS`: 20 Hebrew questions, 4 per dimension, with reverse-score flags
- `DIMENSION_LABELS`: Hebrew labels per dimension

**`src/services/personality/scoring.ts`**
- `BigFiveScores` interface: 5 dimensions, 0-100 each
- `scoreBigFive(answers: number[])`: validates 20 answers (1-5), applies reverse scoring (`6 - rawScore`), sums per dimension, normalizes: `((sum - 4) / 16) * 100`

**`src/components/features/personality/BigFiveQuestionnaire.tsx`**
- RHF + Zod schema: `z.array(z.number().int().min(1).max(5)).length(20)`
- 20 questions grouped by dimension with Hebrew section headers
- 5 Likert radio buttons per question (labeled "מאוד לא מסכים/ה" to "מאוד מסכים/ה")
- Progress bar showing answered count, submit disabled until all 20 answered

**`src/components/features/personality/BigFiveRadarChart.tsx`**
- `ResponsiveContainer > RadarChart > PolarGrid + PolarAngleAxis + Radar`
- Purple theme: fill="#8b5cf6" fillOpacity=0.4 stroke="#8b5cf6"
- No inline Tooltip formatter (Recharts v3 type issue)

### Task 2: API route, page, and SubscriptionGuard fix

**`src/app/api/tools/personality/route.ts`**
- 5-step pattern: auth → Zod validate → scoreBigFive → invokeLLM → insert analyses
- `tool_type: 'personality'`, stores `{ scores, answers }` in input_data
- Hebrew system prompt requesting OCEAN personality interpretation (maxTokens: 1000)
- try/catch with Hebrew error message

**`src/app/(auth)/tools/personality/page.tsx`**
- State: questionnaire phase ↔ results phase
- `SubscriptionGuard feature="analyses"` wraps questionnaire
- `useMutation` → POST `/api/tools/personality` with answers array
- Results: dynamic BigFiveRadarChart + score badges + AI interpretation via react-markdown
- "ניתוח חדש" reset button, framer-motion page transitions

**`src/app/(auth)/tools/dream/page.tsx`** (fix)
- Added `SubscriptionGuard feature="analyses"` wrapping form content
- Matches exact pattern from tarot/page.tsx

## Deviations from Plan

None — plan executed exactly as written.

## Verification

All success criteria met:
- 20 Hebrew Big Five questions with 4 per dimension and isReversed flags
- Reverse scoring formula `6 - rawScore` correctly implemented
- Normalization formula `((sum - 4) / 16) * 100` → range 0-100
- RadarChart with 5 Hebrew-labeled OCEAN axes
- Personality API route follows 5-step pattern, saves to `analyses` table with `tool_type: 'personality'`
- Personality page wrapped in SubscriptionGuard
- Dream page SubscriptionGuard added (was missing per RESEARCH.md Pitfall 5)
- Tarot page SubscriptionGuard verified present
- `tsc --noEmit` passes cleanly (0 errors in new/modified files)

## Known Stubs

None — all data flows are wired. The questionnaire submits to the real API route, scoring is deterministic, and AI interpretation calls the real `invokeLLM` service.

## Self-Check: PASSED

Files created:
- mystiqor-build/src/lib/constants/big-five-questions.ts — FOUND
- mystiqor-build/src/services/personality/scoring.ts — FOUND
- mystiqor-build/src/components/features/personality/BigFiveQuestionnaire.tsx — FOUND
- mystiqor-build/src/components/features/personality/BigFiveRadarChart.tsx — FOUND
- mystiqor-build/src/app/api/tools/personality/route.ts — FOUND
- mystiqor-build/src/app/(auth)/tools/personality/page.tsx — FOUND

Commits verified in mystiqor-build submodule:
- e815013: feat(04-03): Big Five constants, scoring service, questionnaire + radar chart
- 98c8dd1: feat(04-03): personality API route, page, and dream SubscriptionGuard fix
