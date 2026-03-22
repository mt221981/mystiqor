# Phase 1: Infrastructure Hardening — Research

**Researched:** 2026-03-22
**Domain:** LLM service layer · Supabase project provisioning · File upload · Atomic counters · Geocoding + timezone
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** User has a Supabase account but no project created yet
- **D-02:** Phase 1 includes creating the Supabase project, running migrations from `supabase/migrations/`, and generating TypeScript types via `supabase gen types`
- **D-03:** The manual `src/types/database.ts` (1012 lines) will be replaced by auto-generated types once the DB is provisioned
- **D-04:** Migration SQL files already exist: `001_schema.sql`, `002_functions.sql`
- **D-05:** Use Zod schema per call site — every invokeLLM call defines its expected response structure
- **D-06:** The existing `forceToString`/`forceToNumber`/`forceToArray` helpers remain as fallbacks for text extraction, but structured JSON responses must be validated against their Zod schema before use
- **D-07:** If a response fails Zod validation, return a typed LLMValidationError (not crash) with the raw response preserved for debugging
- **D-08:** Response schemas are co-located with their service file (e.g., `services/analysis/astrology.ts` defines its own response schemas)
- **D-09:** Existing upload route at `api/upload/route.ts` works (score 44/50). Refinements: add magic-byte validation (not just MIME type), strip EXIF metadata for privacy
- **D-10:** Vercel 4.5MB body limit handled by streaming to Supabase Storage directly — not buffering entire body
- **D-11:** Atomic `increment_usage()` RPC function already works (score 46/50). Tighten the type assertion on RPC result from `as { success: boolean }` to proper Zod parse
- **D-12:** Existing geocoding service uses Nominatim (OpenStreetMap). Add in-memory cache (Map with 1-hour TTL) to reduce API load
- **D-13:** Add timeout handling (5s) — Nominatim can be slow

### Claude's Discretion

- Exact Zod schema shapes for each LLM call site (determined per-service during implementation)
- Whether to add structured logging at this phase or defer
- Cache implementation details (Map vs LRU)
- Error tracking integration (Sentry) timing

### Deferred Ideas (OUT OF SCOPE)

- Rate limiting on API endpoints — Phase 8 (INFRA-07)
- Email service setup — Phase 8 (INFRA-08)
- Sentry/error tracking integration — evaluate during Phase 3
- Structured logging — evaluate during Phase 3
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | LLM service layer with Zod response validation for all 20+ call sites | Zod v4 `.safeParse()` pattern for LLM response validation; `LLMValidationError` typed error; co-location in `services/analysis/response-schemas/` |
| INFRA-02 | File upload service (multipart, magic-byte validation, Supabase Storage routing) | Magic byte signatures for JPEG/PNG/WebP; presigned URL pattern to bypass Vercel 4.5MB limit; EXIF stripping with sharp |
| INFRA-03 | Atomic usage counter (increment_usage DB function with subscription enforcement) | `SELECT FOR UPDATE` in `increment_usage()`; Zod parse of RPC result; race-condition elimination |
| INFRA-04 | Three Supabase client instances (browser, server, admin) correctly used | Already score 48/50 — DO NOT MODIFY; research confirms pattern is correct |
| INFRA-05 | Supabase DB schema provisioned with generated TypeScript types (replace manual database.ts) | `supabase gen types typescript --project-id` command; schema delta (timezone_name, missing tables from ARCHITECTURE.md); migration order |
| INFRA-06 | Geocoding service for birth place → coordinates + timezone | `tz-lookup` npm for IANA timezone from lat/lon; Nominatim does NOT return timezone natively; in-memory Map cache with TTL; 5s AbortController timeout |
</phase_requirements>

---

## Summary

Phase 1 is ~85% already built. All six infrastructure requirements have working implementations with scores of 44-48/50. The work is precision hardening, not building from scratch. Three areas need targeted additions: (1) per-call-site Zod response validation on `invokeLLM`, (2) creating the actual Supabase cloud project and running the existing migrations with a schema delta to fix known issues, and (3) adding an IANA timezone lookup to the geocoding flow.

The critical insight from codebase inspection: `002_functions.sql` implements `increment_usage()` WITHOUT `SELECT FOR UPDATE` — the existing function has a race condition. The architecture doc defines the corrected version with `FOR UPDATE`. This delta is a must-fix. Separately, the existing upload route buffers the entire file body, which will hit Vercel's 4.5MB limit for production images — it needs a new `/api/upload/presign` endpoint to generate Supabase Storage signed URLs for client-direct upload.

**Primary recommendation:** Work in four atomic tasks: (1) Supabase project create + migration + schema delta + gen types, (2) presign route + upload hardening, (3) `invokeLLM` Zod wrapper + response schemas directory, (4) geocoding cache + timeout + timezone. Do not touch the Supabase client files (48/50) under any circumstances.

---

## Standard Stack

### Core (already installed — all in `mystiqor-build/package.json`)

| Library | Version (actual) | Purpose | Status |
|---------|-----------------|---------|--------|
| `zod` | `^4.3.6` | Response schema validation for LLM, RPC result typing | INSTALLED |
| `@supabase/supabase-js` | `^2.99.3` | Storage signed URLs, RPC calls, DB queries | INSTALLED |
| `@supabase/ssr` | `^0.9.0` | Server client for upload presign route | INSTALLED |
| `openai` | `^4.104.0` | LLM calls already go through `invokeLLM` | INSTALLED |

### New Installation Required

| Library | Version | Purpose | Install |
|---------|---------|---------|---------|
| `tz-lookup` | `6.1.25` (original) or `@photostructure/tz-lookup` `11.3.0` | IANA timezone from lat/lon — server-side only | `npm install tz-lookup` |
| `sharp` | latest | EXIF stripping from uploaded images before storage | `npm install sharp` |

**Verified current npm versions (2026-03-22):**
- `@photostructure/tz-lookup`: 11.3.0 (actively maintained — preferred over abandoned `tz-lookup` 6.1.25)
- `sharp`: Check `npm view sharp version` before installing — version changes frequently

**Note on `tz-lookup`:** The original `darkskyapp/tz-lookup` is abandoned (last publish 6 years ago). Use `@photostructure/tz-lookup` which is actively maintained, includes TypeScript types, and has the same API. Size is ~900KB installed (timezone boundary data file) — acceptable for server-side Node.js use. NOT suitable for edge runtime (bundle too large).

**Note on `sharp`:** Sharp uses native binaries. On Vercel, it works in the default Node.js runtime (not Edge). The upload route already runs in Node.js runtime — no change needed.

**Installation:**
```bash
cd mystiqor-build
npm install @photostructure/tz-lookup sharp
npm install --save-dev @types/tz-lookup
```

### Supabase CLI (for project provisioning — global tool)

```bash
npm install -g supabase
# OR
npx supabase --version
```

---

## Architecture Patterns

### Recommended File Additions (minimal footprint)

```
mystiqor-build/src/
├── services/
│   └── analysis/
│       └── response-schemas/       # NEW — Zod schemas per LLM call site
│           ├── index.ts            # Re-exports all schemas
│           ├── astrology.ts        # AstrologyResponseSchema
│           ├── numerology.ts       # NumerologyResponseSchema
│           ├── drawing.ts          # DrawingResponseSchema
│           ├── graphology.ts       # GraphologyResponseSchema
│           ├── tarot.ts            # TarotResponseSchema
│           ├── dream.ts            # DreamResponseSchema
│           ├── question.ts         # QuestionResponseSchema
│           └── career.ts           # CareerResponseSchema
├── app/api/upload/
│   ├── route.ts                    # MODIFY — add magic-byte + EXIF strip
│   └── presign/route.ts            # NEW — signed upload URL endpoint
└── services/
    └── geocode.ts                  # MODIFY — add cache + timeout + timezone
```

### Pattern 1: Zod LLM Response Validation (INFRA-01)

**What:** Every `invokeLLM` call in a service file defines its own Zod schema. After the LLM returns, `safeParse` the response. On failure, return a typed `LLMValidationError` instead of throwing.

**When to use:** Every service file that calls `invokeLLM` with a `responseSchema`.

**Canonical code pattern:**
```typescript
// Source: D-05 through D-08 in CONTEXT.md

// In services/analysis/response-schemas/astrology.ts:
import { z } from 'zod'

export const AstrologyResponseSchema = z.object({
  summary: z.string().min(1),
  insights: z.array(z.object({
    category: z.string(),
    text: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  // ... tool-specific fields
})

export type AstrologyResponse = z.infer<typeof AstrologyResponseSchema>
```

```typescript
// In the API route that calls invokeLLM:
import { AstrologyResponseSchema } from '@/services/analysis/response-schemas/astrology'
import { forceToString } from '@/lib/utils/llm-response'

const llmRaw = await invokeLLM<unknown>({
  userId: user.id,
  systemPrompt,
  prompt,
  responseSchema: AstrologyResponseSchema, // pass the JSON shape hint
})

const parsed = AstrologyResponseSchema.safeParse(llmRaw.data)
if (!parsed.success) {
  // NEVER throw — return degraded result with raw for debugging
  console.error('LLM validation failed', parsed.error.issues) // Note: .issues not .errors (Zod v4)
  const fallbackText = forceToString(llmRaw.data)
  // save with lower confidence_score
}
// Use parsed.data safely
```

### Pattern 2: Signed Upload URL (INFRA-02 — bypass 4.5MB limit)

**What:** Client requests a signed upload URL from the server. Server validates auth and file metadata, then returns a short-lived token. Client uploads directly to Supabase Storage, bypassing Vercel's route handler entirely.

**Flow:**
```
Client → POST /api/upload/presign (metadata: filename, size, type)
  → Server: auth check + size/type validation + magic-byte NOT possible here (no file)
  → Server: supabase.storage.from('uploads').createSignedUploadUrl(path)
  → Client receives: { signedUrl, token, path }
  → Client: supabase.storage.from('uploads').uploadToSignedUrl(path, token, file)
  → Client → POST /api/tools/[tool] with { storageUrl }
  → API route: receives URL, passes to invokeLLM as imageUrls[]
```

**Server route pattern:**
```typescript
// src/app/api/upload/presign/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PresignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const body: unknown = await request.json()
  const parsed = PresignSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'קלט לא תקין' }, { status: 400 })

  const ext = parsed.data.filename.split('.').pop() ?? 'bin'
  const path = `${user.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: 'שגיאה ביצירת URL' }, { status: 500 })

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path })
}
```

**Client upload pattern:**
```typescript
// In a form component — uses browser client
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(/* env vars */)

// Step 1: Get signed URL from server
const presignRes = await fetch('/api/upload/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
})
const { signedUrl, token, path } = await presignRes.json()

// Step 2: Upload directly to Supabase (bypasses Vercel)
const { error } = await supabase.storage
  .from('uploads')
  .uploadToSignedUrl(path, token, file)

// Step 3: Get public URL and submit to tool API
const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
```

### Pattern 3: Magic-Byte Validation (existing upload route refinement)

**What:** Read first 12 bytes of uploaded file buffer and compare against known signatures. More reliable than MIME type header (which user can spoof).

```typescript
// Magic byte signatures
const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png':  [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]],
  // PDF: %PDF = 0x25, 0x50, 0x44, 0x46
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
} as const

/** מוודא שהקובץ תואם לסוג MIME על פי Magic Bytes ראשוניים */
async function validateMagicBytes(file: File, declaredType: string): Promise<boolean> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer.slice(0, 12))
  const signatures = MAGIC_BYTES[declaredType as keyof typeof MAGIC_BYTES]
  if (!signatures) return false
  return signatures.some(sig =>
    sig.every((byte, i) => byte === null || bytes[i] === byte)
  )
}
```

### Pattern 4: EXIF Stripping with Sharp

**What:** Run uploaded images through `sharp` before storing. Sharp strips EXIF by default. Protects user privacy (removes GPS coordinates from photos).

```typescript
// In the existing upload route (or presign confirm route)
import sharp from 'sharp'

// Only for image types, not PDF
if (file.type.startsWith('image/')) {
  const buffer = Buffer.from(await file.arrayBuffer())
  // sharp strips EXIF by default — no extra config needed
  const stripped = await sharp(buffer).toBuffer()
  // Upload stripped buffer instead of original file
  await supabase.storage.from('uploads').upload(path, stripped, {
    contentType: file.type,
    upsert: false,
  })
}
```

### Pattern 5: Atomic increment_usage() with SELECT FOR UPDATE (INFRA-03)

**Critical finding:** The existing `002_functions.sql` does NOT use `SELECT FOR UPDATE`. The architecture doc defines the corrected version. Phase 1 must migrate a fix.

**Corrected function (from ARCHITECTURE.md FIX 8):**
```sql
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_sub subscriptions%ROWTYPE;
BEGIN
  -- FOR UPDATE locks the row — prevents race conditions on concurrent requests
  SELECT * INTO v_sub FROM subscriptions
    WHERE user_id = p_user_id
    FOR UPDATE;  -- CRITICAL: missing from 002_functions.sql

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'No subscription found';
  END IF;

  IF v_sub.analyses_limit != -1 AND v_sub.analyses_used >= v_sub.analyses_limit THEN
    RAISE EXCEPTION 'Usage limit reached';
  END IF;

  UPDATE subscriptions
  SET analyses_used = analyses_used + 1, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_count', v_sub.analyses_used + 1,
    'limit', v_sub.analyses_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**TypeScript: Zod parse of RPC result (D-11):**
```typescript
// Replace `as { success: boolean }` with proper Zod parse
import { z } from 'zod'

const UsageRPCResultSchema = z.object({
  success: z.boolean(),
  new_count: z.number().int().nonnegative(),
  limit: z.number().int(),
})

// In usage/route.ts:
const { data, error } = await supabase.rpc('increment_usage', { p_user_id: user.id })
const result = UsageRPCResultSchema.safeParse(data)
if (!result.success) {
  console.error('Usage RPC returned unexpected shape', data)
  return NextResponse.json({ error: 'שגיאה בעדכון שימוש' }, { status: 500 })
}
return NextResponse.json({ new_count: result.data.new_count, limit: result.data.limit })
```

### Pattern 6: Supabase Project Setup + gen types (INFRA-05)

**Step-by-step workflow:**
```bash
# 1. Create Supabase project via dashboard (UI only — no CLI for project creation)
#    Dashboard: app.supabase.com → New Project

# 2. Link CLI to project
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>

# 3. Run migrations (applies 001_schema.sql + 002_functions.sql)
npx supabase db push

# 4. Generate TypeScript types (replaces src/types/database.ts)
npx supabase gen types typescript --project-id <YOUR_PROJECT_REF> > src/types/database.generated.ts

# 5. After verifying generated types match manual database.ts, update imports
# (manual database.ts is kept as backup until verification passes)
```

**Schema delta — must be applied BEFORE gen types:**
These changes from ARCHITECTURE.md are NOT in the current migration files and must be added as `003_schema_fixes.sql`:

```sql
-- FIX 1: timezone_name replaces timezone_offset (DST-safe)
ALTER TABLE profiles
  DROP COLUMN IF EXISTS timezone_offset,
  ADD COLUMN IF NOT EXISTS timezone_name TEXT DEFAULT 'Asia/Jerusalem';

-- FIX 2: conversations table (for AI Coach phase)
-- Add here to get it into generated types now

-- FIX 3: processed_webhook_events (Stripe idempotency)
-- Add here to get it into generated types now

-- FIX 4: analytics_events (was missing from 001_schema.sql)
-- Add here to get it into generated types now

-- FIX 5: blog_posts RLS public read
-- FIX 6: Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_tool_date ON analyses(user_id, tool_type, created_at DESC);

-- FIX 7: update_updated_at trigger
-- FIX 8: increment_usage with SELECT FOR UPDATE (replaces 002_functions.sql version)
-- FIX 9: reset_monthly_usage with timezone awareness
```

### Pattern 7: Geocoding + Timezone + Cache (INFRA-06)

**Finding:** Nominatim does NOT return timezone information natively. The IANA timezone must be resolved separately using lat/lon coordinates with a lookup library.

**Updated GeocodingResult interface:**
```typescript
export interface GeocodingResult {
  display_name: string
  lat: number
  lon: number
  country_code: string
  timezone_name: string  // NEW — IANA timezone e.g. 'Asia/Jerusalem'
}
```

**Cache + timeout + timezone pattern:**
```typescript
import tzlookup from '@photostructure/tz-lookup'

// In-memory cache — Map with TTL
interface CacheEntry { results: GeocodingResult[]; expiresAt: number }
const geocodeCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function geocodeCity(cityName: string): Promise<GeocodingResult[]> {
  const key = cityName.trim().toLowerCase()
  if (!key) return []

  // Cache hit
  const cached = geocodeCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.results

  // 5 second timeout via AbortController
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const encoded = encodeURIComponent(key)
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=1`

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MasaPnima/1.0 (contact@masapnima.co.il)', 'Accept-Language': 'he,en' },
    })
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`שגיאת גיאוקודינג: ${response.status}`)

    const data = (await response.json()) as NominatimResult[]

    const results: GeocodingResult[] = data.map((item) => {
      const lat = parseFloat(item.lat)
      const lon = parseFloat(item.lon)
      // IANA timezone from coordinates — server-side only
      const timezone_name = tzlookup(lat, lon) ?? 'Asia/Jerusalem'

      return {
        display_name: item.display_name,
        lat,
        lon,
        country_code: item.address?.country_code ?? 'il',
        timezone_name,
      }
    })

    // Cache for 1 hour
    geocodeCache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS })
    return results
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new Error('חיפוש מיקום ארך יותר מדי — נסה שנית')
    }
    throw error
  }
}
```

### Anti-Patterns to Avoid

- **DO NOT import `tz-lookup` in client components** — it bundles timezone boundary data (~900KB), browser will download it.
- **DO NOT use `error.errors` in Zod v4** — the property is `.issues` in v4.
- **DO NOT use `.flatten()` in Zod v4** — deprecated, use `z.treeifyError()` or access `.issues` directly.
- **DO NOT use `z.string().email()` in Zod v4** — use `z.email()` (top-level).
- **DO NOT use `.strict()` or `.passthrough()` on objects in Zod v4** — use `z.strictObject()` or `z.looseObject()`.
- **DO NOT buffer large files in the upload route** — use presign pattern for files > ~1MB.
- **DO NOT modify `src/lib/supabase/*.ts`** — all four files score 48/50, they are correct and locked.
- **DO NOT touch the three Supabase client files** — SSR auth pattern is correctly implemented.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IANA timezone from coordinates | Custom boundary polygon lookup | `@photostructure/tz-lookup` | Timezone boundary GeoJSON is 180MB+ raw; tz-lookup compresses to ~900KB with acceptable accuracy |
| EXIF stripping from images | Custom byte-level EXIF parser | `sharp` (default behavior) | Sharp strips all metadata by default — zero config required; handles JPEG, PNG, WebP correctly |
| LLM response type safety | Custom JSON validator | `zod` `.safeParse()` | Already installed; handles nested objects, arrays, type coercion in one call |
| Atomic DB counter | Application-level check-then-increment | PostgreSQL `SELECT FOR UPDATE` in RPC | Application-level check has a race window; DB transaction lock is the only correct solution |
| Presigned URL expiry tracking | Custom token store | Supabase Storage built-in (2-hour TTL) | Supabase handles token issuance and expiry atomically |

**Key insight:** The platform is ~85% built with correct foundations. The "don't hand-roll" principle in Phase 1 means trusting what exists (Supabase clients, `invokeLLM`, `forceToString` utilities) and adding thin layers (Zod validation, signed URLs, tz-lookup) rather than rebuilding.

---

## Common Pitfalls

### Pitfall 1: increment_usage() Race Condition (CRITICAL — confirmed in source)

**What goes wrong:** Two simultaneous analysis requests pass the usage limit check before either increments the counter. Both succeed. Free users can exceed their 3-analysis limit.

**Why it happens:** The existing `002_functions.sql` uses `SELECT * INTO v_sub FROM subscriptions WHERE user_id = p_user_id` WITHOUT `FOR UPDATE`. This reads a snapshot; another transaction can update between the SELECT and the UPDATE.

**How to avoid:** The corrected function in ARCHITECTURE.md FIX 8 adds `FOR UPDATE`. This must go into `003_schema_fixes.sql` and be applied before any user-facing feature is active.

**Warning signs:** Two consecutive analyses succeed when the user should be at limit. Check with `SELECT analyses_used FROM subscriptions WHERE user_id = X` before and after concurrent requests.

### Pitfall 2: Zod v4 Breaking Changes in Existing Validation Files

**What goes wrong:** The 7 existing validation files in `lib/validations/` were ported from BASE44 which used Zod v3 patterns. Some Zod v4 breaking changes are already applied (e.g., `z.enum(PLAN_TYPES, 'error msg')` in `subscription.ts` uses the new single-param error API). Others may not be.

**Confirmed v3→v4 changes that affect this codebase:**

| v3 Pattern | v4 Replacement | Risk Level |
|------------|----------------|------------|
| `error.errors` | `error.issues` | HIGH — API route error logging |
| `z.string().email()` | `z.email()` | MEDIUM — if used in auth validators |
| `z.string().uuid()` | `z.uuid()` | MEDIUM — UUID fields throughout |
| `.flatten()` | `z.treeifyError()` or `.issues` directly | MEDIUM — error display |
| `.strict()` on objects | `z.strictObject()` | LOW — rarely used |
| `invalid_type_error` / `required_error` params | single `error` param | HIGH — custom error messages |

**Note:** `z.string().min(1)` still works — `.nonempty()` still exists but now returns `string[]` not `[string, ...string[]]` for arrays.

**How to avoid:** Audit ALL files in `lib/validations/` before running them. Check `subscription.ts` line 22: `z.enum(PLAN_TYPES, 'סוג תוכנית לא תקין')` — in Zod v4 the second argument to `z.enum()` is an options object `{ error: '...' }`, not a string. This needs fixing.

### Pitfall 3: Vercel 4.5MB Body Limit for Existing Upload Route

**What goes wrong:** The existing `api/upload/route.ts` calls `request.formData()` which buffers the entire multipart body into memory. Images for graphology/drawing analysis are commonly 2-5MB. This will work on Vercel Hobby/Pro with small images but fails silently or with a 413 error for larger files.

**How to avoid:** Add the presigned URL route (`/api/upload/presign`) and update client-side upload components to use the two-step pattern. The existing `/api/upload` route can be kept for backward compatibility with small files but should not be the primary upload path.

### Pitfall 4: timezone_offset vs timezone_name Schema Mismatch

**What goes wrong:** `001_schema.sql` defines `profiles.timezone_offset INTEGER DEFAULT 7200`. The architecture requires `timezone_name TEXT DEFAULT 'Asia/Jerusalem'`. If the project is provisioned from `001_schema.sql` without the delta migration, the generated TypeScript types will include `timezone_offset` (wrong type) and the geocoding service will write `timezone_name` to a non-existent column.

**How to avoid:** Run `003_schema_fixes.sql` immediately after `supabase db push` (which applies 001 and 002). Verify `timezone_name` exists before running `gen types`. The delta migration uses `ALTER TABLE profiles DROP COLUMN IF EXISTS timezone_offset, ADD COLUMN IF NOT EXISTS timezone_name TEXT DEFAULT 'Asia/Jerusalem'`.

### Pitfall 5: tz-lookup Returns `null` for Ocean Coordinates

**What goes wrong:** `tzlookup(lat, lon)` returns `null` for coordinates in oceans or poorly-mapped areas. Nominatim may geocode a city near a coast to slightly offshore coordinates (floating point rounding). If `timezone_name` is stored as `null`, date-fns operations using the timezone will throw.

**How to avoid:** Always use `tzlookup(lat, lon) ?? 'Asia/Jerusalem'` as fallback. Log the fallback case for monitoring. The default `'Asia/Jerusalem'` is correct for the primary user base (Hebrew-speaking users in Israel).

### Pitfall 6: Sharp is a Native Binary — Build Verification Required

**What goes wrong:** `sharp` uses native Node.js binaries compiled for specific platforms. On Vercel's Linux runtime, the binary installed on Windows dev machines is incompatible. This causes `Error: The specified module could not be found` at runtime on Vercel.

**How to avoid:** Vercel handles this automatically via `npm install` during build — it downloads the correct platform binary. However, if you check in `node_modules/` or use a custom install step, it breaks. Ensure sharp is in `dependencies` (not `devDependencies`) and let Vercel install it fresh.

---

## Code Examples

### Zod v4 Correct Error Handling

```typescript
// Source: https://zod.dev/v4/changelog (verified 2026-03-22)

const result = MySchema.safeParse(data)
if (!result.success) {
  // v4: use .issues NOT .errors
  console.error(result.error.issues)

  // v4: if you need flat error list for UI
  // DON'T use result.error.flatten() — deprecated
  // DO use:
  const flat = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
}
```

### Zod v4 String Validators Migration

```typescript
// Source: https://zod.dev/v4/changelog (verified 2026-03-22)

// v3 (WRONG in v4):
z.string().email()
z.string().uuid()
z.string().url()

// v4 (CORRECT):
z.email()
z.uuid()
z.url()

// Both still work for min/max/regex:
z.string().min(1)  // unchanged
z.string().max(255)  // unchanged
z.string().regex(/^[a-z]+$/)  // unchanged
```

### Supabase gen types Full Workflow

```bash
# Source: https://supabase.com/docs/guides/api/rest/generating-types (verified 2026-03-22)

# Initial setup
npx supabase login  # opens browser for auth
npx supabase link --project-ref abcdefghijklmnop  # from project URL

# Apply migrations
npx supabase db push  # runs all migrations in supabase/migrations/ in order

# Generate types (run from mystiqor-build/)
npx supabase gen types typescript \
  --project-id abcdefghijklmnop \
  > src/types/database.generated.ts

# Verify the generated file
# Compare with existing src/types/database.ts
# Update imports across codebase once verified

# Add to package.json scripts for future use:
# "gen-types": "supabase gen types typescript --project-id $PROJECT_REF > src/types/database.generated.ts"
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Buffer entire file in API route | Presigned URL → client uploads directly to Supabase | Bypasses Vercel 4.5MB limit; scales to 5GB files |
| MIME type check only | Magic bytes + MIME type + size check | Prevents spoofed file type headers |
| `as { success: boolean }` on RPC result | `UsageRPCResultSchema.safeParse(data)` | Full type safety; detects schema drift |
| `timezone_offset INTEGER` (seconds) | `timezone_name TEXT` (IANA) | Handles DST automatically; works with date-fns |
| Manual `database.ts` (1012 lines, hand-authored) | `supabase gen types` (auto-generated from live schema) | Types always match actual DB; no drift |

**Key finding on Nominatim timezone:** Nominatim does NOT return timezone data natively. Some places have `extratags` containing a `timezone` key, but this is inconsistent across OSM data. The reliable approach is `tz-lookup` from lat/lon, which is always available after geocoding.

---

## Open Questions

1. **sharp on Vercel — is it necessary?**
   - What we know: Sharp strips EXIF by default; Vercel supports it in Node.js runtime; native binary is installed during build
   - What's unclear: Whether the EXIF stripping requirement (D-09) is MVP-critical or can be deferred
   - Recommendation: Include it — EXIF on uploaded images is a real privacy risk (GPS in phone photos). Add `sharp` to `dependencies` now.

2. **Migration file numbering for schema delta**
   - What we know: Supabase CLI applies migrations in filename order; current files are `001_schema.sql` and `002_functions.sql`
   - What's unclear: Whether to add delta as `003_schema_fixes.sql` or modify the existing files
   - Recommendation: Create `003_schema_fixes.sql` — never modify applied migrations; this is the standard approach. The delta migration should be idempotent (use `IF EXISTS`, `IF NOT EXISTS`, `CREATE OR REPLACE`).

3. **@photostructure/tz-lookup vs geo-tz accuracy**
   - What we know: geo-tz is more accurate near timezone borders but has a larger footprint; tz-lookup is faster and lighter
   - What's unclear: Whether astrology calculations need exact timezone (they do for accurate birth chart)
   - Recommendation: Use `@photostructure/tz-lookup` for Phase 1. If accuracy complaints emerge from testing birth chart calculations near timezone borders (e.g., a city in Indiana or Russia), switch to `geo-tz`. For Israeli users, tz-lookup returns `Asia/Jerusalem` consistently.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/services/` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | LLM response Zod validation — valid response passes, invalid returns LLMValidationError | unit | `npx vitest run tests/services/llm.test.ts -t "validation"` | Partial — `llm.test.ts` exists, needs new test cases for schema validation |
| INFRA-01 | Zod parse failure returns typed error, does not throw | unit | `npx vitest run tests/services/llm.test.ts -t "schema failure"` | Wave 0 gap |
| INFRA-02 | Upload route rejects files with wrong magic bytes | unit | `npx vitest run tests/services/upload.test.ts` | Wave 0 gap |
| INFRA-02 | Presign route returns signed URL for auth'd user | unit | `npx vitest run tests/services/upload.test.ts` | Wave 0 gap |
| INFRA-03 | increment_usage returns success and new_count | unit | `npx vitest run tests/services/usage.test.ts` | Wave 0 gap |
| INFRA-03 | increment_usage Zod parse validates RPC result shape | unit | `npx vitest run tests/services/usage.test.ts` | Wave 0 gap |
| INFRA-04 | Supabase clients use correct client per context | manual | Code review only — server imports checked with grep | N/A |
| INFRA-05 | generated database.ts compiles without errors | smoke | `npx tsc --noEmit` | Via build |
| INFRA-06 | geocodeCity returns timezone_name for Israeli cities | unit | `npx vitest run tests/services/geocode.test.ts` | Wave 0 gap |
| INFRA-06 | geocodeCity uses cache on second identical call | unit | `npx vitest run tests/services/geocode.test.ts` | Wave 0 gap |
| INFRA-06 | geocodeCity throws readable error on 5s timeout | unit | `npx vitest run tests/services/geocode.test.ts` | Wave 0 gap |

### Sampling Rate

- **Per task commit:** `cd mystiqor-build && npx vitest run tests/services/llm.test.ts tests/services/geocode.test.ts tests/services/upload.test.ts tests/services/usage.test.ts`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** `cd mystiqor-build && npx vitest run && npx tsc --noEmit` — both must pass before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `mystiqor-build/tests/services/upload.test.ts` — covers INFRA-02 (magic bytes, presign, size limit rejection)
- [ ] `mystiqor-build/tests/services/usage.test.ts` — covers INFRA-03 (RPC result Zod parse, usage limit enforcement)
- [ ] `mystiqor-build/tests/services/geocode.test.ts` — covers INFRA-06 (timezone_name, cache hit, timeout error)
- [ ] New test cases in existing `tests/services/llm.test.ts` — covers INFRA-01 schema validation path

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `mystiqor-build/src/services/analysis/llm.ts`, `mystiqor-build/src/app/api/upload/route.ts`, `mystiqor-build/src/services/geocode.ts`, `mystiqor-build/src/app/api/subscription/usage/route.ts`, `mystiqor-build/src/lib/utils/llm-response.ts`, `mystiqor-build/supabase/migrations/002_functions.sql`
- `mystiqor-build/package.json` — exact installed versions
- `.planning/phases/01-infrastructure-hardening/1-CONTEXT.md` — locked decisions
- `.planning/ARCHITECTURE.md` — FIX 8 (SELECT FOR UPDATE), FIX 1 (timezone_name), FIX 3 (webhook events), FIX 6 (composite index)
- [Zod v4 Changelog](https://zod.dev/v4/changelog) — breaking changes verified 2026-03-22
- [Supabase gen types docs](https://supabase.com/docs/guides/api/rest/generating-types) — CLI workflow verified 2026-03-22
- [Supabase createSignedUploadUrl](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) — presign API verified 2026-03-22

### Secondary (MEDIUM confidence)

- [@photostructure/tz-lookup npm](https://www.npmjs.com/package/@photostructure/tz-lookup) — confirmed actively maintained, version 11.3.0
- Magic byte signatures for JPEG/PNG/WebP — cross-verified from multiple sources; these are stable file format specifications

### Tertiary (LOW confidence)

- Sharp EXIF stripping default behavior — stated in multiple articles but should be verified with `sharp(buffer).metadata()` in a test before assuming stripping occurs
- Nominatim `extratags` timezone availability — not verified (Nominatim docs are incomplete on this point; tz-lookup is the safer alternative regardless)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in `package.json`; new additions confirmed on npm
- Architecture: HIGH — patterns derived from existing code + official Supabase/Zod docs
- Pitfalls: HIGH for race condition (confirmed in source SQL), HIGH for Zod v4 (confirmed from official changelog), MEDIUM for sharp native binary (documented Vercel behavior, not directly tested)

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (30 days — all libraries are stable; Zod v4 and Supabase Storage APIs are not fast-moving)
