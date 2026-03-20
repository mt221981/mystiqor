/**
 * אימייל מגבלת שימוש — נשלח כאשר המשתמש מגיע למגבלת הניתוחים החודשית
 * כולל הצעת שדרוג לפלאן גבוה יותר עם RTL עברית
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/** כתובת השולח */
const FROM_ADDRESS = 'MystiQor <noreply@masapnima.co.il>';

/** נושא אימייל מגבלת שימוש */
const USAGE_LIMIT_SUBJECT = 'הגעת למגבלת הניתוחים החודשית';

/**
 * מייצר את תוכן HTML של אימייל מגבלת שימוש
 * @param name - שם המשתמש
 * @param planName - שם הפלאן הנוכחי בעברית
 * @param siteUrl - כתובת הבסיס של האתר
 */
function buildUsageLimitHtml(
  name: string,
  planName: string,
  siteUrl: string
): string {
  const pricingUrl = `${siteUrl}/pricing`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>הגעת למגבלת הניתוחים</title>
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #0f0a1e; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1a1033; border-radius: 16px; padding: 40px; border: 1px solid rgba(124, 58, 237, 0.3);">

    <!-- כותרת -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
      <h1 style="color: #a78bfa; font-size: 24px; margin: 0;">הגעת למגבלה החודשית</h1>
    </div>

    <!-- גוף ההודעה -->
    <h2 style="color: #e2e8f0; font-size: 20px; margin: 0 0 16px 0;">שלום ${name},</h2>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
      השתמשת בכל הניתוחים הזמינים בפלאן <strong style="color: #a78bfa;">${planName}</strong> שלך החודש.
    </p>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
      כדי להמשיך ליהנות מהמלוא של כלי MystiQor, שדרג את הפלאן שלך.
    </p>

    <!-- כרטיסי השוואה -->
    <div style="margin: 0 0 24px 0;">

      <!-- פלאן בסיסי -->
      <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 12px;">
        <h3 style="color: #a78bfa; font-size: 16px; margin: 0 0 12px 0;">📦 פלאן בסיסי — ₪49/חודש</h3>
        <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; padding-right: 20px; margin: 0;">
          <li>20 ניתוחים בחודש</li>
          <li>כל 13 הכלים הזמינים</li>
          <li>שמירת היסטוריית ניתוחים</li>
          <li>3 פרופילים אישיים</li>
        </ul>
      </div>

      <!-- פלאן פרימיום -->
      <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.2)); border: 1px solid rgba(124, 58, 237, 0.5); border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="color: #c4b5fd; font-size: 16px; margin: 0 0 12px 0;">⭐ פלאן פרימיום — ₪99/חודש</h3>
          <span style="background: #7c3aed; color: white; font-size: 12px; padding: 2px 8px; border-radius: 6px;">מומלץ</span>
        </div>
        <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; padding-right: 20px; margin: 0;">
          <li>ניתוחים <strong style="color: #c4b5fd;">ללא הגבלה</strong></li>
          <li>כל 13 הכלים + כלים בלעדיים</li>
          <li>תובנות עם Provenance (מקורות)</li>
          <li>10 פרופילים אישיים</li>
          <li>ייצוא PDF + שיתוף</li>
        </ul>
      </div>

    </div>

    <!-- כפתור שדרוג -->
    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${pricingUrl}"
        style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none;"
      >
        שדרג את הפלאן שלך
      </a>
    </div>

    <!-- הערה על איפוס -->
    <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
      אם לא תשדרג, הניתוחים שלך יתאפסו ב-1 לחודש הבא.
    </p>

    <!-- הפרדה -->
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />

    <p style="color: #475569; font-size: 13px; text-align: center; margin: 0;">
      © ${new Date().getFullYear()} MystiQor. כל הזכויות שמורות.
    </p>

  </div>
</body>
</html>`;
}

/**
 * שולח אימייל על הגעה למגבלת הניתוחים החודשית
 * מופעל כאשר משתמש מגיע למגבלת analyses_used שלו
 *
 * @param email - כתובת אימייל המשתמש
 * @param name - שם המשתמש לפנייה אישית
 * @param planName - שם הפלאן הנוכחי (free, בסיסי, וכו')
 * @throws Error אם שליחת האימייל נכשלה
 */
export async function sendUsageLimitEmail(
  email: string,
  name: string,
  planName: string
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mystiqor.com';

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: USAGE_LIMIT_SUBJECT,
    html: buildUsageLimitHtml(name, planName, siteUrl),
  });

  if (error) {
    throw new Error(`שגיאה בשליחת אימייל מגבלת שימוש: ${error.message}`);
  }
}
