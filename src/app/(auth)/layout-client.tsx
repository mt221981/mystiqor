/**
 * לייאאוט מוגן — חלק קליינט
 * עוטף את התוכן עם QueryClientProvider, Toaster, ומבנה Sidebar + Header + MobileNav
 * אחראי על מבנה האפליקציה המלא: סרגל צד, כותרת עליונה וניווט מובייל
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import dynamic from 'next/dynamic';
import { defaultQueryOptions } from '@/lib/query/cache-config';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { MobileNav } from '@/components/layouts/MobileNav';
import { FloatingCoachBubble } from '@/components/features/floating-coach/FloatingCoachBubble';
import { BottomTabBar } from '@/components/layouts/BottomTabBar';

import type { ReactNode } from 'react';

/** פאנל מאמן AI צף — טעינה דינמית כי הוא כבד ולא נחוץ בטעינה ראשונית */
const FloatingCoachPanel = dynamic(
  () =>
    import('@/components/features/floating-coach/FloatingCoachPanel').then((m) => ({
      default: m.FloatingCoachPanel,
    })),
  { ssr: false }
);

// ===== ממשקים =====

/** פרופס של לייאאוט הקליינט */
interface AuthLayoutClientProps {
  readonly children: ReactNode;
}

// ===== קומפוננטה =====

/** לייאאוט קליינט מוגן — מספק React Query, Toaster, Sidebar, Header ו-MobileNav */
export default function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  /** יצירת QueryClient חד-פעמית לכל instance */
  const [queryClient] = useState(() => new QueryClient(defaultQueryOptions()));

  /** מצב פתיחת ניווט מובייל */
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-surface stars-bg aurora-bg relative" dir="rtl">
        {/* רקע — גלואות צפות מיסטיות */}
        <div className="fixed top-1/4 -start-20 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-primary-container/15 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" aria-hidden="true" />
        <div className="fixed bottom-1/4 -end-20 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-secondary-container/15 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none animate-[pulse_12s_ease-in-out_infinite]" aria-hidden="true" />
        <div className="fixed top-1/2 start-1/3 w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-tertiary/10 rounded-full blur-[60px] md:blur-[100px] -z-10 pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" aria-hidden="true" />

        {/* סרגל צד לדסקטופ — מוסתר במובייל */}
        <div className="hidden md:flex md:w-80 md:shrink-0">
          <Sidebar />
        </div>

        {/* אזור תוכן ראשי */}
        <div className="flex flex-1 flex-col">
          <Header onMobileMenuOpen={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 overflow-auto pt-16 pb-20 md:pb-0">
            <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
              {children}
            </div>
          </main>
        </div>

        {/* ניווט מובייל — שכבת-על */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />

        {/* בועת מאמן AI צפה — מופיעה בכל עמוד מאומת חוץ מ-/coach */}
        <FloatingCoachBubble />
        <FloatingCoachPanel />

        {/* טאבים תחתונים — מובייל בלבד */}
        <BottomTabBar />
      </div>

      {/* התראות toast — ממוקם בצד שמאל (נכון עבור RTL) */}
      <Toaster
        position="bottom-left"
        dir="rtl"
        toastOptions={{
          className: 'font-[family-name:var(--font-assistant)]',
        }}
      />
    </QueryClientProvider>
  );
}
