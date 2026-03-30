---
phase: 24
plan: "01"
subsystem: ui-foundation
tags: [atmospheric, animation, loading-states, css-utilities, framer-motion]
dependency_graph:
  requires: []
  provides: [StandardSectionHeader, MysticLoadingText, MYSTIC_LOADING_PHRASES, pageEntry, result-heading-glow]
  affects: [plans 02 and 03 — tool page migration]
tech_stack:
  added: []
  patterns: [delayed-glow via useState+useEffect, useReducedMotion, framer-motion opacity keyframes]
key_files:
  created:
    - mystiqor-build/src/components/layouts/StandardSectionHeader.tsx
    - mystiqor-build/src/components/ui/mystic-loading-text.tsx
    - mystiqor-build/src/lib/constants/mystic-loading-phrases.ts
  modified:
    - mystiqor-build/src/lib/animations/presets.ts
    - mystiqor-build/src/app/globals.css
decisions:
  - "Typed PULSE_ANIMATE array as number[] to satisfy framer-motion's mutable TargetAndTransition — as const creates readonly tuple which framer-motion rejects"
  - "getLoadingPhrase helper exported alongside MYSTIC_LOADING_PHRASES constant for ergonomic usage in plan 02/03"
  - "result-heading-glow added as 4 CSS rules (2 utility + 2 reduced-motion) — selector targets children h2/h3 so wrapper div drives prose heading glow"
metrics:
  duration: 5min
  completed: 2026-03-30
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 24 Plan 01: Foundation Files — Atmospheric Depth Sweep Summary

**One-liner:** Three new atmospheric UI foundation files (StandardSectionHeader with delayed celestial-glow, pulsing MysticLoadingText, 16-tool Hebrew phrase map) plus pageEntry animation preset and result-heading-glow CSS utility — all reduced-motion safe.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create foundation files — StandardSectionHeader, MysticLoadingText, loading phrases, pageEntry preset | `9489f0a` | StandardSectionHeader.tsx, mystic-loading-text.tsx, mystic-loading-phrases.ts, presets.ts |
| 2 | Add result-heading-glow CSS utility to globals.css | `5ac41e7` | globals.css |

---

## What Was Built

### StandardSectionHeader.tsx
Atmospheric header component replacing `PageHeader` on tool pages. Key behaviors:
- Icon wrapper: `h-11 w-11 mystic-icon-wrap` (44px touch target)
- Delayed glow: `celestial-glow` class added 300ms after mount via `useState/useEffect`
- Entry animation: `motion.div` with `opacity: 0, y: 16` → `opacity: 1, y: 0` over 600ms
- Reduced motion: renders plain `<div>` with no animation or glow
- h1: `text-2xl font-headline font-bold tracking-tight text-gradient-gold` (matches existing PageHeader)
- Description: `text-sm font-body text-muted-foreground` (matches PageHeader pattern)

### MysticLoadingText.tsx
Pulsing Hebrew loading phrase component:
- `motion.span` with `animate={{ opacity: [0.6, 1, 0.6] }}`, `transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}`
- `aria-live="polite"` for screen reader accessibility
- Reduced motion: static `<span>` with no animation

### mystic-loading-phrases.ts
16-tool loading phrase map (`MYSTIC_LOADING_PHRASES` constant) + `DEFAULT_LOADING_PHRASE` + `getLoadingPhrase(toolKey)` helper:
- All 16 tools: astrology, tarot, numerology, dream, graphology, drawing, synthesis, solar-return, transits, synastry, compatibility, forecast, career, relationships, human-design, document
- `button` and `skeleton` variants per tool

### presets.ts (modified)
Added `pageEntry` preset before `staggerContainer`:
```typescript
pageEntry: {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.6, ease: 'easeOut' },
}
```

### globals.css (modified)
Added `.result-heading-glow` utility in `@layer utilities`:
- `filter: drop-shadow(0 0 8px rgba(221, 184, 255, 0.5)) drop-shadow(0 0 16px rgba(212, 168, 83, 0.3))` on h2/h3 children
- `prefers-reduced-motion: reduce` override: `filter: none`

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed readonly tuple type incompatibility with framer-motion**
- **Found during:** Task 1 — TypeScript compilation
- **Issue:** `const PULSE_ANIMATE = { opacity: [0.6, 1, 0.6] } as const` creates a `readonly [0.6, 1, 0.6]` tuple; framer-motion's `TargetAndTransition` requires a mutable array `number[]`
- **Fix:** Changed to `{ opacity: [0.6, 1, 0.6] as number[] }` — removes `as const` from array while keeping object shape correct
- **Files modified:** `mystic-loading-text.tsx`
- **Commit:** `9489f0a`

---

## Known Stubs

None — all components are fully implemented with real data. Loading phrases are real Hebrew copy, not placeholders.

---

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 errors |
| `pageEntry` in presets.ts | 1 match |
| `result-heading-glow` in globals.css | 4 matches (utility + reduced-motion) |
| `MYSTIC_LOADING_PHRASES` in constants | 2 matches (export + usage) |
| `StandardSectionHeader` in file | 5 matches |
| `MysticLoadingText` in file | 4 matches |

---

## File Scores (CLAUDE.md requirement)

### StandardSectionHeader.tsx
| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict types, no any, typed props interface |
| Error Handling | 8/10 | N/A for presentational component — defensive null check on breadcrumbs |
| Validation | 8/10 | ReactNode icon required (not optional) |
| Documentation | 9/10 | JSDoc in Hebrew on all functions |
| Clean Code | 9/10 | Under 100 lines, clear separation |
| Security | 8/10 | aria-hidden on decorative icon |
| Performance | 9/10 | useReducedMotion prevents unnecessary animation |
| Accessibility | 9/10 | aria-hidden, reduced-motion support |
| RTL | 10/10 | start/end utilities, no left/right |
| Edge Cases | 8/10 | Handles missing breadcrumbs, missing description |
| **TOTAL** | **88/100** | Above 78% threshold |

### MysticLoadingText.tsx
| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict types, no any |
| Error Handling | 9/10 | N/A for display component |
| Validation | 9/10 | Props typed, text is required |
| Documentation | 9/10 | JSDoc in Hebrew |
| Clean Code | 10/10 | 65 lines, extremely focused |
| Security | 9/10 | aria-live polite |
| Performance | 9/10 | Reduced motion check prevents animation setup |
| Accessibility | 9/10 | aria-live="polite" |
| RTL | 10/10 | Text direction inherits from parent |
| Edge Cases | 9/10 | Handles reduced-motion |
| **TOTAL** | **93/100** | Above 78% threshold |

### mystic-loading-phrases.ts
| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Typed interface, as const, no any |
| Error Handling | 9/10 | getLoadingPhrase uses ?? fallback |
| Validation | 9/10 | N/A for constants file |
| Documentation | 9/10 | JSDoc in Hebrew |
| Clean Code | 9/10 | Well-organized, clear naming |
| Security | 9/10 | N/A |
| Performance | 10/10 | Static constants |
| Accessibility | 9/10 | N/A |
| RTL | 9/10 | All Hebrew copy |
| Edge Cases | 9/10 | Default fallback for unknown tools |
| **TOTAL** | **92/100** | Above 78% threshold |

---

## Self-Check: PASSED

All files exist, all commits verified.
