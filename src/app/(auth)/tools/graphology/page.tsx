'use client'

/**
 * דף גרפולוגיה — העלאת תמונת כתב יד → ניתוח AI + תרשים רדאר + תובנות
 * מדוע: ממשק ראשי לכלי הגרפולוגיה — מאפשר ניתוח כתב יד עם תרשים רדאר
 * של 9 מרכיבים, תכונות אישיות, תובנות וייצוא PDF
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PenTool, Printer } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { GraphologyQuickStats } from '@/components/features/graphology/GraphologyQuickStats'
import { animations } from '@/lib/animations/presets'
import type { GraphologyResponse } from '@/services/analysis/response-schemas/graphology'

// ===== סכמת ולידציה =====

/** סכמת ולידציה לטופס גרפולוגיה */
const FormSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה — אנא הכנס URL תקין'),
})

type FormValues = z.infer<typeof FormSchema>

// ===== טיפוסי תוצאה =====

/** תוצאת API גרפולוגיה */
interface GraphologyResult extends GraphologyResponse {
  analysis_id: string | null
}

/** ממשק תגובת API */
interface GraphologyApiResponse {
  data: GraphologyResult
}

// ===== פונקציית קריאת API =====

/**
 * שולחת בקשת POST ל-API גרפולוגיה
 */
async function fetchGraphology(input: FormValues): Promise<GraphologyResult> {
  const res = await fetch('/api/tools/graphology', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: input.imageUrl }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בניתוח גרפולוגי' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בניתוח גרפולוגי')
  }
  const json = (await res.json()) as GraphologyApiResponse
  return json.data
}

// ===== קומפוננטה ראשית =====

/** דף כלי הגרפולוגיה */
export default function GraphologyPage() {
  const [result, setResult] = useState<GraphologyResult | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchGraphology,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הניתוח הגרפולוגי הושלם')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בניתוח גרפולוגי')
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  /**
   * מעלה קובץ דרך /api/upload ומוסיף את ה-URL לשדה
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'שגיאה בהעלאה' }))
        throw new Error((errData as { error?: string }).error ?? 'שגיאה בהעלאה')
      }

      const data = (await res.json()) as { url: string }
      setValue('imageUrl', data.url, { shouldValidate: true })
      toast.success('התמונה הועלתה בהצלחה')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'שגיאה בהעלאת התמונה')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl" dir="rtl">
      <PageHeader
        title="גרפולוגיה"
        description="ניתוח כתב יד מתמונה — 9 מרכיבים גרפולוגיים עם ציונים, תרשים רדאר ותובנות אישיות"
        icon={<PenTool className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'גרפולוגיה' },
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
            <CardTitle className="text-lg text-purple-300">העלאת דגימת כתב יד</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* העלאת קובץ */}
                <div className="space-y-1">
                  <Label className="text-gray-300">העלאת תמונה</Label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-400 file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                    aria-label="בחר תמונת כתב יד לניתוח"
                  />
                  {uploading && <p className="text-xs text-purple-400">מעלה תמונה...</p>}
                </div>

                {/* שדה URL */}
                <div className="space-y-1">
                  <Label htmlFor="imageUrl" className="text-gray-300">
                    או הדבק קישור לתמונת כתב יד
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://..."
                    dir="ltr"
                    {...register('imageUrl')}
                  />
                  {errors.imageUrl && (
                    <p className="text-xs text-red-400">{errors.imageUrl.message}</p>
                  )}
                </div>

                {/* כפתור שליחה */}
                <Button
                  type="submit"
                  disabled={mutation.isPending || uploading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {mutation.isPending ? 'מנתח כתב יד...' : 'נתח כתב יד'}
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
          {/* סיכום כללי + הערכה */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-base text-purple-300 flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                ניתוח גרפולוגי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
              {result.overall_assessment && (
                <div className="border-t border-purple-500/20 pt-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">הערכה כוללת</h3>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                    <ReactMarkdown>{result.overall_assessment}</ReactMarkdown>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* תרשים רדאר — 9 מרכיבים */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-base text-purple-300">9 מרכיבים גרפולוגיים</CardTitle>
            </CardHeader>
            <CardContent>
              <GraphologyQuickStats components={result.components} />
            </CardContent>
          </Card>

          {/* תכונות אישיות */}
          {result.personality_traits && result.personality_traits.length > 0 && (
            <Card className="border-purple-500/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-base text-purple-300">תכונות אישיות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.personality_traits.map((trait) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="bg-purple-600/20 text-purple-300 border-purple-500/30"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* תובנות */}
          {result.insights && result.insights.length > 0 && (
            <Card className="border-purple-500/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-base text-purple-300">תובנות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                      {insight.category}
                    </p>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                      <ReactMarkdown>{insight.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* כפתור ייצוא PDF */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-600/10"
            >
              <Printer className="h-4 w-4 ms-2" />
              ייצא PDF
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
