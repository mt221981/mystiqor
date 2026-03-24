/**
 * פס שימוש — מציג כמה ניתוחים נוצלו מתוך המגבלה
 */
'use client';

import { cn } from '@/lib/utils/cn';

/** Props של פס שימוש */
export interface UsageBarProps {
  used: number;
  limit: number;
  className?: string;
}

/** פס שימוש חזותי עם צבע MD3 דינמי לפי אחוז */
export function UsageBar({ used, limit, className }: UsageBarProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-on-surface-variant font-label text-xs">
        <span>{isUnlimited ? 'ללא הגבלה' : `${used} / ${limit}`}</span>
        {!isUnlimited && <span>{percentage}%</span>}
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isAtLimit
                ? 'bg-error'
                : isNearLimit
                  ? 'bg-secondary'
                  : 'bg-gradient-to-l from-primary-container to-secondary-container'
            )}
            style={{ width: `${percentage.toString()}%` }}
            role="progressbar"
            aria-label={`${percentage.toString()}% ניצול`}
          />
        </div>
      )}
    </div>
  );
}
