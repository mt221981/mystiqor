# Phase 21: Prompt Enrichment & Soul - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

כל 22 ה-LLM prompts במערכת מועשרים: פניה בשם הפרטי, שפה קבלית-רוחנית עמוקה + חמה-אינטימית, התייחסות לדאטה האישית (מזל, מספר חיים). תובנות יומיות מעמיקות עם מספר חיים, ניתוחים קודמים, והתייחסות אישית.

</domain>

<decisions>
## Implementation Decisions

### סגנון הפרומפטים
- **D-01:** שילוב קבלי-רוחני עמוק + חם-אינטימי — חוכמה עתיקה שמדברת ללב. רפרנסים לקבלה, ארכיטיפים, ספירות, נתיבות — אבל בשפה חמה ואישית, לא אקדמית
- **D-02:** כל prompt פונה למשתמש בשמו הפרטי (לא "המשתמש" או פניה גנרית)
- **D-03:** כל prompt מתייחס לדאטה האישית — מזל, מספר חיים, ניתוחים קודמים כשרלוונטי

### תובנות יומיות אישיות
- **D-04:** העמקת ה-prompt הקיים — לא שינוי ארכיטקטורה. הוספת: מספר חיים (לא רק מספר יומי), התייחסות לניתוחים קודמים, שם פרטי תמיד
- **D-05:** הפרש אישי אמיתי — שני משתמשים שונים חייבים לקבל תוכן שונה (מזל שונה, מספר חיים שונה, קלף שונה)

### היקף העשרה
- **D-06:** כל 22 ה-API routes עם systemPrompt — לעבור על כולם ולהעשיר
- **D-07:** רשימת ה-routes המלאה: daily-insights, tarot, dream, coach/journeys, coach/messages, learn/tutor/astrology, learn/tutor/drawing, astrology/birth-chart, astrology/calendar, astrology/forecast, astrology/solar-return, astrology/synastry, astrology/transits, career, compatibility, document, drawing, graphology, human-design, numerology, numerology/compatibility + כל route נוסף שנמצא

### Claude's Discretion
- סדר העבודה על ה-routes (מומלץ: daily-insights ראשון כ-reference, אחר כך בגלים)
- מידת העומק של ההעשרה בכל route — routes פשוטים (document, drawing) יקבלו העשרה בסיסית, routes מורכבים (coach, daily-insights) יקבלו העשרה עמוקה
- יצירת shared prompt helper לפניה בשם + דאטה אישית (למנוע כפילות ב-22 routes)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core LLM Infrastructure
- `mystiqor-build/src/services/analysis/llm.ts` — invokeLLM service — כל הקריאות עוברות דרכו
- `mystiqor-build/src/app/api/tools/daily-insights/route.ts` — ה-prompt הכי מפותח כרגע — reference pattern לכל ה-routes

### User Profile Data
- `mystiqor-build/src/types/database.ts` — profiles table types (birth_date, full_name)
- `mystiqor-build/src/services/numerology/calculations.ts` — reduceToSingleDigit function

### All 22 API Routes with systemPrompt
- `mystiqor-build/src/app/api/tools/daily-insights/route.ts`
- `mystiqor-build/src/app/api/tools/tarot/route.ts`
- `mystiqor-build/src/app/api/tools/dream/route.ts`
- `mystiqor-build/src/app/api/coach/journeys/route.ts`
- `mystiqor-build/src/app/api/coach/messages/route.ts`
- `mystiqor-build/src/app/api/learn/tutor/astrology/route.ts`
- `mystiqor-build/src/app/api/learn/tutor/drawing/route.ts`
- `mystiqor-build/src/app/api/tools/astrology/birth-chart/route.ts`
- `mystiqor-build/src/app/api/tools/astrology/calendar/route.ts`
- `mystiqor-build/src/app/api/tools/astrology/forecast/route.ts`
- `mystiqor-build/src/app/api/tools/astrology/solar-return/route.ts`
- `mystiqor-build/src/app/api/tools/astrology/synastry/route.ts`
- `mystiqor-build/src/app/api/tools/astrology/transits/route.ts`
- `mystiqor-build/src/app/api/tools/career/route.ts`
- `mystiqor-build/src/app/api/tools/compatibility/route.ts`
- `mystiqor-build/src/app/api/tools/document/route.ts`
- `mystiqor-build/src/app/api/tools/drawing/route.ts`
- `mystiqor-build/src/app/api/tools/graphology/route.ts`
- `mystiqor-build/src/app/api/tools/human-design/route.ts`
- `mystiqor-build/src/app/api/tools/numerology/route.ts`
- `mystiqor-build/src/app/api/tools/numerology/compatibility/route.ts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `invokeLLM({ userId, systemPrompt, prompt, maxTokens })` — unified LLM service
- `getZodiacSign(birthDate)` — already in daily-insights route
- `reduceToSingleDigit()` — numerology calculation already imported
- `profiles` table query pattern — already established in daily-insights

### Established Patterns
- daily-insights route already does: profile fetch → zodiac calc → day number → tarot card → build prompt → invoke LLM
- All routes already use supabase auth check + `user.id`
- Pattern: systemPrompt as persona/tone, prompt as specific task

### Integration Points
- Every route needs: profile fetch (name, birth_date) → zodiac + life path number → inject into systemPrompt
- Consider shared helper: `buildPersonalContext(userId)` → { name, zodiac, lifePathNumber }
- daily-insights already has most of this — extract and reuse

</code_context>

<specifics>
## Specific Ideas

- Shared helper function `getPersonalContext(supabase, userId)` that returns { firstName, zodiacSign, lifePathNumber } — used by all 22 routes
- daily-insights prompt as the gold standard — other routes adapt from it
- Kabbalistic references: ספירות, נתיבות עץ החיים, אותיות עבריות — woven naturally into responses

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-prompt-enrichment*
*Context gathered: 2026-03-29*
