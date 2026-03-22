'use client';

/**
 * תרשים ביוריתם — מציג 3 מחזורי סינוסואיד (פיזי/רגשי/אינטלקטואלי)
 * מחושב מתאריך הלידה לפי הנוסחה: sin(2π * diffDays / cycle)
 * מקור: BiorhythmChart.jsx מ-BASE44 — מועבר ל-TypeScript עם תמיכת RTL
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Activity } from 'lucide-react';

// ===== טיפוסים =====

/** נקודת נתון ביוריתם */
interface BiorhythmDataPoint {
  readonly date: string;
  readonly פיזי: number;
  readonly רגשי: number;
  readonly אינטלקטואלי: number;
}

/** Props של תרשים ביוריתם */
interface BiorhythmChartProps {
  /** תאריך לידה בפורמט ISO (YYYY-MM-DD) */
  readonly birthDate: string | null;
}

// ===== קבועים =====

/** אורכי מחזורי ביוריתם בימים */
const PHYSICAL_CYCLE = 23;
const EMOTIONAL_CYCLE = 28;
const INTELLECTUAL_CYCLE = 33;

/** מספר ימים להצגה */
const DAYS_TO_SHOW = 14;

// ===== פונקציות עזר =====

/**
 * מייצר נתוני ביוריתם ל-N ימים קדימה מהיום
 * @param birthDate תאריך לידה בפורמט YYYY-MM-DD
 * @param days מספר ימים להצגה (ברירת מחדל: 14)
 * @returns מערך נקודות נתונים עם ערכי ביוריתם
 */
export function generateBiorhythmData(
  birthDate: string,
  days = DAYS_TO_SHOW
): BiorhythmDataPoint[] {
  const today = new Date();
  const birth = new Date(birthDate);

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const diffMs = Math.abs(date.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const dateLabel = date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
    });

    return {
      date: dateLabel,
      פיזי: Math.round(Math.sin((2 * Math.PI * diffDays) / PHYSICAL_CYCLE) * 100),
      רגשי: Math.round(Math.sin((2 * Math.PI * diffDays) / EMOTIONAL_CYCLE) * 100),
      אינטלקטואלי: Math.round(Math.sin((2 * Math.PI * diffDays) / INTELLECTUAL_CYCLE) * 100),
    };
  });
}

// ===== קומפוננטה =====

/**
 * תרשים ביוריתם — 3 קווי סינוסואיד לפיזי / רגשי / אינטלקטואלי
 * XAxis הפוך לתמיכת RTL (Pitfall 2)
 */
export function BiorhythmChart({ birthDate }: BiorhythmChartProps) {
  const data = useMemo<BiorhythmDataPoint[]>(() => {
    if (!birthDate) return [];
    return generateBiorhythmData(birthDate);
  }, [birthDate]);

  if (!birthDate || data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center" dir="rtl">
        <div className="text-center">
          <Activity
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            הוסף תאריך לידה בפרופיל לצפייה בביוריתם
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* כותרות מקרא — מותאם RTL */}
      <div className="mb-3 flex flex-wrap gap-4 text-xs" role="list" aria-label="מקרא תרשים">
        <span className="flex items-center gap-1.5" role="listitem">
          <span
            className="inline-block h-2 w-2 rounded-full bg-rose-500"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">פיזי (23 יום)</span>
        </span>
        <span className="flex items-center gap-1.5" role="listitem">
          <span
            className="inline-block h-2 w-2 rounded-full bg-blue-500"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">רגשי (28 יום)</span>
        </span>
        <span className="flex items-center gap-1.5" role="listitem">
          <span
            className="inline-block h-2 w-2 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">אינטלקטואלי (33 יום)</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          {/* קו אפס */}
          <ReferenceLine
            y={0}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />

          {/* ציר X — הפוך ל-RTL */}
          <XAxis
            dataKey="date"
            reversed={true}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />

          {/* ציר Y — נסתר, טווח -100 עד 100 */}
          <YAxis
            hide
            domain={[-100, 100]}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              direction: 'rtl',
            }}
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : 0;
              return [`${num > 0 ? '+' : ''}${num}%`, String(name)];
            }}
          />

          {/* Legend נסתר — משתמשים במקרא מותאם למעלה */}
          <Legend className="hidden" />

          {/* 3 קווי ביוריתם */}
          <Line
            type="monotone"
            dataKey="פיזי"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={false}
            name="פיזי"
          />
          <Line
            type="monotone"
            dataKey="רגשי"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="רגשי"
          />
          <Line
            type="monotone"
            dataKey="אינטלקטואלי"
            stroke="#eab308"
            strokeWidth={2}
            dot={false}
            name="אינטלקטואלי"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="mt-2 text-center text-xs text-muted-foreground/60">
        מעל הקו — אנרגיה גבוהה · מתחת — זמן למנוחה
      </p>
    </div>
  );
}
