/**
 * ולידציית תובנות יומיות — סכמת Zod למודולים ובקשות
 * מגדיר אילו סעיפים יופיעו בתובנה היומית (per D-06)
 */

import { z } from 'zod'

/**
 * סכמת מודולי תובנה יומית — שולט אילו סעיפים נכללים בתובנה
 * כל מודול ניתן להפעלה/כיבוי בנפרד על ידי המשתמש
 */
export const DailyInsightModulesSchema = z.object({
  /** סעיף אסטרולוגיה — תחזית יומית לפי מזל */
  astrology: z.boolean().default(true),
  /** סעיף נומרולוגיה — אנרגיה נומרולוגית של היום */
  numerology: z.boolean().default(true),
  /** סעיף טארוט — הקלף היומי ומסריו */
  tarot: z.boolean().default(true),
  /** סעיף המלצה — טיפ אישי לפעולה */
  recommendation: z.boolean().default(true),
})

/** טיפוס מבוסס סכמה */
export type DailyInsightModules = z.infer<typeof DailyInsightModulesSchema>

/** ערכי ברירת מחדל — כל המודולים מופעלים */
export const DEFAULT_MODULES: DailyInsightModules = {
  astrology: true,
  numerology: true,
  tarot: true,
  recommendation: true,
}
