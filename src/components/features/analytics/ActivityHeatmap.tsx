'use client';

/**
 * תרשים קו — פעילות לפי תאריך
 * מציג מספר ניתוחים ביום לפי ציר זמן
 * Dynamic import (SSR-incompatible) כנדרש ל-Recharts
 * Tooltip מותאם לפתרון בעיית Recharts v3 formatter types
 */

import dynamic from 'next/dynamic';
import { Activity } from 'lucide-react';

// ===== Dynamic imports — Recharts אינו תואם SSR =====

const LineChart = dynamic(
  () => import('recharts').then((m) => m.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((m) => m.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((m) => m.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);

// ===== טיפוסים =====

/** נקודת פעילות יומית */
interface ActivityDataPoint {
  /** תאריך YYYY-MM-DD */
  date: string;
  /** מספר ניתוחים ביום */
  count: number;
}

/** Props של תרשים פעילות */
export interface ActivityHeatmapProps {
  /** נתוני פעילות לפי תאריך */
  data: ActivityDataPoint[];
}

/** נקודת נתון מורחבת לתרשים */
interface ChartDataPoint extends ActivityDataPoint {
  dateLabel: string;
}

// ===== פונקציות עזר =====

/**
 * מפרמט תאריך YYYY-MM-DD לתצוגה DD/MM (פורמט עברי)
 * @param dateStr תאריך YYYY-MM-DD
 * @returns תאריך בפורמט DD/MM
 */
function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

// ===== Tooltip מותאם =====

/** Props של Tooltip מותאם */
interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ payload: ChartDataPoint; value: number }>;
  readonly label?: string;
}

/**
 * Tooltip מותאם — פתרון לבעיית Recharts v3 formatter types
 * מציג תאריך ומספר ניתוחים
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div
      className="rounded-lg border border-border bg-card p-2.5 text-xs shadow-lg"
      dir="rtl"
    >
      <p className="font-medium text-foreground">תאריך: {label}</p>
      <p className="text-muted-foreground">{item.value} ניתוחים</p>
    </div>
  );
}

// ===== קומפוננטה =====

/**
 * תרשים קו המציג פעילות (ניתוחים) לפי תאריך
 * מציג הודעת "אין פעילות" כשהרשימה ריקה
 *
 * @param data - מערך תאריכים וספירת פעילות
 */
export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center" dir="rtl">
        <div className="text-center">
          <Activity
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">אין פעילות בתקופה הנבחרת</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            בצע ניתוחים כדי לראות את דפוסי הפעילות שלך
          </p>
        </div>
      </div>
    );
  }

  // הכנת נתונים עם תוויות תאריך
  const chartData: ChartDataPoint[] = data.map((point) => ({
    ...point,
    dateLabel: formatDateLabel(point.date),
  }));

  return (
    <div dir="rtl">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={25}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 3 }}
            activeDot={{ r: 5, fill: '#8b5cf6' }}
            name="ניתוחים"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
