/**
 * סכמות Zod למנויים — ולידציה לעדכון מנוי ועדכון שימוש
 * משמש בנתיבי ה-API של המנוי
 */

import { z } from 'zod';

/** סוגי תוכניות המנוי הזמינות */
const PLAN_TYPES = ['free', 'basic', 'premium', 'enterprise'] as const;

/** סטטוסים אפשריים של מנוי */
const SUBSCRIPTION_STATUSES = ['trial', 'active', 'cancelled', 'expired', 'past_due'] as const;

/** סכמת הגדלת שימוש — מזהה משתמש לאימות */
export const UsageIncrementSchema = z.object({
  /** מזהה המשתמש — חייב להיות UUID תקין */
  userId: z.string().uuid('מזהה משתמש לא תקין'),
});

/** סכמת עדכון מנוי — תוכנית וסטטוס */
export const SubscriptionUpdateSchema = z.object({
  /** סוג תוכנית המנוי */
  plan_type: z.enum(PLAN_TYPES, 'סוג תוכנית לא תקין'),

  /** סטטוס המנוי */
  status: z.enum(SUBSCRIPTION_STATUSES, 'סטטוס מנוי לא תקין'),
});

/** טיפוס נתוני הגדלת שימוש */
export type UsageIncrement = z.infer<typeof UsageIncrementSchema>;

/** טיפוס נתוני עדכון מנוי */
export type SubscriptionUpdate = z.infer<typeof SubscriptionUpdateSchema>;
