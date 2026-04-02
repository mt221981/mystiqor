'use client'

/**
 * MetricsBreakdown — פירוט מדדים כמותיים של הציור
 * רשת שורות עם progress bars ו-benchmark אופציונלי
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

/** מדד כמותי יחיד */
interface DrawingMetric {
  readonly label: string
  readonly value: number   // 0-100
  readonly benchmark?: number
  readonly description?: string
}

/** Props לפירוט מדדים כמותיים */
interface MetricsBreakdownProps {
  readonly metrics: DrawingMetric[]
  readonly title?: string
}

/**
 * מציג פירוט מדדים כמותיים של הציור עם progress bars
 * @param metrics - רשימת מדדים עם ערך (0-100) ו-benchmark אופציונלי
 * @param title - כותרת הרכיב (ברירת מחדל: 'מדדים כמותיים')
 */
export function MetricsBreakdown({ metrics, title = 'מדדים כמותיים' }: MetricsBreakdownProps) {
  if (metrics.length === 0) {
    return null
  }

  return (
    <Card className="border-outline-variant/5 bg-surface-container" dir="rtl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-primary font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="space-y-1.5">
            {/* שורת כותרת + ערך */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-label font-medium text-on-surface">{metric.label}</span>
              <span className="text-sm font-bold text-primary font-headline">{metric.value}%</span>
            </div>

            {/* progress bar עם benchmark */}
            <div className="relative">
              <Progress
                value={metric.value}
                className="h-2 bg-surface-container-high"
              />
              {/* סמן benchmark */}
              {metric.benchmark !== undefined && (
                <div
                  className="absolute top-0 h-2 w-0.5 bg-secondary/70 rounded-full"
                  style={{ left: `${metric.benchmark}%`, transform: 'translateX(-50%)' }}
                  title={`ממוצע: ${metric.benchmark}%`}
                />
              )}
            </div>

            {/* תיאור אופציונלי */}
            {metric.description && (
              <p className="text-xs text-on-surface-variant/70 font-body">
                {metric.description}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
