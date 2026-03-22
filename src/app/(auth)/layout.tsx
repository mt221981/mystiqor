/**
 * לייאאוט מוגן — בודק אימות, בודק השלמת onboarding, ומפנה בהתאם
 * - בודק אימות בצד השרת ומפנה ל-login אם לא מחובר
 * - בודק שהמשתמש השלים onboarding — אם לא, מפנה ל-/onboarding
 * - ממעט מהבדיקה בנתיב /onboarding עצמו למניעת לולאה
 * עוטף תוכן עם React Query provider, Toaster, ואזור sidebar
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import AuthLayoutClient from './layout-client';

import type { ReactNode } from 'react';

// ===== ממשקים =====

/** פרופס של לייאאוט מוגן */
interface AuthLayoutProps {
  readonly children: ReactNode;
}

// ===== קומפוננטה =====

/**
 * לייאאוט מוגן — Server Component שבודק אימות והשלמת onboarding
 * אם המשתמש לא מחובר, מפנה אותו לדף ההתחברות
 * אם המשתמש לא השלים onboarding (ולא נמצא ב-/onboarding), מפנה ל-/onboarding
 */
export default async function AuthLayout({ children }: AuthLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* הפניה לדף התחברות אם לא מחובר */
  if (!user) {
    redirect('/login');
  }

  // בדיקת השלמת onboarding — מפנה ל-/onboarding אם לא הושלם
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  if (pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.onboarding_completed) {
      redirect('/onboarding');
    }
  }

  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
