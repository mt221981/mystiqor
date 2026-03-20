/**
 * לייאאוט מוגן — חלק קליינט
 * עוטף את התוכן עם QueryClientProvider, Toaster, ומבנה sidebar + main
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { defaultQueryOptions } from '@/lib/query/cache-config';

import type { ReactNode } from 'react';

// ===== ממשקים =====

/** פרופס של לייאאוט הקליינט */
interface AuthLayoutClientProps {
  readonly children: ReactNode;
}

// ===== קומפוננטה =====

/** לייאאוט קליינט מוגן — מספק React Query, Toaster ומבנה דף */
export default function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  /** יצירת QueryClient חד-פעמית לכל instance */
  const [queryClient] = useState(() => new QueryClient(defaultQueryOptions()));

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen">
        {/* Sidebar — placeholder עד לבניית הקומפוננטה המלאה */}
        <aside className="hidden w-64 shrink-0 border-e border-sidebar-border bg-sidebar md:block">
          <div className="flex h-16 items-center gap-2 px-4">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary/20" />
            <span className="text-lg font-bold text-sidebar-foreground">
              MystiQor
            </span>
          </div>
          <nav className="px-3 py-4">
            <p className="px-2 text-xs text-sidebar-foreground/50">
              תפריט ניווט — ייבנה בשלב הבא
            </p>
          </nav>
        </aside>

        {/* אזור תוכן ראשי */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* התראות toast — ממוקם בצד שמאל (RTL) */}
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
