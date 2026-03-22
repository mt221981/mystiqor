/**
 * סכמות Zod משותפות — חלקים שחוזרים בכל סכמות תשובות LLM
 */
import { z } from 'zod'

/** תובנה בודדת עם קטגוריה, טקסט ורמת ביטחון */
export const InsightSchema = z.object({
  category: z.string().min(1),
  text: z.string().min(1),
  confidence: z.number().min(0).max(1).optional().default(0.7),
})

/** סיכום עם טקסט ותובנות */
export const BaseSummarySchema = z.object({
  summary: z.string().min(1),
  insights: z.array(InsightSchema).min(1),
})

/** ציון ביטחון כללי */
export const ConfidenceScoreSchema = z.number().min(0).max(1)

export type Insight = z.infer<typeof InsightSchema>
export type BaseSummary = z.infer<typeof BaseSummarySchema>
