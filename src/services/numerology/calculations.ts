/**
 * חישובי נומרולוגיה — צמצום מספרים, נתיב חיים, ומספרי נומרולוגיה מלאים
 *
 * מקור: GEM 2 מ-02b_GEMS.md
 * תלויות: gematria.ts (calculateGematria, cleanHebrewText, HEBREW_VOWELS)
 *
 * מדוע כאן: לוגיקת הצמצום והחישוב מופרדת מהגימטריה הגולמית
 * כדי לאפשר בדיקות עצמאיות ושימוש חוזר
 */

import { calculateGematria, cleanHebrewText, HEBREW_VOWELS } from './gematria';

/**
 * נתוני אדם לחישוב נומרולוגיה
 */
interface PersonInput {
  /** שם מלא בעברית */
  fullName: string;
  /** תאריך לידה בפורמט YYYY-MM-DD */
  birthDate: string;
}

/**
 * תוצאת חישוב נומרולוגיה מלאה
 */
interface NumerologyOutput {
  /** השם שהוזן */
  name: string;
  /** מספר נתיב חיים — מתאריך הלידה */
  life_path: number;
  /** מספר גורל — מכל האותיות בשם */
  destiny: number;
  /** מספר נשמה — מהתנועות בשם בלבד */
  soul: number;
  /** מספר אישיות — מהעיצורים בשם בלבד */
  personality: number;
  /** שנה אישית — מחזור שנתי */
  personal_year: number;
}

/**
 * מצמצם מספר לספרה בודדת תוך שמירה על מספרי מאסטר (11, 22, 33)
 *
 * הלוגיקה: בכל איטרציה — אם התוצאה היא 11/22/33, מחזיר אותה מיד.
 * אחרת ממשיך לסכם ספרות עד שמגיע לספרה בודדת (1-9).
 *
 * מדוע: מספרי מאסטר הם תדרים אנרגטיים מיוחדים בנומרולוגיה — אין לצמצמם
 *
 * @param num - המספר לצמצום
 * @returns ספרה בודדת (1-9) או מספר מאסטר (11, 22, 33)
 */
export function reduceToSingleDigit(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    // בדיקת מספר מאסטר אחרי כל סיכום
    if (num === 11 || num === 22 || num === 33) return num;
  }
  return num;
}

/**
 * מחשב מספר נתיב חיים מתאריך לידה
 *
 * שיטה: מצמצם כל חלק (יום, חודש, שנה) בנפרד, מסכם, ומצמצם שוב
 * מדוע: כל חלק מהתאריך מייצג אנרגיה עצמאית שיש לצמצמה תחילה
 *
 * @param birthDate - תאריך לידה בפורמט YYYY-MM-DD
 * @returns מספר נתיב חיים (1-9 או 11, 22, 33)
 */
export function calculateLifePath(birthDate: string): number {
  const parts = birthDate.split('-').map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 0;
  const day = parts[2] ?? 0;
  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(year);
  return reduceToSingleDigit(reducedDay + reducedMonth + reducedYear);
}

/**
 * מחשב את כל מספרי הנומרולוגיה של אדם
 *
 * מחשב: גורל (מכל האותיות), נשמה (מתנועות), אישיות (מעיצורים), שנה אישית
 * מדוע: נקודת הכניסה המרכזית לחישוב פרופיל נומרולוגי מלא
 *
 * @param person - שם מלא ותאריך לידה
 * @returns אובייקט עם כל מספרי הנומרולוגיה
 */
export function calculateNumerologyNumbers(person: PersonInput): NumerologyOutput {
  const lifePath = calculateLifePath(person.birthDate);
  const cleanName = cleanHebrewText(person.fullName);

  // מספר גורל — מכל האותיות בשם
  const destiny = reduceToSingleDigit(calculateGematria(cleanName));

  // מספר נשמה — מהתנועות בשם בלבד (אנרגיה פנימית)
  const vowels = cleanName
    .split('')
    .filter((c) => HEBREW_VOWELS.includes(c))
    .join('');
  const soul = reduceToSingleDigit(calculateGematria(vowels));

  // מספר אישיות — מהעיצורים בשם בלבד (מה שמציגים לעולם)
  const consonants = cleanName
    .split('')
    .filter((c) => !HEBREW_VOWELS.includes(c))
    .join('');
  const personality = reduceToSingleDigit(calculateGematria(consonants));

  // שנה אישית — יום + חודש + שנה נוכחית
  const dateParts = person.birthDate.split('-').map(Number);
  const month = dateParts[1] ?? 0;
  const day = dateParts[2] ?? 0;
  const currentYear = new Date().getFullYear();
  const personalYear = reduceToSingleDigit(day + month + currentYear);

  return {
    name: person.fullName,
    life_path: lifePath,
    destiny,
    soul,
    personality,
    personal_year: personalYear,
  };
}
