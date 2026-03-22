'use client'

/**
 * רינג המזלות — טבעת חיצונית של מפת הגלגל האסטרולוגי
 * מציגה 12 מזלות עם אמוג'י, קווי הפרדה ומעגלים מחדשים
 * נוסחת מיקום מבוססת על BirthChart.jsx מהמקור
 */

import { ZODIAC_SIGNS, ZODIAC_SIGN_KEYS } from '@/lib/constants/astrology'
import {
  CHART_CENTER,
  OUTER_RADIUS,
  ZODIAC_RADIUS,
  ZODIAC_SEPARATOR_RADIUS,
  getAngleForSign,
} from './utils'

/** Props של רכיב ZodiacRing — אין props נדרשים (המזלות הם סטטיים) */
export interface ZodiacRingProps {}

/**
 * מציגה את טבעת המזלות החיצונית של מפת הגלגל
 * כולל: מעגל חיצוני, מעגל הפרדה מקווקו, 12 אמוג'י, קווי הפרדה בין מזלות
 *
 * @returns אלמנט SVG <g> עם טבעת המזלות
 */
export function ZodiacRing(_props: ZodiacRingProps) {
  return (
    <g>
      {/* מעגל חיצוני */}
      <circle
        cx={CHART_CENTER}
        cy={CHART_CENTER}
        r={OUTER_RADIUS}
        stroke="#6366F1"
        strokeWidth="2"
        fill="none"
      />

      {/* מעגל הפרדה מקווקו — גבול אזור המזלות */}
      <circle
        cx={CHART_CENTER}
        cy={CHART_CENTER}
        r={ZODIAC_SEPARATOR_RADIUS}
        stroke="#6366F1"
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.3"
      />

      {/* קווי הפרדה בין 12 המזלות — מ-r=200 ל-r=240 */}
      {ZODIAC_SIGN_KEYS.map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x1 = CHART_CENTER + ZODIAC_SEPARATOR_RADIUS * Math.cos(angle)
        const y1 = CHART_CENTER + ZODIAC_SEPARATOR_RADIUS * Math.sin(angle)
        const x2 = CHART_CENTER + OUTER_RADIUS * Math.cos(angle)
        const y2 = CHART_CENTER + OUTER_RADIUS * Math.sin(angle)
        return (
          <line
            key={`sep-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#6366F1"
            strokeWidth="1"
            opacity="0.3"
          />
        )
      })}

      {/* אמוג'י של 12 המזלות במיקום r=220 */}
      {ZODIAC_SIGN_KEYS.map((signKey, i) => {
        const angle = getAngleForSign(i)
        const x = CHART_CENTER + ZODIAC_RADIUS * Math.cos(angle)
        const y = CHART_CENTER + ZODIAC_RADIUS * Math.sin(angle)
        const signData = ZODIAC_SIGNS[signKey]
        return (
          <text
            key={signKey}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fill={signData.color}
            className="pointer-events-none"
          >
            {signData.emoji}
          </text>
        )
      })}
    </g>
  )
}
