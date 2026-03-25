/**
 * POST /api/tools/palmistry — ניתוח כף יד מתמונה באמצעות LLM vision
 * אימות → ולידציה → invokeLLM עם תמונה → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי הקריאה בכף יד — מנתח תמונת כף יד עם GPT-4o Vision
 * ומייצר קריאה מקצועית של קווי כף היד.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'

/** סכמת ולידציה לקלט קריאה בכף יד */
const PalmistryInputSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה'),
})

/** POST /api/tools/palmistry — ניתוח כף יד */
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
    const parsed = PalmistryInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // ניתוח כף היד עם LLM Vision (GPT-4o)
    const llmResponse = await invokeLLM({
      userId: user.id,
      imageUrls: [parsed.data.imageUrl],
      systemPrompt: `אתה כירומנט מקצועי עם ניסיון של עשרות שנים.
נתח את כף היד בתמונה בצורה מעמיקה ומפורטת.
התמקד בקווים הבאים:
- קו הלב (heart line) — חיים רגשיים ויחסים
- קו הראש (head line) — חשיבה ותקשורת
- קו החיים (life line) — חיוניות ובריאות
- קו הגורל (fate line) — קריירה ומסלול חיים
- גבעות כף היד — מאדים, ונוס, ירח ועוד

כתוב פרשנות מעמיקה ב-4-5 פסקאות בעברית.
הדגש כוחות ופוטנציאלים. היה ספציפי לכף היד שרואים בתמונה.`,
      prompt: 'נתח את כף היד בתמונה ותן פרשנות כירומנטית מלאה.',
      maxTokens: 1200,
    })

    const aiText = String(llmResponse.data)

    // שמירת הניתוח ב-DB — JSON.parse(JSON.stringify(...)) ממיר לטיפוס Json תואם
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'palmistry',
      input_data: JSON.parse(JSON.stringify({ imageUrl: parsed.data.imageUrl })),
      results: JSON.parse(JSON.stringify({ interpretation: aiText })),
      summary: 'ניתוח כירומנטי של כף היד',
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        interpretation: aiText,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בניתוח כף היד' }, { status: 500 })
  }
}
