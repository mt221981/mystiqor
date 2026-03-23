/**
 * שירות אפמריס — מתאם astronomy-engine לחישוב מיקומי כוכבי לכת אמיתיים
 * מחשב מיקומים אקליפטיים מדויקים (±1 arcminute) לכל 10 כוכבי הלכת הסטנדרטיים
 * מקור: astronomy-engine v2.1.19 (Cosinekitty/Don Cross) — מאומת מול JPL Horizons
 */

import * as Astronomy from 'astronomy-engine'
import type { PlanetPositions } from './aspects'
import { normalize } from './solar-return'

// ===== קבועים =====

/** מיפוי שם כוכב → Astronomy.Body enum */
interface EphemerisBodyEntry {
  /** מפתח כוכב בפורמט lowercase (כמו בPlanetPositions) */
  key: string
  /** ה-body enum של astronomy-engine */
  body: Astronomy.Body
}

/** 10 כוכבי הלכת הסטנדרטיים עם המיפוי ל-astronomy-engine */
const EPHEMERIS_BODIES: EphemerisBodyEntry[] = [
  { key: 'sun',     body: Astronomy.Body.Sun     },
  { key: 'moon',    body: Astronomy.Body.Moon    },
  { key: 'mercury', body: Astronomy.Body.Mercury },
  { key: 'venus',   body: Astronomy.Body.Venus   },
  { key: 'mars',    body: Astronomy.Body.Mars    },
  { key: 'jupiter', body: Astronomy.Body.Jupiter },
  { key: 'saturn',  body: Astronomy.Body.Saturn  },
  { key: 'uranus',  body: Astronomy.Body.Uranus  },
  { key: 'neptune', body: Astronomy.Body.Neptune },
  { key: 'pluto',   body: Astronomy.Body.Pluto   },
]

// ===== פונקציות עזר =====

/**
 * מחשב אם כוכב לכת נתון נמצא בתנועה רטרוגרדית בזמן נתון
 * שיטה: משווה אורך אקליפטי ב-T ו-T+1 יום — ירידה = רטרוגרד
 * שמש וירח אינם הופכים רטרוגרדיים לעולם
 *
 * @param body - כוכב הלכת לבדיקה (Astronomy.Body)
 * @param time - זמן ה-AstroTime לנקודה T
 * @returns true אם הכוכב בתנועה רטרוגרדית
 */
function isRetrograde(body: Astronomy.Body, time: Astronomy.AstroTime): boolean {
  // שמש וירח לעולם אינם רטרוגרדיים
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) {
    return false
  }

  // מחשב מיקום ב-T ו-T+1 יום
  const lon1 = Astronomy.EclipticLongitude(body, time)

  // T+1 יום = 86400000 מילישניות
  const timePlus1Day = new Astronomy.AstroTime(new Date(time.date.getTime() + 86400000))
  const lon2 = Astronomy.EclipticLongitude(body, timePlus1Day)

  // נרמול ההפרש — אם ההפרש > 180, הכוכב עבר גבול 0°/360°
  const diff = normalize(lon2 - lon1)

  // אם diff > 180 — הכוכב זזה לאחור (רטרוגרד)
  return diff > 180
}

// ===== ייצוא ראשי =====

/**
 * מחשב אורך אקליפטי גאוצנטרי לכוכב נתון
 * שמש: משתמש ב-SunPosition().elon (EclipticLongitude זורק עבור השמש — heliocentric בלבד)
 * שאר הכוכבים: EclipticLongitude (geocentric)
 *
 * @param body - ה-body enum של astronomy-engine
 * @param astroTime - זמן AstroTime לחישוב
 * @returns אורך אקליפטי גאוצנטרי בטווח [0, 360)
 */
function getGeocentricLongitude(body: Astronomy.Body, astroTime: Astronomy.AstroTime): number {
  if (body === Astronomy.Body.Sun) {
    // EclipticLongitude זורק עבור השמש — משתמשים ב-SunPosition שמחזיר elon גאוצנטרי
    return Astronomy.SunPosition(astroTime).elon
  }
  return Astronomy.EclipticLongitude(body, astroTime)
}

/**
 * מחשב מיקומי אורך אקליפטי לכל 10 כוכבי הלכת עבור תאריך נתון
 * משתמש ב-astronomy-engine לדיוק של ±1 arcminute (מאומת מול JPL Horizons)
 * מחליף את קירוב ה-LLM שהיה בשימוש עד פאזה 4
 *
 * @param date - תאריך ושעה לחישוב (UTC)
 * @returns מפת מיקומי כוכבי לכת (שם → {longitude})
 */
export function getEphemerisPositions(date: Date): PlanetPositions {
  const astroTime = new Astronomy.AstroTime(date)
  const positions: PlanetPositions = {}

  for (const entry of EPHEMERIS_BODIES) {
    const eclipticLon = getGeocentricLongitude(entry.body, astroTime)
    positions[entry.key] = { longitude: normalize(eclipticLon) }
  }

  return positions
}

/**
 * מחשב מיקומי כוכבי לכת עם מידע רטרוגרד לכל כוכב
 * משמש את דף הטרנזיטים שמציג סימון רטרוגרד (℞) בטבלה
 * מחשב isRetrograde בהשוואת מיקום T ו-T+1 יום
 *
 * @param date - תאריך ושעה לחישוב (UTC)
 * @returns מפת מיקומים עם מידע רטרוגרד ({longitude, is_retrograde})
 */
export function getEphemerisPositionsWithRetrograde(
  date: Date
): Record<string, { longitude: number; is_retrograde: boolean }> {
  const astroTime = new Astronomy.AstroTime(date)
  const positions: Record<string, { longitude: number; is_retrograde: boolean }> = {}

  for (const entry of EPHEMERIS_BODIES) {
    const eclipticLon = getGeocentricLongitude(entry.body, astroTime)
    const retrograde = isRetrograde(entry.body, astroTime)

    positions[entry.key] = {
      longitude: normalize(eclipticLon),
      is_retrograde: retrograde,
    }
  }

  return positions
}
