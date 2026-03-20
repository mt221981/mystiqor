/**
 * עיצוב תאריכים בפורמט ישראלי
 * תומך ב-DD/MM/YYYY, שעות, תאריכים יחסיים, וברכת שעות היום
 */

/** ממיר קלט תאריך לאובייקט Date תקין */
function toDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error(`תאריך לא תקין: ${date}`);
  }
  return parsed;
}

/** מוסיף אפס מוביל למספרים חד-ספרתיים */
function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * מעצב תאריך בפורמט ישראלי DD/MM/YYYY
 * @example formatDate('2024-03-15') // '15/03/2024'
 */
export function formatDate(date: Date | string): string {
  const d = toDate(date);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * מעצב תאריך ושעה בפורמט ישראלי DD/MM/YYYY HH:mm
 * @example formatDateTime('2024-03-15T14:30:00') // '15/03/2024 14:30'
 */
export function formatDateTime(date: Date | string): string {
  const d = toDate(date);
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * מחזיר תאריך יחסי — "היום", "אתמול", או תאריך מפורמט
 * @example formatRelativeDate(new Date()) // 'היום'
 */
export function formatRelativeDate(date: Date | string): string {
  const d = toDate(date);
  const now = new Date();

  // מנרמל את שני התאריכים לחצות כדי להשוות ימים בלבד
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays === -1) return 'מחר';

  return formatDate(d);
}

/**
 * מחזיר ברכה בעברית לפי שעת היום הנוכחית
 * בוקר (05-11), צהריים (12-16), ערב (17-20), לילה (21-04)
 */
export function getHebrewDayPeriod(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 11) return 'בוקר טוב';
  if (hour >= 12 && hour <= 16) return 'צהריים טובים';
  if (hour >= 17 && hour <= 20) return 'ערב טוב';
  return 'לילה טוב';
}
