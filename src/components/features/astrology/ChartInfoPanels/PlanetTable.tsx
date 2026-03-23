'use client'

/**
 * PlanetTable — טבלת מיקומי כוכבי הלכת
 * מציגה את 10 כוכבי הלכת עם מזל, מעלה ובית
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
import {
  PLANET_SYMBOLS,
  ZODIAC_SIGNS,
  type PlanetKey,
  type ZodiacSignKey,
} from '@/lib/constants/astrology'

/** מידע על כוכב לכת אחד בטבלה */
export interface PlanetTableRow {
  /** שם הכוכב (sun, moon, mercury וכו') */
  name: string
  /** שם המזל באנגלית */
  sign: string
  /** מעלה בתוך המזל (0-30) */
  degree_in_sign: number
  /** מספר הבית (1-12) */
  house: number
}

/** Props של רכיב PlanetTable */
export interface PlanetTableProps {
  /** רשימת כוכבי הלכת עם נתוניהם */
  planets: PlanetTableRow[]
}

/**
 * טבלת כוכבי הלכת — מציגה כל כוכב עם סמל, שם עברי, מזל, מעלה ובית
 *
 * @param planets - רשימת כוכבי הלכת
 */
export function PlanetTable({ planets }: PlanetTableProps) {
  return (
    <Card className="border-indigo-500/20 bg-gray-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-indigo-300">טבלת כוכבים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400 text-end">כוכב</TableHead>
                <TableHead className="text-gray-400 text-end">מזל</TableHead>
                <TableHead className="text-gray-400 text-end">מעלה</TableHead>
                <TableHead className="text-gray-400 text-end">בית</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planets.map((planet) => {
                const planetKey = planet.name.toLowerCase() as PlanetKey
                const planetInfo = PLANET_SYMBOLS[planetKey]
                const signKey = planet.sign as ZodiacSignKey
                const signInfo = ZODIAC_SIGNS[signKey]

                return (
                  <TableRow key={planet.name} className="border-gray-800">
                    {/* עמודת כוכב — סמל + שם עברי */}
                    <TableCell className="text-end">
                      <span className="flex items-center justify-end gap-1.5">
                        {planetInfo && (
                          <span
                            style={{ color: planetInfo.color }}
                            aria-hidden="true"
                          >
                            {planetInfo.symbol}
                          </span>
                        )}
                        <span className="text-gray-200 text-sm">
                          {planetInfo?.name ?? planet.name}
                        </span>
                      </span>
                    </TableCell>

                    {/* עמודת מזל — אמוג'י + שם עברי */}
                    <TableCell className="text-end">
                      <span className="flex items-center justify-end gap-1">
                        {signInfo && (
                          <span aria-hidden="true">{signInfo.emoji}</span>
                        )}
                        <span className="text-gray-300 text-sm">
                          {signInfo?.name ?? planet.sign}
                        </span>
                      </span>
                    </TableCell>

                    {/* עמודת מעלה */}
                    <TableCell className="text-end text-gray-300 text-sm">
                      {planet.degree_in_sign.toFixed(1)}°
                    </TableCell>

                    {/* עמודת בית */}
                    <TableCell className="text-end text-gray-300 text-sm">
                      {planet.house}
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
