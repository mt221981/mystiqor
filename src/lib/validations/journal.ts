/**
 * סכמות Zod ליומן — ולידציה ליצירה ועדכון רשומות יומן
 * תואם לטבלת journal_entries ב-Supabase
 */

import { z } from 'zod';

/** סכמת יצירת רשומת יומן */
export const JournalCreateSchema = z.object({
  /** כותרת הרשומה — אופציונלי */
  title: z.string().max(200, 'כותרת לא יכולה לעלות על 200 תווים').optional(),

  /** תוכן הרשומה — חובה, בין 1 ל-10000 תווים */
  content: z
    .string()
    .min(1, 'תוכן היומן לא יכול להיות ריק')
    .max(10000, 'תוכן היומן לא יכול לעלות על 10000 תווים'),

  /** מצב רוח כללי — אופציונלי */
  mood: z.string().optional(),

  /** ציון מצב רוח — אופציונלי, בין 1 ל-10 */
  mood_score: z
    .number()
    .int('ציון מצב רוח חייב להיות מספר שלם')
    .min(1, 'ציון חייב להיות בין 1-10')
    .max(10, 'ציון חייב להיות בין 1-10')
    .optional(),

  /** רמת אנרגיה — אופציונלי, בין 1 ל-10 */
  energy_level: z
    .number()
    .int('רמת אנרגיה חייבת להיות מספר שלם')
    .min(1, 'רמת אנרגיה חייבת להיות בין 1-10')
    .max(10, 'רמת אנרגיה חייבת להיות בין 1-10')
    .optional(),

  /** פריטי הכרת תודה — ברירת מחדל רשימה ריקה */
  gratitude: z.array(z.string()).default([]),

  /** מזהי מטרות קשורות — ברירת מחדל רשימה ריקה */
  goals: z.array(z.string()).default([]),
});

/** סכמת עדכון רשומת יומן — כל שדה אופציונלי */
export const JournalUpdateSchema = JournalCreateSchema.partial();

/** טיפוס נתוני יצירת רשומת יומן */
export type JournalCreate = z.infer<typeof JournalCreateSchema>;

/** טיפוס נתוני עדכון רשומת יומן */
export type JournalUpdate = z.infer<typeof JournalUpdateSchema>;
