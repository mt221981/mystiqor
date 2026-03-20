/**
 * קליינט Supabase לצד הדפדפן
 * יוצר חיבור מאומת עם הגדרות קוקיז אוטומטיות לשימוש בקומפוננטות קליינט
 */

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

/** יוצר קליינט Supabase לשימוש בדפדפן בלבד */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
