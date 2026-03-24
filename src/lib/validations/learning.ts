/**
 * סכמות Zod לאימות קלטי למידה ובלוג
 * כולל LearningProgressSchema ו-BlogQuerySchema
 */

import { z } from 'zod';

/**
 * סכמת Zod לעדכון התקדמות למידה
 * מאמת discipline, topic, completed ו-quiz_score
 */
export const LearningProgressSchema = z.object({
  /** תחום הלמידה */
  discipline: z.enum(['astrology', 'drawing', 'numerology']),
  /** נושא הלמידה בתוך התחום */
  topic: z.string().min(1, 'נושא חובה').max(100, 'נושא ארוך מדי'),
  /** האם הנושא הושלם */
  completed: z.boolean(),
  /** ציון חידון אופציונלי (0-100) */
  quiz_score: z.number().int().min(0).max(100).optional(),
});

/** טיפוס מוסק מ-LearningProgressSchema */
export type LearningProgressInput = z.infer<typeof LearningProgressSchema>;

/**
 * סכמת Zod לשאילתת בלוג
 * מאמת פרמטרי סינון, חיפוש ופגינציה
 */
export const BlogQuerySchema = z.object({
  /** סינון לפי קטגוריה */
  category: z.string().optional(),
  /** חיפוש לפי כותרת */
  search: z.string().optional(),
  /** מגבלת תוצאות (ברירת מחדל: 20) */
  limit: z.coerce.number().int().min(1).max(50).default(20),
  /** דילוג על תוצאות לפגינציה (ברירת מחדל: 0) */
  offset: z.coerce.number().int().min(0).default(0),
});

/** טיפוס מוסק מ-BlogQuerySchema */
export type BlogQueryInput = z.infer<typeof BlogQuerySchema>;
