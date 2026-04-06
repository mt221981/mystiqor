# Phase 31: Backend Stability — Research

**Researched:** 2026-04-07
**Domain:** LLM hardening — usage quota guard, timeout/retry, Hebrew error mapping, Zod LLM validation, DB insert error reporting
**Confidence:** HIGH (all findings verified against live codebase)

---

## Summary

Phase 31 hardens a fully-functional but unprotected LLM call pipeline. The system has 24 tool routes that call `invokeLLM`, 4 coach/learn routes that also call it, and a single shared `invokeLLM` in `src/services/analysis/llm.ts` — which is the only file that needs timeout/retry/error-mapping changes. No usage quota guard exists in any of those routes today.

The `increment_usage` RPC already enforces limits atomically, but it is only called from `/api/subscription/usage` — a standalone route that tool routes do NOT call. The correct fix for STAB-01 is to add a lightweight pre-flight quota check inside `invokeLLM` (or as a shared guard helper called before `invokeLLM`) so no tool route must be individually updated with quota logic.

Three tools (tarot, palmistry, dream) return plain text responses without any `responseSchema`/`zodSchema`, while the response schemas for tarot (`TarotResponseSchema`) and dream (`DreamResponseSchema`) already exist in `src/services/analysis/response-schemas/`. A palmistry schema does NOT exist and must be created.

**Primary recommendation:** All five STAB requirements can be implemented by touching exactly TWO files (a new guard helper + `llm.ts`) plus three route files (tarot, palmistry, dream) for Zod wiring, and a DB-error wrapper pattern applied to all 22 `analyses` inserts.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — zero `any`, zero `@ts-ignore`
- Every function — JSDoc in Hebrew
- Every component — typed Props interface
- Every API route — Zod input validation
- Every DB query — through typed service layer
- Max 300 lines per file
- Naming — camelCase functions, PascalCase components, UPPER_SNAKE constants
- Imports — absolute `@/` paths
- Hebrew labels, errors, placeholders, toasts; date DD/MM/YYYY; currency ₪
- RLS on every Supabase table; server-side validation on all mutations; no secrets in client code

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STAB-01 | בדיקת מכסת שימוש וסטטוס מנוי לפני כל קריאת LLM | Supabase `subscriptions` table has `analyses_used` + `analyses_limit` + `status`; `hasRemainingAnalyses()` helper exists in `plans.ts`; new `checkUsageQuota()` server helper reads subscription row and returns early with 429 before `invokeLLM` is reached |
| STAB-02 | timeout 9s + retry backoff (2 ניסיונות) | OpenAI SDK v4.104 supports `timeout` (ms) and `maxRetries` on client constructor; set `timeout: 9000, maxRetries: 2` when creating `new OpenAI({...})` inside `invokeLLM` |
| STAB-03 | שגיאות OpenAI מתורגמות לעברית | SDK exports typed error classes: `RateLimitError`, `APIConnectionTimeoutError`, `APIConnectionError`, `AuthenticationError`, `InternalServerError`, `BadRequestError`; map each to a Hebrew user message in catch block of `invokeLLM` |
| STAB-04 | ולידציית תגובת LLM עם Zod ב-tarot, palmistry, dream | `TarotResponseSchema` and `DreamResponseSchema` already exist in `response-schemas/`; palmistry schema is missing and must be created; routes must pass both `responseSchema` + `zodSchema` and check `validationResult.success` |
| STAB-05 | כל insert ל-DB נבדק לשגיאה | Currently 22 `analyses` inserts use `const { data: analysis } = ...insert(row).select('id').single()` — the `error` field is destructured away; must destructure `error: insertError` and return Hebrew error if truthy |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `openai` | ^4.104.0 | OpenAI SDK — timeout + retry built-in | Already in use; SDK exposes `timeout` + `maxRetries` constructor options |
| `zod` | ^4.3.6 | Schema validation for LLM responses | Already used everywhere; `safeParse` is the correct non-throwing API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/ssr` | existing | Server client for quota read | Already used via `createClient()` |

**No new packages required.** [VERIFIED: mystiqor-build/package.json]

---

## Architecture Patterns

### Recommended Project Structure for Phase 31 Changes

```
src/
├── lib/utils/
│   └── usage-guard.ts          # NEW — checkUsageQuota() server helper (STAB-01)
├── services/analysis/
│   ├── llm.ts                  # MODIFY — timeout, retry, Hebrew error mapping (STAB-02, STAB-03)
│   └── response-schemas/
│       ├── palmistry.ts        # NEW — PalmistryResponseSchema (STAB-04)
│       └── index.ts            # MODIFY — export PalmistryResponseSchema
└── app/api/tools/
    ├── tarot/route.ts          # MODIFY — add responseSchema + zodSchema (STAB-04)
    ├── palmistry/route.ts      # MODIFY — add responseSchema + zodSchema (STAB-04)
    ├── dream/route.ts          # MODIFY — add responseSchema + zodSchema in backgroundWork (STAB-04)
    └── [22 routes]/route.ts   # MODIFY — add `error: insertError` check on DB insert (STAB-05)
```

### Pattern 1: Usage Quota Guard (STAB-01)

**What:** A server-side helper function that reads the user's subscription from Supabase, checks `analyses_used < analyses_limit` (or `analyses_limit === -1` for unlimited), and returns a standardized error object if the quota is exceeded or the subscription is not active.

**Where it is called:** At the TOP of every tool route's POST handler, AFTER the `auth.getUser()` check and BEFORE any LLM call. The guard reads the `subscriptions` table directly — it does NOT call the `/api/subscription/usage` route (that would be a server-to-server HTTP call, unnecessary since we have direct Supabase access).

**Example:**
```typescript
// src/lib/utils/usage-guard.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { PLAN_INFO } from '@/lib/constants/plans'
import type { PlanType } from '@/types/subscription'

/** תוצאת בדיקת מכסת שימוש */
export type UsageGuardResult =
  | { allowed: true }
  | { allowed: false; response: ReturnType<typeof NextResponse.json> }

/**
 * בודק אם המשתמש רשאי לבצע ניתוח נוסף — מכסה ומנוי פעיל
 * @param supabase - קליינט Supabase בצד השרת
 * @param userId - מזהה המשתמש
 * @returns { allowed: true } או { allowed: false, response } לשליחה חזרה
 */
export async function checkUsageQuota(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UsageGuardResult> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type, status, analyses_used, analyses_limit')
    .eq('user_id', userId)
    .single()

  if (!sub) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'לא נמצא מנוי — אנא צור קשר עם התמיכה' },
        { status: 403 }
      ),
    }
  }

  const activeStatuses = ['active', 'trial'] as const
  if (!activeStatuses.includes(sub.status as typeof activeStatuses[number])) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'המנוי שלך אינו פעיל — אנא חדש אותו כדי להמשיך' },
        { status: 402 }
      ),
    }
  }

  const planInfo = PLAN_INFO[sub.plan_type as PlanType]
  if (planInfo.analyses !== -1 && sub.analyses_used >= sub.analyses_limit) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: `הגעת למגבלת ${sub.analyses_limit} ניתוחים לחודש זה. שדרג את המנוי כדי להמשיך.` },
        { status: 429 }
      ),
    }
  }

  return { allowed: true }
}
```

**Call site in each tool route (right after auth check):**
```typescript
const guard = await checkUsageQuota(supabase, user.id)
if (!guard.allowed) return guard.response
```

### Pattern 2: Timeout + Retry in invokeLLM (STAB-02)

**What:** Set `timeout: 9000` (9 seconds) and `maxRetries: 2` on the OpenAI client constructor. The SDK handles exponential backoff automatically for transient errors (503, connection timeout).

**Key discovery:** The OpenAI SDK v4 has built-in retry with exponential backoff. `maxRetries: 2` means up to 2 retries (3 total attempts). The `timeout` is per-attempt. This matches STAB-02 exactly.

**Change location:** `src/services/analysis/llm.ts` — the `new OpenAI({ apiKey })` constructor call.

```typescript
// Source: OpenAI Node.js SDK v4 docs — constructor options
const openai = new OpenAI({
  apiKey,
  timeout: 9_000,   // 9 שניות לפי דרישת STAB-02
  maxRetries: 2,    // 2 ניסיונות חוזרים עם backoff — STAB-02
})
```

### Pattern 3: Hebrew Error Mapping in invokeLLM (STAB-03)

**What:** Import typed error classes from the OpenAI SDK and map each to a Hebrew user message. The current catch block in `llm.ts` passes the raw error message through, which may expose English OpenAI codes.

**OpenAI SDK error class hierarchy (verified):**
```
OpenAIError
  └── APIError
        ├── APIUserAbortError     (no status)
        ├── APIConnectionError    (no status) ← network/connection failure
        │     └── APIConnectionTimeoutError   ← timeout
        ├── BadRequestError       (400)
        ├── AuthenticationError   (401)
        ├── PermissionDeniedError (403)
        ├── NotFoundError         (404)
        ├── ConflictError         (409)
        ├── UnprocessableEntityError (422)
        ├── RateLimitError        (429) ← too many requests to OpenAI
        └── InternalServerError   (5xx) ← OpenAI server error
```

**Import pattern:**
```typescript
// Source: node_modules/openai/error.d.ts [VERIFIED]
import {
  APIConnectionTimeoutError,
  APIConnectionError,
  RateLimitError,
  InternalServerError as OpenAIInternalServerError,
  AuthenticationError,
} from 'openai'
```

**Mapping table (Hebrew messages for catch block):**
```typescript
function mapOpenAIErrorToHebrew(error: unknown): string {
  if (error instanceof APIConnectionTimeoutError) {
    return 'השרת לא הגיב בזמן — נסה שוב בעוד מספר שניות'
  }
  if (error instanceof APIConnectionError) {
    return 'בעיית חיבור לשרת AI — בדוק את החיבור לאינטרנט ונסה שוב'
  }
  if (error instanceof RateLimitError) {
    return 'שרת ה-AI עמוס כרגע — נסה שוב בעוד מספר דקות'
  }
  if (error instanceof OpenAIInternalServerError) {
    return 'שגיאה זמנית בשרת AI — נסה שוב בעוד מספר דקות'
  }
  if (error instanceof AuthenticationError) {
    return 'שגיאת הגדרות שרת — צור קשר עם התמיכה'
  }
  if (error instanceof SyntaxError) {
    return 'שגיאה בפרסור תשובת AI — תגובה לא תקינה התקבלה'
  }
  const message = error instanceof Error ? error.message : 'שגיאה לא צפויה'
  return `שגיאה בקריאה ל-AI: ${message}`
}
```

### Pattern 4: Zod LLM Validation for tarot/palmistry/dream (STAB-04)

**What:** Pass `responseSchema` (JSON schema for JSON mode) and `zodSchema` (Zod schema for validation) to `invokeLLM`. Check `validationResult.success` and return Hebrew error if false.

**Current state by tool:**

| Tool | Has responseSchema | Has zodSchema | Schema file exists | Action |
|------|-------------------|---------------|-------------------|--------|
| tarot | NO (free-text) | NO | `TarotResponseSchema` ✓ | Add both + check validationResult |
| palmistry | NO (free-text, vision) | NO | MISSING | Create `palmistry.ts` schema + add both |
| dream | NO (free-text, background) | NO | `DreamResponseSchema` ✓ | Add both in backgroundWork |
| numerology | YES (inline) | NO (no zodSchema) | `NumerologyResponseSchema` ✓ | Out of scope for STAB-04 (only tarot/palmistry/dream required) |

**Note on tarot route:** The current `invokeLLM` call for tarot returns a plain text interpretation (no `responseSchema`). To add Zod validation, the tarot prompt and `responseSchema` must be restructured to request a JSON object matching `TarotResponseSchema`. The existing `TarotResponseSchema` expects `summary`, `cards_drawn`, `reading_type`, `insights` — which differs from current tarot prompt output. The planner must decide whether to align the prompt to the existing schema or create a simpler tarot-specific schema that matches the current plain-text output format (object with `interpretation: string`). A minimal approach is to add a simple `z.object({ interpretation: z.string().min(1) })` schema for tarot/palmistry to enforce non-empty string without restructuring the full response.

**Palmistry schema (to create):**
```typescript
// src/services/analysis/response-schemas/palmistry.ts
import { z } from 'zod'

export const PalmistryResponseSchema = z.object({
  interpretation: z.string().min(10),
})
export type PalmistryResponse = z.infer<typeof PalmistryResponseSchema>
```

**Check pattern after invokeLLM:**
```typescript
if (llmResponse.validationResult && !llmResponse.validationResult.success) {
  return NextResponse.json(
    { error: 'תגובת ה-AI לא תקינה — נסה שוב' },
    { status: 500 }
  )
}
```

**Important:** For palmistry/dream, the LLM currently uses free-text (no JSON mode). Adding `responseSchema` switches to JSON mode. The prompts must explicitly request JSON output matching the schema. For vision mode (palmistry), JSON mode works with `gpt-4o`.

### Pattern 5: DB Insert Error Reporting (STAB-05)

**Current problem:** All 22 `analyses` inserts in tool routes destructure only `data`:
```typescript
// CURRENT (broken silently)
const { data: analysis } = await supabase
  .from('analyses')
  .insert(row)
  .select('id')
  .single()
```

The `error` field is discarded. If RLS blocks the insert, the row doesn't save, but the route returns 200 with `analysis_id: null` and the user never knows.

**Fix pattern:**
```typescript
// CORRECT (STAB-05)
const { data: analysis, error: insertError } = await supabase
  .from('analyses')
  .insert(row)
  .select('id')
  .single()

if (insertError) {
  console.error('[tool-name] שגיאת שמירת ניתוח:', insertError)
  return NextResponse.json(
    { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
    { status: 500 }
  )
}
```

**Scope:** This pattern must be applied to all 22 routes that insert into `analyses`. The synthesis route already does `const { data: analysis } =` without error check. The dream route DOES check insert error for the initial `dreams` insert, but NOT for the AI update.

### Anti-Patterns to Avoid

- **Don't call `/api/subscription/usage` from within a tool route** — that's a server-to-server HTTP call. Read the subscription table directly via the existing Supabase client.
- **Don't move the OpenAI client out of invokeLLM** — it's already instantiated inside the function per-call. Timeout/maxRetries must be set at construction time, so keep the `new OpenAI({...})` inside invokeLLM with the new options.
- **Don't use `throw` for LLM validation failure** — `validationResult` is already returned as a value (not thrown) by `invokeLLM`. Each route checks it after the call.
- **Don't add usage guard to coach/learn routes** — STAB-01 scope is tool routes only (the ones that consume user quota). Coach and learn tutor routes (4 files) are out of scope.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timeout per LLM call | Custom AbortController + setTimeout | `timeout` option on OpenAI constructor | SDK handles abort, cleanup, and error type correctly |
| Retry with backoff | Custom loop with `sleep()` | `maxRetries` on OpenAI constructor | SDK implements exponential backoff with jitter per OpenAI docs |
| JSON parse of LLM response | Manual try/catch around JSON.parse | Existing `responseSchema` + `zodSchema` flow in `invokeLLM` | Already works in 13 routes; tarot/palmistry/dream just need to adopt the same pattern |

---

## Current Codebase Inventory

### Tool Routes Calling invokeLLM (24 total)

| Route | Has responseSchema | Has zodSchema | Needs STAB-04 | Notes |
|-------|-------------------|---------------|--------------|-------|
| tarot | NO | NO | YES | Must add; existing TarotResponseSchema can be used or simplified |
| palmistry | NO | NO | YES | Must add; palmistry.ts schema must be created |
| dream (backgroundWork) | NO | NO | YES | Must add inside fire-and-forget closure |
| numerology | YES (inline) | NO | no | Only STAB-05 needed |
| drawing | YES | YES | no | Has both; only STAB-05 needed |
| graphology | YES | YES | no | Has both; only STAB-05 needed |
| synthesis | YES | YES | no | Has both; only STAB-05 needed |
| career | YES | YES | no | Has both; only STAB-05 needed |
| document | YES | YES | no | Has both; only STAB-05 needed |
| relationships | YES | YES | no | Has both; only STAB-05 needed |
| astrology/calendar | YES | YES | no | Has both; only STAB-05 needed |
| astrology/forecast | YES | YES | no | Has both; only STAB-05 needed |
| astrology/synastry | YES | YES | no | Has both; only STAB-05 needed |
| astrology/birth-chart | NO | NO | no | Text only; no Zod — out of STAB-04 scope |
| astrology/interpret | NO | NO | no | Text only; out of scope |
| astrology/readings | NO | NO | no | Text only; out of scope |
| astrology/solar-return | NO | NO | no | Text only; out of scope |
| astrology/transits | NO | NO | no | Text only; out of scope |
| human-design | YES (inline) | NO | no | Inline schema but no zodSchema; out of STAB-04 scope |
| compatibility | NO | NO | no | Text only; out of scope |
| daily-insights | NO | NO | no | Out of scope |
| numerology/compatibility | NO | NO | no | Out of scope |
| timing | NO | NO | no | Out of scope |
| personality | YES (implied) | NO | no | Out of scope |

**STAB-04 scope confirmed:** Only tarot, palmistry, dream per requirements.

### Routes with Usage Guard Gap (STAB-01)

ALL 24 tool routes lack a quota check. The fix goes into a new shared `checkUsageQuota()` helper. Each route must call it immediately after auth check.

**Non-tool invokeLLM callers (out of scope for STAB-01):**
- `coach/journeys/route.ts`
- `coach/messages/route.ts`
- `learn/tutor/astrology/route.ts`
- `learn/tutor/drawing/route.ts`

### DB Insert Error Gap (STAB-05)

| Route | Checks insert error? |
|-------|---------------------|
| dream (initial dreams insert) | YES — `if (insertError \|\| !dream)` |
| daily-insights | YES — `if (insertError)` |
| All 22 others (analyses insert) | NO — error field discarded |

---

## Common Pitfalls

### Pitfall 1: checkUsageQuota Must Return NextResponse, Not Throw
**What goes wrong:** If the guard throws an error instead of returning `{ allowed: false, response }`, the tool route's outer `catch` block converts it to a generic 500 Hebrew error, losing the specific quota-exceeded message.
**Why it happens:** It's tempting to `throw new Error('מכסה נוצלה')` and catch it upstream.
**How to avoid:** The guard helper always returns a discriminated union `{ allowed: true } | { allowed: false, response }`. Route does `if (!guard.allowed) return guard.response`.

### Pitfall 2: JSON Mode Changes the Response Shape for Tarot/Palmistry
**What goes wrong:** Adding `responseSchema` to tarot or palmistry switches OpenAI to JSON mode. If the prompt doesn't explicitly ask for JSON output matching the schema, the model may return unexpected JSON or refuse to answer in vision context.
**Why it happens:** JSON mode works well for text models; vision + JSON mode is less predictable.
**How to avoid:** For palmistry (vision), either keep free-text + wrap in a simple `{ interpretation: z.string() }` schema, OR update the prompt to explicitly request JSON. Testing is required.

### Pitfall 3: dream's backgroundWork Uses a Closure — guard must run in handler, not backgroundWork
**What goes wrong:** The usage quota check cannot be inside `backgroundWork` because `backgroundWork` executes after the HTTP response is already sent (fire-and-forget). If the quota check fails inside the background task, the user has already received `{ dream_id, status: 'processing' }`.
**Why it happens:** The dream route is architecturally special — it saves the dream first, returns immediately, then runs the LLM in the background.
**How to avoid:** The usage guard runs in the main handler BEFORE the initial dream insert and before returning. For the Zod validation in backgroundWork (STAB-04), the route should check `validationResult.success` before updating `ai_interpretation` — if invalid, set `ai_interpretation` to a Hebrew error string or leave null (current behavior already leaves null on exception).

### Pitfall 4: invokeLLM Creates a New OpenAI Client Per Call
**What goes wrong:** The current code creates `new OpenAI({ apiKey })` inside every `invokeLLM` call. This is by design (stateless, no global client). The `timeout` and `maxRetries` options must be set on THIS per-call constructor — not on a shared module-level client.
**Why it happens:** Module-level clients are a common pattern but don't work in Next.js Edge runtime (not applicable here, but explains the current design).
**How to avoid:** Just add `timeout: 9_000, maxRetries: 2` to the existing `new OpenAI({ apiKey })` call.

### Pitfall 5: `analyses_limit` Column vs PLAN_INFO In-Code Limits
**What goes wrong:** The `subscriptions` table has both `analyses_limit` (DB column) and there is `PLAN_INFO` in code. They can drift if plans change. `increment_usage` RPC uses the DB column. The new `checkUsageQuota` guard should also use the DB column (`sub.analyses_limit`, `sub.analyses_used`) rather than calling `PLAN_INFO[sub.plan_type].analyses`, to stay in sync with what the RPC enforces.
**How to avoid:** Use `sub.analyses_used >= sub.analyses_limit` directly from the DB row. Only check `analyses_limit === -1` for unlimited plans (premium/enterprise have -1 in DB).

---

## Code Examples

### invokeLLM — Revised catch block (STAB-02 + STAB-03)

```typescript
// Source: node_modules/openai/error.d.ts [VERIFIED] + SDK constructor docs [VERIFIED]
import {
  APIConnectionTimeoutError,
  APIConnectionError,
  RateLimitError,
  InternalServerError as OpenAIInternalServerError,
  AuthenticationError,
} from 'openai'

// Inside invokeLLM, client construction:
const openai = new OpenAI({
  apiKey,
  timeout: 9_000,   // 9 שניות per STAB-02
  maxRetries: 2,    // 2 retries = 3 total attempts per STAB-02
})

// Catch block:
} catch (error) {
  if (error instanceof SyntaxError) {
    throw new Error('שגיאה בפרסור תשובת AI — התשובה אינה JSON תקין')
  }
  if (error instanceof APIConnectionTimeoutError) {
    throw new Error('שרת ה-AI לא הגיב בזמן — נסה שוב בעוד מספר שניות')
  }
  if (error instanceof APIConnectionError) {
    throw new Error('בעיית חיבור לשרת AI — בדוק את החיבור לאינטרנט ונסה שוב')
  }
  if (error instanceof RateLimitError) {
    throw new Error('שרת ה-AI עמוס כרגע — נסה שוב בעוד מספר דקות')
  }
  if (error instanceof OpenAIInternalServerError) {
    throw new Error('שגיאה זמנית בשרת AI — נסה שוב בעוד מספר דקות')
  }
  if (error instanceof AuthenticationError) {
    throw new Error('שגיאת הגדרות שרת — צור קשר עם התמיכה')
  }
  const message = error instanceof Error ? error.message : 'שגיאה לא צפויה'
  throw new Error(`שגיאה בקריאה ל-AI: ${message}`)
}
```

### Tool Route — Usage Guard Insertion Point (STAB-01)

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. אימות משתמש — קיים בכל route
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // 2. בדיקת מכסת שימוש — חדש, STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // 3. ולידציה של הקלט — קיים
    // 4. קריאת LLM — קיים
    // ...
  }
}
```

### Tarot Route — Adding responseSchema + zodSchema (STAB-04)

The simplest approach that doesn't restructure the prompt: use a minimal Zod wrapper around the existing free-text interpretation:

```typescript
// Option A: Minimal — keep free-text prompt, wrap in object
const TAROT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: { interpretation: { type: 'string' } },
  required: ['interpretation'],
}
const TarotSimpleSchema = z.object({ interpretation: z.string().min(10) })

const llmResponse = await invokeLLM({
  userId: user.id,
  systemPrompt,
  prompt: `...ענה בפורמט JSON עם שדה "interpretation" בלבד.`,
  maxTokens: 1000,
  responseSchema: TAROT_RESPONSE_SCHEMA,
  zodSchema: TarotSimpleSchema,
})

if (llmResponse.validationResult && !llmResponse.validationResult.success) {
  return NextResponse.json({ error: 'תגובת ה-AI לא תקינה — נסה שוב' }, { status: 500 })
}

const aiText = (llmResponse.data as { interpretation: string }).interpretation
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OpenAI SDK v3 (no typed errors) | SDK v4 (typed error classes) | v4 release 2023 | `instanceof RateLimitError` works; old `error.status === 429` check no longer needed |
| Custom retry loops | `maxRetries` on client constructor | SDK v4 | Zero custom retry code needed |
| AbortController for timeout | `timeout` on client constructor | SDK v4 | Zero custom AbortController needed |

---

## Open Questions (RESOLVED)

1. **Tarot prompt restructuring vs minimal schema**
   - RESOLVED: Plan 03 uses minimal `{ interpretation: z.string().min(10) }` schema — validates non-empty without requiring prompt restructure.

2. **Dream backgroundWork Zod validation outcome**
   - RESOLVED: Plan 03 Task 2 sets Hebrew fallback string on Zod failure so polling UI shows feedback.

3. **Does increment_usage need to be called from tool routes?**
   - RESOLVED: Out of scope for Phase 31. The existing client-side call to `/api/subscription/usage` handles increment. The guard only reads.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 31 is pure server-side TypeScript changes (no external tools, CLIs, or runtimes beyond what already runs the app). All dependencies (OpenAI SDK, Supabase, Zod) are already installed and verified.

---

## Validation Architecture

Test suite is explicitly Out of Scope per REQUIREMENTS.md: "Test suite — אין תשתית בדיקות — יוזמה נפרדת." Nyquist validation is therefore not applicable.

**Manual verification protocol for phase gate:**
1. Trigger a tool route with a user who has `analyses_used >= analyses_limit` → expect 429 with Hebrew message, NO OpenAI call made
2. Temporarily set a bad API key → expect `AuthenticationError` mapped to Hebrew message
3. Submit a tarot/palmistry/dream request → verify `analysis_id` is not null (DB insert succeeded)
4. Force a DB insert failure (temporarily break RLS) → expect Hebrew error toast, not silent null
5. TypeScript build: `npx tsc --noEmit` → zero errors

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Supabase `auth.getUser()` already on all routes |
| V3 Session Management | yes | Supabase SSR cookies — already in place |
| V4 Access Control | yes | New quota guard adds subscription-level authorization |
| V5 Input Validation | yes | Zod on all inputs already; Zod on LLM outputs added by STAB-04 |
| V6 Cryptography | no | No new crypto in this phase |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Quota bypass (skip usage check) | Elevation of Privilege | `checkUsageQuota()` runs before `invokeLLM`, cannot be bypassed at route level |
| LLM prompt injection in error messages | Tampering | Errors thrown from invokeLLM are server-controlled strings, not echoing LLM content |
| Raw OpenAI error codes exposed to client | Information Disclosure | Hebrew error mapping in catch block strips raw codes |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Coach and learn routes do NOT need the usage guard (out of STAB-01 scope) | Standard Stack / Scope | Planner should confirm whether coach messages count against quota |
| A2 | `analyses_limit = -1` in DB for premium/enterprise plans (same as PLAN_INFO) | Pattern 1 | If DB has a different sentinel value, the unlimited check breaks |

---

## Sources

### Primary (HIGH confidence)
- `mystiqor-build/src/services/analysis/llm.ts` — current invokeLLM implementation, no timeout/retry, error handling
- `mystiqor-build/src/app/api/tools/tarot/route.ts` — representative tool route; no usage guard, no zodSchema
- `mystiqor-build/src/app/api/tools/numerology/route.ts` — shows responseSchema inline pattern
- `mystiqor-build/src/app/api/tools/palmistry/route.ts` — vision route; no responseSchema
- `mystiqor-build/src/app/api/tools/dream/route.ts` — fire-and-forget LLM pattern; no zodSchema
- `mystiqor-build/src/app/api/subscription/usage/route.ts` — where increment_usage RPC is called
- `mystiqor-build/node_modules/openai/error.d.ts` — OpenAI error class hierarchy [VERIFIED]
- `mystiqor-build/node_modules/openai/core.d.ts` — timeout + maxRetries constructor options [VERIFIED]
- `mystiqor-build/src/services/analysis/response-schemas/` — existing schemas for tarot, dream, palmistry missing [VERIFIED]
- `mystiqor-build/src/types/database.ts` — subscriptions table columns (analyses_used, analyses_limit, status) [VERIFIED]
- `mystiqor-build/src/lib/constants/plans.ts` — PLAN_INFO, hasRemainingAnalyses() [VERIFIED]
- `mystiqor-build/src/types/subscription.ts` — SubscriptionStatus enum: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due' [VERIFIED]
- `mystiqor-build/package.json` — openai@^4.104.0, zod@^4.3.6, next@^16.2.0 [VERIFIED]

### Secondary (MEDIUM confidence)
- OpenAI SDK v4 constructor docs — `timeout` default is 10 minutes; `maxRetries` default is 2 [ASSUMED from SDK defaults in core.d.ts comment]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json and node_modules
- Architecture: HIGH — all insertion points identified in live source files
- Pitfalls: HIGH — derived from direct code reading, not assumptions
- OpenAI error types: HIGH — verified from error.d.ts in installed node_modules

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable stack; OpenAI SDK minor versions may add features but won't break error class names)
