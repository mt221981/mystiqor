---
phase: 31-backend-stability
plan: "02"
subsystem: api/tools
tags: [quota-guard, db-insert, error-handling, stab-01, stab-05, security]
dependency_graph:
  requires: []
  provides: [usage-quota-guard, analyses-insert-error-reporting]
  affects: [all-24-tool-routes, src/lib/utils/usage-guard.ts]
tech_stack:
  added: []
  patterns: [discriminated-union-guard, insertError-destructuring]
key_files:
  created:
    - mystiqor-build/src/lib/utils/usage-guard.ts
  modified:
    - mystiqor-build/src/app/api/tools/tarot/route.ts
    - mystiqor-build/src/app/api/tools/palmistry/route.ts
    - mystiqor-build/src/app/api/tools/dream/route.ts
    - mystiqor-build/src/app/api/tools/numerology/route.ts
    - mystiqor-build/src/app/api/tools/numerology/compatibility/route.ts
    - mystiqor-build/src/app/api/tools/drawing/route.ts
    - mystiqor-build/src/app/api/tools/graphology/route.ts
    - mystiqor-build/src/app/api/tools/synthesis/route.ts
    - mystiqor-build/src/app/api/tools/career/route.ts
    - mystiqor-build/src/app/api/tools/document/route.ts
    - mystiqor-build/src/app/api/tools/relationships/route.ts
    - mystiqor-build/src/app/api/tools/compatibility/route.ts
    - mystiqor-build/src/app/api/tools/personality/route.ts
    - mystiqor-build/src/app/api/tools/timing/route.ts
    - mystiqor-build/src/app/api/tools/human-design/route.ts
    - mystiqor-build/src/app/api/tools/daily-insights/route.ts
    - mystiqor-build/src/app/api/tools/astrology/birth-chart/route.ts
    - mystiqor-build/src/app/api/tools/astrology/calendar/route.ts
    - mystiqor-build/src/app/api/tools/astrology/forecast/route.ts
    - mystiqor-build/src/app/api/tools/astrology/interpret/route.ts
    - mystiqor-build/src/app/api/tools/astrology/readings/route.ts
    - mystiqor-build/src/app/api/tools/astrology/solar-return/route.ts
    - mystiqor-build/src/app/api/tools/astrology/synastry/route.ts
    - mystiqor-build/src/app/api/tools/astrology/transits/route.ts
decisions:
  - "Used discriminated union UsageGuardResult (not throw) so guard errors preserve their specific HTTP status codes (402/403/429)"
  - "Read subscriptions table directly in guard helper (no server-to-server HTTP to /api/subscription/usage)"
  - "analyses_limit === -1 sentinel for unlimited plans — mirrors DB convention confirmed in research"
  - "dream backgroundWork: added full analyses insert with error check; on failure sets ai_interpretation to Hebrew fallback"
  - "human-design: changed silent-return-on-error to proper 500 — aligns with STAB-05 (no silent failures)"
metrics:
  duration: "11 minutes"
  completed_date: "2026-04-07"
  tasks_completed: 3
  files_modified: 25
---

# Phase 31 Plan 02: Usage Quota Guard + DB Insert Error Handling Summary

## One-liner

Server-side quota enforcement via `checkUsageQuota()` discriminated union helper wired into all 24 tool routes, plus `insertError` surfacing on all 22 analyses inserts with Hebrew 500 responses.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Create usage-guard.ts helper | Done | 46396d1 |
| 2 | Wire usage guard into all 24 tool routes | Done | b6516ce |
| 3 | Fix silent DB insert errors in all routes | Done | 78a2e9e |

## What Was Built

### Task 1: usage-guard.ts (STAB-01)

New file `src/lib/utils/usage-guard.ts` exports:
- `UsageGuardResult` — discriminated union `{ allowed: true } | { allowed: false; response }`
- `checkUsageQuota(supabase, userId)` — reads `subscriptions` table, checks status + quota

Guard logic:
- Missing subscription row → 403 "לא נמצא מנוי"
- Status not in `['active', 'trial']` → 402 "המנוי שלך אינו פעיל"
- `analyses_used >= analyses_limit` (and `analyses_limit !== -1`) → 429 with quota count
- All other cases → `{ allowed: true }`

### Task 2: Usage Guard in 24 Routes (STAB-01)

Pattern applied to all 24 routes immediately after `if (!user)` check:
```typescript
// בדיקת מכסת שימוש — STAB-01
const guard = await checkUsageQuota(supabase, user.id)
if (!guard.allowed) return guard.response
```

Special handling: `dream/route.ts` guard runs in main handler before `backgroundWork` (not inside the async closure).

Routes covered: tarot, palmistry, dream, numerology, numerology/compatibility, drawing, graphology, synthesis, career, document, relationships, compatibility, personality, timing, human-design, daily-insights, astrology/birth-chart, astrology/calendar, astrology/forecast, astrology/interpret, astrology/readings, astrology/solar-return, astrology/synastry, astrology/transits.

### Task 3: DB Insert Error Reporting (STAB-05)

Pattern applied to all 20 routes that insert into `analyses`:
```typescript
const { data: analysis, error: insertError } = await supabase
  .from('analyses').insert(row).select('id').single()
if (insertError) {
  console.error('[tool-name] שגיאת שמירת ניתוח:', insertError)
  return NextResponse.json({ error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' }, { status: 500 })
}
```

Special handling for `dream/route.ts` backgroundWork:
- Added full `analyses` insert with `insertError` check
- On insert failure: sets `ai_interpretation` to Hebrew fallback string so polling UI can report the error

`human-design/route.ts` deviation: was silently returning `{ data: hdData }` on save error — changed to proper 500 response per STAB-05.

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| checkUsageQuota in 24 routes | `grep -rl "checkUsageQuota" src/app/api/tools/ \| wc -l` | 24 |
| insertError checks | `grep -rn "error: insertError" src/app/api/tools/ --include="route.ts" \| wc -l` | 22 |
| usage-guard.ts exists | `ls src/lib/utils/usage-guard.ts` | Found |
| TypeScript build | `npx tsc --noEmit` | Clean (0 errors) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] human-design already had saveError check but returned data on failure**
- **Found during:** Task 3
- **Issue:** `human-design/route.ts` had `if (saveError) { return NextResponse.json({ data: hdData }) }` — silently returning 200 with data when insert fails, contrary to STAB-05
- **Fix:** Changed to proper 500 error response with Hebrew message matching the standard pattern
- **Files modified:** `src/app/api/tools/human-design/route.ts`
- **Commit:** 78a2e9e

**2. [Rule 2 - Missing functionality] dream backgroundWork had no analyses insert at all**
- **Found during:** Task 3
- **Issue:** The dream route's backgroundWork only updated the `dreams` table. It never inserted into `analyses`, so dream analyses were never tracked in the analyses history
- **Fix:** Added full analyses insert inside backgroundWork with proper insertError check and Hebrew fallback on failure
- **Files modified:** `src/app/api/tools/dream/route.ts`
- **Commit:** 78a2e9e

## Known Stubs

None. All routes wire real data and return real analysis_id values.

## Threat Flags

No new threat surface introduced. This plan closes existing gaps:
- T-31-04: Elevation of Privilege (over-quota bypass) — mitigated by checkUsageQuota on all 24 routes
- T-31-05: Elevation of Privilege (inactive subscription) — mitigated by status check in guard
- T-31-06: Spoofing (missing subscription row) — mitigated by 403 on missing row
- T-31-07: Tampering (silent DB insert failure) — mitigated by insertError check on all 22 routes

## Self-Check: PASSED

- [x] `src/lib/utils/usage-guard.ts` exists
- [x] 24 routes contain `checkUsageQuota`
- [x] 22 routes contain `error: insertError` destructuring
- [x] Commits 46396d1, b6516ce, 78a2e9e all exist
- [x] TypeScript build clean
