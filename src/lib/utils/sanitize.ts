/**
 * סניטציה של קלט משתמש למניעת XSS והזרקות
 * תומך בניקוי HTML ובניקוי קלט ל-LLM
 */

import DOMPurify from 'dompurify';

/**
 * מנקה HTML מסוכן — מסיר את כל התגיות והתכונות
 * בצד שרת (SSR) משתמש ב-regex, בצד לקוח משתמש ב-DOMPurify
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // בצד שרת — אין DOM, מסירים תגיות עם regex
    return dirty.replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * מנקה קלט שנשלח ל-LLM — מסיר תגיות HTML, תווים מיוחדים, וחותך לאורך מקסימלי
 * מונע prompt injection ותוכן זדוני
 */
export function sanitizeForLLM(input: string, maxLength = 2000): string {
  const cleaned = input
    .replace(/<[^>]*>/g, '') // הסרת תגיות HTML
    .replace(/[<>{}]/g, '') // הסרת תווים שעלולים לשבש prompt
    .trim();
  return cleaned.slice(0, maxLength);
}
