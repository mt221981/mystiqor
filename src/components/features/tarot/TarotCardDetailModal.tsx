'use client'

/**
 * מודל פרטי קלף מלא — דיאלוג עם כל שדות המטא-דאטה
 * מדוע: מאפשר צפייה בכל פרטי הקלף כולל משמעויות ומטא-דאטה עשירה
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TarotCardMeta } from './TarotCardMeta'
import type { TarotCardRow } from './TarotCardTile'

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

/** פרופס של TarotCardDetailModal */
interface TarotCardDetailModalProps {
  /** הקלף המוצג (null = מודל סגור) */
  card: TarotCardRow | null
  /** האם המודל פתוח */
  isOpen: boolean
  /** קולבק לסגירת המודל */
  onClose: () => void
}

/**
 * מציג את כל פרטי הקלף בדיאלוג מלא:
 * שם, ארקנה, סוט, משמעות ישרה/הפוכה, ומטא-דאטה עשירה
 */
export function TarotCardDetailModal({
  card,
  isOpen,
  onClose,
}: TarotCardDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        {card && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold">
                {card.name_he}
              </DialogTitle>
              <p className="text-sm text-on-surface-variant italic">
                {card.name_en}
              </p>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh]">
              <div className="flex flex-col gap-4 pb-2">

                {/* תגיות ארקנה וסוט */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="text-xs font-label bg-primary/20 text-primary border-primary/30">
                    {ARCANA_HE[card.arcana] ?? card.arcana}
                  </Badge>
                  {card.suit && (
                    <Badge className="text-xs font-label bg-secondary/20 text-secondary-foreground border-secondary/30">
                      {SUIT_HE[card.suit] ?? card.suit}
                    </Badge>
                  )}
                </div>

                {/* משמעות ישרה */}
                <GlassCard variant="gold" className="p-4">
                  <h4 className="mb-1 text-xs font-label font-semibold text-accent">
                    משמעות ישרה
                  </h4>
                  <p className="text-sm font-body text-on-surface">
                    {card.meaning_upright}
                  </p>
                </GlassCard>

                {/* משמעות הפוכה */}
                {card.meaning_reversed && (
                  <GlassCard variant="default" className="p-4">
                    <h4 className="mb-1 text-xs font-label font-semibold text-on-surface-variant">
                      משמעות הפוכה
                    </h4>
                    <p className="text-sm font-body text-on-surface-variant">
                      {card.meaning_reversed}
                    </p>
                  </GlassCard>
                )}

                {/* מטא-דאטה עשירה — תמיד מורחבת במודל */}
                <TarotCardMeta
                  element={card.element ?? null}
                  astrology={card.astrology ?? null}
                  kabbalah={card.kabbalah ?? null}
                  archetype={card.archetype ?? null}
                  uprightKeywords={card.upright_keywords ?? []}
                  reversedKeywords={card.reversed_keywords ?? []}
                  numerologyValue={card.numerology_value ?? null}
                  isExpanded={true}
                />

              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
