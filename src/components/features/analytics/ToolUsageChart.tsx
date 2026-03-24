'use client';

/**
 * תרשים עוגה — התפלגות שימוש בכלים
 * מציג אחוז שימוש לפי סוג כלי עם צבעים בסגנון המערכת
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

/** צבעים לפרוסות העוגה — סגולים */
const COLORS = [
  '#8b5cf6',
  '#6366f1',
  '#a78bfa',
  '#818cf8',
  '#c4b5fd',
  '#a5b4fc',
  '#7c3aed',
  '#4f46e5',
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
 * Tooltip מותאם — פתרון לבעיית Recharts v3 formatter types
 * מציג שם כלי ומספר שימושים
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div
      className="rounded-lg border border-border bg-card p-2.5 text-xs shadow-lg"
      dir="rtl"
    >
      <p className="font-medium text-foreground">{item.payload.name}</p>
      <p className="text-muted-foreground">{item.value} שימושים</p>
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
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">אין נתונים עדיין</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            השתמש בכלים כדי לראות את ההתפלגות
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
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
            wrapperStyle={{ fontSize: '12px', direction: 'rtl' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
