/**
 * GET /api/coach/messages?conversation_id=X — שליפת הודעות לשיחה
 * POST /api/coach/messages — שליחת הודעה + קבלת תגובת מאמן מה-LLM
 *
 * מדוע: ה-API המרכזי של חווית האימון —
 * שומר הודעת משתמש, שולח ל-LLM עם הקשר מותאם אישית והיסטוריית שיחה,
 * שומר תגובת המאמן ומחזיר אותה ללקוח.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import { TOOL_NAMES } from '@/lib/constants/tool-names'
import { zodValidationError } from '@/lib/utils/api-error'

export const maxDuration = 60

// ===== סכמת ולידציה =====

/** סכמת ולידציה להודעה נשלחת */
const SendMessageSchema = z.object({
  conversation_id: z.string().uuid('מזהה שיחה לא תקין'),
  message: z.string().min(1, 'הודעה לא יכולה להיות ריקה').max(5000, 'הודעה ארוכה מדי'),
})

/** פרסונת מאמן — פרומפט מערכת קבוע בעברית */
const COACH_PERSONA = `אתה מאמן אישי מיסטי שמשלב חוכמה עתיקה עם פסיכולוגיה מודרנית.
אתה מכיר את המשתמש באופן אישי ומשתמש בנתונים שלו כדי לתת עצות מותאמות אישית.
ענה בעברית בלבד. היה חם, אמפתי ומעשי. השתמש בידע מהניתוחים של המשתמש.`

/** שורת שיחה מ-DB */
interface ConversationRow {
  context: { text?: string } | null
  message_count: number | null
}

/** שורת הודעה מ-DB */
interface MessageRow {
  id: string
  role: string
  content: string
  created_at: string | null
}

/** שורת הודעה היסטורית (ללא id) */
interface HistoryRow {
  role: string
  content: string
}

/** שורת ניתוח קלה לזריקת הקשר לכל הודעה */
interface RecentAnalysisRow {
  tool_type: string
  summary: string | null
  created_at: string | null
}

/** חישוב זמן יחסי בעברית — "לפני X דקות/שעות/ימים" */
function relativeTimeHebrew(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'הרגע'
  if (diffMin < 60) return `לפני ${diffMin} דקות`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `לפני ${diffHours} שעות`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'אתמול'
  return `לפני ${diffDays} ימים`
}

/**
 * GET /api/coach/messages?conversation_id=X — שליפת הודעות שיחה
 * מוודא שהשיחה שייכת למשתמש לפני שמחזיר הודעות
 */
export async function GET(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // פרסור conversation_id מה-query params
    const conversationId = request.nextUrl.searchParams.get('conversation_id')
    if (!conversationId) {
      return NextResponse.json({ error: 'חסר מזהה שיחה' }, { status: 400 })
    }

    // ולידציה של UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(conversationId)) {
      return NextResponse.json({ error: 'מזהה שיחה לא תקין' }, { status: 400 })
    }

    // ולידציה שהשיחה שייכת למשתמש — הטבלה קיימת ב-DB
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'שיחה לא נמצאה' }, { status: 404 })
    }

    // שליפת ההודעות
    const { data: messages, error } = await supabase
      .from('coaching_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[messages GET] Supabase error:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת ההודעות' }, { status: 500 })
    }

    return NextResponse.json({ data: (messages as MessageRow[]) ?? [] })
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}

/**
 * POST /api/coach/messages — שליחת הודעת משתמש + קבלת תגובת מאמן
 * שומר הודעת משתמש, שולח ל-LLM עם הקשר + היסטוריה, שומר תגובה
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
    const parsed = SendMessageSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const { conversation_id: conversationId, message } = parsed.data

    // שליפת הקשר אישי — שם, מזל, מספר חיים לייחוד הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)

    // שליפת השיחה לאימות בעלות והקשר
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('context, message_count')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'שיחה לא נמצאה' }, { status: 404 })
    }

    const convRow = conversation as ConversationRow

    // שליפת 5 ניתוחים אחרונים להזרקת הקשר דינמי בכל הודעה (per D-01/D-03)
    const { data: recentAnalyses } = await supabase
      .from('analyses')
      .select('tool_type, summary, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // שמירת הודעת המשתמש
    const { error: insertUserError } = await supabase
      .from('coaching_messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: 'user',
        content: message,
      })

    if (insertUserError) {
      console.error('[messages POST] Failed to save user message:', insertUserError)
      return NextResponse.json({ error: 'שגיאה בשמירת ההודעה' }, { status: 500 })
    }

    // שליפת היסטוריית השיחה (10 הודעות אחרונות — מוגבל לחלון הקשר)
    const { data: priorMessages } = await supabase
      .from('coaching_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    const priorList = (priorMessages as HistoryRow[]) ?? []

    // בניית פרומפט מערכת — פרסונה + הקשר + היסטוריה
    const contextText = convRow.context?.text ?? ''

    let fullSystemPrompt = COACH_PERSONA
    if (contextText) {
      fullSystemPrompt += `\n\n### הקשר המשתמש:\n${contextText}`
    }

    // הוספת זהות הפונה — שם, מזל ומספר חיים (Pitfall 5: COACH_PERSONA לא משתנה)
    if (ctx.firstName) {
      fullSystemPrompt += `\n\n### זהות הפונה:\nשם: ${ctx.firstName}, מזל: ${ctx.zodiacSign}, מספר חיים: ${ctx.lifePathNumber}.\nפנה אליו בשמו. התייחס למזלו ולמספר חייו כשרלוונטי.`
    }

    // הזרקת ניתוחים אחרונים להקשר — בין זהות הפונה להיסטוריית שיחה (per D-02)
    const analysisList = recentAnalyses as RecentAnalysisRow[] | null
    if (analysisList && analysisList.length > 0) {
      const analysisLines = analysisList.map((a) => {
        const toolHebrew = TOOL_NAMES[a.tool_type] ?? a.tool_type
        const summaryText = a.summary ? a.summary.slice(0, 80) : 'ללא סיכום'
        const timeText = a.created_at ? relativeTimeHebrew(a.created_at) : ''
        return `- ${toolHebrew}: ${summaryText}${timeText ? ` (${timeText})` : ''}`
      }).join('\n')
      fullSystemPrompt += `\n\n### ניתוחים אחרונים בשיחה:\n${analysisLines}\nהשתמש במידע זה כדי לתת ייעוץ מותאם. אם המשתמש שואל "מה עשיתי" — התבסס על הרשימה הזו.`
    }

    if (priorList.length > 0) {
      const historyLines = priorList
        .map((msg) => `${msg.role === 'user' ? 'משתמש' : 'מאמן'}: ${msg.content}`)
        .join('\n')
      fullSystemPrompt += `\n\n### היסטוריית שיחה:\n${historyLines}`
    }

    // קריאת LLM — מצב טקסט חופשי (ללא responseSchema ו-zodSchema)
    const response = await invokeLLM({
      prompt: message,
      systemPrompt: fullSystemPrompt,
      maxTokens: 2048,
      userId: user.id,
    })

    const replyText = typeof response.data === 'string' ? response.data : String(response.data)

    // שמירת תגובת המאמן
    const { error: insertAssistantError } = await supabase
      .from('coaching_messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: 'assistant',
        content: replyText,
      })

    if (insertAssistantError) {
      console.error('[messages POST] Failed to save assistant message:', insertAssistantError)
      // ממשיכים — המשתמש עדיין מקבל את התגובה
    }

    // עדכון מטא-דאטה של השיחה
    const currentCount = (convRow.message_count ?? 0) + 2
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: currentCount,
      })
      .eq('id', conversationId)

    return NextResponse.json({ data: { role: 'assistant', content: replyText } })
  } catch (error) {
    console.error('[messages POST] Unexpected error:', error)
    return NextResponse.json({ error: 'שגיאה בשליחת ההודעה — נסה שוב' }, { status: 500 })
  }
}
