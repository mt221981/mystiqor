'use client'

/**
 * דף מפת לידה אסטרולוגית — כלי האסטרולוגיה הראשי
 * טופס לידה → POST /api/tools/astrology/birth-chart → SVG + 4 פאנלים
 *
 * מדוע: ASTR-02 — מפת לידה עם פרשנות AI ממוקדת בנתוני כוכבים ספציפיים
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Star } from 'lucide-react'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { AIInterpretation } from '@/components/features/astrology/ChartInfoPanels/AIInterpretation'
import { PlanetTable } from '@/components/features/astrology/ChartInfoPanels/PlanetTable'
import { AspectList } from '@/components/features/astrology/ChartInfoPanels/AspectList'
import { QuickSummary } from '@/components/features/astrology/ChartInfoPanels/QuickSummary'
import { animations } from '@/lib/animations/presets'
import type { ChartData } from '@/services/astrology/chart'
import { getSign } from '@/services/astrology/chart'

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

/** סכמת ולידציה לטופס מפת לידה */
const BirthChartFormSchema = z.object({
  /** שם מלא */
  fullName: z.string().min(1, 'שם מלא חובה').max(100, 'שם ארוך מדי'),
  /** תאריך לידה בפורמט YYYY-MM-DD */
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
  /** שעת לידה HH:mm */
  birthTime: z.string().min(1, 'שעת לידה חובה'),
  /** קו רוחב */
  latitude: z.coerce.number().min(-90).max(90),
  /** קו אורך */
  longitude: z.coerce.number().min(-180).max(180),
})

type BirthChartFormValues = z.input<typeof BirthChartFormSchema>

// ===== טיפוסי תשובת API =====

/** מיקום כוכב לכת אחד */
interface PlanetDetail {
  name: string
  longitude: number
  sign: string
  house: number
  degree_in_sign: number
  is_retrograde: boolean
}

/** תוצאת API מפת לידה */
interface BirthChartResult {
  chartData: ChartData
  planets: Record<string, { longitude: number }>
  planetDetails: PlanetDetail[]
  interpretation: string
  analysis_id: string | null
}

/** ממשק תגובת API */
interface BirthChartApiResponse {
  data: BirthChartResult
}

/** ממשק תגובת פרופיל */
interface ProfileData {
  full_name: string
  birth_date: string
  birth_time: string | null
  latitude: number | null
  longitude: number | null
}

// ===== פונקציות קריאת API =====

/**
 * שולפת פרופיל משתמש ל-pre-fill הטופס
 */
async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('שגיאה בשליפת פרופיל')
  const json = (await res.json()) as { data: ProfileData }
  return json.data
}

/**
 * שולחת בקשת POST לחישוב מפת לידה
 */
async function fetchBirthChart(input: BirthChartFormValues): Promise<BirthChartResult> {
  const res = await fetch('/api/tools/astrology/birth-chart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בחישוב מפת הלידה' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בחישוב מפת הלידה')
  }
  const json = (await res.json()) as BirthChartApiResponse
  return json.data
}

// ===== קומפוננטה ראשית =====

/** דף מפת לידה אסטרולוגית */
export default function AstrologyPage() {
  const [result, setResult] = useState<BirthChartResult | null>(null)

  // שליפת פרופיל לפיזור ראשוני של הטופס
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 דקות
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BirthChartFormValues>({
    resolver: zodResolver(BirthChartFormSchema),
    values: profile
      ? {
          fullName: profile.full_name ?? '',
          birthDate: profile.birth_date ?? '',
          birthTime: profile.birth_time ?? '12:00',
          latitude: profile.latitude ?? 31.7683,
          longitude: profile.longitude ?? 35.2137,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: fetchBirthChart,
    onSuccess: (data) => {
      setResult(data)
      toast.success('מפת הלידה הושלמה')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בחישוב מפת הלידה')
    },
  })

  const onSubmit = (values: BirthChartFormValues) => {
    mutation.mutate(values)
  }

  // חישוב מזל העולה לתקציר
  const risingSign = result ? getSign(result.chartData.ascendant) : ''
  const sunPlanet = result?.planetDetails.find(p => p.name === 'sun')
  const moonPlanet = result?.planetDetails.find(p => p.name === 'moon')

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="מפת לידה אסטרולוגית"
        description="חישוב מפת גלגל אסטרולוגית מלאה עם פרשנות AI"
        icon={<Star className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'אסטרולוגיה' },
        ]}
      />

      {/* טופס קלט */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        exit={animations.fadeInUp.exit}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-outline-variant/10 bg-surface-container mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">נתוני לידה</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
                {/* שם מלא */}
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="font-label text-on-surface-variant">שם מלא</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="הכנס שמך המלא"
                    dir="rtl"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-400">{errors.fullName.message}</p>
                  )}
                </div>

                {/* תאריך ושעת לידה */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="birthDate" className="font-label text-on-surface-variant">תאריך לידה</Label>
                    <Input id="birthDate" type="date" {...register('birthDate')} />
                    {errors.birthDate && (
                      <p className="text-xs text-red-400">{errors.birthDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="birthTime" className="font-label text-on-surface-variant">שעת לידה</Label>
                    <Input id="birthTime" type="time" {...register('birthTime')} />
                    {errors.birthTime && (
                      <p className="text-xs text-red-400">{errors.birthTime.message}</p>
                    )}
                  </div>
                </div>

                {/* קואורדינטות */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="font-label text-on-surface-variant">קו רוחב</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      placeholder="31.7683"
                      {...register('latitude')}
                    />
                    {errors.latitude && (
                      <p className="text-xs text-red-400">{errors.latitude.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="font-label text-on-surface-variant">קו אורך</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      placeholder="35.2137"
                      {...register('longitude')}
                    />
                    {errors.longitude && (
                      <p className="text-xs text-red-400">{errors.longitude.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
                >
                  {mutation.isPending ? 'מחשב מפת לידה...' : 'חשב מפת לידה'}
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
          className="space-y-6"
        >
          {/* SVG מפת הגלגל */}
          <Card className="border-outline-variant/5 bg-surface-container p-4 rounded-xl">
            <BirthChart planets={result.planets} chartData={result.chartData} />
          </Card>

          {/* תקציר מהיר — שמש/ירח/עולה */}
          {sunPlanet && moonPlanet && (
            <QuickSummary
              sunSign={sunPlanet.sign}
              moonSign={moonPlanet.sign}
              risingSign={risingSign}
            />
          )}

          {/* פאנלים ב-Tabs */}
          <Tabs defaultValue="interpretation" dir="rtl">
            <TabsList className="w-full grid grid-cols-3 bg-surface-container-high">
              <TabsTrigger value="interpretation">פירוש AI</TabsTrigger>
              <TabsTrigger value="planets">טבלת כוכבים</TabsTrigger>
              <TabsTrigger value="aspects">אספקטים</TabsTrigger>
            </TabsList>

            {/* פאנל פרשנות AI */}
            <TabsContent value="interpretation" className="mt-4">
              <AIInterpretation
                interpretation={result.interpretation}
                isLoading={mutation.isPending}
              />
            </TabsContent>

            {/* פאנל טבלת כוכבים */}
            <TabsContent value="planets" className="mt-4">
              <PlanetTable planets={result.planetDetails} />
            </TabsContent>

            {/* פאנל אספקטים */}
            <TabsContent value="aspects" className="mt-4">
              <AspectList aspects={result.chartData.aspects} />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  )
}
