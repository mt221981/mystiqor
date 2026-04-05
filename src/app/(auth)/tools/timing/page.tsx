'use client'

/**
 * דף כלי תזמון — מציאת ימים מועדפים לפי פעילות אסטרולוגית
 * מאפשר בחירת סוג פעילות וטווח תאריכים, ומציג ימים מדורגים לפי ציון אסטרולוגי
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Calendar, Star, AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { MysticLoadingText } from '@/components/ui/mystic-loading-text'
import { DEFAULT_LOADING_PHRASE } from '@/lib/constants/mystic-loading-phrases'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import { ACTIVITY_TYPES, ACTIVITY_LABELS, type ActivityType } from '@/lib/constants/timing-activities'

// ===== סכמות ולידציה =====

const FormSchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  startDate: z.string().min(1, 'תאריך התחלה חובה'),
  endDate: z.string().min(1, 'תאריך סיום חובה'),
})

type FormValues = z.infer<typeof FormSchema>

// ===== טיפוסים =====

interface DayScore {
  date: string
  score: number
  moonSign: string
  favorable: string[]
  unfavorable: string[]
  mercury_retrograde: boolean
  near_void_moon: boolean
}

interface TimingResult {
  bestDays: DayScore[]
  worstDays: DayScore[]
  allDays: DayScore[]
  activityType: string
  activityLabel: string
  interpretation: string
  analysis_id: string | null
}

// ===== פונקציות עזר =====

async function fetchTiming(input: FormValues): Promise<TimingResult> {
  const res = await fetch('/api/tools/timing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בחישוב תזמון' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בחישוב תזמון')
  }
  return ((await res.json()) as { data: TimingResult }).data
}

/** תאריך ברירת מחדל: היום + 14 ימים */
function getDefaultEndDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().split('T')[0] ?? ''
}

/** תאריך היום */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

/** צבע ציון */
function scoreColor(score: number): string {
  if (score >= 70) return 'text-tertiary'
  if (score >= 50) return 'text-secondary'
  return 'text-error'
}

/** רוחב ציון */
function scoreBgColor(score: number): string {
  if (score >= 70) return 'bg-tertiary'
  if (score >= 50) return 'bg-secondary'
  return 'bg-error'
}

/** עיצוב תאריך לעברית */
function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

// ===== קומפוננטת תוצאות =====

interface TimingResultsProps {
  result: TimingResult
}

function TimingResults({ result }: TimingResultsProps) {
  const [showWorstDays, setShowWorstDays] = useState(false)

  const topDay = result.bestDays[0]

  return (
    <motion.div
      initial={animations.fadeInUp.initial}
      animate={animations.fadeInUp.animate}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      {/* המלצה ראשית */}
      {topDay && (
        <Card className="border-tertiary/20 bg-tertiary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline text-tertiary flex items-center gap-2">
              <Star className="h-5 w-5 fill-current" />
              יום מומלץ ביותר
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-headline font-bold text-tertiary">{formatDate(topDay.date)}</span>
              <span className={`text-xl font-headline font-bold ${scoreColor(topDay.score)}`}>{topDay.score}/100</span>
              <span className="text-on-surface-variant text-sm font-label">ירח ב{topDay.moonSign}</span>
            </div>
            {result.interpretation && (
              <p className="text-on-surface-variant text-sm font-body">{result.interpretation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ימים מומלצים */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            ימים מומלצים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.bestDays.map((day, i) => (
            <div key={day.date} className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-on-surface-variant/80 text-xs w-4 shrink-0 font-label">{i + 1}.</span>
                <span className="text-on-surface text-sm font-medium w-24 shrink-0 font-label">{formatDate(day.date)}</span>
                <div className="flex-1 bg-surface-container-high rounded-full h-2">
                  {/* inline style for dynamic score width */}
                  <div className={`h-2 rounded-full ${scoreBgColor(day.score)}`} style={{ width: `${day.score}%` }} />
                </div>
                <span className={`text-sm font-medium w-10 text-end shrink-0 font-headline ${scoreColor(day.score)}`}>
                  {day.score}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 ps-7">
                <span className="font-label text-xs text-on-surface-variant me-1">ירח ב{day.moonSign}</span>
                {day.mercury_retrograde && (
                  <span className="font-label text-xs bg-primary-container/10 text-primary px-2 py-0.5 rounded-full">מרקורי ℞</span>
                )}
                {day.near_void_moon && (
                  <span className="font-label text-xs bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">ירח חסר חלקיות</span>
                )}
                {day.favorable.slice(0, 2).map((f, j) => (
                  <span key={j} className="font-label text-xs bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full">{f}</span>
                ))}
                {day.unfavorable.slice(0, 1).map((u, j) => (
                  <span key={j} className="font-label text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{u}</span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ימים פחות מומלצים — מכווץ כברירת מחדל */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowWorstDays(!showWorstDays)}
            className="w-full flex items-center justify-between text-base font-headline text-error font-bold"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ימים פחות מומלצים ({result.worstDays.length})
            </span>
            {showWorstDays ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CardHeader>
        {showWorstDays && (
          <CardContent className="space-y-3">
            {result.worstDays.map((day) => (
              <div key={day.date} className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-on-surface text-sm font-medium w-24 shrink-0 font-label">{formatDate(day.date)}</span>
                  <div className="flex-1 bg-surface-container-high rounded-full h-2">
                    <div className={`h-2 rounded-full ${scoreBgColor(day.score)}`} style={{ width: `${day.score}%` }} />
                  </div>
                  <span className={`text-sm font-medium w-10 text-end shrink-0 font-headline ${scoreColor(day.score)}`}>
                    {day.score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="font-label text-xs text-on-surface-variant me-1">ירח ב{day.moonSign}</span>
                  {day.unfavorable.slice(0, 2).map((u, j) => (
                    <span key={j} className="font-label text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{u}</span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}

// ===== קומפוננטת הדף הראשית =====

export default function TimingPage() {
  const [result, setResult] = useState<TimingResult | null>(null)
  const { incrementUsage } = useSubscription()
  const shouldReduceMotion = useReducedMotion()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      activityType: 'important_meeting',
      startDate: getTodayDate(),
      endDate: getDefaultEndDate(),
    },
  })

  const selectedActivity = watch('activityType')

  const mutation = useMutation({
    mutationFn: fetchTiming,
    onSuccess: (data) => {
      setResult(data)
      toast.success('חישוב תזמון הושלם')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (err) => { toast.error(err instanceof Error ? err.message : 'שגיאה בחישוב תזמון') },
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
        title="כלי תזמון"
        description="מצא את הימים האסטרולוגיים הטובים ביותר לפעילות שלך"
        icon={<Clock className="h-6 w-6" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'כלי תזמון' },
        ]}
      />

      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">הגדרות תזמון</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
                {/* סוג פעילות */}
                <div className="space-y-2">
                  <Label className="text-on-surface-variant font-label">סוג פעילות</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('activityType', type as ActivityType)}
                        className={`bg-primary-container/10 text-primary font-label text-xs px-2 py-1 rounded-full transition-colors ${
                          selectedActivity === type
                            ? 'bg-primary-container text-on-primary-container font-bold'
                            : 'hover:bg-surface-container-high'
                        }`}
                      >
                        {ACTIVITY_LABELS[type as ActivityType]}
                      </button>
                    ))}
                  </div>
                  {errors.activityType && <p className="font-label text-xs text-error">{errors.activityType.message}</p>}
                </div>

                {/* טווח תאריכים */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-on-surface-variant text-sm font-label">תאריך התחלה</Label>
                    <Input type="date" dir="ltr" {...register('startDate')} />
                    {errors.startDate && <p className="font-label text-xs text-error">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-on-surface-variant text-sm font-label">תאריך סיום (מקסימום 31 יום)</Label>
                    <Input type="date" dir="ltr" {...register('endDate')} />
                    {errors.endDate && <p className="font-label text-xs text-error">{errors.endDate.message}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold"
                >
                  {mutation.isPending ? (
                    <MysticLoadingText text={DEFAULT_LOADING_PHRASE.button} />
                  ) : (
                    'חשב ימים מועדפים'
                  )}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {result && <TimingResults result={result} />}
    </motion.div>
  )
}
