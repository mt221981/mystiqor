/**
 * עדכון סשן במידלוור של Next.js
 * אחראי על שלושה דברים:
 * 1. רענון טוקן auth בכל בקשה — מונע פקיעת סשן
 * 2. הגנה על נתיבים מוגנים — מפנה ל-/login עם ?next= אם לא מחובר
 * 3. הזרקת x-pathname header — מאפשר ל-Server Components לדעת את הנתיב הנוכחי
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, llmRateLimit, uploadRateLimit } from '@/lib/rate-limit';

/** נתיבים מוגנים שדורשים אימות — מידלוור מפנה ל-login אם לא מחובר */
const PROTECTED_PATHS = [
  '/dashboard',
  '/tools',
  '/onboarding',
  '/profile',
  '/settings',
  '/subscription',
  '/coach',
  '/goals',
  '/mood',
  '/journal',
  // Phase 9 — Learning + History + Analytics
  '/history',
  '/learn',
  '/analytics',
  '/blog',
  // Phase 25 — missing protected paths (middleware redirect UX)
  '/notifications',
  '/referrals',
  '/pricing',
];

/**
 * מטפל ברענון סשן, הגנה על נתיבים מוגנים, והזרקת x-pathname header
 * - מרענן את טוקן ה-auth בכל בקשה כדי שהסשן לא יפוג
 * - אם המשתמש לא מחובר ומנסה לגשת לנתיב מוגן — מפנה ל-/login?next=<pathname>
 * - מוסיף x-pathname header לתגובה לשימוש ב-Server Components
 */
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

  // הגבלת קצב על נקודות קצה רגישות (POST בלבד)
  if (user && request.method === 'POST') {
    const path = request.nextUrl.pathname;
    const isToolRoute = path.startsWith('/api/tools/');
    const isCoachMessage = path === '/api/coach/messages';
    const isUpload = path === '/api/upload' || path === '/api/upload/presign';
    const isCheckout = path === '/api/subscription/checkout';

    if (isToolRoute || isCoachMessage) {
      const allowed = await checkRateLimit(llmRateLimit, user.id);
      if (!allowed) {
        return NextResponse.json(
          { error: 'חריגה ממגבלת הבקשות — נסה שוב בעוד דקה' },
          { status: 429 }
        );
      }
    }
    if (isUpload) {
      const allowed = await checkRateLimit(uploadRateLimit, user.id);
      if (!allowed) {
        return NextResponse.json(
          { error: 'חריגה ממגבלת העלאות — נסה שוב בעוד דקה' },
          { status: 429 }
        );
      }
    }
    if (isCheckout) {
      const allowed = await checkRateLimit(uploadRateLimit, user.id);
      if (!allowed) {
        return NextResponse.json(
          { error: 'חריגה ממגבלת בקשות תשלום — נסה שוב בעוד דקה' },
          { status: 429 }
        );
      }
    }
  }

  // בדיקה אם הנתיב הנוכחי מוגן
  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  // הפניה לעמוד התחברות אם המשתמש לא מחובר ומנסה לגשת לנתיב מוגן
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // הזרקת x-pathname header — מאפשר ל-Server Components לדעת את הנתיב הנוכחי
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname);

  return supabaseResponse;
}
