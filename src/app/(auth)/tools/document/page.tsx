'use client'

/**
 * דף ניתוח מסמך — העלאת קובץ + תוצאות ניתוח AI
 * מדוע: ממשק ראשי לכלי ניתוח המסמכים (TOOL-10) — ניתוח תמונות ומסמכים עם GPT-4o Vision.
 */

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { FileText, Upload, CheckSquare, Lightbulb, BookOpen, Loader2, X } from 'lucide-react'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'

// ===== טיפוסים =====

interface DocumentInsight {
  title: string
  content: string
  category: 'practical' | 'spiritual' | 'psychological' | 'informational'
}

interface DocumentResult {
  document_type: string
  key_points: string[]
  insights: DocumentInsight[]
  action_items: string[]
  summary: string
  imageUrl: string
  analysis_id: string | null
}

// ===== קבועים =====

/** צבעי קטגוריות תובנה */
const CATEGORY_STYLES: Record<DocumentInsight['category'], { label: string; style: string }> = {
  practical: { label: 'מעשי', style: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  spiritual: { label: 'רוחני', style: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  psychological: { label: 'פסיכולוגי', style: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  informational: { label: 'מידעי', style: 'bg-green-500/20 text-green-300 border-green-500/30' },
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,application/pdf'

// ===== תוצאות =====

function DocumentResults({ result }: { result: DocumentResult }) {
  return (
    <motion.div
      initial={animations.fadeInUp.initial}
      animate={animations.fadeInUp.animate}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      <Card className="border-purple-500/20 bg-gray-900/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {result.imageUrl && (
              <img src={result.imageUrl} alt="המסמך שנותח"
                className="w-20 h-20 object-cover rounded-md border border-gray-700 shrink-0" />
            )}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-2">
                <FileText className="h-3 w-3" />{result.document_type}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-base text-blue-400 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />נקודות מפתח
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {result.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>{point}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-purple-500/20 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-base text-purple-300 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />תובנות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.insights.map((insight, i) => {
            const cat = CATEGORY_STYLES[insight.category]
            return (
              <div key={i} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cat.style}`}>{cat.label}</span>
                  <span className="text-sm text-gray-200 font-medium">{insight.title}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{insight.content}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {result.action_items.length > 0 && (
        <Card className="border-green-500/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-base text-green-400 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />פעולות מומלצות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.action_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckSquare className="h-3 w-3 text-green-400 mt-1 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

// ===== פונקציית API =====

async function fetchDocumentAnalysis(formData: FormData): Promise<DocumentResult> {
  const res = await fetch('/api/tools/document', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בניתוח המסמך' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בניתוח המסמך')
  }
  return ((await res.json()) as { data: DocumentResult }).data
}

// ===== קומפוננטה ראשית =====

/** דף ניתוח מסמך */
export default function DocumentPage() {
  const [result, setResult] = useState<DocumentResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [context, setContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) { toast.error('יש לבחור קובץ לניתוח'); return }
    setIsLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      if (context.trim()) fd.append('context', context.trim())
      setResult(await fetchDocumentAnalysis(fd))
      toast.success('ניתוח המסמך הושלם')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'שגיאה בניתוח המסמך')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="ניתוח מסמך"
        description="העלה מסמך או תמונה לקבלת תובנות AI מעמיקות"
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[{ label: 'דף הבית', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'ניתוח מסמך' }]}
      />

      <motion.div initial={animations.fadeInUp.initial} animate={animations.fadeInUp.animate} transition={{ duration: 0.4 }} className="mb-6">
        <Card className="border-purple-500/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300">העלה מסמך</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* אזור גרירה/העלאה */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileSelect(f) }}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-purple-400 bg-purple-500/10' : selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-600 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer'}`}
                >
                  <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} className="hidden" />
                  {selectedFile ? (
                    <div className="space-y-3">
                      {previewUrl && <img src={previewUrl} alt="תצוגה מקדימה" className="mx-auto max-h-48 max-w-full rounded-md object-contain" />}
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">{selectedFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveFile() }} className="text-gray-400 hover:text-red-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-10 w-10 text-gray-500 mx-auto" />
                      <p className="text-gray-300 font-medium">גרור קובץ לכאן או לחץ לבחירה</p>
                      <p className="text-xs text-gray-500">תמונות (JPG, PNG, WebP) · PDF · עד 5MB</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-300">הקשר (אופציונלי)</Label>
                  <Textarea placeholder="תאר את המסמך, שאלות ספציפיות, הקשר רלוונטי..." rows={2}
                    value={context} onChange={(e) => setContext(e.target.value)} maxLength={500} />
                </div>

                <Button type="submit" disabled={isLoading || !selectedFile} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />מנתח מסמך...</> : 'נתח מסמך'}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {result && <DocumentResults result={result} />}
    </div>
  )
}
