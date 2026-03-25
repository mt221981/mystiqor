---
phase: 07-ai-coach-mystic-synthesis
plan: "01"
subsystem: ai-coach
tags: [ai-coach, chat, llm, react-query, rtl, supabase]
dependency_graph:
  requires:
    - "01-infrastructure-hardening (Supabase, LLM service)"
    - "02-auth-onboarding (user auth, profiles)"
    - "03-ux-shell-profile-dashboard-tracking (SubscriptionGuard, goals, mood)"
  provides:
    - "GET/POST /api/coach/conversations"
    - "GET/POST /api/coach/messages"
    - "buildCoachingContext service"
    - "ChatMessage, ChatInput, QuickActions components"
    - "/coach page"
  affects:
    - "07-02 (coaching journeys uses same context pattern)"
tech_stack:
  added:
    - "react-markdown v10 with remarkGfm for RTL markdown rendering"
  patterns:
    - "free-form LLM text mode (no responseSchema/zodSchema)"
    - "parallel Promise.all for context building"
    - "optimistic updates with rollback on error"
    - "RTL flex-row-reverse for user messages"
key_files:
  created:
    - "mystiqor-build/src/services/coach/context-builder.ts"
    - "mystiqor-build/src/app/api/coach/conversations/route.ts"
    - "mystiqor-build/src/app/api/coach/messages/route.ts"
    - "mystiqor-build/src/components/features/coach/ChatMessage.tsx"
    - "mystiqor-build/src/components/features/coach/ChatInput.tsx"
    - "mystiqor-build/src/components/features/coach/QuickActions.tsx"
    - "mystiqor-build/src/app/(auth)/coach/page.tsx"
  modified: []
decisions:
  - "supabase as any cast used for conversations/coaching_messages tables — these tables exist in database.generated.ts but not in database.ts, avoiding full database.ts rewrite"
  - "free-form text mode for LLM coaching — no JSON schema, Hebrew prose responses"
  - "SubscriptionGuard wraps entire coach page (not per-message) per RESEARCH.md recommendation"
  - "react-markdown v10 requires wrapper div for className — className prop removed from ReactMarkdown component"
  - "optimistic message updates with rollback on error for responsive UX"
metrics:
  duration: "~25 minutes"
  completed: "2026-03-24"
  tasks_completed: 2
  files_created: 7
---

# Phase 7 Plan 1: AI Coach Chat System Summary

AI coaching chat system with personalized context building, persistent conversation history, RTL bubble UI, and 6 Hebrew quick action buttons.

## Tasks Completed

### Task 1: Context Builder + Conversations API + Messages API

**Files created:**
- `mystiqor-build/src/services/coach/context-builder.ts` — `buildCoachingContext` fetches profile/analyses/goals/mood in parallel with `Promise.all`, builds compact Hebrew context string under 2000 tokens
- `mystiqor-build/src/app/api/coach/conversations/route.ts` — GET lists user's conversations (limit 20), POST creates conversation with personalized context
- `mystiqor-build/src/app/api/coach/messages/route.ts` — GET fetches messages by conversation_id with UUID validation and ownership check, POST sends message to LLM in free-form text mode, persists both user and assistant messages, updates conversation metadata

**Commit:** c49a9c1

### Task 2: Chat UI Components + Coach Page

**Files created:**
- `mystiqor-build/src/components/features/coach/ChatMessage.tsx` — RTL chat bubbles with `flex-row-reverse` for user messages, `ReactMarkdown` with `remarkGfm` for assistant replies, RTL prose classes
- `mystiqor-build/src/components/features/coach/ChatInput.tsx` — Auto-resize textarea, Enter-to-send, Shift+Enter for newline, RTL `start-3` button position
- `mystiqor-build/src/components/features/coach/QuickActions.tsx` — 6 Hebrew quick action buttons in 2x3 grid
- `mystiqor-build/src/app/(auth)/coach/page.tsx` — Full coach page with conversation list sidebar, RTL chat area, optimistic updates, auto-scroll, SubscriptionGuard wrapping

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] react-markdown v10 className prop removed**
- **Found during:** Task 2
- **Issue:** `react-markdown` v10 no longer accepts `className` as a direct prop — TypeScript error TS2322
- **Fix:** Wrapped `<ReactMarkdown>` in a `<div className="...">` container instead
- **Files modified:** `src/components/features/coach/ChatMessage.tsx`
- **Commit:** included in Task 2 commit

**2. [Rule 1 - Bug] SupabaseClient type mismatch for conversations/coaching_messages**
- **Found during:** Task 1
- **Issue:** `conversations` and `coaching_messages` tables exist in `database.generated.ts` but NOT in `database.ts`. `createClient()` returns `SupabaseClient<Database>` from `database.ts`. Type cast to generated Database type fails with "neither type sufficiently overlaps".
- **Fix:** Used `(supabase as any).from('conversations')` with explicit interface types for query results. `buildCoachingContext` takes `SupabaseClient<any>` parameter.
- **Files modified:** `context-builder.ts`, `conversations/route.ts`, `messages/route.ts`
- **Commit:** included in Task 1 commit

## Verification Results

- `tsc --noEmit` exits 0 — zero TypeScript errors
- `grep responseSchema|zodSchema src/app/api/coach/messages/route.ts` — no matches (free-form text mode confirmed)
- `grep SubscriptionGuard src/app/(auth)/coach/page.tsx` — matches (page gated)
- `grep flex-row-reverse src/components/features/coach/ChatMessage.tsx` — matches (RTL user messages)
- `grep buildCoachingContext src/services/coach/context-builder.ts` — matches

## Known Stubs

None — all data flows are wired:
- Context builder fetches real Supabase data
- Messages route calls real `invokeLLM`
- Coach page fetches real conversations and messages from API

## Self-Check: PASSED

Files exist:
- FOUND: `mystiqor-build/src/services/coach/context-builder.ts`
- FOUND: `mystiqor-build/src/app/api/coach/conversations/route.ts`
- FOUND: `mystiqor-build/src/app/api/coach/messages/route.ts`
- FOUND: `mystiqor-build/src/components/features/coach/ChatMessage.tsx`
- FOUND: `mystiqor-build/src/components/features/coach/ChatInput.tsx`
- FOUND: `mystiqor-build/src/components/features/coach/QuickActions.tsx`
- FOUND: `mystiqor-build/src/app/(auth)/coach/page.tsx`

Commits exist:
- FOUND: c49a9c1 — feat(07-01): context builder + conversations API + messages API
- Task 2 commit pending (git permissions)
