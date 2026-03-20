/**
 * קליינט Supabase לצד השרת
 * משתמש בקוקיז של Next.js לניהול סשן — מתאים ל-Server Components, Route Handlers, Server Actions
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

/** יוצר קליינט Supabase בצד השרת עם גישה לקוקיז */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /** מחזיר את כל הקוקיז הקיימים */
        getAll() {
          return cookieStore.getAll();
        },
        /** שומר קוקיז — עטוף ב-try/catch כי Server Components לא תומכים בכתיבת קוקיז */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server Component — לא ניתן לשנות קוקיז, זה צפוי ותקין
            }
          });
        },
      },
    }
  );
}
