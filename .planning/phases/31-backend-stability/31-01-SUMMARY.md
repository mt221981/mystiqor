---
phase: 31-backend-stability
plan: "01"
subsystem: llm-service
tags: [hardening, timeout, retry, hebrew-errors, openai, stability]
dependency_graph:
  requires: []
  provides: [invokeLLM-hardened]
  affects: [all-24-tool-routes, coach-routes, learn-routes]
tech_stack:
  added: []
  patterns: [openai-typed-errors, constructor-timeout, constructor-retry]
key_files:
  created: []
  modified:
    - mystiqor-build/src/services/analysis/llm.ts
decisions:
  - "Used OpenAI SDK constructor options (timeout/maxRetries) rather than custom AbortController or retry loop — SDK handles exponential backoff with jitter automatically"
  - "Mapped each of the 5 known OpenAI error classes to distinct Hebrew messages rather than a single catch-all — preserves specificity for UX"
  - "Kept SyntaxError check first in catch chain (before OpenAI checks) — JSON.parse errors are not OpenAI errors and must not be misclassified"
metrics:
  duration_minutes: 1
  completed_date: "2026-04-07"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
requirements_satisfied: [STAB-02, STAB-03]
---

# Phase 31 Plan 01: LLM Service Hardening Summary

**One-liner:** Added 9-second timeout + 2-retry backoff and 5 typed Hebrew error mappings to `invokeLLM` via OpenAI SDK constructor options — protects all 24+ tool routes simultaneously.

## What Was Built

Single targeted change to `mystiqor-build/src/services/analysis/llm.ts` implementing STAB-02 and STAB-03:

**STAB-02 — Timeout + Retry (lines 73-77):**
```typescript
const openai = new OpenAI({
  apiKey,
  timeout: 9_000,   // 9 שניות לפי דרישת STAB-02
  maxRetries: 2,    // 2 ניסיונות חוזרים עם backoff — סה"כ 3 ניסיונות
})
```
The SDK handles exponential backoff automatically. `maxRetries: 2` means up to 3 total attempts.

**STAB-03 — Hebrew Error Mapping (lines 9-15, 154-178):**
Five typed error classes imported from `'openai'` and mapped in catch block:
- `APIConnectionTimeoutError` → "שרת ה-AI לא הגיב בזמן — נסה שוב בעוד מספר שניות"
- `APIConnectionError` → "בעיית חיבור לשרת AI — בדוק את החיבור לאינטרנט ונסה שוב"
- `RateLimitError` → "שרת ה-AI עמוס כרגע — נסה שוב בעוד מספר דקות"
- `OpenAIInternalServerError` → "שגיאה זמנית בשרת AI — נסה שוב בעוד מספר דקות"
- `AuthenticationError` → "שגיאת הגדרות שרת — צור קשר עם התמיכה"

Raw OpenAI error codes/messages are no longer forwarded to the client in any error path.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 — Timeout/retry + Hebrew error mapping | `6f43ee5` | feat(31-01): harden invokeLLM with timeout/retry and Hebrew error mapping |

## Verification Results

| Check | Result |
|-------|--------|
| `grep timeout.*9_000` | Found at line 75 |
| `grep maxRetries.*2` | Found at line 76 |
| `grep APIConnectionTimeoutError\|RateLimitError\|OpenAIInternalServerError` | Found at lines 10, 12, 13, 160, 166, 169 |
| `npx tsc --noEmit` errors in llm.ts | 0 |
| Pre-existing unrelated TS errors (.next/dev/types/validator.ts) | 2 (debug route stubs — not caused by this change) |

## Deviations from Plan

None — plan executed exactly as written. Both imports and constructor changes applied as specified. The two pre-existing TypeScript errors in `.next/dev/types/validator.ts` (`debug/route.js` not found) were already present before this change (caused by deleted `src/app/api/debug/route.ts` — visible in git status as `D src/app/api/debug/route.ts`).

## Known Stubs

None — all error messages are complete Hebrew strings. No placeholders, TODOs, or empty values.

## Threat Flags

None — changes are purely internal to server-side error handling. No new network endpoints, auth paths, or schema changes.

## Threat Model Coverage

| Threat ID | Status |
|-----------|--------|
| T-31-01 — Information Disclosure via raw error codes | Mitigated — Hebrew mapping strips raw OpenAI error content before reaching client |
| T-31-02 — DoS via hanging LLM calls | Mitigated — `timeout: 9_000` caps each attempt; `maxRetries: 2` caps total retries |
| T-31-03 — Tampering via error message content | Accepted — server-controlled strings only, no user or LLM input echoed |

## Self-Check: PASSED

- File exists: `mystiqor-build/src/services/analysis/llm.ts` — FOUND
- Commit `6f43ee5` exists: FOUND (git log confirms)
- `timeout: 9_000` present: FOUND at line 75
- `maxRetries: 2` present: FOUND at line 76
- All 5 error class imports present: FOUND at lines 9-15
- All 5 instanceof checks in catch block: FOUND at lines 160-173
- File length: 180 lines (under 300 limit)
