/**
 * GET  /api/learn/progress — שליפת התקדמות למידה של המשתמש
 * POST /api/learn/progress — עדכון / upsert של נושא שהושלם
 *
 * מדוע: מאפשר מעקב אחר התקדמות בנושאי למידה לפי תחום,
 * עם upsert על (user_id, discipline, topic) למניעת כפילויות.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LearningProgressSchema } from '@/lib/validations/learning';
import type { Tables } from '@/types/database';

/** שורת התקדמות למידה */
type LearningProgressRow = Tables<'learning_progress'>;

/**
 * GET /api/learn/progress — שליפת כל רשומות ההתקדמות של המשתמש
 * תומך בסינון אופציונלי לפי discipline
 */
export async function GET(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline');

    // בניית שאילתה — כל ההתקדמות של המשתמש
    let query = supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_studied', { ascending: false });

    // סינון תחום אופציונלי
    if (discipline) {
      query = query.eq('discipline', discipline);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[learn/progress GET] Supabase error:', error);
      return NextResponse.json({ error: 'שגיאה בטעינת ההתקדמות' }, { status: 500 });
    }

    return NextResponse.json({ data: (data as LearningProgressRow[]) ?? [] });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 });
  }
}

/**
 * POST /api/learn/progress — upsert של נושא שהושלם
 * מעדכן last_studied לעכשיו, מוסיף רשומה חדשה או מעדכן קיימת
 */
export async function POST(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // אימות גוף הבקשה עם Zod
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'גוף הבקשה לא תקין' }, { status: 400 });
    }

    const parseResult = LearningProgressSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { discipline, topic, completed, quiz_score } = parseResult.data;

    // upsert על (user_id, discipline, topic) — מעדכן last_studied לעכשיו
    const { data, error } = await supabase
      .from('learning_progress')
      .upsert(
        {
          user_id: user.id,
          discipline,
          topic,
          completed,
          quiz_score: quiz_score ?? null,
          last_studied: new Date().toISOString(),
        },
        { onConflict: 'user_id,discipline,topic' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('[learn/progress POST] Supabase error:', error);
      return NextResponse.json({ error: 'שגיאה בשמירת ההתקדמות' }, { status: 500 });
    }

    return NextResponse.json({ data: data as LearningProgressRow }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשרת' }, { status: 500 });
  }
}
