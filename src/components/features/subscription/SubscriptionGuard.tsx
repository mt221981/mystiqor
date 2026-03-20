/**
 * שומר תכונות — חוסם גישה לפיצ'רים פרימיום
 * מציג כרטיס שדרוג כשהמשתמש לא זכאי
 */
'use client';

import type { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">תכונה פרימיום</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          תכונה זו דורשת מנוי {planInfo.name === 'חינם' ? 'בסיסי או פרימיום' : 'פרימיום'}.
        </p>
        <Link href="/pricing">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            שדרג עכשיו
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
