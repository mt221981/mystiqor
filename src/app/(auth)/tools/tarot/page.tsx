'use client'

/**
 * דף טארוט — משיכת קלפים מה-DB + פרשנות AI
 * מדוע: ממשק ראשי לכלי הטארוט — מאפשר למשתמש לשאול שאלה ולשלוף קלפים
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'
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

/** סוגי פריסות טארוט */
const SPREAD_OPTIONS: Array<{ count: 1 | 3 | 5; label: string }> = [
  { count: 1, label: 'קלף אחד' },
  { count: 3, label: '3 קלפים' },
  { count: 5, label: '5 קלפים' },
]

/**
 * שולחת בקשת POST ל-API טארוט
 */
async function fetchTarot(params: { spreadCount: 1 | 3 | 5; question?: string }): Promise<TarotResult> {
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

/** תרגום ארקנה לעברית */
const ARCANA_HE: Record<string, string> = {
  major: 'ארקנה גדולה',
  minor: 'ארקנה קטנה',
}

/** תרגום חפיסות לעברית */
const SUIT_HE: Record<string, string> = {
  wands: 'שרביטים',
  cups: 'גביעים',
  swords: 'חרבות',
  pentacles: 'פנטקלים',
}

/** דף כלי הטארוט */
export default function TarotPage() {
  const [spreadCount, setSpreadCount] = useState<1 | 3 | 5>(3)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<TarotResult | null>(null)

  const mutation = useMutation({
    mutationFn: fetchTarot,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הקלפים נשלפו')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בקריאת הטארוט')
    },
  })

  const handleDraw = () => {
    mutation.mutate({
      spreadCount,
      question: question.trim() || undefined,
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="טארוט"
        description="שליפת קלפים מה-DB + פרשנות AI מותאמת אישית"
        icon={<Sparkles className="h-5 w-5" />}
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
        <Card className="border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl mb-6 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">הגדרות פריסה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubscriptionGuard feature="analyses">
              {/* בחירת מספר קלפים */}
              <div className="space-y-2">
                <Label className="font-label text-on-surface-variant">מספר קלפים</Label>
                <div className="flex gap-2">
                  {SPREAD_OPTIONS.map(({ count, label }) => (
                    <Button
                      key={count}
                      variant={spreadCount === count ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSpreadCount(count)}
                      className={
                        spreadCount === count
                          ? 'bg-gradient-to-br from-primary-container to-secondary-container text-white font-label'
                          : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:border-primary/40'
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* שאלה אופציונלית */}
              <div className="space-y-1">
                <Label htmlFor="question" className="font-label text-on-surface-variant">
                  שאלה (אופציונלי)
                </Label>
                <Input
                  id="question"
                  type="text"
                  placeholder="הכנס שאלה שתרצה לשאול את הקלפים..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={300}
                  dir="rtl"
                />
                <p className="text-xs font-label text-on-surface-variant/60">{question.length}/300 תווים</p>
              </div>

              {/* כפתור שליפה */}
              <Button
                onClick={handleDraw}
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
              >
                {mutation.isPending ? 'שולף קלפים...' : 'שלוף קלפים'}
              </Button>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {/* תוצאות */}
      {result && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* קלפים שנשלפו */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {result.drawn.map((card, index) => (
              <Card
                key={`${card.id}-${index}`}
                className="nebula-glow rounded-xl text-center"
              >
                <CardContent className="pt-4 pb-4 space-y-2">
                  <p className="text-xl font-headline font-bold text-white">{card.name_he}</p>
                  <p className="text-xs font-body text-white/70 italic">{card.name_en}</p>

                  {/* תגיות */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="outline" className="text-xs font-label border-white/30 text-white/80">
                      {ARCANA_HE[card.arcana] ?? card.arcana}
                    </Badge>
                    {card.suit && (
                      <Badge variant="outline" className="text-xs font-label border-white/20 text-white/60">
                        {SUIT_HE[card.suit] ?? card.suit}
                      </Badge>
                    )}
                  </div>

                  {/* מילות מפתח */}
                  {card.keywords && card.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {card.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="text-xs font-label text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* פרשנות AI */}
          {result.interpretation && (
            <Card className="border-outline-variant/5 bg-surface-container rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  פרשנות AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-sm max-w-none font-body text-on-surface-variant leading-relaxed">
                  <ReactMarkdown>{result.interpretation}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
