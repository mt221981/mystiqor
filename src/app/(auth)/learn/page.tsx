'use client';

/**
 * דף מרכז למידה — /learn
 * עמוד ניווט ל-4 אזורי למידה: מדריכים, בלוג, חונך אסטרולוגי, חונך ציור
 */

import Link from 'next/link';
import { BookOpen, GraduationCap, Newspaper, Stars, Pencil } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ===== טיפוסים =====

/** הגדרת קישור במרכז הלמידה */
interface LearningHubLink {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

// ===== קבועים =====

/** קישורי מרכז הלמידה */
const LEARN_LINKS: LearningHubLink[] = [
  {
    href: '/learn/tutorials',
    icon: GraduationCap,
    title: 'מסלולי למידה',
    description: 'לימוד מובנה ומדורג בנושאי אסטרולוגיה, נומרולוגיה וציורים',
  },
  {
    href: '/learn/blog',
    icon: Newspaper,
    title: 'בלוג',
    description: 'מאמרים חינוכיים ומדריכים מעמיקים על תחומי ה-MystiQor',
  },
  {
    href: '/learn/astrology',
    icon: Stars,
    title: 'חונך אסטרולוגי',
    description: 'שאל שאלות ותקבל הסברים אסטרולוגיים מותאמים אישית',
  },
  {
    href: '/learn/drawing',
    icon: Pencil,
    title: 'חונך ציור',
    description: 'למד לפרש ציורים עם הדרכה שלב אחר שלב',
  },
];

// ===== קומפוננטה ראשית =====

/**
 * LearnPage — מרכז למידה עם ניווט ל-4 אזורים
 */
export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-primary" />
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">מרכז למידה</h1>
          <p className="font-body text-on-surface-variant text-sm">
            גלה, למד והעמיק את הידע שלך בעולם המיסטי
          </p>
        </div>
      </div>

      {/* רשת קישורים */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LEARN_LINKS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group">
            <div className="bg-surface-container rounded-xl border border-outline-variant/5 hover:border-primary/10 transition-colors cursor-pointer h-full p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10 group-hover:bg-primary-container/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-headline font-semibold text-on-surface text-lg">{title}</h2>
              </div>
              <p className="font-body text-sm text-on-surface-variant">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
