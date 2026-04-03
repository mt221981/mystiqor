'use client'

/**
 * ZodiacGrid — רשת 12 המזלות האסטרולוגיים
 * מציגה כרטיס לכל מזל עם אמוג'י, שם, אלמנט, כוכב שולט ותיאור
 * חלק ממילון האסטרולוגיה — ASTRO-01
 */

// מייבא מ-astrology-data (גרסה עשירה עם ruler + description)
import { ZODIAC_SIGNS, type ZodiacSign } from '@/lib/constants/astrology-data'
import { Badge } from '@/components/ui/badge'

/** Props של ZodiacGrid — אין props חיצוניים, נתונים מגיעים מהקבועים */
export interface ZodiacGridProps {
  /** className אופציונלי לעטיפה החיצונית */
  className?: string
}

/**
 * רשת המזלות — 12 כרטיסים בפריסה רספונסיבית
 * 2 עמודות בנייד, 3 בטאבלט, 4 בדסקטופ
 *
 * @param className - className אופציונלי לעטיפה
 */
export function ZodiacGrid({ className }: ZodiacGridProps) {
  const signs: ZodiacSign[] = Object.values(ZODIAC_SIGNS)

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {signs.map((sign) => (
          <div
            key={sign.key}
            className="bg-surface-container rounded-xl border border-outline-variant/5 mystic-hover p-4 space-y-2"
          >
            {/* שורה עליונה — אמוג'י + שם */}
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                {sign.emoji}
              </span>
              <span className="font-headline font-semibold text-on-surface">
                {sign.name}
              </span>
            </div>

            {/* אלמנט */}
            <p className="text-xs text-on-surface-variant font-label">
              {sign.element}
            </p>

            {/* תג כוכב שולט */}
            <Badge
              variant="outline"
              style={{ borderColor: sign.color, color: sign.color }}
            >
              {`שולט: ${sign.ruler}`}
            </Badge>

            {/* תיאור */}
            <p className="text-xs text-on-surface-variant font-body line-clamp-3">
              {sign.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
