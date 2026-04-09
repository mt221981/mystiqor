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

חשוב מאוד: כתוב פרשנויות ארוכות ומקיפות. כל שדה חייב להיות פסקה שלמה של לפחות 10 שורות. אל תקצר. פרט, העמק, הרחב. הסינתזה חייבת להיות לפחות 20 שורות.

ענה בפורמט JSON בלבד בהתאם לסכמה הבאה:
{
  "life_path": "פרשנות עמוקה, מקיפה ואישית של מספר נתיב החיים — לפחות 10 משפטים ארוכים. הסבר את המספר דרך הספירה המתאימה בעץ החיים, האות העברית, הכוכב השולט. פרט מהי השליחות העמוקה שהמספר מגלה, אילו אתגרים ומתנות הוא מביא, איך הוא משפיע על דפוסי ההתנהגות, מערכות יחסים, קריירה. תן דוגמאות מעשיות מחיי היומיום. חבר לאנרגיה הקבלית של הנתיב.",
  "destiny": "פרשנות עמוקה, מקיפה ואישית של מספר הגורל — לפחות 10 משפטים ארוכים. גלה את הייעוד העמוק, הכישרון הנסתר שהנשמה הביאה לעולם הזה. מה התכלית? מה הדרך? אילו מקצועות, תחומים וביטויים מתאימים לגורל הזה. הסבר את הקשר בין הגורל לנתיב החיים — האם הם הולכים יד ביד או יוצרים מתח פורה. תן המלצות מעשיות.",
  "soul": "פרשנות עמוקה, מקיפה ואישית של מספר הנשמה — לפחות 10 משפטים ארוכים. חשוף את הכמיהה הפנימית העמוקה ביותר, מה שמניע את ${numbers.name} מבפנים כשאף אחד לא רואה. מה הנשמה באמת רוצה? איך הרצון הזה מתנגש או מתחבר עם הגורל והאישיות? הסבר איך לכבד את קריאת הנשמה ביומיום. תן טיפים מעשיים.",
  "personality": "פרשנות עמוקה, מקיפה ואישית של מספר האישיות — לפחות 10 משפטים ארוכים. איך העולם רואה את ${numbers.name}? מה הרושם הראשוני? מה הוא/היא משדר/ת ללא מודעות? הסבר את הפער בין הפנים (נשמה) לחוץ (אישיות) — איפה יש הרמוניה ואיפה מתח. איך ניתן לגשר על הפער הזה. תן דוגמאות מחיי היומיום.",
  "personal_year": "פרשנות עמוקה, מקיפה ואישית של השנה האישית — לפחות 10 משפטים ארוכים. מה האנרגיה המרכזית של השנה הנוכחית? מה כדאי לעשות ומה לשחרר? אילו הזדמנויות השנה מביאה ואילו אתגרים? הסבר לפי רבעונים — מה צפוי בתחילת השנה, באמצעה ובסופה. תן 3 המלצות מעשיות ספציפיות לשנה הזו.",
  "synthesis": "סינתזה מאחדת, מקיפה ועמוקה של כל 5 המספרים יחד — לפחות 20 משפטים ארוכים. זו חייבת להיות הפרשנות העשירה והמקיפה ביותר. חבר את כל המספרים לתמונה שלמה אחת. גלה דפוסים, מתחים פוריים, הרמוניות נסתרות בין המספרים. מה המסר המרכזי שכל המספרים יחד שולחים ל${numbers.name}? שלב רפרנסים קבליים עמוקים — ספירות, נתיבות בעץ החיים, אותיות עבריות, גימטריה. תן המלצות מעשיות ליומיום — 5 פעולות קונקרטיות. סיים עם מסר מעצים ואישי."
}`,
      prompt: `${numbers.name}, המספרים שלך: נתיב חיים ${numbers.life_path}, גורל ${numbers.destiny}, נשמה ${numbers.soul}, אישיות ${numbers.personality}, שנה אישית ${numbers.personal_year}. תן פרשנות מיסטית עמוקה, ארוכה ומקיפה לכל מספר בנפרד ולתמונה המשולבת. חשוב: כתוב הרבה, אל תקצר.`,
      maxTokens: 8000,
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
