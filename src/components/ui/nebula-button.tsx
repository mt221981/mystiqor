'use client';

/**
 * NebulaButton — כפתור עם שלושה וריאנטים:
 * - primary: גרדיאנט nebula (primary-container → secondary-container)
 * - secondary: גבול עדין עם hover state
 * - icon: כפתור עגול לאייקונים
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ButtonHTMLAttributes } from 'react';

/** פרופס של NebulaButton */
interface NebulaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'icon';
}

/** כפתור עיצוב nebula עם גרדיאנט קוסמי */
const NebulaButton = forwardRef<HTMLButtonElement, NebulaButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    const variants = {
      primary:
        'bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 px-6 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95 transition-transform',
      secondary:
        'border border-outline-variant/20 hover:bg-surface-container rounded-lg py-2 px-4 text-on-surface-variant hover:text-on-surface transition-colors',
      icon: 'text-on-surface-variant hover:text-primary p-2 rounded-full active:scale-95 transition-all',
    };
    return (
      <button ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </button>
    );
  }
);
NebulaButton.displayName = 'NebulaButton';
export { NebulaButton };
