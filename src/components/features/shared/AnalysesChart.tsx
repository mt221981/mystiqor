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

// ===== קומפוננטה =====

/**
 * תרשים עמודות לניתוחים לפי סוג כלי
 * מציג מצב ריק עם קישור ל-/tools אם אין נתונים
 */
export function AnalysesChart({ data }: AnalysesChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          עדיין אין ניתוחים — בחר כלי כדי להתחיל
        </p>
        <Link
          href="/tools"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          עבור לכלים
        </Link>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="ניתוחים" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
