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
      <div className="flex min-h-screen bg-background" dir="rtl">
        {/* סרגל צד לדסקטופ — מוסתר במובייל */}
        <div className="hidden md:flex md:w-64 md:shrink-0">
          <Sidebar />
        </div>

        {/* אזור תוכן ראשי */}
        <div className="flex flex-1 flex-col">
          <Header onMobileMenuOpen={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
