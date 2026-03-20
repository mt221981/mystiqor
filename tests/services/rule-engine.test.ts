/**
 * בדיקות מנוע כללים — כל אופרטורים
 * מכסה: INFRA-01 (evaluateCondition operators)
 */
import { describe, it, expect } from 'vitest'
import { evaluateCondition } from '@/services/analysis/rule-engine'

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
  it('contains', () => {
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
