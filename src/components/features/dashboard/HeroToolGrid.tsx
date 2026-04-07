'use client';

/**
 * HeroToolGrid — גריד 6 כלים עיקריים עם אייקונים
 * 2 עמודות במובייל / 3 בטאבלט / 6 בדסקטופ
 */

import { motion, useReducedMotion } from 'framer-motion';
import { PRIMARY_TOOLS } from '@/lib/constants/tools';
import { ToolCard } from '@/components/features/shared/ToolCard';

/** וריאנטי אנימציה */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/** גריד 6 הכלים העיקריים */
export function HeroToolGrid() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="flex items-center justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient-gold drop-shadow-sm font-headline">
          כלים לגילוי עצמי
        </h2>
      </div>

      {/* גריד */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto"
        variants={shouldReduceMotion ? {} : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {PRIMARY_TOOLS.map((tool) => (
          <motion.div key={tool.id} variants={shouldReduceMotion ? {} : itemVariants}>
            <ToolCard tool={tool} variant="hero" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
