/**
 * מיזוג שמות CSS classes עם תמיכה מלאה ב-Tailwind
 * משלב clsx לתנאים עם tailwind-merge לפתרון קונפליקטים
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** ממזג classes עם פתרון אוטומטי של קונפליקטים ב-Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
