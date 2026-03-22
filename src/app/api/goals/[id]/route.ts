/**
 * API Route: מטרה בודדת — עדכון ומחיקה
 * PATCH /api/goals/[id] — עדכון מטרה (פרטים, התקדמות, סטטוס, קישור ניתוחים)
 * DELETE /api/goals/[id] — מחיקת מטרה
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoalUpdateSchema } from '@/lib/validations/goals';
import type { Json } from '@/types/database.generated';

/** פרמטרים של route */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/** עדכון מטרה — פרטים, התקדמות, סטטוס, קישור ניתוחים (TRCK-04) */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    /** TRCK-04: חלץ linked_analyses לפני ולידציה של שאר השדות */
    const { linked_analyses, ...restBody } = body as {
      linked_analyses?: string[];
      [key: string]: unknown;
    };

    const parsed = GoalUpdateSchema.safeParse(restBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    /** בנה אובייקט עדכון */
    const updateData: Record<string, unknown> = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    /** TRCK-04: שמור קישורי ניתוחים ב-recommendations JSON */
    if (linked_analyses !== undefined) {
      updateData.recommendations = { linked_analyses } as Json;
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בעדכון מטרה' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'מטרה לא נמצאה' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** מחיקת מטרה */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { id } = await params;

    const { error, count } = await supabase
      .from('goals')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'שגיאה במחיקת מטרה' }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'מטרה לא נמצאה' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
