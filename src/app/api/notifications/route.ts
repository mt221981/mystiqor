/**
 * API Route: ניהול תזכורות והתראות
 * GET    /api/notifications — מחזיר רשימת תזכורות של המשתמש
 * POST   /api/notifications — יוצר תזכורת חדשה
 * DELETE /api/notifications?id={id} — מוחק תזכורת לפי מזהה
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

import type { NextRequest } from 'next/server';

// ===== סכמת Zod לאימות קלט =====

/** סכמת יצירת תזכורת */
const ReminderSchema = z.object({
  message: z.string().min(1).max(500),
  scheduled_date: z.string().datetime(),
  type: z.enum(['analysis', 'mood', 'journal', 'goal', 'custom']),
  is_recurring: z.boolean().optional().default(false),
  recurrence_rule: z.string().optional().nullable(),
});

/**
 * GET /api/notifications
 * מחזיר עד 50 תזכורות של המשתמש המחובר, ממוינות לפי תאריך יעד
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // בדיקת אימות — חובה
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר למערכת' }, { status: 401 });
    }

    // שליפת תזכורות המשתמש
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[notifications] GET failed:', error);
      return NextResponse.json({ error: 'שגיאה בשליפת התזכורות' }, { status: 500 });
    }

    return NextResponse.json({ reminders: reminders ?? [] });
  } catch (err) {
    console.error('[notifications] GET unexpected error:', err);
    return NextResponse.json({ error: 'שגיאה בלתי צפויה' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * יוצר תזכורת חדשה עבור המשתמש המחובר
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // בדיקת אימות — חובה
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר למערכת' }, { status: 401 });
    }

    // אימות גוף הבקשה
    const body: unknown = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'גוף הבקשה חסר' }, { status: 400 });
    }

    const parsed = ReminderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, scheduled_date, type, is_recurring, recurrence_rule } = parsed.data;

    // הכנסת התזכורת לבסיס הנתונים
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        message,
        scheduled_date,
        type,
        is_recurring: is_recurring ?? false,
        recurrence_rule: recurrence_rule ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[notifications] POST failed:', error);
      return NextResponse.json({ error: 'שגיאה ביצירת התזכורת' }, { status: 500 });
    }

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (err) {
    console.error('[notifications] POST unexpected error:', err);
    return NextResponse.json({ error: 'שגיאה בלתי צפויה' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications?id={id}
 * מוחק תזכורת של המשתמש המחובר לפי מזהה
 * מוגן: מוחק רק תזכורות של המשתמש עצמו
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // בדיקת אימות — חובה
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר למערכת' }, { status: 401 });
    }

    // שליפת מזהה התזכורת מהפרמטרים
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'מזהה תזכורת חסר' }, { status: 400 });
    }

    // מחיקה עם בדיקת בעלות — user_id מבטיח שמשתמש לא יכול למחוק תזכורות של אחרים
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[notifications] DELETE failed:', error);
      return NextResponse.json({ error: 'שגיאה במחיקת התזכורת' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notifications] DELETE unexpected error:', err);
    return NextResponse.json({ error: 'שגיאה בלתי צפויה' }, { status: 500 });
  }
}
