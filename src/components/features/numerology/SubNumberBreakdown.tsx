'use client'

/**
 * פירוק מספר משנה — מציג את שלבי הצמצום הנומרולוגי עם תווית עברית
 * מדוע: לפי D-13 — המשתמש צריך לראות איך כל מספר מחושב (למשל 29 -> 11 מאסטר)
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/** מספרי מאסטר שאינם נצמצמים עוד */
const MASTER_NUMBERS = new Set([11, 22, 33])

/**
 * מחשב את שלבי הצמצום הנומרולוגי
 *
 * שיטה: בונה מערך של כל הערכים הביניים מהמספר המקורי ועד לתוצאה הסופית.
 * עוצר מוקדם כשמגיע למספר מאסטר.
 *
 * @param num - המספר לצמצום
 * @returns מערך שלבים [מקור, ..., סופי]
 */
function getReductionSteps(num: number): number[] {
  const steps = [num]
  let current = num
  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = String(current)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0)
    steps.push(current)
    if (MASTER_NUMBERS.has(current)) break
  }
  return steps
}

/** Props של קומפוננטת פירוק המספר */
export interface SubNumberBreakdownProps {
  /** תווית עברית של המספר (למשל "נתיב חיים") */
  label: string
  /** הערך הגולמי לפני הצמצום */
  rawValue: number
  /** הערך הסופי לאחר הצמצום */
  finalValue: number
}

/**
 * מציג את שלבי הצמצום הנומרולוגי לכל מספר
 * דוגמה: "נתיב חיים: 29 → 11 (מאסטר)" או "גורל: 15 → 6"
 */
export function SubNumberBreakdown({ label, rawValue, finalValue }: SubNumberBreakdownProps) {
  const steps = getReductionSteps(rawValue)
  const isMaster = MASTER_NUMBERS.has(finalValue)

  // אם יש רק שלב אחד — אין צורך להציג פירוק
  if (steps.length <= 1 && !isMaster) {
    return null
  }

  return (
    <Card className="border-outline-variant/10 bg-surface-container-low mt-1">
      <CardContent className="py-2 px-3">
        <div className="flex items-center gap-2 flex-wrap" dir="rtl">
          {/* תווית המספר */}
          <span className="text-xs font-label text-on-surface-variant font-medium shrink-0">{label}:</span>

          {/* שלבי הצמצום */}
          {steps.map((step, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <span className="text-on-surface-variant/60 text-xs">←</span>
              )}
              <Badge
                variant="outline"
                className={
                  MASTER_NUMBERS.has(step)
                    ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/10 text-xs px-1.5 py-0'
                    : 'border-primary/30 text-primary bg-primary/5 text-xs px-1.5 py-0'
                }
              >
                {step}
              </Badge>
            </span>
          ))}

          {/* תווית מאסטר */}
          {isMaster && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs px-1.5 py-0">
              מאסטר
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
