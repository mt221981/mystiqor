'use client'

/**
 * תרשים רדאר גרפולוגי — 9 מרכיבי כתב היד עם ציונים וtoolstips
 * מדוע: ויזואליזציה גרפית של 9 מרכיבי הגרפולוגיה על ציר 0-10
 * Pattern: Recharts v3 RadarChart עם dynamic import (SSR-incompatible)
 */

import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import type { GraphologyResponse } from '@/services/analysis/response-schemas/graphology'

/** Props לתרשים גרפולוגי */
export interface GraphologyQuickStatsProps {
  /** מרכיבי הניתוח הגרפולוגי עם שמות, ציונים ותיאורים */
  components: GraphologyResponse['components']
}

/** נקודת נתונים לתרשים Recharts */
interface RadarDataPoint {
  subject: string
  score: number
  fullMark: number
}

/** פורמט ציון לתצוגה */
function scoreColor(score: number): string {
  if (score >= 8) return 'bg-primary-container text-on-primary-container'
  if (score >= 5) return 'bg-primary-container/20 text-primary'
  return 'bg-surface-container-high text-on-surface-variant'
}

// טעינה דינמית — Recharts אינו תואם SSR
const RadarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadarChart),
  { ssr: false }
)
const Radar = dynamic(
  () => import('recharts').then((mod) => mod.Radar),
  { ssr: false }
)
const PolarGrid = dynamic(
  () => import('recharts').then((mod) => mod.PolarGrid),
  { ssr: false }
)
const PolarAngleAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarAngleAxis),
  { ssr: false }
)
const PolarRadiusAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarRadiusAxis),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

/**
 * תרשים רדאר עם 9 מרכיבי גרפולוגיה וכרטיסי מרכיבים עם tooltips
 */
export function GraphologyQuickStats({ components }: GraphologyQuickStatsProps) {
  // המרת מרכיבי הגרפולוגיה לפורמט נתונים של Recharts
  const data: RadarDataPoint[] = components.map((c) => ({
    subject: c.name,
    score: c.score_1_to_10,
    fullMark: 10,
  }))

  return (
    <div className="space-y-6" dir="rtl">
      {/* תרשים רדאר */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
            <PolarGrid stroke="#4a4455" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#ccc3d8', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: '#958da1', fontSize: 10 }}
            />
            <Radar
              name="ציון"
              dataKey="score"
              fill="#ddb8ff"
              fillOpacity={0.25}
              stroke="#ddb8ff"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* כרטיסי מרכיבים עם tooltip בתיאור */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {components.map((component) => (
          <div
            key={component.name}
            title={component.description}
            className="bg-surface-container rounded-xl p-4 border border-outline-variant/5 hover:border-primary/20 transition-colors cursor-help"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-on-surface">{component.name}</span>
              <Badge
                className={`font-label text-xs px-2 py-0.5 ${scoreColor(component.score_1_to_10)}`}
              >
                {component.score_1_to_10}/10
              </Badge>
            </div>
            <p className="text-xs text-on-surface-variant line-clamp-2 font-body">
              {component.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
