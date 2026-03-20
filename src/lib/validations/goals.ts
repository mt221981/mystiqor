/**
 * סכמות Zod למטרות — ולידציה ליצירה ועדכון מטרות אישיות
 * תואם לטבלת goals ב-Supabase עם 8 קטגוריות
 */

import { z } from 'zod';

/** 8 קטגוריות מטרות — תואם לאילוץ CHECK ב-DB */
const GOAL_CATEGORIES = [
  'career',
  'relationships',
  'personal_growth',
  'health',
  'spirituality',
  'creativity',
  'finance',
  'other',
] as const;

/** סטטוסים של מטרה */
const GOAL_STATUSES = ['active', 'in_progress', 'completed'] as const;

/** סכמת יצירת מטרה חדשה */
export const GoalCreateSchema = z.object({
  /** כותרת המטרה — חובה, בין 3 ל-200 תווים */
  title: z
    .string()
    .min(3, 'כותרת חייבת להכיל לפחות 3 תווים')
    .max(200, 'כותרת לא יכולה לעלות על 200 תווים'),

  /** תיאור המטרה — אופציונלי */
  description: z.string().max(1000, 'תיאור לא יכול לעלות על 1000 תווים').optional(),

  /** קטגוריית המטרה — אחת מ-8 קטגוריות אפשריות */
  category: z.enum(GOAL_CATEGORIES, 'קטגוריית מטרה לא תקינה'),

  /** תאריך יעד — אופציונלי, פורמט ISO date */
  target_date: z.string().date('תאריך לא תקין').optional(),

  /** כלים מועדפים לעבודה על המטרה — ברירת מחדל רשימה ריקה */
  preferred_tools: z.array(z.string()).default([]),
});

/** סכמת עדכון מטרה — כל שדה אופציונלי + שדות מצב */
export const GoalUpdateSchema = GoalCreateSchema.partial().extend({
  /** התקדמות בין 0 ל-100 אחוז — אופציונלי */
  progress: z
    .number()
    .int('התקדמות חייבת להיות מספר שלם')
    .min(0, 'התקדמות לא יכולה להיות שלילית')
    .max(100, 'התקדמות לא יכולה לעלות על 100')
    .optional(),

  /** סטטוס המטרה — אופציונלי */
  status: z.enum(GOAL_STATUSES, 'סטטוס מטרה לא תקין').optional(),
});

/** טיפוס נתוני יצירת מטרה */
export type GoalCreate = z.infer<typeof GoalCreateSchema>;

/** טיפוס נתוני עדכון מטרה */
export type GoalUpdate = z.infer<typeof GoalUpdateSchema>;
