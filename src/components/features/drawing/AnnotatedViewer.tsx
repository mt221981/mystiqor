'use client'

/**
 * AnnotatedViewer — מציג את הציור עם הערות AI מונחות עליו
 * תמיכה ב-base64 ו-URL עם אנוטציות מונחות בעמדות יחסיות
 */

import { Badge } from '@/components/ui/badge'

/** הערת AI על הציור */
interface Annotation {
  readonly x: number       // 0-100% of canvas width
  readonly y: number       // 0-100% of canvas height
  readonly label: string   // Hebrew annotation text
  readonly type: 'positive' | 'neutral' | 'concern'
}

/** Props לצופה הציור עם הערות */
interface AnnotatedViewerProps {
  readonly imageUrl: string    // base64 or URL
  readonly annotations?: Annotation[]
}

/** מיפוי צבעים לסוג הערה */
const ANNOTATION_COLORS: Record<Annotation['type'], string> = {
  positive: 'bg-green-500/80 text-white border-green-400/50',
  neutral: 'bg-gray-500/80 text-white border-gray-400/50',
  concern: 'bg-amber-500/80 text-white border-amber-400/50',
}

/**
 * מציג את הציור עם הערות AI מונחות עליו בעמדות יחסיות
 * @param imageUrl - כתובת URL או base64 של הציור
 * @param annotations - רשימת הערות עם מיקום, תווית וסוג
 */
export function AnnotatedViewer({ imageUrl, annotations = [] }: AnnotatedViewerProps) {
  return (
    <div className="relative inline-block w-full" dir="rtl">
      {/* תמונת הציור */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="הציור לניתוח"
        className="w-full h-auto rounded-lg border border-outline-variant/20 object-contain"
        style={{ maxHeight: '500px' }}
      />

      {/* הערות AI — מונחות בעמדות יחסיות */}
      {annotations.map((annotation, idx) => (
        <div
          key={idx}
          className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
          }}
        >
          <Badge
            className={`text-xs font-label shadow-lg border ${ANNOTATION_COLORS[annotation.type]} max-w-[120px] whitespace-normal text-center`}
          >
            {annotation.label}
          </Badge>
        </div>
      ))}

      {/* ציון מספר הערות */}
      {annotations.length > 0 && (
        <div className="absolute bottom-2 end-2 bg-surface-container/80 rounded-md px-2 py-1">
          <span className="text-xs text-on-surface-variant font-label">
            {annotations.length} הערות AI
          </span>
        </div>
      )}
    </div>
  )
}
