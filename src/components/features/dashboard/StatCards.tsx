'use client';

/**
 * כרטיסי סטטיסטיקות — 4 כרטיסים לפי D-04
 * מציג: יעדים פעילים, ציון מצב רוח, יעדים שהושלמו, תזכורות ממתינות
 */

import { Target, SmilePlus, CheckCircle, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// ===== טיפוסים =====

/** נתוני הסטטיסטיקות */
interface StatsData {
  /** מספר יעדים פעילים */
  readonly activeGoals: number;
  /** ציון מצב רוח ממוצע (7 ימים) */
  readonly currentMoodScore: number;
  /** מספר יעדים שהושלמו */
  readonly completedGoals: number;
  /** מספר תזכורות ממתינות */
  readonly pendingReminders: number;
}

/** Props של כרטיסי סטטיסטיקות */
export interface StatCardsProps {
  /** נתוני סטטיסטיקות */
  readonly stats: StatsData;
  /** האם נמצאים במצב טעינה */
  readonly isLoading: boolean;
}

// ===== קבועים =====

/** הגדרות כרטיסי סטטיסטיקות — לפי D-04 */
const STAT_CARD_DEFINITIONS = [
  {
    key: 'activeGoals' as const,
    label: 'יעדים פעילים',
    description: 'יעדים בעבודה',
    Icon: Target,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    format: (v: number) => String(v),
  },
  {
    key: 'currentMoodScore' as const,
    label: 'ציון מצב רוח',
    description: 'ממוצע 7 ימים',
    Icon: SmilePlus,
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    format: (v: number) => (v > 0 ? `${v.toFixed(1)}/10` : '—'),
  },
  {
    key: 'completedGoals' as const,
    label: 'יעדים שהושלמו',
    description: 'סה״כ שהושלמו',
    Icon: CheckCircle,
    gradient: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-400',
    format: (v: number) => String(v),
  },
  {
    key: 'pendingReminders' as const,
    label: 'תזכורות ממתינות',
    description: 'לא נענו',
    Icon: Bell,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    format: (v: number) => String(v),
  },
] as const;

// ===== קומפוננטות עזר =====

/** כרטיס Skeleton לזמן טעינה */
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-14" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

// ===== קומפוננטה =====

/**
 * 4 כרטיסי סטטיסטיקות — לפי D-04
 * מציג Skeleton בזמן טעינה
 */
export function StatCards({ stats, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
      {STAT_CARD_DEFINITIONS.map(
        ({ key, label, description, Icon, gradient, iconColor, format }) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-card p-5"
            role="status"
            aria-label={`${label}: ${format(stats[key])}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {format(stats[key])}
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
        )
      )}
    </div>
  );
}
