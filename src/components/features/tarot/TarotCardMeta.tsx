'use client'

/**
 * פאנל מטא-דאטה עשירה של קלף טארוט — סקציה מתקפלת
 * מדוע: מציג את השדות העשירים (אסטרולוגיה, קבלה, ארכיטיפ, נומרולוגיה) בלחיצה
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** צבעי האלמנטים לפי D-09 */
const ELEMENT_COLOR: Record<string, string> = {
  fire:  'bg-red-500/20 text-red-300 border-red-500/30',
  water: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  air:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  earth: 'bg-green-500/20 text-green-300 border-green-500/30',
}

/** שמות האלמנטים בעברית */
const ELEMENT_HE: Record<string, string> = {
  fire: 'אש',
  water: 'מים',
  air: 'אוויר',
  earth: 'אדמה',
}

/** פרופס של TarotCardMeta */
interface TarotCardMetaProps {
  /** אלמנט הקלף (fire/water/air/earth) */
  element: string | null
  /** התאמה אסטרולוגית */
  astrology: string | null
  /** נתיב קבלה */
  kabbalah: string | null
  /** ארכיטיפ */
  archetype: string | null
  /** מילות מפתח — ישר */
  uprightKeywords: string[]
  /** מילות מפתח — הפוך */
  reversedKeywords: string[]
  /** ערך נומרולוגי */
  numerologyValue: number | null
  /** האם הסקציה מורחבת */
  isExpanded: boolean
}

/**
 * מציג מטא-דאטה עשירה של קלף — אלמנטים, אסטרולוגיה, קבלה, ארכיטיפ, מילות מפתח
 */
export function TarotCardMeta({
  element,
  astrology,
  kabbalah,
  archetype,
  uprightKeywords,
  reversedKeywords,
  numerologyValue,
  isExpanded,
}: TarotCardMetaProps) {
  const elementColorClass = element ? (ELEMENT_COLOR[element] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/20') : null
  const elementLabel = element ? (ELEMENT_HE[element] ?? element) : null

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          key="meta-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="mt-3 flex flex-col gap-2 border-t border-outline-variant/10 pt-3">

            {/* אלמנט */}
            {elementLabel && elementColorClass && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent font-label font-medium min-w-[5rem]">אלמנט</span>
                <Badge
                  className={cn(
                    'border text-xs font-label',
                    elementColorClass
                  )}
                >
                  {elementLabel}
                </Badge>
              </div>
            )}

            {/* התאמה אסטרולוגית */}
            {astrology && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-accent font-label font-medium min-w-[5rem]">התאמה אסטרולוגית</span>
                <span className="text-xs text-on-surface-variant">{astrology}</span>
              </div>
            )}

            {/* ערך נומרולוגי */}
            {numerologyValue !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent font-label font-medium min-w-[5rem]">ערך נומרולוגי</span>
                <span className="text-xs text-on-surface-variant">{numerologyValue}</span>
              </div>
            )}

            {/* נתיב קבלה */}
            {kabbalah && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent font-label font-medium min-w-[5rem]">נתיב קבלה</span>
                <span className="text-xs text-on-surface-variant">{kabbalah}</span>
              </div>
            )}

            {/* ארכיטיפ */}
            {archetype && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent font-label font-medium min-w-[5rem]">ארכיטיפ</span>
                <span className="text-xs text-on-surface-variant">{archetype}</span>
              </div>
            )}

            {/* מילות מפתח — ישר */}
            {uprightKeywords.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-accent font-label font-medium">מילות מפתח — ישר</span>
                <div className="flex flex-wrap gap-1">
                  {uprightKeywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="outline"
                      className="text-xs border-outline-variant/30 text-on-surface-variant font-label"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* מילות מפתח — הפוך (שמורות ב-DB לפי D-11, מוצגות רק בפאנל המטא) */}
            {reversedKeywords.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-accent font-label font-medium">מילות מפתח — הפוך</span>
                <div className="flex flex-wrap gap-1">
                  {reversedKeywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="outline"
                      className="text-xs border-outline-variant/30 text-on-surface-variant/80 font-label"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
