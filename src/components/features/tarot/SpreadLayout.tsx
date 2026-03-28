'use client'

/**
 * מרנדר פריסת קלפים לפי סוג הפריסה — תומך ב-4 סוגים
 * מדוע: כל פריסה מציגה קלפים בתצוגה שונה (אחד, שורה, צלב, וכו')
 */

import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TarotCardTile } from './TarotCardTile'
import type { TarotCardRow } from './TarotCardTile'

/** פרופס של SpreadLayout */
interface SpreadLayoutProps {
  /** מזהה הפריסה */
  spreadId: string
  /** קלפים שנשלפו */
  cards: TarotCardRow[]
  /** תוויות עמדות */
  positions: readonly string[]
  /** קולבק ללחיצה על קלף */
  onCardClick?: (card: TarotCardRow) => void
}

/** עמדות הצלב הקלטי — col-start, row-start, col-span, row-span */
const CELTIC_CROSS_POSITIONS: Array<{
  col: string
  row: string
  label: string
}> = [
  { col: 'col-start-2 col-span-2', row: 'row-start-2 row-span-2', label: 'המצב הנוכחי' },
  { col: 'col-start-2 col-span-2', row: 'row-start-2 row-span-2', label: 'האתגר/המכשול' },
  { col: 'col-start-2 col-span-2', row: 'row-start-1 row-span-1', label: 'הבסיס/העבר הרחוק' },
  { col: 'col-start-2 col-span-2', row: 'row-start-3 row-span-1', label: 'העבר הקרוב' },
  { col: 'col-start-1 col-span-1', row: 'row-start-2 row-span-1', label: 'האפשרות הטובה ביותר' },
  { col: 'col-start-3 col-span-1', row: 'row-start-2 row-span-1', label: 'העתיד הקרוב' },
  { col: 'col-start-5 col-span-1', row: 'row-start-4 row-span-1', label: 'איך אתה רואה את עצמך' },
  { col: 'col-start-5 col-span-1', row: 'row-start-3 row-span-1', label: 'איך אחרים רואים אותך' },
  { col: 'col-start-5 col-span-1', row: 'row-start-2 row-span-1', label: 'תקוות ופחדים' },
  { col: 'col-start-5 col-span-1', row: 'row-start-1 row-span-1', label: 'התוצאה הסופית' },
]

/**
 * פריסת קלף בודד — מרכז מוחלט
 */
function SingleCardLayout({
  cards,
  onCardClick,
}: Pick<SpreadLayoutProps, 'cards' | 'onCardClick'>) {
  if (!cards[0]) return null
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xs">
        <TarotCardTile
          card={cards[0]}
          positionLabel="התובנה"
          index={0}
          onCardClick={onCardClick}
        />
      </div>
    </div>
  )
}

/**
 * פריסת שלושה קלפים — עבר, הווה, עתיד
 */
function ThreeCardLayout({
  cards,
  positions,
  onCardClick,
}: Pick<SpreadLayoutProps, 'cards' | 'positions' | 'onCardClick'>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, i) => (
        <TarotCardTile
          key={card.id}
          card={card}
          positionLabel={positions[i]}
          index={i}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  )
}

/**
 * פריסת יחסים — 2+1+2
 */
function RelationshipLayout({
  cards,
  positions,
  onCardClick,
}: Pick<SpreadLayoutProps, 'cards' | 'positions' | 'onCardClick'>) {
  return (
    <div className="flex flex-col gap-4">
      {/* שורה עליונה: שני קלפים */}
      <div className="grid grid-cols-2 gap-4">
        {cards.slice(0, 2).map((card, i) => (
          <TarotCardTile
            key={card.id}
            card={card}
            positionLabel={positions[i]}
            index={i}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      {/* שורה אמצעית: קלף מרכזי */}
      {cards[2] && (
        <div className="flex justify-center">
          <div className="w-full max-w-[calc(50%-0.5rem)]">
            <TarotCardTile
              card={cards[2]}
              positionLabel={positions[2]}
              index={2}
              onCardClick={onCardClick}
            />
          </div>
        </div>
      )}

      {/* שורה תחתונה: שני קלפים */}
      <div className="grid grid-cols-2 gap-4">
        {cards.slice(3, 5).map((card, i) => (
          <TarotCardTile
            key={card.id}
            card={card}
            positionLabel={positions[i + 3]}
            index={i + 3}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * פריסת הצלב הקלטי — 10 עמדות בגריד קלאסי
 * Desktop: CSS grid עם 5 עמודות ו-4 שורות
 * Mobile: רשימה ממוספרת
 */
function CelticCrossLayout({
  cards,
  onCardClick,
}: Pick<SpreadLayoutProps, 'cards' | 'onCardClick'>) {
  return (
    <TooltipProvider>
      {/* Desktop — גריד קלטי */}
      <div className="hidden sm:block">
        <ScrollArea className="w-full">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(4, minmax(80px, auto))',
            }}
          >
            {cards.map((card, i) => {
              const pos = CELTIC_CROSS_POSITIONS[i]
              if (!pos) return null
              return (
                <Tooltip key={card.id}>
                  <TooltipTrigger>
                    <div
                      className={`${pos.col} ${pos.row} min-h-[48px] min-w-[48px]`}
                    >
                      {/* מספר עמדה */}
                      <div className="mb-0.5 flex items-center gap-1">
                        <span className="text-xs font-label font-bold text-accent">
                          {i + 1}
                        </span>
                      </div>
                      <TarotCardTile
                        card={card}
                        index={i}
                        onCardClick={onCardClick}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="text-xs">{pos.label}</span>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile — רשימה ממוספרת */}
      <div className="flex flex-col gap-3 sm:hidden">
        {cards.map((card, i) => {
          const pos = CELTIC_CROSS_POSITIONS[i]
          return (
            <TarotCardTile
              key={card.id}
              card={card}
              positionLabel={pos ? `${i + 1}. ${pos.label}` : undefined}
              index={i}
              onCardClick={onCardClick}
            />
          )
        })}
      </div>
    </TooltipProvider>
  )
}

/**
 * מרנדר פריסת קלפים לפי spread ID
 */
export function SpreadLayout({ spreadId, cards, positions, onCardClick }: SpreadLayoutProps) {
  switch (spreadId) {
    case 'single_card':
      return <SingleCardLayout cards={cards} onCardClick={onCardClick} />

    case 'three_card':
      return (
        <ThreeCardLayout
          cards={cards}
          positions={positions}
          onCardClick={onCardClick}
        />
      )

    case 'relationship':
      return (
        <RelationshipLayout
          cards={cards}
          positions={positions}
          onCardClick={onCardClick}
        />
      )

    case 'celtic_cross':
      return <CelticCrossLayout cards={cards} onCardClick={onCardClick} />

    default:
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map((card, i) => (
            <TarotCardTile
              key={card.id}
              card={card}
              positionLabel={positions[i]}
              index={i}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      )
  }
}
