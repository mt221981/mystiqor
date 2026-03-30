'use client';

/**
 * MysticLoadingText — טקסט טעינה מיסטי פועם
 * מציג ביטוי עברי עם אנימציית opacity מחזורית (0.6→1→0.6)
 * כבד reduced-motion: מציג טקסט סטטי ללא אנימציה
 */

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ===== ממשקי טיפוסים =====

/** מאפייני קומפוננטת MysticLoadingText */
interface MysticLoadingTextProps {
  /** הטקסט המוצג (ביטוי טעינה בעברית) */
  readonly text: string;
  /** מחלקות CSS נוספות (אופציונלי) */
  readonly className?: string;
}

// ===== קבועי אנימציה =====

/** הגדרת אנימציית הפועם */
const PULSE_ANIMATE = { opacity: [0.6, 1, 0.6] as number[] };

/** הגדרת מעבר האנימציה */
const PULSE_TRANSITION = {
  duration: 1.8,
  repeat: Infinity,
  ease: 'easeInOut',
} as const;

// ===== קומפוננטה ראשית =====

/**
 * מציג טקסט טעינה בעברית עם אנימציית פועם מיסטית
 * בסביבות עם prefers-reduced-motion — מציג טקסט סטטי
 */
export function MysticLoadingText({ text, className }: MysticLoadingTextProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <span
        className={cn(className)}
        aria-live="polite"
      >
        {text}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(className)}
      animate={PULSE_ANIMATE}
      transition={PULSE_TRANSITION}
      aria-live="polite"
    >
      {text}
    </motion.span>
  );
}
