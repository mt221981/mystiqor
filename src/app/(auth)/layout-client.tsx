/**
 * לייאאוט מוגן — חלק קליינט
 * עוטף את התוכן עם QueryClientProvider, Toaster, ומבנה Sidebar + Header + MobileNav
 * אחראי על מבנה האפליקציה המלא: סרגל צד, כותרת עליונה וניווט מובייל
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { defaultQueryOptions } from '@/lib/query/cache-config';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { MobileNav } from '@/components/layouts/MobileNav';

import type { ReactNode } from 'react';

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
        <div className="fixed top-1/4 -left-20 w-[500px] h-[500px] bg-primary-container/8 rounded-full blur-[120px] -z-10 pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" aria-hidden="true" />
        <div className="fixed bottom-1/4 -right-20 w-[400px] h-[400px] bg-secondary-container/8 rounded-full blur-[120px] -z-10 pointer-events-none animate-[pulse_12s_ease-in-out_infinite]" aria-hidden="true" />
        <div className="fixed top-1/2 left-1/3 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[100px] -z-10 pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" aria-hidden="true" />

        {/* סרגל צד לדסקטופ — מוסתר במובייל */}
        <div className="hidden md:flex md:w-64 md:shrink-0">
          <Sidebar />
        </div>

        {/* אזור תוכן ראשי */}
        <div className="flex flex-1 flex-col">
          <Header onMobileMenuOpen={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 overflow-auto pt-16">
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
