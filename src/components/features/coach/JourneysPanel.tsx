'use client'

/**
 * JourneysPanel — לוח מסעות אימון
 *
 * מציג רשימת מסעות קיימים, אפשרות לבחור תחום מיקוד וליצור מסע חדש.
 * מנהל מוטציות לעדכון צעדים והוספת מסעות.
 *
 * מדוע: נוצר כ-sub-component של דף המאמן (COCH-03, COCH-04) כדי לשמור
 * על page.tsx מתחת ל-300 שורות.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JourneyCard } from '@/components/features/coach/JourneyCard'

// ===== ממשקי טיפוסים =====

/** תחום מיקוד של מסע אימון */
type FocusArea =
  | 'life_purpose'
  | 'relationships'
  | 'career'
  | 'personal_growth'
  | 'spiritual_path'
  | 'self_discovery'
  | 'health'
  | 'creativity'

/** נתוני מסע אימון מה-API */
interface Journey {
  id: string
  title: string
  description: string | null
  focus_area: string | null
  status: string | null
  steps: JourneyStep[]
  progress_percentage: number | null
  completed_steps: number | null
  tags: string[] | null
  created_at: string | null
}

/** צעד במסע אימון */
interface JourneyStep {
  step_number: number
  title: string
  description: string
  type: 'exercise' | 'reflection' | 'insight' | 'action' | 'tool_usage' | 'meditation' | 'journaling'
  status: 'todo' | 'completed'
  completion_date?: string
  related_insight_text?: string
  related_tool_suggestion?: string
}

// ===== קבועים =====

/** רשימת תחומי מיקוד עם תוויות עבריות */
const FOCUS_AREAS: { value: FocusArea; label: string }[] = [
  { value: 'life_purpose', label: 'מטרת חיים' },
  { value: 'relationships', label: 'יחסים' },
  { value: 'career', label: 'קריירה' },
  { value: 'personal_growth', label: 'צמיחה אישית' },
  { value: 'spiritual_path', label: 'מסע רוחני' },
  { value: 'self_discovery', label: 'גילוי עצמי' },
  { value: 'health', label: 'בריאות' },
  { value: 'creativity', label: 'יצירתיות' },
]

// ===== קומפוננטה =====

/** JourneysPanel — לוח מסעות האימון עם יצירה ומעקב התקדמות */
export function JourneysPanel() {
  const queryClient = useQueryClient()
  const [showFocusSelector, setShowFocusSelector] = useState(false)

  // שליפת רשימת מסעות
  const { data: journeys = [], isLoading } = useQuery<Journey[]>({
    queryKey: ['coach-journeys'],
    queryFn: async () => {
      const res = await fetch('/api/coach/journeys')
      if (!res.ok) throw new Error('שגיאה בטעינת המסעות')
      const json = (await res.json()) as { data: Journey[] }
      return json.data ?? []
    },
  })

  // מוטציה ליצירת מסע חדש
  const createJourneyMutation = useMutation({
    mutationFn: async (focusArea: FocusArea) => {
      const res = await fetch('/api/coach/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus_area: focusArea }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאה ביצירת מסע' }))
        throw new Error((err as { error?: string }).error ?? 'שגיאה ביצירת מסע')
      }
      return res.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coach-journeys'] })
      setShowFocusSelector(false)
      toast.success('המסע נוצר בהצלחה!')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'שגיאה ביצירת המסע')
    },
  })

  // מוטציה להשלמת צעד
  const completeStepMutation = useMutation({
    mutationFn: async ({ journeyId, stepNumber }: { journeyId: string; stepNumber: number }) => {
      const res = await fetch(`/api/coach/journeys/${journeyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_number: stepNumber }),
      })
      if (!res.ok) throw new Error('שגיאה בעדכון הצעד')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coach-journeys'] }),
    onError: () => toast.error('שגיאה בסימון הצעד כהושלם'),
  })

  /** סימון צעד כהושלם */
  const handleStepComplete = (journeyId: string, stepNumber: number) => {
    completeStepMutation.mutate({ journeyId, stepNumber })
  }

  // מצב טעינה
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* כפתור יצירת מסע חדש */}
      <div className="flex justify-start">
        <Button
          onClick={() => setShowFocusSelector((prev) => !prev)}
          disabled={createJourneyMutation.isPending}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {createJourneyMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          ) : (
            <Plus className="w-4 h-4 ml-2" />
          )}
          צור מסע חדש
        </Button>
      </div>

      {/* בוחר תחום מיקוד */}
      {showFocusSelector && !createJourneyMutation.isPending && (
        <div className="rounded-xl border border-purple-500/20 bg-gray-900/50 p-4">
          <p className="mb-3 text-sm font-medium text-purple-300">בחר תחום מיקוד למסע שלך:</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map(({ value, label }) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => createJourneyMutation.mutate(value)}
                className="border-purple-500/40 text-gray-300 hover:border-purple-400 hover:bg-purple-900/30 hover:text-white"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* מצב יצירה */}
      {createJourneyMutation.isPending && (
        <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-gray-900/50 p-4 text-purple-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">המאמן יוצר עבורך מסע אימון אישי...</span>
        </div>
      )}

      {/* רשימת מסעות / מצב ריק */}
      {journeys.length === 0 && !showFocusSelector ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-purple-500/20 bg-gray-900/50 py-12 text-center">
          <p className="text-gray-400">עדיין לא התחלת מסע.</p>
          <p className="text-sm text-gray-500">
            בחר נושא ליצירת מסע אימון אישי!
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {FOCUS_AREAS.map(({ value, label }) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => createJourneyMutation.mutate(value)}
                disabled={createJourneyMutation.isPending}
                className="border-purple-500/40 text-gray-300 hover:border-purple-400 hover:bg-purple-900/30 hover:text-white"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {journeys.map((journey) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              onStepComplete={handleStepComplete}
              isUpdating={completeStepMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
