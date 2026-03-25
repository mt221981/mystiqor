'use client';

/**
 * MysticSkeleton — שלד טעינה מיסטי עם אפקט shimmer סגול-זהב
 * מחליף את Skeleton הבסיסי עם אנימציית gradient sweep
 */

import { cn } from '@/lib/utils/cn';

/** Props של שלד טעינה מיסטי */
interface MysticSkeletonProps {
  /** CSS classes נוספים */
  readonly className?: string;
}

/** שלד טעינה מיסטי עם shimmer סגול-זהב */
export function MysticSkeleton({ className }: MysticSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-container relative overflow-hidden',
        className
      )}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(221,184,255,0.08) 30%, rgba(212,168,83,0.06) 50%, rgba(221,184,255,0.08) 70%, transparent 100%)',
        }}
      />
    </div>
  );
}

/** כרטיס שלד טעינה מיסטי — 4 שורות + בלוק גדול */
export function MysticSkeletonCard() {
  return (
    <div className="mystic-card rounded-xl p-6 space-y-4">
      <MysticSkeleton className="h-6 w-3/4" />
      <MysticSkeleton className="h-4 w-full" />
      <MysticSkeleton className="h-4 w-5/6" />
      <MysticSkeleton className="h-32 w-full" />
    </div>
  );
}
