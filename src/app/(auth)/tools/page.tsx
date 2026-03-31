'use client';

/**
 * עמוד כלים מיסטיים — רשת כלים עם באנר גדול ואנימציות כניסה
 */

import { motion, useReducedMotion } from 'framer-motion';
import { GiSpellBook, GiSparkles } from 'react-icons/gi';

import { ToolGrid } from '@/components/features/shared/ToolGrid';
import { animations } from '@/lib/animations/presets';

/** עמוד כלים מיסטיים — יעד טאב הכלים בניווט התחתון */
export default function ToolsPage() {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion ? {} : animations.pageEntry;

  return (
    <motion.div dir="rtl" className="space-y-8" {...motionProps}>
      {/* באנר גיבור */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-[#1a0a3e] via-[#2d1b69] to-[#0d0b1e] p-8 md:p-10 border border-primary/20">
        <div className="absolute top-0 end-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 start-0 w-48 h-48 bg-gold/10 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

        <div className="relative flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-gold/20 ring-1 ring-primary/30">
            <GiSpellBook className="w-9 h-9 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-gradient-gold">
              הכלים המיסטיים
            </h1>
            <p className="text-lg text-muted-foreground mt-1">בחר כלי וגלה את עצמך</p>
          </div>
        </div>
      </div>

      {/* רשת כלים */}
      <ToolGrid />
    </motion.div>
  );
}
