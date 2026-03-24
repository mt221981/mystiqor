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
      <Button variant="outline" size="sm" onClick={() => setShowPDF(true)}>
        ייצוא PDF
      </Button>
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
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? 'מכין PDF...' : 'הורד PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
