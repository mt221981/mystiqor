/**
 * POST /api/tools/synthesis — סינתזה מיסטית הוליסטית — שילוב כלי ניתוח לתמונה אחת
 * אימות → ולידציה → טעינת נתוני משתמש → invokeLLM → שמירה ב-analyses → החזרה
 *
 * מדוע: API עבור כלי הסינתזה המיסטית (SYNT-01, SYNT-02, SYNT-03) — ממשלב ניתוחים
 * ממספר כלים לפרופיל אישיות מאוחד, תחזיות ותובנות. תומך בשני מצבים:
 * on_demand (כל הניתוחים האחרונים) ו-weekly (ניתוחי 7 ימים אחרונים).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'
import { zodValidationError } from '@/lib/utils/api-error'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט הסינתזה */
const SynthesisInputSchema = z.object({
  type: z.enum(['on_demand', 'weekly']).default('on_demand'),
})

/** סכמת תגובת הסינתזה — Zod */
const SynthesisResponseSchema = z.object({
  personality_profile: z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    hidden_talents: z.array(z.string()),
  }),
  predictive_insights: z.array(
    z.object({
      timeframe: z.string(),
      area: z.string(),
      prediction: z.string(),
      probability: z.string(),
    })
  ),
  recommendations: z.array(
    z.object({
      action: z.string(),
      reason: z.string(),
      related_tool: z.string().optional(),
    })
  ),
  usage_analysis: z
    .object({
      most_used_tools: z.array(z.string()),
      peak_activity_times: z.string(),
      pattern_insight: z.string(),
    })
    .optional(),
  practical_integration: z
    .array(
      z.object({
        suggestion: z.string(),
        context: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
      })
    )
    .optional(),
  period_summary: z.string().optional(),
})

/** טיפוס תגובת הסינתזה */
type SynthesisResponse = z.infer<typeof SynthesisResponseSchema>

/** סכמת responseSchema ל-JSON mode — מראה ל-LLM מבנה הפלט הצפוי */
const SYNTHESIS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    personality_profile: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        challenges: { type: 'array', items: { type: 'string' } },
        hidden_talents: { type: 'array', items: { type: 'string' } },
      },
      required: ['summary', 'strengths', 'challenges', 'hidden_talents'],
    },
    predictive_insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timeframe: { type: 'string' },
          area: { type: 'string' },
          prediction: { type: 'string' },
          probability: { type: 'string' },
        },
        required: ['timeframe', 'area', 'prediction', 'probability'],
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          reason: { type: 'string' },
          related_tool: { type: 'string' },
        },
        required: ['action', 'reason'],
      },
    },
    usage_analysis: {
      type: 'object',
      properties: {
        most_used_tools: { type: 'array', items: { type: 'string' } },
        peak_activity_times: { type: 'string' },
        pattern_insight: { type: 'string' },
      },
    },
    practical_integration: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          suggestion: { type: 'string' },
          context: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        },
        required: ['suggestion', 'context', 'difficulty'],
      },
    },
    period_summary: { type: 'string' },
  },
  required: ['personality_profile', 'predictive_insights', 'recommendations'],
}

/** POST /api/tools/synthesis — יצירת סינתזה מיסטית */
export async function POST(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = SynthesisInputSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const synthesisType = parsed.data.type

    // חישוב תאריך לפני 7 ימים — לשימוש במצב weekly
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // טעינת נתוני משתמש במקביל
    const [profileResult, analysesResult, goalsResult, moodsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, birth_date, birth_time, gender')
        .eq('id', user.id)
        .maybeSingle(),
      synthesisType === 'weekly'
        ? supabase
            .from('analyses')
            .select('tool_type, results, summary, created_at')
            .eq('user_id', user.id)
            .neq('tool_type', 'synthesis')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(20)
        : supabase
            .from('analyses')
            .select('tool_type, results, summary, created_at')
            .eq('user_id', user.id)
            .neq('tool_type', 'synthesis')
            .order('created_at', { ascending: false })
            .limit(20),
      supabase
        .from('goals')
        .select('title, status, category, progress')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(10),
      supabase
        .from('mood_entries')
        .select('mood_score, energy_level, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(14),
    ])

    const profile = profileResult.data
    const analyses = analysesResult.data ?? []
    const goals = goalsResult.data ?? []
    const moods = moodsResult.data ?? []

    // בניית רשימת מקורות — tool_type ייחודיים מהניתוחים
    const inputSources = [...new Set(analyses.map((a) => a.tool_type))]

    // בדיקת מינימום נתונים — נדרשים לפחות 2 ניתוחים
    if (analyses.length < 2) {
      return NextResponse.json(
        { error: 'נדרשים לפחות 2 ניתוחים כדי ליצור סינתזה' },
        { status: 400 }
      )
    }

    // חישוב ממוצע מצב רוח
    const avgMood =
      moods.length > 0
        ? (moods.reduce((sum, m) => sum + (m.mood_score ?? 0), 0) / moods.length).toFixed(1)
        : 'לא ידוע'

    // בניית פרומפט הסינתזה
    let synthesisPrompt = `צור סינתזה מיסטית הוליסטית עבור המשתמש הבא. שלב את כל הנתונים מהניתוחים השונים לתמונה אחת מאוחדת.

פרטי המשתמש:
שם: ${profile?.full_name ?? 'לא ידוע'}
תאריך לידה: ${profile?.birth_date ?? 'לא ידוע'}

ניתוחים שבוצעו (${analyses.length} ניתוחים מסוגים: ${inputSources.join(', ')}):
${analyses.map((a) => `- ${a.tool_type}: ${a.summary ?? JSON.stringify(a.results).slice(0, 300)}`).join('\n')}

יעדים פעילים: ${goals.map((g) => g.title).join(', ') || 'אין'}

מצב רוח ממוצע (14 ימים): ${avgMood}/5

צור פרופיל אישיות מאוחד שמשלב נתונים מכל הכלים, תחזיות עתידיות והמלצות מעשיות.
חשוב: ציין במפורש את הקשרים בין הכלים השונים (למשל "מספר מסלול החיים 7 שלך מתיישב עם שבתאי במזל דלי...").`

    // הוספת הנחיות מיוחדות לסינתזה שבועית
    if (synthesisType === 'weekly') {
      synthesisPrompt += `

זוהי סינתזה שבועית. כלול גם:
- ניתוח שימוש: באילו כלים השתמשת הכי הרבה השבוע
- אינטגרציה מעשית: הצעות ליישום התובנות בחיי היום-יום עם רמות קושי
- סיכום תקופה: סיכום קצר של השבוע שעבר`
    }

    // קריאת LLM — סינתזה מיסטית
    const response = await invokeLLM<SynthesisResponse>({
      prompt: synthesisPrompt,
      systemPrompt:
        'אתה מומחה לסינתזה מיסטית הוליסטית. שלב ידע מאסטרולוגיה, נומרולוגיה, ניתוח ציורים, גרפולוגיה וכלים נוספים לתמונה אחת שלמה. ענה בעברית בלבד.',
      responseSchema: SYNTHESIS_RESPONSE_SCHEMA,
      zodSchema: SynthesisResponseSchema,
      maxTokens: 6000,
      userId: user.id,
    })

    // בדיקת תוקף תגובת ה-LLM
    if (!response.validationResult?.success) {
      console.error('[synthesis] LLM validation failed:', response.validationResult)
      return NextResponse.json(
        { error: 'שגיאה בסינתזה המיסטית — תגובה לא תקינה' },
        { status: 500 }
      )
    }

    const result = response.validationResult.data as SynthesisResponse

    // שמירת הסינתזה ב-DB — טבלת analyses עם tool_type: 'synthesis'
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'synthesis',
      input_data: JSON.parse(
        JSON.stringify({ sources: inputSources, type: synthesisType })
      ),
      results: JSON.parse(
        JSON.stringify({
          personality_profile: result.personality_profile,
          predictive_insights: result.predictive_insights,
          recommendations: result.recommendations,
          ...(synthesisType === 'weekly'
            ? {
                usage_analysis: result.usage_analysis,
                practical_integration: result.practical_integration,
                period_summary: result.period_summary,
              }
            : {}),
        })
      ),
      summary: result.personality_profile.summary.slice(0, 500),
    }

    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('[synthesis] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...result,
        analysis_id: analysis?.id ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בסינתזה המיסטית' }, { status: 500 })
  }
}
