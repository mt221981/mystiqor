'use client'

/**
 * דף נומרולוגיה — הכנסת שם + תאריך לידה → חישוב 5 מספרים עבריים + פרשנות AI
 * + פירוק שלבי צמצום לכל מספר + סקציית תאימות נומרולוגית בין שני אנשים
 * מדוע: ממשק ראשי לכלי הנומרולוגיה — מאפשר למשתמש לקבל פרופיל נומרולוגי מותאם אישית
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Heart } from 'lucide-react'
import { GiAbacus } from 'react-icons/gi'
import ReactMarkdown from 'react-markdown'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberCard } from '@/components/features/numerology/NumberCard'
import { SubNumberBreakdown } from '@/components/features/numerology/SubNumberBreakdown'
import { CompatibilityCard } from '@/components/features/numerology/CompatibilityCard'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { ProgressiveReveal, RevealItem } from '@/components/ui/progressive-reveal'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import type { CompatibilityResult } from '@/types/numerology'

// ===== סכמת ולידציה =====

/** סכמת ולידציה לטופס נומרולוגיה */
const FormSchema = z.object({
  fullName: z.string().min(1, 'שם מלא חובה').max(100, 'שם ארוך מדי'),
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
})

type FormValues = z.infer<typeof FormSchema>

/** סכמת ולידציה לטופס תאימות */
const CompatibilityFormSchema = z.object({
  fullName: z.string().min(1, 'שם מלא חובה').max(100, 'שם ארוך מדי'),
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
})

type CompatibilityFormValues = z.infer<typeof CompatibilityFormSchema>

// ===== טיפוס תוצאה =====

/** מבנה תוצאת API נומרולוגיה */
interface NumerologyResult {
  name: string
  life_path: number
  destiny: number
  soul: number
  personality: number
  personal_year: number
  interpretation: string
  analysis_id: string | null
}

/** ממשק תגובת API */
interface NumerologyApiResponse {
  data: NumerologyResult
}

/** ממשק תגובת API תאימות */
interface CompatibilityApiResponse {
  data: CompatibilityResult & { interpretation: string; analysis_id: string | null }
}

// ===== כרטיסי המספרים =====

/** הגדרות 5 כרטיסי הנומרולוגיה */
const NUMBER_CARD_DEFS = [
  { key: 'life_path' as const, label: 'נתיב חיים', color: 'bg-surface-container' },
  { key: 'destiny' as const, label: 'גורל', color: 'bg-surface-container' },
  { key: 'soul' as const, label: 'נשמה', color: 'bg-surface-container' },
  { key: 'personality' as const, label: 'אישיות', color: 'bg-surface-container' },
  { key: 'personal_year' as const, label: 'שנה אישית', color: 'bg-surface-container' },
] as const

// ===== פונקציות עזר =====

/**
 * מחשב סכום גולמי של ספרות תאריך לידה (לפני הצמצום הסופי)
 * מאפשר להציג שלבי צמצום לנתיב חיים
 *
 * @param birthDate - תאריך בפורמט YYYY-MM-DD
 * @returns סכום הספרות של כל חלקי התאריך
 */
function getRawLifePathSum(birthDate: string): number {
  const parts = birthDate.split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 0
  const day = parts[2] ?? 0

  // צמצום כל חלק בנפרד
  const reduceOnce = (n: number): number => {
    if (n === 11 || n === 22 || n === 33) return n
    while (n > 9) {
      n = String(n).split('').reduce((sum, d) => sum + parseInt(d, 10), 0)
      if (n === 11 || n === 22 || n === 33) return n
    }
    return n
  }

  return reduceOnce(day) + reduceOnce(month) + reduceOnce(year)
}

// ===== פונקציות קריאת API =====

/**
 * שולחת בקשת POST ל-API נומרולוגיה
 */
async function fetchNumerology(input: FormValues): Promise<NumerologyResult> {
  const res = await fetch('/api/tools/numerology', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: input.fullName, birthDate: input.birthDate }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בחישוב נומרולוגי' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בחישוב נומרולוגי')
  }
  const json = (await res.json()) as NumerologyApiResponse
  return json.data
}

/**
 * שולחת בקשת POST ל-API תאימות נומרולוגית
 */
async function fetchCompatibility(params: {
  person1: FormValues
  person2: CompatibilityFormValues
}): Promise<CompatibilityApiResponse['data']> {
  const res = await fetch('/api/tools/numerology/compatibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person1: { fullName: params.person1.fullName, birthDate: params.person1.birthDate },
      person2: { fullName: params.person2.fullName, birthDate: params.person2.birthDate },
    }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בחישוב תאימות' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בחישוב תאימות')
  }
  const json = (await res.json()) as CompatibilityApiResponse
  return json.data
}

// ===== קומפוננטה ראשית =====

/** דף כלי הנומרולוגיה */
export default function NumerologyPage() {
  const [result, setResult] = useState<NumerologyResult | null>(null)
  const { incrementUsage } = useSubscription()
  const [mainFormValues, setMainFormValues] = useState<FormValues | null>(null)
  const [compatResult, setCompatResult] = useState<CompatibilityApiResponse['data'] | null>(null)
  const [showCompatibility, setShowCompatibility] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const compatForm = useForm<CompatibilityFormValues>({
    resolver: zodResolver(CompatibilityFormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchNumerology,
    onSuccess: (data, variables) => {
      setResult(data)
      setMainFormValues(variables)
      setCompatResult(null)
      toast.success('הניתוח הושלם')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בחישוב נומרולוגי')
    },
  })

  const compatMutation = useMutation({
    mutationFn: fetchCompatibility,
    onSuccess: (data) => {
      setCompatResult(data)
      toast.success('חישוב התאימות הושלם')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בחישוב תאימות')
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  const onCompatSubmit = (values: CompatibilityFormValues) => {
    if (!mainFormValues) return
    compatMutation.mutate({ person1: mainFormValues, person2: values })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="נומרולוגיה"
        description="חישוב 5 מספרים נומרולוגיים עבריים מותאמים אישית + פרשנות AI"
        icon={<GiAbacus className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'נומרולוגיה' },
        ]}
      />

      {/* טופס קלט */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        exit={animations.fadeInUp.exit}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-outline-variant/10 bg-surface-container mb-6 mystic-hover">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">הזן פרטים</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* שדה שם מלא */}
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="font-label text-on-surface-variant">
                    שם מלא
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="הכנס שמך המלא בעברית"
                    dir="rtl"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-400">{errors.fullName.message}</p>
                  )}
                </div>

                {/* שדה תאריך לידה */}
                <div className="space-y-1">
                  <Label htmlFor="birthDate" className="font-label text-on-surface-variant">
                    תאריך לידה
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register('birthDate')}
                  />
                  {errors.birthDate && (
                    <p className="text-xs text-red-400">{errors.birthDate.message}</p>
                  )}
                </div>

                {/* כפתור שליחה */}
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
                >
                  {mutation.isPending ? 'מחשב...' : 'חשב מספרים נומרולוגיים'}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {/* תוצאות */}
      {result && (
        <ProgressiveReveal className="space-y-6">
          {/* 5 כרטיסי מספרים + פירוק שלבי צמצום */}
          <RevealItem>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {NUMBER_CARD_DEFS.map(({ key, label, color }) => (
                  <NumberCard
                    key={key}
                    label={label}
                    value={result[key]}
                    color={color}
                  />
                ))}
              </div>

              {/* פירוק שלבי צמצום — מוצג כשיש תאריך לידה */}
              {mainFormValues?.birthDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <SubNumberBreakdown
                    label="נתיב חיים"
                    rawValue={getRawLifePathSum(mainFormValues.birthDate)}
                    finalValue={result.life_path}
                  />
                  <SubNumberBreakdown
                    label="גורל"
                    rawValue={result.destiny}
                    finalValue={result.destiny}
                  />
                  <SubNumberBreakdown
                    label="נשמה"
                    rawValue={result.soul}
                    finalValue={result.soul}
                  />
                  <SubNumberBreakdown
                    label="אישיות"
                    rawValue={result.personality}
                    finalValue={result.personality}
                  />
                </div>
              )}
            </div>
          </RevealItem>

          {/* פרשנות AI */}
          {result.interpretation && (
            <RevealItem>
              <Card className="border-outline-variant/5 bg-surface-container rounded-xl mystic-hover">
                <CardHeader>
                  <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                    <GiAbacus className="h-4 w-4" />
                    פרשנות AI מותאמת אישית
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert prose-sm max-w-none font-body text-on-surface-variant leading-relaxed">
                    <ReactMarkdown>{result.interpretation}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          )}

          {/* סקציית תאימות נומרולוגית — פרימיום */}
          <RevealItem>
            <SubscriptionGuard feature="analyses">
              <Card className="bg-gradient-to-br from-primary-container/20 to-secondary-container/20 rounded-xl border border-outline-variant/10">
                <CardHeader>
                {/* כותרת עם toggle */}
                <button
                  type="button"
                  onClick={() => setShowCompatibility((prev) => !prev)}
                  className="flex items-center justify-between w-full text-start"
                >
                  <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    תאימות נומרולוגית
                  </CardTitle>
                  {showCompatibility ? (
                    <ChevronUp className="h-4 w-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                  )}
                </button>
              </CardHeader>

              {showCompatibility && (
                <CardContent className="space-y-4">
                  <p className="text-sm font-body text-on-surface-variant" dir="rtl">
                    הזן פרטי אדם נוסף לחישוב התאימות הנומרולוגית בינכם
                  </p>

                  {/* טופס האדם השני */}
                  <form
                    onSubmit={compatForm.handleSubmit(onCompatSubmit)}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <Label htmlFor="compat-fullName" className="font-label text-on-surface-variant">
                        שם מלא (האדם השני)
                      </Label>
                      <Input
                        id="compat-fullName"
                        type="text"
                        placeholder="שם מלא בעברית"
                        dir="rtl"
                        {...compatForm.register('fullName')}
                      />
                      {compatForm.formState.errors.fullName && (
                        <p className="text-xs text-red-400">
                          {compatForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="compat-birthDate" className="font-label text-on-surface-variant">
                        תאריך לידה (האדם השני)
                      </Label>
                      <Input
                        id="compat-birthDate"
                        type="date"
                        {...compatForm.register('birthDate')}
                      />
                      {compatForm.formState.errors.birthDate && (
                        <p className="text-xs text-red-400">
                          {compatForm.formState.errors.birthDate.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={compatMutation.isPending}
                      className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
                    >
                      {compatMutation.isPending ? 'מחשב תאימות...' : 'חשב תאימות נומרולוגית'}
                    </Button>
                  </form>

                  {/* תוצאת תאימות */}
                  {compatMutation.isPending && (
                    <CompatibilityCard
                      result={{
                        person1: mainFormValues?.fullName ?? '',
                        person2: '',
                        scores: { life_path: 0, destiny: 0, soul: 0, overall: 0 },
                        analysis: '',
                      }}
                      isLoading
                    />
                  )}
                  {compatResult && !compatMutation.isPending && (
                    <CompatibilityCard result={compatResult} />
                  )}
                </CardContent>
              )}
              </Card>
            </SubscriptionGuard>
          </RevealItem>
        </ProgressiveReveal>
      )}
    </div>
  )
}
