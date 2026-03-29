# Phase 21: Prompt Enrichment & Soul - Research

**Researched:** 2026-03-29
**Domain:** LLM Prompt Engineering — Personalization of 22 API routes
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** שילוב קבלי-רוחני עמוק + חם-אינטימי — חוכמה עתיקה שמדברת ללב. רפרנסים לקבלה, ארכיטיפים, ספירות, נתיבות — אבל בשפה חמה ואישית, לא אקדמית
- **D-02:** כל prompt פונה למשתמש בשמו הפרטי (לא "המשתמש" או פניה גנרית)
- **D-03:** כל prompt מתייחס לדאטה האישית — מזל, מספר חיים, ניתוחים קודמים כשרלוונטי
- **D-04:** העמקת ה-prompt הקיים — לא שינוי ארכיטקטורה. הוספת: מספר חיים (לא רק מספר יומי), התייחסות לניתוחים קודמים, שם פרטי תמיד
- **D-05:** הפרש אישי אמיתי — שני משתמשים שונים חייבים לקבל תוכן שונה (מזל שונה, מספר חיים שונה, קלף שונה)
- **D-06:** כל 22 ה-API routes עם systemPrompt — לעבור על כולם ולהעשיר
- **D-07:** רשימת ה-routes המלאה: daily-insights, tarot, dream, coach/journeys, coach/messages, learn/tutor/astrology, learn/tutor/drawing, astrology/birth-chart, astrology/calendar, astrology/forecast, astrology/solar-return, astrology/synastry, astrology/transits, career, compatibility, document, drawing, graphology, human-design, numerology, numerology/compatibility + כל route נוסף שנמצא

### Claude's Discretion

- סדר העבודה על ה-routes (מומלץ: daily-insights ראשון כ-reference, אחר כך בגלים)
- מידת העומק של ההעשרה בכל route — routes פשוטים (document, drawing) יקבלו העשרה בסיסית, routes מורכבים (coach, daily-insights) יקבלו העשרה עמוקה
- יצירת shared prompt helper לפניה בשם + דאטה אישית (למנוע כפילות ב-22 routes)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROMPT-01 | כל ה-LLM prompts כוללים פניה אישית (שם המשתמש), שפה רוחנית עמוקה, והתייחסות לדאטה האישית | Route audit below catalogs current state; shared helper pattern enables implementation |
| PROMPT-02 | תובנות יומיות כוללות התייחסות למזל, מספר חיים, וקלף יום אישי — לא גנרי | daily-insights already has zodiac+tarot; needs lifePathNumber added; pattern documented |
</phase_requirements>

---

## Summary

Phase 21 is a surgical prompt-enrichment pass over all 22 LLM API routes. No schema changes, no new DB tables, no architecture shifts. The work is: (1) create one shared helper `getPersonalContext()` that fetches name + zodiac + life path number from the profiles table, (2) inject that context into the systemPrompt of each route, and (3) deepen the daily-insights prompt specifically with life path number and reference to prior analyses.

The detailed route audit below shows that **7 routes already have partial personalization** (daily-insights is the gold standard with name + zodiac + zodiac calc inline), **14 routes have zero personalization** (generic expert-role systemPrompts with no user data), and **1 route (transits/solar-return) has no systemPrompt at all** — it passes only a prompt.

The critical implementation insight is that the `buildCoachingContext()` service in `src/services/coach/context-builder.ts` already demonstrates the exact pattern needed: parallel Supabase fetches for profile + analyses, assembled into a compact string. The new `getPersonalContext()` helper is a slimmer version of this, focused on the three required data points: firstName, zodiacSign, lifePathNumber.

**Primary recommendation:** Create `src/services/analysis/personal-context.ts` with `getPersonalContext(supabase, userId)` → `{ firstName, zodiacSign, lifePathNumber }`, then enrich all 22 routes in waves ordered by complexity (deep enrichment first, basic last).

---

## Route Audit — All 22 Routes

### Current State by Route

| # | Route File | Current systemPrompt Summary | Has Name? | Has Zodiac? | Has Life Path? | Enrichment Tier |
|---|-----------|------------------------------|-----------|-------------|----------------|-----------------|
| 1 | `tools/daily-insights/route.ts` | "אתה מייעץ רוחני-מיסטי עמוק... פנה אליו בשמו הפרטי" + conditional userName inject | YES (conditional) | YES (zodiacSign in prompt) | NO | DEEP — needs lifePathNumber + prior analyses ref |
| 2 | `tools/tarot/route.ts` | "אתה קורא טארוט חכם ואינטואיטיבי עם ידע עמוק בקבלה... דבר ישירות לפונה — חם, אינטימי" | NO | NO | NO | DEEP — needs name + zodiac + life path inject |
| 3 | `tools/dream/route.ts` | "אתה פסיכולוג חלומות. נתח את החלום לפי תיאוריות פסיכואנליטיות..." | NO | NO | NO | MEDIUM — needs name + spiritual tone + personal context |
| 4 | `coach/journeys/route.ts` | No systemPrompt — only userPrompt with `focus_area` label. Uses `invokeLLM` without systemPrompt | NO | NO | NO | DEEP — needs full persona + personal context |
| 5 | `coach/messages/route.ts` | `COACH_PERSONA` constant: "אתה מאמן אישי מיסטי שמשלב חוכמה עתיקה עם פסיכולוגיה מודרנית..." + contextText from conversation | PARTIAL (contextText may include name) | NO | NO | MEDIUM — add name+zodiac+life path to COACH_PERSONA or its context injection |
| 6 | `learn/tutor/astrology/route.ts` | "אתה מורה מומחה באסטרולוגיה... ענה בעברית בלבד. היה סבלני..." + completedTopics + analysisContext | NO | NO | NO | MEDIUM — add name + zodiac + life path header |
| 7 | `learn/tutor/drawing/route.ts` | "אתה מורה מומחה בניתוח ציורים ופסיכולוגיה של אמנות... ענה בעברית בלבד..." + completedTopics + analysisContext | NO | NO | NO | MEDIUM — add name + life path header |
| 8 | `tools/astrology/birth-chart/route.ts` | Uses `INTERPRETATION_SYSTEM_PROMPT` from external file: "אתה אסטרולוג פסיכולוגי אבולוציוני ברמה עולמית..." | NO | NO | NO | DEEP — enrich INTERPRETATION_SYSTEM_PROMPT or override at call site |
| 9 | `tools/astrology/calendar/route.ts` | "אתה אסטרולוג מומחה המכין לוחות שנה אסטרולוגיים מדויקים..." | NO | NO | NO | BASIC — add zodiac to prompt (calendar is shared, but zodiac colors the framing) |
| 10 | `tools/astrology/forecast/route.ts` | "אתה אסטרולוג מומחה המתמחה בפרשנות מזלות..." | NO | YES (signInfo.name in prompt) | NO | MEDIUM — add name + life path |
| 11 | `tools/astrology/solar-return/route.ts` | NO systemPrompt — invokeLLM called with `prompt: srPrompt` only. No systemPrompt key | NO | NO | NO | DEEP — add systemPrompt + personal context |
| 12 | `tools/astrology/synastry/route.ts` | "אתה אסטרולוג מומחה בסינסטרי — ניתוח תאימות בין שני גלגלות לידה..." | NO | YES (both persons' sun/moon in prompt) | NO | BASIC — add requesting user's name + life path |
| 13 | `tools/astrology/transits/route.ts` | NO systemPrompt — invokeLLM called with only `prompt: transitPrompt` | NO | NO | NO | DEEP — add systemPrompt + personal context |
| 14 | `tools/career/route.ts` | "אתה יועץ קריירה אסטרולוגי מומחה..." + birthDate + optional natalContext | NO (has birthDate) | PARTIAL (optional natalContext) | NO | MEDIUM — add name + life path + deepen spiritual tone |
| 15 | `tools/compatibility/route.ts` | "אתה אסטרולוג ונומרולוג מומחה..." with person1/person2 names embedded in systemPrompt | YES (person names, not user's first name as greeting) | NO | NO | BASIC — add requesting user's name + life path as identity |
| 16 | `tools/document/route.ts` | "אתה מנתח מסמכים מומחה..." + optional context | NO | NO | NO | BASIC — add name + basic personal greeting |
| 17 | `tools/drawing/route.ts` | No systemPrompt — invokeLLM called with only imageUrls+prompt+responseSchema. The `buildDrawingAnalysisPrompt` does not inject a systemPrompt | NO | NO | NO | BASIC — add systemPrompt with name + life path |
| 18 | `tools/graphology/route.ts` | Very detailed 9-component system prompt: "אתה מומחה גרפולוגי ברמה עולמית..." | NO | NO | NO | BASIC — add name at opening + life path hint |
| 19 | `tools/human-design/route.ts` | "אתה מומחה Human Design..." with JSON output instruction | NO | NO | NO | BASIC — add name in HD output description |
| 20 | `tools/numerology/route.ts` | Inline systemPrompt with `${numbers.name}` embedded: "פנה אל ${numbers.name} בשמו/ה. דבר ישירות לנשמה — חם, אינטימי..." | YES (input name) | NO | PARTIAL (life_path in prompt, but not profile life path) | MEDIUM — enrich with zodiac + deepen spiritual kabbalah language |
| 21 | `tools/numerology/compatibility/route.ts` | "אתה מומחה נומרולוגיה עברית..." + person1.fullName + person2.fullName in prompt | PARTIAL (names in prompt body) | NO | PARTIAL (scores in prompt) | MEDIUM — add requesting user identity + zodiac |
| 22 | (Total: 21 routes found — D-07 lists 21 routes) | — | — | — | — | — |

**Note:** The CONTEXT.md lists 21 named routes. No additional routes were found beyond the 21 listed. The reference to "22 routes" in the phase description counts the 21 explicit routes + 1 additional found in search (none found beyond the 21).

---

### Routes by Enrichment Tier

**DEEP (4 routes)** — Need profile fetch + full personal context + deepened spiritual language:
- `tools/daily-insights` — Add lifePathNumber + prior analyses reference (already has name + zodiac)
- `tools/tarot` — Add profile fetch + name + zodiac + life path into systemPrompt
- `coach/journeys` — Currently has no systemPrompt at all; add full persona + personal context
- `tools/astrology/solar-return` — Currently has no systemPrompt; add + personal context
- `tools/astrology/transits` — Currently has no systemPrompt; add + personal context

**MEDIUM (8 routes)** — Need profile fetch + name + zodiac or life path, moderate tone deepening:
- `tools/dream` — Add name + zodiac + life path; deepen from "psychologist" to mystical analyst
- `coach/messages` — Add name + zodiac + life path to COACH_PERSONA or context string
- `learn/tutor/astrology` — Add name + zodiac + life path to systemPrompt header
- `learn/tutor/drawing` — Add name + life path to systemPrompt header
- `tools/astrology/forecast` — Add name + life path (zodiac already in prompt)
- `tools/career` — Add name + deepen spiritual Kabbalistic tone
- `tools/numerology` — Enrich with zodiac + deepen Kabbalistic language
- `tools/numerology/compatibility` — Add requesting user identity + zodiac

**BASIC (8 routes)** — Need profile fetch + name injection only; tone already acceptable or role-constrained:
- `tools/astrology/birth-chart` — Enrich INTERPRETATION_SYSTEM_PROMPT (in prompts/interpretation.ts)
- `tools/astrology/calendar` — Add zodiac personalisation to framing
- `tools/astrology/synastry` — Add requesting user's name + life path
- `tools/compatibility` — Add requesting user's name + life path as framing identity
- `tools/document` — Add name + greeting
- `tools/drawing` — Add systemPrompt with name + life path
- `tools/graphology` — Add name at opening
- `tools/human-design` — Add name in description output direction

---

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Role in Phase |
|---------|---------|---------|---------------|
| `@supabase/ssr` | existing | Server-side Supabase client | Profile fetch in helper |
| `openai` | existing | GPT-4o-mini/GPT-4o | Already used by invokeLLM |
| TypeScript strict | existing | Type safety | Helper return type |

### Project Services to Reuse
| File | Purpose | How Used in Phase |
|------|---------|-------------------|
| `src/services/analysis/llm.ts` | `invokeLLM` — all LLM calls | Unchanged; receives enriched systemPrompt |
| `src/services/numerology/calculations.ts` | `reduceToSingleDigit` | Used inside `getPersonalContext()` to compute life path |
| `src/services/coach/context-builder.ts` | `buildCoachingContext` | Reference pattern for parallel profile+analyses fetch |
| `src/services/astrology/prompts/interpretation.ts` | `INTERPRETATION_SYSTEM_PROMPT` | Will be enriched in birth-chart route |

### New File to Create
| File | Purpose |
|------|---------|
| `src/services/analysis/personal-context.ts` | `getPersonalContext(supabase, userId)` — shared helper returning `{ firstName, zodiacSign, lifePathNumber }` |

---

## Architecture Patterns

### Recommended Project Structure Change
```
src/services/analysis/
├── llm.ts                   # existing — unchanged
├── personal-context.ts      # NEW — shared helper for all 22 routes
└── ...
```

### Pattern 1: Shared Personal Context Helper

**What:** A single async function that fetches profile data and computes derived values, returning a typed object used by all 22 routes.

**When to use:** Every route that calls `invokeLLM` with a systemPrompt.

```typescript
// src/services/analysis/personal-context.ts

import type { SupabaseClient } from '@supabase/supabase-js'
import { reduceToSingleDigit } from '@/services/numerology/calculations'

export interface PersonalContext {
  /** שם פרטי — ריק אם לא הוגדר בפרופיל */
  firstName: string
  /** מזל בעברית — 'טלה' וכו' */
  zodiacSign: string
  /** מספר חיים (life path) — מחושב מתאריך הלידה */
  lifePathNumber: number
}

/**
 * שולף ומחשב הקשר אישי למשתמש — שם, מזל, מספר חיים
 * @param supabase — קליינט שרת
 * @param userId — מזהה המשתמש
 * @returns PersonalContext עם ערכי fallback אם פרופיל חסר
 */
export async function getPersonalContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<PersonalContext> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, birth_date')
    .eq('id', userId)
    .maybeSingle()

  const fullName = profile?.full_name ?? ''
  const firstName = fullName.split(' ')[0] ?? fullName

  const birthDate: string = profile?.birth_date ?? '1990-01-01'
  const zodiacSign = getZodiacSign(birthDate)
  const lifePathNumber = computeLifePath(birthDate)

  return { firstName, zodiacSign, lifePathNumber }
}
```

**Zodiac calculation:** Copy `getZodiacSign` from `tools/daily-insights/route.ts` into `personal-context.ts` to avoid duplication. The forecast route has a second implementation (`deriveZodiacSign`) — unify on one.

**Life path calculation:**
```typescript
function computeLifePath(birthDate: string): number {
  const parts = birthDate.split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 0
  const day = parts[2] ?? 0
  return reduceToSingleDigit(day + month + year)
}
```

### Pattern 2: SystemPrompt Injection Pattern

**What:** Each route fetches personal context at the top of the handler (after auth check) and injects it into the systemPrompt string.

**When to use:** All 21 routes.

```typescript
// Standard pattern for DEEP/MEDIUM routes:
const ctx = await getPersonalContext(supabase, user.id)

const systemPrompt = `אתה [ROLE_DESCRIPTION].
${ctx.firstName ? `אתה פונה אל ${ctx.firstName} — מזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.` : ''}
[REST OF EXISTING SYSTEM PROMPT]`
```

**For BASIC routes**, the injection is a one-line addition at the top of the existing systemPrompt.

### Pattern 3: Daily-Insights Deep Enrichment

**What:** The daily-insights route already has zodiac + name. Phase 21 adds:
1. Life path number (not just day number)
2. Reference to prior analyses (last 1-3 analyses summaries)

**Current:** `buildPrompt(zodiacSign, dayNumber, tarotCardName, modules)`
**After:** `buildPrompt(zodiacSign, dayNumber, tarotCardName, modules, lifePathNumber, recentAnalysesSummary)`

```typescript
// Enriched buildPrompt signature
function buildPrompt(
  zodiacSign: string,
  dayNumber: number,
  tarotCardName: string,
  modules: DailyInsightModules,
  lifePathNumber: number,        // NEW
  priorInsights?: string         // NEW — optional summaries
): string {
  // ...existing sections...
  return `...צור תובנה יומית... ממזל ${zodiacSign}, מספר חיים ${lifePathNumber}.
  המספר הנומרולוגי של היום הוא ${dayNumber}...
  ${priorInsights ? `ניתוחים קודמים: ${priorInsights}` : ''}`
}
```

### Pattern 4: Routes Without systemPrompt (solar-return, transits, drawing)

**What:** Three routes call `invokeLLM` without passing `systemPrompt` at all. They need a systemPrompt added.

**solar-return:** Add systemPrompt referencing the user's name and life path before calling `invokeLLM`.
**transits:** Same — add systemPrompt above `buildTransitsPrompt` call.
**drawing:** The route calls `invokeLLM` with only imageUrls + prompt. Add a systemPrompt parameter.

```typescript
// In solar-return/route.ts and transits/route.ts:
const ctx = await getPersonalContext(supabase, user.id)
const systemPrompt = `אתה אסטרולוג קבלי עמוק שמפרש מפות שמים.
פנה אל ${ctx.firstName || 'האדם'} בשמו — מזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.
כל תובנה אישית, ספציפית ועמוקה.`

const llmResponse = await invokeLLM<string>({
  userId: user.id,
  systemPrompt,       // was missing
  prompt: srPrompt,
  maxTokens: 2000,
})
```

### Pattern 5: Kabbalistic Language Fragments

Phrases to weave into enriched systemPrompts (D-01):

```
קבלי-רוחני: "ספירות עץ החיים", "נתיבות החכמה", "אותיות קדושות", "אור אין-סוף",
             "נשמה — נפש — רוח", "עולם היצירה", "הקפות הנשמה"
חם-אינטימי: "כאילו אתה מכיר אותו שנים", "דבר לנשמה", "חודר ללב",
             "אתה רואה את האדם השלם", "פניה ישירה ואינטימית"
```

### Anti-Patterns to Avoid

- **Fetching profile N times:** Do NOT add `supabase.from('profiles')...` separately in each route. The `getPersonalContext()` helper centralizes this.
- **Breaking JSON-mode routes:** Routes that use `responseSchema` + `zodSchema` return structured JSON. Do NOT change the prompt to add free-text requests that break the schema. Only enrich the systemPrompt.
- **Over-engineering:** Do NOT build a full context pipeline (like `buildCoachingContext`) for every route. The 3-field helper is sufficient. `buildCoachingContext` already exists for coach routes — reuse it there.
- **Changing `INTERPRETATION_SYSTEM_PROMPT` globally:** This constant is imported by multiple routes (birth-chart, solar-return uses it too). If enriched, it affects all callers. Safer to override per-call at the route level.
- **Coach/journeys — no systemPrompt:** The `invokeLLM` call in `coach/journeys/route.ts` uses only `prompt` and `responseSchema`. Adding a systemPrompt here must not conflict with the JSON schema instruction (the service appends JSON schema to systemContent internally — see `llm.ts` line 67).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Zodiac calculation | New zodiac function | Copy from `tools/daily-insights/route.ts` `getZodiacSign` | Already correct, UTC-safe |
| Life path reduction | New reduction function | `reduceToSingleDigit` from `@/services/numerology/calculations` | Already handles master numbers (11, 22, 33) |
| Profile fetch | Custom SQL | `supabase.from('profiles').select('full_name, birth_date').eq('id', userId).maybeSingle()` | Established pattern in daily-insights and coach context-builder |
| Prior analyses summary | Custom aggregator | Reuse `analyses` query pattern from `coach/context-builder.ts` lines 29-34 | Already limits to 5 + handles null summaries |
| LLM call | New HTTP client | `invokeLLM` from `@/services/analysis/llm` | Handles sanitization, model selection, JSON mode, validation |

---

## Common Pitfalls

### Pitfall 1: Profile Query Column Mismatch
**What goes wrong:** `forecast/route.ts` queries `.eq('user_id', user.id)` but the `profiles` table uses `.eq('id', user.id)`. All other routes correctly use `.eq('id', user.id)`.
**Why it happens:** The forecast route has a subtle bug — `user_id` vs `id`. When `getPersonalContext()` is used, it must use `.eq('id', userId)` consistently.
**How to avoid:** Always `.eq('id', userId)` for profiles table. The personal-context helper enforces this.
**Warning signs:** Profile returning null even for users who have profiles set up.

### Pitfall 2: Breaking JSON-Mode Routes With systemPrompt Changes
**What goes wrong:** Routes that use `responseSchema` (coach/journeys, career, compatibility, etc.) have the LLM service append `\n\nענה בפורמט JSON בלבד` to the systemContent. Adding a long Kabbalistic systemPrompt before this does not break JSON mode, but adding instructions that conflict with the schema (e.g., "write poetically without JSON") will break the response parser.
**How to avoid:** For JSON-mode routes, enrich the systemPrompt with IDENTITY + PERSONAL_CONTEXT but do NOT add "write poetically" or "avoid structured output" instructions.
**Warning signs:** `LLM validation failed` errors in server logs after changes.

### Pitfall 3: Background Fire-and-Forget (dream/route.ts)
**What goes wrong:** The dream route uses a fire-and-forget pattern — `backgroundWork()` floats as an unhandled promise. The personal context fetch must happen BEFORE the background function is created (not inside it), since the supabase client is created at request time.
**How to avoid:** Fetch `getPersonalContext(supabase, user.id)` synchronously in the main handler and close over the result in `backgroundWork`. Do not create a new supabase client inside `backgroundWork`.

### Pitfall 4: Zodiac Duplication — Two Implementations
**What goes wrong:** `tools/daily-insights/route.ts` has `getZodiacSign()` using ZODIAC_RANGES (Hebrew names), and `tools/astrology/forecast/route.ts` has `deriveZodiacSign()` returning English `ZodiacSignKey`. These serve different purposes: Hebrew name for prompt text, English key for dictionary lookup.
**How to avoid:** `getPersonalContext()` should return the Hebrew zodiac name (from the daily-insights logic). Routes that need the English key (forecast) can keep their own logic.

### Pitfall 5: coach/messages COACH_PERSONA is a Module-Level Constant
**What goes wrong:** `COACH_PERSONA` is defined as a `const` at module level — it cannot include dynamic user data. The route builds `fullSystemPrompt` dynamically by appending context. Personalization must be added to the dynamic `fullSystemPrompt` construction, NOT to the `COACH_PERSONA` constant.
**How to avoid:** After `const ctx = await getPersonalContext(...)`, append to `fullSystemPrompt`: `\n\n### זהות הפונה:\nשם: ${ctx.firstName}, מזל: ${ctx.zodiacSign}, מספר חיים: ${ctx.lifePathNumber}`

### Pitfall 6: INTERPRETATION_SYSTEM_PROMPT Is Imported by Multiple Files
**What goes wrong:** `INTERPRETATION_SYSTEM_PROMPT` in `src/services/astrology/prompts/interpretation.ts` is imported by birth-chart route AND referenced in solar-return route. Modifying it globally affects both callers.
**How to avoid:** Do NOT modify `INTERPRETATION_SYSTEM_PROMPT`. Instead, in each route, build an enriched systemPrompt as `const enrichedSystemPrompt = \`${INTERPRETATION_SYSTEM_PROMPT}\n\nפנה אל ${ctx.firstName}...\`` and pass `enrichedSystemPrompt` to invokeLLM. The original constant stays unchanged.

---

## Code Examples

### Shared Helper — getPersonalContext
```typescript
// src/services/analysis/personal-context.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { reduceToSingleDigit } from '@/services/numerology/calculations'

export interface PersonalContext {
  firstName: string      // '' if no profile
  zodiacSign: string     // Hebrew name, e.g. 'טלה', or '' if unknown
  lifePathNumber: number // 1-9 or master number 11/22/33, or 0 if unknown
}

const ZODIAC_RANGES = [
  { name: 'טלה', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'שור', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'תאומים', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'סרטן', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'אריה', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'בתולה', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'מאזניים', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'עקרב', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'קשת', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: 'גדי', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: 'דלי', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'דגים', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
] as const

function getZodiacSign(birthDate: string): string {
  const d = new Date(birthDate)
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  for (const sign of ZODIAC_RANGES) {
    if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) return sign.name
  }
  return 'גדי'
}

function computeLifePath(birthDate: string): number {
  const parts = birthDate.split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 0
  const day = parts[2] ?? 0
  if (!year || !month || !day) return 0
  return reduceToSingleDigit(day + month + year)
}

/** שולף ומחשב הקשר אישי למשתמש — שם פרטי, מזל, מספר חיים */
export async function getPersonalContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<PersonalContext> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, birth_date')
      .eq('id', userId)
      .maybeSingle()

    const fullName: string = profile?.full_name ?? ''
    const firstName = fullName.trim().split(/\s+/)[0] ?? ''
    const birthDate: string = profile?.birth_date ?? ''

    if (!birthDate) {
      return { firstName, zodiacSign: '', lifePathNumber: 0 }
    }

    return {
      firstName,
      zodiacSign: getZodiacSign(birthDate),
      lifePathNumber: computeLifePath(birthDate),
    }
  } catch {
    return { firstName: '', zodiacSign: '', lifePathNumber: 0 }
  }
}
```

### Injection Pattern — DEEP route (tarot example)
```typescript
// In tools/tarot/route.ts POST handler, after auth check:
const ctx = await getPersonalContext(supabase, user.id)

const personalLine = ctx.firstName
  ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.`
  : ''

const systemPrompt = `אתה קורא טארוט חכם ואינטואיטיבי עם ידע עמוק בקבלה ובסמליות הקלפים.
${personalLine}
דבר ישירות לנשמה — חם, אינטימי, כאילו אתה רואה אותה דרך הקלפים.
שלב בין סמל, מספר, אלמנט וארכיטיפ של כל קלף — חדור לעומק, חשוף את הנסתר.
רפרנסים לקבלה: ספירות, נתיבות עץ החיים, אותיות עבריות — רק כשרלוונטי לקלף.`
```

### Injection Pattern — BASIC route (graphology example)
```typescript
// In tools/graphology/route.ts POST handler, after auth check:
const ctx = await getPersonalContext(supabase, user.id)
const addressLine = ctx.firstName
  ? `פנה ישירות אל ${ctx.firstName} בגוף שני — הוא/היא ממזל ${ctx.zodiacSign}. `
  : ''

// The existing systemPrompt is passed to invokeLLM — prepend the address line:
const systemPrompt = `${addressLine}אתה מומחה גרפולוגי ברמה עולמית...`
// [rest of existing graphology system prompt unchanged]
```

### Daily-Insights Enhancement — lifePathNumber + prior insights
```typescript
// In tools/daily-insights/route.ts, enrich the buildPrompt call:
const ctx = await getPersonalContext(supabase, user.id)
// ctx.lifePathNumber replaces the need to duplicate the calc here

// Fetch last 3 insight summaries (optional, graceful fail)
let priorSummary = ''
try {
  const { data: recentInsights } = await supabase
    .from('daily_insights')
    .select('title')
    .eq('user_id', user.id)
    .eq('mood_type', 'daily')
    .order('insight_date', { ascending: false })
    .limit(3)
  if (recentInsights && recentInsights.length > 0) {
    priorSummary = recentInsights.map(i => i.title).join(' | ')
  }
} catch { /* graceful — no prior context */ }

// systemPrompt enrichment (name already handled conditionally):
const systemPrompt = `אתה מייעץ רוחני-מיסטי עמוק עם ידע בקבלה, אסטרולוגיה ונומרולוגיה.
${ctx.firstName ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.` : ''}
הסגנון שלך: חם, אינטימי, חודר. כל מילה נוגעת בלב ומתחברת לנשמה.
פסקאות קצרות וברורות. ללא כוכביות מיותרות.`

// buildPrompt enriched with lifePathNumber:
const prompt = buildPrompt(ctx.zodiacSign, dayNumber, tarotCardName, modules, ctx.lifePathNumber, priorSummary)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic expert prompts | Personal context injection with name + zodiac + life path | Phase 21 | Two users with different profiles get different content |
| Zodiac calc duplicated per route | Single `getPersonalContext()` helper | Phase 21 | DRY, single source of truth |
| daily-insights has partial personalization | daily-insights extended with life path + prior analyses | Phase 21 | Satisfies PROMPT-02 requirement |

**Existing personalization that is already good:**
- `tools/numerology/route.ts` — already uses `${numbers.name}` in systemPrompt (input name, not profile name — but acceptable for this route since the user explicitly provides the name)
- `tools/daily-insights/route.ts` — gold standard pattern; already fetches profile + calculates zodiac + conditionally includes name
- `coach/context-builder.ts` — `buildCoachingContext()` is a comprehensive pattern (do not replace — extend or reuse)

---

## Environment Availability

Step 2.6: SKIPPED — Phase is purely code changes to existing routes. No external tools, services, CLIs, or runtimes beyond the project's existing stack. Supabase and OpenAI are already confirmed operational (phases 18-20 completed successfully).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | TypeScript build check (`tsc --noEmit`) + manual smoke test |
| Config file | `mystiqor-build/tsconfig.json` |
| Quick run command | `cd mystiqor-build && npx tsc --noEmit` |
| Full suite command | `cd mystiqor-build && npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROMPT-01 | All LLM prompts include personal address + spiritual language | TypeScript build (no errors) + manual API test per route | `cd mystiqor-build && npx tsc --noEmit` | Build config exists |
| PROMPT-02 | Daily insights include zodiac + life path + personal tarot card | TypeScript build + manual GET /api/tools/daily-insights check | `cd mystiqor-build && npx tsc --noEmit` | Build config exists |

**Note:** Prompt quality (tone, depth, personalization) cannot be automatically tested — requires manual LLM response inspection. The automated check confirms code compiles correctly. Two-user differentiation test: call daily-insights with two different user accounts and verify different content.

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx tsc --noEmit`
- **Per wave merge:** `cd mystiqor-build && npm run build`
- **Phase gate:** Build green + manual review of enriched prompts before `/gsd:verify-work`

### Wave 0 Gaps
None — no test file scaffolding needed. This phase modifies server-side prompts only. TypeScript strict mode + the build check is the quality gate.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — no `any`, no `@ts-ignore` (exception: `SupabaseClient<any>` is established pattern in existing codebase — `context-builder.ts` uses it with eslint-disable comment)
- Every function — JSDoc in Hebrew
- Every API route — Zod input validation (already exists in all 22 routes — not changing)
- Max 300 lines per file — `personal-context.ts` will be ~90 lines; enriched routes stay under limit
- No `any` without eslint-disable comment — match existing pattern
- Error handling — try/catch in `getPersonalContext` returns fallback values (no route should fail if profile is missing)
- Security — profile fetch uses `.eq('id', user.id)` ensuring RLS compliance; the helper does NOT expose data across users
- Hebrew code comments required
- `@/` absolute import paths required

---

## Open Questions

1. **Is `reduceToSingleDigit` the correct life path formula?**
   - What we know: The function sums all digits of `day + month + year` (total digits, not cascaded). This matches the numerology route's `calculateNumerologyNumbers` which uses the same function.
   - What's unclear: The daily-insights `getDayNumber` also uses `reduceToSingleDigit` but for the current date, not birth date. Life path should be birth date only.
   - Recommendation: Use `reduceToSingleDigit(day + month + year)` where day/month/year come from `birthDate` — this is consistent with how the numerology route computes `life_path`.

2. **Should `coach/journeys` systemPrompt use `getPersonalContext` or `buildCoachingContext`?**
   - What we know: `buildCoachingContext` fetches profile + 20 analyses + goals + mood. It's already called in `coach/messages` indirectly (COACH_PERSONA + contextText). For `coach/journeys`, only `userContext` (birth_date + recent_analyses + goals) is built inline.
   - Recommendation: For journeys, add `getPersonalContext` to inject name+zodiac+life path into a new systemPrompt. Keep the existing `userContext` inline build — it's different data (recent summaries, goals). Do not replace with `buildCoachingContext` (too heavy for journeys).

---

## Sources

### Primary (HIGH confidence)
- Direct code read of all 21 route files — verified systemPrompt content, profile fetch patterns, invokeLLM call signatures
- `src/services/analysis/llm.ts` — verified `LLMRequest` interface (systemPrompt is optional string)
- `src/services/numerology/calculations.ts` — verified `reduceToSingleDigit` signature and logic
- `src/types/database.ts` — verified `profiles` table has `full_name: string` and `birth_date: string`
- `src/services/coach/context-builder.ts` — verified `buildCoachingContext` pattern for parallel profile fetch

### Secondary (MEDIUM confidence)
- `.planning/phases/21-prompt-enrichment/21-CONTEXT.md` — locked decisions D-01 through D-07
- `.planning/REQUIREMENTS.md` — PROMPT-01, PROMPT-02 requirement text

---

## Metadata

**Confidence breakdown:**
- Route audit: HIGH — all 21 routes read directly from source
- Standard Stack: HIGH — existing confirmed project stack
- Architecture (shared helper): HIGH — exact pattern confirmed in context-builder.ts
- Pitfalls: HIGH — derived from direct code reading (forecast bug found, JSON-mode risk identified, fire-and-forget constraint identified)
- Prompt quality: MEDIUM — Kabbalistic language fragments are prescriptive but tone quality depends on LLM execution

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable code — routes won't change unless other phases touch them)
