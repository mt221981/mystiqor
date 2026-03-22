/**
 * סכמת Zod לתשובת LLM — ניתוח אסטרולוגי
 * מגדיר את המבנה המצופה של תשובת המודל לניתוח מפת לידה
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** מיקום כוכב לכת בגלגל המזלות */
const PlanetPositionSchema = z.object({
  /** שם כוכב הלכת */
  planet: z.string().min(1),
  /** מזל בו נמצא כוכב הלכת */
  sign: z.string().min(1),
  /** בית אסטרולוגי (1-12) */
  house: z.number().int().min(1).max(12),
  /** מעלות בתוך המזל (0-29.99) */
  degree: z.number().min(0).max(29.99).optional(),
})

/** אספקט אסטרולוגי בין שני כוכבי לכת */
const AspectSchema = z.object({
  /** כוכב הלכת הראשון */
  planet1: z.string().min(1),
  /** כוכב הלכת השני */
  planet2: z.string().min(1),
  /** סוג האספקט (conjunction, trine, square וכו') */
  type: z.string().min(1),
  /** הסטייה מהאספקט המדויק בדרגות */
  orb: z.number().min(0).optional(),
})

/** סכמת תשובת ניתוח אסטרולוגי */
export const AstrologyResponseSchema = z.object({
  /** סיכום כללי של מפת הלידה */
  summary: z.string().min(1),
  /** מיקומי כוכבי הלכת בגלגל המזלות */
  planet_positions: z.array(PlanetPositionSchema).min(1),
  /** אספקטים בין כוכבי הלכת */
  aspects: z.array(AspectSchema),
  /** תובנות אסטרולוגיות */
  insights: z.array(InsightSchema).min(1),
  /** קאספים של הבתים (12 ערכים) — אופציונלי */
  house_cusps: z.array(z.number()).length(12).optional(),
})

export type AstrologyResponse = z.infer<typeof AstrologyResponseSchema>
