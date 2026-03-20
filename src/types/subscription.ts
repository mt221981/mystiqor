/**
 * טיפוסי מנוי - תוכניות, סטטוסים ומידע על המנוי
 */

/** סוג תוכנית מנוי */
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';

/** סטטוס מנוי פעיל */
export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'past_due';

/** מידע על תוכנית - מה כולל כל מנוי */
export interface PlanInfo {
  /** שם התוכנית בעברית */
  name: string;
  /** מספר ניתוחים חודשי (-1 = ללא הגבלה) */
  analyses: number;
  /** מספר פרופילי אורחים מותר */
  guestProfiles: number;
  /** רשימת תכונות זמינות בתוכנית */
  features: string[];
}

/** נתוני מנוי מלאים - תואם את הטבלה ב-DB */
export interface SubscriptionData {
  /** מזהה ייחודי */
  id: string;
  /** מזהה המשתמש */
  userId: string;
  /** סוג התוכנית */
  planType: PlanType;
  /** סטטוס נוכחי */
  status: SubscriptionStatus;
  /** מזהה לקוח ב-Stripe */
  stripeCustomerId: string | null;
  /** מזהה מנוי ב-Stripe */
  stripeSubscriptionId: string | null;
  /** מגבלת ניתוחים חודשית */
  analysesLimit: number;
  /** ניתוחים שנוצלו החודש */
  analysesUsed: number;
  /** מגבלת פרופילי אורחים */
  guestProfilesLimit: number;
  /** פרופילי אורחים שנוצלו */
  guestProfilesUsed: number;
  /** תאריך סיום תקופת ניסיון */
  trialEndDate: string | null;
  /** תאריך תחילת המנוי */
  startDate: string;
  /** תאריך סיום המנוי */
  endDate: string | null;
  /** האם לבטל בסוף התקופה */
  cancelAtPeriodEnd: boolean;
  /** האם חידוש אוטומטי */
  autoRenew: boolean;
  /** תאריך איפוס שימוש אחרון */
  lastResetDate: string;
  /** תאריך יצירה */
  createdAt: string;
  /** תאריך עדכון אחרון */
  updatedAt: string;
}

/** מפת תוכניות - הגדרות עבור כל סוג תוכנית */
export const PLAN_CONFIG: Record<PlanType, PlanInfo> = {
  free: {
    name: 'חינמי',
    analyses: 3,
    guestProfiles: 1,
    features: [
      'ניתוח נומרולוגי בסיסי',
      'מפת לידה בסיסית',
      'תובנה יומית',
      'יומן אישי',
    ],
  },
  basic: {
    name: 'בסיסי',
    analyses: 15,
    guestProfiles: 3,
    features: [
      'כל הכלים הבסיסיים',
      'ניתוח חלומות',
      'מעקב מצב רוח',
      'מאמן אישי (5 הודעות/יום)',
      'פרופילי אורחים',
    ],
  },
  premium: {
    name: 'פרימיום',
    analyses: -1,
    guestProfiles: 10,
    features: [
      'כל הכלים ללא הגבלה',
      'מאמן אישי ללא הגבלה',
      'ניתוח סינתזה',
      'ניתוח תאימות',
      'מהפכה שמשית',
      'מסעות אימון',
      'עדיפות בתור',
    ],
  },
  enterprise: {
    name: 'עסקי',
    analyses: -1,
    guestProfiles: -1,
    features: [
      'הכל בפרימיום',
      'API גישה',
      'פרופילי אורחים ללא הגבלה',
      'תמיכה ייעודית',
      'התאמה אישית',
    ],
  },
} as const;
