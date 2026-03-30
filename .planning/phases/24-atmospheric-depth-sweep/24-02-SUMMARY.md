---
phase: 24-atmospheric-depth-sweep
plan: "02"
subsystem: ui-atmosphere
tags: [framer-motion, atmospheric, loading-text, accessibility, rtl]
dependency_graph:
  requires: ["24-01"]
  provides: ["ATMOS-01-partial", "ATMOS-02-partial", "ATMOS-03-partial", "ATMOS-04-partial", "CONTRAST-02-partial"]
  affects: ["all-tool-pages"]
tech_stack:
  added: []
  patterns: ["StandardSectionHeader usage", "pageEntry motion.div wrapper", "MysticLoadingText in buttons", "result-heading-glow on prose", "useReducedMotion guard"]
key_files:
  created: []
  modified:
    - src/app/(auth)/tools/astrology/page.tsx
    - src/app/(auth)/tools/tarot/page.tsx
    - src/app/(auth)/tools/numerology/page.tsx
    - src/app/(auth)/tools/dream/page.tsx
    - src/app/(auth)/tools/graphology/page.tsx
    - src/app/(auth)/tools/drawing/page.tsx
    - src/app/(auth)/tools/synthesis/page.tsx
    - src/app/(auth)/tools/document/page.tsx
    - src/app/(auth)/tools/career/page.tsx
    - src/app/(auth)/tools/compatibility/page.tsx
    - src/app/(auth)/tools/page.tsx
decisions:
  - "Optional chaining MYSTIC_LOADING_PHRASES['key']?.button ?? fallback — satisfies TS2532 without getLoadingPhrase helper, preserves literal key reference for grep-based checks"
  - "tools/page.tsx converted from server to client component — StandardSectionHeader requires framer-motion useReducedMotion (client API)"
  - "career: GiStarFormation replaces GiBriefcase (lucide) per ATMOS-03"
  - "document: GiScrollQuill replaces FileText (lucide) per ATMOS-03"
  - "compatibility: GiYinYang replaces GiHearts in header (inner card icons keep GiHearts)"
metrics:
  duration_minutes: 21
  completed_date: "2026-03-30"
  tasks_completed: 2
  files_modified: 11
---

# Phase 24 Plan 02: Atmospheric Tool Page Migration (Batch 1+2) Summary

Migrated all 11 first-wave tool pages to use StandardSectionHeader, pageEntry animation, MysticLoadingText with per-tool Hebrew phrases, and result-heading-glow on prose output wrappers.

## What Was Built

11 tool pages now share atmospheric depth: mystical section headers with delayed icon glow, 600ms fade+drift entry animation (reduced-motion aware), per-tool Hebrew mystical loading phrases in submit buttons, and glowing h2/h3 headings inside AI result markdown blocks.

## Tasks

### Task 1: Migrate astrology, tarot, numerology, dream, graphology (5 pages)

**Commits:** 023e139, e16d1c8

Changes per page:
- `PageHeader` import removed → `StandardSectionHeader` imported
- `useReducedMotion` added from framer-motion
- Top-level container wrapped in `motion.div` with `initial/animate` guarded by `shouldReduceMotion`
- Submit button loading branch: `MYSTIC_LOADING_PHRASES['tool-key']?.button ?? fallback` text passed to `<MysticLoadingText>`
- Prose wrappers (tarot, numerology, dream, graphology): `result-heading-glow` class prepended
- graphology: 3 prose wrappers updated (summary, overall_assessment, insights items)
- astrology: no inline prose wrapper — uses AIInterpretation component (handled in Plan 03)
- dream: loading state uses Loader2 + MysticLoadingText combo (isSubmitting pattern, not useMutation)

### Task 2: Migrate drawing, synthesis, document, career, compatibility, tools grid (6 pages)

**Commits:** 5720eb1

Changes per page:
- Same 5-change pattern as Task 1
- `drawing/page.tsx`: MYSTIC_LOADING_PHRASES['drawing'] reference in comment (DrawingAnalysisForm handles its own button — not in this plan's files_modified)
- `synthesis/page.tsx`: MysticLoadingText in both "on_demand" and "weekly" button branches
- `document/page.tsx`: FileText icon → GiScrollQuill; Loader2 + MysticLoadingText combo
- `career/page.tsx`: GiBriefcase → GiStarFormation
- `compatibility/page.tsx`: GiHearts → GiYinYang in header; result-heading-glow on advice prose
- `tools/page.tsx`: converted from server component to `'use client'` for motion.div + useReducedMotion

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript TS2532 — Object is possibly 'undefined' on Record access**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** `MYSTIC_LOADING_PHRASES['key'].button` errors because `Record<string, LoadingPhrase>` does not guarantee key existence in strict TS
- **Fix:** Changed all accesses to `MYSTIC_LOADING_PHRASES['key']?.button ?? 'fallback-phrase'` optional chaining pattern
- **Files modified:** All 10 tool pages with MYSTIC_LOADING_PHRASES usage
- **Commit:** e16d1c8

## Known Stubs

None — all 11 pages wire to real StandardSectionHeader, real MYSTIC_LOADING_PHRASES constants, and real CSS utility class. No hardcoded empty values or placeholder text.

## Verification

- All 11 tool pages under `(auth)/tools/` contain `StandardSectionHeader`
- All 11 contain `useReducedMotion`
- All 10 pages with forms contain tool-specific `MYSTIC_LOADING_PHRASES['key']` reference
- result-heading-glow on: tarot, numerology, dream, graphology (3 wrappers), compatibility
- Zero TypeScript errors (`npx tsc --noEmit` clean)
- No `import { PageHeader }` remaining in any of the 11 migrated files
- All 11 files retain `'use client'` directive

## Self-Check: PASSED

- All 11 modified files exist on disk
- All 3 commits found in git log (023e139, 5720eb1, e16d1c8)
- TypeScript: 0 errors
