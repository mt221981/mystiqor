'use client'

/**
 * דף תאימות — טופס כפול לשני אנשים + תוצאות ניתוח תאימות
 * מדוע: ממשק ראשי לכלי התאימות — ניתוח אסטרולוגי + נומרולוגי.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Users, CheckCircle, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'

const PersonFormSchema = z.object({
  name: z.string().min(1, 'שם חובה'),
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
  birthTime: z.string().optional(),
})
const FormSchema = z.object({
  person1: PersonFormSchema,
  person2: PersonFormSchema,
  compatibilityType: z.enum(['romantic', 'friendship', 'professional', 'family']),
})
type FormValues = z.infer<typeof FormSchema>

interface CategoryScore { category: string; score: number; description: string }
interface CompatibilityResult {
  overall_score: number
  category_scores: CategoryScore[]
  strengths: string[]
  challenges: string[]
  advice: string
  summary: string
  analysis_id: string | null
}

const TYPES = [
  { value: 'romantic' as const, label: 'רומנטי' },
  { value: 'friendship' as const, label: 'חברות' },
  { value: 'professional' as const, label: 'מקצועי' },
  { value: 'family' as const, label: 'משפחתי' },
]

async function fetchCompatibility(input: FormValues): Promise<CompatibilityResult> {
  const res = await fetch('/api/tools/compatibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person1: { name: input.person1.name, birthDate: input.person1.birthDate, ...(input.person1.birthTime ? { birthTime: input.person1.birthTime } : {}) },
      person2: { name: input.person2.name, birthDate: input.person2.birthDate, ...(input.person2.birthTime ? { birthTime: input.person2.birthTime } : {}) },
      compatibilityType: input.compatibilityType,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בניתוח תאימות' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בניתוח תאימות')
  }
  return ((await res.json()) as { data: CompatibilityResult }).data
}

export default function CompatibilityPage() {
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { compatibilityType: 'romantic' },
  })
  const selectedType = watch('compatibilityType')
  const mutation = useMutation({
    mutationFn: fetchCompatibility,
    onSuccess: (data) => { setResult(data); toast.success('הניתוח הושלם') },
    onError: (err) => { toast.error(err instanceof Error ? err.message : 'שגיאה בניתוח תאימות') },
  })

  const renderPersonCard = (prefix: 'person1' | 'person2', title: string) => (
    <Card className="border-purple-500/20 bg-gray-900/50 flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-purple-300 flex items-center gap-2">
          <Users className="h-4 w-4" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm">שם</Label>
          <Input placeholder="שם מלא" {...register(`${prefix}.name`)} />
          {errors[prefix]?.name && <p className="text-xs text-red-400">{errors[prefix]?.name?.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm">תאריך לידה</Label>
          <Input type="date" dir="ltr" {...register(`${prefix}.birthDate`)} />
          {errors[prefix]?.birthDate && <p className="text-xs text-red-400">{errors[prefix]?.birthDate?.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm">שעת לידה (אופציונלי)</Label>
          <Input type="time" dir="ltr" {...register(`${prefix}.birthTime`)} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="ניתוח תאימות"
        description="ניתוח תאימות אסטרולוגי ונומרולוגי בין שני אנשים"
        icon={<Users className="h-5 w-5" />}
        breadcrumbs={[{ label: 'דף הבית', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'תאימות' }]}
      />

      <motion.div initial={animations.fadeInUp.initial} animate={animations.fadeInUp.animate} transition={{ duration: 0.4 }} className="mb-6">
        <Card className="border-purple-500/20 bg-gray-900/50">
          <CardHeader><CardTitle className="text-lg text-purple-300">הזן נתוני לידה</CardTitle></CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {renderPersonCard('person1', 'אדם 1')}
                  {renderPersonCard('person2', 'אדם 2')}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">סוג תאימות</Label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button key={t.value} type="button" onClick={() => setValue('compatibilityType', t.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedType === t.value ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  {mutation.isPending ? 'מנתח תאימות...' : 'נתח תאימות'}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={animations.fadeInUp.initial} animate={animations.fadeInUp.animate} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-4">
          {/* ציון כולל */}
          <Card className="border-purple-500/20 bg-gray-900/50 text-center">
            <CardContent className="pt-6">
              <div className={`text-6xl font-bold ${result.overall_score >= 75 ? 'text-green-400' : result.overall_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {result.overall_score}%
              </div>
              <p className="text-gray-400 text-sm mt-1">ציון תאימות כולל</p>
              <p className="text-gray-300 text-sm mt-2">{result.summary}</p>
            </CardContent>
          </Card>

          {/* ציונים לפי קטגוריה */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader><CardTitle className="text-base text-purple-300">ניתוח לפי קטגוריות</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {result.category_scores.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{cat.category}</span>
                    <span className="text-purple-400 font-medium">{cat.score}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    {/* inline style needed for dynamic width — no Tailwind equivalent for runtime values */}
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${cat.score}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">{cat.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* חוזקות ואתגרים */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="border-green-500/20 bg-gray-900/50 flex-1">
              <CardHeader><CardTitle className="text-base text-green-400 flex items-center gap-2"><CheckCircle className="h-4 w-4" />נקודות חוזקה</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 bg-gray-900/50 flex-1">
              <CardHeader><CardTitle className="text-base text-amber-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />אתגרים</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <AlertTriangle className="h-3 w-3 text-amber-400 mt-1 shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* עצה */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader><CardTitle className="text-base text-purple-300">עצה לחיזוק הקשר</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                <ReactMarkdown>{result.advice}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
