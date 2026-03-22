/**
 * API Route: מצב רוח — יצירה ושליפה
 * POST /api/mood — רישום רשומת מצב רוח חדשה
 * GET  /api/mood — שליפת רשימת רשומות לפי תקופה (daily/weekly/monthly)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { subDays, subMonths } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { MoodCreateSchema } from '@/lib/validations/mood';
import type { TablesInsert } from '@/types/database';

/** ערכי תקופה תקינים לפילטור */
const PERIOD_VALUES = ['daily', 'weekly', 'monthly'] as const;
type Period = (typeof PERIOD_VALUES)[number];

/**
 * מחשב את תאריך ההתחלה לפי תקופה
 * @param period - daily / weekly / monthly
 */
function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'daily':
      return subDays(now, 1);
    case 'monthly':
      return subMonths(now, 1);
    case 'weekly':
    default:
      return subDays(now, 7);
  }
}

/** רישום רשומת מצב רוח חדשה */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // בדיקת אימות
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // ולידציה
    const body: unknown = await request.json();
    const parsed = MoodCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // שמירה ב-DB
    const row: TablesInsert<'mood_entries'> = {
      user_id: user.id,
      mood: parsed.data.mood,
      mood_score: parsed.data.mood_score,
      energy_level: parsed.data.energy_level ?? null,
      stress_level: parsed.data.stress_level ?? null,
      sleep_quality: parsed.data.sleep_quality ?? null,
      notes: parsed.data.notes ?? null,
      activities: parsed.data.activities,
      gratitude: parsed.data.gratitude,
    };

    const { data, error } = await supabase
      .from('mood_entries')
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'שגיאה בשמירת מצב הרוח' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** שליפת רשומות מצב רוח לפי תקופה */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // בדיקת אימות
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // חילוץ פרמטר period — ברירת מחדל: weekly
    const rawPeriod = request.nextUrl.searchParams.get('period') ?? 'weekly';
    const period: Period = PERIOD_VALUES.includes(rawPeriod as Period)
      ? (rawPeriod as Period)
      : 'weekly';

    const startDate = getStartDate(period);

    // שאילתה
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'שגיאה בשליפת רשומות מצב הרוח' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
