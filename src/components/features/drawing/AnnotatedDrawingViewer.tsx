'use client'

/**
 * AnnotatedDrawingViewer — מציג את תמונת הציור עם לוח תכונות ממוצב בצד
 * תמונת הציור המועלה לצד פאנל רשימת התכונות והסיכום הכללי
 *
 * מדוע: מרכיב ייעודי להצגת הציור המועלה יחד עם ממצאי הניתוח בעברית עם RTL
 */

import Image from 'next/image'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DrawingResponse } from '@/services/analysis/response-schemas/drawing'

// ===== ממשקי טיפוסים =====

/** Props לקומפוננטת AnnotatedDrawingViewer */
interface AnnotatedDrawingViewerProps {
  /** URL של תמונת הציור המועלה */
  imageUrl: string
  /** תכונות שזוהו בציור */
  features: DrawingResponse['features']
  /** סיכום כללי של הניתוח */
  summary: string
}

// ===== קומפוננטה ראשית =====

/**
 * מציג את תמונת הציור מימין ופאנל ממצאים משמאל (RTL)
 * בנייד מציג בפריסת עמודה בודדת
 */
export function AnnotatedDrawingViewer({ imageUrl, features, summary }: AnnotatedDrawingViewerProps) {
  const presentFeatures = features.filter(f => f.present)
  const absentFeatures = features.filter(f => !f.present)

  return (
    <Card className="border-outline-variant/5 bg-surface-container" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-primary font-headline">הציור שלך — ממצאים ויזואליים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* תמונת הציור */}
          <div className="lg:w-1/2 shrink-0">
            <div className="relative w-full rounded-lg overflow-hidden bg-surface-container-highest border border-outline-variant/10">
              <Image
                src={imageUrl}
                alt="הציור שהועלה לניתוח"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                style={{ maxHeight: '400px' }}
                unoptimized
              />
            </div>

            {/* סיכום כללי מתחת לתמונה */}
            <div className="mt-3 bg-primary-container/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-on-surface leading-relaxed font-body">{summary}</p>
            </div>
          </div>

          {/* פאנל ממצאים */}
          <div className="lg:w-1/2 space-y-3">
            {/* תכונות נוכחות */}
            {presentFeatures.length > 0 && (
              <div>
                <p className="text-xs font-label font-medium text-tertiary mb-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  תכונות שנמצאו ({presentFeatures.length})
                </p>
                <div className="space-y-1.5">
                  {presentFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-tertiary/10 border border-tertiary/20">
                      <CheckCircle className="h-3.5 w-3.5 text-tertiary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-label font-medium text-on-surface">{feature.name}</p>
                        <p className="text-xs text-on-surface-variant/80 leading-snug font-body">{feature.significance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* תכונות נעדרות */}
            {absentFeatures.length > 0 && (
              <div>
                <p className="text-xs font-label font-medium text-error mb-2 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  תכונות חסרות ({absentFeatures.length})
                </p>
                <div className="space-y-1.5">
                  {absentFeatures.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-error/10 border border-error/20">
                      <XCircle className="h-3.5 w-3.5 text-error shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-label font-medium text-on-surface">{feature.name}</p>
                        <p className="text-xs text-on-surface-variant/80 leading-snug font-body">{feature.significance}</p>
                      </div>
                    </div>
                  ))}
                  {absentFeatures.length > 5 && (
                    <p className="text-xs text-on-surface-variant/80 text-center font-body">
                      ועוד {absentFeatures.length - 5} תכונות נוספות...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
