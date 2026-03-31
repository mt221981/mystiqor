/**
 * דף הבית — מפנה משתמשים מחוברים לדשבורד, אנונימיים ל-login
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** דף הבית — הפניה לדשבורד או login */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  redirect('/dashboard');
}
