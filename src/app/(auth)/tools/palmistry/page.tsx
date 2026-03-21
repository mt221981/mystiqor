'use client'

/**
 * דף כירומנטיה — העלאת תמונת כף יד → ניתוח AI
 * מדוע: ממשק ראשי לכלי הכירומנטיה — מאפשר למשתמש לצרף URL של תמונה לניתוח
 * v1: קלט URL ישיר; תמיכה באפשרות העלאה דרך /api/upload
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Hand } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'

// ===== סכמת ולידציה =====

/** סכמת ולידציה לטופס כירומנטיה */
const FormSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה — אנא הכנס URL תקין'),
})

type FormValues = z.infer<typeof FormSchema>

// ===== טיפוסי תוצאה =====

/** תוצאת API כירומנטיה */
interface PalmistryResult {
  interpretation: string
  analysis_id: string | null
}

/** ממשק תגובת API */
interface PalmistryApiResponse {
  data: PalmistryResult
}

// ===== פונקציית קריאת API =====

/**
 * שולחת בקשת POST ל-API כירומנטיה
 */
async function fetchPalmistry(input: FormValues): Promise<PalmistryResult> {
  const res = await fetch('/api/tools/palmistry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: input.imageUrl }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'שגיאה בניתוח כף היד' }))
    throw new Error((errData as { error?: string }).error ?? 'שגיאה בניתוח כף היד')
  }
  const json = (await res.json()) as PalmistryApiResponse
  return json.data
}

// ===== קומפוננטה ראשית =====

/** דף כלי הכירומנטיה */
export default function PalmistryPage() {
  const [result, setResult] = useState<PalmistryResult | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const mutation = useMutation({
    mutationFn: fetchPalmistry,
    onSuccess: (data) => {
      setResult(data)
      toast.success('הניתוח הושלם')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'שגיאה בניתוח כף היד')
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
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <PageHeader
        title="כירומנטיה"
        description="ניתוח כף יד מתמונה באמצעות AI — קווי לב, ראש, חיים וגורל"
        icon={<Hand className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'כירומנטיה' },
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
            <CardTitle className="text-lg text-purple-300">הגדרות ניתוח</CardTitle>
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
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                    aria-label="בחר תמונת כף יד"
                  />
                  {uploading && <p className="text-xs text-purple-400">מעלה תמונה...</p>}
                </div>

                {/* שדה URL */}
                <div className="space-y-1">
                  <Label htmlFor="imageUrl" className="text-gray-300">
                    או הדבק קישור לתמונת כף יד
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
                  {mutation.isPending ? 'מנתח...' : 'נתח כף יד'}
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
        >
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-base text-purple-300 flex items-center gap-2">
                <Hand className="h-4 w-4" />
                קריאה כירומנטית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                <ReactMarkdown>{result.interpretation}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
