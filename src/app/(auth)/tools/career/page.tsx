'use client'

/**
 * דף ייעוץ קריירה — טופס כישורים ותחומי עניין + תוצאות מובנות
 * מדוע: ממשק ראשי לכלי ייעוץ הקריירה (TOOL-08) — ממשלב אסטרולוגיה עם ניתוח כישורים.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Briefcase, CheckCircle, AlertTriangle, TrendingUp, Zap } from 'lucide-react'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'

// ===== סכמת ולידציה =====

const FormSchema = z.object({
  currentField: z.string().max(200).optional(),
  skills: z.string().min(1, 'כישורים חובה'),
  interests: z.string().min(1, 'תחומי עניין חובה'),
})

type FormValues = z.infer<typeof FormSchema>

// ===== טיפוסים =====

interface RecommendedField {
  name: string
  match_score: number
  reason: string
}

interface CareerChallenge {
  challenge: string
  solution: string
}

interface CareerResult {
  recommended_fields: RecommendedField[]
  skills_to_develop: string[]
  growth_opportunities: string[]
  challenges: CareerChallenge[]
  action_steps: string[]
  summary: string
  analysis_id: string | null
}

// ===== פונקציית API =====

async function fetchCareerGuidance(input: FormValues): Promise<CareerResult> {
  const res = await fetch('/api/tools/career', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בייעוץ קריירה' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בייעוץ קריירה')
  }
  return ((await res.json()) as { data: CareerResult }).data
}

// ===== קומפוננטה =====

/** דף ייעוץ קריירה */
export default function CareerPage() {
  const [result, setResult] = useState<CareerResult | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchCareerGuidance,
    onSuccess: (data) => {
      setResult(data)
      toast.success('ייעוץ הקריירה הושלם')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'שגיאה בייעוץ קריירה')
    },
  })

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="ייעוץ קריירה"
        description="קבל ייעוץ קריירה מותאם אישית המשלב כישורים, תחומי עניין והקשר אסטרולוגי"
        icon={<Briefcase className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'ייעוץ קריירה' },
        ]}
      />

      {/* טופס */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="border-purple-500/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300">פרטי הפרופיל המקצועי</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-gray-300">תחום נוכחי (אופציונלי)</Label>
                  <Input
                    placeholder="לדוגמה: הייטק, רפואה, חינוך..."
                    {...register('currentField')}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300">כישורים *</Label>
                  <Textarea
                    placeholder="פרט את הכישורים שלך — טכניים, בין-אישיים, יצירתיים..."
                    rows={3}
                    {...register('skills')}
                  />
                  {errors.skills && (
                    <p className="text-xs text-red-400">{errors.skills.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300">תחומי עניין *</Label>
                  <Textarea
                    placeholder="מה מרגש אותך? אילו נושאים אתה/את אוהב/ת לחקור?"
                    rows={3}
                    {...register('interests')}
                  />
                  {errors.interests && (
                    <p className="text-xs text-red-400">{errors.interests.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {mutation.isPending ? 'מנתח קריירה...' : 'קבל ייעוץ קריירה'}
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
          className="space-y-4"
        >
          {/* סיכום */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardContent className="pt-6">
              <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
            </CardContent>
          </Card>

          {/* תחומים מומלצים */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-base text-purple-300 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                תחומים מומלצים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.recommended_fields.map((field, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-200 font-medium">{field.name}</span>
                    <span className="text-purple-400 font-medium">{field.match_score}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    {/* inline style לרוחב דינמי — אין מקביל ב-Tailwind לערכי runtime */}
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${field.match_score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{field.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* כישורים לפיתוח + הזדמנויות */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="border-blue-500/20 bg-gray-900/50 flex-1">
              <CardHeader>
                <CardTitle className="text-base text-blue-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  כישורים לפיתוח
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.skills_to_develop.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-3 w-3 text-blue-400 mt-1 shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gray-900/50 flex-1">
              <CardHeader>
                <CardTitle className="text-base text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  הזדמנויות צמיחה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.growth_opportunities.map((opp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* אתגרים ופתרונות */}
          <Card className="border-amber-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                אתגרים ופתרונות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.challenges.map((item, i) => (
                <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-amber-300 font-medium mb-1">{item.challenge}</p>
                  <p className="text-xs text-gray-400">{item.solution}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* צעדי פעולה */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-base text-purple-300 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                צעדי פעולה מיידיים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.action_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
