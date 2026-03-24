/**
 * סכמות Zod לאנליטיקה — ולידציה לשאילתות נתוני שימוש
 * מגדיר את הפרמטרים המותרים לשאילתת אנליטיקה אישית
 */

import { z } from 'zod';

/**
 * סכמת שאילתת אנליטיקה — פרמטר תקופה
 * ברירת מחדל: 30 יום אחרונים
 */
export const AnalyticsQuerySchema = z.object({
  /** תקופת הנתונים — 7 ימים / 30 ימים / 90 ימים / הכל */
  period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
});

/** טיפוס שאילתת אנליטיקה */
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
