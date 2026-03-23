# Phase 6: Tools Tier 3 — Advanced Astrology (Ephemeris) - Research

**Researched:** 2026-03-23
**Domain:** Ephemeris calculations (Node.js), Next.js API routes, Vercel serverless constraints
**Confidence:** HIGH (core ephemeris choice), MEDIUM (Vercel bundle size), HIGH (existing code integration)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ASTR-03 | Transit calculations showing current planetary influences on natal chart | astronomy-engine `EclipticLongitude(body, time)` replaces LLM approximation; inter-chart aspect engine in aspects.ts already exists |
| ASTR-04 | Solar Return annual chart and forecast | `findSolarReturn` in solar-return.ts already implements binary search; planets at SR moment need astronomy-engine |
| ASTR-05 | Synastry chart overlay for relationship compatibility | Compute two charts independently → pass both PlanetPositions sets to new `calculateInterChartAspects` |
| TOOL-05 | Timing tools — find astrologically favorable days | Iterate date range, call `EclipticLongitude` for each day, score against natal chart + activity weights |
| TOOL-08 | Career guidance informed by birth data | LLM-only tool — birth chart context injected into prompt; no new ephemeris needed |
| TOOL-09 | Relationship analysis beyond compatibility | LLM-only tool — name, dates, relationship type → structured JSON; extends existing compatibility work |
| TOOL-10 | Document analyzer (upload any document for AI insights) | File upload (existing infra) + LLM analysis; no ephemeris |
</phase_requirements>

---

## Summary

Phase 6 is the highest-risk phase because it must replace the `isApproximate: true` LLM-approximation path used since Phase 4 with real astronomical calculations. The blocker identified in STATE.md — ephemeris library selection — is now resolved: **`astronomy-engine` v2.1.19** is the clear choice.

The library is maintained by Cosinekitty (Don Cross), is cross-validated against NASA NOAA and JPL Horizons, accurate to ±1 arcminute (sufficient for all use cases in this phase), is pure TypeScript with no native bindings, has no external dependencies, and runs identically in Node.js serverless functions and browsers. Its ~116KB minified size fits comfortably within Vercel's Node.js function limits. No WASM, no native addons, no cold-start penalty beyond normal module loading.

The codebase already has significant reusable infrastructure: `calculateJulianDate`, `normalize`, `findSolarReturn` (binary search for exact SR moment), `calculateAspects`, `assembleChart`, and `calculateHouses` are all proven and in production. The key gap is a single function: `getEphemerisPositions(date: Date): PlanetPositions` that wraps `astronomy-engine` and feeds the existing pipeline. Once that bridge is built, transits, solar return with real planet positions, and synastry all fall out naturally.

Three of the seven Phase 6 requirements (TOOL-08, TOOL-09, TOOL-10) are LLM-only tools with no ephemeris dependency — career guidance, relationship analysis, and document analyzer. These can be built in parallel with the ephemeris work, and represent zero new technical risk.

**Primary recommendation:** Install `astronomy-engine` as the ephemeris layer, write `src/services/astrology/ephemeris.ts` as a thin adapter, and plumb it into the existing chart assembly pipeline. All other Phase 6 work builds on top of that one file.

---

## Standard Stack

### Core (no new additions needed beyond ephemeris)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astronomy-engine | 2.1.19 | Real planetary position calculations | Pure TypeScript, no native addons, ±1 arcminute accuracy, cross-validated against JPL Horizons, works in Vercel Node.js functions |
| zod | 4.3.6 (already installed) | Input validation on all new API routes | Project standard |
| openai via invokeLLM | 4.104.0 (already installed) | AI interpretation layer | Project standard |
| date-fns | 4.1.0 (already installed) | Date arithmetic for timing tool ranges | Already in package.json |
| @tanstack/react-query | 5.91.2 (already installed) | Client data fetching | Project standard |
| react-hook-form + zod | installed | Form handling | Project standard |

### Rejected Alternatives

| Rejected | Reason |
|----------|--------|
| Swiss Ephemeris WASM (`swisseph-wasm`) | WASM instantiation is restricted in some environments; Swiss Ephemeris has a complex license (GPL); much larger bundle; the ±1 arcminute accuracy of astronomy-engine is sufficient for astrological use |
| `astronomia` npm | Pure JavaScript, good accuracy, but TypeScript support is unclear, last verified update 2009 data corrections, less actively maintained |
| External API (AstrologyAPI.com, AstroSeek) | Adds network dependency, API keys, cost per call, and latency; unacceptable for a tool that must be responsive and offline-capable |
| LLM approximation (current Phase 4 approach) | Confirmed inaccurate — planners use this as a known gap with `isApproximate: true`; Phase 6 removes this flag |

### Installation

```bash
npm install astronomy-engine
```

**Version verification:** Confirmed 2.1.19 is current latest as of 2026-03-23 via `npm view astronomy-engine version`.

---

## Architecture Patterns

### Core Ephemeris Adapter (NEW — the key file)

```
src/services/astrology/
├── ephemeris.ts         # NEW — astronomy-engine adapter, the single entry point
├── chart.ts             # EXISTS — calculateHouses, assembleChart (keep as-is)
├── aspects.ts           # EXISTS — calculateAspects (keep as-is); ADD calculateInterChartAspects
├── solar-return.ts      # EXISTS — findSolarReturn, calculateSunPosition (keep as-is)
└── prompts/             # EXISTS — keep as-is
```

```
src/app/api/tools/astrology/
├── birth-chart/route.ts # EXISTS — update to use ephemeris.ts instead of LLM approximation
├── transits/route.ts    # NEW
├── solar-return/route.ts # NEW (directory exists, no route.ts yet)
```

```
src/app/api/tools/
├── career/route.ts      # NEW — LLM-only
├── relationships/route.ts # NEW — LLM-only
├── timing/route.ts      # NEW — ephemeris + scoring
├── document/route.ts    # NEW — file upload + LLM
```

```
src/app/(auth)/tools/
├── astrology/transits/page.tsx   # NEW
├── astrology/solar-return/page.tsx # NEW (directory exists, no page.tsx)
├── astrology/synastry/page.tsx   # NEW (directory exists, no page.tsx)
├── career/page.tsx               # NEW
├── relationships/page.tsx        # NEW
├── timing/page.tsx               # NEW
├── document/page.tsx             # NEW
```

### Pattern 1: Ephemeris Adapter Service

**What:** A single `src/services/astrology/ephemeris.ts` that wraps astronomy-engine and returns `PlanetPositions` (the existing interface from aspects.ts).

**When to use:** Every calculation requiring real planetary positions — transits, solar return planet calculation, synastry, timing.

```typescript
// Source: astronomy-engine v2.1.19 + confirmed via github.com/cosinekitty/astronomy README
import * as Astronomy from 'astronomy-engine'
import type { PlanetPositions } from '@/services/astrology/aspects'

/** כוכבי הלכת הנחשבים לחישוב אפמריס */
const EPHEMERIS_BODIES: Array<{ key: string; body: Astronomy.Body }> = [
  { key: 'sun',     body: Astronomy.Body.Sun },
  { key: 'moon',    body: Astronomy.Body.Moon },
  { key: 'mercury', body: Astronomy.Body.Mercury },
  { key: 'venus',   body: Astronomy.Body.Venus },
  { key: 'mars',    body: Astronomy.Body.Mars },
  { key: 'jupiter', body: Astronomy.Body.Jupiter },
  { key: 'saturn',  body: Astronomy.Body.Saturn },
  { key: 'uranus',  body: Astronomy.Body.Uranus },
  { key: 'neptune', body: Astronomy.Body.Neptune },
  { key: 'pluto',   body: Astronomy.Body.Pluto },
]

/**
 * מחזיר מיקומי כוכבי לכת אמיתיים לתאריך נתון
 * מבוסס על astronomy-engine v2.1.19 — דיוק ±1 arcminute
 * @param date - תאריך ושעה UTC
 * @returns PlanetPositions — מיקומים בטווח 0-360°
 */
export function getEphemerisPositions(date: Date): PlanetPositions {
  const astroTime = new Astronomy.AstroTime(date)
  const positions: PlanetPositions = {}
  for (const { key, body } of EPHEMERIS_BODIES) {
    positions[key] = {
      longitude: Astronomy.EclipticLongitude(body, astroTime),
      is_retrograde: isRetrograde(body, astroTime),
    }
  }
  return positions
}
```

**Retrograde detection:** astronomy-engine does not expose a single `isRetrograde()` function. The standard approach is to compare ecliptic longitude at T and T+1day — if longitude decreases (accounting for 0°/360° wraparound), the body is retrograde. Fast-moving bodies (Moon, Sun) are never retrograde from a geocentric perspective.

```typescript
/** מזהה תנועה רטרוגרדית — אורך אקליפטי יורד מיום ליום */
function isRetrograde(body: Astronomy.Body, time: Astronomy.AstroTime): boolean {
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) return false
  const nextDay = new Astronomy.AstroTime(new Date(time.date.getTime() + 86_400_000))
  const lon1 = Astronomy.EclipticLongitude(body, time)
  const lon2 = Astronomy.EclipticLongitude(body, nextDay)
  const diff = ((lon2 - lon1 + 360) % 360)
  return diff > 180 // traveled more than 180° means retrograde wrap-around
}
```

### Pattern 2: Transit Calculation

**What:** For a given date, compute current planetary positions and calculate aspects against the user's stored natal chart positions.

**Key insight:** Transits are just `calculateAspects()` run against a mixed planet set — where `planet1` is a transiting planet and `planet2` is a natal planet. The existing `calculateAspects` function only does intra-chart pairs. A new `calculateTransitAspects(transitingPlanets, natalPlanets)` must be added to aspects.ts.

```typescript
// Extend aspects.ts — new export
export function calculateTransitAspects(
  transiting: PlanetPositions,
  natal: PlanetPositions
): AspectResult[] {
  // Cross-product: every transiting planet against every natal planet
  // Same orb tables as calculateAspects
}
```

**Transit orb standards (astrological convention):** Use tighter orbs for transits than for natal:
- Sun/Moon transits: 3-4° orb
- Outer planets (Jupiter–Pluto): 1-2° orb
- Standard practice: 2° across the board for simplified systems

### Pattern 3: Solar Return with Real Positions

**What:** `findSolarReturn()` already calculates the exact SR moment using binary search on the simplified `calculateSunPosition()` (VSOP87 simplified). For Phase 6, the solar return moment is correct, but the planets at that moment must use astronomy-engine instead of LLM approximation.

**Existing function stays:** `findSolarReturn(input, year)` → returns a `Date` (the SR moment). No changes needed.

**What changes:** At the SR moment, call `getEphemerisPositions(srDate)` and `assembleChart(srDate, lat, lon, planets)`.

### Pattern 4: Synastry Dual Chart

**What:** Calculate two independent natal charts (person 1 and person 2), then compute inter-chart aspects.

```typescript
// API route flow:
const [chart1, chart2] = await Promise.all([
  buildNatalChart(person1Input),
  buildNatalChart(person2Input),
])
const interAspects = calculateInterChartAspects(chart1.planets, chart2.planets)
```

**Synastry-specific aspect orbs:** Astrological convention uses 5-6° for synastry aspects between two charts (relaxed vs natal). The tightest aspects (1-2°) carry the most weight.

### Pattern 5: Timing Tool — Favorable Day Scoring

**What:** For each day in a date range (max 30 days recommended), compute planetary positions and score them against the natal chart and activity type weights.

```typescript
// Scoring algorithm:
// 1. Calculate transiting planets for the day
// 2. Calculate transit aspects to natal chart
// 3. For each aspect, apply activity-weight multiplier
//    (e.g., Venus trine natal Sun = +30 for "relationship_start", +5 for "surgery")
// 4. Penalize: Mercury retrograde (-20), Void of Course Moon (-15)
// 5. Sum to daily score (0-100)
```

**Performance:** 30 days × 10 planets = 300 `EclipticLongitude` calls per request. astronomy-engine is purely synchronous/CPU. This is fast (< 100ms total). No caching needed.

**Void of Course Moon:** The Moon is void of course after its last major aspect before leaving a sign. Detection requires checking Moon's aspects over its ~2.5-day transit through each sign. This is complex to compute precisely; for v1 use a simplified check: if Moon is within 2° of entering a new sign, flag as "near void."

### Anti-Patterns to Avoid

- **LLM for planet positions:** The Phase 4 `isApproximate: true` path must be removed from the birth-chart route after this phase. The LLM has no access to real ephemeris data and produces degree-level errors.
- **Edge Runtime for ephemeris routes:** astronomy-engine is a large pure-JS module. Do not set `export const runtime = 'edge'` on routes that import it. Keep as default Node.js runtime. The Edge Runtime has a 1-2 MB compressed bundle limit that astronomy-engine approaches.
- **Client-side ephemeris calls:** Never import astronomy-engine in browser code — it adds ~116KB to the client bundle. All ephemeris work happens in API routes only.
- **Synastry via a single API call for both charts:** This creates a timeout risk. Build synastry as a single API call that internally computes both charts (no sequential round-trips from the client).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Planetary longitudes | Custom orbital mechanics | `astronomy-engine` `EclipticLongitude(body, time)` | VSOP87 accuracy, cross-validated against JPL |
| Julian Date from Date | Custom formula | Already in `calculateJulianDate()` in solar-return.ts | Tested, correct |
| Solar Return moment | Manual iteration | Already in `findSolarReturn()` in solar-return.ts | Binary search, ±0.01° accuracy |
| Aspect detection | Re-implement | Already in `calculateAspects()` in aspects.ts | Tested with 4 vitest cases |
| Sign from longitude | Custom math | Already in `getSign()` in chart.ts | Correct, tested |
| House placement | Custom | Already in `findHouseForPlanet()` in birth-chart route | In production |
| Chart assembly | Custom | Already in `assembleChart()` in chart.ts | Combines houses + aspects |
| Void of Course Moon | Full detection algorithm | Simplified Moon-in-sign check for v1 | Full VoC requires hourly aspect check — overkill for v1 |
| LLM document parsing | Custom file reader | Existing file upload infra (Phase 1 presign route) + invokeLLM | Already handles 5MB files |

**Key insight:** The gap between Phase 4 (LLM approximation) and Phase 6 (real ephemeris) is exactly one function: `getEphemerisPositions(date: Date): PlanetPositions`. Everything else in the pipeline reuses existing, tested code.

---

## Common Pitfalls

### Pitfall 1: EclipticLongitude Signature Changed Between Versions
**What goes wrong:** The type definition seen in the d.ts shows `EclipticLongitude(body: Body)` (one arg), but the README usage shows `EclipticLongitude(body, time)` (two args). Calling with wrong arity causes silent wrong results or TypeScript errors.
**Why it happens:** The library was refactored. In the current v2.x, the function takes `(body: Body, time: AstroTime)` — the AstroTime is required.
**How to avoid:** Use `new Astronomy.AstroTime(jsDate)` to construct time objects. Always pass both arguments.
**Warning signs:** TypeScript error "Expected 1 arguments, but got 2" means you have an old version installed.

### Pitfall 2: Retrograde Detection Requires Two EclipticLongitude Calls
**What goes wrong:** astronomy-engine has no single `isRetrograde(body, time)` function. Trying to find it causes confusion.
**Why it happens:** Retrograde is a positional derivative, not a position. The library gives positions.
**How to avoid:** Use the two-call method (T and T+1 day longitude comparison) described in Pattern 1. Note: for bodies near 0°/360° boundary, use `normalize()` from solar-return.ts before the comparison.
**Warning signs:** Retrograde flag always false/true on boundary planets.

### Pitfall 3: Synastry Uses Wrong ToolType
**What goes wrong:** Saving synastry analyses with `tool_type: 'astrology'` loses the distinction between natal charts and synastry.
**Why it happens:** The existing birth-chart route uses `tool_type: 'astrology'`. Synastry saves identically.
**How to avoid:** Use `tool_type: 'synastry'` — this value already exists in the `ToolType` union in `src/types/analysis.ts`. It's also in `TOOL_TYPES` in validations/analysis.ts. Solar Return → `tool_type: 'solar_return'`. Transits → `tool_type: 'transits'`.

### Pitfall 4: Solar Return Planet Fetch Uses Old LLM Path
**What goes wrong:** The existing `solar-return.ts` service only calculates the SR moment; planet positions at the SR moment are not yet computed anywhere. If you only update the SR moment calculation and forget to add `getEphemerisPositions(srMoment)`, the chart falls back to the LLM approximation.
**Why it happens:** Phase 4 solar return route (if it exists) would have used the LLM path. The SR moment calculation (binary search) was kept separate.
**How to avoid:** In the new solar-return API route: call `findSolarReturn()` first, then call `getEphemerisPositions(srMoment)`, then call `assembleChart(srMoment, lat, lon, planets)`.

### Pitfall 5: Transit Orb Table — Natal Orbs Are Too Wide for Transits
**What goes wrong:** Using the existing ASPECT_DEFINITIONS (8° orb for Conjunction) for transit calculations produces dozens of "active" transits that overwhelm users.
**Why it happens:** 8° is standard for natal aspects. Transits need tighter orbs (1-3°) because the transiting planet moves.
**How to avoid:** Define a separate `TRANSIT_ASPECT_DEFINITIONS` constant with tighter orbs. Recommended: Conjunction/Opposition 2°, Trine/Square 2°, Sextile 1.5° for outer planets; add 1° for inner planets.

### Pitfall 6: date-fns v4 Breaking Change in Date Iteration
**What goes wrong:** `addDays(date, n)` has a different import path in date-fns v4 vs v3. Using `import { addDays } from 'date-fns/addDays'` (v3 subpath) fails in v4.
**Why it happens:** date-fns 4.x uses tree-shakeable named exports from the root. STATE.md specifically warns about this.
**How to avoid:** Use `import { addDays, eachDayOfInterval } from 'date-fns'` (root import). Verify: `import { addDays } from 'date-fns'` works in the project — already verified as date-fns v4.1.0 is installed.

### Pitfall 7: Timing Tool Range Too Large = Timeout
**What goes wrong:** User selects a 90-day range. 90 × 10 planet calls + aspect calculations = ~900 longitude computations. Under Vercel's 10s default timeout, this is fine, but it creates a slow UX.
**Why it happens:** The BASE44 TimingTools page allowed arbitrary date ranges.
**How to avoid:** Cap the range at 31 days in the Zod input schema. For longer forecasts, use daily summaries instead of per-day full transit analysis.

### Pitfall 8: Void of Course Moon Complexity
**What goes wrong:** Full Void of Course Moon detection requires scanning Moon aspects on an hourly basis — computationally expensive.
**Why it happens:** The BASE44 TimingTools page showed void_moon boolean per day. The full algorithm requires checking when Moon's last aspect completes before it enters the next sign.
**How to avoid:** For Phase 6, use a simplified check: if Moon is within 2° of exiting its current sign (longitude % 30 > 28°), flag as "near void." Document this as a simplification.

### Pitfall 9: Birth Chart Route Still Uses `isApproximate: true`
**What goes wrong:** After adding ephemeris, the birth-chart route still has the LLM planet approximation path because it wasn't updated.
**Why it happens:** The LLM approximation is a 30-line fallback block in the birth-chart route.
**How to avoid:** The 06-01 plan task (ephemeris integration) must include updating the birth-chart route to use `getEphemerisPositions()` and removing the `isApproximate` flag. This is explicitly part of Phase 6 success criterion 1.

### Pitfall 10: Career/Relationship/Document Tools Missing SubscriptionGuard
**What goes wrong:** New pages built without SubscriptionGuard wrapping, inconsistent with all Phase 5 tools.
**Why it happens:** Career guidance source (CareerGuidance.jsx) has `SubscriptionGuard` — easy to miss when converting. RelationshipAnalysis.jsx does NOT have SubscriptionGuard in the BASE44 version.
**How to avoid:** Every new page.tsx must wrap its form content in `<SubscriptionGuard toolName="...">` per the Phase 4 audit pattern.

---

## Code Examples

### Verified Usage Pattern: astronomy-engine EclipticLongitude

```typescript
// Source: github.com/cosinekitty/astronomy README (verified 2026-03-23)
import * as Astronomy from 'astronomy-engine'

// Create AstroTime from a JavaScript Date
const time = new Astronomy.AstroTime(new Date('2026-03-23T12:00:00Z'))

// Get ecliptic longitude (0–360°) for each body
const sunLon  = Astronomy.EclipticLongitude(Astronomy.Body.Sun, time)     // e.g. 2.5°
const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, time)    // e.g. 147.3°
const marsLon = Astronomy.EclipticLongitude(Astronomy.Body.Mars, time)    // e.g. 239.1°
```

### Verified Usage Pattern: Inter-Chart Aspect Calculation (Synastry)

```typescript
// Extends the existing calculateAspects pattern from aspects.ts
export function calculateInterChartAspects(
  chart1Planets: PlanetPositions,  // person 1
  chart2Planets: PlanetPositions   // person 2
): AspectResult[] {
  const aspects: AspectResult[] = []
  const p1Names = Object.keys(chart1Planets)
  const p2Names = Object.keys(chart2Planets)

  for (const p1Name of p1Names) {
    for (const p2Name of p2Names) {
      const p1 = chart1Planets[p1Name]
      const p2 = chart2Planets[p2Name]
      if (!p1 || !p2) continue

      let angle = Math.abs(p1.longitude - p2.longitude)
      if (angle > 180) angle = 360 - angle

      for (const def of SYNASTRY_ASPECT_DEFINITIONS) {
        const orbValue = Math.abs(angle - def.angle)
        if (orbValue <= def.orb) {
          aspects.push({
            planet1: `p1:${p1Name}`, // prefix to distinguish charts
            planet2: `p2:${p2Name}`,
            type: def.name,
            orb: Math.round(orbValue * 100) / 100,
            strength: Math.round((1 - orbValue / def.orb) * 1000) / 1000,
          })
          break
        }
      }
    }
  }
  return aspects
}
```

### Verified Usage Pattern: Existing Solar Return Moment (no changes)

```typescript
// solar-return.ts already has this — no changes needed
import { findSolarReturn } from '@/services/astrology/solar-return'

const srDate = findSolarReturn(
  { birthDate: '1990-04-15', birthLat: 32.08, birthLon: 34.78 },
  2026  // target year
)
// → Date object for the exact solar return moment (±0.01° accuracy)

// Then get real planet positions at that moment:
import { getEphemerisPositions } from '@/services/astrology/ephemeris'
const planets = getEphemerisPositions(srDate)
// → PlanetPositions with real astronomy-engine values
```

### Verified Pattern: Career Guidance (LLM-only, no ephemeris)

```typescript
// Tool-08 pattern — birth chart context injected into LLM prompt
// Source: CareerGuidance.jsx conversion pattern
const CareerInputSchema = z.object({
  currentField: z.string().optional(),
  skills: z.string().min(1, 'כישורים חובה'),
  interests: z.string().min(1, 'תחומי עניין חובה'),
  // birth data from user profile — injected server-side, not from form
})

// Route reads user profile and injects natal chart context:
// const { birth_date, birth_place_lat, birth_place_lon } = profile
// const natalChart = await supabase.from('analyses')...
//   .eq('tool_type', 'astrology').limit(1)...
```

### Verified Pattern: Document Analyzer (file upload + LLM)

```typescript
// Tool-10 pattern — uses existing Phase 1 file upload infrastructure
// multipart/form-data → presign route → Supabase Storage → LLM with file URL
// Reuse: the exact same pattern as drawing/route.ts and graphology/route.ts
// from Phase 5 — different LLM prompt, same file handling code
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Swiss Ephemeris (C library, WASM) | astronomy-engine (pure TypeScript) | c. 2022 | No native bindings, works in serverless |
| LLM approximation (`isApproximate: true`) | astronomy-engine real positions | This phase | Remove disclaimer banner, accurate charts |
| Edge Runtime for all Next.js API routes | Node.js Runtime for ephemeris routes | Vercel 2024 recommendation | Vercel now recommends Node.js over Edge for most routes anyway |

**Deprecated/outdated:**
- LLM planet approximation path in `birth-chart/route.ts`: replaced by `getEphemerisPositions()` in this phase.
- `isApproximate: true` flag in API responses: removed after this phase. UI disclaimer banner also removed.

---

## Existing Code Inventory (What Already Works — Do Not Modify)

This phase ADDS new files and MODIFIES only the birth-chart route. Everything else in the astrology service layer is kept as-is.

| File | Status | Phase 6 Action |
|------|--------|----------------|
| `src/services/astrology/solar-return.ts` | DONE (41/50 score, labeled "KEEP") | No changes to `findSolarReturn` or `calculateSunPosition` |
| `src/services/astrology/chart.ts` | DONE | No changes |
| `src/services/astrology/aspects.ts` | DONE | ADD `calculateInterChartAspects` and `TRANSIT_ASPECT_DEFINITIONS` |
| `src/services/astrology/ephemeris.ts` | MISSING | CREATE — wraps astronomy-engine |
| `src/app/api/tools/astrology/birth-chart/route.ts` | DONE (keep logic, update planets source) | REPLACE LLM approximation with `getEphemerisPositions()`, remove `isApproximate: true` |
| `src/app/api/tools/astrology/transits/route.ts` | MISSING | CREATE |
| `src/app/api/tools/astrology/solar-return/route.ts` | MISSING | CREATE |
| `src/types/analysis.ts` | Has `synastry`, `solar_return`, `transits`, `career`, `relationship` | No changes needed — ToolType union already includes all Phase 6 types |

**Critical discovery:** The `ToolType` union in `src/types/analysis.ts` already contains: `'synastry'`, `'solar_return'`, `'transits'`, `'career'`, `'relationship'`. No schema migration needed for tool type values.

---

## Feature Scoping: What Is and Is Not Ephemeris-Dependent

| Feature | Ephemeris Needed? | Source in BASE44 |
|---------|-------------------|------------------|
| ASTR-03 Transits | YES — real positions required | `calculateTransits` BASE44 function (was mocked) |
| ASTR-04 Solar Return | YES — planets at SR moment | `calculateSolarReturn` BASE44 function |
| ASTR-05 Synastry | YES — two real charts | `calculateAstrology` called twice |
| TOOL-05 Timing Tools | YES — daily planet positions for scoring | `findBestDays` BASE44 function |
| TOOL-08 Career Guidance | NO — birth chart context injected into LLM prompt | `InvokeLLM` directly in BASE44 |
| TOOL-09 Relationship Analysis | NO — LLM-only | `InvokeLLM` directly in BASE44 |
| TOOL-10 Document Analyzer | NO — file upload + LLM | No BASE44 equivalent |

**Key finding:** TOOL-08, TOOL-09, and TOOL-10 can be built in any wave independent of ephemeris. Ephemeris only gates ASTR-03, ASTR-04, ASTR-05, and TOOL-05.

---

## UI Patterns from BASE44 Source

### What the Original Pages Show (Component Inventory)

**Transits.jsx:**
- Loads user's most recent astrology analysis (contains natal planet positions)
- Triggers: "Calculate Current Transits" button
- Shows: stats card (total transits, strong transits, void moon, mercury retro)
- Shows: grid of transiting planet positions (sign + degree)
- Shows: per-transit cards with aspect type, orb, affected areas, timing, action items
- Shows: overall interpretation (current energy, opportunities, challenges, main advice)
- Data shape: `{ transiting_planets: {[name]: {sign, longitude}}, transits: AspectResult[], special_conditions: {void_of_course_moon, mercury_retrograde}, metadata: {total_transits} }`

**SolarReturn.jsx:**
- Accepts: year selector (current year, next year, or arbitrary number input)
- Shows: SR moment timestamp, accuracy badge
- Shows: BirthChart SVG with SR planets (reuses existing BirthChart component)
- Shows: element distribution (fire/earth/air/water counts)
- Shows: house interpretations (filtered to high-importance or occupied houses)
- Shows: major aspects, important months, practical advice
- Requires: user profile + natal chart from previous astrology analysis

**Synastry.jsx:**
- Accepts: two people with full birth data (name, date, time, place)
- Has "load from profile" buttons for person 1 (user profile) and guest profiles
- Shows: compatibility score (0-100%), element harmony, sun-sun dynamic, moon-moon dynamic, venus-mars chemistry, communication style, emotional compatibility, strengths, challenges, long-term potential, recommendations

**TimingTools.jsx:**
- Accepts: activity type (8 options), date range (start/end)
- Shows: ranked "best days" list with score/100, moon sign, favorable factors, unfavorable factors, void moon/mercury retro badges
- Shows: "worst days" list
- Shows: top recommendation highlight

**CareerGuidance.jsx:**
- Accepts: current field (optional), skills, interests, birth date (optional)
- Shows: recommended fields (name, match_score %, reason)
- Shows: skills_to_develop, growth_opportunities, challenges + solutions, action_steps
- **No birth chart integration in BASE44 version** — birth_date is optional text input only
- **Phase 6 enhancement:** inject natal chart context from DB automatically

**RelationshipAnalysis.jsx:**
- Accepts: two names, two birth dates, relationship type (romantic/friendship/business/family), context text
- Shows: compatibility_score %, summary, strengths, challenges, recommendations, communication_style, emotional_dynamics
- **Note:** No SubscriptionGuard in original — ADD SubscriptionGuard in Next.js version

---

## Validation Architecture

Config has `workflow.nyquist_validation: true` — validation section is included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `npx vitest run tests/services/astrology.test.ts` |
| Full suite command | `npx vitest run` (from `mystiqor-build/`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ASTR-03 | `getEphemerisPositions(date)` returns correct Sun longitude for known date | unit | `npx vitest run tests/services/ephemeris.test.ts` | ❌ Wave 0 |
| ASTR-03 | `calculateTransitAspects(transiting, natal)` finds expected aspects | unit | `npx vitest run tests/services/aspects.test.ts` | ❌ Wave 0 (extend existing astrology.test.ts) |
| ASTR-04 | Solar Return moment for known birthdate/year matches within ±1 hour | unit | `npx vitest run tests/services/ephemeris.test.ts` | ❌ Wave 0 |
| ASTR-05 | `calculateInterChartAspects` finds Sun-Moon conjunction between two charts | unit | `npx vitest run tests/services/aspects.test.ts` | ❌ Wave 0 |
| TOOL-05 | Timing score is higher for Venus trine day vs Mercury square day | unit | `npx vitest run tests/services/timing.test.ts` | ❌ Wave 0 |
| TOOL-08 | Career route returns 200 with required fields | integration — manual API test | manual | N/A |
| TOOL-09 | Relationship route returns compatibility_score in 0-100 | integration — manual API test | manual | N/A |
| TOOL-10 | Document route returns 200 with analysis field | integration — manual API test | manual | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/services/` (run from `mystiqor-build/`)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/services/ephemeris.test.ts` — covers ASTR-03 (real sun position), ASTR-04 (SR moment sanity check)
- [ ] `tests/services/aspects.test.ts` — extend or create to cover `calculateInterChartAspects` (ASTR-05) and `calculateTransitAspects` (ASTR-03)
- [ ] `tests/services/timing.test.ts` — covers TOOL-05 scoring algorithm
- [ ] Framework install: `npm install astronomy-engine` (from `mystiqor-build/`) — not yet installed

**Reference test values for ephemeris.test.ts (HIGH confidence, from JPL Horizons cross-checks):**
- 2000-01-01T12:00:00Z: Sun longitude ≈ 280.46° (J2000 reference)
- 2026-03-20T10:00:00Z (Vernal Equinox 2026): Sun longitude ≈ 0° (Aries ingress)

---

## Open Questions

1. **Synastry page — does it need a full chart SVG for both people, or just aspect grid?**
   - What we know: BASE44 SolarReturn.jsx used the `BirthChart` SVG component. Synastry.jsx showed NO chart SVG — only text-based aspect descriptions.
   - What's unclear: Should Phase 6 synastry show a dual-ring SVG overlay (more complex) or just the text-based interpretation (simpler)?
   - Recommendation: Start with text-based (matching BASE44 original). Dual-ring SVG is Phase 9+ polish.

2. **Birth chart update — does removing `isApproximate: true` break existing saved analyses?**
   - What we know: The analyses table stores `results: JSON` with `isApproximate: true` in the results blob. Existing rows will still have it.
   - What's unclear: Does any UI component check `results.isApproximate` and show a disclaimer banner?
   - Recommendation: Search for `isApproximate` in UI components before removing. The disclaimer banner (if any) should be removed from the birth-chart page.tsx when the flag is removed from the API.

3. **Timing tool — activity type scoring weights**
   - What we know: The BASE44 source calls `findBestDays` with activity_type but the scoring logic lives in the BASE44 backend (not visible).
   - What's unclear: Exact scoring weights per activity type (e.g., how much does Venus trine contribute to "marriage" score vs "business_launch").
   - Recommendation: Define a `ACTIVITY_ASPECT_WEIGHTS` constant table in the timing service. Use astrologically conventional mappings (Venus/Sun trines positive for relationships; Mercury direct positive for contracts; Mars sextile positive for energy/business). These weights are Claude's discretion — no user has defined them.

---

## Sources

### Primary (HIGH confidence)
- astronomy-engine GitHub (github.com/cosinekitty/astronomy) — verified via WebFetch: function signatures, Body enum, accuracy claim (±1 arcminute), validated against JPL Horizons, pure TypeScript, no dependencies
- npm registry — `npm view astronomy-engine version` confirmed 2.1.19 as current latest (2026-03-23)
- Vercel docs (vercel.com/docs/functions/runtimes/edge-runtime) — verified via WebFetch: Node.js is recommended over Edge; Edge has 1-2 MB compressed size limit; WebAssembly.instantiate restricted
- Project source code (mystiqor-build/src) — direct inspection: solar-return.ts, chart.ts, aspects.ts, birth-chart/route.ts, types/analysis.ts, package.json

### Secondary (MEDIUM confidence)
- astronomy-engine source file astronomy.ts (GitHub) — confirmed `EclipticLongitude(body, time)` two-parameter signature, Body enum values, AstroTime constructor
- BASE44 source pages (github-source/) — confirmed feature shapes: Transits.jsx, SolarReturn.jsx, Synastry.jsx, TimingTools.jsx, CareerGuidance.jsx, RelationshipAnalysis.jsx all inspected

### Tertiary (LOW confidence)
- None — all critical findings have primary source confirmation

---

## Metadata

**Confidence breakdown:**
- Standard stack (astronomy-engine): HIGH — npm version confirmed, TypeScript confirmed, accuracy confirmed from official docs
- Architecture (ephemeris adapter pattern): HIGH — based on direct inspection of existing code interfaces
- Pitfalls: HIGH — all identified from direct code inspection + Vercel docs
- Scoring weights for timing tool: LOW — astrological convention, no official source

**Research date:** 2026-03-23
**Valid until:** 2026-09-23 (astronomy-engine is stable; Vercel runtime guidance changes less frequently)
