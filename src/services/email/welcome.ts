/**
 * אימייל ברוכים הבאים — נשלח לאחר הרשמה מוצלחת
 * משתמש ב-Resend עם תמיכה ב-RTL ועברית
 */

import { Resend } from 'resend';

/** יצירת Resend client רק כשנקרא — מונע קריסה כש-API key חסר */
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email will not be sent');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

/** כתובת השולח — ה-domain חייב להיות מאומת ב-Resend */
const FROM_ADDRESS = 'MystiQor <noreply@masapnima.co.il>';

/** נושא אימייל ברוכים הבאים */
const WELCOME_SUBJECT = 'ברוכים הבאים ל-MystiQor!';

/**
 * מייצר את תוכן HTML של אימייל ברוכים הבאים
 * @param name - שם המשתמש לפנייה אישית
 */
function buildWelcomeHtml(name: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ברוכים הבאים ל-MystiQor</title>
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #0f0a1e; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1a1033; border-radius: 16px; padding: 40px; border: 1px solid rgba(124, 58, 237, 0.3);">

    <!-- כותרת -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #a78bfa; font-size: 28px; margin: 0 0 8px 0;">MystiQor ✨</h1>
      <p style="color: #6d28d9; font-size: 14px; margin: 0;">ניתוחים מיסטיים מבוססי נתונים אישיים</p>
    </div>

    <!-- גוף ההודעה -->
    <h2 style="color: #e2e8f0; font-size: 22px; margin: 0 0 16px 0;">ברוכים הבאים, ${name}!</h2>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
      אנחנו שמחים שהצטרפת ל-MystiQor — הפלטפורמה לניתוח מיסטי המבוסס על הנתונים הייחודיים שלך.
    </p>

    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
      תוכל כעת לגשת ל-13 כלי ניתוח מיסטי מותאמים אישית עבורך, כולל:
    </p>

    <!-- רשימת יתרונות -->
    <ul style="color: #94a3b8; font-size: 15px; line-height: 2; padding-right: 20px; margin: 0 0 24px 0;">
      <li>♈ ניתוח מפת לידה אסטרולוגית מלאה</li>
      <li>🔢 חישובי נומרולוגיה מבוססי שם ותאריך לידה</li>
      <li>🎴 פרשנות קלפי טארוט אישית</li>
      <li>✋ ניתוח כף יד (פלמיסטרי)</li>
      <li>🌟 ועוד 9 כלים נוספים...</li>
    </ul>

    <!-- כפתור קריאה לפעולה -->
    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mystiqor.com'}"
        style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none;"
      >
        התחל לנתח עכשיו
      </a>
    </div>

    <!-- הפרדה -->
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;" />

    <!-- כותרת תחתונה -->
    <p style="color: #475569; font-size: 13px; text-align: center; margin: 0;">
      אם לא נרשמת ל-MystiQor, ניתן להתעלם מאימייל זה בבטחה.
    </p>
    <p style="color: #475569; font-size: 13px; text-align: center; margin: 8px 0 0 0;">
      © ${new Date().getFullYear()} MystiQor. כל הזכויות שמורות.
    </p>

  </div>
</body>
</html>`;
}

/**
 * שולח אימייל ברוכים הבאים למשתמש חדש
 * נשלח מיד לאחר הרשמה מוצלחת לפלטפורמה
 *
 * @param email - כתובת אימייל המשתמש
 * @param name - שם המשתמש לפנייה אישית
 * @throws Error אם שליחת האימייל נכשלה
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: WELCOME_SUBJECT,
    html: buildWelcomeHtml(name),
  });

  if (error) {
    throw new Error(`שגיאה בשליחת אימייל ברוכים הבאים: ${error.message}`);
  }
}
