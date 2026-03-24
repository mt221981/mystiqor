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
      <div className="flex min-h-screen bg-surface stars-bg relative" dir="rtl">
        {/* רקע — גלואות צפות */}
        <div className="fixed top-1/4 -left-20 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px] -z-10 pointer-events-none" aria-hidden="true" />
        <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-secondary-container/5 rounded-full blur-[100px] -z-10 pointer-events-none" aria-hidden="true" />

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
