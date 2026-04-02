/**
 * קבועי סוגי קריאות אסטרולוגיות — קובץ משותף לשרת וקליינט
 */

/** 8 סוגי קריאות אסטרולוגיות */
export const READING_TYPES = [
  { id: 'birth_chart',   label: 'מפת לידה',         additionalInput: null },
  { id: 'monthly',       label: 'תחזית חודשית',      additionalInput: 'month' },
  { id: 'yearly',        label: 'תחזית שנתית',       additionalInput: 'year' },
  { id: 'transits',      label: 'טרנזיטים',          additionalInput: 'date' },
  { id: 'compatibility', label: 'תאימות',             additionalInput: 'person2' },
  { id: 'relationship',  label: 'דינמיקת יחסים',     additionalInput: 'person2' },
  { id: 'career',        label: 'קריירה',             additionalInput: null },
  { id: 'question',      label: 'שאלה ספציפית',      additionalInput: 'question' },
] as const

/** טיפוס מזהי סוג הקריאה */
export type ReadingTypeId = (typeof READING_TYPES)[number]['id']
