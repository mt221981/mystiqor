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
import { useFloatingCoachStore } from '@/stores/floating-coach';

/**
 * כפתור הפעולה הצף של מאמן AI — כדור בדולח CSS מלא עשן וכוכבים
 * מוסתר בעמוד /coach ומציג אנימציית נשימה (scale 1.0→1.05→1.0 כל 4 שניות)
 */
export function FloatingCoachBubble() {
  const pathname = usePathname();
  const { isOpen, toggle } = useFloatingCoachStore();
  const shouldReduceMotion = useReducedMotion();

  if (pathname === '/coach') return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 end-4 md:end-6" style={{ zIndex: 'var(--z-floating)' }}>
      {/* הילה חיצונית — ערפל זוהר מסביב לכדור */}
      <div className="absolute -inset-4 md:-inset-5 rounded-full opacity-70 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(143,45,230,0.3) 0%, rgba(143,45,230,0.1) 40%, rgba(212,168,83,0.05) 60%, transparent 75%)',
        filter: 'blur(8px)',
      }} />
      <motion.button
        onClick={toggle}
        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          boxShadow: '0 0 20px rgba(143,45,230,0.6), 0 0 40px rgba(143,45,230,0.3), 0 0 60px rgba(212,168,83,0.15), inset 0 0 20px rgba(143,45,230,0.2)',
        }}
        animate={shouldReduceMotion ? {} : { scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        aria-label="שוחח עם נועה"
        aria-expanded={isOpen}
      >
        {/* רקע כדור — כהה שקוף */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(20,8,45,0.85) 0%, rgba(10,5,25,0.9) 60%, rgba(5,2,15,0.95) 100%)',
        }} />
        {/* עשן סגול סוחף — שכבה 1 */}
        <div className="absolute inset-1 rounded-full animate-[spin_20s_linear_infinite]" style={{
          background: 'radial-gradient(ellipse 80% 50% at 30% 60%, rgba(143,45,230,0.5) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 70% 30%, rgba(100,30,200,0.4) 0%, transparent 50%)',
        }} />
        {/* עשן סגול סוחף — שכבה 2 (סיבוב הפוך) */}
        <div className="absolute inset-2 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{
          background: 'radial-gradient(ellipse 50% 60% at 60% 65%, rgba(170,60,255,0.3) 0%, transparent 55%), radial-gradient(ellipse 70% 40% at 35% 35%, rgba(130,50,230,0.25) 0%, transparent 50%)',
        }} />
        {/* זוהר זהוב חם מהמרכז */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 50% 55%, rgba(212,168,83,0.3) 0%, rgba(212,168,83,0.1) 30%, transparent 55%)',
        }} />
        {/* ברק — כתם אור על פני הכדור (זכוכית) */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 20%, transparent 45%)',
        }} />
        {/* כוכבים — נקודות זוהרות */}
        <div className="absolute inset-1 rounded-full overflow-hidden">
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[22%] start-[28%] shadow-[0_0_6px_2px_white,0_0_12px_rgba(255,255,255,0.5)]" />
          <div className="absolute w-1 h-1 bg-white/90 rounded-full top-[38%] start-[62%] shadow-[0_0_5px_1px_white]" />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[58%] start-[42%] shadow-[0_0_6px_2px_rgba(212,168,83,0.9),0_0_12px_rgba(212,168,83,0.4)]" />
          <div className="absolute w-1 h-1 bg-white/80 rounded-full top-[32%] start-[48%] shadow-[0_0_4px_white]" />
          <div className="absolute w-0.5 h-0.5 bg-white/70 rounded-full top-[68%] start-[30%] shadow-[0_0_3px_rgba(143,45,230,0.9)]" />
          <div className="absolute w-1 h-1 bg-gold rounded-full top-[48%] start-[22%] shadow-[0_0_6px_2px_rgba(212,168,83,0.8)]" />
          <div className="absolute w-0.5 h-0.5 bg-white/60 rounded-full top-[75%] start-[55%] shadow-[0_0_3px_white]" />
          <div className="absolute w-1 h-1 bg-primary/90 rounded-full top-[42%] start-[35%] shadow-[0_0_5px_rgba(143,45,230,0.8)]" />
          <div className="absolute w-0.5 h-0.5 bg-white/80 rounded-full top-[28%] start-[70%] shadow-[0_0_4px_white]" />
        </div>
        {/* שפת זכוכית עדינה */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)',
        }} />
        {/* תווית */}
        <span className="absolute -top-8 text-base md:text-lg font-label font-bold text-primary whitespace-nowrap drop-shadow-[0_0_10px_rgba(221,184,255,0.6)]">
          נועה
        </span>
      </motion.button>
    </div>
  );
}
