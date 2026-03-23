/**
 * סכמות Zod לניתוח — ולידציה לנתוני הכלים
 * מגדיר את הנתונים הנדרשים ליצירת ניתוח וסינון היסטוריה
 */

import { z } from 'zod';
import type { ToolType } from '@/types/analysis';

/**
 * רשימת סוגי הכלים הזמינים — חייב להתאים בדיוק ל-ToolType ב-types/analysis.ts
 * satisfies מבטיח התאמה לסוג בזמן הידור ללא כפילות
 */
const TOOL_TYPES = [
  'numerology',
  'astrology',
  'palmistry',
  'graphology',
  'tarot',
  'drawing',
  'dream',
  'career',
  'compatibility',
  'synastry',
  'solar_return',
  'transits',
  'human_design',
  'personality',
  'document',
  'question',
  'relationship',
  'synthesis',
] as const satisfies readonly ToolType[];

/** סכמת יצירת ניתוח חדש */
export const AnalysisCreateSchema = z.object({
  /** סוג הכלי — חייב להיות אחד מהסוגים הרשומים */
  tool_type: z.enum(TOOL_TYPES, 'סוג כלי לא תקין'),

  /** נתוני קלט הספציפיים לכלי — JSONB, ולידציה מתבצעת ברמת השירות */
  input_data: z.record(z.string(), z.unknown()),

  /** תוצאות הניתוח — JSONB */
  results: z.record(z.string(), z.unknown()),

  /** סיכום הניתוח — אופציונלי */
  summary: z.string().max(2000, 'הסיכום ארוך מדי — מקסימום 2000 תווים').optional(),

  /** ציון ביטחון כולל בין 0 ל-1 — אופציונלי */
  confidence_score: z.number().min(0, 'ציון ביטחון לא יכול להיות שלילי').max(1, 'ציון ביטחון לא יכול לעלות על 1').optional(),
});

/** סכמת שאילתת ניתוחים — לסינון והיסטוריה */
export const AnalysisQuerySchema = z.object({
  /** סנן לפי סוג כלי — אופציונלי */
  tool_type: z.enum(TOOL_TYPES).optional(),

  /** מספר תוצאות בעמוד — ברירת מחדל 20 */
  limit: z.number().int('limit חייב להיות מספר שלם').min(1, 'limit חייב להיות לפחות 1').max(100, 'limit לא יכול לעלות על 100').default(20),

  /** היסט לעימוד — ברירת מחדל 0 */
  offset: z.number().int('offset חייב להיות מספר שלם').min(0, 'offset לא יכול להיות שלילי').default(0),

  /** האם לכלול שדה results בתשובה — שימושי להשוואת ניתוחים */
  include_results: z.enum(['true', 'false']).optional(),
});

/** טיפוס נתוני יצירת ניתוח */
export type AnalysisCreate = z.infer<typeof AnalysisCreateSchema>;

/** טיפוס נתוני שאילתת ניתוחים */
export type AnalysisQuery = z.infer<typeof AnalysisQuerySchema>;
