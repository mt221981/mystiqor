'use client';

/**
 * GlassInput — שדה קלט כהה עם עיצוב glass:
 * רקע surface-container-lowest, ללא גבול, עם פוקוס ring סגול
 * מחליף את שדות shadcn הסטנדרטיים בדפי הכלים
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import type { InputHTMLAttributes } from 'react';

/** שדה קלט כהה עם עיצוב glass */
const GlassInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-surface-container-lowest border-none rounded-lg p-4',
          'text-on-surface placeholder:text-outline/40',
          'focus:outline-none focus:ring-1 focus:ring-primary/40',
          'font-body text-sm',
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = 'GlassInput';
export { GlassInput };
