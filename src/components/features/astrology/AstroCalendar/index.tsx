/**
 * AstroCalendar — לוח שנה אסטרולוגי חודשי
 * מציג רשת חודשית עם נקודות אירועים ופאנל פרטים
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import { he } from 'date-fns/locale/he'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AstroEvent } from '@/app/api/tools/astrology/calendar/route'

// ===== טיפוסים =====

/** Props של לוח שנה אסטרולוגי */
export interface AstroCalendarProps {
  /** רשימת האירועים לחודש */
  events: AstroEvent[]
  /** חודש נוכחי (1-12) */
  month: number
  /** שנה נוכחית */
  year: number
  /** callback לשינוי חודש */
  onMonthChange: (month: number, year: number) => void
}

// ===== צבעי קטגוריה =====

/** מפת צבעים לפי סוג אירוע — MD3 tokens */
const EVENT_TYPE_COLORS: Record<string, { dot: string; badge: string; label: string }> = {
  'ירח מלא':            { dot: 'bg-tertiary',         badge: 'bg-tertiary/10 text-tertiary',         label: 'ירח מלא'            },
  'ירח חדש':            { dot: 'bg-on-surface-variant', badge: 'bg-surface-container-high text-on-surface-variant', label: 'ירח חדש' },
  'מרקורי רטרוגרד':    { dot: 'bg-error',             badge: 'bg-error/10 text-error',               label: 'מרקורי רטרוגרד'    },
  'כניסת מזל':          { dot: 'bg-primary',           badge: 'bg-primary/10 text-primary',           label: 'כניסת מזל'          },
  'ליקוי':              { dot: 'bg-error',             badge: 'bg-error/10 text-error',               label: 'ליקוי'              },
}

/** מחזיר הגדרות צבע לפי סוג אירוע עם ברירת מחדל */
function getEventColors(type: string) {
  return EVENT_TYPE_COLORS[type] ?? { dot: 'bg-secondary', badge: 'bg-secondary/10 text-secondary', label: type }
}

/** שמות ימים בעברית — ראשון עד שבת */
const HEBREW_DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// ===== עזרים =====

/**
 * מחשב תאריך מחרוזת ISO ל-Date ביטוח timezone
 * @param dateStr - תאריך בפורמט YYYY-MM-DD
 */
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number)
  const year  = parts[0] ?? new Date().getFullYear()
  const month = parts[1] ?? 1
  const day   = parts[2] ?? 1
  return new Date(year, month - 1, day)
}

// ===== קומפוננטה ראשית =====

/**
 * לוח שנה אסטרולוגי — רשת חודשית עם ניווט ופרטי אירועים
 */
export function AstroCalendar({ events, month, year, onMonthChange }: AstroCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  /** חישוב ימי החודש */
  const currentMonthDate = useMemo(() => new Date(year, month - 1, 1), [year, month])
  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(currentMonthDate), end: endOfMonth(currentMonthDate) }),
    [currentMonthDate]
  )

  /** היסט עבור יום ראשון בחודש (0=ראשון) */
  const firstDayOffset = useMemo(() => getDay(startOfMonth(currentMonthDate)), [currentMonthDate])

  /** אירועי יום ספציפי */
  const getEventsForDay = useCallback(
    (day: Date) => events.filter((e) => isSameDay(parseLocalDate(e.date), day)),
    [events]
  )

  /** אירועי היום שנבחר */
  const selectedEvents = useMemo(
    () => (selectedDay ? getEventsForDay(selectedDay) : []),
    [selectedDay, getEventsForDay]
  )

  /** מעבר לחודש קודם */
  const goToPrevMonth = useCallback(() => {
    const prev = new Date(year, month - 2, 1)
    onMonthChange(prev.getMonth() + 1, prev.getFullYear())
    setSelectedDay(null)
  }, [year, month, onMonthChange])

  /** מעבר לחודש הבא */
  const goToNextMonth = useCallback(() => {
    const next = new Date(year, month, 1)
    onMonthChange(next.getMonth() + 1, next.getFullYear())
    setSelectedDay(null)
  }, [year, month, onMonthChange])

  /** מעבר לחודש הנוכחי */
  const goToToday = useCallback(() => {
    const today = new Date()
    onMonthChange(today.getMonth() + 1, today.getFullYear())
    setSelectedDay(null)
  }, [onMonthChange])

  const today = new Date()

  return (
    <div className="space-y-4" dir="rtl">
      {/* כרטיס לוח השנה */}
      <Card className="bg-surface-container rounded-xl border-outline-variant/5">
        {/* כותרת + ניווט */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-on-surface font-headline text-xl">
              {format(currentMonthDate, 'MMMM yyyy', { locale: he })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevMonth}
                className="border-outline-variant text-on-surface-variant hover:bg-surface-container-high font-headline"
                aria-label="חודש קודם"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-outline-variant text-on-surface-variant hover:bg-surface-container-high font-headline"
              >
                היום
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                className="border-outline-variant text-on-surface-variant hover:bg-surface-container-high font-headline"
                aria-label="חודש הבא"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* כותרות ימי השבוע */}
          <div className="grid grid-cols-7 mb-2">
            {HEBREW_DAY_NAMES.map((name) => (
              <div
                key={name}
                className="text-center font-label text-xs text-on-surface-variant font-medium py-2"
              >
                {name.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* רשת ימים */}
          <div className="grid grid-cols-7 gap-1">
            {/* תאים ריקים לפני יום ראשון בחודש */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[56px]" />
            ))}

            {/* ימי החודש */}
            {monthDays.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isToday = isSameDay(day, today)
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
              const hasEvents = dayEvents.length > 0
              const isCurrentMonth = isSameMonth(day, currentMonthDate)

              return (
                <motion.button
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={[
                    'min-h-[56px] p-1.5 rounded-lg border text-start transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-primary-container/10 border-primary/20'
                      : isToday
                      ? 'bg-primary/10 border-primary/20'
                      : hasEvents
                      ? 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container-high'
                      : 'bg-surface-container-low rounded-lg border-outline-variant/10 hover:bg-surface-container',
                    !isCurrentMonth ? 'opacity-40' : '',
                  ].join(' ')}
                  aria-label={`${format(day, 'dd/MM/yyyy')}${hasEvents ? ` — ${dayEvents.length} אירועים` : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className={`font-label text-sm ${isToday ? 'text-primary font-bold' : 'text-on-surface'}`}>
                    {format(day, 'd')}
                  </span>
                  {/* נקודות אירועים */}
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full bg-primary`}
                        title={event.title}
                      />
                    ))}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* פאנל פרטי אירועים */}
      <AnimatePresence>
        {selectedDay && selectedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="bg-surface-container border-outline-variant/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-on-surface font-headline text-base">
                    {format(selectedDay, 'dd MMMM yyyy', { locale: he })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDay(null)}
                    className="text-on-surface-variant hover:text-on-surface"
                    aria-label="סגור"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedEvents.map((event, i) => {
                  const colors = getEventColors(event.type)
                  return (
                    <div key={i} className="bg-surface-container-high rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />
                        <p className="text-on-surface font-medium font-label text-sm">{event.title}</p>
                      </div>
                      <Badge className={`font-label text-xs ${colors.badge}`}>{event.type}</Badge>
                      <p className="text-on-surface-variant font-label text-xs">{event.description}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* רשימת כל אירועי החודש */}
      {events.length > 0 && (
        <Card className="bg-surface-container border-outline-variant/5">
          <CardHeader>
            <CardTitle className="text-on-surface-variant font-headline text-sm">אירועים החודש ({events.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...events]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((event, i) => {
                const colors = getEventColors(event.type)
                const eventDate = parseLocalDate(event.date)
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-2 border-b border-outline-variant/10 last:border-0"
                  >
                    <div className="text-center min-w-[32px]">
                      <span className="text-on-surface-variant font-label text-xs font-bold">
                        {format(eventDate, 'dd')}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
                    <div className="flex-1">
                      <p className="text-on-surface font-label text-xs font-medium">{event.title}</p>
                      <p className="text-on-surface-variant font-label text-xs">{event.description}</p>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
