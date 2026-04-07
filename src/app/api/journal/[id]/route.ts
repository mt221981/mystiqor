/**
 * API Route: יומן אישי — עדכון ומחיקה לפי מזהה
 * PATCH /api/journal/[id] — עדכון רשומת יומן קיימת
 * DELETE /api/journal/[id] — מחיקת רשומת יומן
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JournalUpdateSchema } from '@/lib/validations/journal';
import { zodValidationError } from '@/lib/utils/api-error';

/** פרמטרים של ה-route */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/** עדכון רשומת יומן קיימת */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json() as unknown;
    const parsed = JournalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError('נתונים לא תקינים', parsed.error.flatten());
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בעדכון רשומת יומן' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'רשומת יומן לא נמצאה' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** מחיקת רשומת יומן */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { id } = await params;

    const { error, count } = await supabase
      .from('journal_entries')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'שגיאה במחיקת רשומת יומן' }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'רשומת יומן לא נמצאה' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
