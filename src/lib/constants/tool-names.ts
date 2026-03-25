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
  solar_return: 'Solar Return',
  transits: 'טרנזיטים',
  human_design: 'Human Design',
  personality: 'אישיות',
  document: 'מסמכים',
  question: 'שאלה',
  relationship: 'יחסים',
  synthesis: 'סינתזה',
} as const;

/**
 * מיפוי מזהה כלי לשם אייקון מ-lucide-react.
 * ניתן להשתמש בזה לטעינה דינמית של אייקונים לפי כלי.
 */
export const TOOL_ICONS: Record<string, string> = {
  numerology: 'Hash',
  astrology: 'Stars',
  palmistry: 'Hand',
  graphology: 'PenTool',
  tarot: 'Layers',
  drawing: 'Palette',
  dream: 'Moon',
  career: 'Briefcase',
  compatibility: 'Heart',
  synastry: 'Heart',
  solar_return: 'Sparkles',
  transits: 'Brain',
  human_design: 'Fingerprint',
  personality: 'Brain',
  document: 'FileText',
  question: 'HelpCircle',
  relationship: 'Heart',
  synthesis: 'Sparkles',
} as const;
