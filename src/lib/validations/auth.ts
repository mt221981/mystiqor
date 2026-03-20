/**
 * סכמות Zod לאימות טפסי הזדהות
 * כולל: התחברות, הרשמה, איפוס סיסמה
 * כל הודעות השגיאה בעברית
 */

import { z } from 'zod';

// ===== סכמת התחברות =====

/** סכמת אימות לטופס התחברות */
export const loginSchema = z.object({
  /** כתובת אימייל תקינה */
  email: z
    .string()
    .min(1, 'נא להזין כתובת אימייל')
    .email('כתובת אימייל לא תקינה'),

  /** סיסמה - מינימום 8 תווים */
  password: z
    .string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים'),
});

/** טיפוס נתוני התחברות */
export type LoginFormData = z.infer<typeof loginSchema>;

// ===== סכמת הרשמה =====

/** סכמת אימות לטופס הרשמה */
export const registerSchema = z
  .object({
    /** כתובת אימייל תקינה */
    email: z
      .string()
      .min(1, 'נא להזין כתובת אימייל')
      .email('כתובת אימייל לא תקינה'),

    /** סיסמה - מינימום 8 תווים, חייבת לכלול אות גדולה ומספר */
    password: z
      .string()
      .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
      .regex(/[A-Z]/, 'סיסמה חייבת לכלול לפחות אות גדולה אחת באנגלית')
      .regex(/[0-9]/, 'סיסמה חייבת לכלול לפחות מספר אחד'),

    /** אימות סיסמה - חייב להתאים לסיסמה */
    confirmPassword: z
      .string()
      .min(1, 'נא לאמת את הסיסמה'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirmPassword'],
  });

/** טיפוס נתוני הרשמה */
export type RegisterFormData = z.infer<typeof registerSchema>;

// ===== סכמת איפוס סיסמה =====

/** סכמת אימות לטופס איפוס סיסמה */
export const resetPasswordSchema = z.object({
  /** כתובת אימייל תקינה */
  email: z
    .string()
    .min(1, 'נא להזין כתובת אימייל')
    .email('כתובת אימייל לא תקינה'),
});

/** טיפוס נתוני איפוס סיסמה */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
