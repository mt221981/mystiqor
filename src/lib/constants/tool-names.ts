/**
 * שמות כלים בעברית — קבוע משותף לכל הפיצ'רים שמציגים שמות כלים למשתמש
 * ייובא על ידי AnalysisHistory, HistoryFilters, AnalysisCard וכל רכיב אחר
 * שצריך תרגום מזהה tool_type לשם מוצג בעברית.
 */

/** מיפוי מזהה כלי לשם עברי מוצג */
export const TOOL_NAMES: Record<string, string> = {
  numerology: 'נומרולוגיה',
  astrology: 'אסטרולוגיה',
  palmistry: 'קריאה בכף יד',
  graphology: 'גרפולוגיה',
  tarot: 'טארוט',
  drawing: 'ניתוח ציורים',
  dream: 'חלומות',
  career: 'קריירה',
  compatibility: 'תאימות',
  synastry: 'סינסטרי',
  solar_return: 'חזרת שמש',
  transits: 'טרנזיטים',
  human_design: 'עיצוב אנושי',
  personality: 'אישיות',
  document: 'מסמכים',
  question: 'שאלה',
  relationship: 'יחסים',
  synthesis: 'סינתזה',
} as const;

