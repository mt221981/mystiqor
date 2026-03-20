/**
 * בדיקות שירות אסטרולוגיה — חישוב אספקטים
 * מכסה: INFRA-01 (aspect calculation)
 */
import { describe, it, expect } from 'vitest'
import { calculateAspects } from '@/services/astrology/aspects'

describe('calculateAspects', () => {
  it('מזהה conjunction בין כוכבי לכת סמוכים', () => {
    const planets = { sun: { longitude: 10 }, moon: { longitude: 12 } }
    const aspects = calculateAspects(planets)
    expect(aspects.some(a => a.type === 'Conjunction')).toBe(true)
  })

  it('מזהה opposition בזווית 180°', () => {
    const planets = { sun: { longitude: 0 }, moon: { longitude: 180 } }
    const aspects = calculateAspects(planets)
    expect(aspects.some(a => a.type === 'Opposition')).toBe(true)
  })

  it('מחשב strength כאחוז הפוך של orb', () => {
    // orb=0 → strength=1.0 (conjunction מושלם)
    const planets = { sun: { longitude: 0 }, moon: { longitude: 0 } }
    const aspects = calculateAspects(planets)
    const conj = aspects.find(a => a.type === 'Conjunction')
    expect(conj?.strength).toBe(1)
  })

  it('לא מחזיר aspects מחוץ לטווח ה-orb', () => {
    // 45° — לא אחד מ-5 האספקטים המוגדרים
    const planets = { sun: { longitude: 0 }, moon: { longitude: 45 } }
    const aspects = calculateAspects(planets)
    expect(aspects).toHaveLength(0)
  })
})
