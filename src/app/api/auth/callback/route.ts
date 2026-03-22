/**
 * OAuth callback — מטפל בהחלפת קוד אימות לסשן
 * משמש עבור magic link, אימות אימייל, ו-OAuth providers
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import type { NextRequest } from 'next/server';

/**
 * מטפל בקריאת callback מ-Supabase Auth
 * מחליף את הקוד לסשן פעיל ומפנה ל-/onboarding כברירת מחדל (משתמשים חדשים)
 * אם מוגדר ?next= — מפנה לנתיב המבוקש (משתמשים קיימים שאומתו מחדש)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      /** הפניה לדף היעד לאחר אימות מוצלח */
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  /** במקרה של שגיאה — הפניה לדף התחברות עם הודעת שגיאה */
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}
