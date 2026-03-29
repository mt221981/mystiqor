'use client'

/**
 * תזכורת גרפולוגית — שמירת תאריך הניתוח הבא ב-localStorage
 * מדוע: מאפשר למשתמש לקבוע תזכורת לניתוח כתב יד הבא ללא צורך בשרת
 * Pattern: localStorage 'graphology-reminder-date' → הצגה/קביעה/מחיקה
 */

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** מפתח localStorage לתאריך התזכורת */
const REMINDER_KEY = 'graphology-reminder-date'

/**
 * מפרמטת תאריך ISO ל-DD/MM/YYYY
 */
function formatDateDisplay(isoDate: string): string {
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

/**
 * רכיב תזכורת גרפולוגי — ניהול תזכורת לניתוח הבא
 */
export function GraphologyReminder() {
  const [reminderDate, setReminderDate] = useState<string | null>(null)
  const [inputDate, setInputDate] = useState('')
  const [mounted, setMounted] = useState(false)

  // קריאת הערך הנוכחי מ-localStorage לאחר mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(REMINDER_KEY)
    if (stored) {
      setReminderDate(stored)
    }
  }, [])

  /**
   * שומר תאריך תזכורת ב-localStorage
   */
  const handleSetReminder = () => {
    if (!inputDate) return
    localStorage.setItem(REMINDER_KEY, inputDate)
    setReminderDate(inputDate)
    setInputDate('')
  }

  /**
   * מוחק את התזכורת מ-localStorage
   */
  const handleClearReminder = () => {
    localStorage.removeItem(REMINDER_KEY)
    setReminderDate(null)
  }

  // הימנעות מ-hydration mismatch
  if (!mounted) {
    return (
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardContent className="py-8 text-center text-on-surface-variant">...</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-outline-variant/5 bg-surface-container max-w-sm" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-primary font-headline flex items-center gap-2">
          <Bell className="h-4 w-4" />
          תזכורת לניתוח הבא
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminderDate ? (
          /* תצוגת תזכורת קיימת */
          <div className="space-y-3">
            <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-primary font-label mb-0.5">תזכורת הבאה</p>
                <p className="text-sm font-semibold text-on-surface font-headline">
                  {formatDateDisplay(reminderDate)}
                </p>
              </div>
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearReminder}
              className="w-full border-error/30 text-error hover:bg-error/10"
            >
              <X className="h-3.5 w-3.5 ms-1" />
              בטל תזכורת
            </Button>
          </div>
        ) : (
          /* טופס הגדרת תזכורת */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reminder-date" className="text-sm font-label text-on-surface-variant">
                תאריך הניתוח הבא
              </Label>
              <Input
                id="reminder-date"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-outline-variant/30 bg-surface-container-low text-on-surface"
                dir="ltr"
              />
            </div>
            <Button
              onClick={handleSetReminder}
              disabled={!inputDate}
              className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
            >
              <BellOff className="h-4 w-4 ms-2" />
              הגדר תזכורת
            </Button>
            <p className="text-xs text-on-surface-variant/80 text-center font-body">
              התזכורת נשמרת במכשיר זה בלבד
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GraphologyReminder
