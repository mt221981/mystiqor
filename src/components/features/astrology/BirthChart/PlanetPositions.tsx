'use client'

/**
 * רכיב מיקומי כוכבי הלכת על מפת הגלגל האסטרולוגי
 * מציג כל כוכב כמעגל צבעוני עם סמל אסטרונומי בפנים
 * נוסחת מיקום מבוססת על BirthChart.jsx מהמקור — lines 315-349
 */

import { PLANET_SYMBOLS, type PlanetKey } from '@/lib/constants/astrology'
import { getPlanetPosition, PLANET_ORBIT_RADIUS } from './utils'

/** Props של רכיב PlanetPositions */
export interface PlanetPositionsProps {
  /** מפת מיקומי כוכבי הלכת — שם הכוכב → אורך אקליפטי */
  planets: Record<string, { longitude: number }>
}

/**
 * מציגה את כוכבי הלכת על מפת הגלגל
 * כל כוכב מופיע כמעגל צבעוני עם הסמל האסטרונומי שלו
 * כוכבים לא מוכרים (שם לא קיים ב-PLANET_SYMBOLS) מדולגים
 *
 * @param planets - מיקומי כוכבי הלכת
 * @returns אלמנט SVG <g> עם כוכבי הלכת
 */
export function PlanetPositions({ planets }: PlanetPositionsProps) {
  return (
    <g>
      {Object.entries(planets).map(([planetName, planetData]) => {
        // שימוש ב-optional chaining — planetName הוא string כללי, לא PlanetKey
        const planetInfo = PLANET_SYMBOLS[planetName as PlanetKey]

        // מדלגים על כוכבים לא מוכרים
        if (!planetInfo) return null

        const position = getPlanetPosition(planetData.longitude, PLANET_ORBIT_RADIUS)
        const color = planetInfo.color
        const symbol = planetInfo.symbol

        return (
          <g key={planetName}>
            {/* מעגל צבעוני של הכוכב */}
            <circle
              cx={position.x}
              cy={position.y}
              r={12}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* סמל אסטרונומי של הכוכב */}
            <text
              x={position.x}
              y={position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fill="#FFFFFF"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {symbol}
            </text>
          </g>
        )
      })}
    </g>
  )
}
