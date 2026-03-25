'use client';

/**
 * מצב ריק — מוצג כשאין נתונים להצגה
 * כולל אייקון, כותרת, תיאור וכפתור פעולה אופציונלי
 * אנימציית כניסה מלמטה עם שקיפות
 */

import { motion } from 'framer-motion';
import { GiCrystalBall } from 'react-icons/gi';
import { cn } from '@/lib/utils/cn';

import type { ReactNode } from 'react';

// ===== ממשקי טיפוסים =====

/** הגדרת פעולה בכפתור */
interface EmptyStateAction {
  /** תווית הכפתור בעברית */
  readonly label: string;
  /** פונקציית לחיצה */
  readonly onClick: () => void;
}

/** מאפייני מצב ריק */
interface EmptyStateProps {
  /** אייקון מותאם (אופציונלי — ברירת מחדל: Inbox) */
  readonly icon?: ReactNode;
  /** כותרת בעברית */
  readonly title: string;
  /** תיאור נוסף (אופציונלי) */
  readonly description?: string;
  /** כפתור פעולה (אופציונלי) */
  readonly action?: EmptyStateAction;
}

// ===== הגדרות אנימציה =====

/** אנימציית כניסה מלמטה */
const FADE_IN_UP = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const;

// ===== קומפוננטה ראשית =====

/** מצב ריק — מרכזי, עם אייקון, כותרת, תיאור וכפתור אופציונלי */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center px-4 py-16 text-center"
      initial={FADE_IN_UP.initial}
      animate={FADE_IN_UP.animate}
      transition={FADE_IN_UP.transition}
    >
      {/* אייקון */}
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-2xl',
          'h-16 w-16 bg-primary-container/20 text-primary'
        )}
      >
        {icon ?? <GiCrystalBall className="h-8 w-8" />}
      </div>

      {/* כותרת */}
      <h3 className="mb-2 text-lg font-semibold text-on-surface">{title}</h3>

      {/* תיאור */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-on-surface-variant">{description}</p>
      )}

      {/* כפתור פעולה */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center justify-center rounded-lg',
            'bg-primary-container text-on-primary-container px-5 py-2.5 text-sm font-medium',
            'hover:opacity-90 active:scale-95',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-surface'
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
