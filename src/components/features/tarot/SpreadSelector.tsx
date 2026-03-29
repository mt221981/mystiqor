'use client'

/**
 * בורר פריסות טארוט — 4 כפתורי פריסה עם שם, תיאור ומספר קלפים
 * מדוע: מחליף את SPREAD_OPTIONS הישן (3 כפתורים פשוטים) ב-4 פריסות עשירות מ-TAROT_SPREADS
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

/**
 * מרנדר 4 כפתורי פריסה עם שם, תיאור ומספר קלפים
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
              'flex h-auto flex-col items-start gap-0.5 px-3 py-2 text-start',
              isActive
                ? 'border-accent/60 bg-surface-container-high text-accent font-label'
                : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container'
            )}
          >
            <span className="font-label text-sm font-medium">
              {spread.name}{' '}
              <span className="text-xs opacity-70">({spread.cardCount})</span>
            </span>
            <span className="text-xs text-on-surface-variant/85 font-normal">
              {spread.description}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
