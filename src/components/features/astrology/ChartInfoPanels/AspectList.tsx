'use client'

/**
 * AspectList — רשימת אספקטים אסטרולוגיים
 * מציגה את האספקטים בין כוכבי הלכת עם סוג, סטיה ועוצמה
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ASPECT_TYPES, PLANET_SYMBOLS, type AspectTypeKey, type PlanetKey } from '@/lib/constants/astrology'
import type { AspectResult } from '@/services/astrology/aspects'

/** Props של רכיב AspectList */
export interface AspectListProps {
  /** רשימת האספקטים לתצוגה */
  aspects: AspectResult[]
}

/**
 * מחזיר את השם העברי של כוכב לכת לפי מפתחו
 * @param name - שם הכוכב (אנגלית קטנות)
 */
function getPlanetName(name: string): string {
  const key = name.toLowerCase() as PlanetKey
  return PLANET_SYMBOLS[key]?.name ?? name
}

/**
 * ממיר עוצמת אספקט (0-1) לאחוזים לתצוגה
 * @param strength - עוצמת האספקט (0-1)
 */
function strengthToPercent(strength: number): number {
  return Math.round(strength * 100)
}

/**
 * רשימת אספקטים — טבלה עם צבעי badge לפי סוג האספקט ו-progress bar לעוצמה
 *
 * @param aspects - רשימת האספקטים
 */
export function AspectList({ aspects }: AspectListProps) {
  if (aspects.length === 0) {
    return (
      <Card className="bg-surface-container rounded-xl border border-outline-variant/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-headline text-secondary">אספקטים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface-variant/60 text-sm text-center py-4" dir="rtl">
            לא נמצאו אספקטים מרכזיים
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-surface-container rounded-xl border border-outline-variant/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-headline text-secondary">אספקטים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-outline-variant">
                <TableHead className="text-on-surface-variant font-label text-xs uppercase text-end">כוכב 1</TableHead>
                <TableHead className="text-on-surface-variant font-label text-xs uppercase text-end">אספקט</TableHead>
                <TableHead className="text-on-surface-variant font-label text-xs uppercase text-end">כוכב 2</TableHead>
                <TableHead className="text-on-surface-variant font-label text-xs uppercase text-end">סטיה</TableHead>
                <TableHead className="text-on-surface-variant font-label text-xs uppercase text-end">עוצמה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aspects.map((aspect, index) => {
                const aspectKey = aspect.type as AspectTypeKey
                const aspectInfo = ASPECT_TYPES[aspectKey]
                const pct = strengthToPercent(aspect.strength)

                return (
                  <TableRow key={`${aspect.planet1}-${aspect.planet2}-${index}`} className="border-outline-variant/20">
                    {/* כוכב 1 */}
                    <TableCell className="text-end font-body text-on-surface text-sm">
                      {getPlanetName(aspect.planet1)}
                    </TableCell>

                    {/* סוג אספקט — badge צבעוני */}
                    <TableCell className="text-end">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: aspectInfo?.color ?? '#888888',
                          color: aspectInfo?.color ?? '#888888',
                        }}
                        className="text-xs font-label"
                      >
                        {aspectInfo?.name ?? aspect.type}
                      </Badge>
                    </TableCell>

                    {/* כוכב 2 */}
                    <TableCell className="text-end font-body text-on-surface text-sm">
                      {getPlanetName(aspect.planet2)}
                    </TableCell>

                    {/* סטיה */}
                    <TableCell className="text-end font-body text-on-surface-variant text-sm">
                      {aspect.orb.toFixed(2)}°
                    </TableCell>

                    {/* עוצמה — progress bar */}
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: aspectInfo?.color ?? '#888888',
                            }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`עוצמה ${pct}%`}
                          />
                        </div>
                        <span className="text-on-surface-variant text-xs w-8">{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
