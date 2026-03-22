'use server';

/**
 * פעולות אימות בצד השרת
 * signOut — מתנתק ומפנה ל-login
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/** מתנתק מהמערכת ומנתב לדף ההתחברות */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
