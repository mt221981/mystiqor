'use client'

/**
 * דף ניתוח יחסים — טופס שני אנשים + תוצאות ניתוח קשר
 * מדוע: ממשק ראשי לכלי ניתוח היחסים (TOOL-09) — ניתוח תאימות בין שני אנשים.
 * SubscriptionGuard מוסף בהתאם לדפוס Phase 4-5 (BASE44 לא כלל אותו).
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Heart, CheckCircle, AlertTriangle, MessageCircle, Brain } from 'lucide-react'
import { GiTwoCoins } from 'react-icons/gi'
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { MysticLoadingText } from '@/components/ui/mystic-loading-text'
import { getLoadingPhrase } from '@/lib/constants/mystic-loading-phrases'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'

// ===== סכמת ולידציה =====

const FormSchema = z.object({
  person1Name: z.string().min(1, 'שם ראשון חובה'),
  person2Name: z.string().min(1, 'שם שני חובה'),
  person1BirthDate: z.string().min(1, 'תאריך לידה ראשון חובה'),
  person2BirthDate: z.string().min(1, 'תאריך לידה שני חובה'),
  relationshipType: z.enum(['romantic', 'friendship', 'business', 'family']),
  context: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof FormSchema>

// ===== טיפוסים =====

interface RelationshipResult {
  compatibility_score: number
  summary: string
  strengths: string[]
  challenges: string[]
  recommendations: string[]
  communication_style: string
  emotional_dynamics: string
  analysis_id: string | null
}

// ===== קבועים =====

const RELATIONSHIP_TYPES = [
  { value: 'romantic' as const, label: 'רומנטי' },
  { value: 'friendship' as const, label: 'חברות' },
  { value: 'business' as const, label: 'עסקי' },
  { value: 'family' as const, label: 'משפחתי' },
]

// ===== פונקציית API =====

async function fetchRelationshipAnalysis(input: FormValues): Promise<RelationshipResult> {
  const res = await fetch('/api/tools/relationships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person1Name: input.person1Name,
      person2Name: input.person2Name,
      person1BirthDate: input.person1BirthDate,
      person2BirthDate: input.person2BirthDate,
      relationshipType: input.relationshipType,
      ...(input.context ? { context: input.context } : {}),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בניתוח יחסים' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בניתוח יחסים')
  }
  return ((await res.json()) as { data: RelationshipResult }).data
}

// ===== קומפוננטה =====

/** דף ניתוח יחסים */
export default function RelationshipsPage() {
  const [result, setResult] = useState<RelationshipResult | null>(null)
  const { incrementUsage } = useSubscription()
  const shouldReduceMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { relationshipType: 'romantic' },
  })

  const selectedType = watch('relationshipType')

  const mutation = useMutation({
    mutationFn: fetchRelationshipAnalysis,
    onSuccess: (data) => {
      setResult(data)
      toast.success('ניתוח היחסים הושלם')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'שגיאה בניתוח יחסים')
    },
  })

  /** רינדור כרטיס אדם */
  const renderPersonCard = (prefix: 'person1' | 'person2', title: string) => (
    <Card className="border-outline-variant/5 bg-surface-container flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-headline text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-on-surface-variant text-sm font-label">שם</Label>
          <Input
            placeholder="שם מלא"
            {...register(`${prefix}Name` as 'person1Name' | 'person2Name')}
          />
          {errors[`${prefix}Name` as keyof typeof errors] && (
            <p className="font-label text-xs text-error">
              {errors[`${prefix}Name` as keyof typeof errors]?.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-on-surface-variant text-sm font-label">תאריך לידה</Label>
          <Input
            type="date"
            dir="ltr"
            {...register(`${prefix}BirthDate` as 'person1BirthDate' | 'person2BirthDate')}
          />
          {errors[`${prefix}BirthDate` as keyof typeof errors] && (
            <p className="font-label text-xs text-error">
              {errors[`${prefix}BirthDate` as keyof typeof errors]?.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <motion.div
      dir="rtl"
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="ניתוח יחסים"
        description="ניתוח תאימות ודינמיקה בין שני אנשים בעזרת אסטרולוגיה ופסיכולוגיה"
        icon={<GiTwoCoins className="h-6 w-6" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'ניתוח יחסים' },
        ]}
      />

      {/* טופס */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">פרטי הקשר</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                {/* שני אנשים */}
                <div className="flex flex-col md:flex-row gap-4">
                  {renderPersonCard('person1', 'אדם ראשון')}
                  {renderPersonCard('person2', 'אדם שני')}
                </div>

                {/* סוג קשר */}
                <div className="space-y-2">
                  <Label className="text-on-surface-variant font-label">סוג הקשר</Label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIP_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setValue('relationshipType', t.value)}
                        className={`bg-primary-container/10 text-primary font-label text-xs px-2 py-1 rounded-full transition-colors ${
                          selectedType === t.value
                            ? 'bg-primary-container text-on-primary-container font-bold'
                            : 'hover:bg-surface-container-high'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* הקשר אופציונלי */}
                <div className="space-y-1">
                  <Label className="text-on-surface-variant font-label">הקשר נוסף (אופציונלי)</Label>
                  <Textarea
                    placeholder="תיאור נוסף על הקשר, מצב נוכחי, שאלות ספציפיות..."
                    rows={2}
                    {...register('context')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold"
                >
                  {mutation.isPending ? (
                    <MysticLoadingText text={getLoadingPhrase('relationships').button} />
                  ) : (
                    'נתח יחסים'
                  )}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {/* תוצאות */}
      {result && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {/* ציון תאימות */}
          <Card className="border-outline-variant/5 bg-surface-container text-center">
            <CardContent className="pt-6">
              <div
                className={`text-6xl font-headline font-bold ${
                  result.compatibility_score >= 75
                    ? 'text-tertiary'
                    : result.compatibility_score >= 50
                      ? 'text-secondary'
                      : 'text-error'
                }`}
              >
                {result.compatibility_score}%
              </div>
              <p className="text-on-surface-variant text-sm mt-1 font-label">ציון תאימות</p>
              <p className="text-on-surface-variant text-sm mt-2 font-body">{result.summary}</p>
            </CardContent>
          </Card>

          {/* סגנון תקשורת + דינמיקה רגשית */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="border-outline-variant/5 bg-surface-container flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-headline text-secondary flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  סגנון תקשורת
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-on-surface-variant font-body">{result.communication_style}</p>
              </CardContent>
            </Card>
            <Card className="border-outline-variant/5 bg-surface-container flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  דינמיקה רגשית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-on-surface-variant font-body">{result.emotional_dynamics}</p>
              </CardContent>
            </Card>
          </div>

          {/* חוזקות ואתגרים */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="border-outline-variant/5 bg-surface-container flex-1">
              <CardHeader>
                <CardTitle className="text-base font-headline text-tertiary flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  נקודות חוזקה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                      <CheckCircle className="h-3 w-3 text-tertiary mt-1 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-outline-variant/5 bg-surface-container flex-1">
              <CardHeader>
                <CardTitle className="text-base font-headline text-secondary flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  אתגרים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                      <AlertTriangle className="h-3 w-3 text-secondary mt-1 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* המלצות */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base font-headline text-primary">המלצות לחיזוק הקשר</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                    <span className="text-primary font-bold shrink-0 font-label">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
