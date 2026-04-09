'use client';

/**
 * כרטיס תובנה יומית — גיבור הדשבורד
 * טוען תובנה אישית מ-API (LLM) ומציג מזל ומספר יומי
 * fallback למאגר סטטי אם ה-API לא זמין
 */

import { useQuery } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/** Props של כרטיס תובנה יומית */
interface DailyInsightCardProps {
  /** תאריך לידה בפורמט ISO (YYYY-MM-DD) */
  readonly birthDate: string | null;
}

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

/** מחשב מזל לפי תאריך לידה */
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
  return 'גדי';
}

/** מחשב מספר נומרולוגי יומי */
export function getNumerologyDayNumber(today: Date): number {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateString = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  let sum = dateString.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
}

/** כרטיס תובנה יומית — טוען מ-API עם fallback סטטי */
export function DailyInsightCard({ birthDate }: DailyInsightCardProps) {
  const today = new Date();
  const numerologyNumber = getNumerologyDayNumber(today);
  const zodiacSign = birthDate ? getZodiacSign(birthDate) : 'לא ידוע';

  const todayFormatted = today.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /** טעינת תובנה יומית מ-API */
  const { data: insight, isLoading } = useQuery({
    queryKey: ['daily-insight', today.toISOString().slice(0, 10)],
    queryFn: async () => {
      const res = await fetch('/api/tools/daily-insights');
      if (!res.ok) return null;
      const json = await res.json() as { data?: { title?: string; content?: string; actionable_tip?: string } };
      return json.data ?? null;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return (
    <div
      className="nebula-glow rounded-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden"
      dir="rtl"
      role="region"
      aria-label="תובנה יומית"
    >
      {/* שכבת glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative">
        {/* כותרת + תאריך */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <p className="text-xs font-label font-medium uppercase text-white/70 mb-1">
              תובנה יומית
            </p>
            <h2 className="text-2xl font-headline font-bold text-white mb-2">{todayFormatted}</h2>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                <span className="text-sm text-white/70">מזל:</span>
                <span className="text-base font-headline font-semibold text-white ms-1">{zodiacSign}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                <span className="text-sm text-white/70">מספר יומי:</span>
                <span className="text-base font-headline font-semibold text-white ms-1">{numerologyNumber}</span>
              </div>
            </div>
          </div>

          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"
            aria-hidden="true"
          >
            <Sparkles className="h-8 w-8 text-white/90" />
          </div>
        </div>

        {/* תוכן התובנה */}
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-body">טוען את התובנה שלך...</span>
            </div>
          ) : insight ? (
            <>
              {/* כותרת התובנה */}
              {insight.title && (
                <h3 className="text-lg font-headline font-bold text-amber-300">
                  {insight.title}
                </h3>
              )}
              {/* תוכן מלא */}
              {insight.content && (
                <div className="text-sm text-white/85 font-body leading-relaxed prose prose-invert max-w-none [&>p]:my-2">
                  <ReactMarkdown>{insight.content}</ReactMarkdown>
                </div>
              )}
              {/* טיפ פעולה */}
              {insight.actionable_tip && (
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 mt-3">
                  <p className="text-sm text-amber-200 font-body">
                    💡 {insight.actionable_tip}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-white/80 font-body">
              האנרגיה שלך היום מחוברת לכוחות הסתר — הקשב לאינטואיציה שלך. הכוכבים מאירים על הקשרים שלך, ויום חדש פותח דרכים שלא ציפית להן. תן למספרים ולמזלות להנחות אותך.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
