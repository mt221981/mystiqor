/**
 * סכמת Zod לתשובת LLM — ניתוח חלומות
 * מגדיר את המבנה המצופה של תשובת המודל לפרשנות חלום
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** סמל שזוהה בחלום עם פרשנות */
const DreamSymbolSchema = z.object({
  /** הסמל שנצפה בחלום */
  symbol: z.string().min(1),
  /** הפרשנות הפסיכולוגית/מיסטית של הסמל */
  interpretation: z.string().min(1),
})

/** סכמת תשובת ניתוח חלומות */
export const DreamResponseSchema = z.object({
  /** סיכום כללי של פרשנות החלום */
  summary: z.string().min(1),
  /** סמלים שזוהו בחלום ופרשנותם */
  symbols: z.array(DreamSymbolSchema),
  /** נושאים מרכזיים בחלום */
  themes: z.array(z.string().min(1)),
  /** טון רגשי כללי של החלום */
  emotional_tone: z.string().min(1),
  /** תובנות מניתוח החלום */
  insights: z.array(InsightSchema).min(1),
})

export type DreamResponse = z.infer<typeof DreamResponseSchema>
