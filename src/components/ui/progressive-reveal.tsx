'use client';

/**
 * ProgressiveReveal — עוטף ילדים עם אנימציית staggered fade-in
 * כל אלמנט-ילד מופיע בזה אחר זה עם delay
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Props של עטיפת ProgressiveReveal */
interface ProgressiveRevealProps {
  /** תוכן ילדים */
  readonly children: ReactNode;
  /** CSS classes נוספים */
  readonly className?: string;
  /** השהיה בין כל ילד (שניות) — ברירת מחדל 0.12 */
  readonly staggerDelay?: number;
}

/** וריאנטי אנימציה לקונטיינר — stagger ילדים */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/** וריאנטי אנימציה לכל פריט — fade-in + slide up */
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/** עטיפת אנימציית staggered reveal — כל ילד מופיע בתור */
export function ProgressiveReveal({ children, className }: ProgressiveRevealProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/** Props של פריט בודד ב-ProgressiveReveal */
interface RevealItemProps {
  /** תוכן הפריט */
  readonly children: ReactNode;
  /** CSS classes נוספים */
  readonly className?: string;
}

/** פריט בודד בתוך ProgressiveReveal — fade-in + slide up */
export function RevealItem({ children, className }: RevealItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
