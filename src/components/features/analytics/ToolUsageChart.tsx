'use client';

/**
 * תרשים עוגה — התפלגות שימוש בכלים
 * מציג אחוז שימוש לפי סוג כלי עם צבעי MD3
 * Dynamic import (SSR-incompatible) כנדרש ל-Recharts
 * Tooltip מותאם לפתרון בעיית Recharts v3 formatter types
 */

import dynamic from 'next/dynamic';
import { PieChart as LucidePieChart } from 'lucide-react';

// ===== Dynamic imports — Recharts אינו תואם SSR =====

const PieChart = dynamic(
  () => import('recharts').then((m) => m.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((m) => m.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((m) => m.Cell),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((m) => m.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);

// ===== קבועים =====

/** צבעי MD3 לפרוסות העוגה */
const COLORS = [
  '#ddb8ff', // primary
  '#c3c0ff', // secondary
  '#4edea3', // tertiary
  '#3626ce', // secondary-container
  '#ffb4ab', // error
  '#8f2de6', // primary-container
  '#007650', // tertiary-container
  '#f0dbff', // primary-fixed
];

// ===== טיפוסים =====

/** נקודת נתון לתרשים העוגה */
interface ToolDataPoint {
  /** שם הכלי בעברית */
  name: string;
  /** מספר שימושים */
  value: number;
}

/** Props של תרשים שימוש בכלים */
export interface ToolUsageChartProps {
  /** נתוני התפלגות כלים */
  data: ToolDataPoint[];
}

// ===== Tooltip מותאם =====

/** Props של Tooltip מותאם */
interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ payload: ToolDataPoint; value: number; name: string }>;
}

/**
 * Tooltip מותאם — עיצוב MD3
 * מציג שם כלי ומספר שימושים
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div
      className="bg-surface-container border border-outline-variant/20 rounded-lg p-3 text-xs"
      dir="rtl"
    >
      <p className="font-label font-medium text-on-surface">{item.payload.name}</p>
      <p className="font-label text-on-surface-variant">{item.value} שימושים</p>
    </div>
  );
}

// ===== קומפוננטה =====

/**
 * תרשים עוגה המציג התפלגות שימוש בכלי האסטרולוגיה/נומרולוגיה
 * מציג הודעת "אין נתונים" כשהרשימה ריקה
 *
 * @param data - מערך אובייקטים עם שם ומספר שימושים
 */
export function ToolUsageChart({ data }: ToolUsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center" dir="rtl">
        <div className="text-center">
          <LucidePieChart
            className="mx-auto mb-3 h-8 w-8 text-on-surface-variant/30"
            aria-hidden="true"
          />
          <p className="font-body text-sm text-on-surface-variant">אין נתונים עדיין</p>
          <p className="mt-1 font-body text-xs text-on-surface-variant/80">
            השתמש בכלים כדי לראות את ההתפלגות
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5" dir="rtl">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={90}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: '12px', direction: 'rtl', color: '#ccc3d8', fontFamily: 'Manrope, sans-serif' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
