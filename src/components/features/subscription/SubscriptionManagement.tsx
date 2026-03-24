/**
 * קומפוננטת ניהול מנוי — מציגה תוכנית נוכחית, שימוש, סטטוס, וכפתורי פעולה
 * משמשת בדף /subscription כתצוגה מרכזית
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { UsageBar } from './UsageBar';
import { PlanCard } from './PlanCard';
import { PLAN_INFO } from '@/lib/constants/plans';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import type { PlanType } from '@/types/subscription';

// ===== עזרים =====

/** תרגום סטטוס מנוי לעברית */
const STATUS_LABEL: Record<string, string> = {
  active: 'פעיל',
  trial: 'תקופת ניסיון',
  cancelled: 'מבוטל',
  expired: 'פג תוקף',
  past_due: 'חוב בתשלום',
};

/** צבע תגית MD3 לפי סטטוס */
const STATUS_BADGE_CLASS: Record<string, string> = {
  active: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  trial: 'bg-secondary/10 text-secondary border-secondary/30',
  cancelled: 'bg-error/10 text-error border-error/30',
  expired: 'bg-error/10 text-error border-error/30',
  past_due: 'bg-secondary/10 text-secondary border-secondary/30',
};

// ===== קומפוננטה =====

/** SubscriptionManagement — תצוגת ניהול מנוי מלאה */
export function SubscriptionManagement() {
  const router = useRouter();
  const { subscription, planInfo, isLoading } = useSubscription();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  /**
   * פותח את פורטל הניהול של Stripe ומנתב את המשתמש
   */
  async function handleManageAccount() {
    setIsPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'שגיאה' }));
        setPortalError((data as { error?: string }).error ?? 'שגיאה בפתיחת ניהול חשבון');
        return;
      }
      const data = await res.json() as { url: string };
      router.push(data.url);
    } catch {
      setPortalError('שגיאת תקשורת. נסה שוב.');
    } finally {
      setIsPortalLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const planType = subscription.plan_type as PlanType;
  const currentPlanInfo = PLAN_INFO[planType] ?? PLAN_INFO.free;
  const status = subscription.status ?? 'active';
  const statusClass = STATUS_BADGE_CLASS[status] ?? 'bg-surface-container-high text-on-surface-variant border-outline-variant/30';
  const statusLabel = STATUS_LABEL[status] ?? status;
  const isFree = planType === 'free';

  return (
    <div className="space-y-6">

      {/* כרטיס תוכנית נוכחית */}
      <div>
        <h2 className="mb-3 font-headline font-semibold text-lg text-on-surface">התוכנית שלך</h2>
        <PlanCard
          planType={planType}
          planInfo={currentPlanInfo}
          isCurrentPlan={true}
        />
      </div>

      {/* כרטיס שימוש */}
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline font-semibold text-base text-on-surface">שימוש חודשי</h3>
          <span className={`font-label text-xs px-3 py-1 rounded-full border ${statusClass || 'bg-tertiary/10 text-tertiary border-tertiary/30'}`}>
            {statusLabel}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-on-surface-variant font-body">ניתוחים</p>
          <UsageBar
            used={subscription.analyses_used}
            limit={subscription.analyses_limit}
          />
        </div>

        {/* אזהרת ביטול עתידי */}
        {subscription.cancel_at_period_end && (
          <div className="flex items-start gap-2 mt-4 rounded-lg border border-secondary/30 bg-secondary/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
            <p className="text-sm text-secondary font-body">
              המנוי יבוטל בסוף התקופה הנוכחית
            </p>
          </div>
        )}
      </div>

      {/* כפתורי פעולה */}
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
        {portalError && (
          <div className="mb-4 rounded-lg bg-error-container/20 p-3 text-sm text-error">
            {portalError}
          </div>
        )}

        {isFree ? (
          /* משתמש חינמי — כפתור שדרוג */
          <Link href="/pricing">
            <Button className="w-full gap-2 bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-3 rounded-xl hover:opacity-90 active:scale-95">
              <Sparkles className="h-4 w-4" />
              שדרג עכשיו
            </Button>
          </Link>
        ) : (
          /* משתמש בתשלום — כפתור ניהול חשבון ב-Stripe */
          <Button
            onClick={handleManageAccount}
            disabled={isPortalLoading}
            variant="outline"
            className="w-full gap-2 border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high rounded-xl"
          >
            {isPortalLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                פותח ניהול חשבון...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                ניהול חשבון
              </>
            )}
          </Button>
        )}
      </div>

      {/* תוכניות זמינות — רק למשתמשים חינמיים */}
      {isFree && (
        <div>
          <h2 className="mb-3 font-headline font-semibold text-lg text-on-surface">שדרג את החוויה שלך</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlanCard
              planType="basic"
              planInfo={PLAN_INFO.basic}
              highlighted={false}
            />
            <PlanCard
              planType="premium"
              planInfo={PLAN_INFO.premium}
              highlighted={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
