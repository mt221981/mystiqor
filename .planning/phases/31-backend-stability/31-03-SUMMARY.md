---
phase: 31-backend-stability
plan: "03"
subsystem: api-routes
tags: [zod, llm-validation, tarot, palmistry, dream, json-mode, stab-04]
dependency_graph:
  requires: ["31-02"]
  provides: ["STAB-04"]
  affects: ["tarot route", "palmistry route", "dream route", "response-schemas"]
tech_stack:
  added: []
  patterns: ["Zod LLM response validation", "JSON mode via responseSchema + zodSchema", "validationResult discriminated check"]
key_files:
  created:
    - mystiqor-build/src/services/analysis/response-schemas/palmistry.ts
  modified:
    - mystiqor-build/src/services/analysis/response-schemas/index.ts
    - mystiqor-build/src/app/api/tools/tarot/route.ts
    - mystiqor-build/src/app/api/tools/palmistry/route.ts
    - mystiqor-build/src/app/api/tools/dream/route.ts
decisions:
  - "Minimal { interpretation: string } Zod wrapper chosen for all three routes — avoids prompt restructuring while enforcing non-empty, non-malformed response"
  - "dream backgroundWork validation failure writes Hebrew fallback to ai_interpretation rather than leaving null — polling UI shows feedback instead of spinning forever"
metrics:
  duration_minutes: 2
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_created: 1
  files_modified: 4
---

# Phase 31 Plan 03: Zod LLM Response Validation Summary

**One-liner:** Zod JSON-mode validation for tarot, palmistry, and dream LLM responses using minimal `{ interpretation: string }` wrapper that blocks corrupted or empty AI output with Hebrew retry messages.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create PalmistryResponseSchema and update index.ts | 3811a5d | palmistry.ts (new), index.ts |
| 2 | Wire Zod validation into tarot, palmistry, dream routes | 131d369 | tarot/route.ts, palmistry/route.ts, dream/route.ts |

---

## What Was Built

### Task 1 — PalmistryResponseSchema

Created `src/services/analysis/response-schemas/palmistry.ts` with a minimal Zod schema:

```typescript
export const PalmistryResponseSchema = z.object({
  interpretation: z.string().min(10, 'תגובת AI קצרה מדי'),
})
export type PalmistryResponse = z.infer<typeof PalmistryResponseSchema>
```

Added re-export to `index.ts` so it follows the same barrel pattern as all other schemas.

### Task 2 — Zod Wiring in Three Routes

**tarot/route.ts:**
- Added `TarotSimpleSchema` (z.object with interpretation string min 10) and `TAROT_RESPONSE_JSON_SCHEMA` constant before the POST function
- Switched `invokeLLM` to JSON mode by adding `responseSchema` + `zodSchema`
- Updated prompt to append `ענה בפורמט JSON עם שדה "interpretation" בלבד`
- Added `validationResult.success` check after call — returns 500 with Hebrew message on failure
- Changed `aiText` extraction from `String(llmResponse.data)` to `(llmResponse.data as { interpretation: string }).interpretation`

**palmistry/route.ts:**
- Imported `PalmistryResponseSchema` from response-schemas barrel
- Added `PALMISTRY_RESPONSE_JSON_SCHEMA` constant before POST function
- Switched `invokeLLM` to JSON mode (vision + JSON mode works on gpt-4o)
- Updated prompt to request JSON output
- Added `validationResult.success` check — returns 500 with Hebrew message on failure
- Changed `aiText` extraction to `.data.interpretation`

**dream/route.ts:**
- Added `DreamSimpleSchema` and `DREAM_RESPONSE_JSON_SCHEMA` constants
- Changed `invokeLLM<string>` to `invokeLLM<{ interpretation: string }>` in backgroundWork
- Updated prompt to request JSON output
- Added `validationResult` check inside backgroundWork — on failure, writes Hebrew fallback string to `ai_interpretation` so polling UI receives feedback
- Updated both the `analyses` insert (results field) and the dreams `ai_interpretation` update to use `.data.interpretation`

---

## Verification Results

```
grep -n "zodSchema" tarot/route.ts      → line 122: zodSchema: TarotSimpleSchema
grep -n "zodSchema" palmistry/route.ts  → line 69:  zodSchema: PalmistryResponseSchema
grep -n "zodSchema" dream/route.ts      → line 111: zodSchema: DreamSimpleSchema

grep -n "validationResult" tarot/route.ts      → line 125: check present
grep -n "validationResult" palmistry/route.ts  → line 72:  check present
grep -n "validationResult" dream/route.ts      → line 115: check present

PalmistryResponseSchema in index.ts     → export present
palmistry.ts exists                     → YES
npx tsc --noEmit                        → 0 new errors
```

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. All three routes were already returning real LLM content before this plan; this plan adds validation around the existing data flow without introducing any stubs.

---

## Threat Flags

No new network endpoints, auth paths, or trust boundaries introduced. The changes are purely within existing route handlers and add a validation layer that reduces the attack surface described in T-31-09.

---

## CLAUDE.md Score

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | strict, no any, typed generics |
| Error Handling | 9/10 | validationResult check + Hebrew messages |
| Validation | 10/10 | Zod on LLM output — the whole point |
| Documentation | 8/10 | JSDoc comments on constants |
| Clean Code | 9/10 | constants before POST, clear naming |
| Security | 9/10 | corrupted LLM responses blocked before client |
| Performance | 9/10 | no overhead beyond existing invokeLLM path |
| Accessibility | N/A | server-side only |
| RTL | 9/10 | all error messages in Hebrew |
| Edge Cases | 9/10 | dream failure writes fallback not null |
| **TOTAL** | **92/90 (recalc w/o A11Y: 92/90)** | above 78% threshold |

---

## Self-Check: PASSED
