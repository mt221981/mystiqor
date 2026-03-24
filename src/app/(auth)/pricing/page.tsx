/**
 * דף תמחור — מציג 3 תוכניות מנוי (חינם, בסיסי, פרימיום)
 * המשתמש יכול לבחור תוכנית ולהתחיל תהליך רכישה דרך Stripe Checkout
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PLAN_INFO } from '@/lib/constants/plans';
import { PlanCard } from '@/components/features/subscription/PlanCard';
import { useSubscription } from '@/hooks/useSubscription';
import type { PlanType } from '@/types/subscription';

/**
 * דף תמחור — מציג את כל תוכניות המנוי ומאפשר שדרוג
 */
export default function PricingPage() {
  const router = useRouter();
  const { subscription, isLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  /**
   * טיפול בבחירת תוכנית — יוצר Stripe Checkout session ומנתב למשתמש
   */
  const handleSelectPlan = async (plan: PlanType) => {
    // תוכנית חינמית — אין תשלום
    if (plan === 'free') return;

    setLoadingPlan(plan);

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאה ביצירת תשלום' }));
        throw new Error(err.error ?? 'שגיאה ביצירת תשלום');
      }

      const data: { url: string } = await res.json();
      window.location.href = data.url;
    } catch {
      toast.error('שגיאה ביצירת תשלום');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlanType = subscription.plan_type;

  return (
    <div className="container mx-auto px-4 py-12" dir="rtl">
      {/* כותרת */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">בחר את התוכנית שלך</h1>
        <p className="text-muted-foreground text-lg">גישה לכל 13 הכלים המיסטיים</p>
      </div>

      {/* כרטיסי תוכניות */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {(['free', 'basic', 'premium'] as const).map((plan) => (
            <div
              key={plan}
              className="h-64 rounded-lg bg-muted animate-pulse"
              aria-label="טוען תוכנית..."
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <PlanCard
            planType="free"
            planInfo={PLAN_INFO.free}
            isCurrentPlan={currentPlanType === 'free'}
            onSelect={handleSelectPlan}
          />
          <PlanCard
            planType="basic"
            planInfo={PLAN_INFO.basic}
            isCurrentPlan={currentPlanType === 'basic'}
            onSelect={loadingPlan === 'basic' ? undefined : handleSelectPlan}
            highlighted
          />
          <PlanCard
            planType="premium"
            planInfo={PLAN_INFO.premium}
            isCurrentPlan={currentPlanType === 'premium'}
            onSelect={loadingPlan === 'premium' ? undefined : handleSelectPlan}
          />
        </div>
      )}

      {/* הסבר תחתי */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        ניתן לבטל בכל עת. לא נדרש כרטיס אשראי לתוכנית החינמית.
      </p>
    </div>
  );
}
