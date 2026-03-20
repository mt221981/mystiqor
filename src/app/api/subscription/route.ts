/**
 * API Route: סטטוס מנוי
 * GET /api/subscription — מחזיר מנוי נוכחי עם plan info
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLAN_INFO } from '@/lib/constants/plans';
import type { PlanType } from '@/types/subscription';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      const freePlan = PLAN_INFO.free;
      return NextResponse.json({
        data: {
          plan_type: 'free' as PlanType,
          status: 'active',
          analyses_used: 0,
          analyses_limit: freePlan.analyses,
          guest_profiles_used: 0,
          guest_profiles_limit: freePlan.guestProfiles,
        },
      });
    }

    const planType = (subscription.plan_type ?? 'free') as PlanType;

    return NextResponse.json({
      data: {
        ...subscription,
        planInfo: PLAN_INFO[planType] ?? PLAN_INFO.free,
      },
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשליפת מנוי' }, { status: 500 });
  }
}
