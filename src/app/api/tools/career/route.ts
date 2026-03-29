/**
 * POST /api/tools/career — ייעוץ קריירה מבוסס כישורים, תחומי עניין ומפת לידה אסטרולוגית
 * אימות → ולידציה → טעינת הקשר נטאלי אופציונלי → invokeLLM → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי ייעוץ הקריירה (TOOL-08) — ממשלב כישורים ותחומי עניין
 * עם הקשר מפת לידה כאשר קיים, ומייצר המלצות קריירה מובנות.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'
import { getPersonalContext } from '@/services/analysis/personal-context'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט ייעוץ קריירה */
const CareerInputSchema = z.object({
  currentField: z.string().max(200).optional(),
  skills: z.string().min(1, 'כישורים חובה'),
  interests: z.string().min(1, 'תחומי עניין חובה'),
})

/** סכמת תחום מומלץ */
const RecommendedFieldSchema = z.object({
  name: z.string(),
  match_score: z.number().min(0).max(100),
  reason: z.string(),
})

/** סכמת אתגר ופתרון */
const ChallengeSchema = z.object({
  challenge: z.string(),
  solution: z.string(),
})

/** סכמת ולידציה לתגובת ה-LLM — ייעוץ קריירה */
const CareerResponseSchema = z.object({
  recommended_fields: z.array(RecommendedFieldSchema).min(1),
  skills_to_develop: z.array(z.string()).min(1),
  growth_opportunities: z.array(z.string()).min(1),
  challenges: z.array(ChallengeSchema).min(1),
  action_steps: z.array(z.string()).min(1),
  summary: z.string(),
})

/** טיפוס תגובת ייעוץ קריירה */
type CareerResponse = z.infer<typeof CareerResponseSchema>

/** סכמת responseSchema ל-JSON mode */
const CAREER_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    recommended_fields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          match_score: { type: 'number', minimum: 0, maximum: 100 },
          reason: { type: 'string' },
        },
        required: ['name', 'match_score', 'reason'],
      },
    },
    skills_to_develop: { type: 'array', items: { type: 'string' } },
    growth_opportunities: { type: 'array', items: { type: 'string' } },
    challenges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          challenge: { type: 'string' },
          solution: { type: 'string' },
        },
        required: ['challenge', 'solution'],
      },
    },
    action_steps: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: [
    'recommended_fields',
    'skills_to_develop',
    'growth_opportunities',
    'challenges',
    'action_steps',
    'summary',
  ],
}

/** POST /api/tools/career — ייעוץ קריירה */
export async function POST(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = CareerInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { skills, interests, currentField } = parsed.data

    // שליפת הקשר אישי — שם, מזל ומספר חיים להעשרת הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)

    // טעינת פרופיל משתמש לתאריך לידה
    const { data: profile } = await supabase
      .from('profiles')
      .select('birth_date')
      .eq('id', user.id)
      .maybeSingle()

    // טעינת ניתוח אסטרולוגי אחרון לצורך הקשר נטאלי (אופציונלי — לא נכשל אם אינו קיים)
    let natalContext = ''
    try {
      const { data: lastAstrology } = await supabase
        .from('analyses')
        .select('results')
        .eq('user_id', user.id)
        .eq('tool_type', 'astrology')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastAstrology?.results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = lastAstrology.results as Record<string, any>
        const sunSign = results.sun_sign ?? results.chart?.sun_sign ?? null
        const moonSign = results.moon_sign ?? results.chart?.moon_sign ?? null
        const ascendant = results.ascendant ?? results.chart?.ascendant ?? null

        if (sunSign ?? moonSign ?? ascendant) {
          const parts: string[] = []
          if (sunSign) parts.push(`שמש ב${sunSign}`)
          if (moonSign) parts.push(`ירח ב${moonSign}`)
          if (ascendant) parts.push(`עולה ב${ascendant}`)
          natalContext = `\nהקשר אסטרולוגי: ${parts.join(', ')}`
        }
      }
    } catch {
      // הקשר נטאלי הוא אופציונלי — ממשיכים בלי שגיאה
    }

    // בניית פרומפט המערכת
    const birthDateStr = profile?.birth_date
      ? `\nתאריך לידה: ${profile.birth_date}`
      : ''

    // כתובת אישית — שם, מזל ומספר חיים עם טון רוחני
    const personalLine = ctx.firstName
      ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}. `
      : ''

    const systemPrompt = `אתה יועץ קריירה אסטרולוגי מומחה. ${personalLine}המשימה שלך היא לספק ייעוץ קריירה מעמיק ומותאם אישית בעברית.

שלב את הידע האסטרולוגי עם ניתוח כישורים ותחומי עניין כדי להמליץ על מסלולי קריירה מדויקים.
${birthDateStr}${natalContext}

הנחיות:
- המלץ על 3-5 תחומי קריירה עם ציוני התאמה ונימוקים
- ציין 3-5 כישורים לפיתוח
- הצג 3-4 הזדמנויות צמיחה
- פרט 2-3 אתגרים צפויים עם פתרונות
- תן 4-5 צעדי פעולה מיידיים
- ספק סיכום כולל בעברית`

    const currentFieldStr = currentField ? `\nתחום נוכחי: ${currentField}` : ''
    const userPrompt = `נתח את הפרופיל הקריירה הבא:${currentFieldStr}
כישורים: ${skills}
תחומי עניין: ${interests}

ספק ייעוץ קריירה מותאם אישית בהתאם לנתונים אלו.`

    // קריאת LLM — ייעוץ קריירה
    const llmResponse = await invokeLLM<CareerResponse>({
      userId: user.id,
      systemPrompt,
      prompt: userPrompt,
      responseSchema: CAREER_RESPONSE_SCHEMA,
      zodSchema: CareerResponseSchema,
      maxTokens: 2000,
    })

    // בדיקת תוקף תגובת ה-LLM
    if (!llmResponse.validationResult?.success) {
      console.error('[career] LLM validation failed:', llmResponse.validationResult)
      return NextResponse.json({ error: 'שגיאה בניתוח קריירה — תגובה לא תקינה' }, { status: 500 })
    }

    const validatedResult = llmResponse.validationResult.data as CareerResponse

    // שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'career',
      input_data: JSON.parse(JSON.stringify({ skills, interests, currentField })),
      results: JSON.parse(JSON.stringify(validatedResult)),
      summary: validatedResult.summary,
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        ...validatedResult,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בייעוץ קריירה' }, { status: 500 })
  }
}
