/**
 * סכמת Zod לתשובת LLM — ניתוח אישיות
 * מגדיר את המבנה המצופה של תשובת המודל לניתוח Big Five
 */
import { z } from 'zod'
import { InsightSchema } from './common'

/** ציון לכל מימד של Big Five (0-100) */
const BigFiveScoreSchema = z.number().min(0).max(100)

/** מאפייני Big Five */
const BigFiveSchema = z.object({
  /** פתיחות לחוויות חדשות */
  openness: BigFiveScoreSchema,
  /** מצפוניות וארגון */
  conscientiousness: BigFiveScoreSchema,
  /** חברותיות ואקסטרוורסיה */
  extraversion: BigFiveScoreSchema,
  /** ידידותיות ושיתופיות */
  agreeableness: BigFiveScoreSchema,
  /** נוירוטיציזם ויציבות רגשית */
  neuroticism: BigFiveScoreSchema,
})

/** סכמת תשובת ניתוח אישיות */
export const PersonalityResponseSchema = z.object({
  /** סיכום כללי של פרופיל האישיות */
  summary: z.string().min(1),
  /** ציוני Big Five (0-100 לכל מימד) */
  big_five: BigFiveSchema,
  /** תכונות אישיות מרכזיות שזוהו */
  traits: z.array(z.string().min(1)).min(1),
  /** תובנות מניתוח האישיות */
  insights: z.array(InsightSchema).min(1),
})

export type PersonalityResponse = z.infer<typeof PersonalityResponseSchema>
