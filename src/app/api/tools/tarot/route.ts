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
import type { Database, TablesInsert } from '@/types/database'

/** שורת קלף מ-DB */
type TarotCardRow = Database['public']['Tables']['tarot_cards']['Row']

/** סכמת ולידציה לקלט טארוט */
const TarotInputSchema = z.object({
  spreadCount: z.union([z.literal(1), z.literal(3), z.literal(5)]).default(3),
  question: z.string().max(300, 'שאלה ארוכה מדי — מקסימום 300 תווים').optional(),
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

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = TarotInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
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

    // בניית פרשנות AI — שימוש ב-name_he (שם עברי)
    const cardNames = drawn.map((c) => c.name_he).join(', ')
    const questionText = parsed.data.question
      ? `שאלת המשתמש: "${parsed.data.question}". `
      : ''

    const llmResponse = await invokeLLM({
      userId: user.id,
      systemPrompt:
        'אתה קורא טארוט חכם ואינטואיטיבי עם ידע עמוק בקבלה ובסמליות הקלפים. דבר ישירות לפונה — חם, אינטימי, כאילו אתה רואה את נשמתו דרך הקלפים. שלב בין הסמל, המספר, האלמנט והארכיטיפ של כל קלף. אל תסתפק בתיאור — חדור לעומק, חשוף מה שמוסתר.',
      prompt: `${questionText}הקלפים שנשלפו: ${cardNames}. פרש את הפריסה כסיפור אחד שלם — מה הקלפים מספרים יחד? מה הם מגלים על מה שמתרחש מתחת לפני השטח? מה המסר העמוק שהיקום שולח?`,
      maxTokens: 1000,
    })

    const aiText = String(llmResponse.data)

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
        })),
        interpretation: aiText,
      })),
      summary: `פריסת ${parsed.data.spreadCount} קלפים: ${cardNames}`,
    }
    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    return NextResponse.json({
      data: {
        drawn,
        interpretation: aiText,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בקריאת הטארוט' }, { status: 500 })
  }
}
