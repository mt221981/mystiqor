/**
 * POST /api/tools/astrology/birth-chart — מפת לידה אסטרולוגית
 * אימות → ולידציה → קירוב כוכבים ב-LLM → אסמבלי מפה → פרשנות AI → שמירה → החזרה
 *
 * מדוע: אין ephemeris בפאזה 4 — נשתמש ב-LLM לקירוב מיקומי הכוכבים,
 * ונסמן את התוצאה כ-isApproximate: true לשקיפות עם המשתמש.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { assembleChart, getSign } from '@/services/astrology/chart'
import { getElementDistribution } from '@/services/astrology/aspects'
import type { PlanetPositions } from '@/services/astrology/aspects'
import { buildInterpretationPrompt, INTERPRETATION_SYSTEM_PROMPT } from '@/services/astrology/prompts/interpretation'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט מפת לידה */
const InputSchema = z.object({
  /** תאריך לידה בפורמט ISO: YYYY-MM-DD */
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
  /** שעת לידה בפורמט HH:mm */
  birthTime: z.string().min(1, 'שעת לידה חובה'),
  /** קו רוחב של מקום הלידה */
  latitude: z.number(),
  /** קו אורך של מקום הלידה */
  longitude: z.number(),
  /** שם מלא של הנולד */
  fullName: z.string().min(1, 'שם מלא חובה'),
})

/** סכמת Zod לאימות תשובת LLM עם מיקומי כוכבים */
const PlanetPositionsSchema = z.record(z.string(), z.number())

// ===== קבועים =====

/** 10 שמות כוכבי הלכת הסטנדרטיים */
const PLANET_NAMES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const

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

/**
 * יוצר מיקומי כוכבים פשוטים כ-fallback כשה-LLM נכשל
 * מפזר את 10 הכוכבים כל 30° (מזל אחד לכל כוכב)
 * @returns PlanetPositions עם כוכבים ב-0, 30, 60, ... מעלות
 */
function createFallbackPlanetPositions(): PlanetPositions {
  const positions: PlanetPositions = {}
  PLANET_NAMES.forEach((name, index) => {
    positions[name] = { longitude: index * 30 }
  })
  return positions
}

// ===== POST handler =====

/** POST /api/tools/astrology/birth-chart — חישוב מפת לידה מלאה */
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
    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { birthDate, birthTime, latitude, longitude, fullName } = parsed.data

    // שלב 3: קירוב מיקומי כוכבים ב-LLM (פיתרון ל-Pitfall 2 — אין ephemeris)
    let planets: PlanetPositions = createFallbackPlanetPositions()

    try {
      const planetSystemPrompt = `אתה אסטרולוג מומחה. השתמש בידיעותיך האסטרולוגיות כדי לאמוד את מיקומי כוכבי הלכת.`
      const planetPrompt = `תאריך לידה: ${birthDate}, שעת לידה: ${birthTime}, מיקום: קו רוחב ${latitude}, קו אורך ${longitude}.
אמוד את האורך האקליפטי (0-360 מעלות) עבור כל אחד מ-10 כוכבי הלכת: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
החזר JSON בלבד: אובייקט שבו כל מפתח הוא שם הכוכב באותיות קטנות (sun, moon, וכו') וכל ערך הוא המספר.
דוגמה: {"sun": 45.2, "moon": 123.5, "mercury": 52.1, "venus": 38.7, "mars": 215.3, "jupiter": 189.4, "saturn": 302.1, "uranus": 15.8, "neptune": 356.2, "pluto": 298.7}`

      const llmPlanetResponse = await invokeLLM<Record<string, number>>({
        userId: user.id,
        systemPrompt: planetSystemPrompt,
        prompt: planetPrompt,
        responseSchema: {
          type: 'object',
          description: 'אורכי אקליפטיים של כוכבי הלכת',
          properties: Object.fromEntries(PLANET_NAMES.map(n => [n, { type: 'number' }])),
        },
        zodSchema: PlanetPositionsSchema,
        maxTokens: 300,
      })

      // ולידציה שהתשובה מכילה ערכי מספר תקינים
      if (llmPlanetResponse.validationResult?.success && llmPlanetResponse.data) {
        const rawData = llmPlanetResponse.data
        const validatedPlanets: PlanetPositions = {}
        let allValid = true

        for (const name of PLANET_NAMES) {
          const val = rawData[name]
          if (typeof val === 'number' && val >= 0 && val <= 360) {
            validatedPlanets[name] = { longitude: val }
          } else {
            allValid = false
            break
          }
        }

        if (allValid) {
          planets = validatedPlanets
        }
      }
    } catch {
      // fallback כבר הוגדר — ממשיכים עם כוכבים בריווח שווה
      console.warn('[birth-chart] LLM planet approximation failed, using fallback positions')
    }

    // שלב 4: אסמבלי מפת הגלגל — בתים + אספקטים
    const datetime = new Date(`${birthDate}T${birthTime}:00`)
    const chartData = assembleChart(datetime, latitude, longitude, planets)

    // שלב 5: בניית מידע כוכבים מפורט עם שם, מזל, בית ומעלה
    const planetDetails = Object.entries(planets).map(([name, pos]) => {
      const sign = getSign(pos.longitude)
      const house = findHouseForPlanet(pos.longitude, chartData.houses)
      const degree_in_sign = pos.longitude % 30

      return {
        name,
        longitude: pos.longitude,
        sign,
        house,
        degree_in_sign: Math.round(degree_in_sign * 100) / 100,
        is_retrograde: false,
      }
    })

    // שלב 6: בניית קלט לפרומפט הפרשנות
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

    // שלב 7: פרשנות AI — קורא buildInterpretationPrompt ואחר כך invokeLLM
    const interpretationPrompt = buildInterpretationPrompt(interpretationInput)

    const interpretationResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt: INTERPRETATION_SYSTEM_PROMPT,
      prompt: interpretationPrompt,
      maxTokens: 1500,
    })

    const interpretation = String(interpretationResponse.data)

    // שלב 8: שמירת הניתוח ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'astrology',
      input_data: JSON.parse(
        JSON.stringify({ fullName, birthDate, birthTime, latitude, longitude })
      ),
      results: JSON.parse(
        JSON.stringify({ planets: planetDetails, chartData, interpretation, isApproximate: true })
      ),
      summary: `מפת לידה — שמש ב${sunPlanet?.sign ?? 'N/A'}, ירח ב${moonPlanet?.sign ?? 'N/A'}, עולה ב${ascendantSign}`,
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    // שלב 9: החזרת תוצאה מלאה
    return NextResponse.json({
      data: {
        chartData,
        planets,
        planetDetails,
        interpretation,
        isApproximate: true,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב מפת הלידה' }, { status: 500 })
  }
}
