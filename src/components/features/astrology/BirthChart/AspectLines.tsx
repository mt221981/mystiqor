'use client'

/**
 * רכיב קווי האספקטים על מפת הגלגל האסטרולוגי
 * מציג קווים צבעוניים המחברים בין זוגות כוכבים שיש ביניהם אספקט
 * צבע הקו נקבע לפי סוג האספקט מ-ASPECT_TYPES
 * מבוסס על BirthChart.jsx מהמקור — lines 271-312
 */

import { ASPECT_TYPES, type AspectTypeKey } from '@/lib/constants/astrology'
import { type AspectResult } from '@/services/astrology/aspects'
import { getPlanetPosition, PLANET_ORBIT_RADIUS } from './utils'

/** Props של רכיב AspectLines */
export interface AspectLinesProps {
  /** רשימת האספקטים בין כוכבי הלכת */
  aspects: AspectResult[]
  /** מפת מיקומי כוכבי הלכת — שם הכוכב → אורך אקליפטי */
  planets: Record<string, { longitude: number }>
}

/**
 * מציגה קווי אספקטים בין כוכבי הלכת על המפה
 * כל קו מחבר בין שני כוכבים שיש ביניהם אספקט אסטרולוגי
 * האטימות נחשבת לפי עוצמת האספקט: 0.3 + strength * 0.5
 *
 * @param aspects - רשימת האספקטים
 * @param planets - מיקומי כוכבי הלכת
 * @returns אלמנט SVG <g> עם קווי האספקטים
 */
export function AspectLines({ aspects, planets }: AspectLinesProps) {
  return (
    <g>
      {aspects.map((aspect, idx) => {
        // חיפוש מיקום כל אחד מהכוכבים
        const planet1Data = planets[aspect.planet1]
        const planet2Data = planets[aspect.planet2]

        // מדלגים אם אחד הכוכבים חסר
        if (!planet1Data || !planet2Data) return null

        const pos1 = getPlanetPosition(planet1Data.longitude, PLANET_ORBIT_RADIUS)
        const pos2 = getPlanetPosition(planet2Data.longitude, PLANET_ORBIT_RADIUS)

        // צבע לפי סוג האספקט — fallback לאפור אם הסוג לא מוכר
        const aspectInfo = ASPECT_TYPES[aspect.type as AspectTypeKey]
        const color = aspectInfo?.color ?? '#888888'

        // אטימות מחושבת לפי עוצמה — ככל שהאספקט חזק יותר, הקו כהה יותר
        const opacity = 0.3 + aspect.strength * 0.5

        return (
          <line
            key={`aspect-${idx}`}
            x1={pos1.x}
            y1={pos1.y}
            x2={pos2.x}
            y2={pos2.y}
            stroke={color}
            strokeWidth="1"
            opacity={opacity}
          />
        )
      })}
    </g>
  )
}
