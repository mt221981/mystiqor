'use client';

/**
 * כרטיסי סטטיסטיקות אנליטיקה — 4 כרטיסים
 * מציג: סה"כ ניתוחים, ממוצע מצב רוח, יעדים שהושלמו, שיעור השלמת יעדים
 */

import { BarChart3, Smile, Target, TrendingUp } from 'lucide-react';

// ===== טיפוסים =====

/** נתוני סטטיסטיקות אנליטיקה */
export interface AnalyticsStatsData {
  /** סה"כ ניתוחים שבוצעו */
  totalAnalyses: number;
  /** ממוצע ציון מצב רוח */
  avgMood: number;
  /** ממוצע רמת אנרגיה */
  avgEnergy: number;
  /** סה"כ יעדים */
  totalGoals: number;
  /** יעדים שהושלמו */
  completedGoals: number;
  /** שיעור השלמת יעדים באחוזים */
  goalCompletionRate: number;
}

/** Props של כרטיסי סטטיסטיקות */
export interface UsageStatsProps {
  /** נתוני הסטטיסטיקות */
  stats: AnalyticsStatsData;
}

// ===== קבועים =====

/** הגדרות כרטיסי סטטיסטיקות */
const STAT_CARDS = [
  {
    key: 'totalAnalyses' as const,
    label: 'סה"כ ניתוחים',
    description: 'ניתוחים שבוצעו',
    Icon: BarChart3,
    gradient: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-400',
    format: (stats: AnalyticsStatsData) => String(stats.totalAnalyses),
  },
  {
    key: 'avgMood' as const,
    label: 'ממוצע מצב רוח',
    description: 'ציון ממוצע 1-10',
    Icon: Smile,
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    format: (stats: AnalyticsStatsData) =>
      stats.avgMood > 0 ? `${stats.avgMood.toFixed(1)}/10` : '—',
  },
  {
    key: 'completedGoals' as const,
    label: 'יעדים שהושלמו',
    description: 'מתוך סה"כ היעדים',
    Icon: Target,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    format: (stats: AnalyticsStatsData) =>
      `${stats.completedGoals}/${stats.totalGoals}`,
  },
  {
    key: 'goalCompletionRate' as const,
    label: 'שיעור השלמת יעדים',
    description: 'אחוז יעדים שהסתיימו',
    Icon: TrendingUp,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    format: (stats: AnalyticsStatsData) =>
      stats.totalGoals > 0 ? `${stats.goalCompletionRate.toFixed(0)}%` : '—',
  },
] as const;

// ===== קומפוננטה =====

/**
 * 4 כרטיסי סטטיסטיקות — סה"כ ניתוחים, ממוצע מצב רוח, יעדים, שיעור השלמה
 *
 * @param stats - נתוני הסטטיסטיקות מה-API
 */
export function UsageStats({ stats }: UsageStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
      {STAT_CARDS.map(({ key, label, description, Icon, gradient, iconColor, format }) => (
        <div
          key={key}
          className="rounded-xl border border-border bg-card p-5"
          role="status"
          aria-label={`${label}: ${format(stats)}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {format(stats)}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
              aria-hidden="true"
            >
              <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}
