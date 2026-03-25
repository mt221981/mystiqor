---
phase: 12-integration-wiring-gap-closure
plan: 02
subsystem: subscription-enforcement
tags: [subscription, usage-counter, tool-pages, gap-closure]
dependency_graph:
  requires: [useSubscription hook, /api/subscription/usage, subscriptions table]
  provides: [usage counter incremented on every tool success, free tier enforcement]
  affects: [Sidebar usage bar, SubscriptionGuard limit enforcement, free user upgrade prompts]
tech_stack:
  added: []
  patterns: [void promise.catch() non-blocking pattern, incrementUsage in useMutation onSuccess, incrementUsage in async onSubmit]
key_files:
  modified:
    - mystiqor-build/src/app/(auth)/tools/astrology/page.tsx
    - mystiqor-build/src/app/(auth)/tools/numerology/page.tsx
    - mystiqor-build/src/app/(auth)/tools/tarot/page.tsx
    - mystiqor-build/src/app/(auth)/tools/personality/page.tsx
    - mystiqor-build/src/app/(auth)/tools/palmistry/page.tsx
    - mystiqor-build/src/app/(auth)/tools/compatibility/page.tsx
    - mystiqor-build/src/app/(auth)/tools/graphology/page.tsx
    - mystiqor-build/src/components/features/drawing/DrawingAnalysisForm.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/transits/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/solar-return/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/synastry/page.tsx
    - mystiqor-build/src/app/(auth)/tools/career/page.tsx
    - mystiqor-build/src/app/(auth)/tools/relationships/page.tsx
    - mystiqor-build/src/app/(auth)/tools/timing/page.tsx
    - mystiqor-build/src/app/(auth)/tools/human-design/page.tsx
    - mystiqor-build/src/app/(auth)/tools/document/page.tsx
decisions:
  - "void incrementUsage().catch(() => {}) pattern used uniformly — usage counter failure never blocks the analysis result UI"
  - "numerology compat sub-mutation excluded — shares parent analysis_id, not a separate analysis action"
  - "human-design and document use async/await pattern (not useMutation) — incrementUsage called inside try block after toast.success"
metrics:
  duration: 6min
  completed: "2026-03-25"
  tasks: 2
  files: 16
---

# Phase 12 Plan 02: Wire incrementUsage into All Tool Pages Summary

**One-liner:** Wired `void incrementUsage().catch(() => {})` into all 16 tool page success handlers, closing the free-tier enforcement gap where completed analyses never incremented the usage counter.

## What Was Built

Every tool page that calls the AI analysis API now calls `incrementUsage()` from the `useSubscription` hook immediately after a successful result. This closes the critical gap identified in SUBS-04 and INFRA-03: free users could run unlimited analyses because the counter was never incremented.

### Task 1: Tier-1 and Tier-2 Tool Pages (8 files)

All use `useMutation` from `@tanstack/react-query`. Applied uniform pattern:
1. Added `import { useSubscription } from '@/hooks/useSubscription'`
2. Added `const { incrementUsage } = useSubscription()` at component top level
3. Added `void incrementUsage().catch(() => {})` in `onSuccess` after `setResult(data)` and `toast.success(...)`

Files:
- `astrology/page.tsx` — birth chart mutation onSuccess
- `numerology/page.tsx` — main numerology mutation only (not compatibility sub-mutation)
- `tarot/page.tsx` — card draw mutation onSuccess
- `personality/page.tsx` — Big Five analysis mutation onSuccess
- `palmistry/page.tsx` — palmistry analysis mutation onSuccess
- `compatibility/page.tsx` — compatibility analysis mutation onSuccess
- `graphology/page.tsx` — graphology analysis mutation onSuccess
- `DrawingAnalysisForm.tsx` — drawing analysis mutation onSuccess

### Task 2: Tier-3 and Async-Pattern Tool Pages (8 files)

Group A (useMutation pattern — same as Task 1):
- `astrology/transits/page.tsx` — transits mutation onSuccess
- `astrology/solar-return/page.tsx` — solar return mutation onSuccess
- `astrology/synastry/page.tsx` — synastry mutation onSuccess
- `career/page.tsx` — career guidance mutation onSuccess
- `relationships/page.tsx` — relationship analysis mutation onSuccess
- `timing/page.tsx` — timing calculation mutation onSuccess

Group B (async/await pattern):
- `human-design/page.tsx` — inside `onSubmit` async function, after `setResult(json.data)` and `toast.success(...)` within the `if (json.data)` block
- `document/page.tsx` — inside `handleSubmit` async function, after `setResult(await fetchDocumentAnalysis(fd))` and `toast.success(...)`

## Verification Results

```
grep -rn "incrementUsage" src/app/(auth)/tools/ src/components/features/drawing/ --include="*.tsx" -l | wc -l
→ 16
```

TypeScript compilation: `npx tsc --noEmit` → 0 errors.

Every tool file has exactly 2 matches: 1 import + 1 hook destructuring + 1 call = 2 lines per file (import and destructuring on the same hook call).

## Commits

| Task | Hash | Message |
|------|------|---------|
| Task 1 | c50c71a | feat(12-02): wire incrementUsage into Tier-1 and Tier-2 tool pages |
| Task 2 | 0831eb6 | feat(12-02): wire incrementUsage into Tier-3 and async-pattern tool pages |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all 16 files now genuinely call the real `incrementUsage()` API endpoint (`POST /api/subscription/usage`). No mocks or placeholders.

## Self-Check: PASSED

Files modified confirmed present:
- All 16 tool pages verified via grep (16 files with incrementUsage)
- TypeScript compilation passes with 0 errors
- Both commits exist: c50c71a and 0831eb6
