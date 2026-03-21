/**
 * בדיקות לרכיב ToolGrid
 * ONBR-03: ToolGrid מתרנדר ומציג כרטיסי כלים
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToolGrid } from '@/components/features/shared/ToolGrid';

/** Mock של framer-motion — מונע בעיות JSDOM עם אנימציות */
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/** עוטף בקליינט React Query */
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('ToolGrid', () => {
  /**
   * בדיקה 1: ToolGrid מתרנדר ללא קריסה
   */
  it('renders without crash', () => {
    expect(() => {
      render(
        <TestWrapper>
          <ToolGrid />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  /**
   * בדיקה 2: לפחות כלי אחד גלוי בעברית
   */
  it('renders at least one Hebrew tool name', () => {
    render(
      <TestWrapper>
        <ToolGrid />
      </TestWrapper>
    );

    // בדיקה שלפחות אחד מהשמות בעברית מוצג
    const hebrewToolNames = ['נומרולוגיה', 'אסטרולוגיה', 'גרפולוגיה', 'ניתוח ציורים', 'כירומנטיה', 'טארוט'];
    const found = hebrewToolNames.some((name) => screen.queryByText(name) !== null);
    expect(found).toBe(true);
  });
});
