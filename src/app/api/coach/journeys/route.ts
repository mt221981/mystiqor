/**
 * GET /api/coach/journeys — מחזיר רשימת מסעות אימון של המשתמש
 * POST /api/coach/journeys — יוצר מסע אימון חדש דרך LLM
 *
 * מדוע: API עבור לוח מסעות האימון (COCH-03, COCH-04) — מאפשר צפייה
 * ויצירה של מסעות אישיים מבוססי AI עם 7-12 צעדים מגוונים.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import type { TablesInsert } from '@/types/database'
import type { Json } from '@/types/database.generated'

// ===== ממשקי טיפוסים =====

/** צעד במסע אימון */
interface JourneyStep {
  step_number: number
  title: string
  description: string
  type: string
  status: 'todo' | 'completed'
  completion_date?: string
  related_insight_text?: string
  related_tool_suggestion?: string
  due_date?: string
}

/** תגובת AI על יצירת מסע אימון */
type CoachingJourneyResponse = z.infer<typeof CoachingJourneyResponseSchema>

// ===== סכמות ולידציה =====

/** ולידציה על קלט POST */
const JourneyInputSchema = z.object({
  focus_area: z.enum([
    'life_purpose',
    'relationships',
    'career',
    'personal_growth',
    'spiritual_path',
    'self_discovery',
    'health',
    'creativity',
  ]),
})

/** סכמת Zod לוולידציית תגובת LLM */
const CoachingJourneyResponseSchema = z.object({
  title: z.string(),
  description: z.string().min(150),
  focus_area: z.enum([
    'life_purpose',
    'relationships',
    'career',
    'personal_growth',
    'spiritual_path',
    'self_discovery',
    'health',
    'creativity',
  ]),
  steps: z
    .array(
      z.object({
        step_number: z.number(),
        title: z.string(),
        description: z.string().min(200),
        type: z.enum([
          'exercise',
          'reflection',
          'insight',
          'action',
          'tool_usage',
          'meditation',
          'journaling',
        ]),
        related_insight_text: z.string().optional(),
        related_tool_suggestion: z.string().optional(),
        due_date: z.string().optional(),
      })
    )
    .min(7)
    .max(12),
  tags: z.array(z.string()),
  ai_insights: z.array(z.string()).optional(),
})

/** סכמת responseSchema ל-JSON mode */
const JOURNEY_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string', minLength: 150 },
    focus_area: {
      type: 'string',
      enum: [
        'life_purpose',
        'relationships',
        'career',
        'personal_growth',
        'spiritual_path',
        'self_discovery',
        'health',
        'creativity',
      ],
    },
    steps: {
      type: 'array',
      minItems: 7,
      maxItems: 12,
      items: {
        type: 'object',
        properties: {
          step_number: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string', minLength: 200 },
          type: {
            type: 'string',
            enum: [
              'exercise',
              'reflection',
              'insight',
              'action',
              'tool_usage',
              'meditation',
              'journaling',
            ],
          },
          related_insight_text: { type: 'string' },
          related_tool_suggestion: { type: 'string' },
          due_date: { type: 'string' },
        },
        required: ['step_number', 'title', 'description', 'type'],
      },
    },
    tags: { type: 'array', items: { type: 'string' } },
    ai_insights: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'description', 'focus_area', 'steps', 'tags'],
}

/** מיפוי תחומי מיקוד לעברית */
const FOCUS_AREA_LABELS: Record<string, string> = {
  life_purpose: 'מטרת חיים',
  relationships: 'יחסים',
  career: 'קריירה',
  personal_growth: 'צמיחה אישית',
  spiritual_path: 'מסע רוחני',
  self_discovery: 'גילוי עצמי',
  health: 'בריאות',
  creativity: 'יצירתיות',
}

// ===== GET: רשימת מסעות =====

/**
 * GET /api/coach/journeys — מחזיר 20 המסעות האחרונים של המשתמש
 */
export async function GET() {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // שליפת מסעות
    const { data: journeys, error } = await supabase
      .from('coaching_journeys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[journeys GET] DB error:', error)
      return NextResponse.json({ error: 'שגיאה בשליפת מסעות' }, { status: 500 })
    }

    return NextResponse.json({ data: journeys })
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 })
  }
}

// ===== POST: יצירת מסע חדש =====

/**
 * POST /api/coach/journeys — יוצר מסע אימון אישי חדש דרך LLM
 * מקבל focus_area, בונה הקשר משתמש מקוצר, קורא ל-LLM, שומר ב-DB
 */
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

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = JourneyInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { focus_area: focusArea } = parsed.data

    // בניית הקשר משתמש מקוצר (מתחת ל-500 טוקנים)
    let userContext = ''

    try {
      // פרופיל — תאריך לידה
      const { data: profile } = await supabase
        .from('profiles')
        .select('birth_date')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.birth_date) {
        userContext += `תאריך לידה: ${profile.birth_date}\n`
      }

      // ניתוחים אחרונים — סיכומים בלבד (עד 5)
      const { data: recentAnalyses } = await supabase
        .from('analyses')
        .select('tool_type, summary')
        .eq('user_id', user.id)
        .not('summary', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentAnalyses && recentAnalyses.length > 0) {
        userContext += '\nניתוחים אחרונים:\n'
        recentAnalyses.forEach((a) => {
          if (a.summary) {
            userContext += `- ${a.tool_type}: ${a.summary.substring(0, 80)}\n`
          }
        })
      }

      // מטרות פעילות — כותרות בלבד (עד 3)
      const { data: activeGoals } = await supabase
        .from('goals')
        .select('title')
        .eq('user_id', user.id)
        .in('status', ['active', 'in_progress'])
        .limit(3)

      if (activeGoals && activeGoals.length > 0) {
        userContext += '\nמטרות פעילות:\n'
        activeGoals.forEach((g) => {
          userContext += `- ${g.title}\n`
        })
      }
    } catch {
      // הקשר משתמש הוא אופציונלי — ממשיכים בלי שגיאה
    }

    // בניית פרומפט עברי
    const focusAreaLabel = FOCUS_AREA_LABELS[focusArea] ?? focusArea
    const prompt = `צור מסע אימון אישי בנושא ${focusAreaLabel} עבור משתמש עם הרקע הבא:
${userContext || 'אין הקשר נוסף זמין'}

המסע צריך לכלול 7-12 צעדים מגוונים שמשלבים תרגילים, תובנות, פעולות מעשיות ומדיטציות.
כל צעד צריך להיות מפורט עם תיאור של לפחות 200 תווים.
השתמש בשפה חמה ואישית בעברית.`

    // קריאת LLM — יצירת מסע אימון
    const llmResponse = await invokeLLM<CoachingJourneyResponse>({
      userId: user.id,
      prompt,
      responseSchema: JOURNEY_RESPONSE_SCHEMA,
      zodSchema: CoachingJourneyResponseSchema,
      maxTokens: 6000,
    })

    // בדיקת תוקף תגובת ה-LLM
    if (!llmResponse.validationResult?.success) {
      console.error('[journeys POST] LLM validation failed:', llmResponse.validationResult)
      return NextResponse.json({ error: 'שגיאה ביצירת מסע אימון — תגובה לא תקינה' }, { status: 500 })
    }

    const aiResponse = llmResponse.validationResult.data as CoachingJourneyResponse

    // הוספת סטטוס 'todo' לכל צעד לפני שמירה
    const stepsWithStatus: JourneyStep[] = aiResponse.steps.map((s) => ({
      ...s,
      status: 'todo' as const,
    }))

    // שמירת המסע ב-DB
    const row: TablesInsert<'coaching_journeys'> = {
      user_id: user.id,
      title: aiResponse.title,
      description: aiResponse.description,
      focus_area: aiResponse.focus_area,
      journey_type: 'custom',
      steps: stepsWithStatus as unknown as Json,
      tags: aiResponse.tags,
      ai_insights: aiResponse.ai_insights?.join('\n') ?? null,
      status: 'active',
      progress_percentage: 0,
      completed_steps: 0,
    }

    const { data: journey, error: insertError } = await supabase
      .from('coaching_journeys')
      .insert(row)
      .select('*')
      .single()

    if (insertError) {
      console.error('[journeys POST] DB insert error:', insertError)
      return NextResponse.json({ error: 'שגיאה בשמירת מסע האימון' }, { status: 500 })
    }

    return NextResponse.json({ data: journey }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'שגיאה ביצירת מסע אימון' }, { status: 500 })
  }
}
