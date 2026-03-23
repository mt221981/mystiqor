/**
 * שירות חישוב אספקטים אסטרולוגיים
 * מחשב יחסים זוויתיים בין כוכבי לכת: conjunction, opposition, trine, square, sextile
 * מקור: GEM 14 מ-base44/functions/calculateSolarReturn/entry.ts (lines 232-284)
 */

/** הגדרת אספקט יחיד — שם, זווית, ו-orb מקסימלי */
interface AspectDefinition {
  /** שם האספקט באנגלית */
  name: string
  /** הזווית המדויקת במעלות */
  angle: number
  /** הסטיה המקסימלית המותרת (orb) במעלות */
  orb: number
}

/** 5 האספקטים המז'וריים עם ה-orb המותר לכל אחד */
export const ASPECT_DEFINITIONS: AspectDefinition[] = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Trine', angle: 120, orb: 8 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Sextile', angle: 60, orb: 6 },
]

/** תוצאת אספקט בין שני כוכבי לכת */
export interface AspectResult {
  /** שם הכוכב הראשון */
  planet1: string
  /** שם הכוכב השני */
  planet2: string
  /** סוג האספקט (Conjunction, Opposition וכו') */
  type: string
  /** הסטיה בפועל מהזווית המדויקת (במעלות) */
  orb: number
  /** עוצמת האספקט: 1 = מדויק, 0 = בקצה ה-orb */
  strength: number
}

/** מפת מיקומי כוכבי לכת — שם הכוכב → אורך אקליפטי */
export interface PlanetPositions {
  [planetName: string]: { longitude: number }
}

/**
 * מחשב את התפלגות היסודות (אש, אדמה, אוויר, מים) לפי מיקומי הכוכבים
 * כל מזל שייך ליסוד: טלה/אריה/קשת=אש, שור/בתולה/גדי=אדמה וכו'
 *
 * @param planets - מפת מיקומי הכוכבים
 * @returns אובייקט עם ספירה לכל יסוד
 */
export function getElementDistribution(planets: PlanetPositions): Record<string, number> {
  const elements = ['fire', 'earth', 'air', 'water']
  const distribution: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 }

  for (const planet of Object.values(planets)) {
    const signIndex = Math.floor(planet.longitude / 30)
    const element = elements[signIndex % 4]
    if (element) {
      distribution[element] = (distribution[element] ?? 0) + 1
    }
  }

  return distribution
}

/**
 * מחשב את התפלגות המודאליות (קרדינלי, קבוע, משתנה) לפי מיקומי הכוכבים
 * טלה/סרטן/מאזניים/גדי=קרדינלי, שור/אריה/עקרב/דלי=קבוע, תאומים/בתולה/קשת/דגים=משתנה
 *
 * @param planets - מפת מיקומי הכוכבים
 * @returns אובייקט עם ספירה לכל מודאליות
 */
export function getModalityDistribution(planets: PlanetPositions): Record<string, number> {
  const modalities = ['cardinal', 'fixed', 'mutable']
  const distribution: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 }

  for (const planet of Object.values(planets)) {
    const signIndex = Math.floor(planet.longitude / 30)
    const modality = modalities[signIndex % 3]
    if (modality) {
      distribution[modality] = (distribution[modality] ?? 0) + 1
    }
  }

  return distribution
}

/** הגדרות אספקט לטרנזיטים — orbs הדוקים יותר (דיוק נדרש בחישובי השפעה טרנזיטורית) */
export const TRANSIT_ASPECT_DEFINITIONS: AspectDefinition[] = [
  { name: 'Conjunction', angle: 0,   orb: 2   },
  { name: 'Opposition',  angle: 180, orb: 2   },
  { name: 'Trine',       angle: 120, orb: 2   },
  { name: 'Square',      angle: 90,  orb: 2   },
  { name: 'Sextile',     angle: 60,  orb: 1.5 },
]

/** הגדרות אספקט לסינסטרי — orbs מרחיבים (מחשב יחסים בין שני גלגלות) */
export const SYNASTRY_ASPECT_DEFINITIONS: AspectDefinition[] = [
  { name: 'Conjunction', angle: 0,   orb: 5 },
  { name: 'Opposition',  angle: 180, orb: 5 },
  { name: 'Trine',       angle: 120, orb: 5 },
  { name: 'Square',      angle: 90,  orb: 4 },
  { name: 'Sextile',     angle: 60,  orb: 4 },
]

/**
 * פונקציה פנימית לחישוב אספקטים בין שתי קבוצות כוכבים שונות (cross-product)
 * משמשת הן calculateTransitAspects והן calculateInterChartAspects
 *
 * @param groupA - קבוצת הכוכבים הראשונה עם prefix
 * @param groupB - קבוצת הכוכבים השנייה עם prefix
 * @param definitions - הגדרות האספקט לשימוש (transit/synastry orbs)
 * @returns מערך אספקטים שנמצאו
 */
function calculateCrossAspects(
  groupA: { prefix: string; planets: PlanetPositions },
  groupB: { prefix: string; planets: PlanetPositions },
  definitions: AspectDefinition[]
): AspectResult[] {
  const results: AspectResult[] = []

  for (const [nameA, posA] of Object.entries(groupA.planets)) {
    for (const [nameB, posB] of Object.entries(groupB.planets)) {
      if (!posA || !posB) continue

      // חישוב הזווית הקצרה ביותר בין שני הכוכבים (0-180)
      let angle = Math.abs(posA.longitude - posB.longitude)
      if (angle > 180) angle = 360 - angle

      // חיפוש האספקט המתאים הראשון
      for (const def of definitions) {
        const orbValue = Math.abs(angle - def.angle)
        if (orbValue <= def.orb) {
          results.push({
            planet1: `${groupA.prefix}${nameA}`,
            planet2: `${groupB.prefix}${nameB}`,
            type: def.name,
            orb: Math.round(orbValue * 100) / 100,
            strength: Math.round((1 - orbValue / def.orb) * 1000) / 1000,
          })
          break // אספקט אחד לכל זוג
        }
      }
    }
  }

  return results
}

/**
 * מחשב אספקטים בין כוכבי טרנזיט ובין מיקומי לידה (natal)
 * כל כוכב טרנזיט נבדק מול כל כוכב נטאל — cross-product מלא
 * כוכבי טרנזיט מסומנים בקידומת "t:", כוכבי נטאל בקידומת "n:"
 * משתמש ב-TRANSIT_ASPECT_DEFINITIONS עם orbs הדוקים
 *
 * @param transiting - מיקומי כוכבי הטרנזיט (תאריך הנוכחי)
 * @param natal - מיקומי כוכבי הלידה
 * @returns מערך אספקטים בין הטרנזיט לנטאל
 */
export function calculateTransitAspects(
  transiting: PlanetPositions,
  natal: PlanetPositions
): AspectResult[] {
  return calculateCrossAspects(
    { prefix: 't:', planets: transiting },
    { prefix: 'n:', planets: natal },
    TRANSIT_ASPECT_DEFINITIONS
  )
}

/**
 * מחשב אספקטים בין-גלגלות לסינסטרי (השוואת שני גלגלי לידה)
 * כל כוכב מגלגל 1 נבדק מול כל כוכב מגלגל 2 — cross-product מלא
 * כוכבי גלגל 1 מסומנים בקידומת "p1:", כוכבי גלגל 2 בקידומת "p2:"
 * משתמש ב-SYNASTRY_ASPECT_DEFINITIONS עם orbs מרחיבים
 *
 * @param chart1 - מיקומי כוכבי הגלגל הראשון
 * @param chart2 - מיקומי כוכבי הגלגל השני
 * @returns מערך אספקטים בין שני הגלגלות
 */
export function calculateInterChartAspects(
  chart1: PlanetPositions,
  chart2: PlanetPositions
): AspectResult[] {
  return calculateCrossAspects(
    { prefix: 'p1:', planets: chart1 },
    { prefix: 'p2:', planets: chart2 },
    SYNASTRY_ASPECT_DEFINITIONS
  )
}

/**
 * מחשב את כל האספקטים בין כוכבי הלכת הנתונים
 * בודק כל זוג ייחודי (i < j) ומוצא את האספקט הראשון המתאים
 * עוצמת האספקט: strength = 1 - orb/maxOrb (ממוצע ל-3 ספרות אחרי נקודה)
 *
 * @param planets - מפת מיקומי הכוכבים (שם → {longitude})
 * @returns מערך של אספקטים שנמצאו
 */
export function calculateAspects(planets: PlanetPositions): AspectResult[] {
  const planetNames = Object.keys(planets)
  const aspects: AspectResult[] = []

  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1Name = planetNames[i]
      const p2Name = planetNames[j]

      // noUncheckedIndexedAccess — חייבים לוודא שהכוכבים קיימים
      if (!p1Name || !p2Name) continue

      const p1 = planets[p1Name]
      const p2 = planets[p2Name]

      if (!p1 || !p2) continue

      // חישוב הזווית הקצרה ביותר בין שני הכוכבים (0-180)
      let angle = Math.abs(p1.longitude - p2.longitude)
      if (angle > 180) angle = 360 - angle

      // חיפוש האספקט המתאים הראשון — break אחרי מציאה ראשונה
      for (const def of ASPECT_DEFINITIONS) {
        const orbValue = Math.abs(angle - def.angle)
        if (orbValue <= def.orb) {
          aspects.push({
            planet1: p1Name,
            planet2: p2Name,
            type: def.name,
            orb: Math.round(orbValue * 100) / 100,
            strength: Math.round((1 - orbValue / def.orb) * 1000) / 1000,
          })
          break // אספקט אחד לכל זוג
        }
      }
    }
  }

  return aspects
}
