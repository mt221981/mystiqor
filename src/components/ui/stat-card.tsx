'use client';

/**
 * StatCard — קארד סטטיסטיקה בסגנון bento:
 * מציג ערך מספרי גדול עם תווית, תג אופציונלי ואייקון
 * משמש ברשתות bento ב-dashboard
 */

import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

/** פרופס של StatCard */
interface StatCardProps {
  readonly value: string | number;
  readonly label: string;
  readonly badge?: string;
  readonly icon?: ReactNode;
  readonly className?: string;
}

/** קארד סטטיסטיקה עם ערך בולט, תווית ותג */
export function StatCard({ value, label, badge, icon, className }: StatCardProps) {
  return (
    <div className={cn('bg-surface-container rounded-xl p-4 h-32 relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          {badge && (
            <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full font-label text-[10px] font-semibold">
              {badge}
            </span>
          )}
          <p className="text-3xl font-headline font-black text-on-surface mt-2">{value}</p>
          <p className="font-label text-xs text-on-surface-variant mt-1">{label}</p>
        </div>
        {icon && <div className="text-on-surface-variant">{icon}</div>}
      </div>
      {/* זוהר עיצובי בפינה */}
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-tertiary/5 rounded-full blur-xl" aria-hidden="true" />
    </div>
  );
}
