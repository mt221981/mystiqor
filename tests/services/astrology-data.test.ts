/**
 * בדיקות שלמות נתונים אסטרולוגיים — Nyquist Wave 0
 * מכסה: ASTRO-01 (מזלות), ASTRO-02 (כוכבים), ASTRO-03 (בתים), ASTRO-04 (אספקטים)
 */
import { describe, it, expect } from 'vitest'
import {
  ZODIAC_SIGNS,
  PLANETS,
  HOUSES,
  ASPECTS,
} from '@/lib/constants/astrology-data'

describe('Astrology Data Completeness', () => {

  // ===== ASTRO-01: מזלות =====

  describe('ZODIAC_SIGNS (ASTRO-01)', () => {
    it('יש בדיוק 12 מזלות', () => {
      expect(Object.keys(ZODIAC_SIGNS).length).toBe(12)
    })

    it('כל מזל מכיל את כל 7 שדות החובה ללא ריקנות', () => {
      Object.values(ZODIAC_SIGNS).forEach((sign) => {
        expect(sign.key).toBeTruthy()
        expect(sign.emoji).toBeTruthy()
        expect(sign.color).toBeTruthy()
        expect(sign.name).toBeTruthy()
        expect(sign.element).toBeTruthy()
        expect(sign.ruler).toBeTruthy()
        expect(sign.description).toBeTruthy()
      })
    })

    it('כל 12 מפתחות המזלות קיימים', () => {
      const expectedKeys = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
      ]
      expectedKeys.forEach((key) => {
        expect(ZODIAC_SIGNS).toHaveProperty(key)
      })
    })
  })

  // ===== ASTRO-02: כוכבי לכת =====

  describe('PLANETS (ASTRO-02)', () => {
    it('יש בדיוק 10 כוכבי לכת', () => {
      expect(Object.keys(PLANETS).length).toBe(10)
    })

    it('כל כוכב לכת מכיל את כל 6 שדות החובה ללא ריקנות', () => {
      Object.values(PLANETS).forEach((planet) => {
        expect(planet.key).toBeTruthy()
        expect(planet.symbol).toBeTruthy()
        expect(planet.name).toBeTruthy()
        expect(planet.color).toBeTruthy()
        expect(planet.meaning).toBeTruthy()
        expect(planet.description).toBeTruthy()
      })
    })

    it('כל 10 מפתחות כוכבי הלכת קיימים', () => {
      const expectedKeys = [
        'sun', 'moon', 'mercury', 'venus', 'mars',
        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
      ]
      expectedKeys.forEach((key) => {
        expect(PLANETS).toHaveProperty(key)
      })
    })
  })

  // ===== ASTRO-03: בתים =====

  describe('HOUSES (ASTRO-03)', () => {
    it('יש בדיוק 12 בתים', () => {
      expect(HOUSES.length).toBe(12)
    })

    it('כל בית מכיל מספר 1-12 ושדות טקסט לא ריקים', () => {
      HOUSES.forEach((house) => {
        expect(house.number).toBeGreaterThanOrEqual(1)
        expect(house.number).toBeLessThanOrEqual(12)
        expect(house.name).toBeTruthy()
        expect(house.meaning).toBeTruthy()
        expect(house.description).toBeTruthy()
      })
    })

    it('מספרי הבתים רצופים 1 עד 12', () => {
      const numbers = HOUSES.map((h) => h.number)
      const expectedNumbers = Array.from({ length: 12 }, (_, i) => i + 1)
      expect(numbers).toEqual(expectedNumbers)
    })
  })

  // ===== ASTRO-04: אספקטים =====

  describe('ASPECTS (ASTRO-04)', () => {
    it('יש בדיוק 7 אספקטים', () => {
      expect(Object.keys(ASPECTS).length).toBe(7)
    })

    it('כל אספקט מכיל שדות טקסט לא ריקים', () => {
      Object.values(ASPECTS).forEach((aspect) => {
        expect(aspect.key).toBeTruthy()
        expect(aspect.name).toBeTruthy()
        expect(aspect.color).toBeTruthy()
        expect(aspect.meaning).toBeTruthy()
        expect(aspect.description).toBeTruthy()
      })
    })

    it('חוזק כל אספקט הוא מספר בין 0 ל-1 (כולל)', () => {
      Object.values(ASPECTS).forEach((aspect) => {
        expect(typeof aspect.strength).toBe('number')
        expect(aspect.strength).toBeGreaterThanOrEqual(0)
        expect(aspect.strength).toBeLessThanOrEqual(1)
      })
    })

    it('כל 7 מפתחות האספקטים קיימים', () => {
      const expectedKeys = [
        'Conjunction', 'Opposition', 'Trine', 'Square',
        'Sextile', 'Quincunx', 'Semi-sextile',
      ]
      expectedKeys.forEach((key) => {
        expect(ASPECTS).toHaveProperty(key)
      })
    })
  })
})
