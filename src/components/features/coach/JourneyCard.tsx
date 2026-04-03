'use client'

/**
 * JourneyCard — כרטיסיית מסע אימון עם רשימת צעדים מתרחבת
 *
 * מציגה מסע אימון עם פס התקדמות, צעדים עם אייקונים לפי סוג,
 * וכפתורי השלמת צעד. ניתן להרחיב/לכווץ את רשימת הצעדים.
 *
 * מדוע: ממשק ראשי ללוח מסעות האימון (COCH-04) — מאפשר צפייה
 * ומעקב התקדמות בכל מסעות האימון הפעילים.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Dumbbell,
  Brain,
  Lightbulb,
  Zap,
  Wrench,
  Heart,
  PenLine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ===== ממשקי טיפוסים =====

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

/** פרופס לכרטיסיית מסע אימון */
interface JourneyCardProps {
  journey: {
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
  onStepComplete: (journeyId: string, stepNumber: number) => void
  isUpdating?: boolean
}

// ===== קבועים =====

/** מיפוי אייקונים לפי סוג צעד */
const STEP_TYPE_ICONS = {
  exercise: Dumbbell,
  reflection: Brain,
  insight: Lightbulb,
  action: Zap,
  tool_usage: Wrench,
  meditation: Heart,
  journaling: PenLine,
} as const

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

/** מיפוי תוויות עבריות לסוגי צעד */
const STEP_TYPE_LABELS: Record<string, string> = {
  exercise: 'תרגיל',
  reflection: 'התבוננות',
  insight: 'תובנה',
  action: 'פעולה',
  tool_usage: 'שימוש בכלי',
  meditation: 'מדיטציה',
  journaling: 'כתיבה ביומן',
}

// ===== קומפוננטת צעד =====

/** פרופס לצעד בודד */
interface JourneyStepItemProps {
  step: JourneyStep
  journeyId: string
  journeyStatus: string | null
  onStepComplete: (journeyId: string, stepNumber: number) => void
  isUpdating: boolean
  index: number
}

/**
 * JourneyStepItem — צעד בודד במסע עם כפתור השלמה
 */
function JourneyStepItem({
  step,
  journeyId,
  journeyStatus,
  onStepComplete,
  isUpdating,
  index,
}: JourneyStepItemProps) {
  const StepIcon = STEP_TYPE_ICONS[step.type] ?? Lightbulb
  const isCompleted = step.status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-lg border p-4 transition-all ${
        isCompleted
          ? 'border-tertiary/30 bg-tertiary/5'
          : 'border-outline-variant/10 bg-surface-container-high/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* אייקון סטטוס */}
        <div className="mt-0.5 shrink-0">
          {isCompleted ? (
            <CheckCircle className="h-6 w-6 text-tertiary" />
          ) : (
            <Circle className="h-6 w-6 text-on-surface-variant" />
          )}
        </div>

        {/* תוכן הצעד */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm font-semibold leading-tight ${
                isCompleted ? 'text-tertiary/80 line-through' : 'text-on-surface'
              }`}
            >
              {step.step_number}. {step.title}
            </h4>
            <span className="bg-primary/10 text-primary font-label text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <StepIcon className="h-3 w-3" />
              {STEP_TYPE_LABELS[step.type] ?? step.type}
            </span>
          </div>

          <p className="mb-2 line-clamp-2 text-xs text-on-surface-variant">
            {step.description}
          </p>

          {/* תאריך השלמה */}
          {isCompleted && step.completion_date && (
            <p className="mb-2 text-xs text-tertiary">
              הושלם:{' '}
              {new Date(step.completion_date).toLocaleDateString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          )}

          {/* כפתור השלמה */}
          {!isCompleted && journeyStatus === 'active' && (
            <Button
              size="sm"
              onClick={() => onStepComplete(journeyId, step.step_number)}
              disabled={isUpdating}
              className="bg-tertiary-container text-on-tertiary-container text-xs hover:bg-tertiary-container/80"
            >
              <CheckCircle className="ms-2 h-3 w-3" />
              סמן כהושלם
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ===== קומפוננטה ראשית =====

/**
 * JourneyCard — כרטיסיית מסע אימון מתרחבת
 *
 * @param journey - נתוני המסע כולל שלבים
 * @param onStepComplete - callback לסימון צעד כהושלם
 * @param isUpdating - האם יש עדכון בתהליך (משבית כפתורים)
 */
export function JourneyCard({
  journey,
  onStepComplete,
  isUpdating = false,
}: JourneyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const progressValue = journey.progress_percentage ?? 0
  const completedStepsCount = journey.completed_steps ?? 0
  const totalSteps = journey.steps.length
  const focusLabel = journey.focus_area
    ? (FOCUS_AREA_LABELS[journey.focus_area] ?? journey.focus_area)
    : null

  return (
    <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/5 overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* תגיות עליונות */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {focusLabel && (
              <span className="bg-primary/10 text-primary font-label text-xs px-2 py-0.5 rounded-full">
                {focusLabel}
              </span>
            )}
            {journey.status === 'completed' && (
              <span className="bg-tertiary/10 text-tertiary font-label text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                הושלם
              </span>
            )}
          </div>

          {/* כותרת ותיאור */}
          <h3 className="mb-1 font-headline font-semibold text-on-surface leading-tight">
            {journey.title}
          </h3>
          {journey.description && (
            <p className="line-clamp-2 font-body text-sm text-on-surface-variant">
              {journey.description}
            </p>
          )}
        </div>

        {/* כפתור הרחב/כווץ */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="shrink-0 text-on-surface-variant hover:text-on-surface"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'כווץ צעדים' : 'הרחב צעדים'}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* פס התקדמות */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{completedStepsCount} / {totalSteps} צעדים הושלמו</span>
          <span className="font-semibold text-on-surface">{progressValue}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-gradient-to-l from-primary-container to-secondary-container transition-all duration-500"
            style={{ width: `${progressValue.toString()}%` }}
            role="progressbar"
            aria-label={`${progressValue}% הושלמו`}
            aria-valuenow={progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* רשימת צעדים (מתרחבת/מתכווצת) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-4 space-y-3">
              {journey.steps.map((step, idx) => (
                <JourneyStepItem
                  key={step.step_number}
                  step={step}
                  journeyId={journey.id}
                  journeyStatus={journey.status}
                  onStepComplete={onStepComplete}
                  isUpdating={isUpdating}
                  index={idx}
                />
              ))}

              {/* הודעת השלמת מסע */}
              {journey.status === 'completed' && (
                <div className="rounded-lg bg-gradient-to-br from-primary-container/10 to-secondary-container/10 p-4 text-center border border-primary/20">
                  <p className="text-sm font-bold text-on-surface">כל הכבוד! סיימת את המסע הזה!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* תגיות תחתונות */}
      {journey.tags && journey.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-outline-variant/10 mt-4 pt-3">
          {journey.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="bg-surface-container-high text-on-surface-variant font-label text-xs px-2 py-0.5 rounded-full border border-outline-variant/20">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
