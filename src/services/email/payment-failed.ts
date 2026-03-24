/**
 * אימייל כישלון תשלום — נשלח כאשר חיוב חוזר נכשל
 * כולל קישור לעדכון אמצעי תשלום עם RTL עברית
 */

import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email will not be sent');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

/** כתובת השולח */
const FROM_ADDRESS = 'MystiQor <noreply@masapnima.co.il>';

/** נושא אימייל כישלון תשלום */
const PAYMENT_FAILED_SUBJECT = 'עדכון חשוב על תשלום ב-MystiQor';

/**
 * מייצר את תוכן HTML של אימייל כישלון תשלום
 * @param name - שם המשתמש
 * @param amount - סכום התשלום שנכשל בשקלים
 * @param subscriptionUrl - קישור לדף ניהול מנוי
 */
function buildPaymentFailedHtml(
  name: string,
  amount: number,
  subscriptionUrl: string
): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>עדכון חשוב על תשלום</title>
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #0f0a1e; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1a1033; border-radius: 16px; padding: 40px; border: 1px solid rgba(239, 68, 68, 0.3);">

    <!-- כותרת אזהרה -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
      <h1 style="color: #fca5a5; font-size: 24px; margin: 0;">בעיה בתשלום</h1>
    </div>

    <!-- גוף ההודעה -->
    <h2 style="color: #e2e8f0; font-size: 20px; margin: 0 0 16px 0;">שלום ${name},</h2>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
      לא הצלחנו לבצע את החיוב של <strong style="color: #fbbf24;">₪${amount}</strong> עבור המנוי שלך ב-MystiQor.
    </p>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
      כדי להמשיך ליהנות מכל הכלים המיסטיים, אנא עדכן את אמצעי התשלום שלך בהקדם.
    </p>

    <!-- כרטיס סטטוס -->
    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
      <p style="color: #fca5a5; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">פרטי החיוב שנכשל:</p>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">סכום: <strong>₪${amount}</strong></p>
      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">תאריך ניסיון: ${new Date().toLocaleDateString('he-IL')}</p>
    </div>

    <!-- כפתור עדכון תשלום -->
    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${subscriptionUrl}"
        style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none;"
      >
        עדכן אמצעי תשלום
      </a>
    </div>

    <!-- הערה -->
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      יש לך <strong>7 ימים</strong> לעדכן את אמצעי התשלום לפני הפסקת הגישה לתכנים המיוחדים.
    </p>

    <!-- הפרדה -->
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;" />

    <p style="color: #475569; font-size: 13px; text-align: center; margin: 0;">
      שאלות? צור קשר בכתובת support@masapnima.co.il
    </p>
    <p style="color: #475569; font-size: 13px; text-align: center; margin: 8px 0 0 0;">
      © ${new Date().getFullYear()} MystiQor. כל הזכויות שמורות.
    </p>

  </div>
</body>
</html>`;
}

/**
 * שולח אימייל על כישלון תשלום
 * מופעל על ידי Stripe webhook כאשר חיוב נכשל
 *
 * @param email - כתובת אימייל המשתמש
 * @param name - שם המשתמש לפנייה אישית
 * @param amount - סכום התשלום שנכשל בשקלים (₪)
 * @throws Error אם שליחת האימייל נכשלה
 */
export async function sendPaymentFailedEmail(
  email: string,
  name: string,
  amount: number
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mystiqor.com';
  const subscriptionUrl = `${siteUrl}/subscription`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: PAYMENT_FAILED_SUBJECT,
    html: buildPaymentFailedHtml(name, amount, subscriptionUrl),
  });

  if (error) {
    throw new Error(`שגיאה בשליחת אימייל כישלון תשלום: ${error.message}`);
  }
}
