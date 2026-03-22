import { z } from 'zod';

/**
 * סכמת בדיקת קלט לדף Human Design
 * מוגדרת כאן (מחוץ ל-route) כדי לאפשר שימוש בקומפוננטות Client ללא ייבוא server-only code.
 */
export const HumanDesignInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך: YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'פורמט שעה: HH:MM'),
  birthPlace: z.string().min(1, 'מקום לידה חובה'),
});
