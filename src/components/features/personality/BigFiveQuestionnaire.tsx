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
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>ענו על {answeredCount} מתוך 20 שאלות</span>
        <span>{Math.round((answeredCount / 20) * 100)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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
          <Card key={dimension} className="border-purple-500/20 bg-gray-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-purple-300">
                {DIMENSION_LABELS[dimension]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dimensionQuestions.map((question) => {
                const fieldIndex = question.id - 1

                return (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-sm font-medium text-gray-200 leading-relaxed block">
                      {question.id}. {question.text}
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
                                    ? 'bg-purple-600 border-purple-500 text-white font-medium'
                                    : 'border-gray-600 text-gray-400 hover:border-purple-500/50 hover:text-gray-200',
                                ].join(' ')}
                                aria-pressed={isSelected}
                                aria-label={`${value} — ${LIKERT_LABELS[value]}`}
                              >
                                <span className="font-bold text-sm">{value}</span>
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
        <p className="text-sm text-destructive text-center">
          {errors.answers.message ?? 'יש לענות על כל 20 השאלות'}
        </p>
      )}

      {/* כפתור שליחה */}
      <Button
        type="submit"
        disabled={!allAnswered || isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isSubmitting ? 'מנתח אישיות...' : 'נתח את האישיות שלי'}
      </Button>

      {!allAnswered && (
        <p className="text-xs text-center text-muted-foreground">
          יש לענות על כל {20 - answeredCount} השאלות הנותרות לפני השליחה
        </p>
      )}
    </form>
  )
}
