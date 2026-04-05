'use client';

/**
 * כרטיס תובנה יומית — גיבור הדשבורד
 * מציג מזל (zodiac) ומספר נומרולוגי יומי מחושבים מתאריך לידה
 * אין קריאת LLM — חישוב דטרמיניסטי בלבד (LLM יגיע ב-Phase 4)
 */

import { Sparkles } from 'lucide-react';

// ===== טיפוסים =====

/** Props של כרטיס תובנה יומית */
interface DailyInsightCardProps {
  /** תאריך לידה בפורמט ISO (YYYY-MM-DD) */
  readonly birthDate: string | null;
}

// ===== קבועים =====

/** מיפוי מזלות לשמות בעברית */
const ZODIAC_SIGNS: Array<{
  readonly name: string;
  readonly startMonth: number;
  readonly startDay: number;
  readonly endMonth: number;
  readonly endDay: number;
}> = [
  { name: 'טלה', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'שור', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'תאומים', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'סרטן', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'אריה', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'בתולה', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'מאזניים', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'עקרב', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'קשת', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: 'גדי', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: 'דלי', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'דגים', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

/** מאגר תובנות יומיות בעברית */
const INSIGHT_POOL: readonly string[] = [
  'האנרגיה שלך היום מחוברת לכוחות הסתר — הקשב לאינטואיציה שלך',
  'יום מיוחד לפתיחת דרכים חדשות — הזמן מבשיל לפעולה',
  'הכוכבים מאירים על הקשרים שלך — יום טוב לחיבורים',
  'אנרגיית ההחלמה חזקה היום — טפל בגוף ובנפש',
  'יצירתיות פורחת — אפשר לרעיונות לזרום בחופשיות',
  'יום של הגשמה — מה שהתחלת ממתין לך',
  'עוצמה פנימית גבוהה — בטח בעצמך ובדרכך',
  'הרגע הנוכחי הוא מתנה — תשומת לב מלאה היא הכוח שלך',
  'שינוי מתגנב — פתח את הלב לאפשרויות לא צפויות',
];

// ===== פונקציות עזר =====

/**
 * מחשב מזל לפי תאריך לידה
 * @param birthDate תאריך לידה בפורמט YYYY-MM-DD
 * @returns שם המזל בעברית
 */
export function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  for (const sign of ZODIAC_SIGNS) {
    if (sign.startMonth === sign.endMonth) {
      if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) {
        return sign.name;
      }
    } else if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return sign.name;
    }
  }

  return 'גדי'; // fallback לחודש דצמבר/ינואר
}

/**
 * מחשב מספר נומרולוגי יומי מתאריך היום
 * מסכם את ספרות תאריך היום (YYYYMMDD) ומצמצם ל-1-9 או מספרי מאסטר 11/22
 * @param today תאריך היום
 * @returns מספר נומרולוגי (1-9, 11, 22)
 */
export function getNumerologyDayNumber(today: Date): number {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const dateString = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  let sum = dateString.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);

  // צמצום עד ל-1-9 או מספרי מאסטר 11/22
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  return sum;
}

/**
 * מחשב את מספר היום בשנה (1-365/366)
 * @param today תאריך היום
 * @returns מספר יום בשנה
 */
function getDayOfYear(today: Date): number {
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ===== קומפוננטה =====

/**
 * כרטיס תובנה יומית — גיבור הדשבורד
 * מציג מזל, מספר יומי, ותובנה מהמאגר
 */
export function DailyInsightCard({ birthDate }: DailyInsightCardProps) {
  const today = new Date();
  const numerologyNumber = getNumerologyDayNumber(today);
  const dayOfYear = getDayOfYear(today);
  const zodiacSign = birthDate ? getZodiacSign(birthDate) : 'לא ידוע';

  // בחירת תובנה מהמאגר לפי ערך דטרמיניסטי
  const insightIndex = (dayOfYear + numerologyNumber) % INSIGHT_POOL.length;
  const insightText = INSIGHT_POOL[insightIndex];

  const todayFormatted = today.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="nebula-glow rounded-2xl p-10 md:p-12 relative overflow-hidden"
      dir="rtl"
      role="region"
      aria-label="תובנה יומית"
    >
      {/* שכבת glow עדינה */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-4">
        {/* תוכן */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-label font-medium uppercase text-white/70 mb-1">
            תובנה יומית
          </p>
          <h2 className="text-2xl font-headline font-bold text-white mb-2">{todayFormatted}</h2>

          <div className="flex items-center gap-4 mb-4">
            {/* מזל */}
            <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
              <span className="text-sm text-white/70">מזל:</span>
              <span className="text-base font-headline font-semibold text-white ms-1">{zodiacSign}</span>
            </div>

            {/* מספר יומי */}
            <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
              <span className="text-sm text-white/70">מספר יומי:</span>
              <span className="text-base font-headline font-semibold text-white ms-1">{numerologyNumber}</span>
            </div>
          </div>

          {/* תובנה */}
          <p className="text-sm text-white/80 font-body max-w-prose">
            {insightText}
          </p>
        </div>

        {/* אייקון */}
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20"
          aria-hidden="true"
        >
          <Sparkles className="h-10 w-10 text-white/90" />
        </div>
      </div>
    </div>
  );
}
