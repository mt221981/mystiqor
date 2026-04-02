'use client'

/**
 * QuickStats — תצוגת מדדים עיקריים של כתב יד
 * רשת כרטיסי מדדים עם progress bars
 */

import { Progress } from '@/components/ui/progress'

/** מדד גרפולוגי יחיד */
interface GraphologyMetric {
  readonly label: string   // Hebrew
  readonly value: number   // 0-100
  readonly unit?: string   // optional, e.g. "°" for slant
}

/** Props לתצוגת מדדים מהירה */
interface QuickStatsProps {
  readonly metrics: GraphologyMetric[]
}

/**
 * תצוגת מדדים עיקריים של כתב יד — רשת כרטיסים עם progress bars
 * @param metrics - מערך מדדים עם תווית, ערך ויחידה אופציונלית
 */
export function QuickStats({ metrics }: QuickStatsProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-6 text-on-surface-variant text-sm" dir="rtl">
        אין מדדים להצגה
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" dir="rtl">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-surface-container rounded-xl p-4 border border-outline-variant/10 space-y-2"
        >
          <p className="text-xs font-label font-medium text-on-surface-variant truncate">
            {metric.label}
          </p>
          <p className="text-2xl font-bold font-headline text-primary">
            {metric.value}
            {metric.unit && (
              <span className="text-sm font-normal text-on-surface-variant ms-0.5">
                {metric.unit}
              </span>
            )}
          </p>
          <Progress
            value={metric.value}
            className="h-1.5 bg-surface-container-high"
          />
        </div>
      ))}
    </div>
  )
}
