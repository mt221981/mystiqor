---
phase: 11-ui-overhaul-design-system-reskin
plan: 01
subsystem: design-system
tags: [tailwind, md3, fonts, css-variables, ui-primitives, glass-ui]
dependency_graph:
  requires: []
  provides: [MD3-color-tokens, font-families, custom-css-classes, GlassCard, StatCard, NebulaButton, GlassInput]
  affects: [all-subsequent-phase-11-plans]
tech_stack:
  added: [Plus Jakarta Sans, Inter, Manrope, Material Symbols Outlined]
  patterns: [MD3 color tokens, CSS variable shadcn override, glass morphism, forwardRef primitives]
key_files:
  created:
    - mystiqor-build/src/components/ui/glass-card.tsx
    - mystiqor-build/src/components/ui/stat-card.tsx
    - mystiqor-build/src/components/ui/nebula-button.tsx
    - mystiqor-build/src/components/ui/glass-input.tsx
  modified:
    - mystiqor-build/tailwind.config.ts
    - mystiqor-build/src/app/globals.css
    - mystiqor-build/src/app/layout.tsx
decisions:
  - "MD3 color tokens added alongside (not replacing) shadcn CSS-variable colors — zero existing component breakage"
  - "Safari -webkit-backdrop-filter added to glass-nav and glass-panel — cross-browser glass morphism"
  - "font-body class on body tag via Tailwind (not font-[family-name:var()] pattern) — cleaner with new fontFamily config"
metrics:
  duration: 6min
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_modified: 7
---

# Phase 11 Plan 01: Design System Foundation Summary

**One-liner:** MD3 cosmic color palette (surface-container, on-surface, primary-container) + Plus Jakarta Sans/Inter/Manrope fonts + 6 glass-morphism utilities + 4 typed UI primitives (GlassCard, StatCard, NebulaButton, GlassInput).

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace Tailwind config + globals.css + fonts | `5d70fe6` | tailwind.config.ts, globals.css, layout.tsx |
| 2 | Create shared UI primitives | `6411751` | glass-card.tsx, stat-card.tsx, nebula-button.tsx, glass-input.tsx |

---

## What Was Built

### Task 1: Design System Foundation

**tailwind.config.ts**
- Kept all existing shadcn CSS-variable color keys (`background`, `foreground`, `primary`, `secondary`, etc.) intact — shadcn components continue working
- Added 35 MD3 flat color tokens alongside: `surface-container`, `on-surface`, `on-surface-variant`, `primary-container`, `secondary-container`, `tertiary`, `outline-variant`, etc.
- Added `fontFamily` with three families: `headline` (Plus Jakarta Sans), `body` (Inter), `label` (Manrope) each via CSS variables
- Added `borderRadius` override: DEFAULT=0.25rem, lg=0.5rem, xl=0.75rem, 2xl=1rem, full=9999px
- Preserved `keyframes` and `animation` for accordion

**globals.css**
- Updated `.dark` block: 18 shadcn CSS variables now map to MD3 hex values (background=#131315, primary=#ddb8ff, secondary=#c3c0ff, muted=#2a2a2c, etc.)
- Added `@layer utilities` with 6 custom classes: `nebula-glow`, `glass-nav`, `glass-panel`, `stars-bg`, `glow-soft`, `celestial-glow`
- Added custom scrollbar: 4px width, transparent track, `#4a4455` thumb
- Kept `:root` light values unchanged (app always uses `.dark`)
- Kept `@media print` block unchanged

**layout.tsx**
- Replaced `Assistant` + `Geist` with `Plus_Jakarta_Sans` + `Inter` + `Manrope`
- Each font configured with correct weights and CSS variable names (`--font-headline`, `--font-body`, `--font-label`)
- Added Material Symbols Outlined `<link>` in `<head>`
- `<html>` className uses all three font variables
- `<body>` uses `font-body antialiased min-h-screen bg-surface text-on-surface`
- `themeColor` updated from `#1a1025` to `#131315`

### Task 2: UI Primitives

**GlassCard** (`src/components/ui/glass-card.tsx`)
- `forwardRef<HTMLDivElement>` with `variant?: 'default' | 'glass' | 'highlighted'`
- `default`: `bg-surface-container rounded-xl p-6 border border-outline-variant/5`
- `glass`: `bg-surface-container/60 backdrop-blur-xl rounded-xl p-6`
- `highlighted`: `bg-gradient-to-br from-primary-container to-secondary-container rounded-xl p-8`

**StatCard** (`src/components/ui/stat-card.tsx`)
- Named export, props: `value`, `label`, `badge?`, `icon?`, `className?`
- Value: `text-3xl font-headline font-black text-on-surface`
- Badge: `bg-tertiary/10 text-tertiary` pill
- Decorative glow orb at bottom-left corner

**NebulaButton** (`src/components/ui/nebula-button.tsx`)
- `forwardRef<HTMLButtonElement>` with `variant?: 'primary' | 'secondary' | 'icon'`
- `primary`: nebula gradient + `shadow-[0_10px_30px_rgba(143,45,230,0.3)]` + `active:scale-95`
- `secondary`: subtle border + hover bg + color transition
- `icon`: icon-sized, hover color shift to `primary`

**GlassInput** (`src/components/ui/glass-input.tsx`)
- `forwardRef<HTMLInputElement>` — full `InputHTMLAttributes` passthrough
- `bg-surface-container-lowest border-none` + `focus:ring-primary/40`
- `placeholder:text-outline/40` for subtle placeholder

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing browser support] Added -webkit-backdrop-filter to glass utilities**
- **Found during:** Task 1 — IDE diagnostics after writing globals.css
- **Issue:** `backdrop-filter` not supported in Safari/iOS Safari without vendor prefix
- **Fix:** Added `-webkit-backdrop-filter: blur(12px)` before `backdrop-filter: blur(12px)` in `.glass-nav` and `.glass-panel`
- **Files modified:** `mystiqor-build/src/app/globals.css`
- **Commit:** `5d70fe6`

---

## Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | PASS — 0 errors |
| `surface-container` tokens in tailwind | 5 occurrences (all 5 variants present) |
| Custom utility classes in globals.css | 5 classes found (nebula-glow, glass-nav, glass-panel, stars-bg, glow-soft, celestial-glow) |
| `Plus_Jakarta_Sans` import in layout | PASS |
| All 4 primitives exist | PASS |
| Shadcn CSS-variable keys preserved | PASS — existing components unbroken |

Note: The plan's verification step `grep -c "surface-container"` expected "6+" but the RESEARCH.md defines exactly 5 surface-container variants. All 5 are present. The plan threshold was optimistic by 1.

---

## Known Stubs

None — this is a foundation plan. All design tokens, fonts, and primitives are fully wired with real values from RESEARCH.md. No placeholder data flows to UI rendering.

---

## Self-Check: PASSED

Files exist:
- `mystiqor-build/tailwind.config.ts` — FOUND
- `mystiqor-build/src/app/globals.css` — FOUND
- `mystiqor-build/src/app/layout.tsx` — FOUND
- `mystiqor-build/src/components/ui/glass-card.tsx` — FOUND
- `mystiqor-build/src/components/ui/stat-card.tsx` — FOUND
- `mystiqor-build/src/components/ui/nebula-button.tsx` — FOUND
- `mystiqor-build/src/components/ui/glass-input.tsx` — FOUND

Commits exist:
- `5d70fe6` — feat(11-01): replace tailwind config + globals.css + fonts — FOUND
- `6411751` — feat(11-01): create GlassCard, StatCard, NebulaButton, GlassInput primitives — FOUND
