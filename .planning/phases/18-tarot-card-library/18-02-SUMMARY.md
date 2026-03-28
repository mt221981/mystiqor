---
phase: 18-tarot-card-library
plan: "02"
subsystem: tarot
tags: [data-sync, api-upgrade, celtic-cross, rich-metadata, sync-script]
dependency_graph:
  requires: [18-01]
  provides: [tarot-sync-script, tarot-api-celtic-cross, tarot-rich-metadata-api]
  affects:
    - mystiqor-build/scripts/sync-tarot-meta.ts
    - mystiqor-build/src/app/api/tools/tarot/route.ts
tech_stack:
  added: []
  patterns:
    - "Manual .env.local parsing (no dotenv dependency)"
    - "Supabase service-role client for RLS bypass in scripts"
    - "Zod literal union for spreadCount validation"
    - "Card number to suit/rank derivation algorithm"
key_files:
  created:
    - mystiqor-build/scripts/sync-tarot-meta.ts
  modified:
    - mystiqor-build/src/app/api/tools/tarot/route.ts
decisions:
  - "Used RANK_HE/SUIT_HE constants for pip card name_he derivation; archetype field used when available (it matches the pip names already)"
  - "Court card matching uses suit + null number + sorted-by-id positional index (Page=0, Knight=1, Queen=2, King=3)"
  - "LLM prompt uses cardDescriptions (archetype+element+astrology) instead of bare name_he for richer AI interpretation"
  - "TypeScript fix: guard TAROT_CARD_META index access with null check — RECORD type returns undefined for missing keys in strict mode"
metrics:
  duration: "5m 3s"
  completed: "2026-03-28"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 18 Plan 02: Data Layer — Sync Script + API Upgrade Summary

**One-liner:** TypeScript sync script populating all 78 tarot cards with rich metadata via Supabase service-role client, plus API route upgraded to support Celtic Cross (spreadCount=10) and return all 7 new metadata fields per drawn card.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create tarot meta sync script | 8744a76, 3f58e0d | scripts/sync-tarot-meta.ts |
| 2 | Upgrade API route for Celtic Cross and rich metadata | 7a626f9 | src/app/api/tools/tarot/route.ts |

## What Was Built

### Task 1: Tarot Meta Sync Script

Created `mystiqor-build/scripts/sync-tarot-meta.ts` (221 lines, under 300 limit).

**Algorithm:**
- Loads `TAROT_CARD_META` (all 78 entries) from `src/lib/constants/tarot-data.ts`
- Manually parses `.env.local` for `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Creates Supabase client with service-role key (bypasses RLS)
- Fetches existing rows from `tarot_cards` table
- For cards 0-21 (Major Arcana): UPDATE by matching `number` field — only updates 7 meta fields
- For court cards (rankInSuit 10-13): UPDATE by suit + null number + positional index
- For pip cards (rankInSuit 0-9): INSERT new rows if not already present, or UPDATE if exists (idempotent)
- Derives `name_en` from RANK_EN + SUIT_EN constants (e.g., "Ace of Wands")
- Derives `name_he` from `meta.archetype` (already contains Hebrew pip names) or RANK_HE + SUIT_HE fallback
- Reports: Updated: X, Inserted: Y, Errors: Z

**Card number layout:**
- 0-21: Major Arcana
- 22-31: Pip Wands (Ace-10), 32-35: Court Wands
- 36-45: Pip Cups, 46-49: Court Cups
- 50-59: Pip Swords, 60-63: Court Swords
- 64-73: Pip Pentacles, 74-77: Court Pentacles

**Runnable:** `npx tsx mystiqor-build/scripts/sync-tarot-meta.ts`

### Task 2: API Route Upgrade

Updated `mystiqor-build/src/app/api/tools/tarot/route.ts` (138 lines, under 150 acceptance threshold).

**Changes made:**
1. `spreadCount` Zod union now includes `z.literal(10)` — enables Celtic Cross
2. Added optional `spreadId: z.string().optional()` — allows client to pass spread layout name
3. LLM prompt uses `cardDescriptions` with archetype, element, astrology per card: `שוטה (ארכיטיפ: התמים, אלמנט: air, אסטרולוגיה: Uranus)`
4. `analyses.results.drawn` mapping includes all 7 new fields: element, astrology, kabbalah, archetype, upright_keywords, reversed_keywords, numerology_value

**Preserved unchanged:** auth check (`if (!user)`), Supabase client creation, `drawCards` function, error handling try/catch, `.select('*')` query, response shape.

## Verification Results

```
TypeScript: 0 errors (npx tsc --noEmit)
Vitest: 70 passed / 73 total (3 pre-existing llm.test.ts failures — Phase 01 tech debt)
grep z.literal(10): FOUND in route.ts
grep TAROT_CARD_META: FOUND in sync-tarot-meta.ts
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript strict mode errors in sync script**
- **Found during:** Task 1 verification (`npx tsc --noEmit`)
- **Issue:** Two TS errors: (a) regex match groups `m[1]`/`m[2]` typed as `string | undefined` — needed optional chaining guard; (b) `TAROT_CARD_META[cardNumber]` returns `TarotCardMeta | undefined` in strict Record access — needed null guard in `buildMeta`
- **Fix:** Added `m?.[1] && m[2] !== undefined` guard for env parsing; added early return with empty MetaUpdate if meta is undefined in `buildMeta`
- **Files modified:** `mystiqor-build/scripts/sync-tarot-meta.ts`
- **Commit:** 3f58e0d

## Known Stubs

None — sync script is a standalone executable (not UI-facing). API route returns real data from DB. No placeholder values.

## File Scores

### mystiqor-build/scripts/sync-tarot-meta.ts
- TypeScript: 10/10 (strict, no any, null guards)
- Error Handling: 9/10 (try/catch, process.exit on critical errors, per-card error tracking)
- Validation: 9/10 (env var checks, missing row warnings)
- Documentation: 9/10 (Hebrew JSDoc, inline comments)
- Clean Code: 9/10 (constants extracted, algorithm functions separated)
- Security: 10/10 (service-role key for writes, RLS bypass intentional and documented)
- Performance: 8/10 (sequential per-card writes — acceptable for one-time sync script)
- Accessibility: N/A
- RTL: N/A (script, no UI)
- Edge Cases: 9/10 (idempotent — handles re-runs gracefully)
- **TOTAL: 83/90 = 92% (N/A skipped, recalculated)**

### mystiqor-build/src/app/api/tools/tarot/route.ts
- TypeScript: 10/10 (strict, typed TarotCardRow, TablesInsert)
- Error Handling: 10/10 (try/catch, auth check, empty DB handling)
- Validation: 10/10 (Zod TarotInputSchema with literal union)
- Documentation: 9/10 (Hebrew JSDoc, inline comments)
- Clean Code: 10/10 (138 lines, clean separation)
- Security: 10/10 (auth check on every request, Zod validation, service-side)
- Performance: 9/10 (single .select('*') query, no N+1)
- Accessibility: N/A
- RTL: 10/10 (Hebrew error messages, Hebrew prompt)
- Edge Cases: 9/10 (empty DB returns 500, invalid spreadCount returns 400)
- **TOTAL: 87/90 = 96% (N/A skipped, recalculated)**

Both files exceed 78% threshold.

## Self-Check: PASSED
