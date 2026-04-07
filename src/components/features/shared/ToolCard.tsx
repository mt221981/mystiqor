'use client'

/**
 * ToolCard — כרטיס כלי אחיד לדאשבורד ולעמוד הכלים
 * עיצוב icon-forward: אייקון Lucide במרכז עיגול צבעוני + שם + תיאור
 * שני variants: hero (גבוה, דאשבורד) ו-grid (רחב, עמוד כלים)
 */

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ToolDefinition } from '@/lib/constants/tools'

/** Props של כרטיס כלי */
interface ToolCardProps {
  /** הגדרת הכלי */
  readonly tool: ToolDefinition
  /** hero = דאשבורד (גבוה), grid = עמוד כלים (רחב) */
  readonly variant?: 'hero' | 'grid'
}

/** כרטיס כלי אחיד — אייקון + שם + תיאור */
export function ToolCard({ tool, variant = 'hero' }: ToolCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const Icon = tool.Icon

  return (
    <Link href={tool.href}>
      <motion.div
        whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className="h-full"
      >
        <div className={cn(
          'relative overflow-hidden rounded-2xl border border-border/20 bg-surface-container',
          'transition-all duration-300 group',
          'hover:border-primary/25 hover:shadow-lg hover:shadow-primary-container/10',
          variant === 'hero' ? 'aspect-[4/5]' : 'aspect-[3/4]'
        )}>
          {/* רקע גרדיאנט עדין */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500',
            tool.gradient
          )} />

          {/* תוכן */}
          <div className="relative h-full flex flex-col items-center justify-center gap-3 px-4 py-6">
            {/* עיגול אייקון */}
            <div
              className="flex items-center justify-center rounded-2xl w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${tool.accentColor}18` }}
            >
              <Icon
                weight="duotone"
                className="w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 group-hover:drop-shadow-[0_0_6px_currentColor]"
                style={{ color: tool.accentColor }}
              />
            </div>

            {/* שם הכלי */}
            <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface text-center leading-tight">
              {tool.name}
            </h3>

            {/* תיאור */}
            <p className="font-body text-xs sm:text-sm text-on-surface-variant/70 text-center line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
