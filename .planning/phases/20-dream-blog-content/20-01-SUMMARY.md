---
phase: 20-dream-blog-content
plan: "01"
subsystem: dream-form, blog-card
tags: [dream, blog, emoji-grid, navigation, wave-0, test-scaffold]
dependency_graph:
  requires: []
  provides: [DREAM-01, BLOG-02]
  affects: [dream-page, blog-page, blog-post-card]
tech_stack:
  added: []
  patterns: [emoji-toggle-grid, link-navigation]
key_files:
  created:
    - mystiqor-build/tests/services/blog.test.ts
    - mystiqor-build/tests/components/EmotionGrid.test.tsx
  modified:
    - mystiqor-build/src/app/(auth)/tools/dream/page.tsx
    - mystiqor-build/src/components/features/blog/BlogPostCard.tsx
    - mystiqor-build/src/app/(auth)/learn/blog/page.tsx
decisions:
  - "DREAM_EMOTIONS emoji grid uses aria-pressed for accessibility — each button acts as a toggle with clear visual feedback"
  - "BlogPost.slug added to interface (was in DB type but missing from app interface)"
  - "blog.test.ts expected to fail until Plan 02 creates blog-data.ts — this is Wave 0 intentional behavior"
  - "dream/page.tsx TagInput component kept since symbols still uses it; only emotions replaced"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-29"
  tasks: 2
  files: 5
---

# Phase 20 Plan 01: Dream Emoji Grid + BlogPostCard Link Navigation Summary

Replaced emotions TagInput with 12-button emoji grid in dream form, refactored BlogPostCard from expand/collapse to link navigation, and created Wave 0 test scaffolds.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create test scaffolds + replace TagInput with emoji grid | 68af71e | dream/page.tsx, tests/components/EmotionGrid.test.tsx, tests/services/blog.test.ts |
| 2 | Refactor BlogPostCard to link navigation + update blog page | a7bb2e0 | BlogPostCard.tsx, blog/page.tsx |

## Verification Results

- EmotionGrid tests: 3/3 PASS (DREAM_EMOTIONS has 12 items, all fields present, all values unique)
- TypeScript: 0 errors (`npx tsc --noEmit` exits 0)
- blog.test.ts: FAIL as expected (Wave 0 — blog-data.ts will be created in Plan 02)
- Pre-existing llm.test.ts failures: 3 tests (unrelated to this plan, pre-existing)

## What Was Built

### Task 1: Emoji Grid + Test Scaffolds

**Dream form emotions section** (`src/app/(auth)/tools/dream/page.tsx`):
- Replaced `TagInput` component for emotions with a 12-button emoji grid
- Each button shows emoji + Hebrew label, uses `aria-pressed` for accessibility
- `toggleEmotion` callback handles on/off toggling via React Hook Form `setValue`
- Responsive layout: `grid-cols-3` on mobile, `grid-cols-4` on sm+
- Symbols section unchanged — TagInput remains for free-text symbol entry
- `DREAM_EMOTIONS` imported from `@/lib/constants/dream-data`
- `cn` utility used for conditional styling

**Wave 0 test scaffolds**:
- `tests/components/EmotionGrid.test.tsx` — 3 tests validating DREAM_EMOTIONS data (all pass immediately)
- `tests/services/blog.test.ts` — 4 tests validating BLOG_POSTS_SEED shape (will fail until Plan 02)

### Task 2: BlogPostCard Refactor

**BlogPostCard** (`src/components/features/blog/BlogPostCard.tsx`):
- Added `slug: string` to `BlogPost` interface (was in `database.ts` but missing from app interface)
- Removed `expanded: boolean` and `onToggle: () => void` props
- Removed expand/collapse button with ChevronDown/ChevronUp icons
- Removed inline content expansion block
- Added `import Link from 'next/link'`
- Replaced expand button with `<Link href={/learn/blog/${post.slug}}>קרא עוד</Link>`

**Blog page** (`src/app/(auth)/learn/blog/page.tsx`):
- Removed `expandedId` state
- Removed `handleToggle` function
- Simplified BlogPostCard usage to `<BlogPostCard key={post.id} post={post} />`

## Decisions Made

1. `aria-pressed` on emoji buttons — accessibility best practice for toggle buttons
2. `slug: string` field position in BlogPost interface — added after `title` for readability
3. Wave 0 blog.test.ts intentionally fails — documented in test file header comment
4. dream/page.tsx remains slightly over 300 lines (328) — TagInput cannot be removed since symbols still uses it; this is acceptable per CLAUDE.md rule 5 (never break working code)

## Deviations from Plan

None — plan executed exactly as written. The 328-line file length (vs 300-line guideline) is a pre-existing constraint since TagInput serves symbols field; documented here for transparency.

## Known Stubs

- `blog.test.ts` imports `BLOG_POSTS_SEED` from `@/lib/constants/blog-data` which does not yet exist — Plan 02 will create this file. Tests intentionally fail until then.

## Self-Check: PASSED

Files created/modified exist:
- mystiqor-build/src/app/(auth)/tools/dream/page.tsx — FOUND
- mystiqor-build/src/components/features/blog/BlogPostCard.tsx — FOUND
- mystiqor-build/src/app/(auth)/learn/blog/page.tsx — FOUND
- mystiqor-build/tests/components/EmotionGrid.test.tsx — FOUND
- mystiqor-build/tests/services/blog.test.ts — FOUND

Commits exist:
- 68af71e — FOUND
- a7bb2e0 — FOUND
