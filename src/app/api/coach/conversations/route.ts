/**
 * GET /api/coach/conversations — רשימת שיחות המשתמש
 * POST /api/coach/conversations — יצירת שיחה חדשה עם הקשר מותאם אישית
 *
 * מדוע: מנהל שיחות המאמן ה-AI — כל שיחה מקבלת הקשר מותאם אישית
 * שנבנה מניתוחי המשתמש, מטרותיו ומצב רוחו.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildCoachingContext } from '@/services/coach/context-builder'

/** שורת שיחה מ-DB */
interface ConversationRow {
  id: string
  user_id: string
  title: string | null
  context: { text?: string } | null
  message_count: number | null
  last_message_at: string | null
  created_at: string | null
}

/**
 * GET /api/coach/conversations — שליפת רשימת שיחות של המשתמש
 * מסודרות לפי זמן הודעה אחרון, מוגבל ל-20
 */
export async function GET(_request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // שליפת שיחות — הטבלה conversations קיימת ב-DB אך לא ב-database.ts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversations, error } = await (supabase as any)
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[conversations GET] Supabase error:', error)
      return NextResponse.json({ error: 'שגיאה בטעינת השיחות' }, { status: 500 })
    }

    return NextResponse.json({ data: (conversations as ConversationRow[]) ?? [] })
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}

/**
 * POST /api/coach/conversations — יצירת שיחה חדשה
 * מקבל כותרת אופציונלית ובונה הקשר מותאם אישית מנתוני המשתמש
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

    // קריאת גוף הבקשה — כותרת אופציונלית
    let title = 'שיחה חדשה'
    try {
      const body = (await request.json()) as { title?: string }
      if (body.title && typeof body.title === 'string') {
        title = body.title.slice(0, 200)
      }
    } catch {
      // גוף ריק — משתמשים בכותרת ברירת מחדל
    }

    // בניית הקשר מותאם אישית מנתוני המשתמש
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contextText = await buildCoachingContext(user.id, supabase as any)

    // יצירת השיחה — הטבלה conversations קיימת ב-DB אך לא ב-database.ts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error } = await (supabase as any)
      .from('conversations')
      .insert({
        user_id: user.id,
        title,
        context: { text: contextText },
        message_count: 0,
        last_message_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      console.error('[conversations POST] Supabase error:', error)
      return NextResponse.json({ error: 'שגיאה ביצירת שיחה' }, { status: 500 })
    }

    return NextResponse.json({ data: conversation as ConversationRow }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}
