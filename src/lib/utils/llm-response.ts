/**
 * GEM 5 — ניקוי תגובות LLM
 * מטפל בכל מבנה אפשרי שחוזר מ-LLM — string, number, boolean, array, nested object
 * מחלץ טקסט שמיש באופן רקורסיבי עם סדר עדיפויות למפתחות נפוצים
 *
 * מקור: AskQuestion.jsx — שופר עם TypeScript מלא, גנריקס, ווריאנטים נוספים
 */

/** מפתחות בסדר עדיפות — LLM נוטים להחזיר ערכים במפתחות אלה */
const PRIORITY_KEYS = [
  'text',
  'value',
  'content',
  'message',
  'data',
  'description',
  'answer',
] as const;

/**
 * ממיר כל ערך שחוזר מ-LLM למחרוזת שמישה
 * עובר רקורסיבית על מערכים ואובייקטים מקוננים
 * באובייקטים — בודק קודם מפתחות נפוצים לפי סדר עדיפות
 *
 * @param value - הערך לטיפול, מכל סוג
 * @param fallback - ערך ברירת מחדל אם לא נמצא טקסט
 * @returns מחרוזת שמישה או ה-fallback
 */
export function forceToString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '\u05DB\u05DF' : '\u05DC\u05D0'; // כן / לא

  if (Array.isArray(value)) {
    for (const item of value) {
      const str = forceToString(item, '');
      if (str) return str;
    }
    return fallback;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // בדיקת מפתחות בסדר עדיפות — LLM בדרך כלל שם את התוכן באחד מהם
    for (const key of PRIORITY_KEYS) {
      if (obj[key] !== undefined) {
        const str = forceToString(obj[key], '');
        if (str) return str;
      }
    }

    // אם לא נמצא במפתחות עדיפים — ננסה את המפתח הראשון
    const objKeys = Object.keys(obj);
    if (objKeys.length > 0) {
      const firstKey = objKeys[0];
      if (firstKey !== undefined) {
        return forceToString(obj[firstKey], fallback);
      }
    }
  }

  return fallback;
}

/**
 * ממיר כל ערך למספר
 * תומך במחרוזות מספריות, booleans, ואובייקטים עם ערך מספרי
 *
 * @param value - הערך להמרה
 * @param fallback - ערך ברירת מחדל אם ההמרה נכשלת
 * @returns מספר תקין או ה-fallback
 */
export function forceToNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'boolean') return value ? 1 : 0;

  if (typeof value === 'string') {
    const parsed = Number(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const num = forceToNumber(item, NaN);
      if (!isNaN(num)) return num;
    }
    return fallback;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // בדיקת מפתחות נפוצים שמכילים ערכים מספריים
    const numericKeys = ['value', 'score', 'count', 'total', 'amount', 'number', 'data'];
    for (const key of numericKeys) {
      if (obj[key] !== undefined) {
        const num = forceToNumber(obj[key], NaN);
        if (!isNaN(num)) return num;
      }
    }

    const objKeys = Object.keys(obj);
    if (objKeys.length > 0) {
      const firstKey = objKeys[0];
      if (firstKey !== undefined) {
        const num = forceToNumber(obj[firstKey], NaN);
        if (!isNaN(num)) return num;
      }
    }
  }

  return fallback;
}

/**
 * ממיר כל ערך למערך של מחרוזות
 * מטפל במערכים מקוננים, אובייקטים, וערכים בודדים
 *
 * @param value - הערך להמרה
 * @returns מערך של מחרוזות (ריקים מסוננים)
 */
export function forceToArray(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => forceToString(item, ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value ? [value] : [];
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // בדיקת מפתחות שבדרך כלל מכילים מערכים
    const arrayKeys = ['items', 'data', 'list', 'results', 'values', 'content'];
    for (const key of arrayKeys) {
      if (Array.isArray(obj[key])) {
        return forceToArray(obj[key]);
      }
    }

    // אם זה אובייקט רגיל — נמיר את הערכים למערך מחרוזות
    const values = Object.values(obj);
    return values
      .map((item) => forceToString(item, ''))
      .filter(Boolean);
  }

  // ערך בודד — עוטפים במערך
  const str = forceToString(value, '');
  return str ? [str] : [];
}

/**
 * מנקה מערך — ממיר כל איבר למחרוזת ומסנן ריקים
 * שימושי לניקוי מערכי תגובה מ-LLM שעשויים להכיל אובייקטים מקוננים
 *
 * @param arr - הערך לניקוי (צפוי להיות מערך אבל מטפל גם באחרים)
 * @returns מערך נקי של מחרוזות
 */
export function cleanArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => forceToString(item, '')).filter(Boolean);
}
