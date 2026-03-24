/**
 * ProgressTracker — מעקב התקדמות אופקי
 * מציג שורת התקדמות עם אחוז ותווית
 */

'use client';

import { Progress } from '@/components/ui/progress';

/** Props של ProgressTracker */
interface ProgressTrackerProps {
  /** מספר פריטים שהושלמו */
  completed: number;
  /** סך הכל פריטים */
  total: number;
  /** תווית המוצגת לצד הפס */
  label: string;
}

/**
 * ProgressTracker — פס התקדמות עם תווית ואחוז
 * מחשב אחוז מ-completed/total ומציג ב-base-ui Progress
 */
export function ProgressTracker({ completed, total, label }: ProgressTrackerProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        aria-label={`${label}: ${percentage}%`}
      />
    </div>
  );
}
