'use client'

/**
 * דף קריאות אסטרולוגיות — 8 סוגי קריאות מותאמות אישית
 * תנאי מוקדם: מפת לידה שמורה. בחירת סוג → שדות נוספים → קריאה אישית.
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GiSpellBook } from 'react-icons/gi'
import { BookOpen } from 'lucide-react'
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { MysticLoadingText } from '@/components/ui/mystic-loading-text'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { EmptyState } from '@/components/common/EmptyState'
import { ReadingCard } from '@/components/features/astrology/ReadingCard'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import { READING_TYPES, type ReadingTypeId } from '@/app/api/tools/astrology/readings/route'

// ===== טיפוסים =====

interface ReadingResult {
  readonly readingType: string
  readonly typeLabel: string
  readonly summary: string
  readonly sections: ReadonlyArray<{ readonly title: string; readonly content: string }>
  readonly analysis_id: string | null
  readonly createdAt: string
}

interface ReadingRequest {
  readingType: ReadingTypeId
  month?: number
  year?: number
  date?: string
  question?: string
  person2Name?: string
}

// ===== פונקציית API =====

async function fetchReading(input: ReadingRequest): Promise<ReadingResult> {
  const res = await fetch('/api/tools/astrology/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const json = await res.json().catch(() => ({ error: 'שגיאה בקריאה' })) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(typeof json['error'] === 'string' ? json['error'] : 'שגיאה בקריאה')
  }
  return json['data'] as ReadingResult
}

// ===== שדות נוספים — props =====

interface AdditionalFieldsProps {
  readonly additionalInput: string | null
  readonly month: string; readonly setMonth: (v: string) => void
  readonly year: string;  readonly setYear:  (v: string) => void
  readonly date: string;  readonly setDate:  (v: string) => void
  readonly person2Name: string; readonly setPerson2Name: (v: string) => void
  readonly question: string;    readonly setQuestion:    (v: string) => void
}

/** שדות קלט נוספים — מרנדר בהתאם לסוג הקריאה */
function AdditionalFields({ additionalInput, month, setMonth, year, setYear, date, setDate, person2Name, setPerson2Name, question, setQuestion }: AdditionalFieldsProps) {
  if (additionalInput === 'month') return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-sm text-on-surface-variant font-label">חודש</Label>
        <Input type="number" min={1} max={12} value={month} onChange={e => setMonth(e.target.value)} dir="ltr" className="text-center" />
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-on-surface-variant font-label">שנה</Label>
        <Input type="number" min={2020} max={2030} value={year} onChange={e => setYear(e.target.value)} dir="ltr" className="text-center" />
      </div>
    </div>
  )
  if (additionalInput === 'year') return (
    <div className="space-y-1">
      <Label className="text-sm text-on-surface-variant font-label">שנה</Label>
      <Input type="number" min={2020} max={2030} value={year} onChange={e => setYear(e.target.value)} dir="ltr" className="max-w-[200px] text-center" />
    </div>
  )
  if (additionalInput === 'date') return (
    <div className="space-y-1">
      <Label className="text-sm text-on-surface-variant font-label">תאריך</Label>
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} dir="ltr" className="max-w-[220px]" />
    </div>
  )
  if (additionalInput === 'person2') return (
    <div className="space-y-1">
      <Label className="text-sm text-on-surface-variant font-label">שם האדם השני</Label>
      <Input type="text" value={person2Name} onChange={e => setPerson2Name(e.target.value)} placeholder="הכנס שם..." className="max-w-[300px]" />
    </div>
  )
  if (additionalInput === 'question') return (
    <div className="space-y-1">
      <Label className="text-sm text-on-surface-variant font-label">שאלה ספציפית</Label>
      <Textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="כתוב את שאלתך..." maxLength={500} rows={3} className="resize-none" />
      <p className="text-xs text-on-surface-variant/60 text-end font-label">{question.length}/500</p>
    </div>
  )
  return null
}

// ===== קומפוננטה ראשית =====

const HEADER_BREADCRUMBS = [
  { label: 'דף הבית', href: '/' },
  { label: 'כלים', href: '/tools' },
  { label: 'אסטרולוגיה', href: '/tools/astrology' },
  { label: 'קריאות' },
]

/** דף קריאות אסטרולוגיות */
export default function ReadingsPage() {
  const [selectedType, setSelectedType] = useState<ReadingTypeId>('birth_chart')
  const [result, setResult] = useState<ReadingResult | null>(null)
  const [noNatal, setNoNatal] = useState(false)
  const { incrementUsage } = useSubscription()
  const shouldReduceMotion = useReducedMotion()

  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [date, setDate] = useState(now.toISOString().split('T')[0] ?? '')
  const [person2Name, setPerson2Name] = useState('')
  const [question, setQuestion] = useState('')

  const mutation = useMutation({
    mutationFn: fetchReading,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הקריאה האסטרולוגית מוכנה')
      void incrementUsage().catch(() => {})
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'שגיאה בקריאה'
      if (msg.includes('מפת לידה')) setNoNatal(true)
      toast.error(msg)
    },
  })

  const currentType = READING_TYPES.find(rt => rt.id === selectedType)

  const handleSubmit = () => {
    const input: ReadingRequest = { readingType: selectedType }
    if (currentType?.additionalInput === 'month') { input.month = parseInt(month) || now.getMonth() + 1; input.year = parseInt(year) || now.getFullYear() }
    else if (currentType?.additionalInput === 'year')    input.year = parseInt(year) || now.getFullYear()
    else if (currentType?.additionalInput === 'date')    input.date = date
    else if (currentType?.additionalInput === 'person2') input.person2Name = person2Name
    else if (currentType?.additionalInput === 'question') input.question = question
    mutation.mutate(input)
  }

  if (noNatal) return (
    <div className="container mx-auto px-4 py-6 max-w-4xl" dir="rtl">
      <StandardSectionHeader title="קריאות אסטרולוגיות" description="8 סוגי קריאות מותאמות אישית" icon={<GiSpellBook className="h-6 w-6" />} breadcrumbs={HEADER_BREADCRUMBS} />
      <EmptyState icon={<GiSpellBook className="h-8 w-8" />} title="נדרשת מפת לידה" description="כדי לקבל קריאה אסטרולוגית אישית, יש לחשב תחילה מפת לידה" action={{ label: 'לחישוב מפת לידה', onClick: () => { window.location.href = '/tools/astrology' } }} />
    </div>
  )

  return (
    <motion.div dir="rtl" className="container mx-auto px-4 py-6 max-w-4xl" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
      <StandardSectionHeader title="קריאות אסטרולוגיות" description="8 סוגי קריאות מותאמות אישית לפי מפת הלידה שלך" icon={<GiSpellBook className="h-6 w-6" />} breadcrumbs={HEADER_BREADCRUMBS} />

      <motion.div initial={animations.fadeInUp.initial} animate={animations.fadeInUp.animate} transition={{ duration: 0.4 }} className="mb-6">
        <Card className="border-outline-variant/5 bg-surface-container mystic-hover">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary flex items-center gap-2">
              <BookOpen className="h-5 w-5" />בחר סוג קריאה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SubscriptionGuard feature="analyses">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {READING_TYPES.map((rt) => (
                  <button key={rt.id} type="button" onClick={() => setSelectedType(rt.id)}
                    className={['rounded-lg px-3 py-2.5 text-sm font-label text-center transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-primary/40', selectedType === rt.id ? 'bg-primary-container text-on-primary-container border-primary font-bold' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/40 hover:text-primary'].join(' ')}>
                    {rt.label}
                  </button>
                ))}
              </div>

              <AdditionalFields additionalInput={currentType?.additionalInput ?? null} month={month} setMonth={setMonth} year={year} setYear={setYear} date={date} setDate={setDate} person2Name={person2Name} setPerson2Name={setPerson2Name} question={question} setQuestion={setQuestion} />

              <Button type="button" onClick={handleSubmit} disabled={mutation.isPending} className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold">
                {mutation.isPending ? <MysticLoadingText text="קורא את הכוכבים..." /> : `קבל ${currentType?.label ?? 'קריאה'}`}
              </Button>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={animations.fadeInUp.initial} animate={animations.fadeInUp.animate} transition={{ duration: 0.5, delay: 0.1 }}>
          <ReadingCard type={result.readingType} typeLabel={result.typeLabel} summary={result.summary} sections={result.sections as Array<{ title: string; content: string }>} createdAt={result.createdAt} />
        </motion.div>
      )}
    </motion.div>
  )
}
