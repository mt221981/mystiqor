/**
 * POST /api/tools/timing — כלי תזמון: מציאת ימים מועדפים לפי פעילות
 * אימות → ולידציה → גלגל נטאלי → ציון ימים → דירוג → פרשנות → שמירה → החזרה
 *
 * מדוע: כלי תזמון מדרג ימים בטווח עד 31 יום לפי ציון אסטרולוגי
 * המבוסס על אספקטי טרנזיט על הגלגל הנטאלי של המשתמש ומשקולות לסוג הפעילות.
 * שמירה עם tool_type: 'astrology' ו-sub_type: 'timing' ב-input_data
 * (הכוונה: 'timing' אינו ב-ToolType union — 'astrology' הוא קטגוריית ה-parent).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { eachDayOfInterval } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { scoreDayForActivity } from '@/services/astrology/timing'
import { getEphemerisPositions } from '@/services/astrology/ephemeris'
import { ACTIVITY_TYPES, ACTIVITY_LABELS, type ActivityType } from '@/lib/constants/timing-activities'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'
import type { PlanetPositions } from '@/services/astrology/aspects'
import type { DayScore } from '@/services/astrology/timing'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט כלי התזמון */
const TimingInputSchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
})

// ===== POST handler =====

/** POST /api/tools/timing — דירוג ימים מועדפים לפי פעילות */
export async function POST(request: NextRequest) {
  try {
    // שלב 1: אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // שלב 2: ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = TimingInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { activityType, startDate, endDate } = parsed.data

    // שלב 3: ולידציה טווח תאריכים — מקסימום 31 ימים
    const start = new Date(`${startDate}T12:00:00`)
    const end = new Date(`${endDate}T12:00:00`)

    if (end < start) {
      return NextResponse.json({ error: 'תאריך סיום חייב להיות אחרי תאריך התחלה' }, { status: 400 })
    }

    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 31) {
      return NextResponse.json({ error: 'טווח מקסימלי 31 ימים' }, { status: 400 })
    }

    // שלב 4: שליפת פרופיל משתמש לנתוני לידה
    const { data: profile } = await supabase
      .from('profiles')
      .select('birth_date, latitude, longitude')
      .eq('id', user.id)
      .maybeSingle()

    // שלב 5: שליפת גלגל לידה נטאלי מהניתוחים הקיימים
    let natalPlanets: PlanetPositions | null = null

    const { data: natalAnalysis } = await supabase
      .from('analyses')
      .select('results')
      .eq('user_id', user.id)
      .eq('tool_type', 'astrology')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (natalAnalysis?.results && typeof natalAnalysis.results === 'object') {
      const results = natalAnalysis.results as {
        planets?: Record<string, { longitude: number }>
        planetDetails?: Array<{ name: string; longitude: number }>
      }

      // חילוץ מיקומי הכוכבים מהניתוח הנטאלי
      if (results.planets && typeof results.planets === 'object') {
        natalPlanets = results.planets as PlanetPositions
      } else if (Array.isArray(results.planetDetails)) {
        natalPlanets = {}
        for (const detail of results.planetDetails) {
          if (detail.name && typeof detail.longitude === 'number') {
            natalPlanets[detail.name] = { longitude: detail.longitude }
          }
        }
      }
    }

    if (!natalPlanets) {
      // ניסיון ליצור גלגל נטאלי מנתוני הפרופיל אם קיימים
      if (profile?.birth_date && profile.latitude && profile.longitude) {
        const birthDatetime = new Date(`${profile.birth_date}T12:00:00`)
        natalPlanets = getEphemerisPositions(birthDatetime)
      } else {
        return NextResponse.json({ error: 'יש ליצור מפת לידה קודם' }, { status: 400 })
      }
    }

    // שלב 6: חישוב ציון לכל יום בטווח
    const days = eachDayOfInterval({ start, end })
    const dayScores: DayScore[] = days.map((day) =>
      scoreDayForActivity(day, natalPlanets!, activityType)
    )

    // שלב 7: מיון לפי ציון
    const sortedDays = [...dayScores].sort((a, b) => b.score - a.score)
    const bestDays = sortedDays.slice(0, 5)
    const worstDays = sortedDays.slice(-3).reverse()

    // שלב 8: פרשנות LLM קצרה
    const activityLabel = ACTIVITY_LABELS[activityType as ActivityType]
    const topDay = bestDays[0]
    let interpretation = ''

    if (topDay) {
      try {
        const llmResponse = await invokeLLM<string>({
          userId: user.id,
          prompt: `כלי תזמון — ${activityLabel}
היום הטוב ביותר הוא ${topDay.date} עם ציון ${topDay.score}/100.
מזל ירח: ${topDay.moonSign}.
גורמים חיוביים: ${topDay.favorable.join(', ') || 'אין'}.
גורמים שליליים: ${topDay.unfavorable.join(', ') || 'אין'}.

כתוב המלצה קצרה (2-3 משפטים) על היום הטוב ביותר לפעילות זו, בעברית.`,
          systemPrompt: 'אתה אסטרולוג מומחה. ספק המלצה קצרה ומעשית לתזמון הפעילות.',
          maxTokens: 200,
        })
        interpretation = String(llmResponse.data)
      } catch {
        // פרשנות אופציונלית — כישלון לא חוסם את הכלי
        interpretation = `היום הטוב ביותר ל${activityLabel} הוא ${topDay.date} עם ציון ${topDay.score}/100.`
      }
    }

    // שלב 9: שמירה ב-DB
    // tool_type: 'astrology' (לא 'timing' — אינו ב-ToolType union)
    // sub_type: 'timing' ב-input_data עבור הפרדה עתידית
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'astrology',
      input_data: JSON.parse(JSON.stringify({
        sub_type: 'timing',
        activityType,
        startDate,
        endDate,
      })),
      results: JSON.parse(JSON.stringify({
        bestDays,
        worstDays,
        allDays: sortedDays,
        activityType,
        interpretation,
      })),
      summary: `תזמון ${activityLabel}: יום טוב — ${topDay?.date ?? 'N/A'} (${topDay?.score ?? 0}/100)`,
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    // שלב 10: החזרה
    return NextResponse.json({
      data: {
        bestDays,
        worstDays,
        allDays: sortedDays,
        activityType,
        activityLabel,
        interpretation,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב תזמון' }, { status: 500 })
  }
}
