/**
 * POST /api/tools/compatibility — תאימות משולבת: נומרולוגיה + אסטרולוגיה
 * Anti-Barnum: כל טענה מבוססת על ציון ספציפי שחושב — לא הכללות גנריות
 *
 * אלגוריתם:
 *   numerologyScore = calculateNumerologyCompatibility() → overallScore (40% lifePath + 30% destiny + 30% soul)
 *   astrologyScore  = element compatibility (sun 50% + moon 30% + rising 20%) | fallback=65 ללא קואורדינטות
 *   totalScore      = numerologyScore * 0.40 + astrologyScore * 0.60 (clamp 0-100)
 *
 * Input: { person1: { fullName, birthDate, birthTime?, latitude?, longitude? }, person2: same }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { calculateNumerologyCompatibility } from '@/services/numerology/compatibility'
import { assembleChart, getSign } from '@/services/astrology/chart'
import { getEphemerisPositions } from '@/services/astrology/ephemeris'
import { ZODIAC_SIGNS } from '@/lib/constants/astrology'
import type { ZodiacSignKey } from '@/lib/constants/astrology'
import type { TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

export const maxDuration = 60

// ===== סכמות ולידציה =====

/** סכמת ולידציה לנתוני אדם בודד */
const PersonCompatSchema = z.object({
  fullName: z.string().min(1, 'שם חובה').max(100, 'שם ארוך מדי'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).default('12:00'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
})

/** סכמת ולידציה לקלט כלי התאימות */
const CompatibilityInputSchema = z.object({
  person1: PersonCompatSchema,
  person2: PersonCompatSchema,
})

type PersonCompatInput = z.infer<typeof PersonCompatSchema>

// ===== טבלת תאימות יסודות =====

/**
 * ציוני תאימות בין יסודות אסטרולוגיים (0-100)
 * אש, אדמה, אוויר, מים — לפי תורת ארבעת היסודות
 */
const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  אש:    { אש: 80, אוויר: 90, אדמה: 50, מים: 60 },
  אדמה:  { אש: 50, אוויר: 60, אדמה: 85, מים: 90 },
  אוויר: { אש: 90, אוויר: 80, אדמה: 60, מים: 55 },
  מים:   { אש: 60, אוויר: 55, אדמה: 90, מים: 85 },
}

// ===== פונקציות עזר =====

/**
 * מחזיר את היסוד של מזל נתון מ-ZODIAC_SIGNS
 * @param sign - שם המזל באנגלית (Aries, Taurus, ...)
 * @returns היסוד בעברית (אש, אדמה, אוויר, מים) | ריק אם לא נמצא
 */
function getElementForSign(sign: string): string {
  const info = ZODIAC_SIGNS[sign as ZodiacSignKey]
  return info?.element ?? ''
}

/**
 * מחשב ציון תאימות יסודות בין שתי מפות גלגל
 * sun: 50% + moon: 30% + rising: 20%
 *
 * @param sign1Sun - מזל שמש של האדם הראשון
 * @param sign1Moon - מזל ירח של האדם הראשון
 * @param sign1Rising - מזל עולה של האדם הראשון
 * @param sign2Sun - מזל שמש של האדם השני
 * @param sign2Moon - מזל ירח של האדם השני
 * @param sign2Rising - מזל עולה של האדם השני
 * @returns ציון תאימות 0-100
 */
function calculateElementScore(
  sign1Sun: string, sign1Moon: string, sign1Rising: string,
  sign2Sun: string, sign2Moon: string, sign2Rising: string,
): number {
  const sunCompat = ELEMENT_COMPAT[getElementForSign(sign1Sun)]?.[getElementForSign(sign2Sun)] ?? 60
  const moonCompat = ELEMENT_COMPAT[getElementForSign(sign1Moon)]?.[getElementForSign(sign2Moon)] ?? 60
  const ascCompat = ELEMENT_COMPAT[getElementForSign(sign1Rising)]?.[getElementForSign(sign2Rising)] ?? 60
  return Math.round(sunCompat * 0.5 + moonCompat * 0.3 + ascCompat * 0.2)
}

/**
 * מחשב ציון תאימות כולל משוקלל: נומרולוגיה 40% + אסטרולוגיה 60%
 * מוגבל לטווח 0-100 (clamp)
 * פונקציה טהורה — ניתנת לייבוא ובדיקה
 *
 * @param numerologyScore - ציון תאימות נומרולוגי (0-100)
 * @param astrologyScore - ציון תאימות אסטרולוגי (0-100)
 * @returns ציון כולל מעוגל ומוגבל לטווח 0-100
 */
export function calculateCombinedScore(numerologyScore: number, astrologyScore: number): number {
  const raw = numerologyScore * 0.40 + astrologyScore * 0.60
  return Math.min(100, Math.max(0, Math.round(raw)))
}

/**
 * מחשב מפת גלגל ומחזיר מזלות עיקריים לצורך ציון יסודות
 * @param person - נתוני אדם כולל תאריך לידה וקואורדינטות
 * @returns שמות המזלות { sunSign, moonSign, risingSign } | null אם אין קואורדינטות
 */
function getChartSigns(person: PersonCompatInput): {
  sunSign: string
  moonSign: string
  risingSign: string
} | null {
  if (person.latitude == null || person.longitude == null) return null
  try {
    const normalizedTime = person.birthTime.split(':').slice(0, 2).join(':')
    const datetime = new Date(`${person.birthDate}T${normalizedTime}:00`)
    const planets = getEphemerisPositions(datetime)
    const chart = assembleChart(datetime, person.latitude, person.longitude, planets)
    const sunSign = getSign(planets.sun?.longitude ?? 0)
    const moonSign = getSign(planets.moon?.longitude ?? 0)
    const risingSign = getSign(chart.ascendant)
    return { sunSign, moonSign, risingSign }
  } catch {
    return null
  }
}

// ===== POST handler =====

/** POST /api/tools/compatibility — ניתוח תאימות משולב */
export async function POST(request: NextRequest) {
  try {
    // שלב 1: אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // שלב 2: ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = CompatibilityInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const { person1, person2 } = parsed.data

    // שלב 3: חישוב תאימות נומרולוגית (סינכרוני)
    const numResult = calculateNumerologyCompatibility(
      { fullName: person1.fullName, birthDate: person1.birthDate },
      { fullName: person2.fullName, birthDate: person2.birthDate },
    )
    const numerologyScore = numResult.scores.overall

    // שלב 4: חישוב תאימות אסטרולוגית — מקביל לשני האנשים
    const [charts1, charts2] = await Promise.allSettled([
      Promise.resolve(getChartSigns(person1)),
      Promise.resolve(getChartSigns(person2)),
    ])

    const c1 = charts1.status === 'fulfilled' ? charts1.value : null
    const c2 = charts2.status === 'fulfilled' ? charts2.value : null

    // חישוב ציון אסטרולוגי — fallback=65 כשאין קואורדינטות
    const astrologyScore = c1 && c2
      ? calculateElementScore(
          c1.sunSign, c1.moonSign, c1.risingSign,
          c2.sunSign, c2.moonSign, c2.risingSign,
        )
      : 65

    // שלב 5: חישוב ציון כולל משוקלל
    const totalScore = calculateCombinedScore(numerologyScore, astrologyScore)

    // שלב 6: Anti-Barnum prompt — כל טענה מבוססת על נתונים ספציפיים שחושבו
    const p1LifePath = numResult.person1
    const p2LifePath = numResult.person2
    const p1SunSign = c1?.sunSign ?? 'לא זמין'
    const p2SunSign = c2?.sunSign ?? 'לא זמין'

    const systemPrompt = `אתה יועץ אסטרולוגיה ונומרולוגיה.

ניתוח זה מבוסס על נתונים ספציפיים שחושבו:
- ציון נומרולוגי: ${numerologyScore}/100 (בין ${p1LifePath} ו-${p2LifePath})
  • נתיב חיים: ${numResult.scores.life_path}/100
  • גורל: ${numResult.scores.destiny}/100
  • נשמה: ${numResult.scores.soul}/100
- ציון אסטרולוגי: ${astrologyScore}/100 (יסודות: ${p1SunSign} ו-${p2SunSign})
- ציון כולל: ${totalScore}/100 (נומרולוגיה 40% + אסטרולוגיה 60%)

אל תיתן הכללות — בסס כל טענה על הנתונים הספציפיים שחושבו.
ספק ניתוח קצר (3-4 משפטים) המסביר מה הציונים אומרים על הקשר.`

    const llmResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt,
      prompt: `נתח את התאימות בין ${person1.fullName} ל-${person2.fullName} לפי הנתונים שסיפקתי. היה ספציפי.`,
      maxTokens: 600,
    })

    const interpretation = String(llmResponse.data)

    // שלב 7: שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'compatibility',
      input_data: JSON.parse(JSON.stringify({ person1, person2 })),
      results: JSON.parse(JSON.stringify({
        numerologyScore,
        astrologyScore,
        totalScore,
        numerologyBreakdown: numResult.scores,
        interpretation,
      })),
      summary: `תאימות ${person1.fullName} ו-${person2.fullName}: ${totalScore}/100`,
    }
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('[compatibility] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      )
    }

    // שלב 8: החזרת תוצאה מלאה
    return NextResponse.json({
      data: {
        numerologyScore,
        astrologyScore,
        totalScore,
        numerologyBreakdown: numResult.scores,
        person1Signs: c1,
        person2Signs: c2,
        interpretation,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בניתוח תאימות' }, { status: 500 })
  }
}
