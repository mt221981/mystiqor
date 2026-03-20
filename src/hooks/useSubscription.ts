/**
 * Hook לניהול מנוי — GEM 7
 * מקור אמת יחיד לסטטוס המנוי, מגבלות, ועדכון שימוש
 * כולל optimistic update עם rollback במקרה שגיאה
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PLAN_INFO, hasRemainingAnalyses, isPremiumPlan } from '@/lib/constants/plans';
import { CACHE_TIMES } from '@/lib/query/cache-config';
import type { PlanType, PlanInfo } from '@/types/subscription';

/** שורת מנוי גולמית מ-Supabase */
interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: string;
  analyses_limit: number;
  analyses_used: number;
  guest_profiles_limit: number;
  guest_profiles_used: number;
  trial_end_date: string | null;
  start_date: string | null;
  end_date: string | null;
  cancel_at_period_end: boolean;
}

/** ערך ברירת מחדל למנוי חינמי */
const FREE_SUBSCRIPTION: SubscriptionRow = {
  id: '',
  user_id: '',
  plan_type: 'free',
  status: 'active',
  analyses_limit: 3,
  analyses_used: 0,
  guest_profiles_limit: 1,
  guest_profiles_used: 0,
  trial_end_date: null,
  start_date: null,
  end_date: null,
  cancel_at_period_end: false,
};

/** תוצאת ה-hook */
interface UseSubscriptionReturn {
  subscription: SubscriptionRow;
  planInfo: PlanInfo;
  hasUsageLeft: boolean;
  canUseFeature: (featureName: string) => boolean;
  incrementUsage: () => Promise<{ new_count: number }>;
  isLoading: boolean;
}

/**
 * Hook לניהול מנוי — שולף מנוי, בודק מגבלות, ומעדכן שימוש
 * @returns אובייקט עם כל המידע והפעולות הנדרשות
 */
export function useSubscription(): UseSubscriptionReturn {
  const queryClient = useQueryClient();

  /** שליפת מנוי מ-Supabase */
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<SubscriptionRow> => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return FREE_SUBSCRIPTION;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return FREE_SUBSCRIPTION;
      return data as SubscriptionRow;
    },
    staleTime: CACHE_TIMES.SHORT,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  /** מוטציה לעדכון שימוש עם optimistic update */
  const incrementMutation = useMutation({
    mutationFn: async (): Promise<{ new_count: number }> => {
      const res = await fetch('/api/subscription/usage', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאה בעדכון שימוש' }));
        throw new Error(err.error ?? 'שגיאה בעדכון שימוש');
      }
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['subscription'] });
      const previous = queryClient.getQueryData<SubscriptionRow>(['subscription']);
      queryClient.setQueryData<SubscriptionRow>(['subscription'], (old) => {
        if (!old) return old;
        return { ...old, analyses_used: (old.analyses_used ?? 0) + 1 };
      });
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['subscription'], context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SubscriptionRow>(['subscription'], (old) => {
        if (!old) return old;
        return { ...old, analyses_used: data.new_count };
      });
    },
  });

  const safe = subscription ?? FREE_SUBSCRIPTION;
  const planType = safe.plan_type;
  const planInfo = PLAN_INFO[planType] ?? PLAN_INFO.free;
  const hasUsageLeft = hasRemainingAnalyses(planType, safe.analyses_used);

  /** בדיקה האם פיצ'ר מסוים זמין למשתמש */
  const canUseFeature = (featureName: string): boolean => {
    if (featureName === 'provenance' || featureName === 'advanced_insights' || featureName === 'unlimited_analyses') {
      return isPremiumPlan(planType);
    }
    return hasUsageLeft;
  };

  return {
    subscription: safe,
    planInfo,
    hasUsageLeft,
    canUseFeature,
    incrementUsage: incrementMutation.mutateAsync,
    isLoading,
  };
}
