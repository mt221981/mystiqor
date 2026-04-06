/**
 * POST /api/tools/numerology/compatibility — תאימות נומרולוגית בין שני אנשים
 * אימות → ולידציה → calculateNumerologyCompatibility → פרשנות AI → שמירה ב-analyses → החזרה
 *
 * מדוע: נקודת הכניסה ל-API עבור תאימות נומרולוגית — פיצ'ר פרימיום.
 * מחשב ציוני תאימות לפי 3 מימדים ומייצר פרשנות AI מפורטת בעברית.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateNumerologyCompatibility } from '@/services/numerology/compatibility'
import { invokeLLM } from '@/services/analysis/llm'
import { NumerologyCompatibilitySchema } from '@/lib/validations/numerology'
import type { TablesInsert } from '@/types/database'
import { getPersonalContext } from '@/services/analysis/personal-context'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

/** POST /api/tools/numerology/compatibility — תאימות נומרולוגית + פרשנות AI */
export async function POST(request: NextRequest) {
  try {
    // שלב 1: אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // שלב 2: ולידציה של הקלט עם Zod
    const body: unknown = await request.json()
    const parsed = NumerologyCompatibilitySchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const { person1, person2 } = parsed.data

    // שלב 3: שליפת הקשר אישי — זהות הפונה (מזל ומספר חיים)
    const ctx = await getPersonalContext(supabase, user.id)

    // זהות הפונה — שם, מזל ומספר חיים להעשרת פרשנות
    const personalLine = ctx.firstName
      ? `הפונה הוא ${ctx.firstName} (מזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}). `
      : ''

    // שלב 4: חישוב תאימות נומרולוגית — פונקציה טהורה
    const result = calculateNumerologyCompatibility(person1, person2)

    // שלב 5: פרשנות AI — try/catch עצמאי שלא מכשיל את כל הבקשה
    let aiText = ''
    try {
      const llmResponse = await invokeLLM({
        userId: user.id,
        systemPrompt:
          `אתה מומחה נומרולוגיה עברית. ${personalLine}תן ניתוח תאימות מעמיק ב-3 פסקאות קצרות. התייחס למספרים הספציפיים שקיבלת. התמקד בנקודות החיבור, האתגרים הפוטנציאליים וכוחות משלימים. אל תיתן ניבוי גורל — רק פוטנציאלים.`,
        prompt: `תאימות נומרולוגית:
${person1.fullName}: נתיב חיים ${result.scores.life_path}, גורל ${result.scores.destiny}, נשמה ${result.scores.soul}
${person2.fullName}: פרטים משולבים עם האדם הראשון
ציון כולל: ${result.scores.overall}%
נתיב חיים: ${result.scores.life_path}% | גורל: ${result.scores.destiny}% | נשמה: ${result.scores.soul}%
פרש את התאימות הנומרולוגית בצורה מעמיקה.`,
        maxTokens: 600,
      })
      aiText = String(llmResponse.data)
    } catch (llmError) {
      // שגיאת LLM לא מכשילה — מחזירים תוצאה ללא פרשנות
      console.error('שגיאה בפרשנות AI לתאימות:', llmError)
    }

    // שלב 6: שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'compatibility',
      input_data: JSON.parse(JSON.stringify({ person1, person2 })),
      results: JSON.parse(JSON.stringify({ ...result, interpretation: aiText })),
      summary: `תאימות ${person1.fullName} ו-${person2.fullName}: ${result.scores.overall}%`,
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        ...result,
        interpretation: aiText,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב תאימות נומרולוגית' }, { status: 500 })
  }
}
