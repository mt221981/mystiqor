/**
 * פונקציות Auth של Supabase — התנתקות, קבלת סשן
 * מיועד לשימוש ב-Client Components בלבד
 * מחייב 'use client' כיוון שמשתמש ב-createClient (Browser)
 */

'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * מתנתק מהמערכת וניקוי המצב המקומי
 * מאפס את הסשן ב-Supabase ומנקה את הקוקיז
 *
 * @throws Error אם ניתוק נכשל — כולל הודעת שגיאה בעברית
 */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`שגיאה בהתנתקות: ${error.message}`);
  }
}

/**
 * מחזיר את הסשן הנוכחי של המשתמש המחובר
 * מחזיר null אם אין משתמש מחובר
 *
 * @returns Session | null — הסשן הנוכחי או null
 */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}
