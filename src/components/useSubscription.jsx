import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EnhancedToast from "./EnhancedToast";
import { CACHE_TIMES } from "./CachedQuery";

/**
 * OPTIMIZED SUBSCRIPTION HOOK - ENHANCED STABILITY
 * Hook מאוחד ומאופטמז לניהול מנויים עם error handling משופר
 */

const PLAN_INFO = {
  free: {
    name: "חינם",
    analyses: 3,
    guestProfiles: 1,
    features: ["3 ניתוחים בחודש", "פרופיל אורח 1"]
  },
  basic: {
    name: "בסיסי",
    analyses: 20,
    guestProfiles: 3,
    features: ["20 ניתוחים בחודש", "3 פרופילי אורחים", "תובנות יומיות"]
  },
  premium: {
    name: "פרימיום",
    analyses: -1,
    guestProfiles: 10,
    features: ["ניתוחים ללא הגבלה", "10 פרופילי אורחים", "תובנות מתקדמות", "גישה ל-Provenance"]
  },
  enterprise: {
    name: "ארגוני",
    analyses: -1,
    guestProfiles: -1,
    features: ["הכל ללא הגבלה", "API Access", "תמיכה VIP"]
  }
};

export default function useSubscription() {
  const queryClient = useQueryClient();

  // Optimized subscription query with enhanced error handling
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (!user) {
          return {
            plan_type: 'free',
            status: 'active',
            analyses_used: 0,
            analyses_limit: 3,
            guest_profiles_used: 0,
            guest_profiles_limit: 1
          };
        }

        const subs = await base44.entities.Subscription.filter(
          { created_by: user.email },
          '-created_date',
          1
        ).catch(() => []);

        if (subs.length > 0) {
          return subs[0];
        }

        // Create default free subscription if none exists
        const newSub = await base44.entities.Subscription.create({
          created_by: user.email,
          plan_type: 'free',
          status: 'active',
          analyses_limit: 3,
          analyses_used: 0,
          guest_profiles_limit: 1,
          guest_profiles_used: 0,
          auto_renew: false
        }).catch(() => null);

        return newSub || {
          plan_type: 'free',
          status: 'active',
          analyses_used: 0,
          analyses_limit: 3,
          guest_profiles_used: 0,
          guest_profiles_limit: 1
        };
      } catch (err) {
        console.error('Subscription query error:', err);
        return {
          plan_type: 'free',
          status: 'active',
          analyses_used: 0,
          analyses_limit: 3,
          guest_profiles_used: 0,
          guest_profiles_limit: 1
        };
      }
    },
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    throwOnError: false
  });

  const incrementUsageMutation = useMutation({
    mutationFn: async () => {
      try {
        const result = await base44.functions.invoke('incrementUsage', {});
        return result.data;
      } catch (err) {
        console.error('incrementUsage error:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data?.success) {
        // Optimistic update
        queryClient.setQueryData(['subscription'], (old) => {
          if (!old) return old;
          return {
            ...old,
            analyses_used: data.new_count
          };
        });
      }
    },
    onError: (error) => {
      console.error('Usage increment failed:', error);
      
      // Check for specific error types
      const errorMessage = error?.response?.data?.error || error?.message || '';
      
      if (errorMessage.includes('Usage limit reached') || errorMessage.includes('limit')) {
        EnhancedToast.error(
          'הגעת למגבלת השימוש',
          'שדרג את המנוי שלך כדי להמשיך להשתמש בכלים 💎',
          {
            action: {
              label: 'שדרג עכשיו',
              onClick: () => window.location.href = '/pricing'
            }
          }
        );
        throw new Error('Usage limit reached');
      }
      
      // For other errors, show generic message but don't throw
      EnhancedToast.error('שגיאה בעדכון שימוש', 'אנא נסה שוב');
    },
    // Retry once for network errors
    retry: 1
  });

  // Safe subscription data with fallbacks
  const safeSubscription = subscription || {
    plan_type: 'free',
    status: 'active',
    analyses_used: 0,
    guest_profiles_used: 0
  };

  const planInfo = PLAN_INFO[safeSubscription.plan_type] || PLAN_INFO.free;
  
  const usagePercentage = planInfo.analyses !== -1
    ? Math.min(100, Math.round(((safeSubscription.analyses_used || 0) / planInfo.analyses) * 100))
    : 0;

  const remainingAnalyses = planInfo.analyses === -1 
    ? '∞' 
    : Math.max(0, planInfo.analyses - (safeSubscription.analyses_used || 0));

  const remainingGuestProfiles = planInfo.guestProfiles === -1
    ? -1
    : Math.max(0, planInfo.guestProfiles - (safeSubscription.guest_profiles_used || 0));

  const canUseAnalysis = () => {
    return planInfo.analyses === -1 || 
           (safeSubscription.analyses_used || 0) < planInfo.analyses;
  };

  const canCreateGuestProfile = () => {
    return planInfo.guestProfiles === -1 ||
           (safeSubscription.guest_profiles_used || 0) < planInfo.guestProfiles;
  };

  const canUseFeature = (featureName) => {
    const isPremium = ['premium', 'enterprise'].includes(safeSubscription.plan_type);
    const hasUsageLeft = planInfo.analyses === -1 || 
                         (safeSubscription.analyses_used || 0) < planInfo.analyses;

    if (featureName === 'unlimited_analyses') return isPremium;
    if (featureName === 'provenance') return isPremium;
    if (featureName === 'advanced_insights') return isPremium;
    if (featureName === 'daily_forecast') return hasUsageLeft;
    
    return hasUsageLeft;
  };

  return {
    subscription: safeSubscription,
    isLoading,
    error: error ? 'Failed to load subscription' : null,
    planInfo,
    usagePercentage,
    remainingAnalyses,
    remainingGuestProfiles,
    canUseAnalysis,
    canCreateGuestProfile,
    canUseFeature,
    incrementUsage: incrementUsageMutation.mutateAsync,
    hasUsageLeft: planInfo.analyses === -1 || 
                  (safeSubscription.analyses_used || 0) < planInfo.analyses
  };
}