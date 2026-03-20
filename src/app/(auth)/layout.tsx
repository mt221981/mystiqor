/**
 * לייאאוט מוגן — בודק אימות בצד השרת ומפנה ל-login אם לא מחובר
 * עוטף תוכן עם React Query provider, Toaster, ואזור sidebar
 */

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
 * לייאאוט מוגן — Server Component שבודק אימות
 * אם המשתמש לא מחובר, מפנה אותו לדף ההתחברות
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

  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
