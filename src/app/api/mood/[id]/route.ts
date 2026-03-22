/**
 * API Route: מחיקת רשומת מצב רוח
 * DELETE /api/mood/[id] — מחיקה לפי מזהה עם בדיקת בעלות
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** מחיקת רשומת מצב רוח לפי מזהה */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // בדיקת אימות
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // חילוץ מזהה (Next.js 15 — params הוא Promise)
    const { id } = await params;

    // מחיקה עם בדיקת בעלות (user_id guard)
    const { error, count } = await supabase
      .from('mood_entries')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'שגיאה במחיקת רשומת מצב הרוח' },
        { status: 500 }
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { error: 'רשומה לא נמצאה' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
