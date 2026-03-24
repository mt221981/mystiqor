'use client'

/**
 * שאלון Big Five — 20 שאלות ליקרט מקובצות לפי ממד
 * מדוע: ממשק ראשי לאיסוף תשובות המשתמש לניתוח האישיות
 * Pattern: React Hook Form + Zod עם ולידציה מלאה לפני שליחה
 */

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { z as ZodType } from 'zod'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BIG_FIVE_QUESTIONS,
  DIMENSION_LABELS,
  type BigFiveDimension,
} from '@/lib/constants/big-five-questions'

// ===== סכמת ולידציה =====

/** סכמת טופס — 20 תשובות ליקרט 1-5 */
const QuestionnaireSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5)).length(20, '20 תשובות נדרשות'),
})

/** טיפוס קלט הטופס */
type QuestionnaireInput = ZodType.input<typeof QuestionnaireSchema>

// ===== תוויות ליקרט =====

/** תוויות סולם ליקרט */
const LIKERT_LABELS: Record<number, string> = {
  1: 'מאוד לא מסכים/ה',
  2: 'לא מסכים/ה',
  3: 'ניטרלי/ת',
  4: 'מסכים/ה',
  5: 'מאוד מסכים/ה',
}

// ===== Props =====

/** Props לשאלון Big Five */
export interface BigFiveQuestionnaireProps {
  /** קולבק בשליחת הטופס — מקבל מערך 20 תשובות */
  onSubmit: (answers: number[]) => void
  /** האם בתהליך שליחה — מכבה את הכפתור */
  isSubmitting: boolean
}

/**
 * שאלון Big Five — 20 שאלות מקובצות לפי ממד עם ניווט קל
 */
export function BigFiveQuestionnaire({ onSubmit, isSubmitting }: BigFiveQuestionnaireProps) {
  // ברירות מחדל — null (לא נענה) לכל 20 שאלות
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuestionnaireInput>({
    resolver: zodResolver(QuestionnaireSchema),
    defaultValues: {
      answers: Array(20).fill(0) as number[],
    },
  })

  const answersWatch = watch('answers') ?? []
  const answeredCount = answersWatch.filter((a) => a >= 1 && a <= 5).length
  const allAnswered = answeredCount === 20

  const handleFormSubmit = (data: QuestionnaireInput) => {
    onSubmit(data.answers)
  }

  // קיבוץ שאלות לפי ממד — שמירה על הסדר המקורי
  const DIMENSION_ORDER: BigFiveDimension[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6" dir="rtl">
      {/* מד התקדמות */}
      <div className="flex items-center justify-between text-sm font-label text-on-surface-variant mb-2">
        <span>ענו על {answeredCount} מתוך 20 שאלות</span>
        <span>{Math.round((answeredCount / 20) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full shadow-[0_0_15px_rgba(143,45,230,0.4)] transition-all duration-300"
          style={{ width: `${(answeredCount / 20) * 100}%` }}
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={20}
        />
      </div>

      {/* שאלות לפי ממד */}
      {DIMENSION_ORDER.map((dimension) => {
        const dimensionQuestions = BIG_FIVE_QUESTIONS.filter(
          (q) => q.dimension === dimension
        )

        return (
          <Card key={dimension} className="border-outline-variant/10 bg-surface-container rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-headline text-primary">
                {DIMENSION_LABELS[dimension]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dimensionQuestions.map((question) => {
                const fieldIndex = question.id - 1

                return (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-sm font-body font-medium text-on-surface leading-relaxed block">
                      <span className="font-label text-primary text-sm">{question.id}.</span>{' '}
                      {question.text}
                    </Label>

                    <Controller
                      control={control}
                      name={`answers.${fieldIndex}`}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((value) => {
                            const isSelected = field.value === value
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={[
                                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-all',
                                  isSelected
                                    ? 'bg-primary-container/20 text-primary border-primary font-medium'
                                    : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/40',
                                ].join(' ')}
                                aria-pressed={isSelected ? true : false}
                                aria-label={`${value} — ${LIKERT_LABELS[value]}`}
                              >
                                <span className="font-label font-bold text-sm">{value}</span>
                                <span className="hidden sm:block text-center leading-tight max-w-[70px]">
                                  {LIKERT_LABELS[value]}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      {/* שגיאת ולידציה */}
      {errors.answers && (
        <p className="text-sm text-error text-center">
          {errors.answers.message ?? 'יש לענות על כל 20 השאלות'}
        </p>
      )}

      {/* כפתור שליחה */}
      <Button
        type="submit"
        disabled={!allAnswered || isSubmitting}
        className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
      >
        {isSubmitting ? 'מנתח אישיות...' : 'נתח את האישיות שלי'}
      </Button>

      {!allAnswered && (
        <p className="text-xs text-center font-label text-on-surface-variant">
          יש לענות על כל {20 - answeredCount} השאלות הנותרות לפני השליחה
        </p>
      )}
    </form>
  )
}
