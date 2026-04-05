'use client'

/**
 * דף טארוט — משיכת קלפים מה-DB + פרשנות AI
 * מדוע: ממשק ראשי לכלי הטארוט — מאפשר למשתמש לבחור פריסה, לשאול שאלה ולשלוף קלפים
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Layers, Gem } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { MysticLoadingText } from '@/components/ui/mystic-loading-text'
import { MYSTIC_LOADING_PHRASES } from '@/lib/constants/mystic-loading-phrases'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { ProgressiveReveal, RevealItem } from '@/components/ui/progressive-reveal'
import { MysticSkeleton } from '@/components/ui/mystic-skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { SpreadSelector } from '@/components/features/tarot/SpreadSelector'
import { SpreadLayout } from '@/components/features/tarot/SpreadLayout'
import { TarotCardDetailModal } from '@/components/features/tarot/TarotCardDetailModal'
import { TAROT_SPREADS, type TarotSpread } from '@/lib/constants/tarot-data'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import type { Database } from '@/types/database'

/** שורת קלף מ-DB */
type TarotCardRow = Database['public']['Tables']['tarot_cards']['Row']

/** תוצאת API טארוט */
interface TarotResult {
  drawn: TarotCardRow[]
  interpretation: string
  analysis_id: string | null
}

/** ממשק תגובת API */
interface TarotApiResponse {
  data: TarotResult
}

/**
 * שולחת בקשת POST ל-API טארוט
 */
async function fetchTarot(params: {
  spreadCount: 1 | 3 | 5 | 10
  question?: string
  spreadId?: string
}): Promise<TarotResult> {
  const res = await fetch('/api/tools/tarot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בקריאת הטארוט' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בקריאת הטארוט')
  }
  const json = (await res.json()) as TarotApiResponse
  return json.data
}

/** דף כלי הטארוט */
export default function TarotPage() {
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(
    TAROT_SPREADS[1] ?? TAROT_SPREADS[0]!
  )
  const [detailCard, setDetailCard] = useState<TarotCardRow | null>(null)
  const { incrementUsage } = useSubscription()
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<TarotResult | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const mutation = useMutation({
    mutationFn: fetchTarot,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הקלפים נשלפו')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בקריאת הטארוט')
    },
  })

  const handleDraw = () => {
    mutation.mutate({
      spreadCount: selectedSpread.cardCount as 1 | 3 | 5 | 10,
      spreadId: selectedSpread.id,
      question: question.trim() || undefined,
    })
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="טארוט"
        description="שליפת קלפים מה-DB + פרשנות AI מותאמת אישית"
        icon={<Layers className="w-6 h-6" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'טארוט' },
        ]}
      />

      {/* ממשק קלט */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        exit={animations.fadeInUp.exit}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl mb-6 rounded-xl mystic-hover">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">הגדרות פריסה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubscriptionGuard feature="analyses">
              {/* בחירת סוג פריסה */}
              <div className="space-y-2">
                <Label className="font-label text-on-surface-variant">סוג פריסה</Label>
                <SpreadSelector
                  selectedId={selectedSpread.id}
                  onSelect={setSelectedSpread}
                />
              </div>

              {/* שאלה אופציונלית */}
              <div className="space-y-1">
                <Label htmlFor="question" className="font-label text-on-surface-variant">
                  שאלה (אופציונלי)
                </Label>
                <Input
                  id="question"
                  type="text"
                  placeholder="שאל את הקלפים... (300 תווים מקסימום)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={300}
                  dir="rtl"
                />
                <p className="text-xs font-label text-on-surface-variant/80">{question.length}/300 תווים</p>
              </div>

              {/* כפתור שליפה */}
              <Button
                onClick={handleDraw}
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
              >
                {mutation.isPending ? <MysticLoadingText text={MYSTIC_LOADING_PHRASES['tarot']?.button ?? 'שולף את הקלפים...'} /> : 'שלוף קלפים'}
              </Button>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {/* מצב ריק — לפני שליפה */}
      {!result && !mutation.isPending && (
        <EmptyState
          icon={<Gem className="h-12 w-12" />}
          title="בחר פריסה ושאל את הקלפים"
          description='בחר סוג פריסה, הכנס שאלה (אופציונלי), ולחץ על "שלוף קלפים" לקבל תשובה'
        />
      )}

      {/* מצב טעינה */}
      {mutation.isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: selectedSpread.cardCount }).map((_, i) => (
            <MysticSkeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {/* תוצאות */}
      {result && (
        <ProgressiveReveal className="space-y-6">
          {/* פריסת קלפים */}
          <RevealItem>
            <SpreadLayout
              spreadId={selectedSpread.id}
              cards={result.drawn}
              positions={selectedSpread.positions}
              onCardClick={(card) => setDetailCard(card)}
            />
          </RevealItem>

          {/* פרשנות AI */}
          {result.interpretation && (
            <RevealItem>
              <Card className="border-outline-variant/5 bg-surface-container rounded-xl mystic-hover">
                <CardHeader>
                  <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    פרשנות AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="result-heading-glow prose prose-invert prose-sm max-w-none font-body text-on-surface-variant">
                    <ReactMarkdown>{result.interpretation}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          )}
        </ProgressiveReveal>
      )}

      {/* מודל פרטי קלף */}
      <TarotCardDetailModal
        card={detailCard}
        isOpen={detailCard !== null}
        onClose={() => setDetailCard(null)}
      />
    </motion.div>
  )
}
