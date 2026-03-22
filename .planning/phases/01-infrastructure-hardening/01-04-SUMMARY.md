---
phase: 01-infrastructure-hardening
plan: 04
subsystem: geocoding
tags: [geocoding, timezone, cache, nominatim, tz-lookup, timeout]
dependency_graph:
  requires: []
  provides: [geocode-service-timezone, geocode-cache, geocode-timeout]
  affects: [astrology-birth-chart, birth-place-input]
tech_stack:
  added: ["@photostructure/tz-lookup@11.5.0"]
  patterns: [AbortController-timeout, in-memory-map-cache, TTL-cache, lazy-cache-pruning]
key_files:
  created: []
  modified:
    - mystiqor-build/src/services/geocode.ts
    - mystiqor-build/src/app/api/geocode/route.ts
    - mystiqor-build/package.json
    - mystiqor-build/package-lock.json
decisions:
  - "@photostructure/tz-lookup for timezone from coordinates — lightweight, no API key needed, IANA compliant"
  - "Default timezone Asia/Jerusalem on tz-lookup failure (ocean coordinates) — safe fallback for Israeli users"
  - "1-hour TTL for geocode cache — balances freshness with Nominatim rate limit compliance"
  - "Lazy cache pruning at >100 entries — avoids per-request overhead while preventing unbounded growth"
  - "504 Gateway Timeout status for Nominatim hangs — semantically correct for upstream timeout"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-22"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 01 Plan 04: Geocoding Service — Timezone, Cache, and Timeout Summary

**One-liner:** Added IANA timezone resolution via tz-lookup, 1-hour in-memory cache with lazy TTL pruning, and 5-second AbortController timeout to the Nominatim geocoding service.

## What Was Built

### Task 1: Enhanced Geocode Service (geocode.ts)

Rewrote `mystiqor-build/src/services/geocode.ts` preserving the existing function signature while adding three production-critical features:

**Timezone resolution:** Every geocoding result now includes `timezone_name` (IANA format, e.g. `'Asia/Jerusalem'`). This is resolved from coordinates using `@photostructure/tz-lookup` — a pure-JS library with no API key. If tz-lookup fails (e.g. open ocean coordinates), it defaults to `'Asia/Jerusalem'` and logs a warning.

**In-memory cache:** Results are stored in a `Map<string, CacheEntry>` with 1-hour TTL. Cache keys are normalized (lowercase, collapsed whitespace). Lazy pruning runs when the map exceeds 100 entries, preventing memory growth without per-request overhead.

**Request timeout:** A 5-second `AbortController` timeout aborts hanging Nominatim requests. The `AbortError` is caught and re-thrown as a Hebrew error message: `'שגיאת גיאוקודינג: הבקשה חרגה מזמן המתנה (5 שניות)'`.

### Task 2: API Route Hardening (route.ts)

Updated `mystiqor-build/src/app/api/geocode/route.ts` with:
- `.trim()` on query before length check (prevents whitespace-only queries passing the 2-char minimum)
- Specific timeout detection via Hebrew message content (`זמן המתנה`)
- `504 Gateway Timeout` status for Nominatim timeouts (semantically correct)
- `500` for all other geocoding errors
- Hebrew user-facing error messages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @photostructure/tz-lookup not installed**
- **Found during:** Task 1
- **Issue:** The plan required `import tzlookup from '@photostructure/tz-lookup'` but the package was not in package.json
- **Fix:** Installed via `npm install @photostructure/tz-lookup --legacy-peer-deps` (legacy-peer-deps needed due to pre-existing openai/zod peer conflict unrelated to this plan)
- **Files modified:** package.json, package-lock.json
- **Commit:** f5792e3 (by parallel agent 01-01 which pre-installed the package)

### Notes on Parallel Execution

This plan ran as a parallel executor. The 01-01 parallel agent pre-committed the enhanced `geocode.ts` and installed `@photostructure/tz-lookup` as part of schema fixes (its commit f5792e3). When this agent executed Task 1, the file was already in the correct state matching the plan exactly. The route.ts (Task 2) was committed separately by this agent as 5038f7c.

## File Score — geocode.ts

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Strict mode, zero any, all interfaces typed |
| Error Handling | 9/10 | AbortError caught, tz-lookup failure caught, HTTP error handled |
| Validation | 8/10 | Input trimmed, empty check, tz fallback |
| Documentation | 9/10 | JSDoc in Hebrew on all exports and constants |
| Clean Code | 9/10 | Single responsibility, clear constants, lazy pruning |
| Security | 8/10 | Server-side only, no secrets |
| Performance | 9/10 | Cache with TTL, lazy pruning, 5s timeout prevents hangs |
| Accessibility | N/A | Service layer, no UI |
| RTL | N/A | Service layer, no UI |
| Edge Cases | 9/10 | Ocean coords, empty input, HTTP errors, timeout |
| **TOTAL** | **71/80 (89%)** | Recalculated excluding N/A criteria |

## File Score — route.ts

| Criterion | Score | Notes |
|-----------|-------|-------|
| TypeScript | 10/10 | Fully typed, NextRequest/NextResponse |
| Error Handling | 9/10 | Timeout vs generic errors distinguished, correct HTTP codes |
| Validation | 9/10 | Trimmed length check, min 2 chars |
| Documentation | 8/10 | JSDoc header with route and return info |
| Clean Code | 9/10 | Minimal, delegates to service |
| Security | 8/10 | Input validation, server-side only |
| Performance | 9/10 | No blocking, delegates to cached service |
| Accessibility | N/A | API route, no UI |
| RTL | N/A | API route, no UI |
| Edge Cases | 9/10 | Empty query, timeout, generic errors |
| **TOTAL** | **71/80 (89%)** | Recalculated excluding N/A criteria |

Both files score above the 78% threshold.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 (geocode.ts) | f5792e3 | feat(01-01): create 003_schema_fixes.sql migration + npm deps (pre-committed by parallel agent 01-01) |
| Task 2 (route.ts) | 5038f7c | feat(01-04): update geocode API route with timeout error handling |

## Self-Check: PASSED

- geocode.ts: FOUND at mystiqor-build/src/services/geocode.ts
- route.ts: FOUND at mystiqor-build/src/app/api/geocode/route.ts
- SUMMARY.md: FOUND at .planning/phases/01-infrastructure-hardening/01-04-SUMMARY.md
- Commit f5792e3: FOUND (geocode.ts Task 1 — pre-committed by parallel agent 01-01)
- Commit 5038f7c: FOUND (route.ts Task 2 — committed by this agent)
