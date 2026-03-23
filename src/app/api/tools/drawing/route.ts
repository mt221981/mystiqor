/**
 * POST /api/tools/drawing — ניתוח ציור פסיכולוגי (HTP) מתמונה באמצעות LLM vision
 * אימות → ולידציה → buildDrawingAnalysisPrompt → invokeLLM עם תמונה → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי ניתוח הציורים — מנתח תמונת ציור עם GPT-4o Vision
 * ומייצר ניתוח פסיכולוגי מלא: תכונות Koppitz, קטגוריות FDM, ומדדים רגשיים.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { buildDrawingAnalysisPrompt } from '@/services/drawing/analysis'
import { DrawingResponseSchema, type DrawingResponse } from '@/services/analysis/response-schemas/drawing'
import type { TablesInsert } from '@/types/database'

/** סכמת ולידציה לקלט ניתוח ציורים */
const DrawingInputSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה'),
  drawingType: z.enum(['house', 'tree', 'person', 'free']),
  userAge: z.number().int().min(1).max(120).optional(),
  userGender: z.enum(['male', 'female', 'other']).optional(),
})

/**
 * מבנה responseSchema להנחיית ה-LLM להחזיר JSON תואם DrawingResponseSchema
 * חשוב: גם responseSchema וגם zodSchema חייבים להיות מסופקים (Pitfall 4)
 */
const DRAWING_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    analysis_type: { type: 'string', enum: ['house', 'tree', 'person', 'free'] },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          present: { type: 'boolean' },
          significance: { type: 'string' },
        },
        required: ['name', 'present', 'significance'],
      },
    },
    koppitz_score: { type: 'number', minimum: 0, maximum: 30 },
    fdm_categories: { type: 'array', items: { type: 'string' } },
    emotional_indicators: { type: 'array', items: { type: 'string' } },
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          text: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['category', 'text'],
      },
    },
  },
  required: ['summary', 'analysis_type', 'features', 'emotional_indicators', 'insights'],
}

/** POST /api/tools/drawing — ניתוח ציור פסיכולוגי */
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
    const parsed = DrawingInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { imageUrl, drawingType } = parsed.data

    // בניית פרומפט ניתוח ציור
    const drawingPrompt = buildDrawingAnalysisPrompt('ניתח את הציור', {})

    // ניתוח הציור עם LLM Vision (GPT-4o) — imageUrls מפעיל מצב vision
    const llmResponse = await invokeLLM<DrawingResponse>({
      userId: user.id,
      imageUrls: [imageUrl],
      prompt: drawingPrompt,
      responseSchema: DRAWING_RESPONSE_SCHEMA,
      zodSchema: DrawingResponseSchema,
      maxTokens: 3000,
    })

    // ולידציה של תשובת ה-LLM
    const validationResult = llmResponse.validationResult
    if (!validationResult?.success) {
      return NextResponse.json(
        { error: 'שגיאה בניתוח הציור — תשובת AI אינה תקינה' },
        { status: 500 }
      )
    }

    const analysisResult = validationResult.data as DrawingResponse

    // שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'drawing',
      input_data: JSON.parse(JSON.stringify({ imageUrl, drawingType })),
      results: JSON.parse(JSON.stringify(analysisResult)),
      summary: analysisResult.summary,
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        ...analysisResult,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בניתוח הציור' }, { status: 500 })
  }
}
