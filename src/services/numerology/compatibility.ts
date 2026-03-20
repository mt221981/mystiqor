/**
 * תאימות נומרולוגית — מטריצת תאימות וחישוב ציוני תאימות בין שני אנשים
 *
 * מקור: GEM 2 מ-02b_GEMS.md + temp_source/base44/functions/calculateNumerologyCompatibility/entry.ts
 * ציון מקורי: 39/50 — שופר לטיפוסים מלאים ו-JSDoc עברי
 *
 * מדוע כאן: לוגיקת התאימות מופרדת מחישובי הבסיס כדי לאפשר שימוש חוזר עצמאי
 */

import { calculateNumerologyNumbers } from './calculations';
import type { CompatibilityResult, CompatibilityScores } from '@/types/numerology';

/**
 * נתוני אדם לחישוב תאימות
 */
interface PersonInput {
  /** שם מלא בעברית */
  fullName: string;
  /** תאריך לידה בפורמט YYYY-MM-DD */
  birthDate: string;
}

/**
 * מטריצת תאימות 12x12 — ציוני תאימות (0-100) לכל שילוב של מספרים נומרולוגיים
 * מפתחות: 1-9, 11 (מאסטר), 22 (מאסטר), 33 (מאסטר)
 * ערכים מדויקים מהמקור — אין להמציא ערכים
 */
export const COMPATIBILITY_MATRIX: Readonly<Record<number, Record<number, number>>> = {
  1: { 1: 70, 2: 85, 3: 90, 4: 60, 5: 95, 6: 75, 7: 55, 8: 80, 9: 65, 11: 80, 22: 70, 33: 75 },
  2: { 1: 85, 2: 80, 3: 70, 4: 90, 5: 60, 6: 95, 7: 75, 8: 85, 9: 80, 11: 90, 22: 85, 33: 95 },
  3: { 1: 90, 2: 70, 3: 85, 4: 55, 5: 100, 6: 80, 7: 70, 8: 75, 9: 90, 11: 85, 22: 75, 33: 80 },
  4: { 1: 60, 2: 90, 3: 55, 4: 85, 5: 50, 6: 95, 7: 80, 8: 90, 9: 65, 11: 75, 22: 95, 33: 85 },
  5: { 1: 95, 2: 60, 3: 100, 4: 50, 5: 80, 6: 70, 7: 85, 8: 75, 9: 95, 11: 80, 22: 70, 33: 75 },
  6: { 1: 75, 2: 95, 3: 80, 4: 95, 5: 70, 6: 85, 7: 75, 8: 80, 9: 90, 11: 85, 22: 90, 33: 100 },
  7: { 1: 55, 2: 75, 3: 70, 4: 80, 5: 85, 6: 75, 7: 80, 8: 70, 9: 75, 11: 95, 22: 85, 33: 80 },
  8: { 1: 80, 2: 85, 3: 75, 4: 90, 5: 75, 6: 80, 7: 70, 8: 85, 9: 70, 11: 80, 22: 95, 33: 85 },
  9: { 1: 65, 2: 80, 3: 90, 4: 65, 5: 95, 6: 90, 7: 75, 8: 70, 9: 80, 11: 85, 22: 80, 33: 95 },
  11: { 1: 80, 2: 90, 3: 85, 4: 75, 5: 80, 6: 85, 7: 95, 8: 80, 9: 85, 11: 90, 22: 95, 33: 100 },
  22: { 1: 70, 2: 85, 3: 75, 4: 95, 5: 70, 6: 90, 7: 85, 8: 95, 9: 80, 11: 95, 22: 90, 33: 95 },
  33: { 1: 75, 2: 95, 3: 80, 4: 85, 5: 75, 6: 100, 7: 80, 8: 85, 9: 95, 11: 100, 22: 95, 33: 100 },
} as const;

/**
 * מחזיר תיאור עברי של רמת התאימות לפי הציון הכולל
 *
 * @param score - ציון תאימות כולל (0-100)
 * @returns תיאור עברי של רמת התאימות
 */
function getCompatibilityDescription(score: number): string {
  if (score >= 80) return 'תאימות גבוהה מאוד';
  if (score >= 60) return 'תאימות טובה';
  return 'תאימות מאתגרת';
}

/**
 * מחשב ציוני תאימות נומרולוגית בין שני אנשים
 *
 * שיטה: מחשב מספרי נומרולוגיה לשני האנשים, מחפש במטריצת התאימות,
 * ומחשב ציון כולל לפי משקלות: נתיב חיים 40%, גורל 30%, נשמה 30%
 *
 * מדוע: נקודת הכניסה הציבורית לניתוח תאימות — מוחזר מ-API route
 *
 * @param person1 - שם ותאריך לידה של האדם הראשון
 * @param person2 - שם ותאריך לידה של האדם השני
 * @returns אובייקט CompatibilityResult עם ציונים ותיאור
 */
export function calculateNumerologyCompatibility(
  person1: PersonInput,
  person2: PersonInput,
): CompatibilityResult {
  const nums1 = calculateNumerologyNumbers(person1);
  const nums2 = calculateNumerologyNumbers(person2);

  // בדיקת תאימות לכל מימד — ערך ברירת מחדל 50 אם לא נמצא
  const lifePathScore = COMPATIBILITY_MATRIX[nums1.life_path]?.[nums2.life_path] ?? 50;
  const destinyScore = COMPATIBILITY_MATRIX[nums1.destiny]?.[nums2.destiny] ?? 50;
  const soulScore = COMPATIBILITY_MATRIX[nums1.soul]?.[nums2.soul] ?? 50;

  // ציון כולל — משקלות: נתיב חיים 40%, גורל 30%, נשמה 30%
  const overall = Math.round(lifePathScore * 0.4 + destinyScore * 0.3 + soulScore * 0.3);

  const scores: CompatibilityScores = {
    life_path: lifePathScore,
    destiny: destinyScore,
    soul: soulScore,
    overall,
  };

  return {
    person1: person1.fullName,
    person2: person2.fullName,
    scores,
    analysis: getCompatibilityDescription(overall),
  };
}
