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
  /** מחלקת Tailwind לרקע — ברירת מחדל bg-surface-container */
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
  color = 'bg-surface-container',
}: NumberCardProps) {
  return (
    <Card
      className={cn(
        'text-center border border-outline-variant/10 hover:border-primary/40 transition-all',
        color
      )}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <CardContent className="pt-6 pb-4 px-3 flex flex-col items-center gap-2">
        {/* מספר גדול במרכז */}
        <span
          className="text-5xl font-headline font-black text-primary leading-none"
          aria-hidden="true"
        >
          {value}
        </span>

        {/* תווית עברית */}
        <span className="text-sm font-headline font-semibold text-on-surface mt-1">
          {label}
        </span>

        {/* תיאור אופציונלי */}
        {description && (
          <p className="text-xs font-body text-on-surface-variant mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
