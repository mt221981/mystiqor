/**
 * POST /api/tools/graphology — ניתוח גרפולוגי מתמונת כתב יד באמצעות LLM vision
 * אימות → ולידציה → invokeLLM עם תמונה → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי הגרפולוגיה — מנתח תמונת כתב יד עם GPT-4o Vision
 * ומייצר ניתוח מקצועי של 9 מרכיבים גרפולוגיים עם ציונים ותיאורים.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import { GraphologyResponseSchema, type GraphologyResponse } from '@/services/analysis/response-schemas/graphology'
import type { TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

/** סכמת ולידציה לקלט גרפולוגיה */
const GraphologyInputSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה'),
})

/** סכמת JSON לפלט מובנה — מועברת ל-invokeLLM כ-responseSchema */
const GRAPHOLOGY_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'סיכום כללי של ניתוח כתב היד' },
    components: {
      type: 'array',
      description: '9 מרכיבים גרפולוגיים עיקריים',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'שם המרכיב בעברית' },
          score_1_to_10: { type: 'integer', minimum: 1, maximum: 10 },
          description: { type: 'string', description: 'תיאור ממצאי המרכיב' },
        },
        required: ['name', 'score_1_to_10', 'description'],
      },
      minItems: 9,
      maxItems: 9,
    },
    overall_assessment: { type: 'string', description: 'הערכה כוללת של האישיות מכתב היד' },
    personality_traits: {
      type: 'array',
      items: { type: 'string' },
      description: 'תכונות אישיות שזוהו',
    },
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          text: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
        required: ['category', 'text'],
      },
      description: 'תובנות גרפולוגיות',
    },
  },
  required: ['summary', 'components', 'overall_assessment', 'personality_traits', 'insights'],
}

/** POST /api/tools/graphology — ניתוח גרפולוגי */
export async function POST(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = GraphologyInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    // שליפת הקשר האישי להעשרת הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)
    const personalLine = ctx.firstName
      ? `פנה ישירות אל ${ctx.firstName} (מזל ${ctx.zodiacSign}). `
      : ''

    // ניתוח כתב היד עם LLM Vision (GPT-4o)
    // maxTokens: 8000 — גרפולוגיה דורשת יותר טוקנים מכלים אחרים (9 מרכיבים + תובנות + הערכה)
    const llmResponse = await invokeLLM<GraphologyResponse>({
      userId: user.id,
      imageUrls: [parsed.data.imageUrl],
      systemPrompt: personalLine + `אתה מומחה גרפולוגי ברמה עולמית עם 25+ שנות ניסיון בניתוח כתב יד.
נתח את דגימת כתב היד בתמונה ופרט את הממצאים לפי 9 מרכיבים גרפולוגיים עיקריים:

1. לחץ (Pressure) — עוצמת לחץ העט/עיפרון, עקביות, שינויים
2. שיפוע (Slant) — כיוון הנטייה (ימין/שמאל/ישר), זווית, עקביות
3. גודל (Size) — גודל האותיות, יחסי גדלים בין חלקי האותיות
4. ריווח (Spacing) — מרחקים בין מילים, שורות ואותיות
5. מהירות (Speed) — קצב הכתיבה כפי שניכר מהכתב
6. שוליים (Margins) — רוחב שוליים ימין/שמאל/עליון/תחתון
7. צורת אותיות (Letter Form) — סגנון האותיות, עיגולים/זוויות, בהירות
8. קישוריות (Connectivity) — חיבור בין אותיות, תנועות כלליות
9. חתימה (Signature) — אם קיימת: גודל, קריאות, אופי

לכל מרכיב: שם בעברית, ציון 1-10, תיאור מפורט של הממצאים.
כלול גם: summary (סיכום), overall_assessment (הערכה כוללת), personality_traits (תכונות אישיות), insights (תובנות).
כתוב הכל בעברית בגוף שני — פנה ישירות לבעלי כתב היד.`,
      prompt: 'נתח את דגימת כתב היד בתמונה',
      responseSchema: GRAPHOLOGY_RESPONSE_SCHEMA,
      zodSchema: GraphologyResponseSchema,
      maxTokens: 8000,
    })

    // אימות תוצאת הולידציה
    const validationResult = llmResponse.validationResult
    if (!validationResult?.success) {
      console.error('[graphology] LLM validation failed:', validationResult)
      return NextResponse.json({ error: 'שגיאה בניתוח גרפולוגי — תשובה לא תקינה' }, { status: 500 })
    }

    const analysisData = validationResult.data as GraphologyResponse

    // שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'graphology',
      input_data: JSON.parse(JSON.stringify({ imageUrl: parsed.data.imageUrl })),
      results: JSON.parse(JSON.stringify(analysisData)),
      summary: analysisData.summary,
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        ...analysisData,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בניתוח גרפולוגי' }, { status: 500 })
  }
}
