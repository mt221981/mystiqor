'use client'

/**
 * Comparison — השוואה גרפולוגית עם RadarChart (Recharts)
 * משווה מדדי כתב יד של המשתמש מול ממוצע
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'

/** נקודת נתונים לתרשים ההשוואה */
interface ComparisonDataPoint {
  readonly metric: string   // Hebrew metric label
  readonly current: number  // 0-100
  readonly average: number  // 0-100 benchmark
}

/** Props לקומפוננטת ההשוואה הגרפולוגית */
interface ComparisonProps {
  readonly data: ComparisonDataPoint[]
  readonly title?: string
}

/**
 * רנדור תרשים רדאר להשוואה גרפולוגית — ציון משתמש מול ממוצע
 * @param data - מערך נקודות נתונים עם מדד, ציון נוכחי וציון ממוצע
 * @param title - כותרת התרשים (ברירת מחדל: 'השוואה גרפולוגית')
 */
export function Comparison({ data, title = 'השוואה גרפולוגית' }: ComparisonProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant text-sm" dir="rtl">
        אין נתונים להשוואה
      </div>
    )
  }

  return (
    <div className="space-y-2" dir="rtl">
      {title && (
        <h3 className="text-sm font-semibold text-primary font-headline">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#ccc3d8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4455', borderRadius: '8px', direction: 'rtl' }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs" dir="rtl">
                {value === 'current' ? 'שלך' : 'ממוצע'}
              </span>
            )}
          />
          <Radar
            name="current"
            dataKey="current"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Radar
            name="average"
            dataKey="average"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
