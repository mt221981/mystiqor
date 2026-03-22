/**
 * סכמת Zod לתשובת LLM — קריאת טארוט
 * מגדיר את המבנה המצופה של תשובת המודל לפרשנות קלפי טארוט
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** קלף טארוט שנשלף עם פרשנות */
const TarotCardSchema = z.object({
  /** שם הקלף */
  name: z.string().min(1),
  /** מיקום הקלף בפריסה (עבר, הווה, עתיד וכו') */
  position: z.string().min(1),
  /** האם הקלף הפוך */
  is_reversed: z.boolean(),
  /** פרשנות הקלף בהקשר המיקום */
  meaning: z.string().min(1),
})

/** סכמת תשובת קריאת טארוט */
export const TarotResponseSchema = z.object({
  /** סיכום כללי של הקריאה */
  summary: z.string().min(1),
  /** קלפים שנשלפו בקריאה */
  cards_drawn: z.array(TarotCardSchema).min(1),
  /** סוג הקריאה (שאלה כללית, קריאת 3 קלפים, Celtic Cross וכו') */
  reading_type: z.string().min(1),
  /** תובנות מהקריאה */
  insights: z.array(InsightSchema).min(1),
})

export type TarotResponse = z.infer<typeof TarotResponseSchema>
