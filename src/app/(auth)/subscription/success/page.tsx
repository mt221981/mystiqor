/**
 * דף אישור תשלום — מוצג לאחר השלמת checkout ב-Stripe
 * משתמש ב-useSearchParams כדי לקרוא את session_id מה-URL
 * עטוף ב-Suspense כנדרש ע"י Next.js App Router
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ===== קומפוננטה פנימית =====

/** תוכן דף ההצלחה — עטוף ב-Suspense כי משתמש ב-useSearchParams */
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-green-500/30 shadow-lg">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              התשלום הושלם בהצלחה!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              המנוי שלך שודרג. כל הכלים המיסטיים זמינים עבורך.
            </p>

            {/* מזהה סשן לאימות (מוסתר מהמשתמש אך נגיש ל-QA) */}
            {sessionId && (
              <p
                className="text-xs text-muted-foreground/50"
                data-testid="session-id"
                aria-hidden="true"
              >
                {sessionId}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Link href="/tools">
                <Button className="w-full">
                  התחל לנתח
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="outline" className="w-full">
                  צפה בפרטי המנוי
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== ייצוא ראשי =====

/** דף אישור תשלום לאחר checkout מ-Stripe */
export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
