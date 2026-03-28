/**
 * בדיקות לקומפוננטת SpreadSelector — Wave 0 scaffold
 * מכסה: TAROT-03 (4 פריסות מוצגות)
 */

import { describe, it, expect } from 'vitest'
import { TAROT_SPREADS } from '@/lib/constants/tarot-data'

describe('SpreadSelector — TAROT-03 spread data', () => {
  it('TAROT_SPREADS contains exactly 4 spread definitions', () => {
    expect(TAROT_SPREADS).toHaveLength(4)
  })

  it('each spread has id, name, description, cardCount, and positions', () => {
    for (const spread of TAROT_SPREADS) {
      expect(spread.id).toBeTruthy()
      expect(spread.name).toBeTruthy()
      expect(spread.description).toBeTruthy()
      expect(spread.cardCount).toBeGreaterThan(0)
      expect(spread.positions.length).toBe(spread.cardCount)
    }
  })

  it('spread card counts are 1, 3, 5, and 10', () => {
    const counts = TAROT_SPREADS.map(s => s.cardCount)
    expect(counts).toEqual([1, 3, 5, 10])
  })

  it('Celtic Cross spread has 10 positions with Hebrew names', () => {
    const celtic = TAROT_SPREADS.find(s => s.id === 'celtic_cross')
    expect(celtic).toBeDefined()
    expect(celtic!.positions).toHaveLength(10)
    expect(celtic!.positions[0]).toBe('המצב הנוכחי')
    expect(celtic!.positions[9]).toBe('התוצאה הסופית')
  })
})
