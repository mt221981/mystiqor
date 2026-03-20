/**
 * טיפוסי נומרולוגיה - חישובי מספרים, גימטריה ותאימות
 */

/** מספרים נומרולוגיים - כל המספרים המרכזיים שמחושבים לאדם */
export interface NumerologyNumbers {
  /** מספר נתיב חיים - נגזר מתאריך הלידה */
  life_path: number;
  /** מספר גורל - נגזר מהשם המלא */
  destiny: number;
  /** מספר נשמה - נגזר מהתנועות בשם */
  soul: number;
  /** מספר אישיות - נגזר מהעיצורים בשם */
  personality: number;
  /** שנה אישית - מחזור שנתי (1-9) */
  personal_year: number;
  /** חודש אישי - מחזור חודשי */
  personal_month: number;
  /** יום אישי - מחזור יומי */
  personal_day: number;
}

/** תוצאת גימטריה - ערך מספרי של טקסט בעברית */
export interface GematriaResult {
  /** הטקסט המקורי שהוזן */
  original_text: string;
  /** הטקסט לאחר ניקוי (ללא רווחים, סימנים) */
  cleaned_text: string;
  /** ערך הגימטריה המלא */
  value: number;
  /** ערך מצומצם לספרה בודדת (1-9 או 11, 22, 33) */
  reduced: number;
}

/** תוצאת תאימות - השוואה נומרולוגית בין שני אנשים */
export interface CompatibilityResult {
  /** שם האדם הראשון */
  person1: string;
  /** שם האדם השני */
  person2: string;
  /** ציוני תאימות לפי קטגוריה */
  scores: CompatibilityScores;
  /** ניתוח טקסטואלי מפורט של התאימות */
  analysis: string;
}

/** ציוני תאימות - ציון לכל היבט (0-100) */
export interface CompatibilityScores {
  /** תאימות נתיב חיים */
  life_path: number;
  /** תאימות גורל */
  destiny: number;
  /** תאימות נשמה */
  soul: number;
  /** ציון תאימות כולל */
  overall: number;
}
