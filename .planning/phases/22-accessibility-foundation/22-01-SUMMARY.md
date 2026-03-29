---
phase: 22-accessibility-foundation
plan: "01"
subsystem: css-foundation
tags: [accessibility, z-index, reduced-motion, css-variables, wcag]
dependency_graph:
  requires: []
  provides: [z-index-scale, reduced-motion-support]
  affects: [Header, MobileNav, InstallPrompt, Phase23-FloatingCoach]
tech_stack:
  added: []
  patterns: [CSS custom properties, prefers-reduced-motion media query, inline style z-index]
key_files:
  created: []
  modified:
    - mystiqor-build/src/app/globals.css
    - mystiqor-build/src/components/layouts/Header.tsx
    - mystiqor-build/src/components/layouts/MobileNav.tsx
    - mystiqor-build/src/components/features/pwa/InstallPrompt.tsx
decisions:
  - "Used inline style={{ zIndex: 'var(--z-*)' }} rather than Tailwind arbitrary z-[var(--z-*)] — more explicit and reliable across browsers"
  - "Z-index custom properties added to both :root and .dark blocks for completeness — values are identical since z-index does not change with theme"
  - "--z-overlay: 50 (same as header) allows overlay to cover content but allows floating coach at --z-floating: 60 to sit above it when needed"
metrics:
  duration: "~3 min"
  completed: "2026-03-29"
  tasks_completed: 2
  files_modified: 4
requirements: [CONTRAST-03, CONTRAST-04]
---

# Phase 22 Plan 01: Z-Index Scale + Prefers-Reduced-Motion Summary

Global CSS foundation for Phase 23 floating coach — centralized z-index scale as CSS custom properties plus WCAG 2.3.3-compliant prefers-reduced-motion silencer across all 7 existing animations.

## What Was Built

### Task 1: globals.css — Z-Index Scale + Reduced-Motion

Added two blocks to `mystiqor-build/src/app/globals.css`:

**Z-index custom properties** (in both `:root` and `.dark` blocks):
- `--z-base: 0`, `--z-dropdown: 10`, `--z-sticky: 20`
- `--z-header: 50`, `--z-tabs: 40`, `--z-floating: 60`
- `--z-panel: 55`, `--z-overlay: 50`, `--z-modal: 70`, `--z-toast: 80`

**prefers-reduced-motion block** (at end of file):
- Explicitly silences `.stars-bg`, `.aurora-bg`, `.sparkle-float`, `.sparkle-float::before`, `.shimmer-border`, `.shimmer-border::after`
- Disables `.mystic-hover` transitions and hover transforms
- Wildcard catch-all reduces all animation-duration and transition-duration to 0.01ms

### Task 2: Header, MobileNav, InstallPrompt — CSS Variable Z-Indexes

Migrated three layout components from hardcoded `z-50` Tailwind class to CSS variable inline styles:

| Component | Removed | Added |
|-----------|---------|-------|
| Header.tsx | `z-50` from className | `style={{ zIndex: 'var(--z-header)' }}` |
| MobileNav.tsx overlay | `z-50` from className | `style={{ zIndex: 'var(--z-overlay)' }}` |
| MobileNav.tsx panel | `z-50` from className | `style={{ zIndex: 'var(--z-panel)' }}` |
| InstallPrompt.tsx | `z-50` from className | `style={{ zIndex: 'var(--z-floating)' }}` |

## Verification Results

All 6 plan verification checks passed:
1. `--z-floating` count in globals.css: **2** (root + dark)
2. `prefers-reduced-motion` count: **1**
3. `z-50` in Header.tsx: **none**
4. `z-50` in MobileNav.tsx: **none**
5. `var(--z-` in Header.tsx: **matched**
6. `var(--z-` in MobileNav.tsx: **matched (2)**

## Commits

| Task | Hash | Message |
|------|------|---------|
| Task 1 | `e734b12` | feat(22-01): add z-index scale and prefers-reduced-motion to globals.css |
| Task 2 | `91229be` | feat(22-01): migrate Header, MobileNav, InstallPrompt to CSS variable z-indexes |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all changes are complete CSS/TSX declarations with no placeholder values.

## Phase 23 Ready

Phase 23 can now:
- Add floating AI coach at `--z-floating: 60` — sits above header (50) and overlay (50)
- Add bottom tabs at `--z-tabs: 40` — sits below header (50) and overlay (50)
- No z-index collision with existing components

## Self-Check: PASSED
