/**
 * POST /api/tools/astrology/synastry — סינסטרי: ניתוח תאימות אסטרולוגית בין שני גלגלות
 * אימות → ולידציה → חישוב שני גלגלות אמיתיים → אספקטים בין-גלגלות → פרשנות AI → שמירה → החזרה
 *
 * מדוע: סינסטרי הוא ניתוח השוואתי של שני גלגלות לידה — כל גלגל מחושב עם astronomy-engine
 * ואחר כך מחושבים האספקטים הבין-גלגלות עם calculateInterChartAspects.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getEphemerisPositions } from '@/services/astrology/ephemeris'
import { assembleChart, getSign } from '@/services/astrology/chart'
import { calculateInterChartAspects, getElementDistribution } from '@/services/astrology/aspects'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'
import type { PlanetPositions } from '@/services/astrology/aspects'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לנתוני אדם בסינסטרי — כולל מיקום גיאוגרפי */
const SynastryPersonSchema = z.object({
  name: z.string().min(1, 'שם חובה'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

/** סכמת ולידציה לקלט הסינסטרי */
const SynastryInputSchema = z.object({
  person1: SynastryPersonSchema,
  person2: SynastryPersonSchema,
})

/** סכמת Zod לתגובת LLM מובנית */
const SynastryResponseSchema = z.object({
  compatibility_score: z.number().min(0).max(100),
  sun_sun_dynamic: z.string().min(1),
  moon_moon_dynamic: z.string().min(1),
  venus_mars_chemistry: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  challenges: z.array(z.string().min(1)).min(1),
  recommendations: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
})

/** טיפוס תגובת LLM מאומתת */
type SynastryResponse = z.infer<typeof SynastryResponseSchema>

// ===== טיפוסים פנימיים =====

/** פרטי כוכב מורחב עם מזל, בית ומעלה */
interface PlanetDetail {
  name: string
  longitude: number
  sign: string
  house: number
  degree_in_sign: number
}

/** נתוני גלגל לידה מצומצם לשימוש בסינסטרי */
interface PersonChartData {
  name: string
  planets: PlanetPositions
  planetDetails: PlanetDetail[]
  elements: Record<string, number>
  sunSign: string
  moonSign: string
  ascendant: string
}

// ===== פונקציות עזר =====

/**
 * מוצא את מספר הבית של כוכב לפי אורכו האקליפטי
 * @param longitude - אורך אקליפטי של הכוכב (0-360)
 * @param houses - רשימת הבתים
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
    if (cusp <= nextCusp) {
      if (longitude >= cusp && longitude < nextCusp) return current.house_number
    } else {
      if (longitude >= cusp || longitude < nextCusp) return current.house_number
    }
  }
  return 1
}

/**
 * בונה נתוני גלגל לידה עבור אדם אחד
 * @param name - שם האדם
 * @param birthDate - תאריך לידה YYYY-MM-DD
 * @param birthTime - שעת לידה HH:mm (ברירת מחדל 12:00)
 * @param lat - קו רוחב
 * @param lon - קו אורך
 * @returns נתוני הגלגל המלאים
 */
function buildPersonChart(
  name: string,
  birthDate: string,
  birthTime: string | undefined,
  lat: number,
  lon: number
): PersonChartData {
  const time = birthTime ?? '12:00'
  const datetime = new Date(`${birthDate}T${time}:00`)
  const planets = getEphemerisPositions(datetime)
  const chartData = assembleChart(datetime, lat, lon, planets)

  const planetDetails: PlanetDetail[] = Object.entries(planets).map(([pName, pos]) => ({
    name: pName,
    longitude: pos.longitude,
    sign: getSign(pos.longitude),
    house: findHouseForPlanet(pos.longitude, chartData.houses),
    degree_in_sign: Math.round((pos.longitude % 30) * 100) / 100,
  }))

  const elements = getElementDistribution(planets)
  const sunDetail = planetDetails.find(p => p.name === 'sun')
  const moonDetail = planetDetails.find(p => p.name === 'moon')
  const ascendant = getSign(chartData.ascendant)

  return {
    name,
    planets,
    planetDetails,
    elements,
    sunSign: sunDetail?.sign ?? 'Aries',
    moonSign: moonDetail?.sign ?? 'Cancer',
    ascendant,
  }
}

// ===== POST handler =====

/** POST /api/tools/astrology/synastry — חישוב סינסטרי בין שני גלגלות לידה */
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
    const parsed = SynastryInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { person1, person2 } = parsed.data

    // שלב 3: חישוב שני גלגלות לידה במקביל
    const [chart1Data, chart2Data] = await Promise.all([
      Promise.resolve(buildPersonChart(
        person1.name, person1.birthDate, person1.birthTime,
        person1.latitude, person1.longitude
      )),
      Promise.resolve(buildPersonChart(
        person2.name, person2.birthDate, person2.birthTime,
        person2.latitude, person2.longitude
      )),
    ])

    // שלב 4: חישוב אספקטים בין-גלגלות
    const interAspects = calculateInterChartAspects(chart1Data.planets, chart2Data.planets)

    // שלב 5: בניית פרומפט LLM לניתוח סינסטרי
    const topAspects = interAspects
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 15)
      .map(a => `${a.planet1} ${a.type} ${a.planet2} (orb: ${a.orb}°)`)
      .join(', ')

    const systemPrompt = `אתה אסטרולוג מומחה בסינסטרי — ניתוח תאימות בין שני גלגלות לידה.
נתח את הדינמיקה הבין-אישית בין שני האנשים לפי האספקטים הבין-גלגלות.`

    const prompt = `נתח סינסטרי בין:
אדם 1: ${chart1Data.name} — שמש ב${chart1Data.sunSign}, ירח ב${chart1Data.moonSign}, עולה ב${chart1Data.ascendant}
יסודות: אש=${chart1Data.elements['fire'] ?? 0}, אדמה=${chart1Data.elements['earth'] ?? 0}, אוויר=${chart1Data.elements['air'] ?? 0}, מים=${chart1Data.elements['water'] ?? 0}

אדם 2: ${chart2Data.name} — שמש ב${chart2Data.sunSign}, ירח ב${chart2Data.moonSign}, עולה ב${chart2Data.ascendant}
יסודות: אש=${chart2Data.elements['fire'] ?? 0}, אדמה=${chart2Data.elements['earth'] ?? 0}, אוויר=${chart2Data.elements['air'] ?? 0}, מים=${chart2Data.elements['water'] ?? 0}

אספקטים בין-גלגלות עיקריים: ${topAspects}

החזר JSON עם:
- compatibility_score: ציון תאימות כולל 0-100
- sun_sun_dynamic: דינמיקת שמש-שמש (2-3 משפטים)
- moon_moon_dynamic: דינמיקת ירח-ירח (2-3 משפטים)
- venus_mars_chemistry: כימיה רומנטית/משיכה (2-3 משפטים)
- strengths: מערך 3-5 נקודות חוזקה של הקשר
- challenges: מערך 2-4 אתגרים בקשר
- recommendations: מערך 2-3 המלצות מעשיות
- summary: סיכום קצר של הסינסטרי (2-3 משפטים)`

    const responseSchema = {
      type: 'object',
      properties: {
        compatibility_score: { type: 'number', minimum: 0, maximum: 100 },
        sun_sun_dynamic: { type: 'string' },
        moon_moon_dynamic: { type: 'string' },
        venus_mars_chemistry: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        challenges: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
    }

    // שלב 6: קריאת LLM
    const llmResponse = await invokeLLM<SynastryResponse>({
      userId: user.id,
      systemPrompt,
      prompt,
      responseSchema,
      zodSchema: SynastryResponseSchema,
      maxTokens: 2000,
    })

    if (!llmResponse.validationResult?.success) {
      console.error('[synastry] LLM validation failed:', llmResponse.validationResult)
      return NextResponse.json({ error: 'שגיאה בניתוח סינסטרי — תגובה לא תקינה' }, { status: 500 })
    }

    const interpretation = llmResponse.validationResult.data as SynastryResponse

    // שלב 7: שמירה ב-DB עם tool_type: 'synastry' (קיים ב-ToolType union)
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'synastry',
      input_data: JSON.parse(JSON.stringify({
        person1: { name: person1.name, birthDate: person1.birthDate, birthTime: person1.birthTime },
        person2: { name: person2.name, birthDate: person2.birthDate, birthTime: person2.birthTime },
      })),
      results: JSON.parse(JSON.stringify({
        person1_chart: chart1Data.planetDetails,
        person2_chart: chart2Data.planetDetails,
        inter_aspects: interAspects,
        interpretation,
      })),
      summary: `סינסטרי ${chart1Data.name} & ${chart2Data.name} — ציון תאימות: ${interpretation.compatibility_score}%`,
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    // שלב 8: החזרה
    return NextResponse.json({
      data: {
        person1_chart: chart1Data.planetDetails,
        person2_chart: chart2Data.planetDetails,
        person1_meta: { sunSign: chart1Data.sunSign, moonSign: chart1Data.moonSign, ascendant: chart1Data.ascendant, elements: chart1Data.elements },
        person2_meta: { sunSign: chart2Data.sunSign, moonSign: chart2Data.moonSign, ascendant: chart2Data.ascendant, elements: chart2Data.elements },
        inter_aspects: interAspects,
        interpretation,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בניתוח סינסטרי' }, { status: 500 })
  }
}
