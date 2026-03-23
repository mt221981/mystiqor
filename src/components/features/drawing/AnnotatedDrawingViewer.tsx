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
    <Card className="border-purple-500/20 bg-gray-900/50" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-purple-300">הציור שלך — ממצאים ויזואליים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* תמונת הציור */}
          <div className="lg:w-1/2 shrink-0">
            <div className="relative w-full rounded-lg overflow-hidden bg-white/5 border border-purple-500/20">
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
            <div className="mt-3 p-3 rounded-lg bg-purple-900/20 border border-purple-700/20">
              <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
            </div>
          </div>

          {/* פאנל ממצאים */}
          <div className="lg:w-1/2 space-y-3">
            {/* תכונות נוכחות */}
            {presentFeatures.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  תכונות שנמצאו ({presentFeatures.length})
                </p>
                <div className="space-y-1.5">
                  {presentFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-green-900/10 border border-green-700/20">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-200">{feature.name}</p>
                        <p className="text-xs text-gray-500 leading-snug">{feature.significance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* תכונות נעדרות */}
            {absentFeatures.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  תכונות חסרות ({absentFeatures.length})
                </p>
                <div className="space-y-1.5">
                  {absentFeatures.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-red-900/10 border border-red-700/20">
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-200">{feature.name}</p>
                        <p className="text-xs text-gray-500 leading-snug">{feature.significance}</p>
                      </div>
                    </div>
                  ))}
                  {absentFeatures.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
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
