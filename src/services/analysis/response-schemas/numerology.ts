/**
 * סכמת Zod לתשובת LLM — ניתוח נומרולוגי
 * מגדיר את המבנה המצופה של תשובת המודל לניתוח נומרולוגיה
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** מספר נומרולוגי עם מספר ומשמעות */
const NumerologyNumberSchema = z.object({
  /** הערך המספרי */
  number: z.number().int().min(1),
  /** פרשנות והמשמעות של המספר */
  meaning: z.string().min(1),
})

/** תת-מספר נומרולוגי עם תווית ותיאור */
const SubNumberSchema = z.object({
  /** תווית המספר (שנת לידה, שם פרטי וכו') */
  label: z.string().min(1),
  /** הערך המספרי */
  value: z.number().int().min(1),
  /** תיאור המשמעות */
  description: z.string().min(1),
})

/** סכמת תשובת ניתוח נומרולוגי */
export const NumerologyResponseSchema = z.object({
  /** מספר מסלול החיים */
  life_path: NumerologyNumberSchema,
  /** מספר גורל */
  destiny: NumerologyNumberSchema,
  /** מספר נשמה */
  soul: NumerologyNumberSchema,
  /** מספר אישיות */
  personality: NumerologyNumberSchema,
  /** תת-מספרים נוספים */
  sub_numbers: z.array(SubNumberSchema),
  /** ציון תאימות (0-100) — אופציונלי */
  compatibility_score: z.number().min(0).max(100).optional(),
  /** סיכום כללי של הניתוח הנומרולוגי */
  summary: z.string().min(1),
  /** תובנות נומרולוגיות */
  insights: z.array(InsightSchema).min(1),
})

export type NumerologyResponse = z.infer<typeof NumerologyResponseSchema>
