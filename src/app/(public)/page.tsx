/**
 * דף הבית — מציג את רשת הכלים למשתמשים מחוברים, מפנה אנונימיים ל-login
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ToolGrid } from '@/components/features/shared/ToolGrid';

/** דף הבית — server component */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-on-surface mb-6">
        ברוכים הבאים למיסטיקור
      </h1>
      <ToolGrid />
    </div>
  );
}
