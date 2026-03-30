/**
 * ביטויי טעינה מיסטיים — מילון לפי מזהה כלי
 * מספק טקסטים בעברית לכפתורי שליחה ומצבי טעינה (skeleton)
 * מיובא על-ידי MysticLoadingText ועמודי הכלים
 */

// ===== ממשקי טיפוסים =====

/** ביטוי טעינה — גרסת כפתור וגרסת skeleton */
export interface LoadingPhrase {
  /** טקסט בתוך כפתור בזמן שליחה */
  readonly button: string;
  /** טקסט ב-skeleton / מצב המתנה כללי */
  readonly skeleton: string;
}

// ===== קבוע ראשי =====

/**
 * מפת ביטויי טעינה לפי מזהה כלי (route key)
 * המפתח תואם לחלק האחרון של נתיב ה-URL (למשל: "astrology" עבור /tools/astrology)
 */
export const MYSTIC_LOADING_PHRASES: Record<string, LoadingPhrase> = {
  astrology: { button: 'קורא את הכוכבים...', skeleton: 'קורא את הכוכבים...' },
  tarot: { button: 'שולף את הקלפים...', skeleton: 'מפענח את הסמלים...' },
  numerology: { button: 'מחשב את המספרים...', skeleton: 'חושף את הדפוסים...' },
  dream: { button: 'מפענח את החלום...', skeleton: 'מפענח את החלום...' },
  graphology: { button: 'קורא את הכתב יד...', skeleton: 'מנתח את הדפוסים...' },
  drawing: { button: 'מפרש את הציור...', skeleton: 'מפרש את הציור...' },
  synthesis: { button: 'מסנתז את הנשמה...', skeleton: 'מסנתז תובנות...' },
  'solar-return': { button: 'מחשב את השנה...', skeleton: 'קורא את הכוכבים...' },
  transits: { button: 'עוקב אחר הכוכבים...', skeleton: 'עוקב אחר הכוכבים...' },
  synastry: { button: 'בוחן את הקשר...', skeleton: 'בוחן את הקשר...' },
  compatibility: { button: 'בוחן את ההתאמה...', skeleton: 'בוחן את ההתאמה...' },
  forecast: { button: 'צופה לעתיד...', skeleton: 'צופה לעתיד...' },
  career: { button: 'קורא את הנתיב...', skeleton: 'קורא את הנתיב...' },
  relationships: { button: 'בוחן את הקשרים...', skeleton: 'בוחן את הקשרים...' },
  'human-design': { button: 'ממפה את העיצוב...', skeleton: 'ממפה את העיצוב...' },
  document: { button: 'מנתח את המסמך...', skeleton: 'מנתח את המסמך...' },
} as const;

/** ביטוי ברירת מחדל — משמש כאשר אין מפתח תואם */
export const DEFAULT_LOADING_PHRASE: LoadingPhrase = {
  button: 'מעבד...',
  skeleton: 'מעבד...',
} as const;

/**
 * מחזיר את ביטוי הטעינה לכלי נתון, או ברירת מחדל אם המפתח לא קיים
 * @param toolKey — מזהה הכלי (חלק URL אחרון)
 */
export function getLoadingPhrase(toolKey: string): LoadingPhrase {
  return MYSTIC_LOADING_PHRASES[toolKey] ?? DEFAULT_LOADING_PHRASE;
}
