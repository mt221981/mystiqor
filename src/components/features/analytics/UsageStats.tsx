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
    format: (stats: AnalyticsStatsData) => String(stats.totalAnalyses),
  },
  {
    key: 'avgMood' as const,
    label: 'ממוצע מצב רוח',
    description: 'ציון ממוצע 1-10',
    Icon: Smile,
    format: (stats: AnalyticsStatsData) =>
      stats.avgMood > 0 ? `${stats.avgMood.toFixed(1)}/10` : '—',
  },
  {
    key: 'completedGoals' as const,
    label: 'יעדים שהושלמו',
    description: 'מתוך סה"כ היעדים',
    Icon: Target,
    format: (stats: AnalyticsStatsData) =>
      `${stats.completedGoals}/${stats.totalGoals}`,
  },
  {
    key: 'goalCompletionRate' as const,
    label: 'שיעור השלמת יעדים',
    description: 'אחוז יעדים שהסתיימו',
    Icon: TrendingUp,
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
      {STAT_CARDS.map(({ key, label, description, Icon, format }) => (
        <div
          key={key}
          className="bg-surface-container rounded-xl p-4 h-32 relative overflow-hidden border border-outline-variant/5"
          role="status"
          aria-label={`${label}: ${format(stats)}`}
        >
          {/* גלו רקע */}
          <div className="absolute -bottom-4 -start-4 w-12 h-12 bg-primary/5 rounded-full blur-xl" aria-hidden="true" />

          <div className="flex items-start justify-between">
            <div>
              <p className="font-label text-xs text-on-surface-variant">{label}</p>
              <p className="mt-1 text-3xl font-headline font-black text-on-surface">
                {format(stats)}
              </p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10"
              aria-hidden="true"
            >
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 font-label text-xs text-on-surface-variant">{description}</p>
        </div>
      ))}
    </div>
  );
}
