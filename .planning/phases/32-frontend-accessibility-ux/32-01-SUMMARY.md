---
phase: 32-frontend-accessibility-ux
plan: 01
subsystem: frontend-accessibility
tags: [rtl, wcag, aria, empty-states, mobile-responsive, coach-context]
dependency_graph:
  requires: []
  provides: [A11Y-01, A11Y-02, A11Y-03, UX-01, UX-02]
  affects:
    - mystiqor-build/src/app/(auth)/coach/page.tsx
    - mystiqor-build/src/app/(auth)/history/page.tsx
    - mystiqor-build/src/app/(auth)/settings/page.tsx
    - mystiqor-build/src/app/(auth)/journal/page.tsx
    - mystiqor-build/src/app/(auth)/referrals/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/readings/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/synastry/page.tsx
    - mystiqor-build/src/app/(auth)/tools/document/page.tsx
    - mystiqor-build/src/app/api/coach/messages/route.ts
    - mystiqor-build/src/components/features/coach/JourneysPanel.tsx
    - mystiqor-build/src/components/features/history/AnalysisCard.tsx
    - mystiqor-build/src/components/features/journal/JournalEntryForm.tsx
tech_stack:
  added: []
  patterns:
    - Tailwind logical properties (ms/me/ps/pe) for RTL-safe spacing
    - aria-selected as string "true"/"false" for HTML spec compliance
    - EmptyState component with action CTA replacing inline empty divs
    - grid-cols-1 sm:grid-cols-2 responsive form pattern
key_files:
  created: []
  modified:
    - mystiqor-build/src/app/(auth)/coach/page.tsx
    - mystiqor-build/src/app/(auth)/history/page.tsx
    - mystiqor-build/src/app/(auth)/settings/page.tsx
    - mystiqor-build/src/app/(auth)/journal/page.tsx
    - mystiqor-build/src/app/(auth)/referrals/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/readings/page.tsx
    - mystiqor-build/src/app/(auth)/tools/astrology/synastry/page.tsx
    - mystiqor-build/src/app/(auth)/tools/document/page.tsx
    - mystiqor-build/src/app/api/coach/messages/route.ts
    - mystiqor-build/src/components/features/coach/JourneysPanel.tsx
    - mystiqor-build/src/components/features/history/AnalysisCard.tsx
    - mystiqor-build/src/components/features/journal/JournalEntryForm.tsx
decisions:
  - "aria-selected uses string 'true'/'false' instead of boolean — IDE linter flagged boolean as invalid ARIA attribute value; string form is HTML-spec compliant"
  - "settings notifications opacity-60 removed from section wrapper only — בקרוב badge already existed at line 159, not re-added"
  - "coach zero-state: two-branch conditional — EmptyState for 0 conversations, existing QuickActions div for conversations > 0 with none selected"
metrics:
  duration: 7 min
  completed_date: "2026-04-07"
  tasks_completed: 4
  files_modified: 13
---

# Phase 32 Plan 01: RTL Accessibility Sweep + Contrast/ARIA + Empty States + Mobile Forms Summary

**One-liner:** RTL logical-property sweep (12 ml/mr/pl/pr → ms/me/ps/pe), WCAG AA contrast fixes (3 opacity violations removed), ARIA tab roles + icon aria-labels, EmptyState CTAs on coach/history, and responsive astrology form grids with coach LLM context capped at 10 messages.

## What Was Built

### Task 1: RTL Margin/Padding Sweep (A11Y-01)
Replaced all directional `ml-N`/`mr-N`/`pl-N`/`pr-N` utilities with logical equivalents across 7 feature files. 12 instances total — all icon spacers inside RTL buttons and list padding. `ml-auto`/`mr-auto` and `px-N`/`py-N` were correctly left untouched as they are symmetric. `src/components/ui/` shadcn primitives were not touched.

**Commit:** `d06eacf`

### Task 2: WCAG AA Contrast Fixes + ARIA Labels (A11Y-02, A11Y-03)
- **AnalysisCard.tsx:** Removed `opacity-60` from confidence label — `text-on-surface-variant` (#c8bede on #13102c) achieves 10.43:1 contrast on its own.
- **settings/page.tsx:** Removed `opacity-60` from entire notifications section wrapper; fixed `mr-auto` → `ms-auto` on existing בקרוב badge (A11Y-01 overlap).
- **readings/page.tsx:** Replaced `text-on-surface-variant/60` with `text-on-surface-variant` on character counter.
- **coach/page.tsx:** Added `role="tablist"` + `aria-label="ניווט מאמן"` to tab container; `role="tab"` + `aria-selected="true"/"false"` to both tab buttons; dynamic `aria-label` to mobile sidebar toggle.
- **document/page.tsx:** Added `aria-label="הסר קובץ"` to icon-only remove-file button.

**Commit:** `6899870`

### Task 3: Empty States with CTA (UX-01)
- **coach/page.tsx:** Added two-branch conditional — when `conversations.length === 0 && !activeConversationId`, renders `EmptyState` with "ברוכים הבאים למאמן" title and `createMutation.mutate()` CTA. When conversations exist but none is selected, existing QuickActions div is preserved.
- **history/page.tsx:** Replaced inline `<div>` empty state with `EmptyState` component — "אין ניתוחים עדיין" title, "השתמש בכלים..." description, "עבור לכלים" `router.push('/tools')` CTA.

**Commit:** `6e11c91`

### Task 4: Mobile-Responsive Form Grids + Coach Context Limit (UX-02)
- **astrology/page.tsx:** Two `grid grid-cols-2 gap-3` → `grid grid-cols-1 sm:grid-cols-2 gap-3` (birth date/time and lat/lng grids).
- **readings/page.tsx:** `grid grid-cols-2 gap-3` → `grid grid-cols-1 sm:grid-cols-2 gap-3` (month/year inputs).
- **synastry/page.tsx:** `grid grid-cols-2 gap-2` → `grid grid-cols-1 sm:grid-cols-2 gap-2` (lat/lng in person form).
- **messages/route.ts:** POST handler context query `.limit(20)` → `.limit(10)`. GET display handler at line 177 (`.limit(5)`) was not touched.

**Commit:** `c49979a`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | d06eacf | RTL margin/padding sweep — ml/mr/pl/pr → ms/me/ps/pe (A11Y-01) |
| 2 | 6899870 | WCAG AA contrast fixes + ARIA labels (A11Y-02, A11Y-03) |
| 3 | 6e11c91 | Empty states with CTA for coach and history pages (UX-01) |
| 4 | c49979a | Mobile-responsive form grids + coach context limit (UX-02) |

## Decisions Made

1. **aria-selected as string not boolean** — The IDE linter (`ARIA attributes must conform to valid values`) flagged `aria-selected={boolean}` as invalid. Changed to `aria-selected={activeTab === 'chat' ? 'true' : 'false'}`. The HTML ARIA spec defines `aria-selected` as a string enumeration ("true" | "false" | "undefined"), not a JS boolean. This is correct behavior.

2. **settings notifications wrapper** — The plan said "remove opacity-60, add a muted badge treatment." The בקרוב badge already existed at line 159 as a `<span>`. Only `opacity-60` was removed from the wrapper; no new badge was added (per plan instruction: "NOTE: A 'בקרוב' badge already exists at line 159 — do NOT re-add it").

3. **coach zero-state vs. select-conversation state** — Implemented two separate branches: zero-state for first-time users (0 conversations), and preserved the existing QuickActions div for returning users with conversations but none selected. This matches the plan specification exactly.

## Deviations from Plan

None — plan executed exactly as written.

The only noteworthy adjustment was converting `aria-selected` from a boolean expression to a string expression (`? 'true' : 'false'`) — this was prompted by the IDE linter flagging it as an ARIA spec violation, not a deviation from intent.

## Known Stubs

None — all changes are fully wired. The EmptyState components receive real data (conversations array length, router.push to actual route). No placeholder text flows to UI rendering.

## Threat Flags

No new security surfaces introduced. All changes are:
- CSS class substitutions (RTL logical properties)
- ARIA attribute additions (client markup only)
- EmptyState component insertions with existing router.push/mutation calls
- Tailwind responsive breakpoint additions
- Reduced API query limit (more restrictive, not more permissive)

## Self-Check: PASSED

Files exist:
- FOUND: mystiqor-build/src/app/(auth)/coach/page.tsx
- FOUND: mystiqor-build/src/app/(auth)/history/page.tsx
- FOUND: mystiqor-build/src/app/api/coach/messages/route.ts
- FOUND: mystiqor-build/src/components/features/history/AnalysisCard.tsx

Commits exist:
- FOUND: d06eacf (RTL sweep)
- FOUND: 6899870 (contrast + ARIA)
- FOUND: 6e11c91 (empty states)
- FOUND: c49979a (mobile grids + context limit)

Build: PASSED (0 TypeScript errors, all routes compiled successfully)
