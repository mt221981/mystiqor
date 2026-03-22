'use client'

/**
 * כרטיס תאימות נומרולוגית — מציג ציון כולל + פירוט לפי מימדים + תיאור עברי
 * מדוע: לפי D-12 — ממשק ויזואלי לתוצאות תאימות בין שני אנשים
 */

import { Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { CompatibilityResult } from '@/types/numerology'

/** Props של כרטיס תאימות נומרולוגית */
export interface CompatibilityCardProps {
  /** תוצאת התאימות מה-API */
  result: CompatibilityResult
  /** האם בטעינה — מציג skeleton */
  isLoading?: boolean
}

/**
 * מחזיר צבע לפי ציון תאימות
 * >= 80 ירוק, >= 60 צהוב, < 60 אדום
 *
 * @param score - ציון 0-100
 * @returns מחרוזת CSS classNames
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * מחזיר צבע Progress bar לפי ציון תאימות
 *
 * @param score - ציון 0-100
 * @returns className לצבע ה-indicator
 */
function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

/** מימדי התאימות עם תוויות עבריות */
const DIMENSION_LABELS: Array<{ key: 'life_path' | 'destiny' | 'soul'; label: string }> = [
  { key: 'life_path', label: 'נתיב חיים' },
  { key: 'destiny', label: 'גורל' },
  { key: 'soul', label: 'נשמה' },
]

/**
 * מציג את תוצאות התאימות הנומרולוגית בצורה ויזואלית
 * כולל: ציון כולל עם לב, פירוט לפי מימדים, תיאור טקסטואלי
 */
export function CompatibilityCard({ result, isLoading = false }: CompatibilityCardProps) {
  if (isLoading) {
    return (
      <Card className="border-pink-500/20 bg-gray-900/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  const overallScore = result.scores.overall

  return (
    <Card className="border-pink-500/20 bg-gray-900/50" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-pink-300 flex items-center gap-2">
          <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
          תאימות נומרולוגית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* שמות שני האנשים */}
        <div className="text-center text-sm text-gray-400">
          <span className="text-white font-medium">{result.person1}</span>
          <span className="mx-2 text-pink-400">❤</span>
          <span className="text-white font-medium">{result.person2}</span>
        </div>

        {/* ציון כולל — מוצג כאחוז גדול עם לב */}
        <div className="flex flex-col items-center gap-2 py-4">
          <Heart
            className={`h-10 w-10 ${overallScore >= 80 ? 'fill-green-400 text-green-400' : overallScore >= 60 ? 'fill-yellow-400 text-yellow-400' : 'fill-red-400 text-red-400'}`}
          />
          <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <div className="text-sm text-gray-400">ציון כולל</div>
        </div>

        {/* פירוט לפי מימדים */}
        <div className="space-y-3">
          {DIMENSION_LABELS.map(({ key, label }) => {
            const score = result.scores[key]
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${getProgressColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* תיאור טקסטואלי */}
        {result.analysis && (
          <div className="rounded-lg bg-pink-500/5 border border-pink-500/20 p-3">
            <p className="text-sm text-gray-300 leading-relaxed">{result.analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
