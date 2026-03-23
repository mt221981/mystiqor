---
phase: 05-tools-tier-2-image-upload-tools
plan: "01"
subsystem: drawing-analysis
tags: [drawing, htp, koppitz, fdm, vision, llm, analysis, image-upload]
dependency_graph:
  requires:
    - "01-infrastructure-hardening (upload route, LLM service)"
    - "02-auth-onboarding (auth check, createClient)"
    - "04-tools-tier-1 (SubscriptionGuard pattern, palmistry route pattern)"
  provides:
    - "POST /api/tools/drawing — drawing analysis via GPT-4o vision"
    - "KoppitzVisualization component — feature present/absent badges"
    - "FDMVisualization component — FDM categories + emotional indicators"
    - "AnnotatedDrawingViewer component — image + feature side panel"
    - "Drawing analysis page — upload, type selector, full results display"
  affects:
    - "/tools/drawing page (user-facing drawing analysis)"
tech_stack:
  added: []
  patterns:
    - "invokeLLM with imageUrls + responseSchema + zodSchema (Pitfall 4 compliance)"
    - "DrawingResponse typed result from LLM validation"
    - "SubscriptionGuard feature='analyses' wrapping form content"
    - "useMutation onSuccess(data, variables) to capture input imageUrl for display"
key_files:
  created:
    - "mystiqor-build/src/app/api/tools/drawing/route.ts"
    - "mystiqor-build/src/components/features/drawing/KoppitzVisualization.tsx"
    - "mystiqor-build/src/components/features/drawing/FDMVisualization.tsx"
    - "mystiqor-build/src/components/features/drawing/AnnotatedDrawingViewer.tsx"
    - "mystiqor-build/src/app/(auth)/tools/drawing/page.tsx"
  modified: []
decisions:
  - "invokeLLM<DrawingResponse> typed generic — validationResult.data cast to DrawingResponse for spread into DB row"
  - "imageUrl preserved in resultImageUrl state via useMutation onSuccess variables — DrawingResponse type has no imageUrl field"
  - "AnnotatedDrawingViewer shows features in side panel (not SVG overlays) — DrawingResponse.features has no position data"
  - "FDMVisualization is a new HTP-focused component, not a port of github-source FDMVisualization.jsx (which analyzed handwriting forgery, not drawings)"
metrics:
  duration: "7 minutes"
  completed_date: "2026-03-23"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 05 Plan 01: Drawing Analysis Tool Summary

## One-liner

Drawing analysis pipeline: image upload to GPT-4o vision to HTP psychological analysis with Koppitz indicators, FDM categories, and annotated viewer.

## What Was Built

### Task 1: API route + 3 visualization components

**POST /api/tools/drawing/route.ts**
- Auth check via `createClient()` + `getUser()`
- Zod input schema: `{ imageUrl, drawingType, userAge?, userGender? }`
- Calls `buildDrawingAnalysisPrompt()` from drawing/analysis.ts
- `invokeLLM<DrawingResponse>` with `imageUrls: [imageUrl]` (triggers GPT-4o vision), `responseSchema` JSON object, and `zodSchema: DrawingResponseSchema` (Pitfall 4 compliance — both required)
- Validates LLM response via `validationResult.success`
- Saves to `analyses` table: `tool_type: 'drawing'`, stores result + summary
- Returns `{ data: { ...analysisResult, analysis_id } }`

**KoppitzVisualization.tsx**
- Props: `{ features: DrawingResponse['features'], koppitzScore?: number }`
- Features list with CheckCircle/XCircle badges (present green, absent red)
- Koppitz score badge: 0-10 normal (green), 11-20 moderate (yellow), 21-30 high (red)
- Present/absent count summary, Hebrew research note, RTL layout

**FDMVisualization.tsx**
- Props: `{ categories: string[], emotionalIndicators: string[] }`
- FDM categories as Badge components with purple styling
- Emotional indicators as list with colored dot per item (8-color rotation)
- framer-motion staggered entrance, RTL layout

**AnnotatedDrawingViewer.tsx**
- Props: `{ imageUrl: string, features: DrawingResponse['features'], summary: string }`
- next/image for uploaded drawing display
- Side panel with present features (green) and absent features (red, max 5 shown)
- Summary text below image in purple panel
- Responsive: column on mobile, row on desktop (lg:flex-row)

### Task 2: Drawing analysis page

**drawing/page.tsx** (298 lines — under 300 limit)
- `'use client'` + React Hook Form with `zodResolver`
- 4-button drawing type selector: בית/עץ/אדם/חופשי with active highlight
- File upload via `/api/upload` with uploading state + Loader2 spinner
- URL input field as alternative
- `SubscriptionGuard feature="analyses"` wraps form content
- `useMutation` with `onSuccess(data, variables)` — captures `variables.imageUrl` for AnnotatedDrawingViewer
- Results section: AnnotatedDrawingViewer → KoppitzVisualization → FDMVisualization → insights (ReactMarkdown)
- `PageHeader` with breadcrumbs: דף הבית / כלים / ניתוח ציורים
- framer-motion `fadeInUp` animations, Hebrew error messages, RTL `dir="rtl"`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed DrawingResult type spread in API route**
- **Found during:** Task 1 TypeScript check
- **Issue:** `invokeLLM<unknown>` + `validationResult.data` typed as unknown — could not spread into NextResponse
- **Fix:** Changed to `invokeLLM<DrawingResponse>` + cast `validationResult.data as DrawingResponse`
- **Files modified:** route.ts
- **Commit:** c60de20

**2. [Rule 1 - Bug] Fixed FDMVisualization array index type**
- **Found during:** Task 1 TypeScript check
- **Issue:** `colors[index % colors.length]` returns `string | undefined` under `noUncheckedIndexedAccess`
- **Fix:** Added `?? 'bg-purple-400'` nullish coalescing fallback
- **Files modified:** FDMVisualization.tsx
- **Commit:** c60de20

**3. [Rule 1 - Bug] Fixed imageUrl not in DrawingResponse type**
- **Found during:** Task 2 TypeScript check
- **Issue:** Plan said `result.imageUrl ?? ''` but `DrawingResponse` has no `imageUrl` field
- **Fix:** Added `resultImageUrl` state, captured in `useMutation.onSuccess(data, variables)` from form input
- **Files modified:** page.tsx
- **Commit:** 5a7cd31

**4. [Scope Note] FDMVisualization is a new component, not a port**
- The github-source `FDMVisualization.jsx` analyzes handwriting forgery (micro-phenomena for FDE), not drawing FDM categories
- The drawing tool needed a component showing `fdm_categories: string[]` and `emotional_indicators: string[]` from `DrawingResponse`
- Built a purpose-fit component rather than adapting the unrelated forgery visualization

## Known Stubs

None — all data flows from real API response to components.

## Self-Check: PASSED

All 5 files exist on disk. Both commits (c60de20, 5a7cd31) confirmed in git log.
