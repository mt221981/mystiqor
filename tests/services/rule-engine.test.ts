/**
 * בדיקות מנוע כללים ותאימות נומרולוגית
 * מכסה: INFRA-01 (evaluateCondition operators, applyRules, compatibility)
 */
import { describe, it, expect } from 'vitest'
import { evaluateCondition, applyRules, type RuleMatch, type RuleOperator } from '@/services/analysis/rule-engine'
import { COMPATIBILITY_MATRIX, calculateNumerologyCompatibility } from '@/services/numerology/compatibility'

describe('evaluateCondition', () => {
  it('equals — מספרים שווים', () => {
    expect(evaluateCondition(5, 'equals', 5)).toBe(true)
  })
  it('equals — מחרוזות שוות', () => {
    expect(evaluateCondition('Aries', 'equals', 'Aries')).toBe(true)
  })
  it('not_equals — ערכים שונים', () => {
    expect(evaluateCondition(5, 'not_equals', 3)).toBe(true)
  })
  it('greater_than', () => {
    expect(evaluateCondition(10, 'greater_than', 5)).toBe(true)
  })
  it('less_than', () => {
    expect(evaluateCondition(3, 'less_than', 5)).toBe(true)
  })
  it('greater_or_equal — שווה', () => {
    expect(evaluateCondition(5, 'greater_or_equal', 5)).toBe(true)
  })
  it('less_or_equal — קטן מ', () => {
    expect(evaluateCondition(3, 'less_or_equal', 5)).toBe(true)
  })
  it('contains — מחרוזת מכילה תת-מחרוזת', () => {
    expect(evaluateCondition('Aries Sun', 'contains', 'Aries')).toBe(true)
  })
  it('in — ערך ברשימה', () => {
    expect(evaluateCondition('Aries', 'in', ['Aries', 'Leo', 'Sagittarius'])).toBe(true)
  })
  it('in — ערך לא ברשימה', () => {
    expect(evaluateCondition('Taurus', 'in', ['Aries', 'Leo'])).toBe(false)
  })
  it('אופרטור לא מוכר מחזיר false', () => {
    // @ts-expect-error testing invalid operator
    expect(evaluateCondition(5, 'unknown_op', 5)).toBe(false)
  })
})

describe('applyRules', () => {
  const sampleRules: RuleMatch[] = [
    {
      rule_id: 'r1',
      insight_template: { title: 'תובנה א' },
      weight: 0.9,
      base_confidence: 0.95,
      sources: ['numerology'],
      tags: ['personality'],
    },
    {
      rule_id: 'r2',
      insight_template: { title: 'תובנה ב' },
      weight: 0.5,
      base_confidence: 0.8,
      sources: ['astrology'],
      tags: ['career'],
    },
  ]

  it('מחזיר matched כמערך', () => {
    const { matched } = applyRules({}, sampleRules)
    expect(Array.isArray(matched)).toBe(true)
  })

  it('topInsights לא עולה על 3 פריטים', () => {
    const { topInsights } = applyRules({}, sampleRules)
    expect(topInsights.length).toBeLessThanOrEqual(3)
  })
})

describe('COMPATIBILITY_MATRIX', () => {
  it('מכיל ערכים לכל 12 מפתחות (1-9, 11, 22, 33)', () => {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]
    for (const key of keys) {
      expect(COMPATIBILITY_MATRIX[key]).toBeDefined()
    }
  })

  it('ציון תאימות 1-1 הוא 70', () => {
    expect(COMPATIBILITY_MATRIX[1]?.[1]).toBe(70)
  })
})

describe('calculateNumerologyCompatibility', () => {
  const p1 = { fullName: 'דוד', birthDate: '1990-05-15' }
  const p2 = { fullName: 'שרה', birthDate: '1992-08-20' }

  it('מחזיר אובייקט תאימות עם כל השדות', () => {
    const result = calculateNumerologyCompatibility(p1, p2)
    expect(result).toHaveProperty('person1')
    expect(result).toHaveProperty('person2')
    expect(result).toHaveProperty('scores')
    expect(result).toHaveProperty('analysis')
  })

  it('overall_score = lifePathScore*0.4 + destinyScore*0.3 + soulScore*0.3', () => {
    const result = calculateNumerologyCompatibility(p1, p2)
    const { life_path, destiny, soul, overall } = result.scores
    const expected = Math.round(life_path * 0.4 + destiny * 0.3 + soul * 0.3)
    expect(overall).toBe(expected)
  })
})
