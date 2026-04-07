/**
 * PATCH /api/coach/journeys/[id] — מסמן צעד במסע כהושלם ומחשב מחדש את ההתקדמות
 *
 * מדוע: מאפשר למשתמש לסמן צעדים כהושלמו ולראות את ההתקדמות מתעדכנת מיידית (COCH-03).
 * מחשב progress_percentage ו-completed_steps ומעדכן את status ל-'completed' כאשר הכל הושלם.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.generated'
import { zodValidationError } from '@/lib/utils/api-error'

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

// ===== סכמות ולידציה =====

/** ולידציה על קלט PATCH */
const PatchStepSchema = z.object({
  step_number: z.number().int().min(1),
})

// ===== PATCH: סימון צעד כהושלם =====

/**
 * PATCH /api/coach/journeys/[id] — מסמן צעד כהושלם ומחשב מחדש את ההתקדמות
 *
 * @param request - הבקשה עם { step_number }
 * @param params - פרמטרי URL עם id המסע
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // שליפת מזהה המסע מה-URL
    const { id } = await params

    // ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = PatchStepSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const { step_number: stepNumber } = parsed.data

    // שליפת המסע הקיים — מאמת גם שייך למשתמש
    const { data: journey, error: fetchError } = await supabase
      .from('coaching_journeys')
      .select('steps, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !journey) {
      return NextResponse.json({ error: 'מסע לא נמצא' }, { status: 404 })
    }

    // פרסור הצעדים מ-JSONB לטיפוס מוגדר
    const rawSteps = journey.steps
    const steps: JourneyStep[] = Array.isArray(rawSteps)
      ? (rawSteps as unknown[]).map((s) => s as JourneyStep)
      : []

    // עדכון הצעד המבוקש — סטטוס 'completed' + תאריך השלמה
    const updatedSteps: JourneyStep[] = steps.map((step) => {
      if (step.step_number === stepNumber) {
        return {
          ...step,
          status: 'completed' as const,
          completion_date: new Date().toISOString(),
        }
      }
      return step
    })

    // חישוב התקדמות
    const totalSteps = updatedSteps.length
    const completedCount = updatedSteps.filter((s) => s.status === 'completed').length
    const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0
    const newStatus = progress === 100 ? 'completed' : 'active'

    // עדכון ב-DB
    const { error: updateError } = await supabase
      .from('coaching_journeys')
      .update({
        steps: updatedSteps as unknown as Json,
        completed_steps: completedCount,
        progress_percentage: progress,
        status: newStatus,
      })
      .eq('id', id)

    if (updateError) {
      console.error('[journeys PATCH] DB update error:', updateError)
      return NextResponse.json({ error: 'שגיאה בעדכון המסע' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        progress,
        completed_steps: completedCount,
        status: newStatus,
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בעדכון הצעד' }, { status: 500 })
  }
}
