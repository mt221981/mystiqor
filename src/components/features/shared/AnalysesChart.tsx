'use client';

/**
 * תרשים עמודות לניתוחים לפי סוג כלי — Recharts BarChart
 * נפרד לקובץ נפרד לשמירה על מגבלת 300 שורות
 */

import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sparkles } from 'lucide-react';

// ===== טיפוסים =====

/** נתונים לתרשים — שם כלי + ספירה */
export interface ChartDataPoint {
  name: string;
  ניתוחים: number;
}

/** Props של תרשים ניתוחים */
export interface AnalysesChartProps {
  data: ChartDataPoint[];
}

// ===== Tooltip מותאם =====

/** Props של Tooltip מותאם */
interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ value: number }>;
  readonly label?: string;
}

/**
 * Tooltip מותאם — צבעי MD3
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-3 text-xs">
      <p className="font-label font-medium text-on-surface">{label}</p>
      <p className="font-label text-on-surface-variant">{item.value} ניתוחים</p>
    </div>
  );
}

// ===== קומפוננטה =====

/**
 * תרשים עמודות לניתוחים לפי סוג כלי
 * מציג מצב ריק עם קישור ל-/tools אם אין נתונים
 */
export function AnalysesChart({ data }: AnalysesChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-on-surface-variant/30" aria-hidden="true" />
        <p className="font-body text-sm text-on-surface-variant">
          עדיין אין ניתוחים — בחר כלי כדי להתחיל
        </p>
        <Link
          href="/tools"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-container text-on-primary-container px-5 py-2 font-label text-sm font-medium transition-colors hover:opacity-90"
        >
          עבור לכלים
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-xl p-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#ccc3d8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#ccc3d8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="ניתוחים" fill="#ddb8ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
