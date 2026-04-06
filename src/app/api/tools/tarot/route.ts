/**
 * POST /api/tools/tarot — שליפת קלפי טארוט מה-DB + פרשנות AI
 * אימות → ולידציה → שליפת קלפים מ-DB → ערבוב → AI → שמירה → החזרה
 *
 * מדוע: API עבור כלי הטארוט — שולף קלפים מ-DB (לא hardcoded) ומייצר פרשנות AI.
 * חשוב: טבלת tarot_cards חייבת לכלול seed — ראו supabase/seed/tarot_cards.sql
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { Database, TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

/** שורת קלף מ-DB */
type TarotCardRow = Database['public']['Tables']['tarot_cards']['Row']

/** JSON schema for tarot LLM response — JSON mode switch */
const TAROT_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: { interpretation: { type: 'string' } },
  required: ['interpretation'],
} as const

/** Zod schema — validates non-empty interpretation string */
const TarotSimpleSchema = z.object({
  interpretation: z.string().min(10, 'תגובת AI קצרה מדי'),
})

/** סכמת ולידציה לקלט טארוט */
const TarotInputSchema = z.object({
  spreadCount: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]).default(3),
  question: z.string().max(300, 'שאלה ארוכה מדי — מקסימום 300 תווים').optional(),
  spreadId: z.string().optional(),
})

/**
 * מערבבת ובוחרת קלפים מרשימה
 * פונקציה טהורה — ניתן לבדיקה בבידוד
 */
function drawCards(allCards: TarotCardRow[], count: number): TarotCardRow[] {
  if (allCards.length === 0) return []
  const shuffled = [...allCards].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/** POST /api/tools/tarot — שליפת קלפים + פרשנות AI */
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

    // שליפת הקשר אישי — שם, מזל, מספר חיים
    const ctx = await getPersonalContext(supabase, user.id)

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = TarotInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    // שליפת כל הקלפים מ-DB
    const { data: allCards } = await supabase
      .from('tarot_cards')
      .select('*')

    // בחירה אקראית של קלפים
    const drawn = drawCards(allCards ?? [], parsed.data.spreadCount)

    // טיפול במקרה של DB ריק
    if (drawn.length === 0) {
      return NextResponse.json(
        { error: 'אין קלפי טארוט זמינים. יש להריץ את ה-seed.' },
        { status: 500 }
      )
    }

    // בניית פרשנות AI — שם עברי + מטא-דאטה עשירה (ארכיטיפ, אלמנט, אסטרולוגיה)
    const cardDescriptions = drawn.map((c) => {
      const meta = [
        c.archetype ? `ארכיטיפ: ${c.archetype}` : '',
        c.element ? `אלמנט: ${c.element}` : '',
        c.astrology ? `אסטרולוגיה: ${c.astrology}` : '',
      ].filter(Boolean).join(', ')
      return `${c.name_he}${meta ? ` (${meta})` : ''}`
    }).join('; ')
    const questionText = parsed.data.question
      ? `שאלת המשתמש: "${parsed.data.question}". `
      : ''

    // בניית שורת פנייה אישית — אם יש שם, מזל ומספר חיים
    const personalLine = ctx.firstName
      ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.`
      : ''

    // בניית systemPrompt מועשר עם שפה קבלית ופנייה אישית
    const systemPrompt = `אתה קורא טארוט חכם ואינטואיטיבי עם ידע עמוק בקבלה ובסמליות הקלפים.
${personalLine}
דבר ישירות לנשמה — חם, אינטימי, כאילו אתה רואה אותה דרך הקלפים.
שלב בין סמל, מספר, אלמנט וארכיטיפ של כל קלף — חדור לעומק, חשוף את הנסתר.
רפרנסים לקבלה: ספירות, נתיבות עץ החיים, אותיות עבריות — רק כשרלוונטי לקלף.
ענה בעברית. פסקאות קצרות וברורות.`

    const llmResponse = await invokeLLM({
      userId: user.id,
      systemPrompt,
      prompt: `${questionText}הקלפים שנשלפו: ${cardDescriptions}. פרש את הפריסה כסיפור אחד שלם — מה הקלפים מספרים יחד? מה הם מגלים על מה שמתרחש מתחת לפני השטח? מה המסר העמוק שהיקום שולח?\n\nענה בפורמט JSON עם שדה "interpretation" בלבד.`,
      maxTokens: 1000,
      responseSchema: TAROT_RESPONSE_JSON_SCHEMA,
      zodSchema: TarotSimpleSchema,
    })

    if (llmResponse.validationResult && !llmResponse.validationResult.success) {
      return NextResponse.json(
        { error: 'תגובת ה-AI לא תקינה — נסה שוב' },
        { status: 500 }
      )
    }

    const aiText = (llmResponse.data as { interpretation: string }).interpretation

    // שמירת הניתוח ב-DB — JSON.parse(JSON.stringify(...)) ממיר לטיפוס Json תואם
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'tarot',
      input_data: JSON.parse(JSON.stringify({
        spreadCount: parsed.data.spreadCount,
        question: parsed.data.question ?? null,
      })),
      results: JSON.parse(JSON.stringify({
        drawn: drawn.map((c) => ({
          id: c.id,
          name_he: c.name_he,
          name_en: c.name_en,
          arcana: c.arcana,
          suit: c.suit,
          keywords: c.keywords,
          element: c.element,
          astrology: c.astrology,
          kabbalah: c.kabbalah,
          archetype: c.archetype,
          upright_keywords: c.upright_keywords,
          reversed_keywords: c.reversed_keywords,
          numerology_value: c.numerology_value,
        })),
        interpretation: aiText,
      })),
      summary: `פריסת ${parsed.data.spreadCount} קלפים: ${drawn.map((c) => c.name_he).join(', ')}`,
    }
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('[tarot] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        drawn,
        interpretation: aiText,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch (error) {
    console.error('[tarot] POST error:', error instanceof Error ? error.message : error, error instanceof Error ? error.stack : '')
    return NextResponse.json({ error: 'שגיאה בקריאת הטארוט' }, { status: 500 })
  }
}
