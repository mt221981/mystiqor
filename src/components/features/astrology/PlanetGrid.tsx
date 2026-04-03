'use client'

/**
 * PlanetGrid — רשת 10 כוכבי הלכת
 * מציגה כרטיס לכל כוכב עם סמל צבעוני, שם, משמעות ותיאור
 * חלק ממילון האסטרולוגיה — ASTRO-02
 */

// מייבא מ-astrology-data (גרסה עשירה עם ruler + description)
import { PLANETS, type PlanetInfo } from '@/lib/constants/astrology-data'

/** Props של PlanetGrid — אין props חיצוניים, נתונים מגיעים מהקבועים */
export interface PlanetGridProps {
  /** className אופציונלי לעטיפה החיצונית */
  className?: string
}

/**
 * רשת כוכבי הלכת — 10 כרטיסים בפריסה רספונסיבית
 * 2 עמודות בנייד, 3 בטאבלט, 4 בדסקטופ
 *
 * @param className - className אופציונלי לעטיפה
 */
export function PlanetGrid({ className }: PlanetGridProps) {
  const planets: PlanetInfo[] = Object.values(PLANETS)

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {planets.map((planet) => (
          <div
            key={planet.key}
            className="bg-surface-container rounded-xl border border-outline-variant/5 mystic-hover p-4 space-y-2"
          >
            {/* שורה עליונה — סמל צבעוני + שם */}
            <div className="flex items-center gap-2">
              <span
                className="text-2xl"
                style={{ color: planet.color }}
                aria-hidden="true"
              >
                {planet.symbol}
              </span>
              <span className="font-headline font-semibold text-on-surface">
                {planet.name}
              </span>
            </div>

            {/* משמעות */}
            <p className="text-xs text-on-surface-variant font-label">
              {planet.meaning}
            </p>

            {/* תיאור */}
            <p className="text-sm text-on-surface-variant font-body">
              {planet.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
