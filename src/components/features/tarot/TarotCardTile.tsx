'use client'

/**
 * אריח קלף טארוט בודד — כולל אנימציית היפוך 3D וסקציה מתקפלת למטא-דאטה
 * מדוע: מציג כל קלף שנשלף עם אנימציית flip בעת הגילוי ומטא-דאטה עשירה בלחיצה
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { TarotCardMeta } from './TarotCardMeta'
import type { Database } from '@/types/database'

/** טיפוס שורת קלף טארוט מהDB — מורחב עם שדות מטא-דאטה עשירים (Plan 01) */
type TarotCardBaseRow = Database['public']['Tables']['tarot_cards']['Row']

/** שדות מטא-דאטה נוספים שמוסיפה Migration 007 (Plan 01) */
interface TarotCardRichFields {
  element?: string | null
  astrology?: string | null
  kabbalah?: string | null
  archetype?: string | null
  upright_keywords?: string[]
  reversed_keywords?: string[]
  numerology_value?: number | null
}

/** שורת קלף טארוט מלאה עם שדות עשירים */
export type TarotCardRow = TarotCardBaseRow & TarotCardRichFields

/** מיפוי ארקנה לעברית */
const ARCANA_HE: Record<string, string> = {
  major: 'ארקנה גדולה',
  minor: 'ארקנה קטנה',
}

/** מיפוי סוט לעברית */
const SUIT_HE: Record<string, string> = {
  wands: 'שרביטים',
  cups: 'גביעים',
  swords: 'חרבות',
  pentacles: 'פנטקלים',
}

/** פרופס של TarotCardTile */
interface TarotCardTileProps {
  /** נתוני הקלף */
  card: TarotCardRow
  /** תווית עמדה אופציונלית (למשל "עבר") */
  positionLabel?: string
  /** מיקום בסדר השליפה — קובע delay לאנימציה */
  index: number
  /** קולבק ללחיצה על הקלף לפתיחת מודל */
  onCardClick?: (card: TarotCardRow) => void
}

/**
 * מציג קלף טארוט בודד עם:
 * - אנימציית היפוך 3D בעת גילוי
 * - שם, ארקנה, סוט, מילות מפתח
 * - מטא-דאטה עשירה מתקפלת
 */
export function TarotCardTile({
  card,
  positionLabel,
  index,
  onCardClick,
}: TarotCardTileProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  /** שלוש מילות מפתח ראשונות */
  const topKeywords = card.keywords?.slice(0, 3) ?? []

  return (
    <div
      className="relative w-full"
      style={{ perspective: '1000px' }}
      onClick={() => onCardClick?.(card)}
    >
      {/* תווית עמדה */}
      {positionLabel && (
        <p className="mb-1 text-center text-xs font-label font-medium text-accent">
          {positionLabel}
        </p>
      )}

      {/* עטיפה מסתובבת */}
      <motion.div
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
        className="w-full"
      >
        {/* גב הקלף */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
          aria-hidden="true"
        >
          <div className="text-3xl opacity-40 select-none">✦</div>
        </div>

        {/* פנים הקלף */}
        <div
          className="nebula-glow rounded-xl p-3 cursor-pointer mystic-hover bg-surface-container"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded((prev) => !prev)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsExpanded((prev) => !prev)
            }
          }}
          aria-expanded={isExpanded}
          aria-label={`קלף ${card.name_he} — לחץ לפרטים`}
        >
          {/* שם הקלף */}
          <h3 className="text-xl font-headline font-bold text-white leading-tight">
            {card.name_he}
          </h3>
          <p className="text-xs font-body text-white/70 italic mb-2">
            {card.name_en}
          </p>

          {/* תגיות ארקנה וסוט */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge className="text-xs font-label bg-primary/20 text-primary border-primary/30">
              {ARCANA_HE[card.arcana] ?? card.arcana}
            </Badge>
            {card.suit && (
              <Badge className="text-xs font-label bg-secondary/20 text-secondary-foreground border-secondary/30">
                {SUIT_HE[card.suit] ?? card.suit}
              </Badge>
            )}
          </div>

          {/* מילות מפתח */}
          {topKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="outline"
                  className="text-xs border-outline-variant/30 text-on-surface-variant font-label"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          )}

          {/* מטא-דאטה מתקפלת */}
          <AnimatePresence>
            {isExpanded && (
              <TarotCardMeta
                element={card.element ?? null}
                astrology={card.astrology ?? null}
                kabbalah={card.kabbalah ?? null}
                archetype={card.archetype ?? null}
                uprightKeywords={card.upright_keywords ?? []}
                reversedKeywords={card.reversed_keywords ?? []}
                numerologyValue={card.numerology_value ?? null}
                isExpanded={isExpanded}
              />
            )}
          </AnimatePresence>

          {/* כפתור הרחב/כווץ */}
          <button
            className="mt-2 w-full text-center text-xs text-on-surface-variant/80 hover:text-on-surface-variant transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded((prev) => !prev)
            }}
            type="button"
            aria-label={isExpanded ? 'כווץ פרטים' : 'הרחב פרטים'}
          >
            {isExpanded ? '▲ פחות' : '▼ עוד פרטים'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
