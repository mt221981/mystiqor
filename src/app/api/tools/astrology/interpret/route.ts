/**
 * POST /api/tools/astrology/interpret — פרשנות AI נפרדת למפת לידה
 * מופרד מחישוב המפה לביצועים — calc מהיר, LLM איטי
 * Input: { chartResult: { chartData, planets, planetDetails } , analysisId?: string }
 * Returns: { interpretation: string }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { buildInterpretationPrompt, INTERPRETATION_SYSTEM_PROMPT } from '@/services/astrology/prompts/interpretation'
import { invokeLLM } from '@/services/analysis/llm'
import { getSign } from '@/services/astrology/chart'
import { getElementDistribution } from '@/services/astrology/aspects'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

// ===== סכמות ולידציה =====

/** מיקום כוכב לכת מהתגובה של birth-chart */
const PlanetDetailSchema = z.object({
  name: z.string(),
  longitude: z.number(),
  sign: z.string(),
  house: z.number(),
  degree_in_sign: z.number(),
  is_retrograde: z.boolean(),
})

/** נתוני מפת גלגל מהתגובה של birth-chart */
const ChartDataSchema = z.object({
  ascendant: z.number(),
  midheaven: z.number(),
  houses: z.array(z.object({
    house_number: z.number(),
    cusp_longitude: z.number(),
    sign: z.string(),
  })),
  aspects: z.array(z.object({
    planet1: z.string(),
    planet2: z.string(),
    type: z.string(),
    orb: z.number(),
    strength: z.number(),
  })),
})

/** סכמת קלט לנקודת הפרשנות */
const InterpretInputSchema = z.object({
  /** תוצאות חישוב המפה */
  chartData: ChartDataSchema,
  /** מיקומי כוכבים (שם → אורך אקליפטי) */
  planets: z.record(z.string(), z.object({ longitude: z.number() })),
  /** רשימת כוכבים מפורטת עם מזל, בית ורטרוגרד */
  planetDetails: z.array(PlanetDetailSchema),
  /** מזהה הניתוח לעדכון (אופציונלי) */
  analysisId: z.string().uuid().optional(),
})

// ===== POST handler =====

/**
 * POST /api/tools/astrology/interpret — מריץ פרשנות AI על מפת לידה קיימת
 * מיועד לשימוש אחרי birth-chart API, לפרשנות עצמאית ומהירה
 */
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
    const parsed = InterpretInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const { chartData, planets, planetDetails, analysisId } = parsed.data

    // שלב 3: בניית קלט לפרומפט פרשנות
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

    // שלב 4: קריאה ל-LLM לפרשנות
    const interpretationPrompt = buildInterpretationPrompt(interpretationInput)
    const interpretationResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt: INTERPRETATION_SYSTEM_PROMPT,
      prompt: interpretationPrompt,
      maxTokens: 1200,
    })

    const interpretation = String(interpretationResponse.data)

    // שלב 5: עדכון ניתוח קיים אם analysisId סופק
    if (analysisId) {
      const { data: existing } = await supabase
        .from('analyses')
        .select('results')
        .eq('id', analysisId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        const updatedResults = {
          ...(typeof existing.results === 'object' && existing.results !== null
            ? existing.results
            : {}),
          interpretation,
        }
        await supabase
          .from('analyses')
          .update({ results: updatedResults })
          .eq('id', analysisId)
          .eq('user_id', user.id)
      }
    }

    // שלב 6: החזרת פרשנות
    return NextResponse.json({ data: { interpretation } })
  } catch {
    return NextResponse.json({ error: 'שגיאה בפרשנות מפת הלידה' }, { status: 500 })
  }
}
