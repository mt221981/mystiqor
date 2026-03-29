'use client';

/**
 * תרשים התקדמות יעדים — BarChart לפי קטגוריה
 * מציג ממוצע התקדמות וספירת יעדים לכל קטגוריה
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Target } from 'lucide-react';

// ===== טיפוסים =====

/** נקודת נתון יעדים לפי קטגוריה */
interface GoalCategoryData {
  readonly category: string;
  readonly progress: number;
  readonly count: number;
}

/** Props של תרשים יעדים */
interface GoalsProgressChartProps {
  /** נתוני יעדים מקובצים לפי קטגוריה */
  readonly data: GoalCategoryData[];
}

/** נתון מורחב לתרשים */
interface ChartEntry extends GoalCategoryData {
  readonly categoryLabel: string;
  readonly color: string;
}

// ===== קבועים =====

/** תרגום קטגוריות יעדים לעברית */
const CATEGORY_LABELS: Record<string, string> = {
  health: 'בריאות',
  career: 'קריירה',
  relationships: 'מערכות יחסים',
  personal_growth: 'צמיחה אישית',
  financial: 'כלכלה',
  creative: 'יצירתיות',
  spiritual: 'רוחניות',
  education: 'לימודים',
};

/** צבעים לקטגוריות */
const CATEGORY_COLORS: Record<string, string> = {
  health: '#10b981',
  career: '#3b82f6',
  relationships: '#ec4899',
  personal_growth: '#8b5cf6',
  financial: '#f59e0b',
  creative: '#f43f5e',
  spiritual: '#6366f1',
  education: '#14b8a6',
};

/** צבע ברירת מחדל */
const DEFAULT_COLOR = '#8b5cf6';

// ===== Tooltip מותאם =====

/** Props של Tooltip מותאם */
interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{ payload: ChartEntry; value: number }>;
}

/**
 * Tooltip מותאם לתרשים יעדים — מציג אחוז התקדמות וספירת יעדים
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div
      className="bg-surface-container border border-outline-variant/20 rounded-lg p-3 shadow-lg text-xs"
      dir="rtl"
    >
      <p className="font-label font-medium text-on-surface">{item.payload.categoryLabel}</p>
      <p className="text-on-surface-variant font-label">
        {Math.round(item.value)}% התקדמות · {item.payload.count} יעדים
      </p>
    </div>
  );
}

// ===== קומפוננטה =====

/**
 * תרשים עמודות אנכי לממוצע התקדמות יעדים לפי קטגוריה
 * מציג מספר יעדים כ-label על כל עמודה
 */
export function GoalsProgressChart({ data }: GoalsProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center" dir="rtl">
        <div className="text-center">
          <Target
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">אין יעדים פעילים</p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            הוסף יעדים בדף &quot;יעדים&quot; כדי לעקוב אחר ההתקדמות
          </p>
        </div>
      </div>
    );
  }

  // הכנת נתונים עם תרגום
  const chartData: ChartEntry[] = data.map((item) => ({
    ...item,
    categoryLabel: CATEGORY_LABELS[item.category] ?? item.category,
    color: CATEGORY_COLORS[item.category] ?? DEFAULT_COLOR,
  }));

  return (
    <div dir="rtl">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{ top: 15, right: 5, bottom: 5, left: 0 }}
        >
          <XAxis
            dataKey="categoryLabel"
            tick={{ fontSize: 11, fill: '#ccc3d8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#ccc3d8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${value}%`}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="progress"
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={0.85}
              />
            ))}
            {/* ספירת יעדים על כל עמודה */}
            <LabelList
              dataKey="count"
              position="top"
              style={{
                fontSize: '11px',
                fill: 'hsl(var(--muted-foreground))',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
