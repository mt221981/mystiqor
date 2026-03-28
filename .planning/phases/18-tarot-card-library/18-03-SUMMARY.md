---
phase: 18-tarot-card-library
plan: 03
subsystem: tarot-ui-components
tags: [tarot, ui, framer-motion, 3d-flip, celtic-cross, shadcn]
dependency_graph:
  requires: [18-01]
  provides: [SpreadSelector, TarotCardTile, TarotCardMeta, SpreadLayout, TarotCardDetailModal]
  affects: [tarot-page-wiring-plan-04]
tech_stack:
  added: []
  patterns: [framer-motion-3d-flip, animatepresence-collapse, css-grid-sparse, base-ui-dialog]
key_files:
  created:
    - mystiqor-build/src/components/features/tarot/SpreadSelector.tsx
    - mystiqor-build/src/components/features/tarot/TarotCardTile.tsx
    - mystiqor-build/src/components/features/tarot/TarotCardMeta.tsx
    - mystiqor-build/src/components/features/tarot/SpreadLayout.tsx
    - mystiqor-build/src/components/features/tarot/TarotCardDetailModal.tsx
  modified: []
decisions:
  - "Used local TarotCardRow type extension (TarotCardBaseRow & TarotCardRichFields) to support Plan 01 rich fields before DB migration lands — optional fields prevent TS errors before plan 01 merges"
  - "Celtic Cross position 2 (האתגר) shows as overlay badge notation instead of rotated 90deg per Research Pitfall 6 (MVP approach)"
  - "Mobile Celtic Cross flattens to numbered list instead of grid — avoids overflow/touch issues on small screens"
  - "TooltipTrigger used without asChild — base-ui tooltip does not support asChild prop (unlike Radix)"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-28T20:41:16Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 18 Plan 03: Tarot UI Components Summary

5 fully-typed React components for tarot spreads: SpreadSelector (4-spread chooser), TarotCardTile (3D flip + collapsible meta), TarotCardMeta (colored element badges + Hebrew metadata labels), SpreadLayout (4 layout types including Celtic Cross CSS grid), TarotCardDetailModal (Dialog with GlassCard gold variant).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build SpreadSelector and TarotCardMeta | `83073d8` | SpreadSelector.tsx, TarotCardMeta.tsx |
| 2 | Build TarotCardTile, SpreadLayout, TarotCardDetailModal | `b197645` | TarotCardTile.tsx, SpreadLayout.tsx, TarotCardDetailModal.tsx |

## What Was Built

### SpreadSelector.tsx
- Renders 4 spread buttons from `TAROT_SPREADS` constant
- Each button shows: spread name + card count in parentheses + description subtitle
- Active state: `border-accent/60 bg-surface-container-high text-accent`
- Inactive state: `border-outline-variant/20 text-on-surface-variant` with hover
- `SpreadSelectorProps` interface with `selectedId: string` and `onSelect: (spread: TarotSpread) => void`

### TarotCardMeta.tsx
- Collapsible section using `AnimatePresence` + `motion.div` with height animation
- Element badge colors: fire=red, water=blue, air=yellow, earth=green
- Hebrew labels for all fields: אלמנט, התאמה אסטרולוגית, ערך נומרולוגי, נתיב קבלה, ארכיטיפ, מילות מפתח ישר/הפוך
- Gold (`text-accent`) label color per UI-SPEC
- Keyword chips rendered as outlined `Badge` components
- `isExpanded` prop controls visibility

### TarotCardTile.tsx
- 3D flip: `perspective: 1000px` on wrapper, `transformStyle: preserve-3d`, `rotateY: 180 → 0` animation
- Front/back faces with `backfaceVisibility: 'hidden'` — per Research Pitfall 4
- `delay: index * 0.15` for staggered reveal
- Card back: dark purple gradient with centered star glyph
- Card front: name (Hebrew/English), arcana badge, suit badge, top-3 keywords
- Collapsible `TarotCardMeta` on expand toggle
- Local `TarotCardRow` type extends DB Row with optional rich fields (Plan 01 parallel compat)

### SpreadLayout.tsx
- `switch (spreadId)` dispatches to 4 sub-layouts:
  - `single_card`: `max-w-xs mx-auto` centered
  - `three_card`: `grid-cols-1 sm:grid-cols-3` with position labels
  - `relationship`: 2-top + 1-centered + 2-bottom arrangement
  - `celtic_cross`: 5-column CSS grid (desktop) / numbered list (mobile) with Tooltip position names
- `ScrollArea` wrapper for Celtic Cross desktop
- `TooltipProvider` wraps Celtic Cross for position name tooltips

### TarotCardDetailModal.tsx
- `Dialog` (base-ui) with `onOpenChange` calling `onClose`
- `DialogHeader` + `DialogTitle` with Hebrew card name
- `GlassCard variant="gold"` for upright meaning, `variant="default"` for reversed
- `TarotCardMeta` with `isExpanded={true}` — always shows all metadata in modal
- `ScrollArea className="max-h-[70vh]"` for long content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TooltipTrigger asChild incompatibility**
- **Found during:** Task 2 (TypeScript compile)
- **Issue:** SpreadLayout used `<TooltipTrigger asChild>` but base-ui tooltip does not support `asChild` prop (unlike Radix UI)
- **Fix:** Removed `asChild` prop from `TooltipTrigger`
- **Files modified:** SpreadLayout.tsx
- **Commit:** b197645

## File Scores

### SpreadSelector.tsx
| Criterion | Score |
|-----------|-------|
| TypeScript | 10/10 |
| Error Handling | 8/10 — N/A (pure UI, no async) |
| Validation | 9/10 |
| Documentation | 8/10 — Hebrew JSDoc |
| Clean Code | 9/10 |
| Security | 9/10 — N/A (read-only) |
| Performance | 8/10 |
| Accessibility | 8/10 — aria-pressed, aria-label |
| RTL | 10/10 — start/end, no left/right |
| Edge Cases | 8/10 |
| **TOTAL** | **87/100** |

### TarotCardMeta.tsx
| Criterion | Score |
|-----------|-------|
| TypeScript | 10/10 |
| Error Handling | 8/10 — null guards on all fields |
| Validation | 9/10 |
| Documentation | 8/10 |
| Clean Code | 9/10 |
| Security | 9/10 |
| Performance | 8/10 |
| Accessibility | 8/10 |
| RTL | 10/10 |
| Edge Cases | 9/10 — handles null/empty arrays |
| **TOTAL** | **88/100** |

### TarotCardTile.tsx
| Criterion | Score |
|-----------|-------|
| TypeScript | 10/10 |
| Error Handling | 8/10 — optional chaining on new fields |
| Validation | 8/10 |
| Documentation | 8/10 |
| Clean Code | 8/10 |
| Security | 9/10 |
| Performance | 9/10 — stagger delay, AnimatePresence |
| Accessibility | 9/10 — aria-expanded, tabIndex, onKeyDown |
| RTL | 10/10 |
| Edge Cases | 8/10 — null checks, empty arrays |
| **TOTAL** | **87/100** |

### SpreadLayout.tsx
| Criterion | Score |
|-----------|-------|
| TypeScript | 10/10 |
| Error Handling | 8/10 — null guards per position |
| Validation | 8/10 |
| Documentation | 8/10 |
| Clean Code | 9/10 — sub-components per layout |
| Security | 9/10 |
| Performance | 8/10 — ScrollArea for overflow |
| Accessibility | 8/10 — Tooltip position names |
| RTL | 9/10 |
| Edge Cases | 8/10 — default fallback in switch |
| **TOTAL** | **85/100** |

### TarotCardDetailModal.tsx
| Criterion | Score |
|-----------|-------|
| TypeScript | 10/10 |
| Error Handling | 8/10 — null guard on card |
| Validation | 8/10 |
| Documentation | 8/10 |
| Clean Code | 9/10 |
| Security | 9/10 |
| Performance | 8/10 — ScrollArea max-h-[70vh] |
| Accessibility | 9/10 — Dialog native a11y |
| RTL | 10/10 |
| Edge Cases | 8/10 — card null = empty dialog |
| **TOTAL** | **87/100** |

All 5 files score above the 78% threshold.

## Known Stubs

None — all 5 components render real data from their props. The TarotCardRow rich fields (`element`, `astrology`, etc.) are optional props that default to null/empty when Plan 01's DB migration hasn't run yet — this is intentional and documented (not a stub, but a forward-compat pattern).

## Self-Check: PASSED

All 5 component files verified present. Both commits (83073d8, b197645) verified in git log.
