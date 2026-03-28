'use client'

/**
 * AspectDictionary — מילון 7 האספקטים האסטרולוגיים
 * מציגה כרטיס לכל אספקט עם תג צבעוני, עוצמה ותיאור
 * חלק ממילון האסטרולוגיה — ASTRO-04
 */

// מייבא מ-astrology-data (גרסה עשירה עם ruler + description)
import { ASPECTS, type AspectInfo } from '@/lib/constants/astrology-data'
import { Badge } from '@/components/ui/badge'

/** Props של AspectDictionary — אין props חיצוניים, נתונים מגיעים מהקבועים */
export interface AspectDictionaryProps {
  /** className אופציונלי לעטיפה החיצונית */
  className?: string
}

/**
 * מילון האספקטים — 7 כרטיסים ברשימה אנכית
 * כל כרטיס מציג שם, עוצמה (progress bar), ותיאור
 *
 * @param className - className אופציונלי לעטיפה
 */
export function AspectDictionary({ className }: AspectDictionaryProps) {
  const aspects: AspectInfo[] = Object.values(ASPECTS)

  return (
    <div className={className}>
      <div className="space-y-3">
        {aspects.map((aspect) => (
          <div
            key={aspect.key}
            className="bg-surface-container rounded-xl border border-outline-variant/5 mystic-hover p-4"
          >
            {/* שורה עליונה — תג + משמעות + עוצמה */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* תג שם האספקט */}
                <Badge
                  variant="outline"
                  style={{ borderColor: aspect.color, color: aspect.color }}
                >
                  {aspect.name}
                </Badge>
                {/* משמעות */}
                <span className="text-xs text-on-surface-variant truncate">
                  {aspect.meaning}
                </span>
              </div>

              {/* עוצמה — progress bar + אחוז */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${aspect.strength * 100}%`,
                      backgroundColor: aspect.color,
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(aspect.strength * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`עוצמה ${Math.round(aspect.strength * 100)}%`}
                  />
                </div>
                <span className="text-xs text-on-surface-variant w-8 text-end">
                  {Math.round(aspect.strength * 100)}%
                </span>
              </div>
            </div>

            {/* תיאור */}
            <p className="text-sm text-on-surface font-body leading-relaxed">
              {aspect.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
