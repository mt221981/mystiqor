---
phase: 23-floating-coach-bottom-tabs
plan: "02"
subsystem: navigation
tags: [mobile-nav, bottom-tabs, tools-page, rtl]
dependency_graph:
  requires: []
  provides: [BottomTabBar, ToolsPage]
  affects: [layout-client.tsx]
tech_stack:
  added: []
  patterns: [glass-nav, CSS-variable-z-index, safe-area-inset, usePathname-active-detection]
key_files:
  created:
    - mystiqor-build/src/components/layouts/BottomTabBar.tsx
    - mystiqor-build/src/app/(auth)/tools/page.tsx
  modified: []
decisions:
  - "Used TabDefinition interface to type the TABS constant — avoids as const cast on Icon component type"
  - "GiSpellBook confirmed available in react-icons/gi — used as ToolsPage icon"
  - "tools/page.tsx is a Server Component (no 'use client') — ToolGrid and PageHeader are both client components so hydration handled by them"
metrics:
  duration: "2 minutes"
  completed_date: "2026-03-30"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 23 Plan 02: Bottom Tab Bar & Tools Page Summary

**One-liner:** Mobile 5-tab bottom nav (glass-nav, z-40, safe-area) + /tools grid page wrapping ToolGrid.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create BottomTabBar component | `4bce669` | `src/components/layouts/BottomTabBar.tsx` |
| 2 | Create tools grid page | `5c8ec3c` | `src/app/(auth)/tools/page.tsx` |

## What Was Built

### BottomTabBar (`4bce669`)

- `'use client'` component using `usePathname` for active state detection
- 5 tabs: לוח בקרה (dashboard), מאמן AI (coach), תובנות (daily-insights), כלים (tools), פרופיל (profile)
- `glass-nav` CSS class from globals.css for backdrop blur and dark background
- `zIndex: 'var(--z-tabs)'` inline style (--z-tabs: 40)
- `paddingBottom: 'env(safe-area-inset-bottom)'` for iOS home indicator
- `height: '56px'` fixed height
- `md:hidden` — hidden on desktop, visible only on mobile
- Active tab: `text-primary` + glow drop-shadow + indicator dot (`bg-primary`)
- Inactive tab: `text-muted-foreground`
- `aria-label="ניווט ראשי"` on `<nav>` + `aria-current="page"` on active link
- `GiCrystalBall` from react-icons/gi for the coach tab

### ToolsPage (`5c8ec3c`)

- Server Component (no `'use client'`) at `/tools` route
- `PageHeader` with title "כלים מיסטיים", description, `GiSpellBook` icon, and breadcrumbs
- `ToolGrid` component renders 6 mystical tools (numerology, astrology, graphology, drawing, palmistry, tarot) in 2-col mobile / 3-col desktop grid
- `dir="rtl"` RTL layout wrapper
- `container mx-auto px-4 py-6 max-w-4xl` responsive container

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit`: 0 errors (both tasks)
- `npx vitest run`: 3 pre-existing failures in `tests/services/llm.test.ts` (LLM mock constructor — unrelated to this plan), 90 tests passing

## File Scores

### BottomTabBar.tsx

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict types, TabDefinition interface, no any |
| Error Handling | N/A | Navigation component — no async ops |
| Validation | N/A | No input |
| Documentation | 8/10 | Hebrew JSDoc on component + constant |
| Clean Code | 9/10 | Clear structure, readable isActive logic |
| Security | N/A | Client nav only |
| Performance | 9/10 | No unnecessary re-renders, stable TABS constant |
| Accessibility | 9/10 | aria-label, aria-current, semantic nav element |
| RTL | 10/10 | inset-x-0, start/end patterns respected |
| Edge Cases | 8/10 | Dashboard exact-match guard handles root path overlap |
| **TOTAL** | **63/70** = **90%** | Passes 78% threshold |

### tools/page.tsx

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | No any, clean imports |
| Error Handling | N/A | Static page |
| Validation | N/A | No input |
| Documentation | 8/10 | Hebrew JSDoc on component |
| Clean Code | 10/10 | Minimal, purpose-focused |
| Security | N/A | Server component, no mutations |
| Performance | 9/10 | Server component — no client JS overhead |
| Accessibility | 9/10 | Inherits from PageHeader and ToolGrid |
| RTL | 10/10 | dir="rtl" wrapper |
| Edge Cases | N/A | Static rendering |
| **TOTAL** | **56/60** = **93%** | Passes 78% threshold |

## Known Stubs

None — ToolGrid renders all 6 tools with real hrefs. BottomTabBar navigates to existing routes.

## Self-Check: PASSED
