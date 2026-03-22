/**
 * קבועים לשאלון Big Five — חמשת הממדים הגדולים של האישיות
 * כולל 20 שאלות עבריות עם סימון פריטים הפוכים (reversed scoring)
 * מדוע: מספק את הבסיס הפסיכולוגי המאומת לכלי ניתוח האישיות
 */

/** חמשת ממדי האישיות OCEAN */
export type BigFiveDimension =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism'

/** שאלה בשאלון Big Five */
export interface BigFiveQuestion {
  /** מזהה ייחודי (1-20) */
  id: number
  /** טקסט השאלה בעברית */
  text: string
  /** הממד שאליו שייכת השאלה */
  dimension: BigFiveDimension
  /** האם הפריט הפוך — ציון 6 - ציון_גולמי */
  isReversed: boolean
}

/**
 * 20 שאלות Big Five בעברית — 4 שאלות לכל ממד
 * פריטים הפוכים מסומנים ב-isReversed: true
 */
export const BIG_FIVE_QUESTIONS: readonly BigFiveQuestion[] = [
  // ===== פתיחות לניסיון (Openness) =====
  {
    id: 1,
    text: 'אני נהנה/ת לחוות דברים חדשים',
    dimension: 'openness',
    isReversed: false,
  },
  {
    id: 2,
    text: 'יש לי דמיון חי ועשיר',
    dimension: 'openness',
    isReversed: false,
  },
  {
    id: 3,
    text: 'אני מעדיף/ה שגרה יציבה על פני הרפתקאות',
    dimension: 'openness',
    isReversed: true,
  },
  {
    id: 4,
    text: 'אני מתעניין/ת ברעיונות חדשניים ויצירתיים',
    dimension: 'openness',
    isReversed: false,
  },

  // ===== מצפוניות (Conscientiousness) =====
  {
    id: 5,
    text: 'אני מתכנן/ת את המשימות שלי מראש',
    dimension: 'conscientiousness',
    isReversed: false,
  },
  {
    id: 6,
    text: 'אני שמה לב לפרטים הקטנים',
    dimension: 'conscientiousness',
    isReversed: false,
  },
  {
    id: 7,
    text: 'לפעמים אני משאיר/ה דברים לרגע האחרון',
    dimension: 'conscientiousness',
    isReversed: true,
  },
  {
    id: 8,
    text: 'אני עקבי/ת בביצוע ההתחייבויות שלי',
    dimension: 'conscientiousness',
    isReversed: false,
  },

  // ===== מוחצנות (Extraversion) =====
  {
    id: 9,
    text: 'אני נהנה/ת מאירועים חברתיים',
    dimension: 'extraversion',
    isReversed: false,
  },
  {
    id: 10,
    text: 'אני יוזם/ת שיחות עם אנשים חדשים',
    dimension: 'extraversion',
    isReversed: false,
  },
  {
    id: 11,
    text: 'אני מעדיף/ה לבלות לבד מאשר בקבוצה',
    dimension: 'extraversion',
    isReversed: true,
  },
  {
    id: 12,
    text: 'אני מרגיש/ה אנרגטי/ת כשאני מוקף/ת באנשים',
    dimension: 'extraversion',
    isReversed: false,
  },

  // ===== נעימות (Agreeableness) =====
  {
    id: 13,
    text: 'אני מתחשב/ת ברגשות של אחרים',
    dimension: 'agreeableness',
    isReversed: false,
  },
  {
    id: 14,
    text: 'אני נוטה לסמוך על אנשים',
    dimension: 'agreeableness',
    isReversed: false,
  },
  {
    id: 15,
    text: 'לפעמים אני ביקורתי/ת כלפי אחרים',
    dimension: 'agreeableness',
    isReversed: true,
  },
  {
    id: 16,
    text: 'אני מוכן/ה לעזור גם על חשבון הזמן שלי',
    dimension: 'agreeableness',
    isReversed: false,
  },

  // ===== רגישות רגשית (Neuroticism) =====
  {
    id: 17,
    text: 'אני חש/ה מתח בקלות',
    dimension: 'neuroticism',
    isReversed: false,
  },
  {
    id: 18,
    text: 'אני נוטה לדאוג יותר מדי',
    dimension: 'neuroticism',
    isReversed: false,
  },
  {
    id: 19,
    text: 'בדרך כלל אני שלו/ה ורגוע/ה',
    dimension: 'neuroticism',
    isReversed: true,
  },
  {
    id: 20,
    text: 'לפעמים אני מרגיש/ה מוצף/ת מרגשות',
    dimension: 'neuroticism',
    isReversed: false,
  },
] as const

/** תוויות עבריות לממדי Big Five */
export const DIMENSION_LABELS: Record<BigFiveDimension, string> = {
  openness: 'פתיחות',
  conscientiousness: 'מצפוניות',
  extraversion: 'מוחצנות',
  agreeableness: 'נעימות',
  neuroticism: 'רגישות רגשית',
}
