'use client';

/**
 * סרגל טאבים תחתון — ניווט ראשי למובייל עם 5 טאבים
 * מוצג רק במובייל (md:hidden), ממוקם בתחתית המסך עם glass effect
 * כולל זיהוי מצב פעיל, נקודת אינדיקטור וסמל GiCrystalBall עבור מאמן AI
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Lightbulb, Grid2x2, User } from 'lucide-react';
import { GiCrystalBall } from 'react-icons/gi';

// ===== קבועי ניווט =====

/** הגדרת טאב ניווט תחתון */
interface TabDefinition {
  /** תווית בעברית */
  readonly label: string;
  /** נתיב היעד */
  readonly href: string;
  /** קומפוננטת האייקון */
  readonly Icon: React.ComponentType<{ className?: string }>;
}

/** 5 הטאבים הראשיים לניווט תחתון במובייל */
const TABS: readonly TabDefinition[] = [
  { label: 'לוח בקרה', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'מאמן AI', href: '/coach', Icon: GiCrystalBall },
  { label: 'תובנות', href: '/daily-insights', Icon: Lightbulb },
  { label: 'כלים', href: '/tools', Icon: Grid2x2 },
  { label: 'פרופיל', href: '/profile', Icon: User },
] as const;

// ===== קומפוננטה ראשית =====

/** סרגל טאבים תחתון — מוצג רק במובייל, עם glass effect ומצב פעיל חכם */
export function BottomTabBar() {
  const pathname = usePathname();

  /**
   * בדיקת מצב פעיל לטאב לפי נתיב
   * לוח בקרה — התאמה מדויקת בלבד
   * שאר הטאבים — גם התאמה חלקית (prefix)
   */
  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden glass-nav border-t border-border/20 flex items-center justify-around"
      style={{
        zIndex: 'var(--z-tabs)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '56px',
      }}
      aria-label="ניווט ראשי"
    >
      {TABS.map(({ label, href, Icon }) => {
        const active = isActive(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[56px] relative',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
            aria-current={active ? 'page' : undefined}
          >
            {/* אייקון הטאב עם זוהר במצב פעיל */}
            <Icon
              className={cn(
                'w-5 h-5',
                active && 'drop-shadow-[0_0_6px_rgba(221,184,255,0.6)]'
              )}
            />

            {/* תווית הטאב */}
            <span className="text-[10px] font-label font-medium">{label}</span>

            {/* נקודת אינדיקטור במצב פעיל */}
            {active && (
              <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
