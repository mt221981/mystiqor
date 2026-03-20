'use client';

/**
 * מעטפת מעבר עמודים — עוטפת תוכן עם אנימציית כניסה/יציאה
 * משתמשת ב-framer-motion AnimatePresence ו-motion.div
 * אנימציה: fadeInUp — שקיפות + תנועה מלמטה
 */

import { AnimatePresence, motion } from 'framer-motion';

import type { ReactNode } from 'react';

// ===== ממשקי טיפוסים =====

/** מאפייני מעבר עמודים */
interface PageTransitionProps {
  /** תוכן העמוד */
  readonly children: ReactNode;
}

// ===== הגדרות אנימציה =====

/** הגדרות אנימציית fadeInUp */
const PAGE_VARIANTS = {
  /** מצב התחלתי — שקוף ולמטה */
  initial: {
    opacity: 0,
    y: 12,
  },
  /** מצב פעיל — גלוי ובמקום */
  animate: {
    opacity: 1,
    y: 0,
  },
  /** מצב יציאה — שקוף ולמעלה */
  exit: {
    opacity: 0,
    y: -8,
  },
} as const;

/** הגדרות תזמון האנימציה */
const PAGE_TRANSITION = {
  duration: 0.3,
  ease: 'easeOut',
} as const;

// ===== קומפוננטה ראשית =====

/** מעטפת מעבר עמודים עם אנימציית fadeInUp */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={PAGE_VARIANTS}
        transition={PAGE_TRANSITION}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
