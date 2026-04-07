/**
 * GET /api/tools/astrology/forecast — תחזית אסטרולוגית יומית אישית
 * אימות → טעינת פרופיל → חישוב מזל → בדיקת מטמון → invokeLLM → שמירה → החזרה
 *
 * מדוע: מחזיר תחזית יומית מותאמת אישית למזל המשתמש — ממוטמן ב-daily_insights
 * כדי לא לקרוא ל-LLM פעמיים לאותו יום.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { ZODIAC_SIGNS } from '@/lib/constants/astrology'
import type { ZodiacSignKey } from '@/lib/constants/astrology'
import type { TablesInsert } from '@/types/database'
import { getPersonalContext } from '@/services/analysis/personal-context'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

export const maxDuration = 60

// ===== חישוב מזל לפי תאריך לידה =====

/** טווחי תאריכים למזלות — חודש/יום */
const ZODIAC_DATE_RANGES: Array<{ sign: ZodiacSignKey; start: [number, number]; end: [number, number] }> = [
  { sign: 'Capricorn',   start: [1, 1],  end: [1, 19] },
  { sign: 'Aquarius',    start: [1, 20], end: [2, 18] },
  { sign: 'Pisces',      start: [2, 19], end: [3, 20] },
  { sign: 'Aries',       start: [3, 21], end: [4, 19] },
  { sign: 'Taurus',      start: [4, 20], end: [5, 20] },
  { sign: 'Gemini',      start: [5, 21], end: [6, 20] },
  { sign: 'Cancer',      start: [6, 21], end: [7, 22] },
  { sign: 'Leo',         start: [7, 23], end: [8, 22] },
  { sign: 'Virgo',       start: [8, 23], end: [9, 22] },
  { sign: 'Libra',       start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio',     start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
  { sign: 'Capricorn',   start: [12, 22], end: [12, 31] },
]

/**
 * מחשב מזל לפי תאריך לידה (ISO string)
 * @param birthDate - תאריך לידה בפורמט YYYY-MM-DD
 * @returns מפתח מזל או null אם לא ניתן לחשב
 */
function deriveZodiacSign(birthDate: string): ZodiacSignKey | null {
  const match = birthDate.match(/^\d{4}-(\d{2})-(\d{2})$/)
  if (!match || !match[1] || !match[2]) return null
  const month = parseInt(match[1], 10)
  const day = parseInt(match[2], 10)

  for (const range of ZODIAC_DATE_RANGES) {
    const startMonth = range.start[0] as number
    const startDay   = range.start[1] as number
    const endMonth   = range.end[0]   as number
    const endDay     = range.end[1]   as number
    const afterStart = month > startMonth || (month === startMonth && day >= startDay)
    const beforeEnd  = month < endMonth   || (month === endMonth   && day <= endDay)
    if (afterStart && beforeEnd) return range.sign
  }
  return null
}

// ===== סכמת ולידציה =====

/** סכמת תשובת LLM לתחזית יומית */
const ForecastResponseSchema = z.object({
  energyGeneral: z.string(),
  love: z.string(),
  career: z.string(),
  health: z.string(),
  luckyNumber: z.number().int().min(1).max(99),
  summary: z.string(),
})

type ForecastResponse = z.infer<typeof ForecastResponseSchema>

// ===== API Handler =====

/** GET /api/tools/astrology/forecast — תחזית יומית אסטרולוגית */
export async function GET() {
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

    // שליפת הקשר אישי — שם ומספר חיים לייחוד הפרומפט (המזל כבר מחושב מהפרופיל)
    const ctx = await getPersonalContext(supabase, user.id)

    // טעינת פרופיל לקבלת תאריך לידה
    const { data: profile } = await supabase
      .from('profiles')
      .select('birth_date')
      .eq('user_id', user.id)
      .maybeSingle()

    const birthDate = profile?.birth_date ?? null
    const zodiacSign = birthDate ? deriveZodiacSign(birthDate) : null
    const signKey = zodiacSign ?? 'Aries' // ברירת מחדל אם אין פרופיל
    const signInfo = ZODIAC_SIGNS[signKey]

    // תאריך היום לצורך מטמון
    const todayDate: string = new Date().toISOString().split('T')[0] ?? new Date().toISOString().substring(0, 10)

    // בדיקת מטמון — daily_insights עם mood_type='forecast' לאותו יום
    const { data: cached } = await supabase
      .from('daily_insights')
      .select('content, data_sources')
      .eq('user_id', user.id)
      .eq('mood_type', 'forecast')
      .eq('insight_date', todayDate)
      .maybeSingle()

    if (cached) {
      // מטמון נמצא — מחזירים ישירות
      return NextResponse.json({
        data: {
          content: cached.content,
          forecast: cached.data_sources as ForecastResponse | null,
          zodiacSign: signKey,
          zodiacInfo: signInfo,
          date: todayDate,
          cached: true,
        },
      })
    }

    // אין מטמון — קריאה ל-LLM
    const dateFormatted = new Date().toLocaleDateString('he-IL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    // כתובת אישית — שם ומספר חיים (המזל מוזכר בגוף הפרומפט דרך signInfo.name)
    const personalLine = ctx.firstName
      ? `פנה אל ${ctx.firstName} בשמו — מספר חיים ${ctx.lifePathNumber}. `
      : ''

    const llmResponse = await invokeLLM<ForecastResponse>({
      userId: user.id,
      systemPrompt:
        `${personalLine}אתה אסטרולוג מומחה המתמחה בפרשנות מזלות. צור תחזיות מדויקות ומעמיקות בעברית.`,
      prompt: `צור תחזית יומית מפורטת למזל ${signInfo.name} (${signInfo.emoji}) ליום ${dateFormatted}.
כלול את הפרטים הבאים בפורמט JSON:
- energyGeneral: תיאור האנרגיה הכללית של היום (2-3 משפטים בגוף ראשון)
- love: תחזית לתחום האהבה והיחסים (2 משפטים)
- career: תחזית לתחום הקריירה והכסף (2 משפטים)
- health: תחזית לתחום הבריאות והאנרגיה הגופנית (2 משפטים)
- luckyNumber: מספר מזל להיום (מספר שלם בין 1 ל-99)
- summary: סיכום יומי קצר בשורה אחת
כתוב בעברית, בגוף ראשון, בצורה אישית ומעוררת השראה.`,
      responseSchema: {
        type: 'object',
        properties: {
          energyGeneral: { type: 'string' },
          love: { type: 'string' },
          career: { type: 'string' },
          health: { type: 'string' },
          luckyNumber: { type: 'number' },
          summary: { type: 'string' },
        },
        required: ['energyGeneral', 'love', 'career', 'health', 'luckyNumber', 'summary'],
      },
      zodSchema: ForecastResponseSchema,
      maxTokens: 800,
    })

    // חילוץ הנתונים מהתשובה
    const forecastData = llmResponse.validationResult?.success
      ? llmResponse.validationResult.data
      : llmResponse.data

    const contentText = typeof forecastData === 'object' && forecastData && 'summary' in forecastData
      ? (forecastData as ForecastResponse).summary
      : String(forecastData)

    // שמירה ב-daily_insights עם mood_type='forecast'
    const row: TablesInsert<'daily_insights'> = {
      user_id: user.id,
      title: `תחזית יומית — מזל ${signInfo.name}`,
      content: contentText,
      mood_type: 'forecast',
      insight_date: todayDate,
      data_sources: JSON.parse(JSON.stringify(forecastData)),
    }
    await supabase.from('daily_insights').insert(row)

    return NextResponse.json({
      data: {
        content: contentText,
        forecast: forecastData,
        zodiacSign: signKey,
        zodiacInfo: signInfo,
        date: todayDate,
        cached: false,
      },
    })
  } catch (err) {
    console.error('[Forecast API Error]', err)
    return NextResponse.json({ error: 'שגיאה בטעינת התחזית האסטרולוגית' }, { status: 500 })
  }
}
