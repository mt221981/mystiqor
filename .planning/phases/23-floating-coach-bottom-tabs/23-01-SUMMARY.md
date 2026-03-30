---
phase: 23-floating-coach-bottom-tabs
plan: "01"
subsystem: coach
tags: [api-extraction, zustand, refactor, shared-service]
dependency_graph:
  requires: []
  provides:
    - services/coach/api.ts — Conversation, Message types + 4 API functions
    - stores/floating-coach.ts — useFloatingCoachStore
  affects:
    - coach/page.tsx — now imports from shared service
    - FloatingCoachPanel (Plan 03) — will import from same shared service
tech_stack:
  added: []
  patterns:
    - Zustand store without persist middleware (state resets on navigation)
    - Shared service layer for API functions used by multiple consumers
key_files:
  created:
    - mystiqor-build/src/services/coach/api.ts
    - mystiqor-build/src/stores/floating-coach.ts
  modified:
    - mystiqor-build/src/app/(auth)/coach/page.tsx
decisions:
  - "No persist middleware on floating-coach store per D-21 — resets on navigation is intended behavior"
  - "import type for Conversation/Message in coach/page.tsx — types only, no runtime cost"
metrics:
  duration: "3 min"
  completed: "2026-03-30"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 23 Plan 01: Coach API Extraction + Floating Coach Store Summary

**One-liner:** Extracted coach API functions (fetchConversations, fetchMessages, sendMessage, createConversation) + Conversation/Message types into `services/coach/api.ts`, created `useFloatingCoachStore` Zustand store (no persist), and refactored `coach/page.tsx` to import from the shared service.

## What Was Built

### Task 1: services/coach/api.ts + stores/floating-coach.ts (commit: 7d75e28)

Created two new files:

**`mystiqor-build/src/services/coach/api.ts`**
- Exports `Conversation` and `Message` interfaces (previously local in coach/page.tsx)
- Exports 4 API functions: `fetchConversations`, `createConversation`, `fetchMessages`, `sendMessage`
- Identical logic to the original local definitions — pure extraction, zero behavior change
- Hebrew JSDoc on all functions

**`mystiqor-build/src/stores/floating-coach.ts`**
- Exports `useFloatingCoachStore` Zustand store
- State shape: `isOpen`, `activeConversationId`, `messages[]`, `isLoading`
- Actions: `open`, `close`, `toggle`, `setActiveConversationId`, `setMessages`, `addMessage`, `setIsLoading`
- No `persist` middleware — state resets on navigation per D-21 decision
- Imports `Message` type from `@/services/coach/api`

### Task 2: Refactor coach/page.tsx (commit: 0a12dcb)

- Removed ~58 lines of local interface/function definitions
- Added named imports from `@/services/coach/api`
- Added type imports for `Conversation` and `Message`
- Kept `ActiveTab` type and `formatRelativeTime` as page-specific
- All component JSX, hooks, mutations, callbacks unchanged — pure mechanical refactor
- File reduced from 393 lines to 335 lines

## Verification

- `tsc --noEmit`: 0 errors (both before and after each task)
- `vitest run`: 90/93 tests pass — 3 pre-existing failures in `tests/services/llm.test.ts` (LLM mock constructor issue, unrelated to this plan)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan is infrastructure-only (service extraction + store creation). No UI rendering, no data display.

## File Scores

### mystiqor-build/src/services/coach/api.ts

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict types, no any, exported interfaces |
| Error Handling | 9/10 | Try/catch on JSON parse, throws typed errors |
| Validation | N/A | API client, not mutation handler |
| Documentation | 9/10 | Hebrew JSDoc on all 4 functions |
| Clean Code | 10/10 | Single responsibility, clear exports |
| Security | 8/10 | No secrets, fetch-based client |
| Performance | 9/10 | Simple fetch, no N+1 |
| Accessibility | N/A | Service layer, no UI |
| RTL | N/A | Service layer, no UI |
| Edge Cases | 8/10 | Empty arrays handled with ??, error propagation |

**Applicable criteria: 8 items → Total: 63/80 = 79% (above 78% threshold)**

### mystiqor-build/src/stores/floating-coach.ts

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict types, no any, typed interface |
| Error Handling | N/A | Store, no async operations |
| Validation | N/A | Store, no input validation needed |
| Documentation | 9/10 | Hebrew JSDoc on store, interface, and each action |
| Clean Code | 10/10 | Simple set() calls, addMessage uses spread |
| Security | N/A | Client-side state only |
| Performance | 9/10 | No persist, immutable updates |
| Accessibility | N/A | Store, no UI |
| RTL | N/A | Store, no UI |
| Edge Cases | 9/10 | addMessage spreads correctly, toggle uses callback form |

**Applicable criteria: 5 items → Total: 47/50 = 94% (above 78% threshold)**

## Self-Check: PASSED
