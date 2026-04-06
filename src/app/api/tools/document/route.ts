/**
 * POST /api/tools/document — ניתוח מסמך עם LLM Vision (TOOL-10)
 * אימות → קבלת FormData → העלאה לסטורג' → invokeLLM עם URL תמונה → שמירה → החזרה
 *
 * מדוע: API עבור כלי ניתוח המסמכים — מקבל קובץ תמונה/PDF, מעלה לסטורג',
 * ומנתח את תוכן המסמך עם GPT-4o Vision.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { TablesInsert } from '@/types/database'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

// ===== קבועים =====

/** סוגי קבצים מותרים */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

/** גודל מקסימלי: 5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024

// ===== סכמות ולידציה =====

/** סכמת תובנה בודדת */
const DocumentInsightSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.enum(['practical', 'spiritual', 'psychological', 'informational']),
})

/** סכמת ולידציה לתגובת ה-LLM — ניתוח מסמך */
const DocumentResponseSchema = z.object({
  document_type: z.string(),
  key_points: z.array(z.string()).min(1),
  insights: z.array(DocumentInsightSchema).min(1),
  action_items: z.array(z.string()),
  summary: z.string(),
})

/** טיפוס תגובת ניתוח מסמך */
type DocumentResponse = z.infer<typeof DocumentResponseSchema>

/** סכמת responseSchema ל-JSON mode */
const DOCUMENT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    document_type: { type: 'string' },
    key_points: { type: 'array', items: { type: 'string' } },
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          category: {
            type: 'string',
            enum: ['practical', 'spiritual', 'psychological', 'informational'],
          },
        },
        required: ['title', 'content', 'category'],
      },
    },
    action_items: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['document_type', 'key_points', 'insights', 'action_items', 'summary'],
}

/** POST /api/tools/document — ניתוח מסמך */
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

    // קריאת FormData
    const formData = await request.formData()
    const file = formData.get('file')
    const contextField = formData.get('context')
    const context = typeof contextField === 'string' ? contextField : undefined

    // ולידציה של הקובץ
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'קובץ חובה' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'סוג קובץ לא נתמך — יש להעלות תמונה (JPG/PNG/WebP) או PDF' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'הקובץ גדול מ-5MB' }, { status: 400 })
    }

    // ולידציה אופציונלית של ה-context
    const contextParsed = z.string().max(500).optional().safeParse(context)
    if (!contextParsed.success) {
      return NextResponse.json({ error: 'הקשר ארוך מדי — מקסימום 500 תווים' }, { status: 400 })
    }

    // העלאת הקובץ לסטורג' Supabase
    const fileExt = file.name.split('.').pop() ?? 'bin'
    const fileName = `documents/${user.id}/${Date.now()}.${fileExt}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[document] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'שגיאה בהעלאת הקובץ' }, { status: 500 })
    }

    // קבלת URL ציבורי של הקובץ
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
    const storageUrl = publicUrlData.publicUrl

    // שליפת הקשר האישי להעשרת הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)
    const personalLine = ctx.firstName
      ? `פנה ישירות אל ${ctx.firstName}. `
      : ''

    // בניית פרומפט המערכת
    const contextStr = contextParsed.data
      ? `\nהקשר נוסף שהמשתמש סיפק: ${contextParsed.data}`
      : ''

    const systemPrompt = personalLine + `אתה מנתח מסמכים מומחה. נתח את המסמך בתמונה וחלץ תובנות, נקודות מפתח ופעולות מומלצות.
${contextStr}

הנחיות לניתוח:
- זהה את סוג המסמך
- חלץ 3-7 נקודות מפתח
- ספק 3-5 תובנות מקוטלגות (practical/spiritual/psychological/informational)
- רשום פעולות מומלצות אם רלוונטי
- כתוב סיכום מקיף

כתוב הכל בעברית בגוף שני.`

    // קריאת LLM עם Vision — שולח את ה-URL של המסמך
    const llmResponse = await invokeLLM<DocumentResponse>({
      userId: user.id,
      systemPrompt,
      prompt: 'נתח את המסמך בתמונה וספק תובנות מפורטות.',
      imageUrls: [storageUrl],
      responseSchema: DOCUMENT_RESPONSE_SCHEMA,
      zodSchema: DocumentResponseSchema,
      maxTokens: 2000,
    })

    // בדיקת תוקף תגובת ה-LLM
    if (!llmResponse.validationResult?.success) {
      console.error('[document] LLM validation failed:', llmResponse.validationResult)
      return NextResponse.json(
        { error: 'שגיאה בניתוח המסמך — תגובה לא תקינה' },
        { status: 500 }
      )
    }

    const validatedResult = llmResponse.validationResult.data as DocumentResponse

    // שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'document',
      input_data: JSON.parse(JSON.stringify({ fileName, context: contextParsed.data })),
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
        imageUrl: storageUrl,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בניתוח המסמך' }, { status: 500 })
  }
}
