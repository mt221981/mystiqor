/**
 * API Route: פרופיל משתמש — שליפה ועדכון
 * GET /api/profile — שליפת הפרופיל הנוכחי
 * PATCH /api/profile — עדכון פרופיל משתמש
 * PROF-01
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validations/profile';

/** שליפת פרופיל המשתמש הנוכחי */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בשליפת פרופיל' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** עדכון פרופיל המשתמש */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const body = await request.json();

    // partial — לא כל השדות חובה בעת עריכה
    const parsed = profileSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בעדכון פרופיל' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
