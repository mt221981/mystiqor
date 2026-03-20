/**
 * מידלוור ראשי של Next.js
 * מפעיל רענון סשן והגנה על נתיבים בכל בקשה שאינה קובץ סטטי
 */

import { type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/** מידלוור שרץ על כל בקשה — מרענן סשן ומגן על נתיבים */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/** תבנית התאמה — מחריג קבצים סטטיים ותמונות */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
