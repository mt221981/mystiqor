/**
 * GET /api/blog/[slug] — שליפת מאמר בלוג בודד לפי slug
 *
 * מדוע: מספק מאמר בלוג בודד לדף הפרטים — מחזיר רק פוסטים מפורסמים,
 * מאמת את ה-slug עם Zod, ודורש משתמש מחובר.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/** סכמת Zod לאימות slug */
const SlugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'slug לא תקין');

/**
 * GET /api/blog/[slug] — שליפת מאמר בלוג בודד לפי slug
 * מחזיר מאמר מפורסם בלבד. דורש משתמש מחובר.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // אימות משתמש — הבלוג נגיש רק למשתמשים מחוברים
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // המתנה ל-params (Next.js 15+ App Router — params הוא Promise)
    const { slug } = await params;

    // אימות slug עם Zod
    const parseResult = SlugSchema.safeParse(slug);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'slug לא תקין' }, { status: 400 });
    }

    // שליפת מאמר בודד לפי slug — רק פוסטים מפורסמים
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', parseResult.data)
      .eq('is_published', true)
      .single();

    // טיפול במקרה שהמאמר לא נמצא
    if (error || !post) {
      return NextResponse.json({ error: 'מאמר לא נמצא' }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 });
  }
}
