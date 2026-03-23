---
phase: 06-tools-tier-3-advanced-astrology
plan: "04"
subsystem: api
tags: [llm, invokeLLM, supabase, file-upload, zod, react-hook-form, subscription-guard]

requires:
  - phase: 04-tools-tier-1
    provides: invokeLLM service, SubscriptionGuard component, analyses table pattern
  - phase: 05-tools-tier-2-image-upload-tools
    provides: file upload via /api/upload, FormData pattern, drawing/graphology route patterns

provides:
  - Career guidance API route (POST /api/tools/career) with natal chart context enrichment
  - Career guidance UI page with match scores, challenges+solutions, action steps
  - Relationship analysis API route (POST /api/tools/relationships) with compatibility scoring
  - Relationship analysis UI page with dual-person form, strengths/challenges/recommendations
  - Document analyzer API route (POST /api/tools/document) with Supabase Storage upload + LLM Vision
  - Document analyzer UI page with drag-drop upload, category-badged insights, action checklist

affects:
  - 06-tools-tier-3-advanced-astrology (sibling plans 01-03 use same LLM pattern)
  - Future AI Coach synthesis (can consume career/relationship/document analyses)

tech-stack:
  added: []
  patterns:
    - LLM-only tool route: InputSchema -> auth -> invokeLLM -> save analyses -> return
    - Career route fetches optional natal chart context from last astrology analysis (graceful omit)
    - Document route uses FormData (not JSON) + Supabase Storage upload + imageUrls to LLM Vision
    - DocumentResults extracted as subcomponent to keep page.tsx under 300 lines

key-files:
  created:
    - mystiqor-build/src/app/api/tools/career/route.ts
    - mystiqor-build/src/app/(auth)/tools/career/page.tsx
    - mystiqor-build/src/app/api/tools/relationships/route.ts
    - mystiqor-build/src/app/(auth)/tools/relationships/page.tsx
    - mystiqor-build/src/app/api/tools/document/route.ts
    - mystiqor-build/src/app/(auth)/tools/document/page.tsx
  modified: []

key-decisions:
  - "Career route queries profiles.birth_date via .eq('id', user.id) — profile PK is id, not user_id"
  - "Natal chart context is optional: career route catches errors and omits context gracefully when no astrology analysis exists"
  - "tool_type='relationship' for relationships route — ToolType union has 'relationship' not 'relationships'"
  - "Document route accepts FormData (multipart) not JSON — matches /api/upload infrastructure pattern"
  - "DocumentResults extracted to subcomponent to keep document/page.tsx under 300-line limit"
  - "Document page uses URL.createObjectURL for image preview — revokes on file removal to prevent memory leaks"

patterns-established:
  - "Pattern: LLM-only tool route — InputSchema.safeParse -> auth check -> invokeLLM<T> -> validationResult check -> TablesInsert -> return {data: {...result, analysis_id}}"
  - "Pattern: Optional context enrichment — try/catch around optional DB fetch, omit context on any error"
  - "Pattern: FormData route — formData.get('file') instanceof File check, ALLOWED_TYPES + MAX_FILE_SIZE validation, Supabase Storage upload, getPublicUrl, imageUrls to LLM"

requirements-completed: [TOOL-08, TOOL-09, TOOL-10]

duration: 15min
completed: 2026-03-23
---

# Phase 6 Plan 04: Three LLM-Only Tools Summary

**Career guidance (TOOL-08), relationship analysis (TOOL-09), and document analyzer (TOOL-10) — all three LLM-only tools with SubscriptionGuard, structured Zod schemas, and analyses table persistence**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-23T16:51:00Z
- **Completed:** 2026-03-23T17:06:17Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Career guidance route enriches prompts with natal chart context (sun/moon/ascendant) from user's most recent astrology analysis, gracefully omitting context when no prior analysis exists
- Relationship analysis route accepts two people with birth dates and relationship type (romantic/friendship/business/family), returning compatibility_score plus communication_style and emotional_dynamics
- Document analyzer route accepts multipart/form-data file upload (image or PDF, max 5MB), uploads to Supabase Storage, sends public URL to LLM Vision for structured insight extraction
- All three pages wrap forms in SubscriptionGuard — critical fix noted in Pitfall 10 (RelationshipAnalysis.jsx missing guard in BASE44 source)
- TypeScript compilation clean across all six new files

## Task Commits

Each task was committed atomically:

1. **Task 1: Career guidance + Relationship analysis (API routes + pages)** - `4a7b904` (feat)
2. **Task 2: Document analyzer (API route + page)** - `243d87b` (feat)

**Plan metadata:** (this commit — docs)

## Files Created/Modified

- `mystiqor-build/src/app/api/tools/career/route.ts` — Career guidance LLM route with natal chart context enrichment, CareerResponseSchema (recommended_fields with match_score progress, skills_to_develop, challenges+solutions, action_steps)
- `mystiqor-build/src/app/(auth)/tools/career/page.tsx` — Career page with SubscriptionGuard, match score progress bars, challenges/solutions paired cards, action steps numbered list
- `mystiqor-build/src/app/api/tools/relationships/route.ts` — Relationship analysis LLM route, RelationshipResponseSchema (compatibility_score, communication_style, emotional_dynamics, strengths, challenges, recommendations)
- `mystiqor-build/src/app/(auth)/tools/relationships/page.tsx` — Relationships page with SubscriptionGuard, compatibility percentage, dual strengths/challenges cards, recommendations list
- `mystiqor-build/src/app/api/tools/document/route.ts` — Document analyzer route with FormData file upload, Supabase Storage, imageUrls to GPT-4o Vision, DocumentResponseSchema (document_type, key_points, insights with category enum, action_items)
- `mystiqor-build/src/app/(auth)/tools/document/page.tsx` — Document page with SubscriptionGuard, drag-drop upload, image preview, optional context, DocumentResults subcomponent with category-badged insight cards

## Decisions Made

- Career route queries `profiles` table via `.eq('id', user.id)` — profile PK is `id`, not `user_id`. Fixed during Task 1 after TypeScript error revealed the mismatch with `first_name` column (does not exist in schema).
- Natal chart context fetch wrapped in try/catch — career guidance continues without chart context if user has no prior astrology analysis. This matches the plan requirement: "gracefully omit when absent, do NOT fail."
- `tool_type: 'relationship'` used (not 'relationships') — the ToolType union in `src/types/analysis.ts` has the singular form.
- Document route uses `formData.get('file')` pattern matching the existing `/api/upload` infrastructure. Not using presign flow since document is a server-to-storage upload via the route itself.
- `DocumentResults` extracted to a subcomponent within `page.tsx` to keep the file under the 300-line limit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed profiles query — wrong column name**
- **Found during:** Task 1 (Career guidance route)
- **Issue:** Career route selected `first_name` from profiles, but the profiles table has `full_name`. TypeScript error revealed the mismatch.
- **Fix:** Changed select to `birth_date` only (sufficient for the prompt — full_name not needed).
- **Files modified:** `mystiqor-build/src/app/api/tools/career/route.ts`
- **Verification:** `npx tsc --noEmit` clean, no more TS2339 errors
- **Committed in:** `4a7b904` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Minor fix. Wrong column name in Supabase select query caught by TypeScript. No scope change.

## Issues Encountered

None beyond the profiles column mismatch (documented above as deviation).

## Known Stubs

None — all three tools wire to real invokeLLM calls and save to the analyses table. No mock data or placeholder values in any rendered output.

## User Setup Required

None - no external service configuration required. All tools use the existing invokeLLM infrastructure and Supabase Storage.

## Next Phase Readiness

- TOOL-08 (Career), TOOL-09 (Relationship), TOOL-10 (Document) complete
- Plans 06-01 to 06-03 handle ephemeris-dependent tools (transits, solar return, synastry, timing)
- All six Phase 6 tool pages will have consistent SubscriptionGuard coverage

---
## Self-Check: PASSED

- FOUND: mystiqor-build/src/app/api/tools/career/route.ts
- FOUND: mystiqor-build/src/app/(auth)/tools/career/page.tsx
- FOUND: mystiqor-build/src/app/api/tools/relationships/route.ts
- FOUND: mystiqor-build/src/app/(auth)/tools/relationships/page.tsx
- FOUND: mystiqor-build/src/app/api/tools/document/route.ts
- FOUND: mystiqor-build/src/app/(auth)/tools/document/page.tsx
- FOUND: .planning/phases/06-tools-tier-3-advanced-astrology/06-04-SUMMARY.md
- FOUND commit 4a7b904: feat(06-04): career guidance + relationship analysis routes and pages
- FOUND commit 243d87b: feat(06-04): document analyzer route and page
- TypeScript: CLEAN (npx tsc --noEmit exits 0)

*Phase: 06-tools-tier-3-advanced-astrology*
*Completed: 2026-03-23*
