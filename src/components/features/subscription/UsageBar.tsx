/**
 * פס שימוש — מציג כמה ניתוחים נוצלו מתוך המגבלה
 */
'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';

/** Props של פס שימוש */
export interface UsageBarProps {
  used: number;
  limit: number;
  className?: string;
}

/** פס שימוש חזותי עם צבע דינמי לפי אחוז */
export function UsageBar({ used, limit, className }: UsageBarProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{isUnlimited ? 'ללא הגבלה' : `${used} / ${limit}`}</span>
        {!isUnlimited && <span>{percentage}%</span>}
      </div>
      {!isUnlimited && (
        <Progress
          value={percentage}
          className={cn(
            'h-2',
            isAtLimit && '[&>div]:bg-destructive',
            isNearLimit && !isAtLimit && '[&>div]:bg-yellow-500'
          )}
        />
      )}
    </div>
  );
}
