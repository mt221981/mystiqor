/**
 * דף אישור תשלום — מוצג לאחר השלמת checkout ב-Stripe
 * משתמש ב-useSearchParams כדי לקרוא את session_id מה-URL
 * עטוף ב-Suspense כנדרש ע"י Next.js App Router
 */

'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

// ===== קומפוננטה פנימית =====

/** תוכן דף ההצלחה — עטוף ב-Suspense כי משתמש ב-useSearchParams */
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const queryClient = useQueryClient();

  /** מרענן את נתוני המנוי מיד לאחר חזרה מ-Stripe Checkout */
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  }, [queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-surface-container/60 backdrop-blur-xl rounded-2xl p-8 text-center border border-outline-variant/10 celestial-glow">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary/10 mb-4">
            <CheckCircle className="h-8 w-8 text-tertiary text-6xl" />
          </div>
          <h1 className="font-headline font-bold text-2xl text-on-surface mb-3">
            התשלום הושלם בהצלחה!
          </h1>
          <p className="font-body text-on-surface-variant mb-6">
            המנוי שלך שודרג. כל הכלים המיסטיים זמינים עבורך.
          </p>

          {/* מזהה סשן לאימות (מוסתר מהמשתמש אך נגיש ל-QA) */}
          {sessionId && (
            <p
              className="text-xs text-on-surface-variant/30 mb-4"
              data-testid="session-id"
              aria-hidden="true"
            >
              {sessionId}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/tools">
              <Button className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-3 rounded-xl hover:opacity-90 active:scale-95">
                התחל לנתח
              </Button>
            </Link>
            <Link href="/subscription">
              <Button variant="outline" className="w-full border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high rounded-xl">
                צפה בפרטי המנוי
              </Button>
            </Link>
          </div>
        </div>
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
