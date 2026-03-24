'use client'

/**
 * דף מעברים פלנטריים — מציג את מיקומי הכוכבים הנוכחיים מול מפת הלידה הנטלית
 * טופס (תאריך אופציונלי) → POST /api/tools/astrology/transits → גריד כוכבים + אספקטים + פרשנות AI
 *
 * מדוע: ASTR-03 — מעברים אמיתיים עם astronomy-engine, לא קירוב LLM
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Orbit, RotateCcw, AlertTriangle } from 'lucide-react'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'

// ===== סכמות ולידציה =====

/** סכמת טופס המעברים — תאריך אופציונלי */
const TransitsFormSchema = z.object({
  /** תאריך היעד — ריק = עכשיו */
  targetDate: z.string().optional(),
})

type TransitsFormValues = z.input<typeof TransitsFormSchema>

// ===== טיפוסי תשובת API =====

/** פרטי כוכב טרנזיט */
interface TransitingPlanet {
  name: string
  longitude: number
  sign: string
  degree_in_sign: number
  is_retrograde: boolean
}

/** אספקט טרנזיט */
interface TransitAspect {
  planet1: string
  planet2: string
  type: string
  orb: number
  strength: number
}

/** תנאים מיוחדים */
interface SpecialConditions {
  mercury_retrograde: boolean
  void_of_course_moon: boolean
}

/** תוצאת API מעברים */
interface TransitsResult {
  transiting_planets: TransitingPlanet[]
  transits: TransitAspect[]
  special_conditions: SpecialConditions
  interpretation: string
  metadata: {
    total_transits: number
    strong_transits_count: number
  }
  analysis_id: string | null
}

/** ממשק תגובת API */
interface TransitsApiResponse {
  data: TransitsResult
  error?: string
}

// ===== מיפוי שמות עבריים לכוכבים =====

const PLANET_NAMES_HE: Record<string, string> = {
  sun: 'שמש',
  moon: 'ירח',
  mercury: 'מרקורי',
  venus: 'ונוס',
  mars: 'מאדים',
  jupiter: 'צדק',
  saturn: 'שבתאי',
  uranus: 'אורנוס',
  neptune: 'נפטון',
  pluto: 'פלוטו',
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
}

const ASPECT_NAMES_HE: Record<string, string> = {
  Conjunction: 'חיבור',
  Opposition: 'ניגוד',
  Trine: 'טריגון',
  Square: 'ריבוע',
  Sextile: 'סקסטיל',
}

// ===== פונקציות קריאת API =====

/**
 * שולחת בקשת POST לחישוב מעברים
 */
async function fetchTransits(input: TransitsFormValues): Promise<TransitsResult> {
  const body = input.targetDate ? { targetDate: input.targetDate } : {}
  const res = await fetch('/api/tools/astrology/transits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as TransitsApiResponse
  if (!res.ok) {
    throw new Error(json.error ?? 'שגיאה בחישוב המעברים')
  }
  return json.data
}

// ===== קומפוננטת תוצאות =====

/** קומפוננטת תוצאות מעברים — גריד כוכבים, אספקטים, פרשנות */
function TransitResults({ result }: { result: TransitsResult }) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-headline font-bold text-primary">{result.metadata.total_transits}</p>
            <p className="font-label text-xs text-on-surface-variant mt-1">אספקטים פעילים</p>
          </CardContent>
        </Card>
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-headline font-bold text-tertiary">{result.metadata.strong_transits_count}</p>
            <p className="font-label text-xs text-on-surface-variant mt-1">אספקטים חזקים</p>
          </CardContent>
        </Card>
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardContent className="pt-4 text-center">
            {result.special_conditions.void_of_course_moon ? (
              <Badge variant="outline" className="border-tertiary/50 text-tertiary font-label">ירח void</Badge>
            ) : (
              <Badge variant="outline" className="border-tertiary/50 text-tertiary font-label">ירח פעיל</Badge>
            )}
            <p className="font-label text-xs text-on-surface-variant mt-1">מצב ירח</p>
          </CardContent>
        </Card>
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardContent className="pt-4 text-center">
            {result.special_conditions.mercury_retrograde ? (
              <Badge variant="outline" className="border-error/50 text-error font-label">מרקורי ℞</Badge>
            ) : (
              <Badge variant="outline" className="border-secondary/50 text-secondary font-label">מרקורי ישיר</Badge>
            )}
            <p className="font-label text-xs text-on-surface-variant mt-1">מרקורי</p>
          </CardContent>
        </Card>
      </div>

      {/* גריד מיקומי כוכבים טרנזיטים */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader>
          <CardTitle className="text-base font-headline text-primary">מיקומי כוכבים נוכחיים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {result.transiting_planets.map((planet) => (
              <div
                key={planet.name}
                className="bg-surface-container rounded-xl p-3 text-center border border-outline-variant/5"
              >
                <div className="text-xl mb-1">{PLANET_SYMBOLS[planet.name] ?? ''}</div>
                <div className="font-label text-xs font-medium text-on-surface-variant">
                  {PLANET_NAMES_HE[planet.name] ?? planet.name}
                </div>
                <div className="font-label text-xs text-primary mt-1">{planet.sign}</div>
                <div className="font-label text-xs text-on-surface-variant/60">{planet.degree_in_sign.toFixed(1)}°</div>
                {planet.is_retrograde && (
                  <div className="font-label text-xs text-error mt-1">℞ נסיגה</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* רשימת אספקטים */}
      {result.transits.length > 0 && (
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardHeader>
            <CardTitle className="text-base font-headline text-primary">אספקטים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.transits.map((aspect, idx) => {
                // חילוץ שמות כוכבים מה-prefix t: ו-n:
                const p1Clean = aspect.planet1.replace(/^t:/, '')
                const p2Clean = aspect.planet2.replace(/^n:/, '')
                const strengthPercent = Math.round(aspect.strength * 100)
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-surface-container rounded-lg px-3 py-2 border border-outline-variant/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{PLANET_SYMBOLS[p1Clean] ?? ''}</span>
                      <span className="font-label text-xs text-on-surface-variant">
                        {PLANET_NAMES_HE[p1Clean] ?? p1Clean}
                      </span>
                      <span className="font-label text-xs text-primary font-medium">
                        {ASPECT_NAMES_HE[aspect.type] ?? aspect.type}
                      </span>
                      <span className="text-sm">{PLANET_SYMBOLS[p2Clean] ?? ''}</span>
                      <span className="font-label text-xs text-on-surface-variant">
                        נטאל {PLANET_NAMES_HE[p2Clean] ?? p2Clean}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-label text-xs text-on-surface-variant/60">{aspect.orb.toFixed(1)}°</span>
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full"
                          style={{ width: `${strengthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* פרשנות AI */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader>
          <CardTitle className="text-base font-headline text-primary">פרשנות AI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap font-body">
            {result.interpretation}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ===== קומפוננטה ראשית =====

/** דף מעברים פלנטריים */
export default function TransitsPage() {
  const [result, setResult] = useState<TransitsResult | null>(null)

  const { register, handleSubmit } = useForm<TransitsFormValues>({
    resolver: zodResolver(TransitsFormSchema),
    defaultValues: { targetDate: '' },
  })

  const mutation = useMutation({
    mutationFn: fetchTransits,
    onSuccess: (data) => {
      setResult(data)
      toast.success('המעברים חושבו בהצלחה')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בחישוב המעברים')
    },
  })

  const onSubmit = (values: TransitsFormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="מעברים פלנטריים"
        description="מיקומי הכוכבים הנוכחיים ואספקטיהם מול מפת הלידה שלך"
        icon={<Orbit className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'אסטרולוגיה', href: '/tools/astrology' },
          { label: 'מעברים' },
        ]}
      />

      {/* טופס קלט */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        exit={animations.fadeInUp.exit}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-outline-variant/5 bg-surface-container mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">חישוב מעברים</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
                {/* תאריך יעד אופציונלי */}
                <div className="space-y-1">
                  <Label htmlFor="targetDate" className="text-on-surface-variant font-label">
                    תאריך חישוב (אופציונלי — ריק = עכשיו)
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    {...register('targetDate')}
                    className="max-w-xs"
                  />
                  <p className="font-label text-xs text-on-surface-variant/60">השאר ריק לחישוב על פי תאריך היום</p>
                </div>

                {/* אזהרה אם אין מפת לידה */}
                <div className="flex items-start gap-2 p-3 bg-surface-container-high border border-outline-variant/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-tertiary mt-0.5 shrink-0" />
                  <p className="font-label text-xs text-on-surface-variant">
                    נדרשת מפת לידה קיימת. אם עדיין לא יצרת מפת לידה,{' '}
                    <a href="/tools/astrology" className="underline text-primary">
                      לחץ כאן
                    </a>{' '}
                    ליצור אחת תחילה.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      מחשב מעברים...
                    </span>
                  ) : (
                    'חשב מעברים נוכחיים'
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
          <Skeleton className="h-32 w-full rounded-xl" />
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
          <TransitResults result={result} />
        </motion.div>
      )}
    </div>
  )
}
