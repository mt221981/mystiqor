/**
 * קבועי אסטרולוגיה - GEM 6
 * כל נתוני המזלות, כוכבי הלכת, אספקטים ובתים בעברית
 * מקור: BirthChart.jsx - ערכים מדויקים מהמערכת המקורית
 */

// ===== ממשקי טיפוסים =====

/** מידע על מזל בגלגל המזלות */
export interface ZodiacSignInfo {
  /** סמל האמוג'י של המזל */
  readonly emoji: string;
  /** צבע ייצוגי בפורמט hex */
  readonly color: string;
  /** שם המזל בעברית */
  readonly name: string;
  /** היסוד של המזל */
  readonly element: 'אש' | 'אדמה' | 'אוויר' | 'מים';
}

/** מפתח מזל - שם באנגלית */
export type ZodiacSignKey =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

/** מידע על כוכב לכת */
export interface PlanetInfo {
  /** סמל אסטרונומי */
  readonly symbol: string;
  /** שם בעברית */
  readonly name: string;
  /** צבע ייצוגי בפורמט hex */
  readonly color: string;
  /** משמעות אסטרולוגית בעברית */
  readonly meaning: string;
}

/** מפתח כוכב לכת */
export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

/** מידע על סוג אספקט */
export interface AspectTypeInfo {
  /** שם האספקט בעברית */
  readonly name: string;
  /** צבע ייצוגי בפורמט hex */
  readonly color: string;
  /** עוצמת האספקט (0-1) */
  readonly strength: number;
  /** משמעות האספקט בעברית */
  readonly meaning: string;
}

/** מפתח סוג אספקט */
export type AspectTypeKey =
  | 'Conjunction'
  | 'Opposition'
  | 'Trine'
  | 'Square'
  | 'Sextile'
  | 'Quincunx'
  | 'Semi-sextile';

/** מספר בית אסטרולוגי (1-12) */
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** מפתח יסוד */
export type ElementKey = 'אש' | 'אדמה' | 'אוויר' | 'מים';

// ===== קבועים =====

/**
 * מפת 12 מזלות הגלגל עם אמוג'י, צבע, שם בעברית ויסוד
 * ערכים מקוריים מ-BirthChart.jsx
 */
export const ZODIAC_SIGNS: Readonly<Record<ZodiacSignKey, ZodiacSignInfo>> = {
  Aries: { emoji: '♈', color: '#FF4444', name: 'טלה', element: 'אש' },
  Taurus: { emoji: '♉', color: '#44FF44', name: 'שור', element: 'אדמה' },
  Gemini: { emoji: '♊', color: '#FFFF44', name: 'תאומים', element: 'אוויר' },
  Cancer: { emoji: '♋', color: '#4444FF', name: 'סרטן', element: 'מים' },
  Leo: { emoji: '♌', color: '#FF8800', name: 'אריה', element: 'אש' },
  Virgo: { emoji: '♍', color: '#88FF88', name: 'בתולה', element: 'אדמה' },
  Libra: { emoji: '♎', color: '#FF44FF', name: 'מאזניים', element: 'אוויר' },
  Scorpio: { emoji: '♏', color: '#880088', name: 'עקרב', element: 'מים' },
  Sagittarius: { emoji: '♐', color: '#8844FF', name: 'קשת', element: 'אש' },
  Capricorn: { emoji: '♑', color: '#448888', name: 'גדי', element: 'אדמה' },
  Aquarius: { emoji: '♒', color: '#44FFFF', name: 'דלי', element: 'אוויר' },
  Pisces: { emoji: '♓', color: '#4488FF', name: 'דגים', element: 'מים' },
} as const;

/**
 * מפת 10 כוכבי הלכת עם סמל, שם בעברית, צבע ומשמעות
 * ערכים מקוריים מ-BirthChart.jsx
 */
export const PLANET_SYMBOLS: Readonly<Record<PlanetKey, PlanetInfo>> = {
  sun: { symbol: '☉', name: 'שמש', color: '#FFD700', meaning: 'זהות הליבה והיצירתיות' },
  moon: { symbol: '☽', name: 'ירח', color: '#C0C0C0', meaning: 'רגשות ואינטואיציה' },
  mercury: { symbol: '☿', name: 'מרקורי', color: '#FFA500', meaning: 'תקשורת וחשיבה' },
  venus: { symbol: '♀', name: 'ונוס', color: '#FF69B4', meaning: 'אהבה וערכים' },
  mars: { symbol: '♂', name: 'מאדים', color: '#FF0000', meaning: 'אנרגיה ופעולה' },
  jupiter: { symbol: '♃', name: 'צדק', color: '#4169E1', meaning: 'צמיחה והרחבה' },
  saturn: { symbol: '♄', name: 'שבתאי', color: '#8B4513', meaning: 'אחריות ומשמעת' },
  uranus: { symbol: '♅', name: 'אורנוס', color: '#00CED1', meaning: 'שינוי וחידוש' },
  neptune: { symbol: '♆', name: 'נפטון', color: '#4B0082', meaning: 'רוחניות וחלומות' },
  pluto: { symbol: '♇', name: 'פלוטו', color: '#8B0000', meaning: 'טרנספורמציה' },
} as const;

/**
 * סוגי אספקטים אסטרולוגיים עם שם בעברית, צבע, עוצמה ומשמעות
 * ערכים מקוריים מ-BirthChart.jsx
 */
export const ASPECT_TYPES: Readonly<Record<AspectTypeKey, AspectTypeInfo>> = {
  Conjunction: { name: 'חיבור', color: '#FFD700', strength: 1.0, meaning: 'מיזוג אנרגיות' },
  Opposition: { name: 'ניגוד', color: '#FF0000', strength: 0.9, meaning: 'מתח דינמי' },
  Trine: { name: 'טריגון', color: '#00FF00', strength: 0.8, meaning: 'הרמוניה זורמת' },
  Square: { name: 'ריבוע', color: '#FF6600', strength: 0.7, meaning: 'אתגר יוצר' },
  Sextile: { name: 'סקסטיל', color: '#00AAFF', strength: 0.6, meaning: 'הזדמנות' },
  Quincunx: { name: 'קווינקונקס', color: '#888888', strength: 0.4, meaning: 'התאמה נדרשת' },
  'Semi-sextile': { name: 'חצי-סקסטיל', color: '#AAAAAA', strength: 0.3, meaning: 'קשר עדין' },
} as const;

/**
 * משמעויות 12 הבתים האסטרולוגיים בעברית
 * ערכים מקוריים מ-BirthChart.jsx
 */
export const HOUSE_MEANINGS: Readonly<Record<HouseNumber, string>> = {
  1: 'האני, המסכה החיצונית',
  2: 'כסף, ערכים, רכוש',
  3: 'תקשורת, אחים, למידה',
  4: 'בית, משפחה, שורשים',
  5: 'יצירתיות, רומנטיקה, ילדים',
  6: 'עבודה, שירות, בריאות',
  7: 'שותפויות, יחסים, נישואין',
  8: 'טרנספורמציה, מיניות, משאבים משותפים',
  9: 'פילוסופיה, נסיעות, השכלה גבוהה',
  10: 'קריירה, מוניטין, הישגים',
  11: 'חברים, קהילה, חלומות',
  12: 'תת-מודע, רוחניות, בדידות',
} as const;

// ===== פונקציות עזר =====

/**
 * מחזיר את כל המזלות השייכים ליסוד מסוים
 * @param element - היסוד לחיפוש
 * @returns רשימת מפתחות מזלות
 */
export function getSignsByElement(element: ElementKey): ZodiacSignKey[] {
  return (Object.entries(ZODIAC_SIGNS) as [ZodiacSignKey, ZodiacSignInfo][])
    .filter(([, info]) => info.element === element)
    .map(([key]) => key);
}

/**
 * מחזיר את מפתחות כל המזלות כמערך
 */
export const ZODIAC_SIGN_KEYS: readonly ZodiacSignKey[] = Object.keys(ZODIAC_SIGNS) as ZodiacSignKey[];

/**
 * מחזיר את מפתחות כל כוכבי הלכת כמערך
 */
export const PLANET_KEYS: readonly PlanetKey[] = Object.keys(PLANET_SYMBOLS) as PlanetKey[];

/**
 * מחזיר את מפתחות כל סוגי האספקטים כמערך
 */
export const ASPECT_TYPE_KEYS: readonly AspectTypeKey[] = Object.keys(ASPECT_TYPES) as AspectTypeKey[];
