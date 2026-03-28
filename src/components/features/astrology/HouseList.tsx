'use client'

/**
 * HouseList — רשימת 12 הבתים האסטרולוגיים
 * מציגה כל בית באקורדיון עם שם ותיאור מורחב
 * חלק ממילון האסטרולוגיה — ASTRO-03
 */

// מייבא מ-astrology-data (גרסה עשירה עם ruler + description)
import { HOUSES } from '@/lib/constants/astrology-data'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

/** Props של HouseList — אין props חיצוניים, נתונים מגיעים מהקבועים */
export interface HouseListProps {
  /** className אופציונלי לעטיפה החיצונית */
  className?: string
}

/**
 * רשימת הבתים — 12 פריטי אקורדיון, בית אחד פתוח בכל פעם
 * כותרת תמיד גלויה, תיאור מתרחב בלחיצה
 *
 * @param className - className אופציונלי לעטיפה
 */
export function HouseList({ className }: HouseListProps) {
  return (
    <div dir="rtl" className={className}>
      <Accordion multiple={false} className="space-y-1">
        {HOUSES.map((house) => (
          <AccordionItem key={house.number} value={house.number}>
            <AccordionTrigger className="font-body font-semibold text-on-surface">
              {`בית ${house.number} - ${house.name}`}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-on-surface-variant font-label mb-2">
                {house.meaning}
              </p>
              <p className="text-sm text-on-surface font-body leading-relaxed">
                {house.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
