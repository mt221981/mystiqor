/**
 * GET /api/cron/daily-insights — יצירת תובנות יומיות לכל המשתמשים הפעילים
 *
 * מסלול זה מופעל על-ידי Vercel Cron מדי יום בשעה 04:00 UTC (06:00/07:00 שעון ישראל).
 * שלב 1 (Phase 28): קליטת auth, שליפת משתמשים פעילים, תשתית בידוד שגיאות לכל משתמש.
 * שלב 2 (Phase 30): הוספת קריאת LLM בפועל ושמירה ל-daily_insights.
 *
 * אבטחה: CRON_SECRET — רק Vercel Cron יכול לקרוא למסלול זה.
 * בידוד שגיאות: כישלון עבור משתמש אחד לא מפיל את הריצה כולה (Pitfall 20).
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

/** מגבלת זמן ריצה — 300 שניות לייצור תובנות עבור משתמשים רבים */
export const maxDuration = 600;

/**
 * GET /api/cron/daily-insights
 * שלד לייצור תובנות יומיות לכל המנויים הפעילים
 *
 * @param request - בקשת HTTP נכנסת
 * @returns תגובת JSON עם סיכום: processed, skipped, errors
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // --- שלב א: אימות CRON_SECRET (חייב להיות ראשון) ---
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[cron/daily-insights] ניסיון גישה לא מורשית');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- שלב ב: שליפת משתמשים פעילים ---
  const supabase = createAdminClient();

  const { data: activeSubscriptions, error: fetchError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (fetchError) {
    console.error('[cron/daily-insights] שגיאה בשליפת מנויים פעילים:', fetchError);
    return NextResponse.json(
      { error: 'שגיאה בשליפת משתמשים פעילים' },
      { status: 500 }
    );
  }

  const users = activeSubscriptions ?? [];
  console.log(`[cron/daily-insights] נמצאו ${users.length} מנויים פעילים`);

  // --- שלב ג: עיבוד לכל משתמש עם בידוד שגיאות ---
  let errorCount = 0;

  for (const subscription of users) {
    const userId = subscription.user_id;

    try {
      // TODO (Phase 30): כאן תבוא קריאת LLM בפועל + שמירה ל-daily_insights
      // לעת עתה: שלד שמאמת את התשתית
      console.log(`[cron/daily-insights] תובנה תיוצר עבור משתמש: ${userId}`);
    } catch (userError) {
      // כישלון עבור משתמש אחד לא מפיל את הריצה כולה
      errorCount++;
      console.error(`[cron/daily-insights] שגיאה עבור משתמש ${userId}:`, userError);
    }
  }

  const summary = {
    processed: users.length - errorCount,
    skipped: 0,
    errors: errorCount,
  };

  console.log('[cron/daily-insights] ריצה הושלמה:', summary);

  return NextResponse.json(summary);
}
