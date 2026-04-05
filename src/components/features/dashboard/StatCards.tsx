'use client';

/**
 * כרטיסי סטטיסטיקות — 4 כרטיסים לפי D-04
 * מציג: יעדים פעילים, ציון מצב רוח, יעדים שהושלמו, תזכורות ממתינות
 */

import { Target, Smile, Award, AlarmClock } from 'lucide-react';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';

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

/** הגדרות כרטיסי סטטיסטיקות — לפי D-04, עם MD3 tokens */
const STAT_CARD_DEFINITIONS = [
  {
    key: 'activeGoals' as const,
    label: 'יעדים פעילים',
    description: 'יעדים בעבודה',
    Icon: Target,
    format: (v: number) => String(v),
  },
  {
    key: 'currentMoodScore' as const,
    label: 'ציון מצב רוח',
    description: 'ממוצע 7 ימים',
    Icon: Smile,
    format: (v: number) => (v > 0 ? `${v.toFixed(1)}/10` : '—'),
  },
  {
    key: 'completedGoals' as const,
    label: 'יעדים שהושלמו',
    description: 'סה״כ שהושלמו',
    Icon: Award,
    format: (v: number) => String(v),
  },
  {
    key: 'pendingReminders' as const,
    label: 'תזכורות ממתינות',
    description: 'לא נענו',
    Icon: AlarmClock,
    format: (v: number) => String(v),
  },
] as const;

// ===== קומפוננטות עזר =====

/** כרטיס Skeleton לזמן טעינה */
function StatCardSkeleton() {
  return (
    <div className="bg-surface-container rounded-xl p-4 h-32 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <MysticSkeleton className="h-4 w-20" />
          <MysticSkeleton className="h-8 w-14" />
        </div>
        <MysticSkeleton className="h-10 w-10 rounded-lg" />
      </div>
      <MysticSkeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

// ===== קומפוננטה =====

/**
 * 4 כרטיסי סטטיסטיקות — לפי D-04, עיצוב MD3 עם surface-container
 * מציג Skeleton בזמן טעינה
 */
export function StatCards({ stats, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
      {STAT_CARD_DEFINITIONS.map(
        ({ key, label, description, Icon, format }) => (
          <div
            key={key}
            className="bg-surface-container rounded-xl p-4 h-32 relative overflow-hidden"
            role="status"
            aria-label={`${label}: ${format(stats[key])}`}
          >
            {/* ambient glow */}
            <div className="absolute -bottom-4 -start-4 w-12 h-12 bg-tertiary/5 rounded-full blur-xl" aria-hidden="true" />

            <div className="flex items-start justify-between">
              <div>
                <p className="font-label text-sm text-on-surface-variant">{label}</p>
                <p className="mt-1 text-3xl font-headline font-black text-on-surface">
                  {format(stats[key])}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5 text-tertiary" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-1 font-label text-xs text-on-surface-variant">{description}</p>
          </div>
        )
      )}
    </div>
  );
}
