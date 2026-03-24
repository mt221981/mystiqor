/**
 * אימייל אישור הפניית חבר — נשלח למשתמש שהפנה חבר שהצטרף
 * כולל הודעת ברכה ומספר ניתוחי בונוס שנוספו לחשבון
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/** כתובת השולח — ה-domain חייב להיות מאומת ב-Resend */
const FROM_ADDRESS = 'MystiQor <noreply@masapnima.co.il>';

/** נושא אימייל הפנייה */
const REFERRAL_ACCEPTED_SUBJECT = 'חבר הצטרף דרכך ל-MystiQor!';

/**
 * מייצר את תוכן HTML של אימייל אישור הפנייה
 * @param name - שם המשתמש שהפנה
 * @param bonusAnalyses - מספר ניתוחי הבונוס שנוספו
 * @param siteUrl - כתובת הבסיס של האתר
 */
function buildReferralAcceptedHtml(
  name: string,
  bonusAnalyses: number,
  siteUrl: string
): string {
  const toolsUrl = `${siteUrl}/tools`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>חבר הצטרף דרכך ל-MystiQor!</title>
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #0f0a1e; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1a1033; border-radius: 16px; padding: 40px; border: 1px solid rgba(124, 58, 237, 0.3);">

    <!-- כותרת -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h1 style="color: #a78bfa; font-size: 26px; margin: 0;">חבר הצטרף דרכך!</h1>
    </div>

    <!-- גוף ההודעה -->
    <h2 style="color: #e2e8f0; font-size: 20px; margin: 0 0 16px 0;">כל הכבוד, ${name}!</h2>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
      חבר שהזמנת הצטרף זה עתה ל-MystiQor דרך קוד ההפניה שלך.
    </p>

    <!-- כרטיס בונוס -->
    <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.2)); border: 1px solid rgba(124, 58, 237, 0.5); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">הוספנו לחשבונך</p>
      <p style="color: #c4b5fd; font-size: 40px; font-weight: bold; margin: 0 0 8px 0;">+${bonusAnalyses}</p>
      <p style="color: #a78bfa; font-size: 16px; margin: 0;">ניתוחים בונוס</p>
    </div>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
      תוכל להשתמש בניתוחים הנוספים מיד עם כניסתך הבאה לפלטפורמה.
    </p>

    <!-- כפתור קריאה לפעולה -->
    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${toolsUrl}"
        style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none;"
      >
        התחל לנתח עכשיו
      </a>
    </div>

    <!-- הפרדה -->
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;" />

    <!-- כותרת תחתונה -->
    <p style="color: #475569; font-size: 13px; text-align: center; margin: 0;">
      המשך להפנות חברים וצבור עוד ניתוחי בונוס!
    </p>
    <p style="color: #475569; font-size: 13px; text-align: center; margin: 8px 0 0 0;">
      © ${new Date().getFullYear()} MystiQor. כל הזכויות שמורות.
    </p>

  </div>
</body>
</html>`;
}

/**
 * שולח אימייל לידיעת המשתמש שחבר שהפנה הצטרף והרוויח ניתוחי בונוס
 * נשלח אוטומטית כאשר נמען מממש קוד הפניה בהרשמה
 *
 * @param email - כתובת אימייל המשתמש המפנה
 * @param name - שם המשתמש המפנה לפנייה אישית
 * @param bonusAnalyses - מספר ניתוחי הבונוס שנוספו
 * @throws Error אם שליחת האימייל נכשלה
 */
export async function sendReferralAcceptedEmail(
  email: string,
  name: string,
  bonusAnalyses: number
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mystiqor.com';

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: REFERRAL_ACCEPTED_SUBJECT,
    html: buildReferralAcceptedHtml(name, bonusAnalyses, siteUrl),
  });

  if (error) {
    throw new Error(`שגיאה בשליחת אימייל אישור הפניה: ${error.message}`);
  }
}
