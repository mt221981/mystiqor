/**
 * בדיקות רכיב BirthChart — מפת גלגל אסטרולוגית
 * TOOL-02: SVG מרנדר, מיקומי כוכבים בגבולות הנכונים
 */
import { render } from '@testing-library/react'
import { BirthChart } from '@/components/features/astrology/BirthChart'
import { getPlanetPosition } from '@/components/features/astrology/BirthChart/utils'
import type { ChartData } from '@/services/astrology/chart'

/** נתוני מפת גלגל מינימליים לבדיקה */
const mockChartData: ChartData = {
  ascendant: 0,
  midheaven: 270,
  houses: Array.from({ length: 12 }, (_, i) => ({
    house_number: i + 1,
    cusp_longitude: i * 30,
    sign: 'Aries',
  })),
  aspects: [],
}

/** מיקומי כוכבים מינימליים לבדיקה */
const mockPlanets: Record<string, { longitude: number }> = {
  sun: { longitude: 0 },
  moon: { longitude: 90 },
}

describe('BirthChart', () => {
  it('מרנדר אלמנט SVG ללא קריסה', () => {
    const { container } = render(
      <BirthChart planets={mockPlanets} chartData={mockChartData} />
    )
    // SVG קיים בתוך ה-container
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('getPlanetPosition עם longitude=0 מניח את הכוכב ב-x בין 200 ל-300', () => {
    // GEM 6 math: angle = (0 - 90) * PI/180 = -PI/2
    // x = 250 + 175 * cos(-PI/2) ≈ 250 + 0 = 250
    const pos = getPlanetPosition(0, 175)
    expect(pos.x).toBeGreaterThan(200)
    expect(pos.x).toBeLessThan(300)
  })

  it('ZodiacRing מרנדר 12 קבוצות מזלות', () => {
    const { container } = render(
      <BirthChart planets={mockPlanets} chartData={mockChartData} />
    )
    // בדיקה שיש 12 אלמנטי טקסט של אמוג'י מזלות (כל מזל מרנדר text עם emoji)
    const svgTexts = container.querySelectorAll('svg text')
    // צריך לפחות 12 אלמנטי text (אחד לכל מזל)
    expect(svgTexts.length).toBeGreaterThanOrEqual(12)
  })
})
