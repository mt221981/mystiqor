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
      className="fixed bottom-20 md:bottom-6 end-4 md:end-6 w-16 h-16 md:w-[72px] md:h-[72px] rounded-full celestial-glow bg-gradient-to-br from-[#8f2de6] to-[#d4a853] flex items-center justify-center text-primary-foreground cursor-pointer shadow-[0_0_24px_rgba(143,45,230,0.5),0_0_48px_rgba(212,168,83,0.3)] hover:shadow-[0_0_32px_rgba(143,45,230,0.7),0_0_64px_rgba(212,168,83,0.4)] transition-shadow"
      style={{ zIndex: 'var(--z-floating)' }}
      animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      aria-label="פתח מאמן AI"
      aria-expanded={isOpen}
    >
      <GiCrystalBall className="w-8 h-8 md:w-9 md:h-9" />
      {/* תווית צפה מתחת לכדור — רק בדסקטופ */}
      <span className="absolute -bottom-6 text-[10px] font-label font-medium text-primary whitespace-nowrap hidden md:block">
        מאמן AI
      </span>
    </motion.button>
  );
}
