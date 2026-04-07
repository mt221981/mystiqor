'use client';

/**
 * רשת כלים מיסטיים — 10 כלים עם כרטיסים אחידים ואנימציות stagger
 * משתמשת ב-ToolCard ו-ALL_TOOLS כמקור נתונים אחיד
 */

import { cn } from '@/lib/utils/cn';
import { motion, useReducedMotion } from 'framer-motion';
import { ALL_TOOLS } from '@/lib/constants/tools';
import { ToolCard } from './ToolCard';

/** Props של רשת כלים */
export interface ToolGridProps {
  readonly className?: string;
}

/** רשת 10 כלים אחידים */
export function ToolGrid({ className }: ToolGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5', className)}
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? {} : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {ALL_TOOLS.map((tool) => (
        <motion.div
          key={tool.id}
          variants={shouldReduceMotion ? {} : {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <ToolCard tool={tool} variant="grid" />
        </motion.div>
      ))}
    </motion.div>
  );
}
