/**
 * דף הכניסה — בודק אם המשתמש כבר השלים onboarding ומפנה בהתאם
 * Server Component: שולף פרופיל מ-Supabase ומכניס ל-wizard אם לא הושלם
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/features/onboarding/OnboardingWizard';

/** דף onboarding — server component שמנהל הפניות לפי מצב הפרופיל */
export default async function OnboardingPage() {
  const supabase = await createClient();

  /** בדיקת זהות המשתמש */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  /** בדיקה אם ה-onboarding הושלם כבר */
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  /** אם הושלם — מפנה לכלים */
  if (profile?.onboarding_completed === true) {
    redirect('/tools');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <OnboardingWizard />
    </div>
  );
}
