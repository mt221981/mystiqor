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
      <Card className="border-blue-500/20 bg-gray-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-300">אספקטים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm text-center py-4" dir="rtl">
            לא נמצאו אספקטים מרכזיים
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-500/20 bg-gray-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-300">אספקטים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400 text-end">כוכב 1</TableHead>
                <TableHead className="text-gray-400 text-end">אספקט</TableHead>
                <TableHead className="text-gray-400 text-end">כוכב 2</TableHead>
                <TableHead className="text-gray-400 text-end">סטיה</TableHead>
                <TableHead className="text-gray-400 text-end">עוצמה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aspects.map((aspect, index) => {
                const aspectKey = aspect.type as AspectTypeKey
                const aspectInfo = ASPECT_TYPES[aspectKey]
                const pct = strengthToPercent(aspect.strength)

                return (
                  <TableRow key={`${aspect.planet1}-${aspect.planet2}-${index}`} className="border-gray-800">
                    {/* כוכב 1 */}
                    <TableCell className="text-end text-gray-200 text-sm">
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
                        className="text-xs"
                      >
                        {aspectInfo?.name ?? aspect.type}
                      </Badge>
                    </TableCell>

                    {/* כוכב 2 */}
                    <TableCell className="text-end text-gray-200 text-sm">
                      {getPlanetName(aspect.planet2)}
                    </TableCell>

                    {/* סטיה */}
                    <TableCell className="text-end text-gray-400 text-sm">
                      {aspect.orb.toFixed(2)}°
                    </TableCell>

                    {/* עוצמה — progress bar */}
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
                        <span className="text-gray-400 text-xs w-8">{pct}%</span>
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
