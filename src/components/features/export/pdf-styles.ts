/**
 * סגנונות PDF עם תמיכה בעברית RTL
 * משתמש ב-Heebo font ו-Unicode RLE workaround
 */
import { Font, StyleSheet } from '@react-pdf/renderer'

// רישום פונט Heebo סטטי (לא variable) — חובה להצגת עברית ב-PDF
Font.register({
  family: 'Heebo',
  src: '/fonts/Heebo-Regular.ttf',
})

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Heebo',
    backgroundColor: '#ffffff',
    padding: 40,
    direction: 'rtl',
  },
  header: {
    fontSize: 22,
    textAlign: 'right',
    marginBottom: 20,
    color: '#1a1025',
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 12,
    color: '#6b21a8',
  },
  body: {
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 1.6,
    color: '#333333',
  },
  section: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 10,
    textAlign: 'right',
    color: '#6b7280',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: 'center',
    color: '#9ca3af',
  },
})

/** עוטף טקסט עברי עם Unicode RLE כדי לכוון את הרנדור הנכון */
export function hebrewText(text: string): string {
  return `\u202B${text}`
}

/** מפת שמות כלים בעברית */
export const TOOL_NAMES_HE: Record<string, string> = {
  numerology: 'נומרולוגיה',
  astrology: 'אסטרולוגיה',
  palmistry: 'כף יד',
  graphology: 'גרפולוגיה',
  tarot: 'טארוט',
  drawing: 'ניתוח ציור',
  dream: 'פענוח חלום',
  career: 'הכוונה מקצועית',
  compatibility: 'התאמה',
  synastry: 'סינסטרי',
  solar_return: 'מפה שנתית',
  transits: 'מעברים',
  human_design: 'עיצוב אנושי',
  personality: 'אישיות',
  document: 'ניתוח מסמך',
  question: 'שאלה',
  relationship: 'מערכות יחסים',
  synthesis: 'סינתזה מיסטית',
}
