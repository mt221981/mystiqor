'use client';

/**
 * כפתור בועת מאמן AI צף — נגיש מכל עמוד מאומת חוץ מ-/coach
 *
 * מציג תמונת אווטאר של נועה עם אנימציית נשימה ומסגרת זוהרת.
 * מוסתר בעמוד /coach עצמו כדי למנוע כפילות.
 * מכבד העדפת תנועה מופחתת (prefers-reduced-motion).
 */

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useFloatingCoachStore } from '@/stores/floating-coach';

/**
 * כפתור הפעולה הצף של מאמן AI — אווטאר של נועה עם זוהר סגול-זהוב
 * מוסתר בעמוד /coach ומציג אנימציית נשימה
 */
export function FloatingCoachBubble() {
  const pathname = usePathname();
  const { isOpen, toggle } = useFloatingCoachStore();
  const shouldReduceMotion = useReducedMotion();

  if (pathname === '/coach') return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 end-4 md:end-6" style={{ zIndex: 'var(--z-floating)' }}>
      {/* הילה חיצונית — ערפל זוהר מסביב לאווטאר */}
      <div className="absolute -inset-3 md:-inset-4 rounded-full opacity-80 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(143,45,230,0.4) 0%, rgba(143,45,230,0.15) 40%, rgba(212,168,83,0.08) 60%, transparent 75%)',
        filter: 'blur(10px)',
      }} />
      <motion.button
        onClick={toggle}
        className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
        style={{
          boxShadow: '0 0 20px rgba(143,45,230,0.6), 0 0 40px rgba(143,45,230,0.3), 0 0 60px rgba(212,168,83,0.15)',
        }}
        animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        aria-label="שוחח עם נועה"
        aria-expanded={isOpen}
      >
        {/* מסגרת זהובה */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/50 z-10 pointer-events-none" />

        {/* תמונת נועה */}
        <Image
          src="/images/coach/noa-avatar.png"
          alt="נועה — המאמנת האישית"
          fill
          className="object-cover rounded-full"
          sizes="(max-width: 768px) 96px, 112px"
          priority
        />

        {/* שכבת זוהר עדינה על התמונה */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(143,45,230,0.2) 100%)',
        }} />
      </motion.button>

    </div>
  );
}
