/**
 * גבול שגיאה גלובלי — תופס שגיאות לא מטופלות ומציג ממשק שחזור
 * כולל מנגנון שחזור אוטומטי (GEM 10): אם 3 שגיאות ב-5 שניות → איפוס אוטומטי
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

import { AlertTriangle, RotateCcw } from 'lucide-react';

// ===== קבועים =====

/** מספר שגיאות מקסימלי לפני שחזור אוטומטי */
const MAX_ERRORS_BEFORE_AUTO_RESET = 3;

/** חלון זמן בשניות לספירת שגיאות */
const ERROR_WINDOW_SECONDS = 5;

// ===== ממשקים =====

/** פרופס של קומפוננטת השגיאה */
interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

// ===== קומפוננטה =====

/** גבול שגיאה גלובלי עם מנגנון שחזור אוטומטי וידני */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  /** מערך חותמות זמן של שגיאות אחרונות */
  const errorTimestampsRef = useRef<number[]>([]);

  /**
   * מנגנון שחזור אוטומטי — GEM 10
   * אם מזוהות 3 שגיאות בתוך 5 שניות, מבצע reset אוטומטי
   */
  const handleAutoRecovery = useCallback(() => {
    const now = Date.now();
    const windowMs = ERROR_WINDOW_SECONDS * 1000;

    /* הוספת חותמת הזמן הנוכחית */
    errorTimestampsRef.current.push(now);

    /* סינון — שומר רק שגיאות בתוך חלון הזמן */
    errorTimestampsRef.current = errorTimestampsRef.current.filter(
      (timestamp) => now - timestamp < windowMs
    );

    /* אם הגענו לסף — שחזור אוטומטי */
    if (errorTimestampsRef.current.length >= MAX_ERRORS_BEFORE_AUTO_RESET) {
      errorTimestampsRef.current = [];
      reset();
    }
  }, [reset]);

  useEffect(() => {
    handleAutoRecovery();
  }, [handleAutoRecovery]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      {/* אייקון אזהרה */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      {/* הודעת שגיאה */}
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          משהו השתבש
        </h1>
        <p className="mb-1 max-w-md text-muted-foreground">
          אירעה שגיאה בלתי צפויה. ניתן לנסות שוב או לחזור לדף הבית.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/80">
            קוד שגיאה: {error.digest}
          </p>
        )}
      </div>

      {/* כפתורי פעולה */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          נסה שוב
        </button>

        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          חזרה לדף הבית
        </a>
      </div>
    </div>
  );
}
