---
phase: 01-core-infrastructure
plan: "03"
subsystem: services
tags: [geocoding, llm, astrology, solar-return, aspects, chart, testing]
dependency_graph:
  requires: [01-01]
  provides: [geocode-service, llm-wrapper, solar-return-service, aspects-service, chart-service]
  affects: [api-routes-wave7, all-tool-services-phase2]
tech_stack:
  added: []
  patterns: [openai-v4-sdk, vsop87-binary-search, placidus-houses, nominatim-geocoding]
key_files:
  created:
    - src/services/geocode.ts
    - src/services/analysis/llm.ts
    - src/services/astrology/solar-return.ts
    - src/services/astrology/aspects.ts
    - src/services/astrology/chart.ts
  modified:
    - tests/services/llm.test.ts
decisions:
  - "GEM 1 normalize function: ((deg % 360) + 360) % 360 — normalized once before loop, not inside comparison"
  - "LLM wrapper: gpt-4o for vision (imageUrls present), gpt-4o-mini for text — cost efficiency"
  - "llm.ts uses OpenAI client instantiated per-call (not module-level singleton) — allows env var injection in tests"
  - "aspects.ts: break after first matching aspect per pair — prevents duplicate aspects"
metrics:
  duration_minutes: 45
  completed_date: "2026-03-20"
  tasks_completed: 2
  files_created: 6
---

# Phase 01 Plan 03: Geocoding, LLM Wrapper, and Astrology Services Summary

**One-liner:** Geocoding proxy with Nominatim User-Agent, OpenAI v4 invokeLLM with sanitization, and GEM 1 VSOP87 binary search solar return migrated with ((deg%360)+360)%360 normalize fix.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build geocode.ts and llm.ts, replace llm.test.ts stub | N/A (no git repo) | src/services/geocode.ts, src/services/analysis/llm.ts, tests/services/llm.test.ts |
| 2 | Migrate GEM 1 solar-return.ts and GEM 14 aspects.ts, build chart.ts | N/A (no git repo) | src/services/astrology/solar-return.ts, src/services/astrology/aspects.ts, src/services/astrology/chart.ts |

## Files Created/Modified

### src/services/geocode.ts
- Exports: `geocodeCity(cityName: string): Promise<GeocodingResult[]>`, `GeocodingResult` interface
- Uses Nominatim with `User-Agent: MasaPnima/1.0 (contact@masapnima.co.il)` header
- Returns up to 5 results, parses lat/lon to floats, defaults country_code to 'il'
- Input trimming + empty string guard

### src/services/analysis/llm.ts
- Exports: `invokeLLM<T>(request: LLMRequest): Promise<LLMResponse<T>>`, `LLMRequest`, `LLMResponse`
- Calls `sanitizeForLLM(request.prompt)` and `sanitizeForLLM(request.systemPrompt)` before constructing messages
- Uses `forceToString(rawContent)` for non-schema responses
- Model selection: gpt-4o for imageUrls (vision), gpt-4o-mini for text
- Full try/catch with Hebrew error messages
- SERVER-SIDE ONLY — no 'use client' directive

### src/services/astrology/solar-return.ts
- Exports: `normalize`, `calculateJulianDate`, `calculateSunPosition`, `SolarReturnInput`, `findSolarReturn`
- `normalize` defined as `((deg % 360) + 360) % 360` — handles negative values correctly (critical for Aries/Pisces boundary)
- `natalLon` normalized ONCE before the binary search loop
- 100-iteration binary search, ±2-day window, converges at diff < 0.01°
- VSOP87 simplified: Mean Longitude + Equation of Center

### src/services/astrology/aspects.ts
- Exports: `ASPECT_DEFINITIONS`, `AspectResult`, `PlanetPositions`, `calculateAspects`, `getElementDistribution`, `getModalityDistribution`
- 5 aspect types: Conjunction(orb=8), Opposition(orb=8), Trine(orb=8), Square(orb=7), Sextile(orb=6)
- `strength = Math.round((1 - orbValue / def.orb) * 1000) / 1000` (3 decimal precision)
- Breaks after first matching aspect per pair
- noUncheckedIndexedAccess safe — guards on all array accesses

### src/services/astrology/chart.ts
- Exports: `HouseData`, `ChartData`, `getSign`, `calculateHouses`, `assembleChart`
- Imports `normalize`, `calculateJulianDate` from `./solar-return`
- Imports `calculateAspects`, `AspectResult`, `PlanetPositions` from `./aspects`
- Placidus Ascendant from GMST → LST → atan2
- 12 equal-spaced cusps from Ascendant
- `assembleChart` combines calculateHouses + calculateAspects

### tests/services/llm.test.ts (replaced stub)
- 3 real tests replacing the Plan 01 stub placeholder
- Mocks: openai, @/lib/utils/sanitize, @/lib/utils/llm-response
- Test 1: sanitizeForLLM called with XSS prompt
- Test 2: sanitizeForLLM called twice when systemPrompt provided
- Test 3: response has data, tokensUsed, model fields

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as specified.

### Notes on Execution Environment

**Project has no git repository initialized** (confirmed: `Is directory a git repo: No`). As a result:
- Per-task git commits were not possible
- Final metadata commit was not made

**Bash tool was intermittently unavailable** for running vitest/tsc verification commands. The following could not be verified programmatically:
- `npx vitest run tests/services/llm.test.ts --reporter=verbose`
- `npx vitest run tests/services/astrology.test.ts --reporter=verbose`
- `npx tsc --noEmit`

All code was manually reviewed for correctness (see manual review below).

**Manual correctness review confirms:**
- `calculateAspects({sun: {longitude: 10}, moon: {longitude: 12}})` → Conjunction (angle=2° ≤ orb=8) ✓
- `calculateAspects({sun: {longitude: 0}, moon: {longitude: 180}})` → Opposition (angle=180° diff=0° ≤ 8) ✓
- `calculateAspects({sun: {longitude: 0}, moon: {longitude: 0}})` → strength=1.000 (orbValue=0, 1-0/8=1) ✓
- `calculateAspects({sun: {longitude: 0}, moon: {longitude: 45}})` → [] (no match: 45≠0±8, 45≠180±8, 45≠120±8, 45≠90±7, 45≠60±6) ✓
- `sanitizeForLLM` called in invokeLLM before OpenAI creation ✓
- `User-Agent: MasaPnima/1.0` in geocode.ts ✓
- No 'use client' in llm.ts ✓
- normalize = ((deg % 360) + 360) % 360 in solar-return.ts ✓

## Decisions Made

1. **normalize applied once before loop:** `const natalLon = normalize(natalSunRaw)` called once, then `normalize(sunLon)` inside loop for comparison. `natal_sun_longitude` is never re-normalized inside the loop (prevents boundary corruption per Pitfall 2).

2. **OpenAI client per-call:** `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })` inside the function body, not at module level. This allows env var injection in tests without module-level mocking.

3. **response_format conditional spread:** Uses `...(responseFormat ? { response_format: responseFormat } : {})` to avoid passing `undefined` as a property value to OpenAI SDK.

4. **chart.ts re-exports PlanetPositions type:** `assembleChart` parameter type comes from aspects.ts, avoiding circular definition.

## Self-Check

### Files Created
- [x] src/services/geocode.ts — FOUND
- [x] src/services/analysis/llm.ts — FOUND
- [x] src/services/astrology/solar-return.ts — FOUND
- [x] src/services/astrology/aspects.ts — FOUND
- [x] src/services/astrology/chart.ts — FOUND
- [x] tests/services/llm.test.ts — MODIFIED (stub replaced)

### Git Commits
- N/A — no git repository in project (confirmed by environment context)

## Self-Check: PARTIAL

All 6 files written and manually verified correct. No git repository exists to commit to. Tests not run (Bash intermittently unavailable). TypeScript compilation not verified via tsc (same reason).
