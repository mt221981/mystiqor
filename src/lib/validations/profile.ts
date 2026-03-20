/**
 * סכמות Zod לאימות טפסי פרופיל
 * כולל: פרופיל מלא, שלבי onboarding
 * כל הודעות השגיאה בעברית
 * תואם Hebrew-friendly validation (תווי Unicode)
 */

import { z } from 'zod';

// ===== קבועים =====

/** ערכי מגדר אפשריים */
const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'] as const;

/** פורמט שעה תקין (HH:mm) */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** פורמט תאריך תקין (YYYY-MM-DD) */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ===== סכמת פרופיל מלא =====

/** סכמת אימות לפרופיל משתמש מלא */
export const profileSchema = z.object({
  /** שם מלא - מינימום 2 תווים, תומך בעברית */
  full_name: z
    .string()
    .min(2, 'שם חייב להכיל לפחות 2 תווים')
    .max(100, 'שם לא יכול להכיל יותר מ-100 תווים'),

  /** תאריך לידה בפורמט YYYY-MM-DD */
  birth_date: z
    .string()
    .min(1, 'נא להזין תאריך לידה')
    .regex(DATE_REGEX, 'פורמט תאריך לא תקין (YYYY-MM-DD)')
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) && parsed < new Date();
      },
      'תאריך לידה חייב להיות בעבר',
    ),

  /** שעת לידה בפורמט HH:mm (אופציונלי) */
  birth_time: z
    .string()
    .regex(TIME_REGEX, 'פורמט שעה לא תקין (HH:mm)')
    .optional()
    .or(z.literal('')),

  /** מקום לידה (אופציונלי) */
  birth_place: z
    .string()
    .max(200, 'מקום לידה לא יכול להכיל יותר מ-200 תווים')
    .optional()
    .or(z.literal('')),

  /** מגדר (אופציונלי) */
  gender: z
    .enum(GENDER_VALUES, {
      error: 'ערך מגדר לא תקין',
    })
    .optional(),

  /** דיסציפלינות מועדפות */
  disciplines: z
    .array(z.string().min(1, 'ערך דיסציפלינה לא יכול להיות ריק'))
    .default([]),

  /** תחומי עניין */
  focus_areas: z
    .array(z.string().min(1, 'ערך תחום עניין לא יכול להיות ריק'))
    .default([]),

  /** יעדים אישיים */
  personal_goals: z
    .array(z.string().min(1, 'ערך יעד לא יכול להיות ריק'))
    .default([]),
});

/** טיפוס נתוני פרופיל מלא */
export type ProfileFormData = z.infer<typeof profileSchema>;

// ===== סכמות שלבי Onboarding =====

/**
 * שלב 1 - ברוכים הבאים
 * בשלב זה לא נדרשים נתונים - שלב מידע בלבד
 */
export const onboardingStep1Schema = z.object({});

/** טיפוס נתוני שלב 1 */
export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>;

/**
 * שלב 2 - ספר לי עליך
 * שם מלא ותאריך לידה חובה, שעה ומקום אופציונלי
 */
export const onboardingStep2Schema = z.object({
  /** שם מלא בעברית - חובה */
  full_name: z
    .string()
    .min(2, 'שם חייב להכיל לפחות 2 תווים')
    .max(100, 'שם לא יכול להכיל יותר מ-100 תווים'),

  /** תאריך לידה - חובה */
  birth_date: z
    .string()
    .min(1, 'נא להזין תאריך לידה')
    .regex(DATE_REGEX, 'פורמט תאריך לא תקין')
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) && parsed < new Date();
      },
      'תאריך לידה חייב להיות בעבר',
    ),

  /** שעת לידה - אופציונלי */
  birth_time: z
    .string()
    .regex(TIME_REGEX, 'פורמט שעה לא תקין (HH:mm)')
    .optional()
    .or(z.literal('')),

  /** מקום לידה - אופציונלי */
  birth_place: z
    .string()
    .max(200, 'מקום לידה לא יכול להכיל יותר מ-200 תווים')
    .optional()
    .or(z.literal('')),
});

/** טיפוס נתוני שלב 2 */
export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>;

/**
 * שלב 4 - בוא נתחיל
 * בחירת דיסציפלינות ותחומי עניין (חובה לפחות אחד מכל)
 */
export const onboardingStep4Schema = z.object({
  /** דיסציפלינות מועדפות - חובה לפחות אחת */
  disciplines: z
    .array(z.string())
    .min(1, 'נא לבחור לפחות כלי אחד'),

  /** תחומי עניין - חובה לפחות אחד */
  focus_areas: z
    .array(z.string())
    .min(1, 'נא לבחור לפחות תחום אחד'),

  /** יעדים אישיים - אופציונלי */
  personal_goals: z
    .array(z.string())
    .default([]),
});

/** טיפוס נתוני שלב 4 */
export type OnboardingStep4Data = z.infer<typeof onboardingStep4Schema>;
