/**
 * POST /api/tools/relationships — ניתוח יחסים בין שני אנשים (TOOL-09)
 * אימות → ולידציה → invokeLLM → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי ניתוח היחסים — מנתח שני אנשים לפי שמות, תאריכי לידה
 * וסוג הקשר, ומייצר ניתוח תאימות מפורט עם המלצות.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט ניתוח יחסים */
const RelationshipInputSchema = z.object({
  person1Name: z.string().min(1, 'שם ראשון חובה'),
  person2Name: z.string().min(1, 'שם שני חובה'),
  person1BirthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
  person2BirthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
  relationshipType: z.enum(['romantic', 'friendship', 'business', 'family']),
  context: z.string().max(500).optional(),
})

/** סכמת ולידציה לתגובת ה-LLM — ניתוח יחסים */
const RelationshipResponseSchema = z.object({
  compatibility_score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).min(1),
  challenges: z.array(z.string()).min(1),
  recommendations: z.array(z.string()).min(1),
  communication_style: z.string(),
  emotional_dynamics: z.string(),
})

/** טיפוס תגובת ניתוח יחסים */
type RelationshipResponse = z.infer<typeof RelationshipResponseSchema>

/** מיפוי סוגי קשר לעברית */
const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  romantic: 'רומנטי/זוגי',
  friendship: 'חברות',
  business: 'עסקי/מקצועי',
  family: 'משפחתי',
}

/** סכמת responseSchema ל-JSON mode */
const RELATIONSHIP_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    compatibility_score: { type: 'number', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    challenges: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    communication_style: { type: 'string' },
    emotional_dynamics: { type: 'string' },
  },
  required: [
    'compatibility_score',
    'summary',
    'strengths',
    'challenges',
    'recommendations',
    'communication_style',
    'emotional_dynamics',
  ],
}

/** POST /api/tools/relationships — ניתוח יחסים */
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

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = RelationshipInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const {
      person1Name,
      person2Name,
      person1BirthDate,
      person2BirthDate,
      relationshipType,
      context,
    } = parsed.data
    const typeLabel = RELATIONSHIP_TYPE_LABELS[relationshipType] ?? relationshipType

    // בניית פרומפט המערכת
    const systemPrompt = `אתה יועץ יחסים אסטרולוגי ופסיכולוגי מומחה. נתח את הקשר בין שני אנשים בהתאם לנתונים שלהם.

סוג הקשר: ${typeLabel}
אדם 1: ${person1Name}, נולד/ה ${person1BirthDate}
אדם 2: ${person2Name}, נולד/ה ${person2BirthDate}
${context ? `\nהקשר: ${context}` : ''}

שלב תובנות אסטרולוגיות (מזלות, אלמנטים, עונות שנה) עם תובנות פסיכולוגיות (סגנון תקשורת, דינמיקה רגשית).
פקוס על סוג הקשר "${typeLabel}" בכל ההמלצות.

הנחיות:
- ציון תאימות 0-100
- סיכום מקיף בעברית
- 3-5 חוזקות של הקשר
- 2-4 אתגרים
- 3-5 המלצות מעשיות
- תיאור סגנון התקשורת
- תיאור הדינמיקה הרגשית`

    // קריאת LLM — ניתוח יחסים
    const llmResponse = await invokeLLM<RelationshipResponse>({
      userId: user.id,
      systemPrompt,
      prompt: `נתח את הקשר בין ${person1Name} ל${person2Name} לפי הנתונים שסיפקתי.`,
      responseSchema: RELATIONSHIP_RESPONSE_SCHEMA,
      zodSchema: RelationshipResponseSchema,
      maxTokens: 2000,
    })

    // בדיקת תוקף תגובת ה-LLM
    if (!llmResponse.validationResult?.success) {
      console.error('[relationships] LLM validation failed:', llmResponse.validationResult)
      return NextResponse.json(
        { error: 'שגיאה בניתוח היחסים — תגובה לא תקינה' },
        { status: 500 }
      )
    }

    const validatedResult = llmResponse.validationResult.data as RelationshipResponse

    // שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'relationship',
      input_data: JSON.parse(
        JSON.stringify({
          person1Name,
          person2Name,
          person1BirthDate,
          person2BirthDate,
          relationshipType,
          context,
        })
      ),
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
    return NextResponse.json({ error: 'שגיאה בניתוח היחסים' }, { status: 500 })
  }
}
