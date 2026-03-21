'use client'

/**
 * דף נומרולוגיה — הכנסת שם + תאריך לידה → חישוב 5 מספרים עבריים + פרשנות AI
 * מדוע: ממשק ראשי לכלי הנומרולוגיה — מאפשר למשתמש לקבל פרופיל נומרולוגי מותאם אישית
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberCard } from '@/components/features/numerology/NumberCard'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'

// ===== סכמת ולידציה =====

/** סכמת ולידציה לטופס נומרולוגיה */
const FormSchema = z.object({
  fullName: z.string().min(1, 'שם מלא חובה').max(100, 'שם ארוך מדי'),
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
})

type FormValues = z.infer<typeof FormSchema>

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

// ===== כרטיסי המספרים =====

/** הגדרות 5 כרטיסי הנומרולוגיה */
const NUMBER_CARD_DEFS = [
  { key: 'life_path' as const, label: 'נתיב חיים', color: 'bg-purple-900/20' },
  { key: 'destiny' as const, label: 'גורל', color: 'bg-blue-900/20' },
  { key: 'soul' as const, label: 'נשמה', color: 'bg-indigo-900/20' },
  { key: 'personality' as const, label: 'אישיות', color: 'bg-violet-900/20' },
  { key: 'personal_year' as const, label: 'שנה אישית', color: 'bg-fuchsia-900/20' },
] as const

// ===== פונקציית קריאת API =====

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

// ===== קומפוננטה ראשית =====

/** דף כלי הנומרולוגיה */
export default function NumerologyPage() {
  const [result, setResult] = useState<NumerologyResult | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchNumerology,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הניתוח הושלם')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בחישוב נומרולוגי')
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="נומרולוגיה"
        description="חישוב 5 מספרים נומרולוגיים עבריים מותאמים אישית + פרשנות AI"
        icon={<Sparkles className="h-5 w-5" />}
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
        <Card className="border-purple-500/20 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300">הזן פרטים</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* שדה שם מלא */}
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-gray-300">
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
                  <Label htmlFor="birthDate" className="text-gray-300">
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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* 5 כרטיסי מספרים */}
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

          {/* פרשנות AI */}
          {result.interpretation && (
            <Card className="border-purple-500/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-base text-purple-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  פרשנות AI מותאמת אישית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
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
