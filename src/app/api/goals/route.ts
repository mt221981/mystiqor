/**
 * API Route: מטרות — יצירה ושליפה
 * POST /api/goals — יצירת מטרה חדשה
 * GET /api/goals — שליפת רשימת מטרות (עם סינון לפי סטטוס וקטגוריה)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoalCreateSchema } from '@/lib/validations/goals';
import { z } from 'zod';

/** סכמת ולידציה לפרמטרי query */
const GoalQuerySchema = z.object({
  status: z.enum(['active', 'in_progress', 'completed']).optional(),
  category: z.enum([
    'career', 'relationships', 'personal_growth', 'health',
    'spirituality', 'creativity', 'finance', 'other',
  ]).optional(),
});

/** יצירת מטרה חדשה */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = GoalCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...parsed.data,
        user_id: user.id,
        status: 'active',
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בשמירת מטרה' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** שליפת רשימת מטרות עם סינון אופציונלי */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const rawParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = GoalQuerySchema.safeParse(rawParams);
    const status = parsedQuery.success ? parsedQuery.data.status : undefined;
    const category = parsedQuery.success ? parsedQuery.data.category : undefined;

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'שגיאה בשליפת מטרות' }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
