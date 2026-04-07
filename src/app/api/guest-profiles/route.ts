/**
 * API Route: פרופילים אורחים — שליפה ויצירה
 * GET /api/guest-profiles — שליפת רשימת פרופילים אורחים
 * POST /api/guest-profiles — יצירת פרופיל אורח חדש (עם אכיפת מגבלת מנוי)
 * PROF-02 — מגבלות לפי תוכנית: Free=1, Basic=3, Premium=8
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { zodValidationError } from '@/lib/utils/api-error';

/** מגבלת פרופילים אורחים לפי תוכנית מנוי */
const GUEST_LIMITS: Record<string, number> = {
  free: 1,
  basic: 3,
  premium: 8,
};

/** ברירת מחדל — אם לא נמצאה תוכנית */
const DEFAULT_LIMIT = 1;

/** סכמת אימות לפרופיל אורח */
const GuestProfileSchema = z.object({
  /** שם מלא — חובה */
  full_name: z
    .string()
    .min(2, 'שם חייב להכיל לפחות 2 תווים')
    .max(100, 'שם לא יכול להכיל יותר מ-100 תווים'),

  /** תאריך לידה — חובה */
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין (YYYY-MM-DD)'),

  /** שעת לידה — אופציונלי */
  birth_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'פורמט שעה לא תקין (HH:mm)')
    .optional()
    .or(z.literal('')),

  /** מקום לידה — אופציונלי */
  birth_place: z
    .string()
    .max(200, 'מקום לידה לא יכול להכיל יותר מ-200 תווים')
    .optional()
    .or(z.literal('')),

  /** קשר — אופציונלי */
  relationship: z.string().max(100).optional(),
});

/** שליפת כל פרופילים האורחים של המשתמש */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('guest_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'שגיאה בשליפת פרופילים אורחים' }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** יצירת פרופיל אורח חדש עם אכיפת מגבלת מנוי */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = GuestProfileSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError('נתונים לא תקינים', parsed.error.flatten());
    }

    // ספירת פרופילים אורחים קיימים
    const { count: currentCount, error: countError } = await supabase
      .from('guest_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      return NextResponse.json({ error: 'שגיאה בבדיקת מגבלת פרופילים' }, { status: 500 });
    }

    // שליפת תוכנית המנוי לקביעת המגבלה
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, guest_profiles_limit')
      .eq('user_id', user.id)
      .single();

    // קביעת המגבלה — לפי guest_profiles_limit בטבלה, ואם אין — לפי plan_type
    const limit =
      subscription?.guest_profiles_limit ??
      GUEST_LIMITS[subscription?.plan_type ?? ''] ??
      DEFAULT_LIMIT;

    if ((currentCount ?? 0) >= limit) {
      return NextResponse.json(
        { error: 'הגעת למגבלת הפרופילים האורחים בתוכנית שלך' },
        { status: 403 }
      );
    }

    // יצירת הפרופיל
    const { data, error } = await supabase
      .from('guest_profiles')
      .insert({
        ...parsed.data,
        birth_time: parsed.data.birth_time || null,
        birth_place: parsed.data.birth_place || null,
        relationship: parsed.data.relationship ?? null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה ביצירת פרופיל אורח' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
