'use client';

/**
 * גבול שגיאות (Error Boundary) — GEM 10
 * תופס שגיאות React ומציג ממשק חלופי עם התאוששות אוטומטית
 * אם 3 שגיאות תוך 5 שניות — מתאפס אוטומטית
 */

import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

import type { ReactNode, ErrorInfo } from 'react';

// ===== ממשקי טיפוסים =====

/** מאפייני גבול השגיאות */
interface ErrorBoundaryProps {
  /** תוכן עטוף */
  readonly children: ReactNode;
  /** callback לטיפול בשגיאה (אופציונלי) */
  readonly onError?: (error: Error) => void;
}

/** מצב פנימי של גבול השגיאות */
interface ErrorBoundaryState {
  /** האם יש שגיאה פעילה */
  hasError: boolean;
  /** אובייקט השגיאה */
  error: Error | null;
  /** מונה שגיאות לזיהוי לולאה */
  errorCount: number;
  /** חותמת זמן של שגיאה ראשונה בסדרה */
  firstErrorTime: number | null;
  /** האם פרטי השגיאה הועתקו */
  copied: boolean;
}

// ===== קבועים =====

/** סף שגיאות לאיפוס אוטומטי */
const AUTO_RESET_THRESHOLD = 3;

/** חלון זמן בשניות לזיהוי סדרת שגיאות */
const ERROR_WINDOW_MS = 5000;

// ===== קומפוננטה ראשית =====

/**
 * גבול שגיאות — תופס שגיאות בעץ רכיבים ומציג ממשק חלופי
 * כולל התאוששות אוטומטית: אם 3 שגיאות ב-5 שניות — מנווט לדף הבית
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
      firstErrorTime: null,
      copied: false,
    };
  }

  /** עדכון state כשנתפסת שגיאה */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /** טיפול בשגיאה — ספירה, זיהוי לולאה, קריאה ל-callback */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props;
    const { errorCount, firstErrorTime } = this.state;
    const now = Date.now();

    // קריאה ל-callback חיצוני
    if (onError) {
      onError(error);
    }

    // בדיקת חלון זמן — אם עברו יותר מ-5 שניות, מאפסים מונה
    const isWithinWindow =
      firstErrorTime !== null && now - firstErrorTime < ERROR_WINDOW_MS;

    const newCount = isWithinWindow ? errorCount + 1 : 1;
    const newFirstTime = isWithinWindow ? firstErrorTime : now;

    this.setState({
      errorCount: newCount,
      firstErrorTime: newFirstTime,
    });

    // איפוס אוטומטי אם הגענו לסף
    if (newCount >= AUTO_RESET_THRESHOLD) {
      this.handleAutoReset();
    }

    // לוג לדיבוג (בסביבת פיתוח בלבד)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] שגיאה נתפסה:', error, errorInfo);
    }
  }

  /** איפוס אוטומטי — ניווט לדף הבית */
  private handleAutoReset(): void {
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
      firstErrorTime: null,
    });

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /** ניסיון חוזר — איפוס מצב השגיאה */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      copied: false,
    });
  };

  /** ניווט לדף הבית */
  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /** העתקת פרטי שגיאה ללוח */
  private handleCopyError = async (): Promise<void> => {
    const { error } = this.state;
    if (!error) return;

    const errorText = [
      `שגיאה: ${error.message}`,
      `סוג: ${error.name}`,
      error.stack ? `מחסנית:\n${error.stack}` : '',
      `זמן: ${new Date().toISOString()}`,
      `כתובת: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // נכשל בהעתקה — לא קריטי
    }
  };

  render(): ReactNode {
    const { hasError, error, copied } = this.state;
    const { children } = this.props;

    if (!hasError || !error) {
      return children;
    }

    return (
      <div
        className="flex min-h-[400px] items-center justify-center p-6"
        dir="rtl"
      >
        <div
          className={cn(
            'w-full max-w-md rounded-2xl',
            'border border-error/20 bg-surface-container p-8',
            'text-center shadow-xl shadow-error/5'
          )}
          role="alert"
        >
          {/* אייקון שגיאה */}
          <div
            className={cn(
              'mx-auto mb-4 flex items-center justify-center rounded-full',
              'h-14 w-14 bg-red-500/10'
            )}
          >
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>

          {/* כותרת */}
          <h2 className="mb-2 text-xl font-bold text-on-surface">
            משהו השתבש
          </h2>

          {/* תיאור */}
          <p className="mb-6 text-sm text-on-surface-variant">
            אירעה שגיאה בלתי צפויה. ניתן לנסות שוב או לחזור לדף הבית.
          </p>

          {/* פרטי שגיאה */}
          <div
            className={cn(
              'mb-6 rounded-lg bg-surface-container-lowest p-3',
              'border border-outline-variant/10 text-start'
            )}
          >
            <p className="text-xs font-mono text-red-300 break-all">
              {error.message}
            </p>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleRetry}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg',
                'bg-primary-container text-on-primary-container px-4 py-2.5 text-sm font-medium',
                'hover:opacity-90 active:scale-95',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-surface-container'
              )}
            >
              <RotateCcw className="h-4 w-4" />
              <span>נסה שוב</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg',
                'border border-outline-variant/20 bg-transparent px-4 py-2.5',
                'text-sm font-medium text-on-surface-variant',
                'hover:bg-surface-container-high hover:text-on-surface',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-outline-variant/40 focus:ring-offset-2 focus:ring-offset-surface-container'
              )}
            >
              <Home className="h-4 w-4" />
              <span>דף הבית</span>
            </button>

            <button
              type="button"
              onClick={this.handleCopyError}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg',
                'border border-outline-variant/20 bg-transparent px-4 py-2.5',
                'text-sm font-medium text-on-surface-variant',
                'hover:bg-surface-container-high hover:text-on-surface',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-outline-variant/40 focus:ring-offset-2 focus:ring-offset-surface-container'
              )}
              aria-label="העתק פרטי שגיאה"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'הועתק!' : 'העתק שגיאה'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
