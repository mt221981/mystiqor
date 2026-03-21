/**
 * NumberCard — כרטיס להצגת מספר נומרולוגי בודד עם שם, ערך וצבע
 * מדוע: רכיב מוחשי ומובלט להצגת כל אחד מ-5 מספרי הנומרולוגיה
 */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Props של כרטיס מספר נומרולוגי */
export interface NumberCardProps {
  /** תווית עברית, למשל "נתיב חיים" */
  readonly label: string
  /** ערך המספר הנומרולוגי */
  readonly value: number
  /** תיאור קצר (אופציונלי) */
  readonly description?: string
  /** מחלקת Tailwind לרקע — ברירת מחדל bg-purple-50 */
  readonly color?: string
}

/**
 * כרטיס מספר נומרולוגי בודד
 * מציג: ערך מספרי גדול, תווית עברית, תיאור אופציונלי
 */
export function NumberCard({
  label,
  value,
  description,
  color = 'bg-purple-50/10',
}: NumberCardProps) {
  return (
    <Card
      className={cn(
        'text-center border border-purple-500/20 hover:border-purple-400/40 transition-all',
        color
      )}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <CardContent className="pt-6 pb-4 px-3 flex flex-col items-center gap-2">
        {/* מספר גדול במרכז */}
        <span
          className="text-5xl font-bold text-purple-300 leading-none"
          aria-hidden="true"
        >
          {value}
        </span>

        {/* תווית עברית */}
        <span className="text-sm font-semibold text-gray-200 mt-1">
          {label}
        </span>

        {/* תיאור אופציונלי */}
        {description && (
          <p className="text-xs text-gray-400 leading-relaxed mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
