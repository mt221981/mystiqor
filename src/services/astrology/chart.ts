/**
 * שירות מפת הגלגל האסטרולוגי — חישוב בתים (Placidus) ואסמבלי מפה מלאה
 * מקור: GEM 1 מ-base44/functions/calculateSolarReturn/entry.ts — חלק הבתים
 * משתמש ב-solar-return.ts לחישובי JD ו-normalize
 */

import { normalize, calculateJulianDate } from './solar-return'
import { calculateAspects, type AspectResult, type PlanetPositions } from './aspects'

/** נתוני בית אסטרולוגי יחיד */
export interface HouseData {
  /** מספר הבית (1-12) */
  house_number: number
  /** זווית הקודקוד במעלות (0-360) */
  cusp_longitude: number
  /** שם המזל בקודקוד הבית */
  sign: string
}

/** נתוני מפת גלגל מלאה */
export interface ChartData {
  /** מעלת העולה (Ascendant) */
  ascendant: number
  /** מעלת אמצע השמים (Midheaven) */
  midheaven: number
  /** 12 הבתים האסטרולוגיים */
  houses: HouseData[]
  /** אספקטים בין כוכבי הלכת */
  aspects: AspectResult[]
}

/** 12 שמות המזלות בסדר מ-0° (טלה) עד 330° (דגים) */
const ZODIAC_SIGN_NAMES: readonly string[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]

/**
 * מחזיר את שם המזל לאורך אקליפטי נתון
 * כל מזל מכסה 30° — Aries=0-30, Taurus=30-60, ... Pisces=330-360
 *
 * @param longitude - אורך אקליפטי בטווח [0, 360)
 * @returns שם המזל באנגלית
 */
export function getSign(longitude: number): string {
  const signIndex = Math.floor(normalize(longitude) / 30)
  const clampedIndex = Math.min(signIndex, 11)
  return ZODIAC_SIGN_NAMES[clampedIndex] ?? 'Aries'
}

/**
 * מחשב את 12 הבתים האסטרולוגיים לפי שיטת Placidus
 * מחשב GMST → LST → Ascendant → MC → 12 cusps בריווח שווה מ-Ascendant
 *
 * @param date - תאריך ושעה לחישוב
 * @param lat - קו רוחב (latitude)
 * @param lon - קו אורך (longitude)
 * @returns נתוני מפה כולל ascendant, midheaven ו-12 בתים
 */
export function calculateHouses(date: Date, lat: number, lon: number): ChartData {
  const JD = calculateJulianDate(date)
  const T = (JD - 2451545.0) / 36525

  // Greenwich Mean Sidereal Time (GMST) בחישוב ישיר
  const GMST =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000

  // Local Sidereal Time — הוספת קו האורך המקומי
  const LST = normalize(GMST + lon)

  // Ascendant — חישוב מ-LST וקו הרוחב
  const latRad = (lat * Math.PI) / 180
  const lstRad = (LST * Math.PI) / 180
  const ascRad = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.sin(latRad))
  const asc = normalize((ascRad * 180) / Math.PI)

  // Midheaven (MC) — 90° אחרי LST
  const mc = normalize(LST + 90)

  // 12 בתים — ריווח שווה מ-Ascendant (פישוט Placidus)
  const houses: HouseData[] = []
  for (let i = 0; i < 12; i++) {
    const cusp = normalize(asc + i * 30)
    houses.push({
      house_number: i + 1,
      cusp_longitude: Math.round(cusp * 100) / 100,
      sign: getSign(cusp),
    })
  }

  return {
    ascendant: Math.round(asc * 100) / 100,
    midheaven: Math.round(mc * 100) / 100,
    houses,
    aspects: [],
  }
}

/**
 * מאסף מפת גלגל מלאה — בתים + אספקטים מכוכבי הלכת
 * קורא ל-calculateHouses לבתים ול-calculateAspects לאספקטים
 * מחזיר ChartData מאוחדת
 *
 * @param date - תאריך ושעה לחישוב
 * @param lat - קו רוחב של מקום הלידה
 * @param lon - קו אורך של מקום הלידה
 * @param planets - מיקומי כוכבי הלכת (מחושבים בנפרד)
 * @returns מפת גלגל מלאה עם בתים ואספקטים
 */
export function assembleChart(
  date: Date,
  lat: number,
  lon: number,
  planets: PlanetPositions
): ChartData {
  const chartBase = calculateHouses(date, lat, lon)
  const aspects = calculateAspects(planets)

  return {
    ...chartBase,
    aspects,
  }
}
