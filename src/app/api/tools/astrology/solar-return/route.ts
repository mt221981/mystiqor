/**
 * POST /api/tools/astrology/solar-return — מהפכה שמשית שנתית
 * אימות → פרופיל → findSolarReturn → getEphemerisPositions → assembleChart → AI → שמירה
 *
 * מחשב את הרגע המדויק שבו השמש חוזרת למיקום הלידה שלה, ואת מפת הכוכבים
 * באותו רגע — בסיס לתחזית השנתית.
 *
 * Per Pitfall 4: חובה לקרוא getEphemerisPositions(srDate) — לא LLM.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { findSolarReturn } from '@/services/astrology/solar-return'
import { getEphemerisPositions, getEphemerisPositionsWithRetrograde } from '@/services/astrology/ephemeris'
import { assembleChart, getSign } from '@/services/astrology/chart'
import { getElementDistribution } from '@/services/astrology/aspects'
import { buildSolarReturnPrompt } from '@/services/astrology/prompts/solar-return'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { TablesInsert } from '@/types/database'
import type { InterpretationInput } from '@/services/astrology/prompts/interpretation'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט מהפכה שמשית */
const InputSchema = z.object({
  /** שנת היעד לחישוב המהפכה */
  targetYear: z
    .number()
    .int('שנה חייבת להיות מספר שלם')
    .min(1900, 'שנה מינימלית: 1900')
    .max(2100, 'שנה מקסימלית: 2100'),
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

    if (cusp <= nextCusp) {
      if (longitude >= cusp && longitude < nextCusp) return current.house_number
    } else {
      if (longitude >= cusp || longitude < nextCusp) return current.house_number
    }
  }
  return 1
}

// ===== POST handler =====

/** POST /api/tools/astrology/solar-return — חישוב מהפכה שמשית לשנה נתונה */
export async function POST(request: NextRequest) {
  try {
    // שלב 1: אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // שליפת הקשר אישי — שם, מזל, מספר חיים
    const ctx = await getPersonalContext(supabase, user.id)

    // שלב 2: ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { targetYear } = parsed.data

    // שלב 3: שליפת פרופיל משתמש לנתוני לידה
    const { data: profile } = await supabase
      .from('profiles')
      .select('birth_date, latitude, longitude')
      .eq('id', user.id)
      .single()

    if (!profile?.birth_date) {
      return NextResponse.json(
        { error: 'חסרים נתוני לידה בפרופיל — אנא מלא את פרופיל הלידה' },
        { status: 400 }
      )
    }

    const birthLat = profile.latitude ?? 31.7683
    const birthLon = profile.longitude ?? 35.2137

    // שלב 4: מציאת רגע המהפכה השמשית באמצעות חיפוש בינארי
    const srDate = findSolarReturn(
      {
        birthDate: profile.birth_date,
        birthLat,
        birthLon,
      },
      targetYear
    )

    // שלב 5: חישוב מיקומי כוכבים ברגע המהפכה באמצעות astronomy-engine
    // Per Pitfall 4: חובה להשתמש ב-getEphemerisPositions — לא LLM
    const srPlanets = getEphemerisPositions(srDate)
    const srPlanetsWithRetrograde = getEphemerisPositionsWithRetrograde(srDate)

    // שלב 6: אסמבלי מפת הגלגל ברגע המהפכה
    const srChartData = assembleChart(srDate, birthLat, birthLon, srPlanets)

    // שלב 7: בניית פרטי כוכבים מפורטים
    const srPlanetDetails = Object.entries(srPlanets).map(([name, pos]) => {
      const sign = getSign(pos.longitude)
      const house = findHouseForPlanet(pos.longitude, srChartData.houses)
      const degree_in_sign = pos.longitude % 30
      const is_retrograde = srPlanetsWithRetrograde[name]?.is_retrograde ?? false

      return {
        name,
        longitude: pos.longitude,
        sign,
        house,
        degree_in_sign: Math.round(degree_in_sign * 100) / 100,
        is_retrograde,
      }
    })

    // שלב 8: התפלגות יסודות
    const elementDistribution = getElementDistribution(srPlanets)

    // שלב 9: טעינת מפת לידה נטלית להשוואה (לפרומפט ה-AI)
    let natalInterpretationInput: InterpretationInput | null = null

    try {
      const { data: natalAnalysis } = await supabase
        .from('analyses')
        .select('results')
        .eq('user_id', user.id)
        .eq('tool_type', 'astrology')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (natalAnalysis?.results) {
        const natalResults = natalAnalysis.results as Record<string, unknown>
        const natalPlanetDetails = natalResults['planetDetails'] as Array<{
          name: string
          longitude: number
          sign: string
          house: number
          degree_in_sign: number
          is_retrograde: boolean
        }> | undefined

        if (natalPlanetDetails && natalPlanetDetails.length > 0) {
          const natalChartData = natalResults['chartData'] as { ascendant?: number } | undefined
          const natalSun = natalPlanetDetails.find(p => p.name === 'sun')
          const natalMoon = natalPlanetDetails.find(p => p.name === 'moon')

          natalInterpretationInput = {
            sun: {
              sign: natalSun?.sign ?? 'Aries',
              house: natalSun?.house ?? 1,
              degree: Math.round((natalSun?.degree_in_sign ?? 0) * 10) / 10,
            },
            moon: {
              sign: natalMoon?.sign ?? 'Cancer',
              house: natalMoon?.house ?? 4,
            },
            ascendant: getSign(natalChartData?.ascendant ?? 0),
            planets: natalPlanetDetails.map(p => ({
              name: p.name,
              sign: p.sign,
              house: p.house,
              retrograde: p.is_retrograde,
            })),
            aspects: [],
            elementDistribution: { fire: 0, earth: 0, air: 0, water: 0 },
          }
        }
      }
    } catch {
      // נכשל בשליפת נטאל — ממשיך ללא השוואה נטלית
    }

    // שלב 10: בניית InterpretationInput למפת המהפכה השמשית
    const srSun = srPlanetDetails.find(p => p.name === 'sun')
    const srMoon = srPlanetDetails.find(p => p.name === 'moon')
    const srAscendantSign = getSign(srChartData.ascendant)

    const srInterpretationInput: InterpretationInput = {
      sun: {
        sign: srSun?.sign ?? 'Aries',
        house: srSun?.house ?? 1,
        degree: Math.round((srSun?.degree_in_sign ?? 0) * 10) / 10,
      },
      moon: {
        sign: srMoon?.sign ?? 'Cancer',
        house: srMoon?.house ?? 4,
      },
      ascendant: srAscendantSign,
      planets: srPlanetDetails.map(p => ({
        name: p.name,
        sign: p.sign,
        house: p.house,
        retrograde: p.is_retrograde,
      })),
      aspects: srChartData.aspects.map(a => ({
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type,
        orb: a.orb,
      })),
      elementDistribution: {
        fire: elementDistribution['fire'] ?? 0,
        earth: elementDistribution['earth'] ?? 0,
        air: elementDistribution['air'] ?? 0,
        water: elementDistribution['water'] ?? 0,
      },
    }

    // שלב 11: בניית פרומפט ה-AI
    const birthInterpretation = natalInterpretationInput ?? srInterpretationInput

    const srPrompt = buildSolarReturnPrompt({
      birthChart: birthInterpretation,
      solarReturnChart: srInterpretationInput,
      targetYear,
    })

    // בניית systemPrompt מועשר — אסטרולוג קבלי עם פנייה אישית
    const solarReturnSystemPrompt = `אתה אסטרולוג קבלי עמוק שמפרש מפות חזרת שמש.
${ctx.firstName ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.` : ''}
חזרת השמש היא רגע של התחדשות נשמתית — התייחס אליו כאל נתיב חדש בעץ החיים.
ענה בעברית. שפה חמה, אינטימית, חודרת.`

    // שלב 12: קריאת LLM לפרשנות המהפכה השמשית (תחזית שנתית מפורטת)
    const llmResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt: solarReturnSystemPrompt,
      prompt: srPrompt,
      maxTokens: 2000,
    })

    const interpretation = String(llmResponse.data)

    // שלב 13: שמירת הניתוח ב-DB עם tool_type: 'solar_return'
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'solar_return',
      input_data: JSON.parse(JSON.stringify({ targetYear })),
      results: JSON.parse(JSON.stringify({
        sr_moment: srDate.toISOString(),
        sr_chart: srChartData,
        planets: srPlanetDetails,
        element_distribution: elementDistribution,
        interpretation,
      })),
      summary: `מהפכה שמשית ${targetYear} — שמש ב${srSun?.sign ?? 'N/A'}, עולה ב${srAscendantSign}`,
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    // שלב 14: החזרת תוצאה מלאה
    return NextResponse.json({
      data: {
        sr_moment: srDate.toISOString(),
        sr_chart: srChartData,
        planets: srPlanetDetails,
        element_distribution: elementDistribution,
        interpretation,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב המהפכה השמשית' }, { status: 500 })
  }
}
