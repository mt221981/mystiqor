/**
 * סכמת Zod לתשובת LLM — ניתוח ציורים
 * מגדיר את המבנה המצופה של תשובת המודל לניתוח ציור (HTP, Koppitz, FDM)
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** סוגי ניתוח ציור הנתמכים */
const AnalysisTypeSchema = z.enum(['house', 'tree', 'person', 'free'])

/** תכונה שזוהתה בציור */
const DrawingFeatureSchema = z.object({
  /** שם התכונה שזוהתה */
  name: z.string().min(1),
  /** האם התכונה נמצאת בציור */
  present: z.boolean(),
  /** המשמעות הפסיכולוגית של התכונה */
  significance: z.string().min(1),
})

/** סכמת תשובת ניתוח ציורים */
export const DrawingResponseSchema = z.object({
  /** סיכום כללי של הניתוח הפסיכולוגי */
  summary: z.string().min(1),
  /** סוג הציור שנותח */
  analysis_type: AnalysisTypeSchema,
  /** תכונות שזוהו בציור */
  features: z.array(DrawingFeatureSchema).min(1),
  /** ציון Koppitz לציורי דמות אדם (0-30) — אופציונלי */
  koppitz_score: z.number().min(0).max(30).optional(),
  /** קטגוריות FDM (Family Drawing Method) — אופציונלי */
  fdm_categories: z.array(z.string()).optional(),
  /** מדדים רגשיים שזוהו בציור */
  emotional_indicators: z.array(z.string()),
  /** תובנות פסיכולוגיות מהניתוח */
  insights: z.array(InsightSchema).min(1),
})

export type DrawingResponse = z.infer<typeof DrawingResponseSchema>
