/**
 * GET /api/blog — שליפת מאמרי בלוג מפורסמים עם סינון וחיפוש
 *
 * מדוע: מספק תוכן חינוכי לדף הבלוג — מסנן לפי קטגוריה, חיפוש לפי כותרת,
 * ומחזיר רק פוסטים שפורסמו בסדר כרונולוגי יורד.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BlogQuerySchema } from '@/lib/validations/learning';
import type { Tables } from '@/types/database';
import { zodValidationError } from '@/lib/utils/api-error';

/** שורת פוסט בלוג */
type BlogPostRow = Tables<'blog_posts'>;

/**
 * GET /api/blog — שליפת מאמרי בלוג מפורסמים
 * תומך בסינון קטגוריה, חיפוש כותרת, ופגינציה
 */
export async function GET(request: NextRequest) {
  try {
    // אימות משתמש — הבלוג נגיש רק למשתמשים מחוברים
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // אימות פרמטרי שאילתה עם Zod
    const { searchParams } = new URL(request.url);
    const parseResult = BlogQuerySchema.safeParse({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    });

    if (!parseResult.success) {
      return zodValidationError('פרמטרי שאילתה לא תקינים', parseResult.error.flatten());
    }

    const { category, search, limit, offset } = parseResult.data;

    // בניית שאילתה — רק פוסטים מפורסמים
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // סינון קטגוריה אופציונלי
    if (category) {
      query = query.eq('category', category);
    }

    // חיפוש לפי כותרת (case-insensitive)
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('[blog GET] Supabase error:', error);
      return NextResponse.json({ error: 'שגיאה בטעינת הבלוג' }, { status: 500 });
    }

    return NextResponse.json({
      data: (posts as BlogPostRow[]) ?? [],
      meta: { total: count ?? 0 },
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 });
  }
}
