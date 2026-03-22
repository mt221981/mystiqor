'use client'

/**
 * שכבת הבתים האסטרולוגיים על מפת הגלגל
 * מציגה 12 קווי חלוקת בתים, מספרי בתים, קו העולה (זהב) וקו אמצע השמים (כסף)
 * נוסחת מיקום מבוססת על BirthChart.jsx מהמקור
 */

import {
  CHART_CENTER,
  OUTER_RADIUS,
  PLANET_RING_RADIUS,
  HOUSE_NUMBER_RADIUS,
  getPlanetPosition,
} from './utils'

/** Props של רכיב HouseOverlay */
export interface HouseOverlayProps {
  /** מעלת העולה (Ascendant) בטווח [0, 360) */
  ascendant: number
  /** מעלת אמצע השמים (Midheaven/MC) בטווח [0, 360) */
  midheaven: number
}

/**
 * מציגה את שכבת הבתים האסטרולוגיים על המפה
 * כולל: 12 קווי חלוקה, מספרי בתים, קו עולה (זהב), קו MC (כסף)
 *
 * @param ascendant - מעלת העולה
 * @param midheaven - מעלת אמצע השמים
 * @returns אלמנט SVG <g> עם שכבת הבתים
 */
export function HouseOverlay({ ascendant, midheaven }: HouseOverlayProps) {
  // חישוב קו העולה — מהמרכז לקצה החיצוני
  const ascPos = getPlanetPosition(ascendant, OUTER_RADIUS)

  // חישוב קו אמצע השמים — מהמרכז לקצה החיצוני
  const mcPos = getPlanetPosition(midheaven, OUTER_RADIUS)

  return (
    <g>
      {/* 12 קווי חלוקה בין הבתים — מ-r=160 ל-r=200 */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x1 = CHART_CENTER + PLANET_RING_RADIUS * Math.cos(angle)
        const y1 = CHART_CENTER + PLANET_RING_RADIUS * Math.sin(angle)
        // קווי הבתים מגיעים עד r=200 (ZODIAC_SEPARATOR_RADIUS)
        const x2 = CHART_CENTER + 200 * Math.cos(angle)
        const y2 = CHART_CENTER + 200 * Math.sin(angle)
        return (
          <line
            key={`house-line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#6366F1"
            strokeWidth="1"
            opacity="0.5"
          />
        )
      })}

      {/* מספרי הבתים 1-12 — ממוקמים ב-r=135 במרכז כל בית */}
      {Array.from({ length: 12 }, (_, i) => {
        const houseNumber = i + 1
        // מרכז הבית נמצא 15° אחרי קו תחילת הבית
        const angle = (i * 30 - 90 + 15) * (Math.PI / 180)
        const x = CHART_CENTER + HOUSE_NUMBER_RADIUS * Math.cos(angle)
        const y = CHART_CENTER + HOUSE_NUMBER_RADIUS * Math.sin(angle)
        return (
          <text
            key={`house-num-${houseNumber}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#A5B4FC"
            fontWeight="bold"
          >
            {houseNumber}
          </text>
        )
      })}

      {/* קו העולה (Ascendant) — קו זהב מהמרכז לקצה */}
      <line
        x1={CHART_CENTER}
        y1={CHART_CENTER}
        x2={ascPos.x}
        y2={ascPos.y}
        stroke="#FFD700"
        strokeWidth="2"
      />

      {/* קו אמצע השמים (MC) — קו כסף מהמרכז לקצה */}
      <line
        x1={CHART_CENTER}
        y1={CHART_CENTER}
        x2={mcPos.x}
        y2={mcPos.y}
        stroke="#C0C0C0"
        strokeWidth="2"
      />
    </g>
  )
}
