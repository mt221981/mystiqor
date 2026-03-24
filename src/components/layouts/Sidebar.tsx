'use client';

/**
 * סרגל ניווט ראשי — סרגל צד מתקפל עם קטגוריות וניווט
 * כולל תפריט קטגוריות, מצב פעיל, סרגל שימוש ותגובתיות למובייל
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Hash,
  Stars,
  PenTool,
  Palette,
  Hand,
  Layers,
  Fingerprint,
  Moon,
  Heart,
  Briefcase,
  FileText,
  HelpCircle,
  Sparkles,
  Brain,
  MessageCircle,
  Target,
  Smile,
  BookOpen,
  Lightbulb,
  GraduationCap,
  Newspaper,
  User,
  Settings,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

import type { LucideIcon } from 'lucide-react';

// ===== ממשקי טיפוסים =====

/** פריט ניווט בודד */
interface NavItem {
  /** תווית בעברית */
  readonly label: string;
  /** נתיב הקישור */
  readonly href: string;
  /** אייקון מ-lucide */
  readonly icon: LucideIcon;
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
      { label: 'נומרולוגיה', href: '/numerology', icon: Hash },
      { label: 'אסטרולוגיה', href: '/astrology', icon: Stars },
      { label: 'גרפולוגיה', href: '/graphology', icon: PenTool },
      { label: 'ציור', href: '/drawing', icon: Palette },
      { label: 'כירומנטיה', href: '/palmistry', icon: Hand },
      { label: 'טארוט', href: '/tarot', icon: Layers },
      { label: 'עיצוב אנושי', href: '/human-design', icon: Fingerprint },
      { label: 'חלומות', href: '/dreams', icon: Moon },
    ],
  },
  {
    title: 'מתקדם',
    items: [
      { label: 'התאמה', href: '/compatibility', icon: Heart },
      { label: 'קריירה', href: '/career', icon: Briefcase },
      { label: 'מסמך', href: '/document', icon: FileText },
      { label: 'שאלה', href: '/question', icon: HelpCircle },
      { label: 'סינתזה', href: '/tools/synthesis', icon: Sparkles },
      { label: 'אישיות', href: '/personality', icon: Brain },
    ],
  },
  {
    title: 'מסע אישי',
    items: [
      { label: 'מאמן AI', href: '/coach', icon: MessageCircle },
      { label: 'יעדים', href: '/goals', icon: Target },
      { label: 'מצב רוח', href: '/mood', icon: Smile },
      { label: 'יומן', href: '/journal', icon: BookOpen },
      { label: 'תובנות יומיות', href: '/daily-insights', icon: Lightbulb },
    ],
  },
  {
    title: 'למידה',
    items: [
      { label: 'מדריכים', href: '/tutorials', icon: GraduationCap },
      { label: 'בלוג', href: '/blog', icon: Newspaper },
    ],
  },
  {
    title: 'חשבון',
    items: [
      { label: 'פרופיל', href: '/profile', icon: User },
      { label: 'הגדרות', href: '/settings', icon: Settings },
      { label: 'מנוי', href: '/subscription', icon: CreditCard },
    ],
  },
] as const;

/** אחוז שימוש לדוגמה — יוחלף בנתוני מנוי אמיתיים */
const PLACEHOLDER_USAGE_PERCENT = 42;

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
          'text-purple-300/70 hover:text-purple-200',
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
                    ? 'bg-purple-600/30 text-purple-100 shadow-sm shadow-purple-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** סרגל שימוש — מציג אחוזי שימוש במנוי */
function UsageBar() {
  return (
    <div className="border-t border-white/10 px-4 py-4">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span>שימוש חודשי</span>
        <span>{PLACEHOLDER_USAGE_PERCENT}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-l from-purple-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${PLACEHOLDER_USAGE_PERCENT}%` }}
          role="progressbar"
          aria-valuenow={PLACEHOLDER_USAGE_PERCENT}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="שימוש חודשי במנוי"
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        שדרג לפרימיום לשימוש בלתי מוגבל
      </p>
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** סרגל צד ניווט ראשי — מתקפל, עם קטגוריות, מצב פעיל וסרגל שימוש */
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
        'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950',
        'border-e border-white/5'
      )}
      aria-label="ניווט ראשי"
    >
      {/* לוגו */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-5">
        <Sparkles className="h-6 w-6 text-purple-400" />
        <span className="bg-gradient-to-l from-purple-400 to-indigo-400 bg-clip-text text-xl font-bold text-transparent">
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

      {/* סרגל שימוש */}
      <UsageBar />
    </aside>
  );
}
