'use client'

/**
 * דף ייעוץ קריירה — טופס כישורים ותחומי עניין + תוצאות מובנות
 * מדוע: ממשק ראשי לכלי ייעוץ הקריירה (TOOL-08) — ממשלב אסטרולוגיה עם ניתוח כישורים.
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle, AlertTriangle, TrendingUp, Zap, Compass, Star } from 'lucide-react'
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { MysticLoadingText } from '@/components/ui/mystic-loading-text'
import { MYSTIC_LOADING_PHRASES } from '@/lib/constants/mystic-loading-phrases'
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
  currentField: z.string().max(200).optional(),
  skills: z.string().min(1, 'כישורים חובה'),
  interests: z.string().min(1, 'תחומי עניין חובה'),
})

type FormValues = z.infer<typeof FormSchema>

// ===== טיפוסים =====

interface RecommendedField {
  name: string
  match_score: number
  reason: string
}

interface CareerChallenge {
  challenge: string
  solution: string
}

interface CareerResult {
  recommended_fields: RecommendedField[]
  skills_to_develop: string[]
  growth_opportunities: string[]
  challenges: CareerChallenge[]
  action_steps: string[]
  summary: string
  analysis_id: string | null
}

// ===== פונקציית API =====

async function fetchCareerGuidance(input: FormValues): Promise<CareerResult> {
  const res = await fetch('/api/tools/career', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בייעוץ קריירה' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בייעוץ קריירה')
  }
  return ((await res.json()) as { data: CareerResult }).data
}

// ===== קומפוננטה =====

/** דף ייעוץ קריירה */
export default function CareerPage() {
  const [result, setResult] = useState<CareerResult | null>(null)
  const { incrementUsage } = useSubscription()
  const shouldReduceMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchCareerGuidance,
    onSuccess: (data) => {
      setResult(data)
      toast.success('ייעוץ הקריירה הושלם')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'שגיאה בייעוץ קריירה')
    },
  })

  return (
    <motion.div
      dir="rtl"
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="ייעוץ קריירה"
        description="קבל ייעוץ קריירה מותאם אישית המשלב כישורים, תחומי עניין והקשר אסטרולוגי"
        icon={<Star className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'ייעוץ קריירה' },
        ]}
      />

      {/* טופס */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="border-outline-variant/5 bg-surface-container mystic-hover">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">פרטי הפרופיל המקצועי</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-on-surface-variant font-label">תחום נוכחי (אופציונלי)</Label>
                  <Input
                    placeholder="לדוגמה: הייטק, רפואה, חינוך..."
                    {...register('currentField')}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-on-surface-variant font-label">כישורים *</Label>
                  <Textarea
                    placeholder="פרט את הכישורים שלך — טכניים, בין-אישיים, יצירתיים..."
                    rows={3}
                    {...register('skills')}
                  />
                  {errors.skills && (
                    <p className="font-label text-xs text-error">{errors.skills.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-on-surface-variant font-label">תחומי עניין *</Label>
                  <Textarea
                    placeholder="מה מרגש אותך? אילו נושאים אתה/את אוהב/ת לחקור?"
                    rows={3}
                    {...register('interests')}
                  />
                  {errors.interests && (
                    <p className="font-label text-xs text-error">{errors.interests.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold"
                >
                  {mutation.isPending ? <MysticLoadingText text={MYSTIC_LOADING_PHRASES['career']?.button ?? 'קורא את הנתיב...'} /> : 'קבל ייעוץ קריירה'}
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
          {/* סיכום */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardContent className="pt-6">
              <p className="text-on-surface-variant text-sm font-body">{result.summary}</p>
            </CardContent>
          </Card>

          {/* תחומים מומלצים */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                <Compass className="h-4 w-4" />
                תחומים מומלצים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.recommended_fields.map((field, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface font-medium font-label">{field.name}</span>
                    <span className="text-primary font-medium font-label">{field.match_score}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    {/* inline style לרוחב דינמי — אין מקביל ב-Tailwind לערכי runtime */}
                    <div
                      className="bg-gradient-to-l from-primary-container to-secondary-container h-2 rounded-full"
                      style={{ width: `${field.match_score}%` }}
                    />
                  </div>
                  <p className="font-label text-xs text-on-surface-variant">{field.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* כישורים לפיתוח + הזדמנויות */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="border-outline-variant/5 bg-surface-container flex-1">
              <CardHeader>
                <CardTitle className="text-base font-headline text-secondary flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  כישורים לפיתוח
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.skills_to_develop.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                      <CheckCircle className="h-3 w-3 text-secondary mt-1 shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-outline-variant/5 bg-surface-container flex-1">
              <CardHeader>
                <CardTitle className="text-base font-headline text-tertiary flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  הזדמנויות צמיחה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.growth_opportunities.map((opp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                      <CheckCircle className="h-3 w-3 text-tertiary mt-1 shrink-0" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* אתגרים ופתרונות */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base font-headline text-secondary flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                אתגרים ופתרונות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.challenges.map((item, i) => (
                <div key={i} className="p-3 bg-surface-container-high rounded-lg border border-outline-variant/5">
                  <p className="text-sm text-secondary font-medium font-label mb-1">{item.challenge}</p>
                  <p className="font-label text-xs text-on-surface-variant">{item.solution}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* צעדי פעולה */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                <Zap className="h-4 w-4" />
                צעדי פעולה מיידיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.action_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant font-body">
                    <span className="text-primary font-bold shrink-0 font-label">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
