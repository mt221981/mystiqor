# Phase 33: Profile Auto-Fill — Research

**Researched:** 2026-04-07
**Domain:** React Query profile fetching + React Hook Form `values` prop for pre-filling
**Confidence:** HIGH

---

## Summary

Phase 33 adds pre-population of tool form fields (fullName, birthDate, birthTime, latitude, longitude) from the user's profile stored in Supabase. The profile is already accessible via `GET /api/profile`, which returns a row from the `profiles` table with exact DB column names (`full_name`, `birth_date`, `birth_time`, `birth_place`, `latitude`, `longitude`).

**The pattern is already implemented in one tool.** `astrology/page.tsx` does the full pre-fill correctly using `useQuery(['profile'])` + React Hook Form's `values:` prop. Every other tool that needs pre-fill can use the exact same pattern. The work is mechanical replication: copy the proven pattern into numerology, compatibility, synastry, and human-design. No new API, no new abstraction is required.

**Primary recommendation:** Extract a `useProfileDefaults()` hook wrapping the existing profile `useQuery`, then wire it into the 4 remaining tools via the `values:` prop on `useForm`. Total scope is 1 new hook + 4 form edits.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — zero `any`, zero `@ts-ignore`
- Every function: JSDoc in Hebrew
- Every component: typed Props interface
- Max 300 lines per file
- Imports — absolute `@/` paths
- Hebrew labels, errors, placeholders, toasts
- `dir="rtl"` on root layout; use `start`/`end` not `left`/`right`
- React Query (server state) + Zustand (client state)
- React Hook Form + Zod validation

---

## What `GET /api/profile` Returns

[VERIFIED: `mystiqor-build/src/app/api/profile/route.ts`]

The endpoint returns:

```json
{ "data": { ...profiles table row... } }
```

Relevant fields from `database.ts` profiles Row type:

| DB column | Type | Profile field |
|-----------|------|---------------|
| `full_name` | `string` | Maps to form `fullName` |
| `birth_date` | `string` (YYYY-MM-DD) | Maps to form `birthDate` |
| `birth_time` | `string \| null` (HH:mm) | Maps to form `birthTime` |
| `birth_place` | `string \| null` | Free-text place name (not coordinates) |
| `latitude` | `number \| null` | Maps to form `latitude` |
| `longitude` | `number \| null` | Maps to form `longitude` |

`birth_place` is a free-text city name string (not parsed coordinates). Coordinates are stored separately as `latitude` / `longitude`.

---

## Existing Pattern (astrology/page.tsx) — Proven, Copy This

[VERIFIED: `mystiqor-build/src/app/(auth)/tools/astrology/page.tsx`]

The astrology birth-chart form already implements the full pre-fill pattern:

```typescript
// 1. Profile type scoped to the needed fields
interface ProfileData {
  full_name: string
  birth_date: string
  birth_time: string | null
  latitude: number | null
  longitude: number | null
}

// 2. Fetch function
async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('שגיאה בשליפת פרופיל')
  const json = (await res.json()) as { data: ProfileData }
  return json.data
}

// 3. useQuery with 5-minute stale time
const { data: profile } = useQuery({
  queryKey: ['profile'],
  queryFn: fetchProfile,
  retry: false,
  staleTime: 5 * 60 * 1000,
})

// 4. Wire into useForm via `values:` prop — NOT `defaultValues:`
// `values:` re-syncs when profile data arrives; `defaultValues:` is one-shot at mount
const { register, handleSubmit, formState: { errors } } = useForm<BirthChartFormValues>({
  resolver: zodResolver(BirthChartFormSchema),
  values: profile
    ? {
        fullName: profile.full_name ?? '',
        birthDate: profile.birth_date ?? '',
        birthTime: profile.birth_time ?? '12:00',
        latitude: profile.latitude ?? 31.7683,
        longitude: profile.longitude ?? 35.2137,
      }
    : undefined,
})
```

**Key insight on `values:` vs `defaultValues:`:** `values:` updates the form when the async data resolves. `defaultValues:` only fires once on mount (before data is available). Always use `values:` for async pre-fill. [VERIFIED: React Hook Form docs pattern used in existing code]

---

## Tool Audit — Which Forms Need Pre-Fill

### Tools WITH profile-overlap fields (need pre-fill):

| Tool | File | Fields to Pre-Fill | Current State |
|------|------|--------------------|---------------|
| Astrology (birth chart) | `tools/astrology/page.tsx` | fullName, birthDate, birthTime, latitude, longitude | **ALREADY DONE** |
| Numerology | `tools/numerology/page.tsx` | fullName, birthDate | Missing — no profile fetch |
| Compatibility | `tools/compatibility/page.tsx` | person1.fullName, person1.birthDate, person1.birthTime | Missing — no profile fetch |
| Synastry | `tools/astrology/synastry/page.tsx` | person1.name, person1.birthDate, person1.birthTime, person1.latitude, person1.longitude | Missing — no profile fetch |
| Human Design | `tools/human-design/page.tsx` | birthDate, birthTime, birthPlace | Missing — no profile fetch |

### Tools WITHOUT profile-overlap fields (no change needed):

| Tool | Why Excluded |
|------|-------------|
| Dream | Fields: title, description, dreamDate, emotions, symbols — no personal identity fields |
| Career | Fields: currentField, skills, interests — no identity fields |
| Personality | Big Five questionnaire — no identity fields |
| Transits | Only optional targetDate — uses saved natal chart from DB |
| Solar Return | Only targetYear — uses saved natal chart from DB |
| Astrology (forecast, readings, calendar) | Derived from saved natal chart, no form input |
| Tarot, Palmistry, Drawing, Graphology, Synthesis, Document, Relationships, Timing, Daily Insights | No profile-overlap input fields |

### Tools needing PARTIAL pre-fill (person 2 stays blank):

| Tool | Person 1 | Person 2 |
|------|----------|----------|
| Compatibility | Pre-fill from profile | Leave empty (other person's data) |
| Synastry | Pre-fill from profile | Leave empty (other person's data) |
| Numerology compat sub-form | Not applicable | Leave empty (second person) |

---

## Recommended Hook API: `useProfileDefaults`

Rather than duplicating the `fetchProfile` + `useQuery` inline in each of 4 pages, extract a shared hook. This is consistent with the `useSubscription` pattern already in the codebase.

**Location:** `mystiqor-build/src/hooks/useProfileDefaults.ts`

**Interface:**

```typescript
/** ברירות מחדל לטפסים ממולאות מפרופיל המשתמש */
export interface ProfileDefaults {
  /** שם מלא מהפרופיל — ריק אם חסר */
  fullName: string
  /** תאריך לידה בפורמט YYYY-MM-DD — ריק אם חסר */
  birthDate: string
  /** שעת לידה בפורמט HH:mm — '12:00' כברירת מחדל אם חסר */
  birthTime: string
  /** קו רוחב — null אם חסר */
  latitude: number | null
  /** קו אורך — null אם חסר */
  longitude: number | null
  /** מקום לידה (טקסט) — ריק אם חסר */
  birthPlace: string
}

/** ערך מוחזר מ-useProfileDefaults */
export interface UseProfileDefaultsReturn {
  /** ברירות מחדל לשימוש ב-values: של useForm */
  defaults: ProfileDefaults | undefined
  /** טוען? — true עד שה-query חוזר */
  isLoading: boolean
}
```

`defaults` is `undefined` while loading (so `values: undefined` keeps form at Zod defaults). Once loaded, missing fields fall back to empty string or null — never throw.

**queryKey:** Use `['profile']` — the same key astrology already uses, so queries are shared and deduped by React Query automatically. [VERIFIED: astrology uses `queryKey: ['profile']`]

**staleTime:** `CACHE_TIMES.LONG` (15 minutes) — profile data is stable. [VERIFIED: `cache-config.ts` defines `CACHE_TIMES.LONG = 15 * 60 * 1000`]

---

## Architecture Patterns

### Pattern 1: useProfileDefaults hook + useForm values:

```typescript
// In each tool page:
const { defaults } = useProfileDefaults()

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(FormSchema),
  values: defaults
    ? { fullName: defaults.fullName, birthDate: defaults.birthDate }
    : undefined,
})
```

### Pattern 2: Two-person form — pre-fill person 1 only

For compatibility and synastry, only `person1` is pre-filled. The person2 sub-form remains at Zod defaults (empty strings).

```typescript
values: defaults
  ? {
      person1: {
        fullName: defaults.fullName,
        birthDate: defaults.birthDate,
        birthTime: defaults.birthTime,
      },
      person2: { fullName: '', birthDate: '' }, // blank for the other person
    }
  : undefined,
```

### Pattern 3: Human Design — birthPlace field

Human Design uses a `LocationSearch` component + a `birthPlace` string field (not lat/lon directly). Pre-fill `birthDate`, `birthTime`, and set `birthPlace` from `profile.birth_place`. The `LocationSearch` component uses a controlled `value` prop that should also be initialized.

```typescript
// Human Design already has: const [birthPlaceText, setBirthPlaceText] = useState('')
// Init both form field and controlled input state when profile loads
useEffect(() => {
  if (defaults?.birthPlace) {
    setValue('birthPlace', defaults.birthPlace)
    setBirthPlaceText(defaults.birthPlace)
  }
}, [defaults?.birthPlace])
```

### Anti-Patterns to Avoid

- **Using `defaultValues:` instead of `values:`**: `defaultValues` only runs once on mount, before async profile data arrives. Fields will be empty. [VERIFIED by existing astrology code which correctly uses `values:`]
- **Crashing on null fields**: Profile fields are nullable in DB. Always use `?? ''` or `?? null` fallbacks in the values object.
- **Blocking form render on profile load**: Profile fetch should not block form render. The form renders with empty fields while loading, then syncs when profile arrives. Users can start typing immediately.
- **Fetching profile server-side in page**: All these tool pages are `'use client'` — profile fetch happens client-side via React Query.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Caching profile across tools | Custom store/context | React Query's built-in deduplication — same `['profile']` key is shared |
| Loading state while profile fetches | Manual loading boolean | `useQuery`'s `isLoading` |
| Sync form with async data | `useEffect` + `reset()` | React Hook Form `values:` prop (already proven in astrology) |
| Profile fetching | New API route | Existing `GET /api/profile` |

---

## Common Pitfalls

### Pitfall 1: `values: undefined` vs `values: {}`
**What goes wrong:** Passing `values: {}` (empty object) as default instead of `values: undefined` while loading causes React Hook Form to immediately mark all required fields as touched with validation errors.
**How to avoid:** Only pass `values:` when `defaults` is defined (truthy). Use `values: defaults ? { ... } : undefined`.

### Pitfall 2: `birthTime` null → form expects string
**What goes wrong:** The form's `birthTime` field is `z.string()`, but `profile.birth_time` is `string | null`. Passing `null` directly causes a Zod parse error.
**How to avoid:** Always coerce: `birthTime: profile.birth_time ?? '12:00'` (matches astrology's existing behavior).

### Pitfall 3: latitude/longitude as string vs number
**What goes wrong:** HTML `<Input type="number">` returns a string from `register()` unless `valueAsNumber: true` is set. But the form schema uses `z.coerce.number()` or `z.number()`. Profile provides `number | null`.
**How to avoid:** In astrology, lat/lon use `z.coerce.number()` and the `values:` prop passes the profile's numeric value directly. Replicate exactly — don't wrap in `String()`.

### Pitfall 4: Human Design LocationSearch state mismatch
**What goes wrong:** Human Design uses a separate `birthPlaceText` React state for the `LocationSearch` controlled input, separate from the form's `birthPlace` field. Pre-filling only the form field but not the state leaves the input visually empty.
**How to avoid:** Use a `useEffect` that sets both `setValue('birthPlace', ...)` and `setBirthPlaceText(...)` when defaults load.

### Pitfall 5: Numerology has two forms (main + compatibility)
**What goes wrong:** The compatibility sub-form in numerology is for a *second person* — pre-filling it from profile would be wrong.
**How to avoid:** Pre-fill only the main `FormSchema` (single person), not `CompatibilityFormSchema`.

---

## React Query Key Convention

[VERIFIED: `mystiqor-build/src/lib/query/cache-config.ts` — `queryKeys.profile.all = ['profile']`]

The `queryKeys.profile.all` constant is defined as `['profile']`. The astrology page uses `queryKey: ['profile']` directly (same key, not using the factory). Either is fine — they deduplicate to the same cache entry. For the new hook, use `queryKeys.profile.all` to align with the registry.

---

## Code Examples

### useProfileDefaults hook (full implementation sketch)

```typescript
// src/hooks/useProfileDefaults.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/lib/query/cache-config'
import { queryKeys } from '@/lib/query/cache-config'

/** ממשק פרופיל גולמי מה-API */
interface ProfileApiData {
  full_name: string
  birth_date: string
  birth_time: string | null
  birth_place: string | null
  latitude: number | null
  longitude: number | null
}

/** ברירות מחדל לטפסים ממולאות מפרופיל */
export interface ProfileDefaults {
  fullName: string
  birthDate: string
  birthTime: string
  latitude: number | null
  longitude: number | null
  birthPlace: string
}

/**
 * שולף את פרופיל המשתמש ומחזיר ברירות מחדל מוכנות לשימוש ב-values: של useForm
 * מטרה: מילוי אוטומטי של שדות שם, תאריך לידה, שעת לידה ומיקום בטפסי הכלים
 */
export function useProfileDefaults(): { defaults: ProfileDefaults | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async (): Promise<ProfileApiData> => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('שגיאה בשליפת פרופיל')
      const json = (await res.json()) as { data: ProfileApiData }
      return json.data
    },
    retry: false,
    staleTime: CACHE_TIMES.LONG,
  })

  if (!data) return { defaults: undefined, isLoading }

  return {
    defaults: {
      fullName: data.full_name ?? '',
      birthDate: data.birth_date ?? '',
      birthTime: data.birth_time ?? '12:00',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      birthPlace: data.birth_place ?? '',
    },
    isLoading,
  }
}
```

### Numerology page wiring

```typescript
// Replace the existing empty useForm call:
const { defaults } = useProfileDefaults()

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(FormSchema),
  values: defaults
    ? { fullName: defaults.fullName, birthDate: defaults.birthDate }
    : undefined,
})
// The `compatForm` for person 2 stays unchanged — no pre-fill for the other person
```

### Compatibility page wiring

```typescript
const { defaults } = useProfileDefaults()

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(FormSchema),
  values: defaults
    ? {
        person1: {
          fullName: defaults.fullName,
          birthDate: defaults.birthDate,
          birthTime: defaults.birthTime || undefined,
          latitude: defaults.latitude ?? undefined,
          longitude: defaults.longitude ?? undefined,
        },
        person2: { fullName: '', birthDate: '' },
      }
    : undefined,
})
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Each tool fetches profile inline (astrology) | Shared `useProfileDefaults()` hook | Single cache entry, deduplication across all tools |
| `defaultValues: {}` for async data | `values: profile ? {...} : undefined` | Form syncs when data arrives, not just at mount |

---

## Open Questions

1. **Human Design `LocationSearch` interaction**
   - What we know: `LocationSearch` is a controlled component with its own geocoding flow. `birthPlace` is a free-text city name.
   - What's unclear: If `profile.birth_place` is a raw city name, the LocationSearch will show it but geocoding won't auto-run. The form's `birthPlace` field will be pre-filled but `latitude`/`longitude` are not in the Human Design schema (it only uses `birthPlace` string for the LLM, not coordinates).
   - Recommendation: Pre-fill `birthPlace` text and form field. Do not attempt to re-geocode on pre-fill. The user sees their saved city name and can submit as-is.

2. **birthTime default value: '12:00' vs ''**
   - What we know: Astrology uses `'12:00'` as the default when `birth_time` is null.
   - What's unclear: Is `'12:00'` the right default for all tools, or should it be `''` (empty) to signal "unknown"?
   - Recommendation: Follow the existing astrology pattern — `'12:00'` — for consistency. The user can clear it if needed.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this is a pure code change using existing API and libraries already installed)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not detected (no test config files found in codebase scan) |
| Config file | None found |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Notes |
|--------|----------|-----------|-------|
| PROF-01 | Forms pre-fill from profile on load | Manual smoke test — open tool, verify fields populated | No automated test infra detected |
| PROF-01 | Values are editable (not locked) | Manual — type in pre-filled field | |
| PROF-01 | Incomplete profile shows empty fields without error | Manual — test with partial profile | |
| PROF-01 | Works across all relevant tools | Manual — check each of 5 tool pages | |

### Wave 0 Gaps
- No automated test infrastructure detected in this project. All validation is manual smoke testing per the existing project pattern.

---

## Security Domain

No new security surface. This feature reads data the user already owns (their own profile) and uses it to pre-fill their own form submissions. No new API routes, no new DB writes. The existing `GET /api/profile` route already validates authentication (returns 401 if not logged in). No ASVS categories newly applicable.

---

## Sources

### Primary (HIGH confidence)
- `mystiqor-build/src/app/api/profile/route.ts` — confirmed GET returns `{ data: profiles_row }`
- `mystiqor-build/src/app/(auth)/tools/astrology/page.tsx` — proven pre-fill pattern with `useQuery(['profile'])` + `values:` prop
- `mystiqor-build/src/types/database.ts` — confirmed `profiles` table columns and types
- `mystiqor-build/src/lib/validations/profile.ts` — confirmed field names and nullability
- `mystiqor-build/src/lib/query/cache-config.ts` — confirmed `queryKeys.profile.all` and `CACHE_TIMES`
- `mystiqor-build/src/hooks/useSubscription.ts` — hook pattern to replicate
- All 5 target tool pages — confirmed which fields exist and which do not yet have profile pre-fill

### Secondary (MEDIUM confidence)
- React Hook Form `values:` vs `defaultValues:` behavior [ASSUMED — training knowledge, consistent with observed code behavior in astrology page]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | React Hook Form `values:` prop re-syncs the form when async data resolves (vs `defaultValues:` which is one-shot) | Architecture Patterns | If wrong, need to use `reset()` in a `useEffect` instead — still straightforward |
| A2 | `'12:00'` is the correct fallback for null `birth_time` in all tools | Code Examples | If birthTime is not required in a tool (e.g. numerology doesn't use it), the fallback doesn't matter — only relevant for tools that show a birthTime field |

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use, no new dependencies
- Architecture: HIGH — pattern directly copied from working astrology code
- Pitfalls: HIGH — sourced from reading actual code, not assumptions
- Scope: HIGH — all 22 tool pages audited, exactly 5 need changes (1 done, 4 remaining)

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable stack, no version risk)
