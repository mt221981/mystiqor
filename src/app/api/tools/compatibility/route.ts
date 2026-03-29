/**
 * POST /api/tools/compatibility — ניתוח תאימות בין שני אנשים
 * אימות → ולידציה → invokeLLM (טקסט בלבד) → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי התאימות — מנתח נתוני לידה של שני אנשים
 * ומחשב תאימות אסטרולוגית + נומרולוגית משולבת לפי סוג הקשר.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { TablesInsert } from '@/types/database'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לנתוני אדם בודד */
const PersonSchema = z.object({
  name: z.string().min(1, 'שם חובה'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

/** סכמת ולידציה לקלט ניתוח התאימות */
const CompatibilityInputSchema = z.object({
  person1: PersonSchema,
  person2: PersonSchema,
  compatibilityType: z.enum(['romantic', 'friendship', 'professional', 'family']),
})

/** סכמת ולידציה לתגובת ה-LLM */
const CompatibilityResponseSchema = z.object({
  overall_score: z.number().min(0).max(100),
  category_scores: z.array(
    z.object({
      category: z.string().min(1),
      score: z.number().min(0).max(100),
      description: z.string().min(1),
    })
  ).min(1),
  strengths: z.array(z.string().min(1)).min(1),
  challenges: z.array(z.string().min(1)).min(1),
  advice: z.string().min(1),
  summary: z.string().min(1),
})

/** טיפוס תגובה מאומתת מה-LLM */
type CompatibilityResponse = z.infer<typeof CompatibilityResponseSchema>

/** מיפוי סוגי תאימות לעברית */
const COMPATIBILITY_TYPE_LABELS: Record<string, string> = {
  romantic: 'רומנטית/זוגית',
  friendship: 'חברות',
  professional: 'מקצועית/עסקית',
  family: 'משפחתית',
}

/** POST /api/tools/compatibility — ניתוח תאימות */
export async function POST(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = CompatibilityInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { person1, person2, compatibilityType } = parsed.data
    const typeLabel = COMPATIBILITY_TYPE_LABELS[compatibilityType] ?? compatibilityType

    // שליפת הקשר האישי של הפונה להעשרת הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)
    const personalLine = ctx.firstName
      ? `הפונה הוא ${ctx.firstName} (מזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}). `
      : ''

    // בניית הנחיית מערכת בעברית
    const systemPrompt = personalLine + `אתה אסטרולוג ונומרולוג מומחה. נתח את התאימות בין שני אנשים על בסיס נתוני הלידה שלהם.

סוג תאימות: ${typeLabel}
אדם 1: ${person1.name}, נולד/ה ${person1.birthDate}${person1.birthTime ? ` בשעה ${person1.birthTime}` : ''}
אדם 2: ${person2.name}, נולד/ה ${person2.birthDate}${person2.birthTime ? ` בשעה ${person2.birthTime}` : ''}

נתח תאימות אסטרולוגית (מזלות שמש, אלמנטים, היבטים) ונומרולוגית (מספרי חיים, מספרי גורל).
סוג הקשר "${typeLabel}" צריך להנחות את הפוקוס של הניתוח.

החזר JSON עם המבנה הבא:
- overall_score: ציון כולל 0-100
- category_scores: מערך של { category, score, description } — לפחות 3 קטגוריות (אסטרולוגיה, נומרולוגיה, תקשורת)
- strengths: מערך מחרוזות — 3-5 נקודות חוזקה של הזוג
- challenges: מערך מחרוזות — 2-4 אתגרים בקשר
- advice: עצה כללית לחיזוק הקשר
- summary: סיכום קצר של התאימות בעברית`

    /** סכמת responseSchema ל-JSON mode */
    const responseSchema = {
      type: 'object',
      properties: {
        overall_score: { type: 'number', minimum: 0, maximum: 100 },
        category_scores: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              score: { type: 'number' },
              description: { type: 'string' },
            },
          },
        },
        strengths: { type: 'array', items: { type: 'string' } },
        challenges: { type: 'array', items: { type: 'string' } },
        advice: { type: 'string' },
        summary: { type: 'string' },
      },
    }

    // קריאת LLM — טקסט בלבד (ללא imageUrls)
    const llmResponse = await invokeLLM<CompatibilityResponse>({
      userId: user.id,
      systemPrompt,
      prompt: 'נתח תאימות בין שני האנשים לפי הנתונים שסיפקתי.',
      responseSchema,
      zodSchema: CompatibilityResponseSchema,
      maxTokens: 2000,
    })

    // בדיקת תוקף תגובת ה-LLM
    if (!llmResponse.validationResult?.success) {
      console.error('[compatibility] LLM validation failed:', llmResponse.validationResult)
      return NextResponse.json({ error: 'שגיאה בניתוח תאימות — תגובה לא תקינה' }, { status: 500 })
    }

    const validatedResult = llmResponse.validationResult.data as CompatibilityResponse

    // שמירת הניתוח ב-DB — tool_type='compatibility' (לא 'numerology_compatibility')
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'compatibility',
      input_data: JSON.parse(JSON.stringify({ person1, person2, compatibilityType })),
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
    return NextResponse.json({ error: 'שגיאה בניתוח תאימות' }, { status: 500 })
  }
}
