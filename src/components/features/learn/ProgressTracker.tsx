/**
 * ProgressTracker — מעקב התקדמות אופקי
 * מציג שורת התקדמות עם אחוז ותווית
 */

'use client';

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
 * מחשב אחוז מ-completed/total ומציג פס MD3 עם גרדיאנט
 */
export function ProgressTracker({ completed, total, label }: ProgressTrackerProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="font-label text-xs text-on-surface-variant">{label}</span>
        <span className="font-headline font-bold text-primary text-sm">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${percentage}%`}
        />
      </div>
    </div>
  );
}
