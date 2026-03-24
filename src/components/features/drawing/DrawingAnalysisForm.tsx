'use client'

/**
 * DrawingAnalysisForm — טופס ניתוח ציור עם העלאה / קנבס
 * מופרד מדף הציורים לשמירה על מגבלת 300 שורות
 *
 * מדוע: מאפשר ניתוח HTP עם שתי שיטות קלט — העלאת תמונה וציור בדפדפן
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Upload, PenTool } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'

const DigitalCanvas = dynamic(() => import('@/components/features/drawing/DigitalCanvas'), { ssr: false })

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { KoppitzVisualization } from '@/components/features/drawing/KoppitzVisualization'
import { FDMVisualization } from '@/components/features/drawing/FDMVisualization'
import { AnnotatedDrawingViewer } from '@/components/features/drawing/AnnotatedDrawingViewer'
import { animations } from '@/lib/animations/presets'
import type { DrawingResponse } from '@/services/analysis/response-schemas/drawing'

// ===== סכמת ולידציה =====

const FormSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה — אנא הכנס URL תקין'),
  drawingType: z.enum(['house', 'tree', 'person', 'free']),
})

type FormValues = z.infer<typeof FormSchema>

/** תוצאת API ניתוח ציורים */
export type DrawingResult = DrawingResponse & { analysis_id: string | null }

interface DrawingApiResponse {
  data: DrawingResult
}

const DRAWING_TYPES = [
  { value: 'house', label: 'בית' },
  { value: 'tree', label: 'עץ' },
  { value: 'person', label: 'אדם' },
  { value: 'free', label: 'חופשי' },
] as const

async function fetchDrawingAnalysis(input: FormValues): Promise<DrawingResult> {
  const res = await fetch('/api/tools/drawing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: input.imageUrl, drawingType: input.drawingType }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בניתוח הציור' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בניתוח הציור')
  }
  const json = (await res.json()) as DrawingApiResponse
  return json.data
}

// ===== קומפוננטה =====

/**
 * DrawingAnalysisForm — טופס ניתוח ציור עם תצוגת תוצאות
 */
export function DrawingAnalysisForm() {
  const [result, setResult] = useState<DrawingResult | null>(null)
  const [resultImageUrl, setResultImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'canvas'>('upload')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { drawingType: 'person' },
  })

  const selectedType = watch('drawingType')

  const mutation = useMutation({
    mutationFn: fetchDrawingAnalysis,
    onSuccess: (data, variables) => {
      setResult(data)
      setResultImageUrl(variables.imageUrl)
      toast.success('הניתוח הושלם')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בניתוח הציור')
    },
  })

  /**
   * מעלה קובץ דרך /api/upload ומחזיר URL
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
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
    <div className="space-y-6">
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader>
          <CardTitle className="text-lg text-primary font-headline">הגדרות ניתוח</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionGuard feature="analyses">
            {/* בורר מצב קלט */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-label font-medium transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20'
                }`}
              >
                <Upload className="h-4 w-4" />
                העלאת תמונה
              </button>
              <button
                type="button"
                onClick={() => setInputMode('canvas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-label font-medium transition-colors ${
                  inputMode === 'canvas'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20'
                }`}
              >
                <PenTool className="h-4 w-4" />
                ציור חופשי
              </button>
            </div>

            {/* מצב קנבס */}
            {inputMode === 'canvas' && (
              <div className="mb-4">
                <DigitalCanvas
                  onSave={async (file: File) => {
                    setUploading(true)
                    try {
                      const formData = new FormData()
                      formData.append('file', file)
                      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
                      if (!uploadRes.ok) throw new Error('שגיאה בהעלאה')
                      const data = (await uploadRes.json()) as { url: string }
                      setValue('imageUrl', data.url, { shouldValidate: true })
                      toast.success('הציור הועלה בהצלחה')
                    } catch {
                      toast.error('שגיאה בהעלאת הציור')
                    } finally {
                      setUploading(false)
                    }
                  }}
                  onCancel={() => setInputMode('upload')}
                />
              </div>
            )}

            <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
              {/* בחירת סוג ציור */}
              <div className="space-y-2">
                <Label className="text-on-surface-variant font-label">סוג הציור</Label>
                <div className="flex flex-wrap gap-2">
                  {DRAWING_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('drawingType', value, { shouldValidate: true })}
                      className={`px-4 py-2 rounded-md text-sm font-label font-medium transition-colors ${
                        selectedType === value
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.drawingType && (
                  <p className="text-xs text-error">{errors.drawingType.message}</p>
                )}
              </div>

              {/* העלאת קובץ */}
              <div className="space-y-1">
                <Label className="text-on-surface-variant font-label">העלאת תמונת הציור</Label>
                <div className="border-2 border-dashed border-outline-variant/30 hover:border-primary/40 rounded-xl p-8 bg-surface-container-lowest transition-colors text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-on-surface-variant file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:opacity-80 cursor-pointer"
                    aria-label="בחר תמונת ציור"
                  />
                </div>
                {uploading && (
                  <p className="text-xs text-primary font-label flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    מעלה תמונה...
                  </p>
                )}
              </div>

              {/* שדה URL */}
              <div className="space-y-1">
                <Label htmlFor="imageUrl" className="text-on-surface-variant font-label">
                  או הדבק קישור לתמונת הציור
                </Label>
                <Input id="imageUrl" type="url" placeholder="https://..." dir="ltr" {...register('imageUrl')} />
                {errors.imageUrl && (
                  <p className="text-xs text-error">{errors.imageUrl.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending || uploading}
                className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מנתח ציור...
                  </span>
                ) : (
                  'נתח ציור'
                )}
              </Button>
            </form>
          </SubscriptionGuard>
        </CardContent>
      </Card>

      {/* תוצאות */}
      {result && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <AnnotatedDrawingViewer imageUrl={resultImageUrl} features={result.features} summary={result.summary} />
          <KoppitzVisualization features={result.features} koppitzScore={result.koppitz_score} />
          <FDMVisualization categories={result.fdm_categories ?? []} emotionalIndicators={result.emotional_indicators} />
          {result.insights.length > 0 && (
            <Card className="border-outline-variant/5 bg-surface-container">
              <CardHeader>
                <CardTitle className="text-base text-primary font-headline">תובנות מהניתוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-container-high/50 border border-outline-variant/20">
                    <p className="text-xs font-label font-medium text-primary mb-1">{insight.category}</p>
                    <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant leading-relaxed font-body">
                      <ReactMarkdown>{insight.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
