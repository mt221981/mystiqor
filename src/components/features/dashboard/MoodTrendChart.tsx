'use client';

/**
 * תרשים מגמת מצב רוח — קו יחיד של mood_score לפי תקופה
 * תומך בסינון תקופה (יומי/שבועי/חודשי) ומציג מצב ריק
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import { SmilePlus } from 'lucide-react';

// ===== טיפוסים =====

/** נקודת נתון מצב רוח */
interface MoodDataPoint {
  readonly date: string;
  readonly mood_score: number;
}

/** Props של תרשים מגמת מצב רוח */
interface MoodTrendChartProps {
  /** נתוני מצב רוח ממוינים לפי תאריך */
  readonly data: MoodDataPoint[];
  /** תקופה נבחרת */
  readonly period: 'daily' | 'weekly' | 'monthly';
}

// ===== פונקציות עזר =====

/**
 * מפרמט תאריך ISO לתצוגה בעברית לפי תקופה
 * @param dateStr תאריך ISO
 * @param period תקופה
 * @returns תווית תאריך בעברית
 */
function formatDateLabel(dateStr: string, period: 'daily' | 'weekly' | 'monthly'): string {
  const date = new Date(dateStr);
  if (period === 'monthly') {
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric' });
}

// ===== קומפוננטה =====

/**
 * תרשים מגמת מצב רוח — AreaChart עם קו mood_score
 * XAxis הפוך ל-RTL, YAxis בטווח 1-10
 */
export function MoodTrendChart({ data, period }: MoodTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center" dir="rtl">
        <div className="text-center">
          <SmilePlus
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            אין נתוני מצב רוח לתקופה זו
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            עדכן מצב רוח ב&quot;מעקב&quot; כדי לראות מגמות
          </p>
        </div>
      </div>
    );
  }

  // הכנת נתונים עם תוויות פורמט
  const chartData = data.map((point) => ({
    ...point,
    dateLabel: formatDateLabel(point.date, period),
  }));

  return (
    <div dir="rtl">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          {/* הגדרת gradient */}
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />

          {/* ציר X — הפוך ל-RTL */}
          <XAxis
            dataKey="dateLabel"
            reversed={true}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />

          {/* ציר Y — טווח 1-10 */}
          <YAxis
            domain={[1, 10]}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            width={20}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              direction: 'rtl',
            }}
            formatter={(value) => {
              const num = typeof value === 'number' ? value : 0;
              return [`${num}/10`, 'מצב רוח'];
            }}
          />

          {/* Area עם gradient fill */}
          <Area
            type="monotone"
            dataKey="mood_score"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#moodGradient)"
            dot={{ fill: '#8b5cf6', r: 3 }}
            activeDot={{ r: 5, fill: '#8b5cf6' }}
            name="מצב רוח"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
