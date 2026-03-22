/**
 * סכמת Zod לתשובת LLM — ניתוח גרפולוגי
 * מגדיר את המבנה המצופה של תשובת המודל לניתוח כתב יד
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** מרכיב גרפולוגי עם ציון ותיאור */
const GraphologyComponentSchema = z.object({
  /** שם המרכיב (לחץ, שיפוע, גודל וכו') */
  name: z.string().min(1),
  /** ציון המרכיב (1-10) */
  score_1_to_10: z.number().int().min(1).max(10),
  /** תיאור ממצאי המרכיב */
  description: z.string().min(1),
})

/** סכמת תשובת ניתוח גרפולוגי */
export const GraphologyResponseSchema = z.object({
  /** סיכום כללי של ניתוח כתב היד */
  summary: z.string().min(1),
  /** 9 מרכיבים גרפולוגיים עיקריים שנותחו */
  components: z.array(GraphologyComponentSchema).min(1).max(12),
  /** הערכה כוללת של האישיות מכתב היד */
  overall_assessment: z.string().min(1),
  /** תכונות אישיות שזוהו */
  personality_traits: z.array(z.string().min(1)).min(1),
  /** תובנות גרפולוגיות */
  insights: z.array(InsightSchema).min(1),
})

export type GraphologyResponse = z.infer<typeof GraphologyResponseSchema>
