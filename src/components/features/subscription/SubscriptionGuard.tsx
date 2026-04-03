/**
 * שומר תכונות — חוסם גישה לפיצ'רים פרימיום
 * מציג כרטיס שדרוג כשהמשתמש לא זכאי
 */
'use client';

import type { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

/** Props של שומר תכונות */
export interface SubscriptionGuardProps {
  /** שם התכונה לבדיקה */
  feature: string;
  /** תוכן שמוצג כשהגישה מאושרת */
  children: ReactNode;
  /** תוכן חלופי מותאם — אם לא סופק, מוצג כרטיס שדרוג ברירת מחדל */
  fallback?: ReactNode;
}

/**
 * עוטף תוכן שדורש מנוי — אם למשתמש אין גישה, מציג כרטיס שדרוג
 */
export function SubscriptionGuard({ feature, children, fallback }: SubscriptionGuardProps) {
  // פתיחת כל הכלים — ללא בדיקת מנוי (להחזיר כשמנויים פעילים)
  return <>{children}</>;

  const { canUseFeature, planInfo, isLoading } = useSubscription();

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-surface-container/60 backdrop-blur-xl rounded-xl p-6 border border-outline-variant/10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-headline font-semibold text-lg text-on-surface mb-2">תכונה פרימיום</h3>
      <p className="font-body text-sm text-on-surface-variant mb-4">
        תכונה זו דורשת מנוי {planInfo.name === 'חינם' ? 'בסיסי או פרימיום' : 'פרימיום'}.
      </p>
      <Link href="/pricing">
        <Button className="gap-2 bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold rounded-xl py-2 hover:opacity-90 active:scale-95">
          <Sparkles className="h-4 w-4" />
          שדרג עכשיו
        </Button>
      </Link>
    </div>
  );
}
