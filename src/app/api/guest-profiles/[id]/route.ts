/**
 * API Route: פרופיל אורח בודד — עדכון ומחיקה
 * PATCH /api/guest-profiles/[id] — עדכון פרופיל אורח
 * DELETE /api/guest-profiles/[id] — מחיקת פרופיל אורח
 * PROF-02
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { zodValidationError } from '@/lib/utils/api-error';

/** סכמת אימות חלקית לעדכון פרופיל אורח */
const GuestProfileUpdateSchema = z.object({
  /** שם מלא */
  full_name: z
    .string()
    .min(2, 'שם חייב להכיל לפחות 2 תווים')
    .max(100, 'שם לא יכול להכיל יותר מ-100 תווים')
    .optional(),

  /** תאריך לידה */
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין (YYYY-MM-DD)')
    .optional(),

  /** שעת לידה */
  birth_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'פורמט שעה לא תקין (HH:mm)')
    .optional()
    .or(z.literal('')),

  /** מקום לידה */
  birth_place: z
    .string()
    .max(200, 'מקום לידה לא יכול להכיל יותר מ-200 תווים')
    .optional()
    .or(z.literal('')),

  /** קשר */
  relationship: z.string().max(100).optional(),
});

/** פרמטרים של route */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/** עדכון פרופיל אורח */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = GuestProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError('נתונים לא תקינים', parsed.error.flatten());
    }

    // עדכון עם guard על user_id — מניעת עריכת פרופילים של משתמשים אחרים
    const updateData: Record<string, unknown> = { ...parsed.data };
    if ('birth_time' in parsed.data) {
      updateData.birth_time = parsed.data.birth_time || null;
    }
    if ('birth_place' in parsed.data) {
      updateData.birth_place = parsed.data.birth_place || null;
    }

    const { data, error } = await supabase
      .from('guest_profiles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בעדכון פרופיל אורח' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'פרופיל אורח לא נמצא' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** מחיקת פרופיל אורח */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // מחיקה עם guard על user_id — מניעת מחיקת פרופילים של משתמשים אחרים
    const { error } = await supabase
      .from('guest_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'שגיאה במחיקת פרופיל אורח' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
