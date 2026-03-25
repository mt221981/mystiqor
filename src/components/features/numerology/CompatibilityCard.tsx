'use client'

/**
 * כרטיס תאימות נומרולוגית — מציג ציון כולל + פירוט לפי מימדים + תיאור עברי
 * מדוע: לפי D-12 — ממשק ויזואלי לתוצאות תאימות בין שני אנשים
 */

import { Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MysticSkeleton } from '@/components/ui/mystic-skeleton'
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
      <Card className="border-primary/20 bg-gradient-to-br from-primary-container/20 to-secondary-container/20 rounded-xl">
        <CardHeader>
          <MysticSkeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <MysticSkeleton className="h-24 w-full" />
          <MysticSkeleton className="h-4 w-full" />
          <MysticSkeleton className="h-4 w-full" />
          <MysticSkeleton className="h-4 w-full" />
          <MysticSkeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  const overallScore = result.scores.overall

  return (
    <Card className="bg-gradient-to-br from-primary-container/20 to-secondary-container/20 rounded-xl border border-outline-variant/10" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-primary flex items-center gap-2">
          <Heart className="h-4 w-4 fill-primary text-primary" />
          תאימות נומרולוגית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* שמות שני האנשים */}
        <div className="text-center text-sm text-on-surface-variant">
          <span className="text-on-surface font-medium">{result.person1}</span>
          <span className="mx-2 text-primary">❤</span>
          <span className="text-on-surface font-medium">{result.person2}</span>
        </div>

        {/* ציון כולל — מוצג כאחוז גדול עם לב */}
        <div className="flex flex-col items-center gap-2 py-4">
          <Heart
            className={`h-10 w-10 ${overallScore >= 80 ? 'fill-tertiary text-tertiary' : overallScore >= 60 ? 'fill-yellow-400 text-yellow-400' : 'fill-error text-error'}`}
          />
          <div className={`text-4xl font-headline font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <div className="text-sm font-label text-on-surface-variant">ציון כולל</div>
        </div>

        {/* פירוט לפי מימדים */}
        <div className="space-y-3">
          {DIMENSION_LABELS.map(({ key, label }) => {
            const score = result.scores[key]
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-label text-on-surface-variant">{label}</span>
                  <span className={`font-label font-medium ${getScoreColor(score)}`}>{score}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
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
          <div className="rounded-lg bg-primary/5 border border-outline-variant/20 p-3">
            <p className="text-sm font-body text-on-surface-variant leading-relaxed">{result.analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
