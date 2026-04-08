'use client'

/**
 * אריח קלף טארוט בודד — כולל אנימציית היפוך 3D וסקציה מתקפלת למטא-דאטה
 * מדוע: מציג כל קלף שנשלף עם אנימציית flip, אמנות ויזואלית ומטא-דאטה עשירה בלחיצה
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { TarotCardMeta } from './TarotCardMeta'
import { TarotCardArt } from './TarotCardArt'
import { TAROT_CARD_META } from '@/lib/constants/tarot-data'
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
 * - גב עשיר עם קווים זהובים ומיסטיים
 * - פנים הקלף: אמנות ויזואלית + שם, ארקנה, סוט, מילות מפתח
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

  /** מטא-דאטה עשירה מהקבוע — fallback לנתוני ה-DB */
  const meta = typeof card.number === 'number'
    ? TAROT_CARD_META[card.number]
    : undefined

  /** ערכים מאוחדים: DB ראשוני, אחרת מהקבוע */
  const element = card.element ?? meta?.element
  const kabbalah = card.kabbalah ?? meta?.kabbalah
  const archetype = card.archetype ?? meta?.archetype

  /** טיפול בלחיצה על הקלף — פתיחת מודל */
  function handleCardClick() {
    onCardClick?.(card)
  }

  /** טיפול בהרחב/כווץ */
  function handleToggleExpand(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation()
    setIsExpanded((prev) => !prev)
  }

  return (
    <div
      className="relative w-full card-perspective"
      onClick={handleCardClick}
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
        className="w-full card-preserve-3d relative"
      >
        {/* ===== גב הקלף — עיצוב מיסטי זהוב עשיר ===== */}
        <div
          className="absolute inset-0 rounded-xl card-back-face overflow-hidden"
          aria-hidden="true"
        >
          {/* רקע גרדיאנט */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900" />

          {/* מסגרת זהובה */}
          <div className="absolute inset-1 rounded-lg border border-amber-400/30" />
          <div className="absolute inset-2 rounded-lg border border-amber-400/15" />

          {/* קווים רדיאליים מיסטיים */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-16 h-16">
              {/* קו אופקי */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              {/* קו אנכי */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
              {/* קו אלכסוני */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 44deg, rgba(251,191,36,0.2) 45deg, transparent 46deg, transparent 89deg, rgba(251,191,36,0.2) 90deg, transparent 91deg, transparent 134deg, rgba(251,191,36,0.2) 135deg, transparent 136deg, transparent 179deg, rgba(251,191,36,0.2) 180deg, transparent 181deg, transparent 224deg, rgba(251,191,36,0.2) 225deg, transparent 226deg, transparent 269deg, rgba(251,191,36,0.2) 270deg, transparent 271deg, transparent 314deg, rgba(251,191,36,0.2) 315deg, transparent 316deg)',
                }}
              />
              {/* עיגולים */}
              <div className="absolute inset-2 rounded-full border border-amber-400/25" />
              <div className="absolute inset-4 rounded-full border border-amber-400/20" />
              {/* כוכב מרכזי */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl text-amber-300/60 select-none">✦</span>
              </div>
            </div>
          </div>

          {/* עיטורי פינות */}
          <span className="absolute top-2 start-2 text-xs text-amber-400/40 select-none">✦</span>
          <span className="absolute top-2 end-2 text-xs text-amber-400/40 select-none">✦</span>
          <span className="absolute bottom-2 start-2 text-xs text-amber-400/40 select-none">✦</span>
          <span className="absolute bottom-2 end-2 text-xs text-amber-400/40 select-none">✦</span>
        </div>

        {/* ===== פנים הקלף — אמנות ויזואלית + מידע ===== */}
        <div
          className="nebula-glow rounded-xl cursor-pointer mystic-hover overflow-hidden card-front-face"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded((prev) => !prev)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleToggleExpand(e)
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`קלף ${card.name_he} — לחץ לפרטים`}
        >
          {/* אמנות הקלף — שכבת בסיס עם פרופורציית קלף */}
          <div className="relative w-full" style={{ aspectRatio: '2 / 3' }}>
            <TarotCardArt
              cardNumber={card.number ?? 0}
              arcana={card.arcana}
              suit={card.suit ?? null}
              element={element ?? undefined}
              kabbalah={kabbalah ?? undefined}
              archetype={archetype ?? undefined}
              nameHe={card.name_he}
            />

            {/* שכבת אוברליי שקופה להטמעת הטקסט */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent rounded-xl" />

            {/* שם הקלף על האמנות */}
            <div className="absolute bottom-0 start-0 end-0 p-2">
              <h3 className="text-base font-headline font-bold text-white leading-tight drop-shadow-lg">
                {card.name_he}
              </h3>
              <p className="text-xs font-body text-white/60 italic leading-tight">
                {card.name_en}
              </p>
            </div>
          </div>

          {/* מידע תחתית הקלף */}
          <div className="bg-surface-container p-2 space-y-1.5">
            {/* תגיות ארקנה וסוט */}
            <div className="flex flex-wrap gap-1">
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
              className="mt-1 w-full text-center text-xs text-on-surface-variant/80 hover:text-on-surface-variant transition-colors"
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
        </div>
      </motion.div>
    </div>
  )
}
