/**
 * שירות תזמון אסטרולוגי — דירוג ימים לפי פעילות ומצב כוכבי הלכת
 * מחשב ציון לכל יום בטווח תאריכים לפי אספקטי טרנזיט על הגלגל הנטאלי
 * ומשקולות מותאמות לסוג הפעילות
 */

import { getEphemerisPositions, getEphemerisPositionsWithRetrograde } from './ephemeris'
import { calculateTransitAspects } from './aspects'
import { getSign } from './chart'
import { normalize } from './solar-return'
import type { PlanetPositions } from './aspects'
import { ACTIVITY_TYPES, ACTIVITY_LABELS, type ActivityType } from '@/lib/constants/timing-activities'

// ===== ייצוא מחדש של קבועים =====

/** 8 סוגי פעילות נתמכים — מיוצא מ-@/lib/constants/timing-activities */
export { ACTIVITY_TYPES, ACTIVITY_LABELS, type ActivityType }

/**
 * משקולות אספקט לכל סוג פעילות
 * מפתח: `${planet_transit}:${aspect_type}` — ערך: ניקוד חיובי או שלילי
 * כוכבי הטרנזיט מסומנים עם קידומת "t:", נטאל עם "n:"
 * פורמט: `${transitPlanet}_${aspectType}` = ניקוד
 */
type ActivityWeights = Record<string, number>

/** טבלת משקולות: לכל פעילות — אספקטים ומשקלם */
const ACTIVITY_ASPECT_WEIGHTS: Record<ActivityType, ActivityWeights> = {
  relationship_start: {
    // נוגה — שמש/ירח/נוגה נטאל
    venus_Trine: 30,
    venus_Sextile: 20,
    venus_Conjunction: 25,
    venus_Square: -15,
    venus_Opposition: -20,
    // ירח
    moon_Trine: 15,
    moon_Sextile: 10,
    // מאדים — מגרש
    mars_Square: -10,
    mars_Opposition: -15,
    // שמש
    sun_Trine: 15,
    sun_Sextile: 10,
  },
  business_launch: {
    // מרקורי — תקשורת וחוזים
    mercury_Trine: 15,
    mercury_Sextile: 10,
    mercury_Conjunction: 12,
    // מאדים — אנרגיה ומנהיגות
    mars_Sextile: 25,
    mars_Trine: 20,
    mars_Square: -10,
    // נוגה — כסף ושותפות
    venus_Trine: 5,
    venus_Sextile: 5,
    // צדק — שפע
    jupiter_Trine: 20,
    jupiter_Sextile: 15,
    jupiter_Square: -10,
  },
  travel: {
    // יופיטר — הרפתקה ומסע
    jupiter_Trine: 25,
    jupiter_Sextile: 20,
    jupiter_Conjunction: 20,
    // מרקורי — תנועה
    mercury_Trine: 10,
    mercury_Sextile: 8,
    // מאדים — מרץ
    mars_Trine: 15,
    mars_Square: -10,
    // שבתאי — דחיות ועיכובים
    saturn_Square: -20,
    saturn_Opposition: -15,
  },
  health_procedure: {
    // שבתאי — משמעת ומסגרת
    saturn_Trine: 20,
    saturn_Sextile: 15,
    // מאדים — כירורגיה? תזהר
    mars_Square: -15,
    mars_Opposition: -20,
    mars_Conjunction: -10,
    // שמש — חיוניות
    sun_Trine: 20,
    sun_Sextile: 15,
    // ירח — ריפוי
    moon_Trine: 10,
    moon_Sextile: 8,
    // נפטון — הרדמה? משתנה
    neptune_Square: -10,
    neptune_Opposition: -10,
  },
  creative_project: {
    // נוגה — יצירה ואסתטיקה
    venus_Trine: 25,
    venus_Sextile: 20,
    venus_Conjunction: 20,
    // ירח — השראה
    moon_Trine: 20,
    moon_Sextile: 15,
    // שמש — ביטוי עצמי
    sun_Trine: 15,
    sun_Sextile: 10,
    // שבתאי — מגביל יצירה
    saturn_Square: -10,
    saturn_Opposition: -8,
    // אורנוס — פרצים יצירתיים
    uranus_Trine: 15,
    uranus_Sextile: 10,
  },
  financial_decision: {
    // נוגה — כסף
    venus_Trine: 20,
    venus_Sextile: 15,
    venus_Square: -15,
    venus_Opposition: -20,
    // צדק — שפע
    jupiter_Trine: 25,
    jupiter_Sextile: 20,
    jupiter_Square: -15,
    // שבתאי — ניהול נכסים
    saturn_Trine: 15,
    saturn_Sextile: 10,
    // מרקורי — חוזים ומשא ומתן
    mercury_Trine: 10,
    mercury_Square: -10,
    // פלוטו — שינויים כספיים גדולים
    pluto_Square: -15,
    pluto_Opposition: -10,
  },
  spiritual_practice: {
    // נפטון — רוחניות
    neptune_Trine: 25,
    neptune_Sextile: 20,
    neptune_Conjunction: 20,
    neptune_Square: -10,
    // ירח — אינטואיציה
    moon_Trine: 20,
    moon_Sextile: 15,
    // שמש — תובנה
    sun_Trine: 10,
    sun_Sextile: 8,
    // מרקורי — עיכוב מדיטציה
    mercury_Square: -10,
  },
  important_meeting: {
    // מרקורי — תקשורת
    mercury_Trine: 20,
    mercury_Sextile: 15,
    mercury_Conjunction: 18,
    mercury_Square: -15,
    mercury_Opposition: -10,
    // שמש — נוכחות
    sun_Trine: 15,
    sun_Sextile: 10,
    // נוגה — דיפלומטיה
    venus_Trine: 10,
    venus_Sextile: 8,
    // מאדים — עצבנות
    mars_Square: -15,
    mars_Opposition: -10,
    // שבתאי — רצינות
    saturn_Trine: 10,
    saturn_Square: -12,
  },
}

// ===== טיפוסי פלט =====

/** ציון יום בודד בכלי התזמון */
export interface DayScore {
  /** תאריך בפורמט ISO (YYYY-MM-DD) */
  date: string
  /** ציון כולל 0-100 */
  score: number
  /** שם מזל הירח ביום זה */
  moonSign: string
  /** גורמים חיוביים — שמות האספקטים שתרמו חיובית */
  favorable: string[]
  /** גורמים שליליים — שמות האספקטים שתרמו שלילית */
  unfavorable: string[]
  /** האם מרקורי רטרוגרד ביום זה */
  mercury_retrograde: boolean
  /** האם הירח קרוב לסיום מזל (near void of course) */
  near_void_moon: boolean
}

// ===== לוגיקת ציון =====

/**
 * מחשב ציון יום בודד לפי סוג פעילות ומיקומי גלגל נטאלי
 * ציון מבוסס על אספקטי טרנזיט, קנסות מרקורי רטרוגרד ו-void of course moon
 *
 * @param dayDate - תאריך היום לחישוב
 * @param natalPlanets - מיקומי כוכבי גלגל הלידה
 * @param activityType - סוג הפעילות לדירוג
 * @returns ציון יום מפורט
 */
export function scoreDayForActivity(
  dayDate: Date,
  natalPlanets: PlanetPositions,
  activityType: string
): DayScore {
  const activity = ACTIVITY_TYPES.includes(activityType as ActivityType)
    ? (activityType as ActivityType)
    : 'important_meeting'

  const weights = ACTIVITY_ASPECT_WEIGHTS[activity]

  // חישוב מיקומי טרנזיט עם מידע רטרוגרד
  const transitWithRetrograde = getEphemerisPositionsWithRetrograde(dayDate)
  const transitPlanets = getEphemerisPositions(dayDate)

  // חישוב אספקטי טרנזיט
  const aspects = calculateTransitAspects(transitPlanets, natalPlanets)

  // בדיקת מרקורי רטרוגרד
  const mercury_retrograde = transitWithRetrograde['mercury']?.is_retrograde ?? false

  // בדיקת near void of course moon — ירח בתוך 2° מסיום מזל
  const moonLon = transitPlanets['moon']?.longitude ?? 0
  const moonInSignDegree = normalize(moonLon) % 30
  const near_void_moon = moonInSignDegree > 28

  // מזל הירח
  const moonSign = getSign(moonLon)

  // חישוב ציון מהאספקטים
  let rawScore = 50 // ציון בסיס
  const favorable: string[] = []
  const unfavorable: string[] = []

  for (const aspect of aspects) {
    // חילוץ שם הכוכב הטרנזיט (ללא קידומת "t:")
    const transitPlanetName = aspect.planet1.replace('t:', '')
    const aspectKey = `${transitPlanetName}_${aspect.type}`
    const weight = weights[aspectKey]

    if (weight !== undefined) {
      // משקל לפי עוצמת האספקט (strength 0-1)
      const contribution = weight * aspect.strength
      rawScore += contribution

      const natalPlanet = aspect.planet2.replace('n:', '')
      const label = `${transitPlanetName} ${aspect.type} נטאל ${natalPlanet}`

      if (contribution > 0) {
        favorable.push(label)
      } else if (contribution < 0) {
        unfavorable.push(label)
      }
    }
  }

  // קנסות מיוחדים
  if (mercury_retrograde) {
    const penalty = activity === 'business_launch' || activity === 'financial_decision'
      ? -20
      : activity === 'spiritual_practice'
      ? -10
      : -15
    rawScore += penalty
    unfavorable.push('מרקורי רטרוגרד')
  }

  if (near_void_moon) {
    rawScore -= 15
    unfavorable.push('ירח קרוב לחסר חלקיות')
  }

  // הגבלה ל-0-100
  const score = Math.round(Math.max(0, Math.min(100, rawScore)))

  return {
    date: dayDate.toISOString().split('T')[0] ?? dayDate.toISOString(),
    score,
    moonSign,
    favorable: favorable.slice(0, 5), // הגבלה ל-5 גורמים חיוביים
    unfavorable: unfavorable.slice(0, 5), // הגבלה ל-5 גורמים שליליים
    mercury_retrograde,
    near_void_moon,
  }
}
