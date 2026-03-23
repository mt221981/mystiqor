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
      <Card className="border-purple-500/20 bg-gray-900/50">
        <CardContent className="py-8 text-center text-gray-400">...</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-500/20 bg-gray-900/50 max-w-sm" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-purple-300 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          תזכורת לניתוח הבא
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminderDate ? (
          /* תצוגת תזכורת קיימת */
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-600/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-400 mb-0.5">תזכורת הבאה</p>
                <p className="text-sm font-semibold text-purple-200">
                  {formatDateDisplay(reminderDate)}
                </p>
              </div>
              <Bell className="h-5 w-5 text-purple-400" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearReminder}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-600/10"
            >
              <X className="h-3.5 w-3.5 ms-1" />
              בטל תזכורת
            </Button>
          </div>
        ) : (
          /* טופס הגדרת תזכורת */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reminder-date" className="text-sm text-gray-300">
                תאריך הניתוח הבא
              </Label>
              <Input
                id="reminder-date"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-purple-500/30 bg-gray-800 text-gray-200"
                dir="ltr"
              />
            </div>
            <Button
              onClick={handleSetReminder}
              disabled={!inputDate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <BellOff className="h-4 w-4 ms-2" />
              הגדר תזכורת
            </Button>
            <p className="text-xs text-gray-500 text-center">
              התזכורת נשמרת במכשיר זה בלבד
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GraphologyReminder
