/**
 * שירות חזרה שמשית (Solar Return) — VSOP87 + חיפוש בינארי
 * מחשב את הרגע המדויק שבו השמש חוזרת למיקום הלידה שלה (±0.01°)
 * מקור: GEM 1 מ-base44/functions/calculateSolarReturn/entry.ts (ציון 41/50 🟢 KEEP)
 *
 * חשוב: normalize() מיושמת כ-((deg % 360) + 360) % 360 בלבד
 * שימוש ב-deg % 360 בלבד כושל עבור ערכים שליליים (כוכב ליד גבול 0°/360°)
 */

/** קלט לחישוב מהפכה שמשית */
export interface SolarReturnInput {
  /** תאריך לידה בפורמט ISO: 'YYYY-MM-DD' */
  birthDate: string
  /** קו רוחב של מקום הלידה */
  birthLat: number
  /** קו אורך של מקום הלידה */
  birthLon: number
}

/**
 * נורמליזציה של מעלות לטווח 0-360
 * CRITICAL: חייב להשתמש ב-((deg % 360) + 360) % 360 — לא deg % 360 בלבד
 * הנוסחה הנכונה מטפלת בערכים שליליים (כוכב ב-Pisces/Aries בגבול 0°)
 *
 * @param deg - מעלות (יכול להיות שלילי או מעל 360)
 * @returns מעלות בטווח [0, 360)
 */
export function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/**
 * חישוב Julian Date מתאריך גרגוריאני
 * נוסחה סטנדרטית להמרת תאריך קלנדרי למספר יוליאני רציף
 *
 * @param date - תאריך לחישוב
 * @returns Julian Date Number
 */
export function calculateJulianDate(date: Date): number {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()

  let Y = year
  let M = month

  // תיקון לינואר/פברואר — נחשבים כחודשים 13/14 של השנה הקודמת
  if (M <= 2) {
    Y = Y - 1
    M = M + 12
  }

  const A = Math.floor(Y / 100)
  const B = 2 - A + Math.floor(A / 4)

  const JD0 =
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    day +
    B -
    1524.5

  const dayFraction = (hour + minute / 60) / 24
  return JD0 + dayFraction
}

/**
 * מחשב את מיקום השמש (אורך אקליפטי) לתאריך נתון
 * מבוסס על VSOP87 מפושט — דיוק של ~0.01° מספיק לחיפוש הבינארי
 *
 * @param date - תאריך לחישוב
 * @returns אורך אקליפטי של השמש בטווח [0, 360)
 */
export function calculateSunPosition(date: Date): number {
  const jd = calculateJulianDate(date)
  const T = (jd - 2451545.0) / 36525

  // Mean Longitude של השמש
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T

  // Mean Anomaly של השמש
  const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const Mrad = (M_sun * Math.PI) / 180

  // Equation of Center — תיקון מהמסלול האליפטי
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad)

  // אורך אקליפטי אמיתי — נורמליזציה ל-[0, 360)
  return normalize(L0 + C)
}

/**
 * מוצא את הרגע המדויק של המהפכה השמשית לשנה נתונה
 * שימוש בחיפוש בינארי (100 איטרציות) עם דיוק של ±0.01°
 *
 * אלגוריתם:
 * 1. מחשב את מיקום השמש בלידה (natal_sun_longitude)
 * 2. מנרמל פעם אחת לפני הלולאה
 * 3. חיפוש בינארי בחלון ±2 ימים סביב תאריך הלידה בשנת היעד
 * 4. מתכנס כאשר הפרש < 0.01°
 *
 * @param input - נתוני לידה (תאריך, קו רוחב, קו אורך)
 * @param yearToCalculate - שנת היעד לחישוב המהפכה
 * @returns תאריך המהפכה השמשית
 */
export function findSolarReturn(input: SolarReturnInput, yearToCalculate: number): Date {
  // פרסור תאריך הלידה
  const [birthYearStr, birthMonthStr, birthDayStr] = input.birthDate.split('-')
  const birthYear = parseInt(birthYearStr ?? '2000', 10)
  const birthMonth = parseInt(birthMonthStr ?? '1', 10)
  const birthDay = parseInt(birthDayStr ?? '1', 10)

  // חישוב מיקום השמש בלידה
  const natalSunRaw = calculateSunPosition(
    new Date(birthYear, birthMonth - 1, birthDay, 12, 0, 0)
  )

  // נרמול פעם אחת לפני הלולאה — CRITICAL: לא בתוך הלולאה
  const natalLon = normalize(natalSunRaw)

  // חלון חיפוש: ±2 ימים סביב יום/חודש הלידה בשנת היעד
  const searchDate = new Date(yearToCalculate, birthMonth - 1, birthDay, 12, 0, 0)
  let minDate = new Date(searchDate.getTime() - 2 * 24 * 60 * 60 * 1000)
  let maxDate = new Date(searchDate.getTime() + 2 * 24 * 60 * 60 * 1000)

  let bestDate = searchDate
  let bestDiff = 999

  // חיפוש בינארי — עד 100 איטרציות, מתכנס ב-±0.01°
  for (let i = 0; i < 100; i++) {
    const testDate = new Date((minDate.getTime() + maxDate.getTime()) / 2)
    const sunLon = calculateSunPosition(testDate)

    // חישוב ההפרש הזוויתי (מחזורי — מתחשב בגבול 0°/360°)
    let diff = Math.abs(normalize(sunLon - natalLon))
    if (diff > 180) diff = 360 - diff

    if (diff < bestDiff) {
      bestDiff = diff
      bestDate = testDate
    }

    // התכנסות — דיוק מספיק
    if (diff < 0.01) break

    // כיוון החיפוש — השמש עדיין מאחור? קדם את minDate; לפנים? אחר maxDate
    if (normalize(sunLon) < natalLon) {
      minDate = testDate
    } else {
      maxDate = testDate
    }
  }

  return bestDate
}
