'use client'

/**
 * בורר פריסות טארוט — כרטיסי בחירה גדולים עם תצוגה מקדימה ויזואלית של קלפים
 * מדוע: נותן למשתמש תחושה מיסטית ומוחשית של מה שהוא הולך לקבל
 */

import { TAROT_SPREADS, type TarotSpread } from '@/lib/constants/tarot-data'
import { cn } from '@/lib/utils'

/** פרופס של SpreadSelector */
interface SpreadSelectorProps {
  /** מזהה הפריסה הנבחרת */
  selectedId: string
  /** קולבק לשינוי פריסה */
  onSelect: (spread: TarotSpread) => void
}

/** קלף מיניאטורי בתצוגה מקדימה — עם גרדיאנט ועיטור */
function MiniCard({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'mini-card rounded border-2 relative overflow-hidden',
        isActive
          ? 'border-amber-400/70 bg-gradient-to-b from-purple-800/80 to-indigo-900/80'
          : 'border-primary/30 bg-gradient-to-b from-purple-950/60 to-indigo-950/60'
      )}
    >
      {/* עיטור מרכזי */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          'text-[10px] select-none',
          isActive ? 'text-amber-300/80' : 'text-primary/40'
        )}>
          ✦
        </span>
      </div>
      {/* מסגרת פנימית */}
      <div className={cn(
        'absolute inset-1 rounded-sm border',
        isActive ? 'border-amber-400/30' : 'border-primary/15'
      )} />
    </div>
  )
}

/** תצוגה מקדימה ויזואלית של פריסת קלפים */
function SpreadPreview({ spreadId, isActive }: { spreadId: string; isActive: boolean }) {
  switch (spreadId) {
    case 'single_card':
      return (
        <div className="flex items-center justify-center h-20">
          <MiniCard isActive={isActive} />
        </div>
      )

    case 'three_card':
      return (
        <div className="flex items-center justify-center gap-2 h-20">
          <MiniCard isActive={isActive} />
          <MiniCard isActive={isActive} />
          <MiniCard isActive={isActive} />
        </div>
      )

    case 'relationship':
      return (
        <div className="flex flex-col items-center gap-1.5 h-20 justify-center">
          <div className="flex gap-2">
            <MiniCard isActive={isActive} />
            <MiniCard isActive={isActive} />
          </div>
          <div className="flex gap-2">
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
 * מרנדר כרטיסי בחירת פריסה גדולים עם תצוגה מקדימה ויזואלית
 */
export function SpreadSelector({ selectedId, onSelect }: SpreadSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="בחר פריסת טארוט">
      {TAROT_SPREADS.map((spread) => {
        const isActive = spread.id === selectedId
        return (
          <button
            key={spread.id}
            type="button"
            onClick={() => onSelect(spread)}
            aria-pressed={isActive}
            className={cn(
              'flex flex-col items-center gap-3 px-5 py-5 rounded-2xl border-2 transition-all cursor-pointer',
              isActive
                ? 'border-amber-400/60 bg-gradient-to-b from-surface-container-high to-surface-container shadow-[0_0_25px_rgba(143,45,230,0.25),0_0_10px_rgba(251,191,36,0.15)]'
                : 'border-outline-variant/20 bg-surface-container hover:border-primary/40 hover:shadow-[0_0_15px_rgba(143,45,230,0.1)]'
            )}
          >
            {/* תצוגה מקדימה ויזואלית */}
            <SpreadPreview spreadId={spread.id} isActive={isActive} />

            {/* שם */}
            <span className={cn(
              'font-headline text-lg font-bold',
              isActive ? 'text-amber-300' : 'text-on-surface'
            )}>
              {spread.name}
            </span>

            {/* מספר קלפים */}
            <span className={cn(
              'text-sm font-label',
              isActive ? 'text-accent' : 'text-on-surface-variant'
            )}>
              {spread.cardCount} קלפים
            </span>

            {/* תיאור */}
            <span className="text-xs text-on-surface-variant/80 font-body">
              {spread.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
