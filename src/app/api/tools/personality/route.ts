/**
 * POST /api/tools/personality — ניתוח אישיות Big Five
 * אימות → ולידציה → scoreBigFive → פרשנות AI → שמירה ב-analyses → החזרה
 *
 * מדוע: נקודת הכניסה ל-API עבור כלי ניתוח האישיות OCEAN.
 * מחשב 5 ציוני Big Five ומייצר פרשנות AI מותאמת אישית בעברית.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { scoreBigFive } from '@/services/personality/scoring'
import { invokeLLM } from '@/services/analysis/llm'
import { DIMENSION_LABELS } from '@/lib/constants/big-five-questions'
import type { TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

/** סכמת ולידציה לקלט שאלון Big Five */
const PersonalityInputSchema = z.object({
  answers: z
    .array(z.number().int().min(1).max(5))
    .length(20, 'נדרשות בדיוק 20 תשובות'),
})

/** POST /api/tools/personality — ניקוד Big Five + פרשנות AI */
export async function POST(request: NextRequest) {
  try {
    // שלב 1: אימות משתמש
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

    // שלב 2: ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = PersonalityInputSchema.safeParse(body)

    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    // שלב 3: חישוב ציוני Big Five — פונקציה טהורה
    const scores = scoreBigFive(parsed.data.answers)

    // שלב 4: פרשנות AI בעברית
    const dimensionSummary = (
      Object.keys(scores) as Array<keyof typeof scores>
    )
      .map(
        (dim) =>
          `${DIMENSION_LABELS[dim]}: ${scores[dim]}/100`
      )
      .join(', ')

    const llmResponse = await invokeLLM({
      userId: user.id,
      systemPrompt:
        'אתה פסיכולוג מומחה בתיאוריית Big Five OCEAN. תן פרשנות עמוקה ואישית של פרופיל האישיות בעברית. ' +
        'התמקד בנקודות חוזק, אתגרים, ועצות לצמיחה. כתוב בגוף שני (אתה/את). 4-5 פסקאות. ' +
        'הזכר כל ממד בנפרד ואיך הממדים משלימים זה את זה.',
      prompt:
        `ניתוח אישיות Big Five:\n${dimensionSummary}\n\n` +
        'פרש את הפרופיל האישיותי השלם — מה הנקודות החזקות? מה האתגרים? ' +
        'כיצד ממדים אלו מתבטאים בחיי היומיום והיחסים הבינאישיים?',
      maxTokens: 1000,
    })

    const aiText = String(llmResponse.data)

    // שלב 5: שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'personality',
      input_data: JSON.parse(JSON.stringify({ answers: parsed.data.answers })),
      results: JSON.parse(JSON.stringify({ scores, interpretation: aiText })),
      summary: `פתיחות ${scores.openness} | מצפוניות ${scores.conscientiousness} | מוחצנות ${scores.extraversion}`,
    }

    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('[personality] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        scores,
        interpretation: aiText,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'שגיאה לא צפויה'
    console.error('[personality/route] Error:', message)
    return NextResponse.json(
      { error: 'שגיאה בניתוח האישיות — נסה שנית' },
      { status: 500 }
    )
  }
}
