'use client'

/**
 * תרשים רדאר Big Five — חמשת ממדי האישיות OCEAN
 * מדוע: ויזואליזציה גרפית של פרופיל האישיות על ציר 0-100
 * Pattern: Recharts v3 — ללא Tooltip inline formatter (בעיית טיפוסים ידועה)
 */

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

import { DIMENSION_LABELS } from '@/lib/constants/big-five-questions'
import type { BigFiveScores } from '@/services/personality/scoring'

/** Props לתרשים רדאר Big Five */
export interface BigFiveRadarChartProps {
  /** ציוני חמשת הממדים — ערך 0-100 */
  scores: BigFiveScores
}

/** נקודת נתונים לתרשים Recharts */
interface RadarDataPoint {
  dimension: string
  score: number
}

/**
 * תרשים רדאר עם 5 צירים — ממד לכל ציר, ערך 0-100
 */
export function BigFiveRadarChart({ scores }: BigFiveRadarChartProps) {
  // המרת ציוני האישיות לפורמט נתונים של Recharts
  const data: RadarDataPoint[] = [
    { dimension: DIMENSION_LABELS.openness, score: scores.openness },
    { dimension: DIMENSION_LABELS.conscientiousness, score: scores.conscientiousness },
    { dimension: DIMENSION_LABELS.extraversion, score: scores.extraversion },
    { dimension: DIMENSION_LABELS.agreeableness, score: scores.agreeableness },
    { dimension: DIMENSION_LABELS.neuroticism, score: scores.neuroticism },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#a1a1aa', fontSize: 12 }}
        />
        <Radar
          name="ציון"
          dataKey="score"
          fill="#8b5cf6"
          fillOpacity={0.4}
          stroke="#8b5cf6"
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
