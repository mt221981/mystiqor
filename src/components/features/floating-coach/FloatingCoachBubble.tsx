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
import { GiSparkles } from 'react-icons/gi';
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
      className="fixed bottom-20 md:bottom-6 end-4 md:end-6 w-24 h-24 md:w-28 md:h-28 rounded-full celestial-glow bg-gradient-to-br from-[#8f2de6] to-[#d4a853] flex items-center justify-center text-primary-foreground cursor-pointer ring-2 ring-primary/30 shadow-[0_0_20px_rgba(143,45,230,0.6),0_0_40px_rgba(143,45,230,0.3),0_0_60px_rgba(212,168,83,0.25)] hover:shadow-[0_0_30px_rgba(143,45,230,0.8),0_0_60px_rgba(212,168,83,0.4)] transition-shadow"
      style={{ zIndex: 'var(--z-floating)' }}
      animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1] }}
      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      aria-label="שוחח עם נועה"
      aria-expanded={isOpen}
    >
      <GiSparkles className="w-12 h-12 md:w-14 md:h-14" />
      {/* תווית צפה מעל הכדור — תמיד גלויה */}
      <span className="absolute -top-7 text-sm font-label font-bold text-primary whitespace-nowrap drop-shadow-[0_0_8px_rgba(221,184,255,0.5)]">
        נועה
      </span>
    </motion.button>
  );
}
