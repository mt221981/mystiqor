/**
 * POST /api/tools/numerology — חישוב נומרולוגיה עברית
 * אימות → ולידציה → calculateNumerologyNumbers → פרשנות AI → שמירה ב-analyses → החזרה
 *
 * מדוע: נקודת הכניסה ל-API עבור כלי הנומרולוגיה.
 * מחשב 5 מספרים נומרולוגיים עבריים ומייצר פרשנות AI מותאמת אישית.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calculateNumerologyNumbers } from '@/services/numerology/calculations'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'

/** סכמת ולידציה לקלט נומרולוגיה */
const NumerologyInputSchema = z.object({
  fullName: z.string().min(1, 'שם מלא חובה').max(100, 'שם ארוך מדי'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין — נדרש YYYY-MM-DD'),
})

/** POST /api/tools/numerology — חישוב נומרולוגיה + פרשנות AI */
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
    const parsed = NumerologyInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // חישוב מספרי הנומרולוגיה — פונקציה טהורה, אין צורך ב-try/catch
    const numbers = calculateNumerologyNumbers(parsed.data)

    // פרשנות AI
    const llmResponse = await invokeLLM({
      userId: user.id,
      systemPrompt:
        'אתה מומחה נומרולוגיה עברית. תן פרשנות מותאמת אישית ב-3 פסקאות קצרות. התמקד בנקודות החיובית ובכוחות. אל תיתן ניבוי גורל — רק פוטנציאלים.',
      prompt: `מספרי הנומרולוגיה של ${numbers.name}: נתיב חיים ${numbers.life_path}, גורל ${numbers.destiny}, נשמה ${numbers.soul}, אישיות ${numbers.personality}, שנה אישית ${numbers.personal_year}. פרש את המשמעות המשולבת.`,
      maxTokens: 800,
    })

    const aiText = String(llmResponse.data)

    // שמירת הניתוח ב-DB — JSON.parse(JSON.stringify(...)) ממיר לטיפוס Json תואם
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'numerology',
      input_data: JSON.parse(JSON.stringify({ fullName: parsed.data.fullName, birthDate: parsed.data.birthDate })),
      results: JSON.parse(JSON.stringify({ ...numbers, interpretation: aiText })),
      summary: `נתיב חיים: ${numbers.life_path}`,
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        ...numbers,
        interpretation: aiText,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב נומרולוגי' }, { status: 500 })
  }
}
