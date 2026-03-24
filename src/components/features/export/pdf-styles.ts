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
    backgroundColor: '#201f22', // surface-container (MD3)
    padding: 40,
    direction: 'rtl',
  },
  header: {
    fontSize: 22,
    textAlign: 'right',
    marginBottom: 20,
    color: '#ddb8ff', // primary (MD3)
    borderBottomWidth: 2,
    borderBottomColor: '#8f2de6', // primary-container (MD3)
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 12,
    color: '#ddb8ff', // primary (MD3)
  },
  body: {
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 1.6,
    color: '#e5e1e4', // on-surface (MD3)
  },
  section: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4455', // outline-variant (MD3)
  },
  label: {
    fontSize: 10,
    textAlign: 'right',
    color: '#ccc3d8', // on-surface-variant (MD3)
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: 'center',
    color: '#9ca3af', // muted (neutral — acceptable in print context)
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
