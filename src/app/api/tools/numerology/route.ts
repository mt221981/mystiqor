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
import { getPersonalContext } from '@/services/analysis/personal-context'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

export const maxDuration = 60

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

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = NumerologyInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    // חישוב מספרי הנומרולוגיה — פונקציה טהורה, אין צורך ב-try/catch
    const numbers = calculateNumerologyNumbers(parsed.data)

    // שליפת הקשר אישי — מזל לשילוב עם ניתוח נומרולוגי
    const ctx = await getPersonalContext(supabase, user.id)

    // העשרת המזל — שולב עם ספירות עץ החיים
    const zodiacEnrichment = ctx.zodiacSign
      ? `המזל שלו: ${ctx.zodiacSign}. שלב את השפעת המזל על המספרים.`
      : ''

    // פרשנות AI — פרומפט מעמיק שמחזיר JSON מובנה עם פרשנות לכל מספר + סיכום כולל
    const llmResponse = await invokeLLM({
      userId: user.id,
      systemPrompt: `אתה מיסטיקן נומרולוגי עברי עתיק — בקי בסודות הגימטריה, בנתיבות עץ החיים ובחוכמת הקבלה.
פנה אל ${numbers.name} בשמו/ה ישירות. דבר לנשמה — חם, אינטימי, חודר, מיסטי.
${zodiacEnrichment}

ענה בפורמט JSON בלבד בהתאם לסכמה הבאה:
{
  "life_path": "פרשנות עמוקה ואישית של מספר נתיב החיים — 3-4 משפטים. קשר לספירה בעץ החיים, לאות העברית, לכוכב. הסבר מה זה אומר עבור ${numbers.name} ספציפית.",
  "destiny": "פרשנות עמוקה ואישית של מספר הגורל — 3-4 משפטים. גלה את הייעוד, הכישרון הנסתר, הדרך.",
  "soul": "פרשנות עמוקה ואישית של מספר הנשמה — 3-4 משפטים. חשוף את הכמיהה הפנימית, מה שמעבר למסכה.",
  "personality": "פרשנות עמוקה ואישית של מספר האישיות — 3-4 משפטים. איך העולם רואה את ${numbers.name}, מה הוא/היא משדר/ת.",
  "personal_year": "פרשנות עמוקה ואישית של השנה האישית — 3-4 משפטים. מה האנרגיה של השנה הנוכחית, מה כדאי לעשות ומה לשחרר.",
  "synthesis": "פרשנות מאחדת של כל 5 המספרים יחד — 5-7 משפטים עמוקים. חבר את כל החלקים לתמונה שלמה. גלה דפוסים, מתחים פוריים בין המספרים, ומסר מרכזי אחד שהמספרים שולחים ל${numbers.name}. שלב רפרנסים קבליים — ספירות, נתיבות, אותיות."
}`,
      prompt: `${numbers.name}, המספרים שלך: נתיב חיים ${numbers.life_path}, גורל ${numbers.destiny}, נשמה ${numbers.soul}, אישיות ${numbers.personality}, שנה אישית ${numbers.personal_year}. תן פרשנות מיסטית עמוקה ואישית לכל מספר בנפרד ולתמונה המשולבת.`,
      maxTokens: 3000,
      responseSchema: {
        type: 'object',
        properties: {
          life_path: { type: 'string' },
          destiny: { type: 'string' },
          soul: { type: 'string' },
          personality: { type: 'string' },
          personal_year: { type: 'string' },
          synthesis: { type: 'string' },
        },
        required: ['life_path', 'destiny', 'soul', 'personality', 'personal_year', 'synthesis'],
      },
    })

    // פרסור תשובה — JSON מובנה עם פרשנות לכל מספר
    const aiData = llmResponse.data as {
      life_path: string
      destiny: string
      soul: string
      personality: string
      personal_year: string
      synthesis: string
    }

    // שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'numerology',
      input_data: JSON.parse(JSON.stringify({ fullName: parsed.data.fullName, birthDate: parsed.data.birthDate })),
      results: JSON.parse(JSON.stringify({
        ...numbers,
        interpretations: aiData,
        interpretation: aiData.synthesis,
      })),
      summary: `נתיב חיים: ${numbers.life_path}`,
    }
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('[numerology] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...numbers,
        interpretation: aiData.synthesis,
        interpretations: aiData,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch (error) {
    console.error('[numerology] POST error:', error instanceof Error ? error.message : error, error instanceof Error ? error.stack : '')
    return NextResponse.json({ error: 'שגיאה בחישוב נומרולוגי' }, { status: 500 })
  }
}
