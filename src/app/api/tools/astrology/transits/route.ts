/**
 * POST /api/tools/astrology/transits — מעברים פלנטריים נוכחיים
 * אימות → טעינת מפת לידה נטלית → ephemeris לתאריך → אספקטים לנטאל → AI → שמירה
 *
 * מחשב את מיקומי הכוכבים הנוכחיים (או לתאריך נתון) ואת האספקטים שלהם
 * מול מפת הלידה הנטלית של המשתמש.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getEphemerisPositionsWithRetrograde } from '@/services/astrology/ephemeris'
import { calculateTransitAspects } from '@/services/astrology/aspects'
import { getSign } from '@/services/astrology/chart'
import { buildTransitsPrompt } from '@/services/astrology/prompts/transits'
import { invokeLLM } from '@/services/analysis/llm'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { TablesInsert } from '@/types/database'
import type { InterpretationInput } from '@/services/astrology/prompts/interpretation'
import type { PlanetPositions } from '@/services/astrology/aspects'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט טרנזיטים — תאריך היעד אופציונלי (ברירת מחדל: עכשיו) */
const InputSchema = z.object({
  /** תאריך היעד לחישוב הטרנזיטים — ISO string אופציונלי */
  targetDate: z.string().optional(),
})

// ===== POST handler =====

/** POST /api/tools/astrology/transits — מעברים פלנטריים לתאריך נתון או לעכשיו */
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

    // שליפת הקשר אישי — שם, מזל, מספר חיים
    const ctx = await getPersonalContext(supabase, user.id)

    // שלב 2: ולידציה של הקלט
    const body: unknown = await request.json().catch(() => ({}))
    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    // שלב 3: קביעת תאריך היעד — ברירת מחדל: עכשיו
    const targetDate = parsed.data.targetDate
      ? new Date(parsed.data.targetDate)
      : new Date()

    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'תאריך לא תקין' }, { status: 400 })
    }

    // שלב 4: טעינת מפת לידה נטלית מהניתוח האחרון מסוג 'astrology'
    const { data: natalAnalysis } = await supabase
      .from('analyses')
      .select('results')
      .eq('user_id', user.id)
      .eq('tool_type', 'astrology')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!natalAnalysis?.results) {
      return NextResponse.json(
        { error: 'יש ליצור מפת לידה קודם' },
        { status: 400 }
      )
    }

    // שלב 5: חילוץ כוכבי הנטאל מתוצאות הניתוח
    const results = natalAnalysis.results as Record<string, unknown>
    const planetDetails = results['planetDetails'] as Array<{
      name: string
      longitude: number
      sign: string
      house: number
      degree_in_sign: number
      is_retrograde: boolean
    }> | undefined

    if (!planetDetails || planetDetails.length === 0) {
      return NextResponse.json(
        { error: 'נתוני מפת לידה לא תקינים — יש ליצור מפת לידה מחדש' },
        { status: 400 }
      )
    }

    // בניית PlanetPositions מכוכבי הנטאל
    const natalPlanets: PlanetPositions = {}
    for (const p of planetDetails) {
      natalPlanets[p.name] = { longitude: p.longitude }
    }

    // שלב 6: חישוב מיקומי הטרנזיט באמצעות astronomy-engine
    const transitWithRetrograde = getEphemerisPositionsWithRetrograde(targetDate)

    // בניית PlanetPositions לחישוב האספקטים (רק אורכים)
    const transitingPlanets: PlanetPositions = {}
    for (const [key, val] of Object.entries(transitWithRetrograde)) {
      transitingPlanets[key] = { longitude: val.longitude }
    }

    // שלב 7: חישוב אספקטים בין כוכבי הטרנזיט לכוכבי הנטאל
    const transitAspects = calculateTransitAspects(transitingPlanets, natalPlanets)

    // שלב 8: בניית פרטי כוכבי הטרנזיט לתצוגה
    const transitingPlanetDetails = Object.entries(transitWithRetrograde).map(([name, pos]) => ({
      name,
      longitude: pos.longitude,
      sign: getSign(pos.longitude),
      degree_in_sign: Math.round((pos.longitude % 30) * 100) / 100,
      is_retrograde: pos.is_retrograde,
    }))

    // שלב 9: בדיקת תנאים מיוחדים
    const mercuryData = transitWithRetrograde['mercury']
    const mercury_retrograde = mercuryData?.is_retrograde ?? false

    // בדיקה פשוטה של void-of-course לירח: מעלה בתוך מזל > 28°
    const moonData = transitWithRetrograde['moon']
    const moonDegreeInSign = moonData ? moonData.longitude % 30 : 0
    const void_of_course_moon = moonDegreeInSign > 28

    // שלב 10: בניית קלט לפרומפט מטאל לצורך הפרשנות
    const chartData = results['chartData'] as {
      ascendant?: number
    } | undefined

    const natalSun = planetDetails.find(p => p.name === 'sun')
    const natalMoon = planetDetails.find(p => p.name === 'moon')
    const ascendantLon = chartData?.ascendant ?? 0

    const natalInterpretationInput: InterpretationInput = {
      sun: {
        sign: natalSun?.sign ?? 'Aries',
        house: natalSun?.house ?? 1,
        degree: Math.round((natalSun?.degree_in_sign ?? 0) * 10) / 10,
      },
      moon: {
        sign: natalMoon?.sign ?? 'Cancer',
        house: natalMoon?.house ?? 4,
      },
      ascendant: getSign(ascendantLon),
      planets: planetDetails.map(p => ({
        name: p.name,
        sign: p.sign,
        house: p.house,
        retrograde: p.is_retrograde,
      })),
      aspects: [],
      elementDistribution: { fire: 0, earth: 0, air: 0, water: 0 },
    }

    // בניית currentTransits לפרומפט — ממשק PlanetPositions של prompts/transits.ts
    const currentTransitsForPrompt = {
      sun: (() => {
        const s = transitWithRetrograde['sun']
        return s ? { sign: getSign(s.longitude), degree: Math.round((s.longitude % 30) * 10) / 10 } : undefined
      })(),
      moon: (() => {
        const m = transitWithRetrograde['moon']
        return m ? { sign: getSign(m.longitude), degree: Math.round((m.longitude % 30) * 10) / 10 } : undefined
      })(),
      mercury: (() => {
        const me = transitWithRetrograde['mercury']
        return me ? { sign: getSign(me.longitude), retrograde: me.is_retrograde } : undefined
      })(),
      venus: (() => {
        const v = transitWithRetrograde['venus']
        return v ? { sign: getSign(v.longitude) } : undefined
      })(),
      mars: (() => {
        const ma = transitWithRetrograde['mars']
        return ma ? { sign: getSign(ma.longitude) } : undefined
      })(),
      jupiter: (() => {
        const j = transitWithRetrograde['jupiter']
        return j ? { sign: getSign(j.longitude) } : undefined
      })(),
      saturn: (() => {
        const sa = transitWithRetrograde['saturn']
        return sa ? { sign: getSign(sa.longitude), retrograde: sa.is_retrograde } : undefined
      })(),
      uranus: (() => {
        const u = transitWithRetrograde['uranus']
        return u ? { sign: getSign(u.longitude) } : undefined
      })(),
      neptune: (() => {
        const n = transitWithRetrograde['neptune']
        return n ? { sign: getSign(n.longitude) } : undefined
      })(),
      pluto: (() => {
        const pl = transitWithRetrograde['pluto']
        return pl ? { sign: getSign(pl.longitude) } : undefined
      })(),
    }

    // שלב 11: קריאת LLM לפרשנות הטרנזיטים
    const transitPrompt = buildTransitsPrompt({
      natalChart: natalInterpretationInput,
      currentTransits: currentTransitsForPrompt,
      targetDate,
    })

    // בניית systemPrompt מועשר — אסטרולוג קבלי עם פנייה אישית
    const transitsSystemPrompt = `אתה אסטרולוג קבלי שמפרש מעברים פלנטריים.
${ctx.firstName ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.` : ''}
כל טרנזיט הוא הזדמנות לעבודה פנימית — קשר בין תנועת הכוכבים לספירות הנשמה.
ענה בעברית. שפה חמה, עמוקה, מעוררת תובנה.`

    const llmResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt: transitsSystemPrompt,
      prompt: transitPrompt,
      maxTokens: 1500,
    })

    const interpretation = String(llmResponse.data)

    // שלב 12: שמירת הניתוח ב-DB עם tool_type: 'transits'
    const strongTransits = transitAspects.filter(a => a.strength > 0.5)

    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'transits',
      input_data: JSON.parse(JSON.stringify({ targetDate: targetDate.toISOString() })),
      results: JSON.parse(JSON.stringify({
        transiting_planets: transitingPlanetDetails,
        transits: transitAspects,
        special_conditions: { mercury_retrograde, void_of_course_moon },
        interpretation,
        metadata: {
          total_transits: transitAspects.length,
          strong_transits_count: strongTransits.length,
        },
      })),
      summary: `מעברים ל-${targetDate.toLocaleDateString('he-IL')} — ${transitAspects.length} אספקטים פעילים`,
    }

    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('[astrology/transits] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      )
    }

    // שלב 13: החזרת תוצאה מלאה
    return NextResponse.json({
      data: {
        transiting_planets: transitingPlanetDetails,
        transits: transitAspects,
        special_conditions: { mercury_retrograde, void_of_course_moon },
        interpretation,
        metadata: {
          total_transits: transitAspects.length,
          strong_transits_count: strongTransits.length,
        },
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בחישוב המעברים' }, { status: 500 })
  }
}
