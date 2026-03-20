# Phase 1: Core Infrastructure - Research

**Researched:** 2026-03-20
**Domain:** Services layer, API skeleton, form components, subscription hooks — typed plumbing for a Next.js 16 + Supabase + LLM platform
**Confidence:** HIGH (architecture fully documented in project files; GEM source code available for inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Services layer — numerology (gematria, calculations, compatibility), astrology (solar return, aspects, chart), drawing analysis, rule engine | GEM 1/2/3/14 source code in `temp_source/`; full logic documented in `02b_GEMS.md` |
| INFRA-02 | LLM invocation wrapper (OpenAI/Anthropic API) with sanitized prompts | Architecture §3.2 defines pattern; `sanitize.ts` (DOMPurify) already exists from Phase 0 |
| INFRA-03 | Geocoding service (Nominatim proxy) | Source logic in `temp_source/base44/functions/geocodeLocation/entry.ts`; IMPROVE migration |
| INFRA-04 | Zod validation schemas for all tool inputs | `zod@4.3.6` installed; `auth.ts`/`profile.ts` schemas exist as patterns |
| INFRA-05 | useSubscription hook with Supabase + optimistic updates (GEM 7) | Full source in `02b_GEMS.md#GEM-7`; PLAN_INFO constants in `src/lib/constants/plans.ts` |
| INFRA-06 | Analytics tracking hooks (page view, tool usage) | `analytics_events` table defined in DB types; no source logic to migrate — build fresh |
| INFRA-07 | Reusable form components (BirthDataForm, LocationSearch, FormInput) | RHF + Zod patterns established; LocationSearch source in `temp_source/src/components/Astrology.jsx` |
| INFRA-08 | SubscriptionGuard component enforcing plan limits | Source in `temp_source/src/components/SubscriptionGuard.jsx`; IMPROVE migration |
| INFRA-09 | ExplainableInsight component with provenance display (GEM 9) | Full pattern in `02b_GEMS.md#GEM-9`; TAG_TRANSLATIONS documented |
| INFRA-10 | API route handlers skeleton (analysis CRUD, subscription, usage, geocode, upload) | Architecture §3.1-3.2 defines every route pattern and response format |
</phase_requirements>

---

## Summary

Phase 1 builds the "plumbing" layer that all Phase 2 tool pages will call. The current repo (after Phase 0) has all types, Supabase clients, constants, auth flow, and layout in place — but the `src/services/` directories are empty, all API routes except `auth/callback` are missing, only `useMobile` and `useDebounce` hooks exist, and the form/feature component directories are empty shells. Phase 1 closes this gap entirely.

The most critical work is migrating GEMs 1, 2, 3, 12, and 14 from the BASE44 Deno source into typed TypeScript service modules. GEM 1 (VSOP87 solar return binary search) is the highest-complexity single file in the project — it involves astronomical math, Julian Date calculations, and a 100-iteration binary search that must port correctly from Deno to Node/TypeScript. GEMs 2/3/14 are lower-risk conversions of well-defined calculation logic. The LLM wrapper (INFRA-02) is the key integration point: it must sanitize prompts, handle both OpenAI and Anthropic, and use `forceToString` (GEM 5, already built) on all responses.

**Primary recommendation:** Build in dependency order — services first (no external dependencies), then validations, then hooks (depend on services + Supabase), then form components (depend on hooks + validations), then API routes (depend on services + validations), then feature components (depend on hooks + API routes). Any deviation causes import errors on `tsc`.

---

## Standard Stack

### Core (Already Installed — Phase 0)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.0 | App Router, API routes, SSR/SSG | Project target stack |
| TypeScript | 5.x strict | Type safety, zero `any` | CLAUDE.md mandate |
| @supabase/supabase-js | 2.99.3 | DB, Auth, Storage, Realtime | Project target stack |
| @supabase/ssr | 0.9.0 | Server-side auth cookies | Required for Next.js App Router |
| @tanstack/react-query | 5.91.2 | Server state, mutations, cache | Project target stack |
| Zod | 4.3.6 | Schema validation | Project target stack (note: v4 API) |
| React Hook Form | 7.71.2 | Form state | Project target stack |
| @hookform/resolvers | 5.2.2 | Zod integration for RHF | Required for Zod + RHF |
| Zustand | 5.0.12 | Client state (onboarding wizard) | Project target stack |
| Framer Motion | 12.38.0 | Animations (animation presets GEM 11) | Already installed |
| date-fns | 4.1.0 | Date formatting | Already installed |
| DOMPurify | 3.3.3 | XSS prevention (prompt sanitization) | Already installed |

### For Phase 1 Specifically — No New Installs Required

All Phase 1 dependencies are already in `package.json`. Phase 1 adds zero new npm packages. Verification:

- LLM wrapper: uses `openai` or `@anthropic-ai/sdk` — **NOT yet installed**. Must add one.
- Email service (3 email templates): uses `resend` — **NOT yet installed**. Must add before email services.
- Geocoding: pure `fetch` to Nominatim (no library needed).
- Astrology/numerology math: pure TypeScript math (no library needed).

**Required installs before writing services:**
```bash
npm install openai
# OR: npm install @anthropic-ai/sdk
npm install resend
```

**Version verification (current as of 2026-03-20):**
- `openai`: v4.x (latest ~4.77) — use v4, not v3 (breaking API changes)
- `resend`: v4.x (latest ~4.0) — React Email templates supported

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| openai SDK v4 | @anthropic-ai/sdk | Architecture shows "OpenAI/Anthropic" — wrapper must abstract both; start with OpenAI |
| Nominatim (free) | Google Maps, Mapbox | Nominatim is free, handles Hebrew, sufficient for city-level geocoding |
| Resend | SendGrid, Nodemailer | Resend has React Email components, Hebrew RTL support, simple API |

---

## Architecture Patterns

### Build Order (Dependency Graph)

Files must be created in this exact order to avoid `tsc` import errors:

```
Wave 1 — Services (pure math, no React, no DB queries at runtime)
  src/services/geocode.ts
  src/services/analysis/llm.ts
  src/services/analysis/rule-engine.ts
  src/services/numerology/gematria.ts
  src/services/numerology/calculations.ts
  src/services/numerology/compatibility.ts
  src/services/astrology/solar-return.ts
  src/services/astrology/aspects.ts
  src/services/astrology/chart.ts
  src/services/astrology/prompts/interpretation.ts
  src/services/astrology/prompts/solar-return.ts
  src/services/astrology/prompts/transits.ts
  src/services/drawing/analysis.ts
  src/services/email/welcome.ts
  src/services/email/payment-failed.ts
  src/services/email/usage-limit.ts

Wave 2 — Validations (pure Zod, no imports from services)
  src/lib/validations/analysis.ts
  src/lib/validations/subscription.ts
  src/lib/validations/goals.ts
  src/lib/validations/mood.ts
  src/lib/validations/journal.ts

Wave 3 — Hooks (depend on Supabase + PLAN_INFO constants)
  src/hooks/useSubscription.ts
  src/hooks/useAnalytics.ts

Wave 4 — Stores (Zustand, depend on types only)
  src/stores/onboarding.ts

Wave 5 — Form Components (depend on validations + hooks)
  src/components/forms/FormInput.tsx
  src/components/forms/LocationSearch.tsx
  src/components/forms/BirthDataForm.tsx

Wave 6 — Feature Components (depend on hooks + types)
  src/components/features/subscription/SubscriptionGuard.tsx
  src/components/features/subscription/UsageBar.tsx
  src/components/features/subscription/PlanCard.tsx
  src/components/features/insights/ExplainableInsight.tsx
  src/components/features/insights/ConfidenceBadge.tsx
  src/components/features/shared/ToolGrid.tsx
  src/components/features/shared/AnalysisHistory.tsx

Wave 7 — API Routes (depend on services + validations)
  src/app/api/geocode/route.ts
  src/app/api/upload/route.ts
  src/app/api/subscription/route.ts
  src/app/api/subscription/usage/route.ts
  src/app/api/analysis/route.ts
  src/app/api/analysis/[id]/route.ts
```

### Pattern 1: Service Module Structure

Services are pure TypeScript modules — no React, no Next.js imports. They export typed async functions that can be called from both API routes and other services.

```typescript
// Source: Architecture §3.2 + CLAUDE.md patterns

/**
 * [Hebrew JSDoc description of what + why]
 */
export async function myServiceFunction(
  input: MyInputType
): Promise<MyOutputType> {
  // validation at call site (not here — caller validates with Zod)
  // pure business logic
  // throw typed errors with Hebrew messages
}
```

**Key rule:** Services do NOT import Supabase clients directly. DB reads/writes happen in API routes (server components), not service functions. Services are stateless calculation engines.

**Exception:** `useSubscription` hook (GEM 7) reads from Supabase via React Query — this is a hook, not a service.

### Pattern 2: API Route Handler

Every API route follows the exact same 5-step structure:

```typescript
// Source: Architecture §3.2

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse + validate input
  const body = await request.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // 3. Business logic (call service)
  try {
    const result = await myService(parsed.data)

    // 4. Persist to DB (if needed)
    const { error: dbError } = await supabase.from('analyses').insert({ ... })
    if (dbError) throw dbError

    // 5. Return typed response
    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
```

### Pattern 3: useSubscription Hook (GEM 7)

The hook is the single source of truth for subscription state. All components that need to gate features import this hook — never read `subscriptions` table directly in components.

```typescript
// Source: 02b_GEMS.md#GEM-7
// Key exports:
const {
  subscription,       // raw DB row
  planInfo,           // PLAN_INFO[plan_type] — name, limits, features
  hasUsageLeft,       // boolean — analyses_used < analyses_limit
  canUseFeature,      // (featureName: string) => boolean
  incrementUsage,     // mutation — calls POST /api/subscription/usage
  isLoading
} = useSubscription()
```

Optimistic update pattern: `incrementUsage` immediately updates local React Query cache, then confirms with server. If server rejects (limit reached), cache is rolled back.

### Pattern 4: Form Component with RTL + Zod

All form components use React Hook Form + Zod resolver with Hebrew error messages. RTL means all inputs need `dir="rtl"` and `text-right` (or `text-start`). Error messages come from the Zod schema, not the component.

```typescript
// Pattern: FormInput wraps shadcn Input + RHF Controller
interface FormInputProps {
  name: string
  label: string           // Hebrew label
  control: Control<FieldValues>
  placeholder?: string    // Hebrew placeholder
  type?: string
  disabled?: boolean
}
```

`BirthDataForm` is a composed form that internally uses `FormInput` + shadcn `DatePicker` + `LocationSearch`. It accepts an RHF `control` prop and registers fields: `fullName`, `birthDate`, `birthTime`, `birthPlace`, `latitude`, `longitude`.

### Pattern 5: GEM Migration — TypeScript Conversion

Each GEM file from `temp_source/` is a Deno server. The conversion removes:
- `Deno.serve(async (req) => {...})` wrapper
- `createClientFromRequest` / `base44` SDK calls
- `base44.integrations.Core.InvokeLLM(...)` calls (replaced by `llm.ts` wrapper)
- `console.log` statements (replaced by logger or removed)

And adds:
- TypeScript interfaces for all parameters and return values
- JSDoc comments in Hebrew
- `export` keyword on all public functions
- Strict operators (`===` not `==`)

### Pattern 6: LLM Wrapper (`services/analysis/llm.ts`)

The wrapper abstracts the LLM provider, handles prompt sanitization, and always uses `forceToString` (already in `lib/utils/llm-response.ts`) on string responses.

```typescript
interface LLMRequest {
  prompt: string
  systemPrompt?: string
  responseSchema?: Record<string, unknown>   // JSON schema for structured output
  imageUrls?: string[]                        // for vision analysis (drawing, palmistry)
  maxTokens?: number
  userId: string                              // for rate limiting / logging
}

interface LLMResponse<T = unknown> {
  data: T
  tokensUsed: number
  model: string
}

export async function invokeLLM<T = unknown>(request: LLMRequest): Promise<LLMResponse<T>>
```

**Sanitization:** Before any user text reaches the prompt, run `sanitize(text)` from `lib/utils/sanitize.ts` (DOMPurify wrapper) to strip HTML/JS injection.

### Pattern 7: SubscriptionGuard Component

Wraps any content and either renders it (if plan allows) or renders a paywall/upgrade prompt. Uses `useSubscription()` internally.

```typescript
interface SubscriptionGuardProps {
  feature: string           // feature name passed to canUseFeature()
  fallback?: React.ReactNode // what to show when blocked (defaults to upgrade card)
  children: React.ReactNode
}
```

### Recommended Project Structure (Phase 1 additions to existing Phase 0)

```
src/
├── services/                    # Wave 1 — all empty, fill in Phase 1
│   ├── geocode.ts
│   ├── analysis/
│   │   ├── llm.ts
│   │   └── rule-engine.ts
│   ├── numerology/
│   │   ├── gematria.ts          # GEM 2
│   │   ├── calculations.ts      # GEM 2
│   │   └── compatibility.ts     # GEM 2
│   ├── astrology/
│   │   ├── solar-return.ts      # GEM 1 (highest risk)
│   │   ├── aspects.ts           # GEM 14
│   │   ├── chart.ts
│   │   └── prompts/
│   │       ├── interpretation.ts # GEM 12
│   │       ├── solar-return.ts
│   │       └── transits.ts
│   ├── drawing/
│   │   └── analysis.ts
│   └── email/
│       ├── welcome.ts
│       ├── payment-failed.ts
│       └── usage-limit.ts
├── lib/validations/
│   ├── analysis.ts              # NEW
│   ├── subscription.ts          # NEW
│   ├── goals.ts                 # NEW
│   ├── mood.ts                  # NEW
│   └── journal.ts               # NEW
├── hooks/
│   ├── useSubscription.ts       # NEW (GEM 7)
│   └── useAnalytics.ts          # NEW
├── stores/
│   └── onboarding.ts            # NEW
├── components/forms/
│   ├── BirthDataForm.tsx         # NEW
│   ├── LocationSearch.tsx        # NEW
│   └── FormInput.tsx             # NEW
├── components/features/
│   ├── subscription/
│   │   ├── SubscriptionGuard.tsx # NEW
│   │   ├── UsageBar.tsx          # NEW
│   │   └── PlanCard.tsx          # NEW
│   ├── insights/
│   │   ├── ExplainableInsight.tsx # NEW (GEM 9)
│   │   └── ConfidenceBadge.tsx   # NEW
│   └── shared/
│       ├── ToolGrid.tsx           # NEW
│       └── AnalysisHistory.tsx    # NEW
└── app/api/
    ├── geocode/route.ts           # NEW
    ├── upload/route.ts            # NEW
    ├── subscription/
    │   ├── route.ts               # NEW (GET status)
    │   └── usage/route.ts         # NEW (POST increment)
    └── analysis/
        ├── route.ts               # NEW (POST create)
        └── [id]/route.ts          # NEW (GET single)
```

### Anti-Patterns to Avoid

- **Raw SQL in components:** Always go through `supabase.from('table')` in API routes or server components, never in client components
- **LLM calls from client:** `invokeLLM` must only ever be called server-side (API routes); OPENAI_API_KEY is server-only
- **Subscription state in useState:** Use `useSubscription()` hook (React Query) not local state; prevents stale plan data
- **Loose equality in rule engine:** Replace all `==` from GEM 3 source with `===` and explicit type coercion
- **Missing auth check in API routes:** Every route handler must start with `getUser()` check before any business logic
- **`any` type escape hatch:** Zod schemas generate the types — use `z.infer<typeof Schema>` everywhere
- **Calling Nominatim without User-Agent:** The original GEM source correctly sets `User-Agent: MasaPnima/1.0`; preserve this in the geocoding service
- **File max 300 lines:** GEM 1 source is 400+ lines — split into `solar-return.ts` (binary search + VSOP87) and `chart.ts` (Placidus houses + chart assembly) as already planned in the file list

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state | Custom useState form | React Hook Form | Handles dirty, touched, validation triggers, submit state |
| Schema validation | Manual type guards | Zod v4 | `z.infer<>` eliminates duplicate type definitions; safeParse gives structured errors |
| Class merging | String concatenation | `cn()` from `lib/utils/cn.ts` | Already built in Phase 0; handles Tailwind merge conflicts |
| LLM response parsing | Custom JSON parser | `forceToString` from `lib/utils/llm-response.ts` | Already built; handles every LLM output shape |
| Date formatting | Manual date logic | date-fns (installed) | Israeli date format (DD/MM/YYYY), timezone-aware |
| Subscription gating | Boolean checks scattered everywhere | `useSubscription().canUseFeature()` | Single source of truth; handles edge cases (trial, cancelled, past_due) |
| Usage increment | Direct DB update | `POST /api/subscription/usage` → `increment_usage()` DB function | Race condition protection via DB-level atomic update |
| HTML sanitization | Manual regex | DOMPurify (already in `lib/utils/sanitize.ts`) | Handles all XSS vectors; regex approaches miss edge cases |
| Toast notifications | Custom snackbar | Sonner (installed, configured in layout) | Already wired up from Phase 0 |

**Key insight:** The custom astronomical math (VSOP87, Julian Date, Placidus) is the domain where we MUST hand-roll, because no npm library implements the exact algorithms with the level of precision and Hebrew-named output structure the prompts expect. For everything else, use the installed stack.

---

## Common Pitfalls

### Pitfall 1: Zod v4 API Changes

**What goes wrong:** Code written with Zod v3 API (`.optional()`, `.nullable()` chaining style, `z.infer`) compiles but `.parse()` / `.safeParse()` behavior differs in edge cases. The project uses `zod@4.3.6`.

**Why it happens:** Zod v4 (released 2025) has breaking changes from v3 — specifically around `.catch()`, `.default()`, and error formatting.

**How to avoid:** Use `parsed.error.flatten()` for error messages (v4 compatible). For union types, use `z.discriminatedUnion()` where possible. Avoid deprecated `z.union([z.literal(...)...])` style for enums — use `z.enum([...])`.

**Warning signs:** TypeScript compiles but runtime `ZodError.flatten()` returns unexpected shape.

### Pitfall 2: GEM 1 — Normalize Function for Circular Values

**What goes wrong:** The VSOP87 solar return binary search converges to wrong date because the `normalize()` function (which wraps longitude values 0-360) is called incorrectly in the comparison logic.

**Why it happens:** Source code in `02b_GEMS.md` lines:
```typescript
if (normalize(sunLon) < normalize(natal_sun_longitude)) {
```
This comparison is only valid if both values are in the same 0-360 range. If `natal_sun_longitude` is already normalized (from initial chart calculation), double-normalizing can corrupt the search direction when the sun is near 0°/360° boundary (Aries).

**How to avoid:** Define `normalize` as `(deg: number): number => ((deg % 360) + 360) % 360`. Apply it once when storing `natal_sun_longitude`, not inside the loop comparisons.

**Warning signs:** Solar return date calculated is exactly 1 year off, or off by ~1 day for Aries/Pisces birth signs.

### Pitfall 3: useSubscription Optimistic Update Race Condition

**What goes wrong:** User clicks a tool button rapidly — `incrementUsage` fires twice before server confirms. Usage count jumps by 2, or worse, the rollback from the second call reverts the first successful update.

**Why it happens:** React Query mutations with `onMutate` optimistic updates need `cancelQueries` to prevent stale reads.

**How to avoid:** In `incrementUsage` mutation config:
```typescript
onMutate: async () => {
  await queryClient.cancelQueries({ queryKey: ['subscription'] })
  const previous = queryClient.getQueryData(['subscription'])
  queryClient.setQueryData(['subscription'], (old) => ({
    ...old,
    analyses_used: (old?.analyses_used ?? 0) + 1
  }))
  return { previous }
},
onError: (err, variables, context) => {
  queryClient.setQueryData(['subscription'], context?.previous)
}
```

**Warning signs:** Usage count increments on failed analyses, or double-counts on fast clicks.

### Pitfall 4: Next.js 16 Route Handler Body Parsing

**What goes wrong:** `await request.json()` throws on GET requests, or throws when body is empty. Also: `request.body` can only be read once.

**Why it happens:** GET requests have no body. Next.js 16 route handlers do not auto-parse — you call `request.json()` manually.

**How to avoid:** For GET routes, read from `request.nextUrl.searchParams`, not `request.json()`. For POST routes, always wrap in try/catch around `request.json()`.

**Warning signs:** `SyntaxError: Unexpected end of JSON input` in production logs.

### Pitfall 5: Nominatim Rate Limiting

**What goes wrong:** Geocoding requests from the API route return 429 Too Many Requests in production because multiple users hit Nominatim simultaneously.

**Why it happens:** Nominatim's usage policy limits to 1 request/second from a single IP. Vercel edge functions all share egress IPs.

**How to avoid:** Add debouncing on the `LocationSearch` component (useDebounce already built in Phase 0 — use 400ms). Cache geocoding results in React Query with `CACHE_TIMES.VERY_LONG` (1 hour). Cache popular Israeli cities in `lib/constants/` as a fallback.

**Warning signs:** `429` errors in server logs during peak usage; users see "לא הצלחנו למצוא את המיקום" errors for valid cities.

### Pitfall 6: RTL Breaks in Form Components

**What goes wrong:** Native `<input>` elements render LTR by default even in an RTL document. Date pickers open calendar on wrong side.

**Why it happens:** HTML inputs inherit `dir` from parent, but browser autocomplete and calendar widgets use system locale, not document direction.

**How to avoid:** Add `dir="rtl"` explicitly on all `<Input>` and `<textarea>` elements in form components. For the calendar (shadcn), use `data-side="bottom"` and verify the DayPicker RTL props. All error message containers need `text-start` not `text-right`.

**Warning signs:** Error messages appear on wrong side; calendar opens below-right instead of below-left.

### Pitfall 7: File Upload — Supabase Storage Bucket Must Exist

**What goes wrong:** `POST /api/upload` returns `StorageError: Bucket not found` in production even though code is correct.

**Why it happens:** Supabase Storage buckets must be created via SQL migration or the Supabase Studio before code can upload to them. The bucket policies (RLS) must also be set.

**How to avoid:** Create an `images` bucket (public read, auth required for write) as part of the DB migration script. The upload route validates file type (whitelist: `image/jpeg`, `image/png`, `application/pdf`) and size (max 10MB) before calling `supabase.storage.from('images').upload(...)`.

**Warning signs:** `Bucket not found` in server logs; upload route returns 500 on first real use.

### Pitfall 8: Supabase `increment_usage` Function Must Exist

**What goes wrong:** `POST /api/subscription/usage` fails with `function increment_usage(uuid) does not exist` because the DB function was defined in the architecture doc but never migrated.

**Why it happens:** The architecture (§2.3) defines PostgreSQL functions `increment_usage`, `reset_monthly_usage`, and `calculate_profile_completion`. These do not auto-create — they require a SQL migration.

**How to avoid:** Verify these functions exist before building the usage API route. If they don't, create a migration file `supabase/migrations/002_functions.sql` with the function definitions from `03_ARCHITECTURE.md §2.3`.

**Warning signs:** Usage increment API route returns 500 on valid calls; `rpc('increment_usage')` error in logs.

---

## Code Examples

### GEM 2 — Hebrew Gematria (verified source in `02b_GEMS.md`)

```typescript
// Conversion: remove Deno wrapper, add TypeScript types

/** מחשב גימטריה עברית עם תמיכה בסופיות ובניקוד */
const GEMATRIA: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400
}

export function cleanHebrewText(text: string): string {
  if (!text) return ''
  return text
    .replace(/[\u0591-\u05C7]/g, '')  // הסרת ניקוד
    .replace(/[״׳־]/g, '')             // הסרת פיסוק עברי
    .replace(/\s+/g, '')               // הסרת רווחים
    .trim()
}

export function reduceToSingleDigit(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num  // Master numbers
  while (num > 9) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0)
  }
  return num
}
```

### GEM 3 — Rule Engine Operator Type (TypeScript improvement)

```typescript
// Source: 02b_GEMS.md#GEM-3 — improvement: discriminated union for operators

type RuleOperator =
  | 'equals' | 'not_equals'
  | 'greater_than' | 'less_than'
  | 'greater_or_equal' | 'less_or_equal'
  | 'contains' | 'in'
  | 'between' | 'starts_with' | 'ends_with'  // extensions

/** מחיל תנאי יחיד על ערך feature */
export function evaluateCondition(
  featureValue: string | number,
  operator: RuleOperator,
  conditionValue: string | number | string[]
): boolean {
  const numericFeature = typeof featureValue === 'number'
    ? featureValue
    : parseFloat(String(featureValue))
  const numericCondition = typeof conditionValue === 'number'
    ? conditionValue
    : parseFloat(String(conditionValue))

  switch (operator) {
    case 'equals': return featureValue === conditionValue
    case 'not_equals': return featureValue !== conditionValue
    case 'greater_than': return numericFeature > numericCondition
    // ... etc (strict === throughout, no ==)
  }
}
```

### API Route Skeleton — Analysis POST

```typescript
// Source: Architecture §3.2 + CLAUDE.md patterns
// Target: src/app/api/analysis/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AnalysisCreateSchema } from '@/lib/validations/analysis'

/** יוצר ניתוח חדש ושומר אותו ב-Supabase */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const body = await request.json()
  const parsed = AnalysisCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert({ user_id: user.id, ...parsed.data })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'שגיאה בשמירת הניתוח' }, { status: 500 })
  }
}
```

### Zustand Onboarding Store

```typescript
// Target: src/stores/onboarding.ts

interface OnboardingState {
  step: 1 | 2 | 3 | 4
  data: {
    fullName: string
    birthDate: string
    birthTime: string
    birthPlace: string
    latitude: number | null
    longitude: number | null
    disciplines: string[]
    acceptedBarnum: boolean
    acceptedTerms: boolean
  }
  setStep: (step: 1 | 2 | 3 | 4) => void
  updateData: (partial: Partial<OnboardingState['data']>) => void
  reset: () => void
}
```

### Zod v4 Validation Schema Pattern

```typescript
// Target: src/lib/validations/analysis.ts
// Note: zod v4 syntax — use z.enum, z.infer

import { z } from 'zod'
import { TOOL_TYPES } from '@/types/analysis'  // from Phase 0

export const AnalysisCreateSchema = z.object({
  tool_type: z.enum(TOOL_TYPES),
  input_data: z.record(z.unknown()),           // JSONB — validated per-tool in service
  results: z.record(z.unknown()),
  summary: z.string().max(2000).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
})

export type AnalysisCreate = z.infer<typeof AnalysisCreateSchema>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Query v4 `cacheTime` | React Query v5 `gcTime` | 2024 | Phase 0 already uses v5 correctly |
| Zod v3 `.errorMap()` | Zod v4 `.check()` custom refinements | 2025 | Use v4 API; v3 `.refine()` still works but `.superRefine()` preferred |
| Next.js 14 `cookies()` sync | Next.js 15+ `cookies()` async | 2025 | Project uses Next.js 16 — `cookies()` must be `await`ed |
| Supabase `createClientComponentClient` | `createBrowserClient` from `@supabase/ssr` | 2024 | Phase 0 already uses new API |
| OpenAI v3 SDK | OpenAI v4 SDK | 2023 | v4 has `openai.chat.completions.create()` — different from v3 |

**Critical:** Next.js 16 changed `cookies()` to be async. The Phase 0 `server.ts` Supabase client wraps this correctly. Any new server code that accesses cookies directly must use `await cookies()`.

---

## Open Questions

1. **LLM Provider Choice**
   - What we know: Architecture says "OpenAI/Anthropic"; both SDKs are available; `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are in `.env.local.example`
   - What's unclear: Which provider is actually configured in the production environment
   - Recommendation: Build the wrapper to support both via an env var switch (`LLM_PROVIDER=openai|anthropic`); default to OpenAI for Phase 1 since gematria/astrology prompts are already tuned for GPT-4

2. **Database Migration Status**
   - What we know: `CONCERNS.md` flags "Actual Supabase tables do not exist in production database" as CRITICAL; `types/database.ts` (989 lines) exists but may be manually written
   - What's unclear: Whether the Supabase DB has been set up since Phase 0 completed (project state says Phase 0 complete with `tsc + build = 0 errors`)
   - Recommendation: Before Wave 3 (hooks that query Supabase), verify tables exist with a quick `supabase.from('subscriptions').select('count').single()` call. If it fails, the DB migration must be run first (this is a blocker for INFRA-05).

3. **Email Template Approach**
   - What we know: Source uses raw HTML strings with `dir="rtl"` inline styles; Resend supports React Email components
   - What's unclear: Whether to use React Email components (better DX, more maintainable) or keep raw HTML strings (closer to source, simpler)
   - Recommendation: Use raw HTML strings for Phase 1 (same as source, lower risk); refactor to React Email in Phase 4 when full email service is built

4. **Header.tsx Logout TODO**
   - What we know: `CONCERNS.md` flags that `Header.tsx` has an empty `onClick` for logout (line 183)
   - What's unclear: Whether this is within Phase 1 scope or Phase 0 cleanup
   - Recommendation: Fix as part of Wave 6 (feature components) — add `signOut()` to `lib/supabase/` and wire it up. This is a 5-line fix that unblocks testing the subscription guard.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (not yet installed — Wave 0 gap) |
| Config file | `vitest.config.ts` — does not exist yet |
| Quick run command | `npx vitest run tests/services/ --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Numerology: gematria calculates correctly for Hebrew input | unit | `npx vitest run tests/services/numerology.test.ts -t gematria` | ❌ Wave 0 |
| INFRA-01 | Numerology: reduceToSingleDigit handles master numbers (11, 22, 33) | unit | `npx vitest run tests/services/numerology.test.ts -t masterNumbers` | ❌ Wave 0 |
| INFRA-01 | Astrology: aspect calculation returns correct orbs | unit | `npx vitest run tests/services/astrology.test.ts -t aspects` | ❌ Wave 0 |
| INFRA-01 | Rule engine: evaluateCondition handles all operators | unit | `npx vitest run tests/services/rule-engine.test.ts` | ❌ Wave 0 |
| INFRA-02 | LLM wrapper: sanitizes prompt before sending | unit | `npx vitest run tests/services/llm.test.ts -t sanitize` | ❌ Wave 0 |
| INFRA-03 | Geocode: returns lat/lon for valid city name | integration | `npx vitest run tests/api/geocode.test.ts` | ❌ Wave 0 |
| INFRA-04 | Zod schemas: reject invalid tool inputs | unit | `npx vitest run tests/validations/analysis.test.ts` | ❌ Wave 0 |
| INFRA-05 | useSubscription: returns plan info from Supabase | unit (mock) | `npx vitest run tests/hooks/useSubscription.test.ts` | ❌ Wave 0 |
| INFRA-05 | useSubscription: incrementUsage optimistic update rolls back on error | unit (mock) | `npx vitest run tests/hooks/useSubscription.test.ts -t rollback` | ❌ Wave 0 |
| INFRA-08 | SubscriptionGuard: blocks render when limit reached | unit | `npx vitest run tests/components/SubscriptionGuard.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/services/ --reporter=dot`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps (must create before tests)

- [ ] `vitest.config.ts` — framework config (install vitest first: `npm install -D vitest @vitejs/plugin-react`)
- [ ] `tests/services/numerology.test.ts` — covers INFRA-01 (gematria + reduceToSingleDigit)
- [ ] `tests/services/astrology.test.ts` — covers INFRA-01 (aspect calculation)
- [ ] `tests/services/rule-engine.test.ts` — covers INFRA-01 (evaluateCondition operators)
- [ ] `tests/services/llm.test.ts` — covers INFRA-02 (sanitization)
- [ ] `tests/validations/analysis.test.ts` — covers INFRA-04 (Zod schemas)
- [ ] `tests/hooks/useSubscription.test.ts` — covers INFRA-05 (React Query mock)
- [ ] `tests/components/SubscriptionGuard.test.tsx` — covers INFRA-08
- [ ] `tests/setup.ts` — shared test setup (vitest globals, mock Supabase client)

**Framework install command:**
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

---

## Sources

### Primary (HIGH confidence)

- `D:/AI_projects/mystiqor-build/02b_GEMS.md` — complete source code for GEMs 1, 2, 3, 7, 9, 12, 14; migration instructions
- `D:/AI_projects/mystiqor-build/03_ARCHITECTURE.md` — full API design, DB schema, route patterns, security design
- `D:/AI_projects/mystiqor-build/05_GSD_BUILD_BRIEF.md` — exact file list, file #50-89, migration actions per file
- `D:/AI_projects/mystiqor-build/.planning/codebase/STACK.md` — verified installed versions
- `D:/AI_projects/mystiqor-build/temp_source/base44/functions/geocodeLocation/entry.ts` — source logic for geocode service
- `D:/AI_projects/mystiqor-build/temp_source/base44/functions/processDrawingFeatures/entry.ts` — source logic for drawing service
- `D:/AI_projects/mystiqor-build/temp_source/base44/functions/sendWelcomeEmail/entry.ts` — source email HTML template

### Secondary (MEDIUM confidence)

- `D:/AI_projects/mystiqor-build/.planning/codebase/CONCERNS.md` — known blockers including empty services, missing API routes, DB migration gap
- `D:/AI_projects/mystiqor-build/.planning/codebase/STRUCTURE.md` — actual current repo state post-Phase 0

### Tertiary (LOW confidence)

- Zod v4 behavior changes: confirmed by stack file showing `zod@4.3.6`; specific edge cases need testing
- Nominatim rate limits: well-known in geocoding community; exact Vercel IP limits unverified

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all versions verified from `STACK.md` and `package.json`; only `openai` and `resend` are missing installs
- Architecture: HIGH — complete API design, DB schema, and component patterns in `03_ARCHITECTURE.md`; source GEM code available in `temp_source/`
- Pitfalls: HIGH for items derived from source code inspection (GEM 1 normalize, optimistic update race); MEDIUM for Nominatim rate limits (known pattern, exact thresholds unverified)
- GEM migrations: HIGH for GEMs 2, 3, 7, 9, 14 (straightforward TS conversion); MEDIUM for GEM 1 (complex astronomical math, normalize boundary edge case)

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable stack; only risk is LLM SDK major version bump)
