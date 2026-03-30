'use client'

/**
 * דף ניתוח אישיות Big Five — שאלון → ניקוד → תרשים רדאר + פרשנות AI
 * מדוע: ממשק ראשי לכלי ניתוח האישיות OCEAN — שאלון 20 שאלות ותוצאות גרפיות
 * Pattern: מצב שאלון → useMutation POST → מצב תוצאות עם RadarChart + Markdown
 */

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { RefreshCw } from 'lucide-react'
import { GiBrain } from 'react-icons/gi'
import dynamic from 'next/dynamic'

import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { DEFAULT_LOADING_PHRASE } from '@/lib/constants/mystic-loading-phrases'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MysticSkeleton } from '@/components/ui/mystic-skeleton'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { BigFiveQuestionnaire } from '@/components/features/personality/BigFiveQuestionnaire'
import { ProgressiveReveal, RevealItem } from '@/components/ui/progressive-reveal'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import { DIMENSION_LABELS } from '@/lib/constants/big-five-questions'
import type { BigFiveScores } from '@/services/personality/scoring'

/** טעינה דינמית של תרשים הרדאר — ספריית Recharts כבדה */
const BigFiveRadarChart = dynamic(
  () =>
    import('@/components/features/personality/BigFiveRadarChart').then(
      (m) => m.BigFiveRadarChart
    ),
  { ssr: false, loading: () => <MysticSkeleton className="h-[300px] w-full" /> }
)

// ===== טיפוסים =====

/** תשובת API ניתוח אישיות */
interface PersonalityApiResponse {
  data: {
    scores: BigFiveScores
    interpretation: string
    analysis_id: string | null
  }
}

/** תוצאת ניתוח שמורה */
interface PersonalityResult {
  scores: BigFiveScores
  interpretation: string
  analysis_id: string | null
}

// ===== פונקציית API =====

/**
 * שולח 20 תשובות ל-API ומחזיר ציוני Big Five + פרשנות AI
 */
async function fetchPersonalityAnalysis(
  answers: number[]
): Promise<PersonalityResult> {
  const res = await fetch('/api/tools/personality', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })

  if (!res.ok) {
    const errData = await res
      .json()
      .catch(() => ({ error: 'שגיאה בניתוח האישיות' }))
    throw new Error(
      (errData as { error?: string }).error ?? 'שגיאה בניתוח האישיות'
    )
  }

  const json = (await res.json()) as PersonalityApiResponse
  return json.data
}

// ===== קומפוננטה ראשית =====

/** דף ניתוח אישיות Big Five */
export default function PersonalityPage() {
  const [result, setResult] = useState<PersonalityResult | null>(null)
  const { incrementUsage } = useSubscription()
  const shouldReduceMotion = useReducedMotion()

  const mutation = useMutation({
    mutationFn: fetchPersonalityAnalysis,
    onSuccess: (data) => {
      setResult(data)
      toast.success('ניתוח האישיות הושלם!')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'שגיאה בניתוח האישיות'
      )
    },
  })

  /** איפוס לשאלון מחדש */
  const handleReset = () => {
    setResult(null)
    mutation.reset()
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      dir="rtl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="ניתוח אישיות — חמשת הממדים הגדולים"
        description="גלה את פרופיל האישיות שלך עם מודל OCEAN המוכח מדעית"
        icon={<GiBrain className="h-6 w-6" />}
        breadcrumbs={[
          { label: 'כלים', href: '/tools' },
          { label: 'ניתוח אישיות' },
        ]}
      />

      {/* מצב שאלון */}
      {!result && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* הסבר על המודל */}
          <Card className="border-outline-variant/10 bg-surface-container rounded-xl mystic-hover">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                מודל Big Five (OCEAN) הוא הכלי הפסיכולוגי המוכר ביותר למדידת אישיות.
                הוא מכיל 5 ממדים: פתיחות לניסיון, מצפוניות, מוחצנות, נעימות ורגישות רגשית.
                ענה על 20 שאלות קצרות וקבל תמונה מדויקת של פרופיל האישיות שלך.
              </p>
            </CardContent>
          </Card>

          {/* שאלון מוגן במנוי */}
          <SubscriptionGuard feature="analyses">
            <BigFiveQuestionnaire
              onSubmit={(answers) => mutation.mutate(answers)}
              isSubmitting={mutation.isPending}
            />
          </SubscriptionGuard>
        </motion.div>
      )}

      {/* מצב טעינה */}
      {mutation.isPending && (
        <motion.div
          {...animations.fadeIn}
          className="space-y-4 mt-6"
        >
          <MysticSkeleton className="h-[300px] w-full rounded-xl" />
          <MysticSkeleton className="h-4 w-3/4" />
          <MysticSkeleton className="h-4 w-1/2" />
          <MysticSkeleton className="h-4 w-2/3" />
        </motion.div>
      )}

      {/* תוצאות */}
      {result && (
        <ProgressiveReveal className="space-y-6 mt-4">
          {/* כפתור ניתוח חדש */}
          <RevealItem>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                ניתוח חדש
              </Button>
            </div>
          </RevealItem>

          {/* תרשים רדאר */}
          <RevealItem>
            <Card className="border-outline-variant/5 bg-surface-container rounded-xl mystic-hover">
              <CardHeader>
                <CardTitle className="text-base font-headline text-primary">
                  פרופיל האישיות שלך
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BigFiveRadarChart scores={result.scores} />
              </CardContent>
            </Card>
          </RevealItem>

          {/* ציוני הממדים */}
          <RevealItem>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(
                Object.keys(result.scores) as Array<keyof BigFiveScores>
              ).map((dim) => (
                <Card
                  key={dim}
                  className="border-outline-variant/10 bg-surface-container rounded-xl text-center"
                >
                  <CardContent className="pt-3 pb-3 space-y-1">
                    <p className="text-xs font-label text-on-surface-variant">
                      {DIMENSION_LABELS[dim]}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/40 font-label font-bold text-sm"
                    >
                      {result.scores[dim]}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RevealItem>

          {/* פרשנות AI */}
          {result.interpretation && (
            <RevealItem>
              <Card className="border-outline-variant/5 bg-surface-container rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-headline text-primary">
                    פרשנות AI — פרופיל האישיות שלך
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="result-heading-glow prose prose-invert prose-sm max-w-none font-body text-on-surface-variant leading-relaxed">
                    <ReactMarkdown>{result.interpretation}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          )}
        </ProgressiveReveal>
      )}
    </motion.div>
  )
}
