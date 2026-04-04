/**
 * GET /api/cron/reset-usage — איפוס מונה שימוש חודשי
 *
 * מסלול זה מופעל על-ידי Vercel Cron בתחילת כל חודש (0 0 1 * *).
 * הוא קורא לפונקציית DB `reset_monthly_usage()` שמאפסת את `analyses_used`
 * לכל המנויים הפעילים.
 *
 * אבטחה: CRON_SECRET — רק Vercel Cron (ולא כל מבקש חיצוני) יכול לקרוא למסלול.
 * אידמפוטנטי: `reset_monthly_usage()` מגדיר counters ל-0 (לא מקטין) — בטוח לקרוא פעמיים.
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

/** מגבלת זמן ריצה — 30 שניות מספיקות לקריאת RPC בודדת */
export const maxDuration = 30;

/**
 * GET /api/cron/reset-usage
 * מאפס את מונה השימוש החודשי לכל המנויים דרך פונקציית DB
 *
 * @param request - בקשת HTTP נכנסת
 * @returns תגובת JSON עם success או שגיאה
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // --- שלב א: אימות CRON_SECRET (חייב להיות ראשון) ---
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[cron/reset-usage] ניסיון גישה לא מורשית');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // --- שלב ב: קריאה לפונקציית DB לאיפוס המונים ---
    console.log('[cron/reset-usage] מתחיל איפוס מונה שימוש חודשי');

    const supabase = createAdminClient();
    const { error } = await supabase.rpc('reset_monthly_usage');

    if (error) {
      console.error('[cron/reset-usage] שגיאה בקריאת reset_monthly_usage:', error);
      return NextResponse.json(
        { error: 'שגיאה באיפוס מונה השימוש החודשי' },
        { status: 500 }
      );
    }

    const resetAt = new Date().toISOString();
    console.log(`[cron/reset-usage] איפוס הושלם בהצלחה: ${resetAt}`);

    return NextResponse.json({ success: true, reset_at: resetAt });
  } catch (error) {
    console.error('[cron/reset-usage] שגיאה לא צפויה:', error);
    return NextResponse.json(
      { error: 'שגיאה לא צפויה באיפוס שימוש' },
      { status: 500 }
    );
  }
}
