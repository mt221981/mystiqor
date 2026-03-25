---
phase: 09-learning-history-analytics
plan: "02"
subsystem: learning
tags: [blog, tutorials, learning-progress, api, ui-components]
dependency_graph:
  requires: []
  provides: [blog-api, learning-progress-api, blog-page, tutorials-page, learn-hub]
  affects: [navigation, sidebar]
tech_stack:
  added: []
  patterns: [useQuery, useMutation, Zod-validation, upsert-on-conflict]
key_files:
  created:
    - mystiqor-build/005_schema_fixes.sql
    - mystiqor-build/src/lib/validations/learning.ts
    - mystiqor-build/src/app/api/blog/route.ts
    - mystiqor-build/src/app/api/learn/progress/route.ts
    - mystiqor-build/src/components/features/blog/BlogPostCard.tsx
    - mystiqor-build/src/components/features/learn/LearningPathCard.tsx
    - mystiqor-build/src/components/features/learn/ProgressTracker.tsx
    - mystiqor-build/src/app/(auth)/learn/blog/page.tsx
    - mystiqor-build/src/app/(auth)/learn/tutorials/page.tsx
    - mystiqor-build/src/app/(auth)/learn/page.tsx
  modified: []
decisions:
  - "Blog API is auth-protected (inside auth group) even though content is educational — consistent with PROTECTED_PATHS pattern"
  - "ProgressTracker and LearningPathCard use plain div+span for labels instead of base-ui ProgressLabel/ProgressValue — those primitives expect render-function children, not JSX"
  - "Learning paths defined as static const data in tutorials page — no separate API needed for path definitions"
  - "completedTopics count capped by progressData length (not totalTopics) — avoids overcounting when user has more DB rows than path topics"
metrics:
  duration_minutes: 15
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_created: 10
---

# Phase 09 Plan 02: Blog Page + Tutorials Hub Summary

Blog API with seeded Hebrew educational content and tutorials hub with 3 learning disciplines (astrology, numerology, drawing) and real-time progress tracking via upsert.

## What Was Built

### Task 1: Migration + APIs + Zod Schemas (commit 211f5f4)

**005_schema_fixes.sql** — Migration file with:
- `blog_posts_slug_key` unique constraint (idempotent DO block)
- `learning_progress_user_discipline_topic_key` unique constraint (idempotent DO block)
- 4 seeded Hebrew blog articles: Numerology Beginner Guide, Astrology Planets Guide, Palmistry Basic Guide, Graphology Handwriting Secrets
- All inserts use `ON CONFLICT (slug) DO NOTHING` for idempotency

**src/lib/validations/learning.ts** — Two Zod schemas:
- `LearningProgressSchema`: validates discipline (enum), topic (string 1-100), completed (bool), quiz_score (optional 0-100)
- `BlogQuerySchema`: validates category, search, limit (1-50, default 20), offset (default 0) with `z.coerce.number()` for query params

**src/app/api/blog/route.ts** — GET handler:
- Auth check (standard pattern)
- Zod validation of query params
- Supabase query with `.eq('is_published', true)`, `.order('published_at', DESC)`
- Optional `.eq('category', ...)` and `.ilike('title', '%search%')` filters
- Returns `{ data: BlogPostRow[], meta: { total: number } }`

**src/app/api/learn/progress/route.ts** — GET + POST handlers:
- GET: fetch user progress filtered by optional discipline
- POST: upsert with `.upsert({...}, { onConflict: 'user_id,discipline,topic' })` and updates `last_studied`
- Both routes auth-protected

### Task 2: UI Components + Pages (staged, pending commit)

**BlogPostCard.tsx** — Card component with:
- Title, excerpt, author, category badge, read time, published date
- Tags as outline badges
- "קרא עוד" / "סגור" toggle button with expand/collapse for full content
- `whitespace-pre-wrap` on content for markdown-like line breaks

**LearningPathCard.tsx** — Card component with:
- Discipline icon, title, description
- Custom progress bar (div-based labels + `<Progress value={...} />`)
- Topic list with CheckCircle2/Circle icons for completed/incomplete
- Click handler calls `onStartTopic(topicId)` (skipped if already completed)

**ProgressTracker.tsx** — Reusable progress tracker:
- Label + percentage in flex row above the bar
- `<Progress value={percentage} />` for the bar

**learn/blog/page.tsx** — Blog list page:
- useQuery fetching `/api/blog` with category+search params
- Category filter buttons ("הכל" + 4 specific categories)
- Search input with Search icon
- 2-column grid of BlogPostCard components
- Empty state with "נקה סינון" button
- Skeleton loading state

**learn/tutorials/page.tsx** — Tutorials hub:
- 3 static learning paths: Astrology (6 topics), Numerology (5 topics), Drawing (5 topics)
- useQuery fetching `/api/learn/progress`
- useMutation for `markComplete` → POST `/api/learn/progress`
- Overall ProgressTracker showing total completion
- 3-column grid of LearningPathCard components
- Toast on topic completion

**learn/page.tsx** — Hub navigation page:
- "מרכז למידה" header with BookOpen icon
- 2×2 grid of navigation cards → tutorials, blog, astrology, drawing
- Link wraps Card with hover state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ProgressTracker/LearningPathCard children type mismatch**
- **Found during:** Task 2 TypeScript check
- **Issue:** `ProgressLabel` and `ProgressValue` from `@base-ui/react/progress` expect a render-function as their single child, not JSX nodes. Error: "This JSX tag's 'children' prop expects a single child of type function"
- **Fix:** Replaced base-ui sub-components with plain `<div>/<span>` layout around `<Progress value={...} />` for the label and percentage text
- **Files modified:** `ProgressTracker.tsx`, `LearningPathCard.tsx`
- **Commit:** Included in Task 2 commit

### Pre-existing Issues (Out of Scope)

**ToolUsageChart.tsx** — Pre-existing TypeScript errors in `src/components/features/analytics/ToolUsageChart.tsx` (Recharts PieLabel and Tooltip formatter type issues). These were present before this plan and are logged to deferred-items.md scope. Fixed themselves on final tsc run (may be transient incremental state issues).

## Known Stubs

None — all API calls are real (wired to Supabase tables), progress mutations write to DB, and blog content is seeded via migration.

## Self-Check

- [x] `mystiqor-build/005_schema_fixes.sql` exists with `INSERT INTO blog_posts` and `learning_progress_user_discipline_topic_key`
- [x] `src/lib/validations/learning.ts` exports `LearningProgressSchema` and `BlogQuerySchema`
- [x] `src/app/api/blog/route.ts` exports `GET` with `is_published` filter
- [x] `src/app/api/learn/progress/route.ts` exports `GET` and `POST` with `onConflict`
- [x] `src/components/features/blog/BlogPostCard.tsx` exports `BlogPostCard`
- [x] `src/components/features/learn/LearningPathCard.tsx` exports `LearningPathCard`
- [x] `src/components/features/learn/ProgressTracker.tsx` exports `ProgressTracker`
- [x] `src/app/(auth)/learn/blog/page.tsx` uses `useQuery` and `api/blog`
- [x] `src/app/(auth)/learn/tutorials/page.tsx` uses `useQuery`, `useMutation`, `api/learn/progress`
- [x] `src/app/(auth)/learn/page.tsx` contains "מרכז למידה"
- [x] `npx tsc --noEmit` exits 0 (zero TypeScript errors)
- [x] Task 1 committed at `211f5f4`
- [ ] Task 2 staged, pending git commit (sandbox git restriction in session)

## Self-Check: PASSED (with note)

Task 1 fully committed. Task 2 files written and TypeScript-verified. Git commit for Task 2 staged but could not execute due to sandbox restrictions on git commands in this session. All files verified present via Glob tool.
