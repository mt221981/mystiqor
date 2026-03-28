/**
 * בדיקות ל-SpreadLayout — Wave 0 scaffold
 * מכסה: TAROT-03 (מספר עמדות נכון לכל פריסה)
 */

import { describe, it, expect } from 'vitest'
import { TAROT_SPREADS } from '@/lib/constants/tarot-data'

describe('SpreadLayout — TAROT-03 position count validation', () => {
  it('single card spread has exactly 1 position', () => {
    const spread = TAROT_SPREADS.find(s => s.id === 'single_card')
    expect(spread!.positions).toHaveLength(1)
  })

  it('three card spread has 3 positions: past, present, future', () => {
    const spread = TAROT_SPREADS.find(s => s.id === 'three_card')
    expect(spread!.positions).toHaveLength(3)
    expect(spread!.positions).toEqual(['עבר', 'הווה', 'עתיד'])
  })

  it('relationship spread has 5 positions', () => {
    const spread = TAROT_SPREADS.find(s => s.id === 'relationship')
    expect(spread!.positions).toHaveLength(5)
  })

  it('celtic cross spread has 10 positions', () => {
    const spread = TAROT_SPREADS.find(s => s.id === 'celtic_cross')
    expect(spread!.positions).toHaveLength(10)
  })
})
