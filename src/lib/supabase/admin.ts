/**
 * קליינט Supabase עם הרשאות אדמין (Service Role)
 * לשימוש בצד השרת בלבד — webhooks, cron jobs, פעולות מערכת
 * אסור להשתמש בקליינט זה בקוד שנגיש מצד הלקוח
 */

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

/** יוצר קליינט עם Service Role Key — עוקף RLS, לשימוש בשרת בלבד */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
