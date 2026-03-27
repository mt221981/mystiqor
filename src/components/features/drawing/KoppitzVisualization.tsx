'use client'

/**
 * KoppitzVisualization — תצוגה ויזואלית של תכונות Koppitz מניתוח ציור
 * מציג את רשימת התכונות עם תגיות נוכח/נעדר וציון Koppitz עם רמת סיכון
 *
 * מדוע: מרכיב ייעודי לתצוגת מדדי Koppitz (1968) בעברית עם RTL
 */

import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DrawingResponse } from '@/services/analysis/response-schemas/drawing'

// ===== ממשקי טיפוסים =====

/** Props לקומפוננטת KoppitzVisualization */
interface KoppitzVisualizationProps {
  /** רשימת תכונות שזוהו בציור */
  features: DrawingResponse['features']
  /** ציון Koppitz (0-30) — אופציונלי */
  koppitzScore?: number
}

// ===== פונקציות עזר =====

/**
 * מחזיר צבע ותווית רמת סיכון לפי ציון Koppitz
 * 0-10 = נורמלי (ירוק), 11-20 = בינוני (צהוב), 21-30 = גבוה (אדום)
 */
function getKoppitzRiskLevel(score: number): {
  label: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  colorClass: string
} {
  if (score <= 10) {
    return { label: 'נורמלי', badgeVariant: 'default', colorClass: 'text-tertiary' }
  } else if (score <= 20) {
    return { label: 'בינוני', badgeVariant: 'secondary', colorClass: 'text-primary' }
  } else {
    return { label: 'גבוה', badgeVariant: 'destructive', colorClass: 'text-error' }
  }
}

// ===== קומפוננטה ראשית =====

/**
 * תצוגת מדדי Koppitz — נוכח/נעדר עם משמעות פסיכולוגית
 * מוצג לאחר ניתוח ציור מוצלח
 */
export function KoppitzVisualization({ features, koppitzScore }: KoppitzVisualizationProps) {
  const presentCount = features.filter(f => f.present).length
  const riskInfo = koppitzScore !== undefined ? getKoppitzRiskLevel(koppitzScore) : null

  return (
    <Card className="border-outline-variant/5 bg-surface-container" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-primary font-headline flex items-center justify-between">
          <span>מדדי קופיץ</span>
          {koppitzScore !== undefined && riskInfo && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold font-headline ${riskInfo.colorClass}`}>
                {koppitzScore}/30
              </span>
              <Badge variant={riskInfo.badgeVariant} className="font-label">
                רמת סיכון: {riskInfo.label}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* סיכום נוכח/נעדר */}
        <div className="flex gap-4 text-sm text-on-surface-variant mb-2 font-label">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-tertiary" />
            נוכח: {presentCount}
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-error" />
            נעדר: {features.length - presentCount}
          </span>
        </div>

        {/* רשימת תכונות */}
        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-lg p-3 border ${
                feature.present
                  ? 'bg-tertiary/10 border-tertiary/20'
                  : 'bg-error/10 border-error/20'
              }`}
            >
              {/* תג נוכח/נעדר */}
              <div className="shrink-0 mt-0.5">
                {feature.present ? (
                  <CheckCircle className="h-5 w-5 text-tertiary" />
                ) : (
                  <XCircle className="h-5 w-5 text-error" />
                )}
              </div>

              {/* שם ומשמעות */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-on-surface text-sm font-label">{feature.name}</span>
                  <Badge
                    variant={feature.present ? 'default' : 'destructive'}
                    className="font-label text-xs"
                  >
                    {feature.present ? 'נוכח' : 'נעדר'}
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                  {feature.significance}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* הערת מחקר */}
        {features.length > 0 && (
          <p className="text-xs text-on-surface-variant/60 mt-2 text-center font-body">
            מבוסס על מחקר ד"ר אליזבת קופיץ (1968) — 30 מדדים רגשיים
          </p>
        )}
      </CardContent>
    </Card>
  )
}
