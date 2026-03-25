'use client'

/**
 * דף מהפכה שמשית — תחזית שנתית מלאה מבוססת ephemeris אמיתי
 * בחירת שנה → POST /api/tools/astrology/solar-return → SVG מפה + פרטי כוכבים + תחזית AI
 *
 * מדוע: ASTR-04 — מהפכה שמשית עם astronomy-engine לרגע המדויק ולכוכבים הנכונים
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { GiSunRadiations } from 'react-icons/gi'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { AIInterpretation } from '@/components/features/astrology/ChartInfoPanels/AIInterpretation'
import { PlanetTable } from '@/components/features/astrology/ChartInfoPanels/PlanetTable'
import { AspectList } from '@/components/features/astrology/ChartInfoPanels/AspectList'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import type { ChartData } from '@/services/astrology/chart'

/** BirthChart נטען באופן עצלן — רכיב SVG כבד, SSR לא נתמך */
const BirthChart = dynamic(
  () => import('@/components/features/astrology/BirthChart').then(m => m.BirthChart),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full aspect-square max-w-[500px] mx-auto rounded-full" />
    ),
  }
)

// ===== סכמות ולידציה =====

const currentYear = new Date().getFullYear()

/** סכמת טופס המהפכה השמשית */
const SolarReturnFormSchema = z.object({
  /** שנת היעד */
  targetYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(2100)
    .default(currentYear),
})

type SolarReturnFormValues = z.input<typeof SolarReturnFormSchema>

// ===== טיפוסי תשובת API =====

/** פרטי כוכב ברגע המהפכה */
interface SRPlanetDetail {
  name: string
  longitude: number
  sign: string
  house: number
  degree_in_sign: number
  is_retrograde: boolean
}

/** התפלגות יסודות */
interface ElementDistribution {
  fire?: number
  earth?: number
  air?: number
  water?: number
  [key: string]: number | undefined
}

/** תוצאת API מהפכה שמשית */
interface SolarReturnResult {
  sr_moment: string
  sr_chart: ChartData
  planets: SRPlanetDetail[]
  element_distribution: ElementDistribution
  interpretation: string
  analysis_id: string | null
}

/** ממשק תגובת API */
interface SolarReturnApiResponse {
  data: SolarReturnResult
  error?: string
}

// ===== מיפוי שמות יסודות לעברית =====

const ELEMENT_NAMES_HE: Record<string, string> = {
  fire: 'אש',
  earth: 'אדמה',
  air: 'אוויר',
  water: 'מים',
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'bg-error',
  earth: 'bg-tertiary',
  air: 'bg-secondary',
  water: 'bg-primary',
}

// ===== פונקציות קריאת API =====

/**
 * שולחת בקשת POST לחישוב מהפכה שמשית
 */
async function fetchSolarReturn(input: SolarReturnFormValues): Promise<SolarReturnResult> {
  const res = await fetch('/api/tools/astrology/solar-return', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetYear: Number(input.targetYear) }),
  })
  const json = (await res.json()) as SolarReturnApiResponse
  if (!res.ok) {
    throw new Error(json.error ?? 'שגיאה בחישוב המהפכה השמשית')
  }
  return json.data
}

// ===== קומפוננטת תוצאות =====

/** קומפוננטת תוצאות המהפכה השמשית */
function SolarReturnResults({ result, targetYear }: { result: SolarReturnResult; targetYear: number }) {
  const srDate = new Date(result.sr_moment)
  const srDateFormatted = srDate.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // בניית planets ל-BirthChart SVG
  const planetsForChart: Record<string, { longitude: number }> = {}
  for (const p of result.planets) {
    planetsForChart[p.name] = { longitude: p.longitude }
  }

  const totalPlanets = result.planets.length
  const elementData = Object.entries(result.element_distribution).filter(([, v]) => v !== undefined)

  return (
    <div className="space-y-6" dir="rtl">
      {/* רגע המהפכה + תג דיוק */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label text-sm text-on-surface-variant">רגע המהפכה השמשית לשנת {targetYear}</p>
              <p className="text-lg font-headline font-bold text-primary mt-1">{srDateFormatted}</p>
            </div>
            <Badge variant="outline" className="border-tertiary/50 text-tertiary font-label">
              דיוק ±0.01°
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* מפת הגלגל ברגע המהפכה */}
      <Card className="border-outline-variant/5 bg-surface-container p-4">
        <CardHeader>
          <CardTitle className="text-base font-headline text-primary">מפת גלגל — רגע המהפכה</CardTitle>
        </CardHeader>
        <CardContent>
          <BirthChart planets={planetsForChart} chartData={result.sr_chart} />
        </CardContent>
      </Card>

      {/* התפלגות יסודות */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader>
          <CardTitle className="text-base font-headline text-primary">התפלגות יסודות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {elementData.map(([element, count]) => {
              const pct = totalPlanets > 0 ? Math.round(((count ?? 0) / totalPlanets) * 100) : 0
              return (
                <div key={element} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-label">{ELEMENT_NAMES_HE[element] ?? element}</span>
                    <span className="text-on-surface-variant/60 font-label">{count ?? 0} כוכבים ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ELEMENT_COLORS[element] ?? 'bg-primary-container'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* טבלת כוכבים */}
      <PlanetTable planets={result.planets} />

      {/* אספקטים */}
      {result.sr_chart.aspects.length > 0 && (
        <AspectList aspects={result.sr_chart.aspects} />
      )}

      {/* פרשנות AI — תחזית שנתית */}
      <AIInterpretation interpretation={result.interpretation} isLoading={false} />
    </div>
  )
}

// ===== קומפוננטה ראשית =====

/** דף מהפכה שמשית */
export default function SolarReturnPage() {
  const [result, setResult] = useState<SolarReturnResult | null>(null)
  const [submittedYear, setSubmittedYear] = useState<number>(currentYear)
  const { incrementUsage } = useSubscription()

  const { register, handleSubmit, setValue, watch } = useForm<SolarReturnFormValues>({
    resolver: zodResolver(SolarReturnFormSchema),
    defaultValues: { targetYear: currentYear },
  })

  const targetYearValue = watch('targetYear')

  const mutation = useMutation({
    mutationFn: fetchSolarReturn,
    onSuccess: (data) => {
      setResult(data)
      toast.success(`מהפכה שמשית ${submittedYear} חושבה בהצלחה`)
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בחישוב המהפכה השמשית')
    },
  })

  const onSubmit = (values: SolarReturnFormValues) => {
    setSubmittedYear(Number(values.targetYear))
    mutation.mutate(values)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="מהפכה שמשית"
        description="תחזית שנתית מלאה מבוססת רגע חזרת השמש למיקום הלידה"
        icon={<GiSunRadiations className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'אסטרולוגיה', href: '/tools/astrology' },
          { label: 'מהפכה שמשית' },
        ]}
      />

      {/* טופס קלט */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        exit={animations.fadeInUp.exit}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-outline-variant/5 bg-surface-container mb-6 mystic-hover">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">בחירת שנה</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
                {/* כפתורי שנה מהירה */}
                <div className="space-y-2">
                  <p className="font-label text-sm text-on-surface-variant">בחר שנה לחישוב:</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('targetYear', currentYear)}
                      className={
                        Number(targetYearValue) === currentYear
                          ? 'border-primary text-primary bg-primary/10 font-label'
                          : 'border-outline-variant text-on-surface-variant font-label'
                      }
                    >
                      שנה נוכחית ({currentYear})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('targetYear', currentYear + 1)}
                      className={
                        Number(targetYearValue) === currentYear + 1
                          ? 'border-primary text-primary bg-primary/10 font-label'
                          : 'border-outline-variant text-on-surface-variant font-label'
                      }
                    >
                      שנה הבאה ({currentYear + 1})
                    </Button>
                  </div>
                </div>

                {/* קלט שנה מותאם אישית */}
                <div className="space-y-1">
                  <p className="font-label text-xs text-on-surface-variant/60">או הזן שנה ספציפית (1900-2100):</p>
                  <input
                    type="number"
                    {...register('targetYear')}
                    className="w-32 px-3 py-1.5 rounded-md bg-surface-container-lowest border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary/40 font-label"
                    min={1900}
                    max={2100}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      מחשב מהפכה שמשית...
                    </span>
                  ) : (
                    `חשב מהפכה שמשית ${targetYearValue ?? currentYear}`
                  )}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {/* מצב טעינה */}
      {mutation.isPending && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {/* תוצאות */}
      {result && !mutation.isPending && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SolarReturnResults result={result} targetYear={submittedYear} />
        </motion.div>
      )}
    </div>
  )
}
