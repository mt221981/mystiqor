'use client';

/**
 * StandardSectionHeader — כותרת סקשן אטמוספרית עם זוהר מתעכב
 * מחליף את PageHeader בעמודי כלים — מוסיף mystic-icon-wrap + celestial-glow מתעכב
 * אנימציית כניסה: fade + drift מלמטה (600ms)
 * תמיכה מלאה ב-prefers-reduced-motion
 */

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { animations } from '@/lib/animations/presets';

import type { ReactNode } from 'react';

// ===== ממשקי טיפוסים =====

/** פריט פירורי לחם */
interface BreadcrumbItem {
  /** תווית בעברית */
  readonly label: string;
  /** קישור (אופציונלי — האחרון ללא קישור) */
  readonly href?: string;
}

/** מאפייני StandardSectionHeader */
interface StandardSectionHeaderProps {
  /** כותרת הסקשן */
  readonly title: string;
  /** תיאור קצר (אופציונלי) */
  readonly description?: string;
  /** אייקון לצד הכותרת */
  readonly icon: ReactNode;
  /** פירורי לחם (אופציונלי) */
  readonly breadcrumbs?: readonly BreadcrumbItem[];
}

// ===== הגדרות אנימציה =====

/**
 * אנימציית כניסה לכותרת — y=16 (מעט יותר מ-pageEntry הכללי)
 * לפי UI-SPEC: "slightly more y" עבור כותרת הסקשן
 */
const HEADER_ENTRY = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
} as const;

// ===== קומפוננטה ראשית =====

/**
 * כותרת סקשן אטמוספרית עם אייקון מיסטי, זוהר מתעכב ואנימציית כניסה
 * משמשת בעמודי כלים במקום PageHeader הרגיל
 */
export function StandardSectionHeader({
  title,
  description,
  icon,
  breadcrumbs,
}: StandardSectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showGlow, setShowGlow] = useState(false);

  // הוסף glow אחרי 300ms — אפקט גילוי הדרגתי
  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = setTimeout(() => {
      setShowGlow(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  // תוכן פנימי — משותף לשתי הגרסאות
  const content = (
    <>
      {/* פירורי לחם */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* אייקון + כותרת */}
      <div className="flex items-center gap-3">
        {/* עטיפת אייקון מיסטית עם זוהר מתעכב */}
        <div
          className={cn(
            'flex items-center justify-center rounded-xl',
            'h-11 w-11 mystic-icon-wrap text-primary',
            'transition-shadow duration-[400ms] ease-in-out',
            showGlow && 'celestial-glow'
          )}
          aria-hidden="true"
        >
          <div className="w-6 h-6">
            {icon}
          </div>
        </div>

        {/* טקסט */}
        <div>
          <h1 className="text-2xl font-headline font-bold text-gradient-gold">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm font-body text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </>
  );

  // reduced-motion: תצוגה סטטית ללא אנימציה
  if (shouldReduceMotion) {
    return (
      <div className="mb-6 space-y-3">
        {content}
      </div>
    );
  }

  // ברירת מחדל: כניסה מונפשת
  return (
    <motion.div
      className="mb-6 space-y-3"
      initial={HEADER_ENTRY.initial}
      animate={HEADER_ENTRY.animate}
      transition={HEADER_ENTRY.transition}
    >
      {content}
    </motion.div>
  );
}

// ===== ייצוא טיפוסים =====

export type { BreadcrumbItem };
