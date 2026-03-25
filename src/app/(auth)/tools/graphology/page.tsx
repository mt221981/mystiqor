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
import { Printer, Clock, GitCompare, Bell } from 'lucide-react'
import { GiQuillInk } from 'react-icons/gi'
import ReactMarkdown from 'react-markdown'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { useSubscription } from '@/hooks/useSubscription'
import { GraphologyQuickStats } from '@/components/features/graphology/GraphologyQuickStats'
import { GraphologyTimeline } from '@/components/features/graphology/GraphologyTimeline'
import { GraphologyCompare } from '@/components/features/graphology/GraphologyCompare'
import { GraphologyReminder } from '@/components/features/graphology/GraphologyReminder'
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
  const [activeTab, setActiveTab] = useState<string>('analysis')
  const { incrementUsage } = useSubscription()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchGraphology,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הניתוח הגרפולוגי הושלם')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
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
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="mb-4 bg-surface-container/60">
          <TabsTrigger value="analysis" className="flex items-center gap-1"><GiQuillInk className="h-3 w-3" /> ניתוח</TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> ציר זמן</TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-1"><GitCompare className="h-3 w-3" /> השוואה</TabsTrigger>
          <TabsTrigger value="reminder" className="flex items-center gap-1"><Bell className="h-3 w-3" /> תזכורת</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <GraphologyTimeline />
        </TabsContent>

        <TabsContent value="compare">
          <GraphologyCompare />
        </TabsContent>

        <TabsContent value="reminder">
          <GraphologyReminder />
        </TabsContent>

        <TabsContent value="analysis">
      <PageHeader
        title="גרפולוגיה"
        description="ניתוח כתב יד מתמונה — 9 מרכיבים גרפולוגיים עם ציונים, תרשים רדאר ותובנות אישיות"
        icon={<GiQuillInk className="h-5 w-5" />}
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
        <Card className="border-outline-variant/5 bg-surface-container mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-primary font-headline">העלאת דגימת כתב יד</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* העלאת קובץ */}
                <div className="space-y-1">
                  <Label className="text-on-surface-variant font-label">העלאת תמונה</Label>
                  <div className="border-2 border-dashed border-outline-variant/30 hover:border-primary/40 rounded-xl p-8 bg-surface-container-lowest transition-colors text-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-on-surface-variant file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:opacity-80 cursor-pointer"
                      aria-label="בחר תמונת כתב יד לניתוח"
                    />
                  </div>
                  {uploading && <p className="text-xs text-primary font-label">מעלה תמונה...</p>}
                </div>

                {/* שדה URL */}
                <div className="space-y-1">
                  <Label htmlFor="imageUrl" className="text-on-surface-variant font-label">
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
                    <p className="text-xs text-error">{errors.imageUrl.message}</p>
                  )}
                </div>

                {/* כפתור שליחה */}
                <Button
                  type="submit"
                  disabled={mutation.isPending || uploading}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
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
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base text-primary font-headline flex items-center gap-2">
                <GiQuillInk className="h-4 w-4" />
                ניתוח גרפולוגי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant leading-relaxed font-body">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
              {result.overall_assessment && (
                <div className="border-t border-outline-variant/20 pt-4">
                  <h3 className="text-sm font-semibold text-primary font-headline mb-2">הערכה כוללת</h3>
                  <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant leading-relaxed font-body">
                    <ReactMarkdown>{result.overall_assessment}</ReactMarkdown>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* תרשים רדאר — 9 מרכיבים */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base text-primary font-headline">9 מרכיבים גרפולוגיים</CardTitle>
            </CardHeader>
            <CardContent>
              <GraphologyQuickStats components={result.components} />
            </CardContent>
          </Card>

          {/* תכונות אישיות */}
          {result.personality_traits && result.personality_traits.length > 0 && (
            <Card className="border-outline-variant/5 bg-surface-container">
              <CardHeader>
                <CardTitle className="text-base text-primary font-headline">תכונות אישיות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.personality_traits.map((trait) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="bg-primary-container/20 text-primary border-outline-variant/20 font-label"
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
            <Card className="border-outline-variant/5 bg-surface-container">
              <CardHeader>
                <CardTitle className="text-base text-primary font-headline">תובנות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-semibold text-primary font-label uppercase tracking-wide">
                      {insight.category}
                    </p>
                    <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant font-body">
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
              className="border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
            >
              <Printer className="h-4 w-4 ms-2" />
              ייצא PDF
            </Button>
          </div>
        </motion.div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
