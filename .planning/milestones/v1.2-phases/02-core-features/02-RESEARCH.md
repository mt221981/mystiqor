# Phase 2: Core Features - Research

**Researched:** 2026-03-20
**Domain:** Next.js App Router · React · SVG · AI API integration · Multi-step wizard · Hebrew RTL
**Confidence:** HIGH (based on project-specific source code and established architecture docs)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ONBR-01 | User completes 4-step onboarding (info → location → ethics/Barnum → preferences) | OnboardingWizard builds on useOnboardingStore (already built in Phase 1 Plan 05); GEM 13 defines exact Barnum step content |
| ONBR-02 | Dashboard shows stats (goals, mood, analyses, reminders) with charts | Recharts already installed; dashboard/page.tsx placeholder exists; needs real Supabase queries + chart components |
| ONBR-03 | Home page with tool grid, daily insight widget, recent analyses | ToolGrid and AnalysisHistory components already exist from Phase 1 Plan 07; home page needs daily insight widget |
| TOOL-01 | Numerology — Hebrew gematria (life path, destiny, soul, personality, personal year) | Services fully built in Phase 1 (gematria.ts, calculations.ts, compatibility.ts); needs page + API route only |
| TOOL-02 | Astrology birth chart — geocoding + calculation + interactive SVG + AI interpretation | chart.ts built; BirthChart SVG split needed (index + ZodiacRing + PlanetPositions + AspectLines + HouseOverlay); API routes skeletal |
| TOOL-03 | Astrology Solar Return — VSOP87 binary search + Placidus houses | solar-return.ts service built (GEM 1); needs API route + page |
| TOOL-04 | Astrology Transits — real ephemeris calculation (REBUILD from mocked data) | Original is mocked; must build real ephemeris using existing chart.ts calculateSunPosition pattern |
| TOOL-05 | Astrology Synastry — dual chart comparison with compatibility scoring | Uses existing chart.ts twice; needs page + synastry scoring logic |
| TOOL-06 | Astrology Readings — 8 reading types with type-specific inputs | Needs API route + page; READING_TYPES config to extract from original source |
| TOOL-07 | Graphology — image upload + AI analysis + radar chart comparison | Recharts RadarChart available; needs page + API + Comparison/QuickStats components |
| TOOL-08 | Drawing Analysis — HTP with Koppitz indicators, digital canvas, annotations | drawing/analysis.ts service built; needs DigitalCanvas + AnnotatedViewer + KoppitzIndicators + MetricsBreakdown + page |
| TOOL-09 | Palmistry — image upload + AI palm analysis | Simplest tool: upload route exists; needs page + API route calling LLM with vision |
| TOOL-10 | Tarot — card draw from DB (not hardcoded) + AI interpretation | tarot_cards DB table defined; needs page + API route reading from Supabase |
| TOOL-11 | Human Design — calculation + centers visualization | LLM-simulated (no real ephemeris for HD); needs page + API; centers SVG visualization |
| TOOL-12 | Dream Analysis — dream journal + async AI + image generation | Async fire-and-forget pattern; needs page + API; dreams table already in DB schema |
| TOOL-13 | Compatibility — numerology + astrology combined, anti-Barnum prompting | Uses numerology.ts compatibility.ts + chart.ts; needs page + API |
</phase_requirements>

---

## Summary

Phase 2 is the largest phase in the project — 47 files across onboarding, dashboard, home, 13 tool pages, 13+ API routes, and 8+ feature components. The good news is that Phase 1 built all the hard compute: every service (numerology, astrology chart, solar return, aspects, drawing analysis, LLM wrapper, geocode) is already complete. Phase 2 is primarily UI plumbing — connecting those services to pages via API routes and rendering results.

The phase has a natural internal dependency order. Onboarding must come first (it gates all tools). Birth chart must come before solar return, transits, synastry, and readings (they require `AstrologyCalculation` records). Numerology, palmistry, tarot, and palmistry are independent and can be built in parallel. The BirthChart SVG split (index + 4 sub-components) is the single most complex component task and should be planned carefully to stay under 300 lines per file.

The critical architectural insight is that all 13 tool API routes follow the exact same 6-step pattern: auth check → Zod validation → SubscriptionGuard (increment usage) → call service → save to `analyses` table → return result. This pattern should be codified as a shared utility to avoid copy-paste across 13 routes.

**Primary recommendation:** Build in waves — Wave 1: onboarding + dashboard + home (unblocks user entry); Wave 2: independent tools (numerology, palmistry, tarot, graphology, drawing, dream); Wave 3: astrology chain (birth chart → solar return → transits → synastry → readings → human design → compatibility). Each wave can be parallelized within itself.

---

## Standard Stack

### Core (already installed — verified from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.0 | App Router pages and API routes | Target stack, already configured |
| TypeScript | ^5 | Strict mode throughout | Project mandate |
| React | ^19.2.4 | UI components | Target stack |
| Zod | ^4.3.6 | Input validation on all API routes | Already used in Phase 1 validations |
| React Hook Form | ^7.71.2 | Form state + validation | Target stack, used in BirthDataForm |
| @hookform/resolvers | ^5.2.2 | Zod resolver for RHF | Pairs with RHF |
| @tanstack/react-query | ^5.91.2 | Server state, mutations, caching | GEM 8 cache strategy already in place |
| Zustand | ^5.0.12 | Client state (wizard, theme) | useOnboardingStore already built |
| Recharts | ^3.8.0 | Dashboard charts, radar chart | Already installed |
| framer-motion | ^12.38.0 | Animations (GEM 11 presets) | Already installed, presets.ts exists |
| @supabase/supabase-js | ^2.99.3 | DB, auth, storage, realtime | Target stack |
| openai | ^4.104.0 | LLM calls (GPT-4o/mini) | Already in llm.ts wrapper |
| lucide-react | ^0.577.0 | Icons | shadcn/ui standard |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | installed | All base UI components | Every component — already initialized |
| dompurify | ^3.3.3 | XSS sanitization of user input | Before LLM prompt injection |
| date-fns | ^4.1.0 | Date formatting (Israeli dates) | dates.ts already uses it |
| react-markdown | ^10.1.0 | Render AI text responses as markdown | AI results from LLM |
| remark-gfm | ^4.0.1 | GitHub flavored markdown in react-markdown | Pairs with react-markdown |

### No New Libraries Needed

Phase 2 requires zero new npm packages. Every library needed is already installed in package.json (verified 2026-03-20).

---

## Architecture Patterns

### The Tool Page Standard Pattern

Every one of the 13 tool pages follows this identical structure:

```
src/app/(auth)/tools/[tool-name]/page.tsx   ← Page (< 300 lines, 'use client')
src/app/api/tools/[tool-name]/route.ts      ← API route (POST only)
src/components/features/[domain]/[Widget].tsx ← Optional display component
```

**Page pattern:**
```typescript
// Source: 03_ARCHITECTURE.md §4.1 + 05_GSD_BUILD_BRIEF.md Phase 2

'use client'

/**
 * דף [כלי] — [תיאור קצר בעברית]
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { PageHeader } from '@/components/layouts/PageHeader'
import { ExplainableInsight } from '@/components/features/insights/ExplainableInsight'
import { animations } from '@/lib/animations/presets'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { [ToolInputSchema] } from '@/lib/validations/analysis'

interface [Tool]PageProps {} // always typed, even if empty

export default function [Tool]Page({}: [Tool]PageProps) {
  const { canUseAnalysis, incrementUsage } = useSubscription()
  const [result, setResult] = useState<[ToolResult] | null>(null)

  const mutation = useMutation({
    mutationFn: async (data: [ToolInput]) => {
      await incrementUsage()
      const res = await fetch('/api/tools/[tool]', { method: 'POST', body: JSON.stringify(data) })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<[ToolResult]>
    },
    onSuccess: (data) => { setResult(data); toast.success('הניתוח הושלם') },
    onError: () => toast.error('שגיאה בביצוע הניתוח'),
  })

  return (
    <SubscriptionGuard>
      <PageHeader title="[שם הכלי]" />
      {/* form */}
      {result && <ResultDisplay result={result} />}
    </SubscriptionGuard>
  )
}
```

**API route pattern (identical across all 13 tools):**
```typescript
// Source: 03_ARCHITECTURE.md §3.2 API Standards

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const InputSchema = z.object({ /* tool-specific fields */ })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })

  const body = await request.json()
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    // 1. Call service(s)
    const result = await [service].calculate(parsed.data)

    // 2. Save to analyses table
    const { data: analysis } = await supabase.from('analyses').insert({
      user_id: user.id,
      tool_type: '[tool_type]',
      input_data: parsed.data,
      results: result,
      summary: result.summary ?? null,
    }).select().single()

    return NextResponse.json({ data: { ...result, analysis_id: analysis?.id } })
  } catch (error) {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
```

### Recommended Project Structure for Phase 2

```
src/
├── app/(auth)/
│   ├── onboarding/page.tsx            # Step 1-4 wizard
│   ├── dashboard/page.tsx             # Stats + charts (REPLACE placeholder)
│   ├── tools/
│   │   ├── numerology/page.tsx
│   │   ├── astrology/
│   │   │   ├── page.tsx               # Birth chart
│   │   │   ├── solar-return/page.tsx
│   │   │   ├── transits/page.tsx
│   │   │   ├── synastry/page.tsx
│   │   │   └── readings/page.tsx
│   │   ├── graphology/page.tsx
│   │   ├── drawing/page.tsx
│   │   ├── palmistry/page.tsx
│   │   ├── tarot/page.tsx
│   │   ├── human-design/page.tsx
│   │   ├── dream/page.tsx
│   │   └── compatibility/page.tsx
│   └── (public)/page.tsx              # Home with ToolGrid + daily insight
├── app/api/tools/
│   ├── numerology/route.ts
│   ├── astrology/
│   │   ├── birth-chart/route.ts       # directory exists, route.ts missing
│   │   ├── solar-return/route.ts
│   │   ├── transits/route.ts
│   │   ├── readings/route.ts
│   │   └── interpret/route.ts
│   ├── graphology/route.ts
│   ├── drawing/route.ts
│   ├── palmistry/route.ts
│   ├── tarot/route.ts
│   ├── human-design/route.ts
│   ├── dream/route.ts
│   └── compatibility/route.ts
└── components/features/
    ├── astrology/BirthChart/
    │   ├── index.tsx                  # Container (< 200 lines)
    │   ├── ZodiacRing.tsx             # SVG outer ring
    │   ├── PlanetPositions.tsx        # Planet dots
    │   ├── AspectLines.tsx            # Aspect lines
    │   └── HouseOverlay.tsx           # House divisions
    ├── onboarding/OnboardingWizard.tsx
    ├── numerology/NumberCard.tsx
    ├── graphology/Comparison.tsx
    ├── graphology/QuickStats.tsx
    ├── drawing/DigitalCanvas.tsx
    ├── drawing/AnnotatedViewer.tsx
    ├── drawing/KoppitzIndicators.tsx
    └── drawing/MetricsBreakdown.tsx
```

### Pattern 1: BirthChart SVG Split

**What:** The original BirthChart.jsx was 922 lines with all SVG logic combined. Split into 5 files, each under 200 lines.

**When to use:** Always — the split is mandatory per 300-line rule.

**Split strategy:**
- `index.tsx` — container that orchestrates props, holds chart data state, renders other 4 sub-components (< 200 lines)
- `ZodiacRing.tsx` — pure SVG: 12 zodiac segments with colors and Hebrew signs from `ZODIAC_SIGNS` constant
- `PlanetPositions.tsx` — pure SVG: planet dots using `getPlanetPosition` from GEM 6 math
- `AspectLines.tsx` — pure SVG: lines between planets using aspect data
- `HouseOverlay.tsx` — pure SVG: 12 house division lines

**Shared SVG math (from GEM 6):**
```typescript
// Source: 02b_GEMS.md GEM 6

/** מחשב מיקום כוכב על ה-SVG לפי אורך האקליפטי שלו */
const getPlanetPosition = (longitude: number, radius: number) => {
  const angle = (longitude - 90) * (Math.PI / 180)
  return {
    x: 250 + radius * Math.cos(angle),
    y: 250 + radius * Math.sin(angle),
  }
}
// SVG viewBox="0 0 500 500" — center at (250, 250)
```

All 4 SVG sub-components receive the same `ChartData` prop type and are purely presentational.

### Pattern 2: Onboarding Wizard (GEM 13)

**What:** 4-step wizard with Zustand state persistence. Step 3 is the ethical Barnum Effect education — non-skippable.

**Step structure:**
```
Step 1: PersonalInfoStep   — name + birth date/time + gender (BirthDataForm reuse)
Step 2: LocationStep       — birth place via LocationSearch geocoding
Step 3: BarnumEthicsStep   — GEM 13: education + 2 mandatory checkboxes
Step 4: PreferencesStep    — disciplines + focus areas + AI toggle
→ Submit: upsert profiles table + set onboarding_completed = true + redirect to /tools
```

**GEM 13 implementation:**
```typescript
// Source: 02b_GEMS.md GEM 13

// Step 3 must render these two mandatory checkboxes:
// checkbox 1: "מבין/ה שהניתוחים מצביעים על פוטנציאלים, לא גורל"
// checkbox 2: "מסכים/ה לתנאי השימוש"
// Both must be checked before nextStep() is enabled
// Text: "ניתוחים מבוססים על 2-3+ נקודות מידע ספציפיות שלך"
//       "מקורות לטענות, סתירות מזוהות, גיבוי מדעי"
```

**State consumption:** `useOnboardingStore` is already built with `step`, `data`, `setStep`, `updateData`, `reset`. The OnboardingWizard just reads and writes to this store.

### Pattern 3: Dashboard Stats with Recharts

**What:** Dashboard displays 4 stat cards + at least 1 chart of real data from Supabase.

**Data sources (all from Supabase):**
```typescript
// Parallel queries using Promise.allSettled (GEM 8 prefetch pattern)
const [goalsCount, moodCount, analysesCount, remindersCount] = await Promise.allSettled([
  supabase.from('goals').select('id', { count: 'exact' }).eq('user_id', userId),
  supabase.from('mood_entries').select('id', { count: 'exact' }).eq('user_id', userId),
  supabase.from('analyses').select('id', { count: 'exact' }).eq('user_id', userId),
  supabase.from('reminders').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'pending'),
])
```

**Recharts for tool usage chart:**
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
// Data: analyses grouped by tool_type (last 30 days)
```

### Pattern 4: Async Dream Analysis (Fire-and-Forget)

**What:** Dream creation is instant (save to DB), AI interpretation happens asynchronously.

**Pattern (from 02_REVERSE_ENGINEERING.md F12):**
```
POST /api/tools/dream
  1. Validate + save dream record with ai_interpretation = null
  2. toast.success("חלומך נשמר! הניתוח יהיה מוכן בקרוב")
  3. Trigger background work (parallel):
     a. LLM interpretation → update dreams.ai_interpretation
     b. Image generation (optional) → update dreams.dreamscape_url
  4. Return { dream_id, status: 'processing' } immediately
  5. Frontend polls or uses Supabase Realtime for update
```

Use Next.js `waitUntil` (Vercel) or just return early and let the async work continue with proper error handling.

### Pattern 5: Tarot from DB

**What:** Cards must come from `tarot_cards` table, not hardcoded.

**Pattern:**
```typescript
// GET tarot cards from Supabase (useStaticDataQuery — cache forever, GEM 8)
const { data: cards } = useStaticDataQuery(
  ['tarot-cards'],
  async () => {
    const supabase = createClient()
    const { data } = await supabase.from('tarot_cards').select('*')
    return data ?? []
  }
)
// Random draw: shuffle + slice(0, spread_count)
const draw = cards.sort(() => Math.random() - 0.5).slice(0, spreadCount)
```

### Anti-Patterns to Avoid

- **Tool-specific Zod schemas in API routes:** Put schemas in `src/lib/validations/analysis.ts` (or tool-specific validation files). Don't inline z.object in route.ts bodies.
- **Raw SQL in page components:** All DB access goes through route handlers or server components with Supabase client — never in client components directly.
- **Single BirthChart file > 300 lines:** Split is mandatory. The 922-line original cannot be migrated as-is.
- **Hardcoded tarot cards:** Must come from `tarot_cards` DB table.
- **Mocked transit data:** TOOL-04 (transits) must use real ephemeris — the existing `calculateSunPosition` from `solar-return.ts` can be reused for all 10 planets.
- **LLM calls in client components:** All LLM calls stay server-side in API routes.
- **`useEffect` for data fetching:** Use React Query mutations and queries only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Radar chart (graphology) | Custom SVG radar | `recharts` RadarChart | Already installed, handles accessibility |
| Bar/Line charts (dashboard) | Custom SVG charts | `recharts` BarChart/LineChart | Already installed |
| Animation variants | Custom CSS transitions | `framer-motion` + `presets.ts` | GEM 11 already has 20+ variants |
| Form state | Manual useState per field | `react-hook-form` + Zod resolver | Already set up in BirthDataForm pattern |
| Debounced search | Manual setTimeout | `useDebounce` hook | Already built in Phase 1 |
| File upload | Direct fetch to storage | `/api/upload/route.ts` | Already built, validates type + size |
| Hebrew text rendering | Custom font loading | Already configured in root layout | Fonts loaded globally |
| Toast notifications | Custom toast component | `sonner` | Already in layout-client.tsx |
| SVG planet positioning | Custom trigonometry | `getPlanetPosition` from GEM 6 | Already proven math |
| Usage gating | Manual subscription checks | `SubscriptionGuard` + `useSubscription` | Already built in Phase 1 |
| Transit ephemeris | Full Swiss Ephemeris library | Reuse `calculateSunPosition` from `solar-return.ts` | Already works for Sun; apply to all planets |
| Markdown rendering | Custom text parser | `react-markdown` + `remark-gfm` | Already installed |

**Key insight:** All computation is already done. Phase 2 is purely UI integration. Every service, every hook, every shared component needed is already built. The only remaining work is pages + API routes + a few display components.

---

## Common Pitfalls

### Pitfall 1: AstrologyCalculation Prerequisites Not Checked

**What goes wrong:** Solar Return, Transits, Synastry, and Readings all require an existing `AstrologyCalculation` record (from the birth chart tool). If the user hasn't done their birth chart first, the page crashes or returns empty data.

**Why it happens:** Developers build tool pages in isolation and forget the dependency chain from `02_REVERSE_ENGINEERING.md §3`.

**How to avoid:** Every dependent astrology page (solar-return, transits, synastry, readings) must check for existing `AstrologyCalculation` record on mount:
```typescript
// At page start — redirect if prerequisite missing
const { data: calculation } = useQuery({
  queryKey: ['astrology-calculation', userId],
  queryFn: () => supabase.from('analyses')
    .select('results').eq('user_id', userId)
    .eq('tool_type', 'astrology').order('created_at', { ascending: false }).limit(1).single()
})
if (!calculation) return <EmptyState message="יש לבצע תחילה מפת לידה" action="עבור לאסטרולוגיה" />
```

**Warning signs:** Page that imports `solar-return.ts` service directly without checking for natal chart data first.

### Pitfall 2: BirthChart SVG Coordinate System

**What goes wrong:** Planet positions appear in wrong locations because the SVG angle convention differs from the astronomical convention.

**Why it happens:** Astronomical longitude 0° is Aries (left/east in sky), but SVG 0° is right (3 o'clock). The offset is `-90` in the angle calculation.

**How to avoid:** Always use the established `getPlanetPosition` from GEM 6:
```typescript
const angle = (longitude - 90) * (Math.PI / 180)  // -90 offset is critical
```
Never recalculate this from scratch.

**Warning signs:** Planets appearing rotated 90° or planets at Aries showing at the top instead of left.

### Pitfall 3: RTL Breaking in SVG

**What goes wrong:** SVG text labels for Hebrew zodiac signs render mirrored or right-to-left at wrong position.

**Why it happens:** SVG does not inherit CSS `dir="rtl"`. Text anchoring must be explicit.

**How to avoid:**
```typescript
// In SVG text elements — always set textAnchor explicitly
<text textAnchor="middle" dominantBaseline="central" direction="rtl">
  {ZODIAC_SIGNS[sign].name}  // Hebrew name from constants
</text>
```

### Pitfall 4: Onboarding Without Redirect Guard

**What goes wrong:** Users who have already completed onboarding (`onboarding_completed = true`) land on onboarding page again.

**Why it happens:** The onboarding page doesn't check profile completion status.

**How to avoid:** In `onboarding/page.tsx`, check on mount:
```typescript
// Server component or useEffect
const { data: profile } = await supabase.from('profiles').select('onboarding_completed').single()
if (profile?.onboarding_completed) redirect('/tools')
```

### Pitfall 5: Transits With Mocked Data

**What goes wrong:** Transits tool returns stale or nonsensical planet positions because the original `calculateTransits` was fully mocked (score: 23/50, 🔴 REBUILD decision).

**Why it happens:** Developer migrates the mocked function instead of rebuilding it.

**How to avoid:** For TOOL-04 transits, call `calculateSunPosition(new Date())` from `solar-return.ts` for each planet. The existing service calculates Sun position. For other planets, the same Julian Date + trigonometry approach applies — extend the pattern, don't use the mocked original.

### Pitfall 6: File Size Violations

**What goes wrong:** Tool pages from the original codebase are 600–1332 lines. Direct migration violates the 300-line limit.

**Top offenders and their split strategy:**
- `Numerology.jsx` (1332 lines) → `page.tsx` + `NumberCard.tsx` (already planned) + inline calculation display component
- `AstrologyReadingCard.jsx` (1206 lines) → `ReadingCard.tsx` split into section components (< 300 each)
- `DrawingAnalysis.jsx` → `page.tsx` + `DigitalCanvas.tsx` + `AnnotatedViewer.tsx` + `KoppitzIndicators.tsx` + `MetricsBreakdown.tsx`
- `Graphology.jsx` (936 lines) → `page.tsx` + `Comparison.tsx` + `QuickStats.tsx`

**Warning signs:** Any single file approaching 250 lines during construction — split now, not later.

### Pitfall 7: Dream Image Generation on Vercel

**What goes wrong:** Dream image generation (DALL-E call) times out because Vercel serverless functions have a 10-second limit by default.

**How to avoid:** For TOOL-12, use the fire-and-forget pattern — save dream record immediately, return `{ dream_id, status: 'processing' }`, let the async LLM + image generation work via Vercel's `waitUntil` or background processing. Don't block the API response.

### Pitfall 8: Tarot Cards Not in DB Yet

**What goes wrong:** `tarot_cards` table exists in the schema but may have zero rows if the seed migration wasn't run.

**How to avoid:** The tarot API route must handle the empty table gracefully with a fallback. The 38+ hardcoded cards from the original `Tarot.jsx` should be inserted as a seed migration (a Wave 0 task for Plan 02-01 or 02-02).

---

## Code Examples

### Verified Pattern: API Route with Auth + Zod + Save

```typescript
// Source: 03_ARCHITECTURE.md §3.2 — route handler pattern

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const NumerologyInputSchema = z.object({
  fullName: z.string().min(1, 'שם מלא חובה').max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })

  const body = await request.json() as unknown
  const parsed = NumerologyInputSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = calculateNumerologyNumbers({
      fullName: parsed.data.fullName,
      birthDate: parsed.data.birthDate,
    })

    const { data: analysis } = await supabase.from('analyses').insert({
      user_id: user.id,
      tool_type: 'numerology',
      input_data: parsed.data,
      results: result,
      summary: `מספר נתיב חיים: ${result.life_path}`,
    }).select('id').single()

    return NextResponse.json({ data: { ...result, analysis_id: analysis?.id } })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב נומרולוגי' }, { status: 500 })
  }
}
```

### Verified Pattern: useSubscription in Tool Page

```typescript
// Source: 05_GSD_BUILD_BRIEF.md file 71, 02b_GEMS.md GEM 7

const { canUseAnalysis, incrementUsage, isLoading } = useSubscription()

const mutation = useMutation({
  mutationFn: async (data: ToolInput) => {
    if (!canUseAnalysis()) throw new Error('הגעת למגבלת הניתוחים החודשית')
    await incrementUsage()
    const res = await fetch('/api/tools/[tool]', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('שגיאה בביצוע הניתוח')
    return res.json()
  },
})
```

### Verified Pattern: BirthChart ZodiacRing SVG

```typescript
// Source: 02b_GEMS.md GEM 6 — ZODIAC_SIGNS constant + SVG math

import { ZODIAC_SIGNS } from '@/lib/constants/astrology'

interface ZodiacRingProps {
  readonly size?: number  // SVG size, default 500
}

/** טבעת גלגל המזלות — 12 קטעים בצבעי האלמנטים */
export function ZodiacRing({ size = 500 }: ZodiacRingProps) {
  const center = size / 2
  const outerR = center * 0.95
  const innerR = center * 0.78

  return (
    <g>
      {Object.entries(ZODIAC_SIGNS).map(([sign, info], i) => {
        const startAngle = (i * 30 - 90) * (Math.PI / 180)
        const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180)
        const x1 = center + outerR * Math.cos(startAngle)
        const y1 = center + outerR * Math.sin(startAngle)
        const x2 = center + innerR * Math.cos(startAngle)
        const y2 = center + innerR * Math.sin(startAngle)
        // ... path drawing
        return (
          <g key={sign}>
            {/* sector path */}
            <text
              x={center + (outerR + innerR) / 2 * Math.cos((startAngle + endAngle) / 2)}
              y={center + (outerR + innerR) / 2 * Math.sin((startAngle + endAngle) / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
              fill={info.color}
            >
              {info.emoji}
            </text>
          </g>
        )
      })}
    </g>
  )
}
```

### Verified Pattern: GEM 13 Barnum Step

```typescript
// Source: 02b_GEMS.md GEM 13 — mandatory ethical education step

interface BarnumEthicsStepProps {
  readonly onNext: () => void
  readonly onUpdate: (data: { acceptedBarnum: boolean; acceptedTerms: boolean }) => void
}

export function BarnumEthicsStep({ onNext, onUpdate }: BarnumEthicsStepProps) {
  const [accepted1, setAccepted1] = useState(false)  // potentials ≠ destiny
  const [accepted2, setAccepted2] = useState(false)  // terms of service

  const canProceed = accepted1 && accepted2

  return (
    <div>
      <h2>הבנת הניתוחים</h2>
      <p>ניתוחים מבוססים על 2-3+ נקודות מידע ספציפיות שלך</p>
      <p>פוטנציאלים — לא גורל. רצון חופשי וסביבה משחקים תפקיד מרכזי</p>
      <Checkbox
        checked={accepted1}
        onCheckedChange={(v) => {
          setAccepted1(!!v)
          onUpdate({ acceptedBarnum: !!v, acceptedTerms: accepted2 })
        }}
        label="מבין/ה שהניתוחים מצביעים על פוטנציאלים, לא גורל"
      />
      <Checkbox
        checked={accepted2}
        onCheckedChange={(v) => {
          setAccepted2(!!v)
          onUpdate({ acceptedBarnum: accepted1, acceptedTerms: !!v })
        }}
        label="מסכים/ה לתנאי השימוש"
      />
      <Button disabled={!canProceed} onClick={onNext}>המשך</Button>
    </div>
  )
}
```

### Verified Pattern: Recharts Radar (Graphology)

```typescript
// Source: recharts docs — RadarChart for graphology comparison

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend
} from 'recharts'

const data = [
  { metric: 'לחץ עט', current: 75, average: 60 },
  { metric: 'גודל', current: 85, average: 70 },
  { metric: 'נטייה', current: 60, average: 65 },
  { metric: 'ריווח', current: 70, average: 68 },
  { metric: 'קצב', current: 80, average: 72 },
]

<ResponsiveContainer width="100%" height={300}>
  <RadarChart data={data}>
    <PolarGrid />
    <PolarAngleAxis dataKey="metric" />
    <Radar name="שלך" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
    <Radar name="ממוצע" dataKey="average" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
    <Legend />
  </RadarChart>
</ResponsiveContainer>
```

---

## Phase 2 Parallelization Plan

This is the most critical planning finding. Phase 2 has 47 files but strong internal independence.

### Wave Breakdown

**Wave 0 (Setup — must run first, single plan):**
- Onboarding page + OnboardingWizard component → profile upsert
- Dashboard page (real stats + Recharts)
- Home page (ToolGrid + daily insight widget)
- Tarot seed: insert 38+ cards into `tarot_cards` table

**Wave 1 (Independent tools — can all be parallelized, 5 plans):**

| Plan | Tools | Dependencies |
|------|-------|-------------|
| Plan A | Numerology (API + page + NumberCard) | numerology services |
| Plan B | Palmistry (API + page) | upload route + LLM |
| Plan C | Tarot (API + page) | tarot_cards DB |
| Plan D | Graphology (API + page + Comparison + QuickStats) | upload + LLM |
| Plan E | Drawing Analysis (API + page + DigitalCanvas + AnnotatedViewer + KoppitzIndicators + MetricsBreakdown) | drawing/analysis.ts + LLM |

**Wave 2 (Astrology chain — must be sequential within chain):**

| Plan | Tool | Prerequisite |
|------|------|-------------|
| Plan F | Birth Chart (API + page + BirthChart/index + 4 SVG sub-components) | chart.ts, aspects.ts |
| Plan G | Solar Return (API + page) | Birth chart record exists |
| Plan H | Transits (API + page) — REBUILD | Birth chart record exists |
| Plan I | Synastry (API + page) | 2x birth chart calculations |
| Plan J | Readings (API + page + ReadingCard) | Birth chart record exists |

**Wave 3 (Dependent tools — can be parallel after Wave 2):**

| Plan | Tool | Prerequisite |
|------|-------|-------------|
| Plan K | Human Design (API + page) | Birth data (independent of astrology record) |
| Plan L | Dream Analysis (API + page) — async pattern | None |
| Plan M | Compatibility (API + page) | numerology services + birth chart |

**Total: ~13 plans** (Wave 0: 1, Wave 1: 5, Wave 2: 5, Wave 3: 3)

### Which API Routes Use Existing Services vs Need New Logic

| Tool | API Route | Service | New Logic Needed |
|------|-----------|---------|-----------------|
| Numerology | POST /api/tools/numerology | `numerology/*.ts` | None — direct service call |
| Birth Chart | POST /api/tools/astrology/birth-chart | `astrology/chart.ts` | None — direct service call |
| Solar Return | POST /api/tools/astrology/solar-return | `astrology/solar-return.ts` | None — direct service call |
| Transits | POST /api/tools/astrology/transits | `astrology/chart.ts` (reuse) | Yes — real ephemeris for each planet |
| Synastry | POST (no dedicated route — use birth-chart x2) | `astrology/chart.ts` twice | Yes — dual chart comparison + scoring |
| Readings | POST /api/tools/astrology/readings | `astrology/prompts/interpretation.ts` | Yes — READING_TYPES routing |
| Graphology | POST /api/tools/graphology | `services/analysis/llm.ts` | Prompt construction |
| Drawing | POST /api/tools/drawing | `services/drawing/analysis.ts` | Already has LLM prompts |
| Palmistry | POST /api/tools/palmistry | `services/analysis/llm.ts` | Prompt for palm analysis |
| Tarot | POST /api/tools/tarot | Supabase + LLM | Card draw from DB |
| Human Design | POST /api/tools/human-design | LLM-simulated | Centers visualization logic |
| Dream | POST /api/tools/dream | `services/analysis/llm.ts` | Async pattern |
| Compatibility | POST /api/tools/compatibility | `numerology/compatibility.ts` + LLM | Combined score |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded tarot in JSX | DB table (`tarot_cards`) | This phase | Maintainable, admin-editable |
| Mocked transit ephemeris | Real VSOP87 position calculation | This phase | Accurate tool output |
| All astrology in one 922-line file | 5 split SVG components | This phase | Maintainable, testable |
| No onboarding ethics education | Barnum Effect step with 2 checkboxes | This phase | Anti-Barnum by design |
| Hardcoded plan checks | `useSubscription` + `SubscriptionGuard` | Phase 1 (done) | Consistent gating |

**Deprecated/outdated:**
- `calculateTransits/entry.ts` (BASE44): 🔴 REBUILD — score 23/50, fully mocked data. Do not migrate.
- Inline Tarot cards in Tarot.jsx: Move to DB seed script.
- Direct LLM calls in page components: Move to API routes only.

---

## Open Questions

1. **Transits ephemeris scope**
   - What we know: `calculateSunPosition` works for Sun. The VSOP87 simplified formula in `solar-return.ts` gives accurate Sun longitude.
   - What's unclear: Do we need full accuracy for all 10 planets, or is a simplified approach sufficient for v1?
   - Recommendation: For v1, implement simplified planet positions using mean motion calculations (same JD approach as Sun). Real ephemeris (Swiss Ephemeris library) is v2 scope. The original was mocked entirely, so any real calculation is an improvement.

2. **Human Design calculation accuracy**
   - What we know: The original was fully LLM-simulated (no real HD algorithm). HD requires birth time + ephemeris at birth and at "design date" (88 solar degrees before birth).
   - What's unclear: Should v1 use LLM simulation or implement real HD gates (Hexagrams from I Ching mapped to planets)?
   - Recommendation: LLM-simulated for v1 with clear disclosure to user. Real HD algorithm is Phase 5 enhancement. The UI (centers visualization) is the primary deliverable.

3. **Dream image generation**
   - What we know: DALL-E API is available via the existing `llm.ts` wrapper (OpenAI client).
   - What's unclear: Whether image generation is expected in v1 or can be deferred.
   - Recommendation: Include the async pattern with image generation — it's in the original flow (F12 in RE doc) and the fire-and-forget architecture makes it low risk.

4. **Synastry API route**
   - What we know: The build brief lists no dedicated synastry API route — it reuses birth-chart calculations twice.
   - What's unclear: Should synastry have its own route (`POST /api/tools/astrology/synastry`) or call `/birth-chart` twice from the page?
   - Recommendation: Create a dedicated synastry route that accepts 2 person objects and handles both calculations server-side. Calling two API routes from the client is poor UX (double loading state) and exposes more data transfer.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.0 |
| Config file | `vitest.config.ts` (exists, configured) |
| Quick run command | `npx vitest run tests/services/ --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase 2 Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ONBR-01 | OnboardingWizard renders 4 steps, Barnum checkboxes block progression | unit | `npx vitest run tests/components/onboarding.test.tsx` | ❌ Wave 0 |
| ONBR-02 | Dashboard displays stats (mocked Supabase) | smoke | manual browser check | manual |
| ONBR-03 | Home ToolGrid renders all 13 tools | unit | `npx vitest run tests/components/tool-grid.test.tsx` | ❌ Wave 0 |
| TOOL-01 | numerology services calculate correctly (already partially tested) | unit | `npx vitest run tests/services/numerology.test.ts` | ✅ exists |
| TOOL-02 | BirthChart SVG renders without crash, planet positions within bounds | unit | `npx vitest run tests/components/birth-chart.test.tsx` | ❌ Wave 0 |
| TOOL-03 | Solar return finds moment within ±0.01° (service already tested) | unit | `npx vitest run tests/services/astrology.test.ts` | ✅ exists |
| TOOL-04 | Transits return 10 planets with valid longitudes (0-360) | unit | `npx vitest run tests/services/astrology.test.ts` | ✅ exists (extend) |
| TOOL-05 | Synastry returns compatibility score 0-100 | unit | `npx vitest run tests/services/astrology.test.ts` | ✅ exists (extend) |
| TOOL-06 | Readings API returns structured response for each type | smoke | manual API test | manual |
| TOOL-07 | Graphology Comparison renders RadarChart | unit | `npx vitest run tests/components/graphology.test.tsx` | ❌ Wave 0 |
| TOOL-08 | DigitalCanvas mounts without error | unit | `npx vitest run tests/components/drawing.test.tsx` | ❌ Wave 0 |
| TOOL-09 | Palmistry route validates image URL input | unit | `npx vitest run tests/services/llm.test.ts` | ✅ exists |
| TOOL-10 | Tarot draw returns cards from DB | unit | `npx vitest run tests/services/tarot.test.ts` | ❌ Wave 0 |
| TOOL-11 | Human Design page renders centers visualization | smoke | manual browser check | manual |
| TOOL-12 | Dream API returns immediately with status=processing | unit | `npx vitest run tests/services/dream.test.ts` | ❌ Wave 0 |
| TOOL-13 | Compatibility score is weighted sum of numerology+astrology | unit | `npx vitest run tests/services/compatibility.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/services/ --reporter=dot`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green + `tsc --noEmit` 0 errors + `next build` before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/components/onboarding.test.tsx` — covers ONBR-01 (Barnum checkboxes)
- [ ] `tests/components/tool-grid.test.tsx` — covers ONBR-03
- [ ] `tests/components/birth-chart.test.tsx` — covers TOOL-02 SVG rendering
- [ ] `tests/components/graphology.test.tsx` — covers TOOL-07 RadarChart
- [ ] `tests/components/drawing.test.tsx` — covers TOOL-08 DigitalCanvas
- [ ] `tests/services/tarot.test.ts` — covers TOOL-10 DB card draw
- [ ] `tests/services/dream.test.ts` — covers TOOL-12 async pattern
- [ ] `tests/services/compatibility.test.ts` — covers TOOL-13 scoring

---

## Sources

### Primary (HIGH confidence)

- `05_GSD_BUILD_BRIEF.md` — Phase 2 file list (files 90-136), migration matrix
- `02_REVERSE_ENGINEERING.md` — Feature flows (F1-F13), dependency graph (levels 0-6), user flows
- `02b_GEMS.md` — GEM 13 Barnum content, GEM 6 SVG math, GEM 2 numerology logic
- `03_ARCHITECTURE.md` — API standards (§3.2), component architecture (§4.1), DB schema (§2.2)
- `src/services/` (verified via ls) — All computation services confirmed built
- `package.json` (verified 2026-03-20) — All required libraries confirmed installed
- `src/components/features/` (verified via ls) — SubscriptionGuard, UsageBar, PlanCard, ExplainableInsight, ToolGrid, AnalysisHistory confirmed built
- `src/hooks/` (verified via ls) — useSubscription, useAnalytics confirmed built
- `src/lib/validations/` (verified via ls) — All 7 Zod schemas confirmed built
- `src/stores/onboarding.ts` (verified via ls) — Onboarding store confirmed built

### Secondary (MEDIUM confidence)

- `tests/services/numerology.test.ts` — confirmed vitest pattern for service tests
- `vitest.config.ts` — confirmed test infrastructure and path aliases
- `.planning/STATE.md` — confirmed Phase 1 Plan 4 completed, Plans 5-8 pending
- `.planning/phases/01-core-infrastructure/01-05-PLAN.md` — confirmed Zustand onboarding store interface

### Tertiary (LOW confidence)

- Transit ephemeris simplified approach — untested extension of existing VSOP87 Sun calculation to other planets; needs validation during implementation
- Human Design LLM simulation — confirmed from RE doc but accuracy/quality of output is unverified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in package.json, no new installs needed
- Architecture: HIGH — detailed in 03_ARCHITECTURE.md, patterns proven in Phase 1
- Pitfalls: HIGH — derived from source code scores (23/50 mocked transits, 922-line BirthChart), explicit RE doc warnings
- Parallelization plan: HIGH — derived from dependency graph in 02_REVERSE_ENGINEERING.md §3
- Validation architecture: MEDIUM — existing test files confirmed, new test gaps identified

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable architecture, 30-day validity)
**Key caveat:** Phase 1 Plans 05-08 are not yet executed (confirmed by STATE.md: "stopped at Plan 04"). The planner MUST account for this: Phase 2 planning should assume Phase 1 completion OR make Phase 2 Wave 0 explicit about which Phase 1 artifacts must exist before proceeding.
