'use client'

/**
 * דף לוח שנה אסטרולוגי — ASTR-07
 * מציג לוח חודשי עם אירועים אסטרולוגיים — ירח מלא, ירח חדש, מרקורי רטרוגרד, כניסות מזל
 */

import { useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarDays } from 'lucide-react'

import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { AstroCalendar } from '@/components/features/astrology/AstroCalendar'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { MysticSkeleton } from '@/components/ui/mystic-skeleton'
import { animations } from '@/lib/animations/presets'
import type { AstroEvent } from '@/app/api/tools/astrology/calendar/route'

// ===== טיפוסים =====

/** מבנה תשובת API לוח שנה */
interface CalendarApiResponse {
  data: {
    events: AstroEvent[]
    month: number
    year: number
    cached: boolean
  }
  error?: string
}

// ===== פונקציית fetch =====

/**
 * טוען אירועים אסטרולוגיים לחודש נתון
 * @param month - חודש (1-12)
 * @param year - שנה
 */
async function fetchCalendarEvents(month: number, year: number): Promise<CalendarApiResponse['data']> {
  const params = new URLSearchParams({ month: String(month), year: String(year) })
  const res = await fetch(`/api/tools/astrology/calendar?${params.toString()}`)
  const json = await res.json() as CalendarApiResponse
  if (!res.ok) {
    throw new Error(json.error ?? 'שגיאה בטעינת לוח השנה')
  }
  return json.data
}

// ===== Skeleton לטעינה =====

/** skeleton לרשת הלוח */
function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <MysticSkeleton className="h-10 w-full rounded-lg" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <MysticSkeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// ===== קומפוננטה ראשית =====

/** דף לוח שנה אסטרולוגי */
export default function AstroCalendarPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const shouldReduceMotion = useReducedMotion()

  /** עדכון חודש ושנה */
  const handleMonthChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month)
    setCurrentYear(year)
  }, [])

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['astrology-calendar', currentMonth, currentYear],
    queryFn: () => fetchCalendarEvents(currentMonth, currentYear),
    staleTime: 1000 * 60 * 60 * 24, // 24 שעות — אירועים לא משתנים
    retry: 1,
  })

  if (isError && error instanceof Error) {
    toast.error(error.message)
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-3xl"
      dir="rtl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="לוח שנה אסטרולוגי"
        description="אירועים קוסמיים חשובים — ירח מלא, מרקורי רטרוגרד, כניסות מזל"
        icon={<CalendarDays className="h-6 w-6" />}
        breadcrumbs={[
          { label: 'כלים', href: '/tools' },
          { label: 'אסטרולוגיה', href: '/tools/astrology' },
          { label: 'לוח שנה אסטרולוגי' },
        ]}
      />

      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
      >
        <SubscriptionGuard feature="analyses">
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <AstroCalendar
              events={data?.events ?? []}
              month={currentMonth}
              year={currentYear}
              onMonthChange={handleMonthChange}
            />
          )}
        </SubscriptionGuard>
      </motion.div>
    </motion.div>
  )
}
