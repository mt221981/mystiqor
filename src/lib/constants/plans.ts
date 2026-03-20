/**
 * הגדרות תוכניות מנוי - GEM 7
 * כל התוכניות עם מגבלות ופיצ'רים בעברית
 * מקור: useSubscription.jsx - ערכים מדויקים מהמערכת המקורית
 */

import type { PlanType, PlanInfo } from '@/types/subscription';

/**
 * מפת מידע לכל תוכנית מנוי
 * analyses = -1 מציין ללא הגבלה
 * guestProfiles = -1 מציין ללא הגבלה
 */
export const PLAN_INFO: Readonly<Record<PlanType, PlanInfo>> = {
  free: {
    name: 'חינם',
    analyses: 3,
    guestProfiles: 1,
    features: ['3 ניתוחים בחודש', 'פרופיל אורח 1'],
  },
  basic: {
    name: 'בסיסי',
    analyses: 20,
    guestProfiles: 3,
    features: ['20 ניתוחים בחודש', '3 פרופילי אורחים', 'תובנות יומיות'],
  },
  premium: {
    name: 'פרימיום',
    analyses: -1,
    guestProfiles: 10,
    features: [
      'ניתוחים ללא הגבלה',
      '10 פרופילי אורחים',
      'תובנות מתקדמות',
      'גישה ל-Provenance',
    ],
  },
  enterprise: {
    name: 'ארגוני',
    analyses: -1,
    guestProfiles: -1,
    features: ['הכל ללא הגבלה', 'API Access', 'תמיכה VIP'],
  },
} as const;

/**
 * בודק אם תוכנית היא תוכנית פרימיום (premium או enterprise)
 */
export function isPremiumPlan(plan: PlanType): boolean {
  return plan === 'premium' || plan === 'enterprise';
}

/**
 * מחזיר את מספר הניתוחים הנותרים למשתמש
 * -1 מציין ללא הגבלה (מוחזר כ-Infinity)
 */
export function getRemainingAnalyses(plan: PlanType, used: number): number {
  const planInfo = PLAN_INFO[plan];
  if (planInfo.analyses === -1) return Infinity;
  return Math.max(0, planInfo.analyses - used);
}

/**
 * מחזיר את מספר פרופילי האורחים הנותרים
 * -1 מציין ללא הגבלה (מוחזר כ-Infinity)
 */
export function getRemainingGuestProfiles(plan: PlanType, used: number): number {
  const planInfo = PLAN_INFO[plan];
  if (planInfo.guestProfiles === -1) return Infinity;
  return Math.max(0, planInfo.guestProfiles - used);
}

/**
 * בודק אם למשתמש נשארו ניתוחים
 */
export function hasRemainingAnalyses(plan: PlanType, used: number): boolean {
  const planInfo = PLAN_INFO[plan];
  return planInfo.analyses === -1 || used < planInfo.analyses;
}

/**
 * מחזיר את אחוז השימוש בניתוחים (0-100)
 */
export function getUsagePercentage(plan: PlanType, used: number): number {
  const planInfo = PLAN_INFO[plan];
  if (planInfo.analyses === -1) return 0;
  return Math.min(100, Math.round((used / planInfo.analyses) * 100));
}
