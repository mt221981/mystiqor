'use client'

/**
 * בורר פריסות טארוט — 4 כפתורי פריסה עם שם, תיאור, מספר קלפים ותצוגה מקדימה ויזואלית
 * מדוע: מחליף כפתורי טקסט בלבד בממשק עשיר הכולל מיני-תצוגה של פריסת הקלפים
 */

import { TAROT_SPREADS, type TarotSpread } from '@/lib/constants/tarot-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** פרופס של SpreadSelector */
interface SpreadSelectorProps {
  /** מזהה הפריסה הנבחרת */
  selectedId: string
  /** קולבק לשינוי פריסה */
  onSelect: (spread: TarotSpread) => void
}

/** פרופס של MiniCard — מלבן קטן המייצג קלף בתצוגה המקדימה */
interface MiniCardProps {
  /** האם הכפתור פעיל (משפיע על הצבע) */
  isActive: boolean
}

/**
 * מלבן קטן המייצג קלף בודד בתצוגה המקדימה של הפריסה
 */
function MiniCard({ isActive }: MiniCardProps) {
  return (
    <div
      className={cn(
        'mini-card rounded-sm border',
        isActive
          ? 'bg-accent/40 border-accent/60'
          : 'bg-primary/20 border-primary/30'
      )}
    />
  )
}

/** פרופס של SpreadPreview — תצוגה מקדימה ויזואלית של הפריסה */
interface SpreadPreviewProps {
  /** מזהה הפריסה */
  spreadId: string
  /** האם הכפתור פעיל */
  isActive: boolean
}

/**
 * מרנדר תצוגה מקדימה מיני של פריסת הקלפים
 * כל פריסה מוצגת עם מיקומי קלפים אמיתיים
 */
function SpreadPreview({ spreadId, isActive }: SpreadPreviewProps) {
  switch (spreadId) {
    /** קלף בודד — קלף אחד במרכז */
    case 'single_card':
      return (
        <div className="flex items-center justify-center h-10">
          <MiniCard isActive={isActive} />
        </div>
      )

    /** שלושה קלפים — שורה אחת */
    case 'three_card':
      return (
        <div className="flex items-center justify-center gap-1 h-10">
          <MiniCard isActive={isActive} />
          <MiniCard isActive={isActive} />
          <MiniCard isActive={isActive} />
        </div>
      )

    /** פריסת יחסים — 2 + 1 + 2 */
    case 'relationship':
      return (
        <div className="flex flex-col items-center gap-0.5 h-10 justify-center">
          {/* שורה עליונה: 2 קלפים */}
          <div className="flex gap-1">
            <MiniCard isActive={isActive} />
            <MiniCard isActive={isActive} />
          </div>
          {/* שורה תחתונה: 3 קלפים */}
          <div className="flex gap-1">
            <MiniCard isActive={isActive} />
            <MiniCard isActive={isActive} />
            <MiniCard isActive={isActive} />
          </div>
        </div>
      )

    default:
      return null
  }
}

/**
 * מרנדר 4 כפתורי פריסה עם שם, תיאור, מספר קלפים ותצוגה מקדימה ויזואלית
 * @param selectedId — מזהה הפריסה הפעילה
 * @param onSelect — פונקציה שנקראת עם אובייקט הפריסה שנבחרה
 */
export function SpreadSelector({ selectedId, onSelect }: SpreadSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="בחר פריסת טארוט">
      {TAROT_SPREADS.map((spread) => {
        const isActive = spread.id === selectedId
        return (
          <Button
            key={spread.id}
            variant="outline"
            onClick={() => onSelect(spread)}
            aria-pressed={isActive}
            className={cn(
              'flex h-auto flex-col items-center gap-1 px-3 py-2',
              isActive
                ? 'border-accent/60 bg-surface-container-high text-accent font-label'
                : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container'
            )}
          >
            {/* תצוגה מקדימה ויזואלית */}
            <SpreadPreview spreadId={spread.id} isActive={isActive} />

            {/* שם ומספר קלפים */}
            <span className="font-label text-sm font-medium text-start w-full">
              {spread.name}{' '}
              <span className="text-xs opacity-70">({spread.cardCount})</span>
            </span>

            {/* תיאור */}
            <span className="text-xs text-on-surface-variant/85 font-normal text-start w-full">
              {spread.description}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
