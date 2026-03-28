'use client';

/**
 * סרגל ניווט ראשי — סרגל צד מתקפל עם אייקונים מיסטיים וקטגוריות
 * כולל תפריט קטגוריות, מצב פעיל, סרגל שימוש חי ותגובתיות למובייל
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GiCrystalBall,
  GiAbacus,
  GiAstrolabe,
  GiQuillInk,
  GiPaintBrush,
  GiHandOfGod,
  GiCardRandom,
  GiBodyBalance,
  GiDreamCatcher,
  GiSunRadiations,
  GiCalendar,
  GiCompass,
  GiLovers,
  GiHearts,
  GiBriefcase,
  GiScrollUnfurled,
  GiAllSeeingEye,
  GiMirrorMirror,
  GiSparkles,
  GiTargetArrows,
  GiNotebook,
  GiLightBulb,
  GiGraduateCap,
  GiNewspaper,
  GiMountainRoad,
} from 'react-icons/gi';
import {
  LayoutDashboard,
  Home,
  MessageCircle,
  Smile,
  User,
  Settings,
  CreditCard,
  Tag,
  Gift,
  Bell,
  ChevronDown,
  ChevronUp,
  History,
  BarChart3,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSubscription } from '@/hooks/useSubscription';

// ===== ממשקי טיפוסים =====

/** פריט ניווט בודד */
interface NavItem {
  /** תווית בעברית */
  readonly label: string;
  /** נתיב הקישור */
  readonly href: string;
  /** אייקון — תומך גם ב-lucide וגם ב-react-icons */
  readonly icon: React.ComponentType<{ className?: string }>;
}

/** קבוצת ניווט עם כותרת ופריטים */
interface NavSection {
  /** שם הקטגוריה בעברית */
  readonly title: string;
  /** פריטי הניווט בקטגוריה */
  readonly items: readonly NavItem[];
}

// ===== קבועי ניווט =====

/** כל קטגוריות הניווט מאורגנות לפי סדר */
const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'ראשי',
    items: [
      { label: 'לוח בקרה', href: '/dashboard', icon: LayoutDashboard },
      { label: 'דף הבית', href: '/', icon: Home },
    ],
  },
  {
    title: 'כלים מיסטיים',
    items: [
      { label: 'נומרולוגיה', href: '/tools/numerology', icon: GiAbacus },
      { label: 'אסטרולוגיה', href: '/tools/astrology', icon: GiAstrolabe },
      { label: 'גרפולוגיה', href: '/tools/graphology', icon: GiQuillInk },
      { label: 'ציור', href: '/tools/drawing', icon: GiPaintBrush },
      { label: 'קריאה בכף יד', href: '/tools/palmistry', icon: GiHandOfGod },
      { label: 'טארוט', href: '/tools/tarot', icon: GiCardRandom },
      { label: 'עיצוב אנושי', href: '/tools/human-design', icon: GiBodyBalance },
      { label: 'חלומות', href: '/tools/dream', icon: GiDreamCatcher },
    ],
  },
  {
    title: 'אסטרולוגיה מתקדמת',
    items: [
      { label: 'תחזית יומית', href: '/tools/astrology/forecast', icon: GiSunRadiations },
      { label: 'לוח אסטרולוגי', href: '/tools/astrology/calendar', icon: GiCalendar },
      { label: 'מעברים', href: '/tools/astrology/transits', icon: GiCompass },
      { label: 'חזרת שמש', href: '/tools/astrology/solar-return', icon: GiSunRadiations },
      { label: 'סינסטרי', href: '/tools/astrology/synastry', icon: GiLovers },
    ],
  },
  {
    title: 'מתקדם',
    items: [
      { label: 'התאמה', href: '/tools/compatibility', icon: GiHearts },
      { label: 'קריירה', href: '/tools/career', icon: GiBriefcase },
      { label: 'מסמך', href: '/tools/document', icon: GiScrollUnfurled },
      { label: 'מערכות יחסים', href: '/tools/relationships', icon: GiLovers },
      { label: 'סינתזה', href: '/tools/synthesis', icon: GiAllSeeingEye },
      { label: 'אישיות', href: '/tools/personality', icon: GiMirrorMirror },
    ],
  },
  {
    title: 'מסע אישי',
    items: [
      { label: 'מאמן AI', href: '/coach', icon: GiCrystalBall },
      { label: 'יעדים', href: '/goals', icon: GiTargetArrows },
      { label: 'מצב רוח', href: '/mood', icon: Smile },
      { label: 'יומן', href: '/journal', icon: GiNotebook },
      { label: 'תובנות יומיות', href: '/tools/daily-insights', icon: GiLightBulb },
    ],
  },
  {
    title: 'למידה',
    items: [
      { label: 'מדריכים', href: '/learn/tutorials', icon: GiGraduateCap },
      { label: 'בלוג', href: '/learn/blog', icon: GiNewspaper },
      { label: 'מורה אסטרולוגיה', href: '/learn/astrology', icon: GiAstrolabe },
      { label: 'מילון אסטרולוגי', href: '/learn/astrology/dictionary', icon: GiAstrolabe },
      { label: 'מורה ציור', href: '/learn/drawing', icon: GiPaintBrush },
    ],
  },
  {
    title: 'היסטוריה ואנליטיקה',
    items: [
      { label: 'היסטוריית ניתוחים', href: '/history', icon: History },
      { label: 'השוואת ניתוחים', href: '/history/compare', icon: GitCompare },
      { label: 'אנליטיקה אישית', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'חשבון',
    items: [
      { label: 'פרופיל', href: '/profile', icon: User },
      { label: 'הגדרות', href: '/settings', icon: Settings },
      { label: 'מנוי', href: '/subscription', icon: CreditCard },
      { label: 'תמחור', href: '/pricing', icon: Tag },
      { label: 'הפניות', href: '/referrals', icon: Gift },
      { label: 'תזכורות', href: '/notifications', icon: Bell },
    ],
  },
] as const;

// ===== קומפוננטות פנימיות =====

/** מאפייני קטגוריה מתקפלת */
interface CollapsibleSectionProps {
  /** נתוני הקטגוריה */
  readonly section: NavSection;
  /** האם הקטגוריה פתוחה */
  readonly isOpen: boolean;
  /** פונקציית מיתוג פתיחה/סגירה */
  readonly onToggle: () => void;
  /** הנתיב הנוכחי לזיהוי פריט פעיל */
  readonly currentPath: string;
}

/** קטגוריית ניווט מתקפלת עם אנימציה */
function CollapsibleSection({
  section,
  isOpen,
  onToggle,
  currentPath,
}: CollapsibleSectionProps) {
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2',
          'text-xs font-semibold uppercase tracking-wider',
          'text-gold-dim/70 hover:text-gold font-label',
          'transition-colors duration-200'
        )}
        aria-expanded={isOpen}
      >
        <span>{section.title}</span>
        <ChevronIcon className="h-3.5 w-3.5" />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col gap-0.5 px-2" aria-label={section.title}>
          {section.items.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== '/' && currentPath.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2',
                  'text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-container/20 text-primary shadow-sm shadow-primary-container/20 border border-primary/10'
                    : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** סרגל שימוש — מציג אחוזי שימוש חיים מהמנוי */
function UsageBar() {
  const { subscription } = useSubscription();

  /** חישוב אחוז שימוש — פרימיום: ללא הגבלה */
  const isPremium = subscription.plan_type !== 'free';

  const usagePercent =
    !isPremium && subscription.analyses_limit > 0
      ? Math.round((subscription.analyses_used / subscription.analyses_limit) * 100)
      : 0;

  /** הגבלה לטווח 0-100 */
  const clampedPercent = Math.min(100, Math.max(0, usagePercent));

  if (isPremium) {
    return (
      <div className="border-t border-outline-variant/10 px-4 py-4">
        <div className="mb-2 flex items-center justify-between text-xs text-on-surface-variant">
          <span>שימוש חודשי</span>
          <span className="text-gold">ללא הגבלה</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-gradient-to-l from-gold to-gold-bright shadow-[0_0_15px_rgba(212,168,83,0.4)] transition-all duration-500"
            style={{ width: '0%' }}
            role="progressbar"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="שימוש חודשי במנוי"
          />
        </div>
        <p className="mt-1.5 text-xs text-on-surface-variant/60">
          מנוי פרימיום — שימוש בלתי מוגבל
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-outline-variant/10 px-4 py-4">
      <div className="mb-2 flex items-center justify-between text-xs text-on-surface-variant">
        <span>שימוש חודשי</span>
        <span>{clampedPercent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full rounded-full bg-gradient-to-l from-primary-container to-gold shadow-[0_0_15px_rgba(143,45,230,0.4)] transition-all duration-500"
          style={{ width: `${clampedPercent}%` }}
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="שימוש חודשי במנוי"
        />
      </div>
      <p className="mt-1.5 text-xs text-gold-dim/60">
        שדרג לפרימיום לשימוש בלתי מוגבל
      </p>
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** סרגל צד ניווט ראשי — מתקפל, עם קטגוריות, אייקונים מיסטיים, מצב פעיל וסרגל שימוש חי */
export function Sidebar() {
  const pathname = usePathname();

  /** מצב פתיחת הקטגוריות — כולן פתוחות כברירת מחדל */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(NAV_SECTIONS.map((section) => [section.title, true]))
  );

  /** מיתוג פתיחה/סגירה של קטגוריה */
  const toggleSection = useCallback((title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col',
        'bg-surface/95 glass-panel',
        'border-e border-outline-variant/10'
      )}
      aria-label="ניווט ראשי"
    >
      {/* לוגו */}
      <div className="flex items-center gap-2.5 border-b border-outline-variant/10 px-4 py-5">
        <GiSparkles className="h-7 w-7 text-gold" />
        <span className="font-headline text-xl font-bold text-gradient-gold">
          MystiQor
        </span>
      </div>

      {/* קטגוריות ניווט */}
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <CollapsibleSection
            key={section.title}
            section={section}
            isOpen={openSections[section.title] ?? true}
            onToggle={() => toggleSection(section.title)}
            currentPath={pathname}
          />
        ))}
      </div>

      {/* סרגל שימוש חי */}
      <UsageBar />
    </aside>
  );
}
