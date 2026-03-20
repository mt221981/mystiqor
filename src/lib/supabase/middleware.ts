/**
 * עדכון סשן במידלוור של Next.js
 * מרענן את טוקן ה-auth בכל בקשה ומגן על נתיבים מוגנים
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** מטפל ברענון סשן ובהגנה על נתיבים שדורשים אימות */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /** קורא קוקיז מהבקשה הנכנסת */
        getAll() {
          return request.cookies.getAll();
        },
        /** מעדכן קוקיז גם בבקשה וגם בתגובה — חיוני לסנכרון סשן */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // רענון הסשן — חיוני כדי שהטוקן לא יפוג
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // הפניה לעמוד התחברות אם המשתמש לא מחובר ומנסה לגשת לנתיבים מוגנים
  if (!user && request.nextUrl.pathname.startsWith('/(auth)')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
