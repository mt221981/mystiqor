'use client';

/**
 * עמוד כלים מיסטיים — רשת כלים עם באנר גדול ואנימציות כניסה
 */

import { motion, useReducedMotion } from 'framer-motion';
import { BookMarked } from 'lucide-react';

import { ToolGrid } from '@/components/features/shared/ToolGrid';
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader';
import { animations } from '@/lib/animations/presets';

/** עמוד כלים מיסטיים — יעד טאב הכלים בניווט התחתון */
export default function ToolsPage() {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion ? {} : animations.pageEntry;

  return (
    <motion.div dir="rtl" className="space-y-8" {...motionProps}>
      <StandardSectionHeader
        title="הכלים המיסטיים"
        description="בחר כלי וגלה את עצמך"
        icon={<BookMarked className="w-6 h-6" />}
      />

      {/* רשת כלים */}
      <ToolGrid />
    </motion.div>
  );
}
