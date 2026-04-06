'use client';

/**
 * סרגל ניווט ראשי — סרגל צד מתקפל עם אייקונים מיסטיים וקטגוריות
 * כולל תפריט קטגוריות, מצב פעיל, סרגל שימוש חי ותגובתיות למובייל
 */

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  Hash,
  Orbit,
  PenTool,
  Palette,
  Hand,
  Layers,
  Dna,
  Moon,
  SunDim,
  CalendarDays,
  Sunrise,
  HeartHandshake,
  Heart,
  Compass,
  FileSearch,
  Users,
  Merge,
  Brain,
  Sparkles,
  Target,
  NotebookPen,
  Sun,
  GraduationCap,
  Newspaper,
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
  /** אייקון Lucide */
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

/** כל קטגוריות הניווט מאורגנות לפי סדר — 6 קטגוריות (per D-04/D-05) */
const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'כלים מיסטיים',
    items: [
      { label: 'נומרולוגיה', href: '/tools/numerology', icon: Hash },
      { label: 'אסטרולוגיה', href: '/tools/astrology', icon: Orbit },
      { label: 'גרפולוגיה', href: '/tools/graphology', icon: PenTool },
      { label: 'ציור', href: '/tools/drawing', icon: Palette },
      { label: 'קריאה בכף יד', href: '/tools/palmistry', icon: Hand },
      { label: 'טארוט', href: '/tools/tarot', icon: Layers },
      { label: 'עיצוב אנושי', href: '/tools/human-design', icon: Dna },
      { label: 'חלומות', href: '/tools/dream', icon: Moon },
    ],
  },
  {
    title: 'עוד כלים',
    items: [
      { label: 'תחזית יומית', href: '/tools/astrology/forecast', icon: SunDim },
      { label: 'לוח אסטרולוגי', href: '/tools/astrology/calendar', icon: CalendarDays },
      { label: 'מעברים', href: '/tools/astrology/transits', icon: Orbit },
      { label: 'חזרת שמש', href: '/tools/astrology/solar-return', icon: Sunrise },
      { label: 'סינסטרי', href: '/tools/astrology/synastry', icon: HeartHandshake },
      { label: 'התאמה', href: '/tools/compatibility', icon: Heart },
      { label: 'קריירה', href: '/tools/career', icon: Compass },
      { label: 'מסמך', href: '/tools/document', icon: FileSearch },
      { label: 'מערכות יחסים', href: '/tools/relationships', icon: Users },
      { label: 'סינתזה', href: '/tools/synthesis', icon: Merge },
      { label: 'אישיות', href: '/tools/personality', icon: Brain },
    ],
  },
  {
    title: 'מסע אישי',
    items: [
      { label: 'נועה — המאמנת', href: '/coach', icon: Sparkles },
      { label: 'יעדים', href: '/goals', icon: Target },
      { label: 'מצב רוח', href: '/mood', icon: Smile },
      { label: 'יומן', href: '/journal', icon: NotebookPen },
      { label: 'תובנות יומיות', href: '/tools/daily-insights', icon: Sun },
    ],
  },
  {
    title: 'למידה',
    items: [
      { label: 'מדריכים', href: '/learn/tutorials', icon: GraduationCap },
      { label: 'בלוג', href: '/learn/blog', icon: Newspaper },
      { label: 'מורה אסטרולוגיה', href: '/learn/astrology', icon: Orbit },
      { label: 'מילון אסטרולוגי', href: '/learn/astrology/dictionary', icon: Orbit },
      { label: 'מורה ציור', href: '/learn/drawing', icon: Palette },
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

/** מפתח localStorage לשמירת מצב קטגוריות הסרגל */
const SIDEBAR_STORAGE_KEY = 'mystiqor-sidebar-sections';

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
    <div className="mb-1 border-b border-outline-variant/5 pb-2">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2',
          'text-sm font-semibold uppercase tracking-wider',
          'text-on-surface-variant/60 hover:text-on-surface-variant/80 font-label',
          'transition-colors duration-200'
        )}
        aria-expanded={isOpen}
      >
        <span>{section.title}</span>
        <ChevronIcon className="h-4 w-4" />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-2" aria-label={section.title}>
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
                  'flex items-center gap-3 rounded-md px-3 py-2',
                  'text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border-s-2 border-s-primary'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
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
        <p className="mt-1.5 text-xs text-on-surface-variant/80">
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
      <p className="mt-1.5 text-xs text-gold-dim/85">
        שדרג לפרימיום לשימוש בלתי מוגבל
      </p>
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** סרגל צד ניווט ראשי — מתקפל, עם קטגוריות, אייקונים מיסטיים, מצב פעיל וסרגל שימוש חי */
export function Sidebar() {
  const pathname = usePathname();

  /** מצב פתיחה/סגירה של קטגוריות — נטען מ-localStorage או ברירת מחדל (הכל פתוח) */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // ברירת מחדל — כל הקטגוריות פתוחות לנגישות מלאה
    const defaults = Object.fromEntries(
      NAV_SECTIONS.map((section) => [section.title, true])
    );
    if (typeof window === 'undefined') return defaults;
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (!stored) return defaults;
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      // מיזוג — קטגוריות חדשות שלא בזיכרון יהיו פתוחות
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  });

  /** מיתוג פתיחה/סגירה של קטגוריה */
  const toggleSection = useCallback((title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  /** שמירת מצב קטגוריות ב-localStorage בכל שינוי (per D-06) */
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(openSections));
    } catch {
      // שגיאת כתיבה — localStorage מלא או חסום, ממשיכים בלי שמירה
    }
  }, [openSections]);

  return (
    <aside
      className={cn(
        'flex h-full w-80 flex-col',
        'bg-surface/60 backdrop-blur-md',
        'border-e border-outline-variant/10'
      )}
      aria-label="ניווט ראשי"
    >
      {/* לוגו — לחיצה מובילה לדף הבית */}
      <Link href="/dashboard" className="flex flex-col items-center text-center border-b border-primary/15 py-4 px-3 gap-0 hover:bg-surface-container-high/30 transition-colors">
        <Image src="/images/brand/logo.png" alt="MystiQor" width={200} height={100} className="w-40 h-auto object-contain blend-luminous -mb-1" style={{ maskImage: 'radial-gradient(ellipse 95% 80% at center, black 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 95% 80% at center, black 50%, transparent 100%)' }} />
        <span className="text-xs text-muted-foreground/70 font-body">המסע המיסטי שלך</span>
      </Link>

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
