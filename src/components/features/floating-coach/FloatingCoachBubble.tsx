'use client';

/**
 * כפתור בועת מאמן AI צף — נגיש מכל עמוד מאומת חוץ מ-/coach
 *
 * מציג כדור זוהר עם אנימציית נשימה שמזמין את המשתמש לפתוח שיחה עם המאמן.
 * מוסתר בעמוד /coach עצמו כדי למנוע כפילות.
 * מכבד העדפת תנועה מופחתת (prefers-reduced-motion).
 */

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { GiCrystalBall } from 'react-icons/gi';
import { useFloatingCoachStore } from '@/stores/floating-coach';

/**
 * כפתור הפעולה הצף של מאמן AI
 * מוסתר בעמוד /coach ומציג אנימציית נשימה (scale 1.0→1.05→1.0 כל 4 שניות)
 */
export function FloatingCoachBubble() {
  const pathname = usePathname();
  const { isOpen, toggle } = useFloatingCoachStore();
  const shouldReduceMotion = useReducedMotion();

  // מוסתר בעמוד מאמן AI המלא (D-06)
  if (pathname === '/coach') return null;

  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-20 md:bottom-6 start-4 w-14 h-14 rounded-full celestial-glow bg-gradient-to-br from-[#8f2de6] to-[#d4a853] flex items-center justify-center text-primary-foreground cursor-pointer"
      style={{ zIndex: 'var(--z-floating)' }}
      animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      aria-label="פתח מאמן AI"
      aria-expanded={isOpen}
    >
      <GiCrystalBall className="w-7 h-7" />
    </motion.button>
  );
}
