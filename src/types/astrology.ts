/**
 * טיפוסי אסטרולוגיה - מגדיר מפות לידה, כוכבים, בתים ואספקטים
 */

/** 12 מזלות הגלגל */
export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

/** יסודות - ארבעת היסודות של המזלות */
export type Element = 'fire' | 'earth' | 'air' | 'water';

/** מודאליות - שלושת סוגי הפעולה של המזלות */
export type Modality = 'cardinal' | 'fixed' | 'mutable';

/** סוגי אספקט - זוויות בין כוכבי לכת */
export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition'
  | 'quincunx'
  | 'semi-sextile'
  | 'semi-square'
  | 'sesquiquadrate'
  | 'quintile'
  | 'bi-quintile';

/** כוכב לכת - מיקום ומצב של כוכב במפה */
export interface Planet {
  /** שם הכוכב (sun, moon, mercury, וכו') */
  name: string;
  /** אורך גיאוגרפי במעלות (0-360) */
  longitude: number;
  /** המזל בו נמצא הכוכב */
  sign: ZodiacSign;
  /** מספר הבית בו נמצא הכוכב (1-12) */
  house: number;
  /** מעלה בתוך המזל (0-30) */
  degree_in_sign: number;
  /** האם הכוכב במהלך נסיגה */
  is_retrograde: boolean;
}

/** אספקט - יחס זוויתי בין שני כוכבים */
export interface Aspect {
  /** הכוכב הראשון */
  planet1: string;
  /** הכוכב השני */
  planet2: string;
  /** סוג האספקט (conjunction, trine, וכו') */
  type: AspectType;
  /** סטיית הזווית מהמדויק (במעלות) */
  orb: number;
  /** עוצמת האספקט (0-1) - ככל שה-orb קטן יותר, העוצמה גדולה יותר */
  strength: number;
  /** האם זה אספקט מז'ורי (conjunction, sextile, square, trine, opposition) */
  is_major: boolean;
}

/** בית אסטרולוגי - חלוקת השמים ל-12 תחומי חיים */
export interface House {
  /** מספר הבית (1-12) */
  house_number: number;
  /** זווית קודקוד הבית (0-360) */
  cusp_longitude: number;
  /** המזל בקודקוד הבית */
  sign: ZodiacSign;
}

/** התפלגות לפי רכיב - כמות כוכבים בכל יסוד/מודאליות */
export interface Distribution {
  [key: string]: number;
}

/** מפת לידה מלאה - כל הנתונים האסטרולוגיים */
export interface BirthChart {
  /** רשימת כוכבי הלכת ומיקומיהם */
  planets: Planet[];
  /** 12 הבתים האסטרולוגיים */
  houses: House[];
  /** אספקטים (יחסים) בין כוכבים */
  aspects: Aspect[];
  /** מעלת העולה (Ascendant) */
  ascendant: ZodiacSign;
  /** מעלת אמצע השמים (Midheaven / MC) */
  midheaven: ZodiacSign;
  /** התפלגות כוכבים לפי יסודות */
  element_distribution: Distribution;
  /** התפלגות כוכבים לפי מודאליות */
  modality_distribution: Distribution;
  /** מזל השמש */
  sun_sign: ZodiacSign;
  /** מזל הירח */
  moon_sign: ZodiacSign;
  /** מזל העולה */
  rising_sign: ZodiacSign;
}

/** מפת מהפכה שמשית - מפה שנתית לתחזית */
export interface SolarReturnChart extends BirthChart {
  /** שנת המהפכה השמשית */
  solar_return_year: number;
  /** רגע מדויק של חזרת השמש למיקום הלידה */
  solar_return_moment: string;
  /** דיוק החישוב בשניות קשת */
  accuracy: number;
}
