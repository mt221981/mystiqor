import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/debug/seed — יוצר פרופיל ומנוי בסיסי למשתמש המחובר */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // יצירת פרופיל
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: 'משה',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      birth_place: 'תל אביב',
      latitude: 32.0853,
      longitude: 34.7818,
      timezone_name: 'Asia/Jerusalem',
      gender: 'male',
      disciplines: ['אסטרולוגיה', 'נומרולוגיה', 'טארוט'],
      focus_areas: ['הכרת עצמי', 'קריירה'],
      onboarding_completed: true,
    });

    if (profileErr) {
      return NextResponse.json({ error: `Profile: ${profileErr.message}` }, { status: 500 });
    }

    // יצירת מנוי חינמי
    const { error: subErr } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      plan_type: 'free',
      status: 'active',
      analyses_limit: 3,
      analyses_used: 0,
      guest_profiles_limit: 1,
      guest_profiles_used: 0,
    }, { onConflict: 'user_id' });

    if (subErr) {
      return NextResponse.json({ error: `Subscription: ${subErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'פרופיל ומנוי נוצרו בהצלחה! לך ל-/dashboard',
      user: user.email,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
