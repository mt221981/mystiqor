'use client';

/**
 * ניווט מובייל — שכבת-על (Sheet) שנפתחת מצד ימין (RTL)
 * מכילה את הסרגל הצדי המלא, עם רקע כהה ואנימציית החלקה
 * מימוש ידני ללא shadcn/ui — ישודרג כשיותקן
 */

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Sidebar } from '@/components/layouts/Sidebar';

// ===== ממשקי טיפוסים =====

/** מאפייני ניווט מובייל */
interface MobileNavProps {
  /** האם התפריט פתוח */
  readonly isOpen: boolean;
  /** פונקציית סגירה */
  readonly onClose: () => void;
}

// ===== קומפוננטה ראשית =====

/** ניווט מובייל — שכבת-על עם סרגל צדי, נפתח מימין (RTL) */
export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  /** סגירה עם מקש Escape */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  /** מאזין למקשים ונעילת גלילה כשהתפריט פתוח */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* רקע כהה שמאחורי התפריט */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        style={{ zIndex: 'var(--z-overlay)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* פאנל הניווט — נכנס מצד ימין (RTL) */}
      <div
        className={cn(
          'fixed inset-y-0 end-0 w-72',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        )}
        style={{ zIndex: 'var(--z-panel)' }}
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ניווט"
      >
        {/* כפתור סגירה */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute start-0 top-4 -translate-x-full rtl:translate-x-full',
            'inline-flex items-center justify-center rounded-full',
            'h-8 w-8 bg-surface-container-high text-on-surface-variant',
            'hover:bg-surface-container-highest hover:text-on-surface',
            'transition-colors duration-200'
          )}
          aria-label="סגור תפריט"
        >
          <X className="h-4 w-4" />
        </button>

        {/* תוכן הסרגל הצדי */}
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
