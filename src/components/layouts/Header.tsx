'use client';

/**
 * כותרת עליונה — לוגו, החלפת ערכת נושא, תפריט מובייל, תפריט משתמש
 * כולל תמיכה מלאה ב-RTL ועיצוב כהה
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Menu, Sparkles, User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useThemeStore } from '@/stores/theme';

// ===== ממשקי טיפוסים =====

/** מאפייני כותרת עליונה */
interface HeaderProps {
  /** פונקציית פתיחת תפריט מובייל */
  readonly onMobileMenuOpen?: () => void;
}

// ===== קומפוננטה ראשית =====

/** כותרת עליונה עם לוגו, החלפת ערכה, תפריט מובייל ותפריט משתמש */
export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /** סגירת תפריט משתמש בלחיצה מחוץ לאלמנט */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  /** מיתוג פתיחת/סגירת תפריט משתמש */
  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between',
        'border-b border-white/5 bg-gray-950/80 px-4',
        'backdrop-blur-md md:px-6'
      )}
      dir="rtl"
    >
      {/* צד ימין: כפתור מובייל + לוגו */}
      <div className="flex items-center gap-3">
        {/* כפתור תפריט מובייל — מוצג רק במסכים קטנים */}
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className={cn(
            'inline-flex items-center justify-center rounded-lg p-2 md:hidden',
            'text-gray-400 hover:bg-white/5 hover:text-white',
            'transition-colors duration-200'
          )}
          aria-label="פתח תפריט ניווט"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* לוגו — מוצג רק במובייל (בדסקטופ הלוגו בסרגל צד) */}
        <Link
          href="/"
          className="flex items-center gap-2 md:hidden"
          aria-label="מיסטיקור — דף הבית"
        >
          <Sparkles className="h-5 w-5 text-purple-400" />
          <span className="bg-gradient-to-l from-purple-400 to-indigo-400 bg-clip-text text-lg font-bold text-transparent">
            MystiQor
          </span>
        </Link>
      </div>

      {/* צד שמאל: פעולות */}
      <div className="flex items-center gap-2">
        {/* כפתור החלפת ערכת נושא */}
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'inline-flex items-center justify-center rounded-lg p-2',
            'text-gray-400 hover:bg-white/5 hover:text-white',
            'transition-colors duration-200'
          )}
          aria-label={theme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* תפריט משתמש */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={toggleUserMenu}
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'h-9 w-9 bg-purple-600/20 text-purple-300',
              'hover:bg-purple-600/30 hover:text-purple-200',
              'transition-colors duration-200'
            )}
            aria-label="תפריט משתמש"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <User className="h-4.5 w-4.5" />
          </button>

          {/* תפריט נפתח */}
          {isUserMenuOpen && (
            <div
              className={cn(
                'absolute start-0 top-full mt-2 w-48',
                'rounded-xl border border-white/10 bg-gray-900 py-1',
                'shadow-xl shadow-black/30',
                'animate-in fade-in slide-in-from-top-2 duration-200'
              )}
              role="menu"
              aria-label="אפשרויות משתמש"
            >
              <Link
                href="/profile"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm',
                  'text-gray-300 hover:bg-white/5 hover:text-white',
                  'transition-colors duration-150'
                )}
                role="menuitem"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>פרופיל</span>
              </Link>

              <Link
                href="/settings"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm',
                  'text-gray-300 hover:bg-white/5 hover:text-white',
                  'transition-colors duration-150'
                )}
                role="menuitem"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>הגדרות</span>
              </Link>

              <div className="my-1 border-t border-white/10" />

              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm',
                  'text-red-400 hover:bg-red-500/10 hover:text-red-300',
                  'transition-colors duration-150'
                )}
                role="menuitem"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  // TODO: חיבור לפונקציית התנתקות מ-Supabase Auth
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>התנתקות</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
