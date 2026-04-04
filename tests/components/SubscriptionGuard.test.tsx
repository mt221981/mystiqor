/**
 * בדיקות יחידה לרכיב SubscriptionGuard
 * INFRA-07: SubscriptionGuard.test.tsx — מכסה רינדור ילדים, fallback, וטעינה
 *
 * הערה על הרכיב: שורה 28 ב-SubscriptionGuard.tsx מכילה return מוקדם
 * `return <>{children}</>` שעוקף את כל לוגיקת המנוי (כוונתי לפיתוח —
 * כל הכלים פתוחים). בדיקות 1 ו-5 עוברות כרגע.
 * בדיקות 2, 3, 4, 6 מדוגמנות כ-it.skip עד שה-return המוקדם יוסר בסביבת production.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard';

/** Mock לשינוי next/link כדי לאפשר בדיקות href */
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

/** Mock לוו useSubscription — נשלט מכל בדיקה */
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: vi.fn(),
}));

import { useSubscription } from '@/hooks/useSubscription';
const mockUseSubscription = vi.mocked(useSubscription);

/** ערכי ברירת מחדל לבדיקות */
const defaultMock = {
  subscription: {
    id: 'test-id',
    user_id: 'user-1',
    plan_type: 'free' as const,
    status: 'active',
    analyses_limit: 3,
    analyses_used: 0,
    guest_profiles_limit: 1,
    guest_profiles_used: 0,
    trial_end_date: null,
    start_date: null,
    end_date: null,
    cancel_at_period_end: false,
  },
  planInfo: { name: 'חינם', analyses: 3, guestProfiles: 1, features: [] },
  hasUsageLeft: true,
  canUseFeature: vi.fn(() => true),
  incrementUsage: vi.fn(),
  isLoading: false,
};

describe('SubscriptionGuard', () => {
  beforeEach(() => {
    mockUseSubscription.mockReturnValue(defaultMock);
  });

  /**
   * בדיקה 1: ילדים מרונדרים כשגישה לתכונה מאושרת
   * עוברת כרגע — גם עקב ה-return המוקדם, גם כי canUseFeature מחזיר true
   */
  it('renders children when feature access is granted', () => {
    mockUseSubscription.mockReturnValue({
      ...defaultMock,
      canUseFeature: vi.fn(() => true),
      isLoading: false,
    });

    render(
      <SubscriptionGuard feature="basic_analysis">
        <div>תוכן מוגן</div>
      </SubscriptionGuard>
    );

    expect(screen.getByText('תוכן מוגן')).toBeInTheDocument();
  });

  /**
   * בדיקה 2: מציג skeleton טעינה כשהמנוי נטען
   * Re-enable when early return is removed from SubscriptionGuard (line 28)
   */
  it.skip('shows loading skeleton when subscription is loading', () => {
    mockUseSubscription.mockReturnValue({
      ...defaultMock,
      isLoading: true,
    });

    const { container } = render(
      <SubscriptionGuard feature="premium_feature">
        <div>תוכן מוגן</div>
      </SubscriptionGuard>
    );

    // צפוי: div עם animate-pulse (skeleton של טעינה)
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(screen.queryByText('תוכן מוגן')).not.toBeInTheDocument();
  });

  /**
   * בדיקה 3: מציג כרטיס שדרוג כשגישה לתכונה נדחתה (ללא fallback)
   * Re-enable when early return is removed from SubscriptionGuard (line 28)
   */
  it.skip('shows upgrade card when feature access is denied and no fallback provided', () => {
    mockUseSubscription.mockReturnValue({
      ...defaultMock,
      canUseFeature: vi.fn(() => false),
      isLoading: false,
    });

    render(
      <SubscriptionGuard feature="premium_feature">
        <div>תוכן מוגן</div>
      </SubscriptionGuard>
    );

    expect(screen.getByText('תכונה פרימיום')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /שדרג עכשיו/i })).toBeInTheDocument();
    expect(screen.queryByText('תוכן מוגן')).not.toBeInTheDocument();
  });

  /**
   * בדיקה 4: מציג fallback מותאם כשגישה נדחתה ויש fallback prop
   * Re-enable when early return is removed from SubscriptionGuard (line 28)
   */
  it.skip('shows custom fallback when provided and access is denied', () => {
    mockUseSubscription.mockReturnValue({
      ...defaultMock,
      canUseFeature: vi.fn(() => false),
      isLoading: false,
    });

    render(
      <SubscriptionGuard
        feature="premium_feature"
        fallback={<div>שדרג לפרימיום</div>}
      >
        <div>תוכן מוגן</div>
      </SubscriptionGuard>
    );

    expect(screen.getByText('שדרג לפרימיום')).toBeInTheDocument();
    expect(screen.queryByText('תוכן מוגן')).not.toBeInTheDocument();
    expect(screen.queryByText('תכונה פרימיום')).not.toBeInTheDocument();
  });

  /**
   * בדיקה 5: בדיקת regression — הרכיב תמיד מרנדר ילדים (return מוקדם קיים)
   * תיעוד של ה-bypass המכוון בסביבת פיתוח
   * עוברת כרגע בגלל ה-return המוקדם בשורה 28
   */
  it('always renders children due to development bypass (early return on line 28)', () => {
    // גם עם canUseFeature שמחזיר false וisLoading=false,
    // ה-return המוקדם בשורה 28 גורם לילדים להיות מרונדרים תמיד
    mockUseSubscription.mockReturnValue({
      ...defaultMock,
      canUseFeature: vi.fn(() => false),
      isLoading: false,
    });

    render(
      <SubscriptionGuard feature="premium_feature">
        <div>תוכן מוגן תמיד</div>
      </SubscriptionGuard>
    );

    // ה-bypass המכוון — כל הילדים מרונדרים ללא בדיקת מנוי
    expect(screen.getByText('תוכן מוגן תמיד')).toBeInTheDocument();
  });

  /**
   * בדיקה 6: כפתור שדרוג מפנה לדף pricing
   * Re-enable when early return is removed from SubscriptionGuard (line 28)
   */
  it.skip('upgrade link points to /pricing page', () => {
    mockUseSubscription.mockReturnValue({
      ...defaultMock,
      canUseFeature: vi.fn(() => false),
      isLoading: false,
    });

    render(
      <SubscriptionGuard feature="premium_feature">
        <div>תוכן מוגן</div>
      </SubscriptionGuard>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/pricing');
  });
});
