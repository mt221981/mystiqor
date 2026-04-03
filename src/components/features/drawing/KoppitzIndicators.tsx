'use client'

/**
 * KoppitzIndicators — רשימת מדדי קופיץ לניתוח ציורי ילדים
 * 30+ מדדים רגשיים/התפתחותיים מוצגים בסינון "נוכח בלבד"
 */

import { Badge } from '@/components/ui/badge'

/** מדד קופיץ יחיד */
interface KoppitzIndicatorItem {
  readonly name: string
  readonly present: boolean
  readonly severity: 'low' | 'medium' | 'high'
  readonly description: string
}

/** Props לרשימת מדדי קופיץ */
interface KoppitzIndicatorsProps {
  readonly indicators: KoppitzIndicatorItem[]
}

/** מיפוי חומרה לצבע Badge */
const SEVERITY_STYLES: Record<KoppitzIndicatorItem['severity'], string> = {
  low: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  medium: 'bg-primary-container/20 text-primary border-primary/20',
  high: 'bg-error/10 text-error border-error/20',
}

/** תווית חומרה בעברית */
const SEVERITY_LABELS: Record<KoppitzIndicatorItem['severity'], string> = {
  low: 'נמוך',
  medium: 'בינוני',
  high: 'גבוה',
}

/**
 * מציג רשימת מדדי קופיץ שנמצאו בציור
 * מסנן רק present === true — מדדים שאינם נוכחים לא מוצגים
 * @param indicators - מערך מלא של מדדי קופיץ
 */
export function KoppitzIndicators({ indicators }: KoppitzIndicatorsProps) {
  const presentIndicators = indicators.filter(i => i.present)

  if (presentIndicators.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant" dir="rtl">
        <p className="text-sm font-body">לא זוהו מדדים</p>
        <p className="text-xs mt-1 opacity-70">מבוסס על 30+ מדדי קופיץ (1968)</p>
      </div>
    )
  }

  return (
    <div className="space-y-3" dir="rtl">
      {/* כותרת עם ספירה */}
      <p className="text-sm font-label font-medium text-on-surface-variant">
        נמצאו{' '}
        <span className="text-primary font-bold">{presentIndicators.length}</span>
        {' '}מדדים מתוך 30+
      </p>

      {/* רשימת מדדים נוכחים */}
      <div className="space-y-2">
        {presentIndicators.map((indicator, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-lg p-3 border ${SEVERITY_STYLES[indicator.severity]}`}
          >
            {/* שם המדד + תגית חומרה */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-label font-medium text-sm">{indicator.name}</span>
                <Badge className={`font-label text-xs ${SEVERITY_STYLES[indicator.severity]}`}>
                  {SEVERITY_LABELS[indicator.severity]}
                </Badge>
              </div>
              <p className="text-xs font-body opacity-80">
                {indicator.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* הערת מחקר */}
      <p className="text-xs text-on-surface-variant/60 text-center font-body mt-2">
        מבוסס על מחקר ד&quot;ר אליזבת קופיץ (1968) — 30 מדדים רגשיים
      </p>
    </div>
  )
}
