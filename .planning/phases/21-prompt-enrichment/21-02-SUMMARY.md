---
phase: 21-prompt-enrichment
plan: 02
subsystem: api
tags: [llm, prompt-enrichment, personal-context, kabbalistic, systemPrompt, tarot, astrology, coach, dream]

# Dependency graph
requires:
  - phase: 21-prompt-enrichment plan 01
    provides: getPersonalContext helper (firstName, zodiacSign, lifePathNumber)
provides:
  - Enriched tarot route with Kabbalistic systemPrompt + personal address
  - New systemPrompt for coach/journeys (was missing) with personal context
  - Enriched dream route with Kabbalistic-mystical systemPrompt (עולם היצירה)
  - New systemPrompt for solar-return (was missing) with personal context
  - New systemPrompt for transits (was missing) with personal context
affects: [22-synthesis, future-prompt-enrichment, all-routes-using-personal-context]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getPersonalContext fetched after auth check, before any background work (Pitfall 3)"
    - "Conditional personal address: ctx.firstName ? `...${ctx.firstName}...` : ''"
    - "Short identity-focused systemPrompt for JSON-mode routes (Pitfall 2)"
    - "Kabbalistic language: ספירות, נתיבות עץ החיים, אותיות עבריות, עולם היצירה"

key-files:
  created: []
  modified:
    - mystiqor-build/src/app/api/tools/tarot/route.ts
    - mystiqor-build/src/app/api/coach/journeys/route.ts
    - mystiqor-build/src/app/api/tools/dream/route.ts
    - mystiqor-build/src/app/api/tools/astrology/solar-return/route.ts
    - mystiqor-build/src/app/api/tools/astrology/transits/route.ts

key-decisions:
  - "coach/journeys systemPrompt kept short and identity-focused to avoid disrupting JSON-mode (responseSchema + zodSchema)"
  - "dream route fetches getPersonalContext in main handler (not inside backgroundWork) — closes over ctx in async closure"
  - "solar-return and transits systemPrompts use template literal for conditional personal line (inline, no ternary variable)"

patterns-established:
  - "Pattern: getPersonalContext after auth check, before background/async work"
  - "Pattern: personalLine = ctx.firstName ? `...` : '' for safe conditional address"
  - "Pattern: JSON-mode routes get short identity systemPrompt only — no style instructions"

requirements-completed: [PROMPT-01]

# Metrics
duration: 12min
completed: 2026-03-29
---

# Phase 21 Plan 02: Prompt Enrichment — DEEP Routes Summary

**5 high-impact LLM routes now address users personally with Kabbalistic-spiritual language: 3 routes gained new systemPrompts (were missing), 2 routes got enriched versions**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-29
- **Completed:** 2026-03-29
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- All 5 DEEP-tier routes now import and call `getPersonalContext` — user is addressed by name, zodiac, life path
- 3 routes that had NO systemPrompt (coach/journeys, solar-return, transits) now have one
- 2 routes with existing systemPrompt (tarot, dream) enriched with Kabbalistic references (ספירות, עולם היצירה)
- TypeScript build passes with zero errors across all 5 routes
- Pitfall 2 (JSON-mode disruption) and Pitfall 3 (background-work scope) handled correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Enrich tarot + coach/journeys + dream routes** - `83ea9c5` (feat)
2. **Task 2: Enrich solar-return + transits routes** - `58fe043` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `mystiqor-build/src/app/api/tools/tarot/route.ts` — Added getPersonalContext import + enriched systemPrompt with ספירות, נתיבות עץ החיים, personal address
- `mystiqor-build/src/app/api/coach/journeys/route.ts` — Added getPersonalContext import + NEW systemPrompt (journeySystemPrompt) + personal context prepended to userContext
- `mystiqor-build/src/app/api/tools/dream/route.ts` — Added getPersonalContext import (pre-background-work) + enriched systemPrompt with עולם היצירה
- `mystiqor-build/src/app/api/tools/astrology/solar-return/route.ts` — Added getPersonalContext import + NEW solarReturnSystemPrompt with חזרת השמש Kabbalistic context
- `mystiqor-build/src/app/api/tools/astrology/transits/route.ts` — Added getPersonalContext import + NEW transitsSystemPrompt with טרנזיט + ספירות הנשמה

## Decisions Made

- coach/journeys systemPrompt kept intentionally short and identity-focused — the route uses `responseSchema` + `zodSchema` (JSON mode), and the LLM service appends `\n\nענה בפורמט JSON בלבד` to systemContent; a long poetic systemPrompt would conflict with JSON-only mode
- dream route: `getPersonalContext` called in POST handler (line 40), not inside `backgroundWork` closure — per Pitfall 3, the async closure runs after response is returned and cannot safely call Supabase with the same client; `ctx` is closed over safely
- solar-return and transits: used inline template literal for personal line (no separate `personalLine` variable) — more concise for two-line routes

## Deviations from Plan

None — plan executed exactly as written. All Pitfall guards (2, 3, 6) applied correctly.

## Issues Encountered

- mystiqor-build is a git submodule; files modified directly in the submodule's working directory at `/d/AI_projects/MystiQor/mystiqor-build/`, with the parent repo tracking the submodule pointer update.
- coach/journeys route is 348 lines (was 334 before our changes). The 300-line limit was already exceeded before this plan. Per CLAUDE.md "לא נוגעים בו" — no rewrite of working code. Deferred.

## Known Stubs

None — all systemPrompts are fully wired with real getPersonalContext data.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 5 DEEP-tier routes enriched — PROMPT-01 requirement fully satisfied across wave 2
- Pattern established for all remaining routes: getPersonalContext after auth, conditional personal address, Kabbalistic language
- Ready for Phase 21 plan 03 (remaining routes) if applicable

## Self-Check: PASSED

- All 5 modified route files: FOUND
- Task commit 83ea9c5: FOUND
- Task commit 58fe043: FOUND
- SUMMARY.md: FOUND

---
*Phase: 21-prompt-enrichment*
*Completed: 2026-03-29*
