'use client'

/**
 * דף תחזית יומית אסטרולוגית — ASTR-06
 * טוען אוטומטית את תחזית המזל של המשתמש ומציג אותה ב-DailyForecast
 */

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GiSunRadiations } from 'react-icons/gi'

import { PageHeader } from '@/components/layouts/PageHeader'
import { DailyForecast } from '@/components/features/astrology/DailyForecast'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'
import type { ZodiacSignKey } from '@/lib/constants/astrology'
import type { ForecastData } from '@/components/features/astrology/DailyForecast'

// ===== טיפוסים =====

/** מבנה תשובת API תחזית */
interface ForecastApiResponse {
  data: {
    content: string
    forecast: ForecastData | null
    zodiacSign: ZodiacSignKey
    date: string
    cached: boolean
  }
  error?: string
}

// ===== פונקציית fetch =====

/**
 * טוען תחזית יומית מה-API
 */
async function fetchDailyForecast(): Promise<ForecastApiResponse['data']> {
  const res = await fetch('/api/tools/astrology/forecast')
  const json = await res.json() as ForecastApiResponse
  if (!res.ok) {
    throw new Error(json.error ?? 'שגיאה בטעינת התחזית')
  }
  return json.data
}

// ===== קומפוננטה ראשית =====

/** דף תחזית יומית אסטרולוגית */
export default function AstroForecastPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['astrology-forecast', new Date().toISOString().split('T')[0]],
    queryFn: fetchDailyForecast,
    staleTime: 1000 * 60 * 60, // שעה — התחזית לא משתנה במשך היום
    retry: 1,
  })

  // הצגת שגיאה ב-toast
  if (isError && error instanceof Error) {
    toast.error(error.message)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl" dir="rtl">
      <PageHeader
        title="תחזית יומית"
        description="תחזית אסטרולוגית מותאמת אישית למזל שלך"
        icon={<GiSunRadiations className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'כלים', href: '/tools' },
          { label: 'אסטרולוגיה', href: '/tools/astrology' },
          { label: 'תחזית יומית' },
        ]}
      />

      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
      >
        <SubscriptionGuard feature="analyses">
          <DailyForecast
            content={data?.content ?? ''}
            forecast={data?.forecast ?? null}
            zodiacSign={(data?.zodiacSign ?? 'Aries') as ZodiacSignKey}
            date={data?.date ?? new Date().toISOString().substring(0, 10)}
            isLoading={isLoading}
          />
        </SubscriptionGuard>
      </motion.div>
    </div>
  )
}
