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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import type { PlanType } from '@/types/subscription';

// ===== עזרים =====

/** צבע Badge לפי סטטוס מנוי */
const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  trial: 'secondary',
  cancelled: 'destructive',
  expired: 'destructive',
  past_due: 'outline',
};

/** תרגום סטטוס מנוי לעברית */
const STATUS_LABEL: Record<string, string> = {
  active: 'פעיל',
  trial: 'תקופת ניסיון',
  cancelled: 'מבוטל',
  expired: 'פג תוקף',
  past_due: 'חוב בתשלום',
};

/** צבע Badge לפי סטטוס (className נוסף) */
const STATUS_BADGE_CLASS: Record<string, string> = {
  active: 'bg-green-600 hover:bg-green-700',
  trial: 'bg-yellow-600 hover:bg-yellow-700',
  cancelled: '',
  expired: '',
  past_due: 'border-orange-500 text-orange-500',
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
  const statusVariant = STATUS_BADGE_VARIANT[status] ?? 'secondary';
  const statusClass = STATUS_BADGE_CLASS[status] ?? '';
  const statusLabel = STATUS_LABEL[status] ?? status;
  const isFree = planType === 'free';

  return (
    <div className="space-y-6">

      {/* כרטיס תוכנית נוכחית */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">התוכנית שלך</h2>
        <PlanCard
          planType={planType}
          planInfo={currentPlanInfo}
          isCurrentPlan={true}
        />
      </div>

      {/* כרטיס שימוש */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">שימוש חודשי</CardTitle>
            <Badge
              variant={statusVariant}
              className={statusClass}
            >
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ניתוחים</p>
            <UsageBar
              used={subscription.analyses_used}
              limit={subscription.analyses_limit}
            />
          </div>

          {/* אזהרת ביטול עתידי */}
          {subscription.cancel_at_period_end && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                המנוי יבוטל בסוף התקופה הנוכחית
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* כפתורי פעולה */}
      <Card>
        <CardContent className="pt-6">
          {portalError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {portalError}
            </div>
          )}

          {isFree ? (
            /* משתמש חינמי — כפתור שדרוג */
            <Link href="/pricing">
              <Button className="w-full gap-2">
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
              className="w-full gap-2"
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
        </CardContent>
      </Card>

      {/* תוכניות זמינות — רק למשתמשים חינמיים */}
      {isFree && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">שדרג את החוויה שלך</h2>
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
