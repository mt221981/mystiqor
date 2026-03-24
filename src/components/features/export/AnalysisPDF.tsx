'use client'

/**
 * קומפוננט PDF לניתוח — מייצר מסמך PDF עם תוצאות הניתוח בעברית
 */
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles, hebrewText, TOOL_NAMES_HE } from './pdf-styles'

interface AnalysisPDFProps {
  toolType: string
  summary: string | null
  results: Record<string, unknown>
  createdAt: string
}

/**
 * מרנדר שדות תוצאה רקורסיבית עד עומק 3 — מחזיר אלמנטי Text של react-pdf
 */
function renderResults(
  data: Record<string, unknown> | unknown[],
  depth = 0
): React.ReactElement[] {
  if (depth >= 3) return []

  if (Array.isArray(data)) {
    return data
      .filter((item) => item != null)
      .map((item, idx) => (
        <Text key={idx} style={pdfStyles.body}>
          {hebrewText(`• ${String(item)}`)}
        </Text>
      ))
  }

  const entries = Object.entries(data as Record<string, unknown>)
  const elements: React.ReactElement[] = []

  for (const [key, value] of entries) {
    if (value == null) continue

    if (typeof value === 'string' || typeof value === 'number') {
      elements.push(
        <View key={key}>
          <Text style={pdfStyles.label}>{hebrewText(key)}</Text>
          <Text style={pdfStyles.body}>{hebrewText(String(value))}</Text>
        </View>
      )
    } else if (Array.isArray(value)) {
      elements.push(
        <View key={key}>
          <Text style={pdfStyles.label}>{hebrewText(key)}</Text>
          {renderResults(value as unknown[], depth + 1)}
        </View>
      )
    } else if (typeof value === 'object') {
      elements.push(
        <View key={key} style={pdfStyles.section}>
          <Text style={pdfStyles.subtitle}>{hebrewText(key)}</Text>
          {renderResults(value as Record<string, unknown>, depth + 1)}
        </View>
      )
    }
  }

  return elements
}

/** קומפוננט PDF לתוצאות ניתוח בעברית */
export function AnalysisPDF({ toolType, summary, results, createdAt }: AnalysisPDFProps) {
  const toolName = TOOL_NAMES_HE[toolType] ?? toolType
  const dateStr = new Date(createdAt).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>{hebrewText(`MystiQor — ${toolName}`)}</Text>
        <Text style={pdfStyles.label}>{hebrewText(`תאריך: ${dateStr}`)}</Text>

        {summary && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.subtitle}>{hebrewText('סיכום')}</Text>
            <Text style={pdfStyles.body}>{hebrewText(summary)}</Text>
          </View>
        )}

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subtitle}>{hebrewText('תוצאות')}</Text>
          {renderResults(results)}
        </View>

        <Text style={pdfStyles.footer}>{hebrewText('הופק על ידי MystiQor — גלה את עצמך')}</Text>
      </Page>
    </Document>
  )
}
