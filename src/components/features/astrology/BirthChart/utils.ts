/**
 * כלי SVG משותפים למפת הגלגל האסטרולוגי
 * קבועי גיאומטריה ופונקציות חישוב מיקום על המעגל
 * מבוסס על BirthChart.jsx מהמקור — lines 94-99
 */

// ===== קבועי גיאומטריה =====

/** מרכז ה-SVG (x ו-y) */
export const CHART_CENTER = 250

/** רדיוס המעגל החיצוני */
export const OUTER_RADIUS = 240

/** רדיוס מיקום אמוג'י המזלות */
export const ZODIAC_RADIUS = 220

/** רדיוס קו הפרדה של אזור המזלות (מקווקו) */
export const ZODIAC_SEPARATOR_RADIUS = 200

/** רדיוס מסלול כוכבי הלכת (מיקום הנקודות) */
export const PLANET_ORBIT_RADIUS = 170

/** רדיוס מעגל המסלול המקווקו של כוכבי הלכת */
export const PLANET_RING_RADIUS = 160

/** רדיוס מיקום מספרי הבתים */
export const HOUSE_NUMBER_RADIUS = 135

// ===== פונקציות חישוב =====

/**
 * מחשב את מיקום ה-XY על מעגל ה-SVG לאורך אקליפטי נתון
 * הנוסחה מבוססת על BirthChart.jsx — lines 94-99
 * מסובב ב-90° כדי שה-0° יהיה בצד ימין ולמעלה
 *
 * @param longitude - אורך אקליפטי בטווח [0, 360)
 * @param radius - רדיוס המעגל (בפיקסלים)
 * @returns קואורדינטות {x, y} על המעגל
 */
export function getPlanetPosition(longitude: number, radius: number): { x: number; y: number } {
  const angle = (longitude - 90) * (Math.PI / 180)
  return {
    x: CHART_CENTER + radius * Math.cos(angle),
    y: CHART_CENTER + radius * Math.sin(angle),
  }
}

/**
 * מחשב את הזווית המרכזית של קטע מזל בגלגל
 * כל מזל תופס 30° — הזווית המחוזרת היא אמצע הקטע
 *
 * @param signIndex - אינדקס המזל (0=טלה, 11=דגים)
 * @returns זווית ברדיאנים
 */
export function getAngleForSign(signIndex: number): number {
  return (signIndex * 30 - 90 + 15) * (Math.PI / 180)
}
