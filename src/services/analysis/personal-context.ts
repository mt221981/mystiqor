/**
 * עוזר הקשר אישי — שליפת שם פרטי, מזל ומספר חיים לכל route
 * מטרה: כל 21 ה-routes יכולים לפנות למשתמש בשמו עם נתוניו האישיים
 * ממיר תאריך לידה → מזל + מספר חיים בלי כפילות קוד בין הנתיבים
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { reduceToSingleDigit } from '@/services/numerology/calculations'

/** הקשר אישי — ייצוגי, מינימלי, לשימוש חוזר בכל route */
export interface PersonalContext {
  /** שם פרטי — ריק אם לא הוגדר בפרופיל */
  firstName: string
  /** מזל בעברית — 'טלה' וכו', ריק אם אין תאריך לידה */
  zodiacSign: string
  /** מספר חיים (life path) — מחושב מתאריך הלידה, 0 אם חסר */
  lifePathNumber: number
}

/** מיפוי מזלות לחישוב לפי חודש + יום */
const ZODIAC_RANGES = [
  { name: 'טלה', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'שור', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'תאומים', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'סרטן', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'אריה', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'בתולה', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'מאזניים', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'עקרב', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'קשת', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: 'גדי', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: 'דלי', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'דגים', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
] as const

/**
 * מחשב מזל לפי חודש ויום UTC מתאריך לידה
 * משתמש ב-UTC כדי למנוע בעיות אזור זמן
 * @param birthDate תאריך לידה בפורמט YYYY-MM-DD
 * @returns שם המזל בעברית, fallback 'גדי' אם לא נמצא
 */
function getZodiacSign(birthDate: string): string {
  const d = new Date(birthDate)
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()

  for (const sign of ZODIAC_RANGES) {
    if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return sign.name
    }
  }
  return 'גדי' // fallback לגדי
}

/**
 * מחשב מספר חיים (life path) מתאריך לידה
 * שיטה פשוטה: סכום כל ספרות התאריך, מצומצם ל-1-9 או 11/22/33
 * @param birthDate תאריך לידה בפורמט YYYY-MM-DD
 * @returns מספר חיים, 0 אם התאריך חסר או לא תקין
 */
function computeLifePath(birthDate: string): number {
  const parts = birthDate.split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 0
  const day = parts[2] ?? 0
  if (!year || !month || !day) return 0
  return reduceToSingleDigit(day + month + year)
}

/**
 * שולף הקשר אישי מינימלי מהפרופיל — שם פרטי, מזל ומספר חיים
 * מיועד לשימוש בכל ה-routes כדי להעשיר את הפרומפטים של ה-LLM
 * מחזיר fallbacks בטוחים אם הנתונים חסרים או השליפה נכשלת
 *
 * @param supabase - קליינט Supabase (שרת) — generic לתמיכה בסוגי Database שונים
 * @param userId - מזהה המשתמש לשליפה
 * @returns הקשר אישי עם שם פרטי, מזל ומספר חיים
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPersonalContext(supabase: SupabaseClient<any>, userId: string): Promise<PersonalContext> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, birth_date')
      .eq('id', userId)
      .maybeSingle()

    const profile = data as { full_name?: string | null; birth_date?: string | null } | null
    const fullName = profile?.full_name ?? ''
    const firstName = fullName.trim().split(/\s+/)[0] ?? ''
    const birthDate = profile?.birth_date ?? ''

    if (!birthDate) {
      return { firstName, zodiacSign: '', lifePathNumber: 0 }
    }

    const zodiacSign = getZodiacSign(birthDate)
    const lifePathNumber = computeLifePath(birthDate)

    return { firstName, zodiacSign, lifePathNumber }
  } catch {
    // שגיאת שליפה — מחזיר fallbacks בטוחים
    return { firstName: '', zodiacSign: '', lifePathNumber: 0 }
  }
}
