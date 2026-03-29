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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conv, error: convError } = await (supabase as any)
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'שיחה לא נמצאה' }, { status: 404 })
    }

    // שליפת ההודעות
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages, error } = await (supabase as any)
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
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { conversation_id: conversationId, message } = parsed.data

    // שליפת הקשר אישי — שם, מזל, מספר חיים לייחוד הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)

    // שליפת השיחה לאימות בעלות והקשר
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('context, message_count')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'שיחה לא נמצאה' }, { status: 404 })
    }

    const convRow = conversation as ConversationRow

    // שמירת הודעת המשתמש
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertUserError } = await (supabase as any)
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

    // שליפת היסטוריית השיחה (20 הודעות אחרונות)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: priorMessages } = await (supabase as any)
      .from('coaching_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertAssistantError } = await (supabase as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
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
