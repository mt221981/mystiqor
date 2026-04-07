/**
 * עזר לתגובות שגיאה ב-API — מסתיר פרטי Zod בסביבת production
 * מדוע: מונע חשיפת מבנה סכמות ולידציה לתוקפים פוטנציאליים
 */

import { NextResponse } from 'next/server'
import type { ZodError } from 'zod'

/** מחזיר תגובת 400 עם פרטי ולידציה — פרטים מוצגים רק ב-development */
export function zodValidationError(
  message: string,
  flatError: ReturnType<ZodError['flatten']>
) {
  const isDev = process.env.NODE_ENV === 'development'
  return NextResponse.json(
    { error: message, ...(isDev ? { details: flatError } : {}) },
    { status: 400 }
  )
}
