/**
 * GET /api/tools/astrology/calendar — לוח שנה אסטרולוגי חודשי
 * אימות → ולידציה → בדיקת מטמון → invokeLLM → שמירה → החזרה
 *
 * מדוע: מחזיר 5-8 אירועים אסטרולוגיים לחודש נתון — ממוטמן ב-daily_insights
 * עם mood_type='calendar' ו-insight_date='{year}-{month}-01'.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'

// ===== סכמות ולידציה =====

/** סכמת query params */
const CalendarQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year:  z.coerce.number().int().min(2020).max(2030),
})

/** סכמת אירוע אסטרולוגי */
const AstroEventSchema = z.object({
  date:        z.string().describe('תאריך האירוע בפורמט YYYY-MM-DD'),
  type:        z.string().describe('סוג האירוע: ירח מלא, ירח חדש, מרקורי רטרוגרד, כניסת מזל, ליקוי'),
  title:       z.string().describe('כותרת קצרה בעברית'),
  description: z.string().describe('תיאור קצר בעברית'),
})

/** סכמת תשובת LLM — מערך אירועים */
const CalendarResponseSchema = z.object({
  events: z.array(AstroEventSchema).min(3).max(10),
})

export type AstroEvent = z.infer<typeof AstroEventSchema>
type CalendarResponse = z.infer<typeof CalendarResponseSchema>

// ===== שמות חודשים בעברית =====

const HEBREW_MONTHS: Record<number, string> = {
  1: 'ינואר', 2: 'פברואר', 3: 'מרץ', 4: 'אפריל',
  5: 'מאי', 6: 'יוני', 7: 'יולי', 8: 'אוגוסט',
  9: 'ספטמבר', 10: 'אוקטובר', 11: 'נובמבר', 12: 'דצמבר',
}

// ===== API Handler =====

/** GET /api/tools/astrology/calendar — אירועים אסטרולוגיים לחודש */
export async function GET(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // ולידציה של query params
    const { searchParams } = new URL(request.url)
    const parsed = CalendarQuerySchema.safeParse({
      month: searchParams.get('month'),
      year:  searchParams.get('year'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'פרמטרים לא תקינים — נדרש month (1-12) ו-year (2020-2030)', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { month, year } = parsed.data
    const cacheDate = `${year}-${String(month).padStart(2, '0')}-01`
    const monthName = HEBREW_MONTHS[month] ?? String(month)

    // בדיקת מטמון — daily_insights עם mood_type='calendar'
    const { data: cached } = await supabase
      .from('daily_insights')
      .select('data_sources')
      .eq('user_id', user.id)
      .eq('mood_type', 'calendar')
      .eq('insight_date', cacheDate)
      .maybeSingle()

    if (cached?.data_sources) {
      // מטמון נמצא — מחזירים ישירות
      const cachedData = cached.data_sources as CalendarResponse
      return NextResponse.json({
        data: {
          events: cachedData.events ?? [],
          month,
          year,
          cached: true,
        },
      })
    }

    // אין מטמון — קריאה ל-LLM
    const llmResponse = await invokeLLM<CalendarResponse>({
      userId: user.id,
      systemPrompt:
        'אתה אסטרולוג מומחה המכין לוחות שנה אסטרולוגיים מדויקים. ספק תאריכים ריאליסטיים ואירועים נכונים.',
      prompt: `צור רשימה של 5-8 אירועים אסטרולוגיים לחודש ${monthName} ${year}.
לכל אירוע ציין:
- date: תאריך בפורמט YYYY-MM-DD (חייב להיות בחודש ${month}/${year})
- type: סוג האירוע (ירח מלא / ירח חדש / מרקורי רטרוגרד / כניסת מזל / ליקוי)
- title: כותרת קצרה בעברית
- description: תיאור קצר ומשמעותי בעברית (1-2 משפטים)
כלול: ירח מלא, ירח חדש, ולפחות 2 כניסות מזל. אם יש מרקורי רטרוגרד בחודש זה — הוסף.
החזר כ-JSON עם שדה "events" שמכיל מערך האירועים.`,
      responseSchema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date:        { type: 'string' },
                type:        { type: 'string' },
                title:       { type: 'string' },
                description: { type: 'string' },
              },
              required: ['date', 'type', 'title', 'description'],
            },
          },
        },
        required: ['events'],
      },
      zodSchema: CalendarResponseSchema,
      maxTokens: 1000,
    })

    // חילוץ הנתונים
    const calendarData: CalendarResponse = llmResponse.validationResult?.success
      ? llmResponse.validationResult.data
      : (typeof llmResponse.data === 'object' && llmResponse.data && 'events' in llmResponse.data
          ? llmResponse.data as CalendarResponse
          : { events: [] })

    // שמירה ב-daily_insights עם mood_type='calendar'
    const row: TablesInsert<'daily_insights'> = {
      user_id:      user.id,
      title:        `לוח שנה אסטרולוגי — ${monthName} ${year}`,
      content:      `${calendarData.events.length} אירועים אסטרולוגיים`,
      mood_type:    'calendar',
      insight_date: cacheDate,
      data_sources: JSON.parse(JSON.stringify(calendarData)),
    }
    await supabase.from('daily_insights').insert(row)

    return NextResponse.json({
      data: {
        events: calendarData.events,
        month,
        year,
        cached: false,
      },
    })
  } catch (err) {
    console.error('[Calendar API Error]', err)
    return NextResponse.json({ error: 'שגיאה בטעינת לוח השנה האסטרולוגי' }, { status: 500 })
  }
}
