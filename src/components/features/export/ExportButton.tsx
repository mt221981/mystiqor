'use client'

/**
 * כפתור ייצוא PDF — טוען את react-pdf דינמית (ssr:false) למניעת שגיאות SSR
 */
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { AnalysisPDF } from './AnalysisPDF'

/** טעינה דינמית של PDFDownloadLink — חובה כי react-pdf לא תואם SSR */
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => null }
)

interface ExportButtonProps {
  toolType: string
  summary: string | null
  results: Record<string, unknown>
  createdAt: string
}

/** כפתור ייצוא PDF עם אתחול עצלני — מרנדר PDFDownloadLink רק לאחר לחיצה */
export function ExportButton({ toolType, summary, results, createdAt }: ExportButtonProps) {
  const [showPDF, setShowPDF] = useState(false)

  if (!showPDF) {
    return (
      <button
        type="button"
        onClick={() => setShowPDF(true)}
        className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg px-3 py-2 font-label text-sm transition-colors"
      >
        ייצוא PDF
      </button>
    )
  }

  const fileName = `mystiqor-${toolType}-${new Date(createdAt).toISOString().slice(0, 10)}.pdf`

  return (
    <PDFDownloadLink
      document={
        <AnalysisPDF
          toolType={toolType}
          summary={summary}
          results={results}
          createdAt={createdAt}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <button
          type="button"
          disabled={loading}
          className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg px-3 py-2 font-label text-sm transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              מכין PDF...
            </span>
          ) : (
            'הורד PDF'
          )}
        </button>
      )}
    </PDFDownloadLink>
  )
}
