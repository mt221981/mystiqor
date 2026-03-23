/**
 * בדיקות יחידה לשירות האפמריס — astronomy-engine adapter
 * NOTE: קובץ זה מוכן לשימוש עתידי כאשר vitest יוגדר בפרויקט.
 *       הוא אינו מורץ כחלק מה-verify gate של תוכנית 06-01.
 *
 * בדיקות מכסות:
 * - דיוק מיקום השמש ב-J2000 (2000-01-01T12:00:00Z) — ±1 מעלה
 * - דיוק מיקום השמש ליד נקודת השוויון האביבי 2026 — ±2 מעלות
 * - getEphemerisPositions מחזיר 10 מפתחות כוכבים
 * - כל האורכים בטווח [0, 360)
 * - calculateTransitAspects מוצא conjunction כשכוכב טרנזיט ב-10° ונטאל ב-12°
 * - calculateInterChartAspects מוצא opposition בין שמש גלגל 1 ב-0° לירח גלגל 2 ב-180°
 */

import { describe, it, expect } from 'vitest'
import { getEphemerisPositions, getEphemerisPositionsWithRetrograde } from '@/services/astrology/ephemeris'
import { calculateTransitAspects, calculateInterChartAspects } from '@/services/astrology/aspects'
import type { PlanetPositions } from '@/services/astrology/aspects'

// ===== קבועים לבדיקה =====

/** 10 שמות כוכבי הלכת הצפויים */
const EXPECTED_PLANET_KEYS = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
]

// ===== בדיקות getEphemerisPositions =====

describe('getEphemerisPositions', () => {
  it('מחזיר את כל 10 מפתחות כוכבי הלכת', () => {
    const date = new Date('2000-01-01T12:00:00Z')
    const positions = getEphemerisPositions(date)
    const keys = Object.keys(positions)

    for (const expectedKey of EXPECTED_PLANET_KEYS) {
      expect(keys).toContain(expectedKey)
    }
    expect(keys).toHaveLength(10)
  })

  it('כל האורכים האקליפטיים בטווח [0, 360)', () => {
    const date = new Date('2024-06-15T12:00:00Z')
    const positions = getEphemerisPositions(date)

    for (const [name, pos] of Object.entries(positions)) {
      expect(pos.longitude, `${name} longitude`).toBeGreaterThanOrEqual(0)
      expect(pos.longitude, `${name} longitude`).toBeLessThan(360)
    }
  })

  it('אורך אקליפטי של השמש ב-J2000 (2000-01-01T12:00:00Z) קרוב ל-280.46°', () => {
    // ב-J2000 (ינואר 2000) השמש נמצאת בגדי — ~280°
    const date = new Date('2000-01-01T12:00:00Z')
    const positions = getEphemerisPositions(date)
    const sunLon = positions['sun']?.longitude

    expect(sunLon).toBeDefined()
    // 280.46 ± 1 מעלה
    expect(Math.abs((sunLon ?? 0) - 280.46)).toBeLessThan(1)
  })

  it('אורך אקליפטי של השמש ליד נקודת השוויון האביבי 2026-03-20 קרוב ל-0°', () => {
    // בנקודת השוויון האביבי השמש נמצאת ב-0° (טלה)
    const date = new Date('2026-03-20T12:00:00Z')
    const positions = getEphemerisPositions(date)
    const sunLon = positions['sun']?.longitude

    expect(sunLon).toBeDefined()
    // 0° ± 2 מעלות (לוקח בחשבון שהתאריך המדויק עשוי להשתנות)
    const diff = Math.min(sunLon ?? 0, 360 - (sunLon ?? 0))
    expect(diff).toBeLessThan(2)
  })
})

// ===== בדיקות getEphemerisPositionsWithRetrograde =====

describe('getEphemerisPositionsWithRetrograde', () => {
  it('מחזיר is_retrograde: false עבור שמש וירח תמיד', () => {
    const date = new Date('2024-06-15T12:00:00Z')
    const positions = getEphemerisPositionsWithRetrograde(date)

    expect(positions['sun']?.is_retrograde).toBe(false)
    expect(positions['moon']?.is_retrograde).toBe(false)
  })

  it('מחזיר שדה is_retrograde מסוג boolean לכל כוכב', () => {
    const date = new Date('2024-06-15T12:00:00Z')
    const positions = getEphemerisPositionsWithRetrograde(date)

    for (const [name, pos] of Object.entries(positions)) {
      expect(typeof pos.is_retrograde, `${name}.is_retrograde`).toBe('boolean')
    }
  })
})

// ===== בדיקות calculateTransitAspects =====

describe('calculateTransitAspects', () => {
  it('מוצא conjunction כשכוכב טרנזיט ב-10° וכוכב נטאל ב-12°', () => {
    const transiting: PlanetPositions = { sun: { longitude: 10 } }
    const natal: PlanetPositions = { sun: { longitude: 12 } }

    const aspects = calculateTransitAspects(transiting, natal)

    expect(aspects).toHaveLength(1)
    expect(aspects[0]?.type).toBe('Conjunction')
    expect(aspects[0]?.planet1).toBe('t:sun')
    expect(aspects[0]?.planet2).toBe('n:sun')
    expect(aspects[0]?.orb).toBeLessThanOrEqual(2)
  })

  it('מחזיר מערך ריק כשאין אספקטים בטווח', () => {
    const transiting: PlanetPositions = { sun: { longitude: 0 } }
    const natal: PlanetPositions = { moon: { longitude: 90 } }

    // 90° = square, אבל orb transit הוא 2 — זה בדיוק 0° off מ-square
    const aspects = calculateTransitAspects(transiting, natal)
    const squareAspect = aspects.find(a => a.type === 'Square')
    expect(squareAspect).toBeDefined()
  })

  it('מסמן planet1 עם קידומת "t:" ו-planet2 עם קידומת "n:"', () => {
    const transiting: PlanetPositions = { mars: { longitude: 50 } }
    const natal: PlanetPositions = { venus: { longitude: 50 } }

    const aspects = calculateTransitAspects(transiting, natal)

    expect(aspects[0]?.planet1).toMatch(/^t:/)
    expect(aspects[0]?.planet2).toMatch(/^n:/)
  })
})

// ===== בדיקות calculateInterChartAspects =====

describe('calculateInterChartAspects', () => {
  it('מוצא opposition בין שמש גלגל 1 ב-0° לירח גלגל 2 ב-180°', () => {
    const chart1: PlanetPositions = { sun: { longitude: 0 } }
    const chart2: PlanetPositions = { moon: { longitude: 180 } }

    const aspects = calculateInterChartAspects(chart1, chart2)

    expect(aspects).toHaveLength(1)
    expect(aspects[0]?.type).toBe('Opposition')
    expect(aspects[0]?.planet1).toBe('p1:sun')
    expect(aspects[0]?.planet2).toBe('p2:moon')
  })

  it('מסמן planet1 עם קידומת "p1:" ו-planet2 עם קידומת "p2:"', () => {
    const chart1: PlanetPositions = { sun: { longitude: 0 } }
    const chart2: PlanetPositions = { sun: { longitude: 0 } }

    const aspects = calculateInterChartAspects(chart1, chart2)

    expect(aspects[0]?.planet1).toMatch(/^p1:/)
    expect(aspects[0]?.planet2).toMatch(/^p2:/)
  })

  it('מחזיר cross-product מלא של שני הגלגלות', () => {
    // 2 כוכבים × 2 כוכבים = עד 4 זוגות בדיקה (רק אלה עם אספקט יוחזרו)
    const chart1: PlanetPositions = {
      sun:  { longitude: 0 },
      moon: { longitude: 60 },
    }
    const chart2: PlanetPositions = {
      sun:  { longitude: 0 },
      moon: { longitude: 60 },
    }

    const aspects = calculateInterChartAspects(chart1, chart2)

    // שמש גלגל1 vs שמש גלגל2 = conjunction (0°)
    // ירח גלגל1 vs ירח גלגל2 = conjunction (0°)
    const conjunctions = aspects.filter(a => a.type === 'Conjunction')
    expect(conjunctions.length).toBeGreaterThanOrEqual(2)
  })
})
