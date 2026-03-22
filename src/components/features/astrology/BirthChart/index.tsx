'use client'

/**
 * רכיב מפת הגלגל האסטרולוגי — BirthChart
 * מרכיב את כל תת-הרכיבים: ZodiacRing, HouseOverlay, AspectLines, PlanetPositions
 * בתוך SVG יחיד עם viewBox="0 0 500 500"
 *
 * שימוש: ניתן לעטוף ב-next/dynamic בדף הקורא לשיפור ביצועים
 * מפת הגלגל היא הרכיב הויזואלי המרכזי של כלי האסטרולוגיה
 *
 * @example
 * const DynamicBirthChart = dynamic(() => import('@/components/features/astrology/BirthChart'), { ssr: false })
 */

import { type ChartData } from '@/services/astrology/chart'
import { ZodiacRing } from './ZodiacRing'
import { HouseOverlay } from './HouseOverlay'
import { AspectLines } from './AspectLines'
import { PlanetPositions } from './PlanetPositions'
import { PLANET_RING_RADIUS, CHART_CENTER } from './utils'

/** Props של רכיב BirthChart */
export interface BirthChartProps {
  /** מיקומי כוכבי הלכת — שם הכוכב → אורך אקליפטי */
  planets: Record<string, { longitude: number }>
  /** נתוני מפת הגלגל — בתים, עולה, אמצע השמים, אספקטים */
  chartData: ChartData
}

/**
 * מציגה מפת גלגל אסטרולוגית מלאה כ-SVG
 * סדר הציור: רקע → ZodiacRing → HouseOverlay → AspectLines → PlanetPositions → מסלול מקווקו
 *
 * @param planets - מיקומי כוכבי הלכת
 * @param chartData - נתוני המפה (בתים, עולה, MC, אספקטים)
 * @returns div עם SVG של מפת הגלגל
 */
export function BirthChart({ planets, chartData }: BirthChartProps) {
  return (
    <div className="w-full aspect-square">
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        aria-label="מפת גלגל אסטרולוגית"
        role="img"
      >
        {/* רקע כהה */}
        <circle
          cx={CHART_CENTER}
          cy={CHART_CENTER}
          r={240}
          fill="#0f172a"
        />

        {/* טבעת המזלות החיצונית */}
        <ZodiacRing />

        {/* שכבת הבתים — קווים, מספרים, עולה, MC */}
        <HouseOverlay
          ascendant={chartData.ascendant}
          midheaven={chartData.midheaven}
        />

        {/* קווי האספקטים בין כוכבי הלכת */}
        <AspectLines
          aspects={chartData.aspects}
          planets={planets}
        />

        {/* כוכבי הלכת — מעגלים עם סמלים */}
        <PlanetPositions planets={planets} />

        {/* מסלול כוכבי הלכת המקווקו — r=160 */}
        <circle
          cx={CHART_CENTER}
          cy={CHART_CENTER}
          r={PLANET_RING_RADIUS}
          stroke="#6366F1"
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}

export default BirthChart
