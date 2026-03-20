'use client';

/**
 * כותרת עמוד עם פירורי לחם — מציגה כותרת, תיאור, אייקון ונתיב ניווט
 * כוללת אנימציית כניסה (fadeInUp) באמצעות framer-motion
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

import type { ReactNode } from 'react';

// ===== ממשקי טיפוסים =====

/** פריט פירורי לחם */
interface BreadcrumbItem {
  /** תווית בעברית */
  readonly label: string;
  /** קישור (אופציונלי — האחרון ללא קישור) */
  readonly href?: string;
}

/** מאפייני כותרת עמוד */
interface PageHeaderProps {
  /** כותרת העמוד */
  readonly title: string;
  /** תיאור קצר (אופציונלי) */
  readonly description?: string;
  /** אייקון לצד הכותרת (אופציונלי) */
  readonly icon?: ReactNode;
  /** פירורי לחם (אופציונלי) */
  readonly breadcrumbs?: readonly BreadcrumbItem[];
}

// ===== הגדרות אנימציה =====

/** אנימציית כניסה מלמטה עם שקיפות */
const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const;

// ===== קומפוננטה ראשית =====

/** כותרת עמוד עם אייקון, תיאור ופירורי לחם */
export function PageHeader({
  title,
  description,
  icon,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <motion.div
      className="mb-6 space-y-3"
      initial={FADE_IN_UP.initial}
      animate={FADE_IN_UP.animate}
      transition={FADE_IN_UP.transition}
    >
      {/* פירורי לחם */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* כותרת ותיאור */}
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              'flex items-center justify-center rounded-xl',
              'h-10 w-10 bg-purple-600/20 text-purple-400'
            )}
          >
            {icon}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
