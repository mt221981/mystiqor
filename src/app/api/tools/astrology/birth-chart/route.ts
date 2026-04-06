/**
 * POST /api/tools/astrology/birth-chart — מפת לידה אסטרולוגית
 * אימות → ולידציה → ephemeris אמיתי → אסמבלי מפה → פרשנות AI → שמירה → החזרה
 *
 * עודכן בפאזה 6: מיקומי כוכבים מחושבים באמצעות astronomy-engine (דיוק ±1 arcminute)
 * במקום קירוב LLM שהיה בשימוש בפאזה 4. דגל הקירוב הוסר לחלוטין.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { assembleChart, getSign } from '@/services/astrology/chart'
import { getElementDistribution } from '@/services/astrology/aspects'
import { getEphemerisPositions, getEphemerisPositionsWithRetrograde } from '@/services/astrology/ephemeris'
import { buildInterpretationPrompt, INTERPRETATION_SYSTEM_PROMPT } from '@/services/astrology/prompts/interpretation'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט מפת לידה */
const InputSchema = z.object({
  /** תאריך לידה בפורמט ISO: YYYY-MM-DD */
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
  /** שעת לידה בפורמט HH:mm — ברירת מחדל 12:00 */
  birthTime: z.string().default('12:00'),
  /** קו רוחב של מקום הלידה — ברירת מחדל ירושלים (coerce כי הפרונט שולח string) */
  latitude: z.coerce.number().min(-90).max(90).default(31.7683),
  /** קו אורך של מקום הלידה — ברירת מחדל ירושלים (coerce כי הפרונט שולח string) */
  longitude: z.coerce.number().min(-180).max(180).default(35.2137),
  /** שם מלא של הנולד */
  fullName: z.string().min(1, 'שם מלא חובה'),
})

// ===== פונקציות עזר =====

/**
 * מוצא את מספר הבית של כוכב לפי אורכו האקליפטי ורשימת הבתים
 * @param longitude - אורך אקליפטי של הכוכב (0-360)
 * @param houses - רשימת הבתים עם קודקוד כל בית
 * @returns מספר הבית (1-12)
 */
function findHouseForPlanet(
  longitude: number,
  houses: Array<{ house_number: number; cusp_longitude: number }>
): number {
  for (let i = 0; i < houses.length; i++) {
    const current = houses[i]
    const next = houses[(i + 1) % 12]
    if (!current || !next) continue

    const cusp = current.cusp_longitude
    const nextCusp = next.cusp_longitude

    // טיפול בחצייה של 0°/360°
    if (cusp <= nextCusp) {
      if (longitude >= cusp && longitude < nextCusp) return current.house_number
    } else {
      // הבית חוצה את גבול 0°/360°
      if (longitude >= cusp || longitude < nextCusp) return current.house_number
    }
  }
  return 1 // ברירת מחדל לבית 1
}

// ===== POST handler =====

/** POST /api/tools/astrology/birth-chart — חישוב מפת לידה מלאה עם ephemeris אמיתי */
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
    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const { birthDate, birthTime, latitude, longitude, fullName } = parsed.data

    // שלב 3: שליפת הקשר אישי להעשרת הפרומפט
    const ctx = await getPersonalContext(supabase, user.id)

    // שלב 4: חישוב מיקומי כוכבים באמצעות astronomy-engine (ephemeris אמיתי)
    // נרמול birthTime — Supabase TIME מחזיר HH:mm:ss, צריך HH:mm
    const normalizedTime = birthTime.split(':').slice(0, 2).join(':')
    const datetime = new Date(`${birthDate}T${normalizedTime}:00`)
    if (isNaN(datetime.getTime())) {
      console.error('[birth-chart] Invalid date:', { birthDate, birthTime })
      return NextResponse.json({ error: 'תאריך או שעת לידה לא תקינים' }, { status: 400 })
    }
    const planets = getEphemerisPositions(datetime)
    const planetsWithRetrograde = getEphemerisPositionsWithRetrograde(datetime)

    // שלב 5: אסמבלי מפת הגלגל — בתים + אספקטים
    const chartData = assembleChart(datetime, latitude, longitude, planets)

    // שלב 6: בניית מידע כוכבים מפורט עם שם, מזל, בית, מעלה ורטרוגרד
    const planetDetails = Object.entries(planets).map(([name, pos]) => {
      const sign = getSign(pos.longitude)
      const house = findHouseForPlanet(pos.longitude, chartData.houses)
      const degree_in_sign = pos.longitude % 30
      // מידע רטרוגרד מחושב מהאפמריס — לא קבוע false
      const is_retrograde = planetsWithRetrograde[name]?.is_retrograde ?? false

      return {
        name,
        longitude: pos.longitude,
        sign,
        house,
        degree_in_sign: Math.round(degree_in_sign * 100) / 100,
        is_retrograde,
      }
    })

    // שלב 7: בניית קלט לפרומפט הפרשנות
    const sunPlanet = planetDetails.find(p => p.name === 'sun')
    const moonPlanet = planetDetails.find(p => p.name === 'moon')
    const ascendantSign = getSign(chartData.ascendant)
    const elementDist = getElementDistribution(planets)

    const interpretationInput = {
      sun: {
        sign: sunPlanet?.sign ?? 'Aries',
        house: sunPlanet?.house ?? 1,
        degree: Math.round((sunPlanet?.degree_in_sign ?? 0) * 10) / 10,
      },
      moon: {
        sign: moonPlanet?.sign ?? 'Cancer',
        house: moonPlanet?.house ?? 4,
      },
      ascendant: ascendantSign,
      planets: planetDetails.map(p => ({
        name: p.name,
        sign: p.sign,
        house: p.house,
        retrograde: p.is_retrograde,
      })),
      aspects: chartData.aspects.map(a => ({
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type,
        orb: a.orb,
      })),
      elementDistribution: {
        fire: elementDist['fire'] ?? 0,
        earth: elementDist['earth'] ?? 0,
        air: elementDist['air'] ?? 0,
        water: elementDist['water'] ?? 0,
      },
    }

    // שלב 8: פרשנות AI — בניית systemPrompt מועשר עם הקשר אישי (Pitfall 6: לא נוגעים ב-INTERPRETATION_SYSTEM_PROMPT)
    const interpretationPrompt = buildInterpretationPrompt(interpretationInput)

    // הוספת שורת הכרות אישית — INTERPRETATION_SYSTEM_PROMPT נשאר ללא שינוי
    const personalLine = ctx.firstName
      ? `\n\nפנה ישירות אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}. דבר אליו באופן אישי.`
      : ''
    const enrichedSystemPrompt = INTERPRETATION_SYSTEM_PROMPT + personalLine

    const interpretationResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt: enrichedSystemPrompt,
      prompt: interpretationPrompt,
      maxTokens: 1500,
    })

    const interpretation = String(interpretationResponse.data)

    // שלב 9: שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'astrology',
      input_data: JSON.parse(
        JSON.stringify({ fullName, birthDate, birthTime, latitude, longitude })
      ),
      results: JSON.parse(
        JSON.stringify({ planets: planetDetails, chartData, interpretation })
      ),
      summary: `מפת לידה — שמש ב${sunPlanet?.sign ?? 'N/A'}, ירח ב${moonPlanet?.sign ?? 'N/A'}, עולה ב${ascendantSign}`,
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    // שלב 10: החזרת תוצאה מלאה
    return NextResponse.json({
      data: {
        chartData,
        planets,
        planetDetails,
        interpretation,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch (error) {
    console.error('[birth-chart] POST error:', error instanceof Error ? error.message : error, error instanceof Error ? error.stack : '')
    return NextResponse.json({ error: 'שגיאה בחישוב מפת הלידה' }, { status: 500 })
  }
}
