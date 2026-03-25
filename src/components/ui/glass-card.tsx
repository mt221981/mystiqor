'use client';

/**
 * GlassCard — קארד זכוכיתי עם שלושה וריאנטים:
 * - default: רקע surface-container עם גבול עדין
 * - glass: blur backdrop עם שקיפות
 * - highlighted: גרדיאנט primary-to-secondary
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes, ReactNode } from 'react';

/** פרופס של GlassCard */
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'default' | 'glass' | 'highlighted' | 'mystic' | 'gold';
  readonly children: ReactNode;
}

/** קארד זכוכיתי עם וריאנטים */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-container rounded-xl p-6 border border-outline-variant/5',
      glass: 'bg-surface-container/60 backdrop-blur-xl rounded-xl p-6',
      highlighted: 'bg-gradient-to-br from-primary-container to-secondary-container rounded-xl p-8',
      mystic: 'mystic-card rounded-xl p-6',
      gold: 'mystic-card-gold rounded-xl p-6',
    };
    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
export { GlassCard };
