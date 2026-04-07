'use client';

/**
 * עמוד כלים מיסטיים — רשת כלים עם כותרת מרכזית ואנימציות כניסה
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { ToolGrid } from '@/components/features/shared/ToolGrid';
import { animations } from '@/lib/animations/presets';

/** עמוד כלים מיסטיים */
export default function ToolsPage() {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion ? {} : animations.pageEntry;

  return (
    <motion.div dir="rtl" className="space-y-8" {...motionProps}>
      {/* כותרת מרכזית — אחידה עם הדאשבורד */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>הכלים המיסטיים</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-gradient-gold">
          בחר כלי וגלה את עצמך
        </h1>
      </div>

      {/* רשת כלים */}
      <ToolGrid />
    </motion.div>
  );
}
