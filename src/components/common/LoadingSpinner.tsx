/**
 * ספינר טעינה — אייקון מסתובב עם הודעה אופציונלית
 * תומך ב-3 גדלים (קטן, בינוני, גדול) ומרכז את עצמו אוטומטית
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ===== ממשקי טיפוסים =====

/** גודל הספינר */
type SpinnerSize = 'sm' | 'md' | 'lg';

/** מאפייני ספינר הטעינה */
interface LoadingSpinnerProps {
  /** גודל הספינר — ברירת מחדל: md */
  readonly size?: SpinnerSize;
  /** הודעת טעינה בעברית (אופציונלי) */
  readonly message?: string;
}

// ===== קבועי גודל =====

/** מפת גדלים לקלאסי CSS */
const SIZE_CLASSES: Readonly<Record<SpinnerSize, string>> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} as const;

/** מפת גדלי טקסט */
const TEXT_SIZE_CLASSES: Readonly<Record<SpinnerSize, string>> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

// ===== קומפוננטה ראשית =====

/** ספינר טעינה עם הודעה אופציונלית */
export function LoadingSpinner({
  size = 'md',
  message,
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-8"
      role="status"
      aria-label={message ?? 'טוען...'}
    >
      <Loader2
        className={cn(
          SIZE_CLASSES[size],
          'animate-spin text-primary'
        )}
        aria-hidden="true"
      />
      {message && (
        <p
          className={cn(
            TEXT_SIZE_CLASSES[size],
            'text-on-surface-variant'
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
