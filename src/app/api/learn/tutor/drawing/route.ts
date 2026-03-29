/**
 * POST /api/learn/tutor/drawing — צ'אט עם מורה ניתוח ציורים
 *
 * מדוע: מאפשר למשתמש ללמוד מושגי ניתוח ציורים (HTP, Koppitz, FDM)
 * עם AI שמכיר את הניתוחים שלו.
 * סטייטלס — כל בקשה עצמאית, ללא שמירת שיחה ב-DB.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { TutorMessageSchema } from '@/lib/validations/tutor'
import { getPersonalContext } from '@/services/analysis/personal-context'

/** מידע על ניתוח ציור של המשתמש */
interface AnalysisRow {
  results: Record<string, unknown> | null
  summary: string | null
  created_at: string | null
}

/** מידע על התקדמות לימודית של המשתמש */
interface ProgressRow {
  topic: string
  completed: boolean
  level: string | null
}

/**
 * POST /api/learn/tutor/drawing — שולח הודעה למורה ניתוח ציורים
 * מחזיר תגובה חינוכית מותאמת אישית לפי ניתוחים והתקדמות של המשתמש
 *
 * @param request - בקשת HTTP עם { message: string } ב-body
 * @returns תגובת מורה בפורמט { data: { role: 'assistant', content: string } }
 */
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

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = TutorMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { message } = parsed.data

    // שליפת הקשר אישי — שם ומספר חיים לייחוד הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)

    // שליפת 3 ניתוחי ציורים אחרונים של המשתמש להקשר
    const { data: analyses } = await supabase
      .from('analyses')
      .select('results, summary, created_at')
      .eq('user_id', user.id)
      .eq('tool_type', 'drawing')
      .order('created_at', { ascending: false })
      .limit(3)

    // שליפת התקדמות לימודית של המשתמש בתחום ציור
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: progress } = await (supabase as any)
      .from('learning_progress')
      .select('topic, completed, level')
      .eq('user_id', user.id)
      .eq('discipline', 'drawing')

    // בניית רשימת נושאים שהושלמו
    const progressRows = (progress as ProgressRow[] | null) ?? []
    const completedTopics = progressRows
      .filter((p) => p.completed)
      .map((p) => p.topic)

    // בניית תיאור ניתוחים קיימים
    const analysisRows = (analyses as AnalysisRow[] | null) ?? []
    const analysisContext =
      analysisRows.length > 0
        ? analysisRows
            .map((a, i) => {
              const summary = a.summary ?? 'ללא סיכום'
              return `ניתוח ${i + 1}: ${summary}`
            })
            .join('\n')
        : null

    // כותרת אישית — שם הסטודנט ומספר חיים
    const personalHeader = ctx.firstName
      ? `הסטודנט שלך הוא ${ctx.firstName} — מספר חיים ${ctx.lifePathNumber}. פנה אליו בשמו.\n\n`
      : ''

    // בניית פרומפט מערכת בעברית עם הקשר המשתמש
    const systemPrompt = `${personalHeader}אתה מורה מומחה בניתוח ציורים ופסיכולוגיה של אמנות. תפקידך ללמד את המשתמש מושגי ניתוח ציורים — HTP, Koppitz, FDM ומשמעות צבעים.
ענה בעברית בלבד. היה סבלני, השתמש בדוגמאות ויזואליות, והתייחס לניתוחי הציורים של המשתמש אם רלוונטי.

### הקשר המשתמש:
נושאים שלמד: ${completedTopics.join(', ') || 'טרם התחיל'}
ניתוחים קיימים: ${analysisContext || 'אין ניתוחים עדיין'}`

    // קריאת LLM — מצב טקסט חופשי
    const response = await invokeLLM({
      prompt: message,
      systemPrompt,
      maxTokens: 1500,
      userId: user.id,
    })

    const replyText = typeof response.data === 'string' ? response.data : String(response.data)

    return NextResponse.json({ data: { role: 'assistant', content: replyText } })
  } catch (error) {
    console.error('[tutor/drawing POST] Unexpected error:', error)
    return NextResponse.json({ error: 'שגיאה בשרת — נסה שוב' }, { status: 500 })
  }
}
