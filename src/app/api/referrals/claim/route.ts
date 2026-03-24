/**
 * API Route: מימוש קוד הפניה
 * POST /api/referrals/claim — מממש קוד הפניה ומעניק ניתוחי בונוס לממפנה
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReferralAcceptedEmail } from '@/services/email/referral-accepted';

import type { NextRequest } from 'next/server';

/** סכמת Zod לאימות גוף הבקשה */
const ClaimReferralSchema = z.object({
  /** קוד ההפניה בן 8 התווים */
  code: z.string().min(1).max(20),
  /** כתובת האימייל של המשתמש הממש */
  email: z.string().email(),
});

/** מספר ניתוחי בונוס ברירת מחדל לממפנה */
const DEFAULT_REWARD_ANALYSES = 5;

/**
 * POST /api/referrals/claim
 * מממש קוד הפניה — מעדכן סטטוס ומוסיף ניתוחים לממפנה
 * שליחת האימייל לממפנה היא non-fatal — כישלון לא מבטל את הפעולה
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

    // אימות קלט עם Zod
    const body: unknown = await request.json();
    const parsed = ClaimReferralSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { code, email } = parsed.data;

    // שליפת הרשומת הפניה לפי הקוד
    const { data: referral, error: fetchError } = await supabase
      .from('referrals')
      .select('id, referrer_id, reward_analyses')
      .eq('referral_code', code)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError) {
      console.error('[referrals/claim] Fetch referral failed:', fetchError);
      return NextResponse.json({ error: 'שגיאה בשליפת קוד ההפניה' }, { status: 500 });
    }

    if (!referral) {
      return NextResponse.json({ error: 'קוד הפניה לא נמצא' }, { status: 404 });
    }

    // מניעת מימוש קוד עצמי
    if (referral.referrer_id === user.id) {
      return NextResponse.json({ error: 'לא ניתן לממש קוד שלך' }, { status: 400 });
    }

    // עדכון רשומת הפניה לסטטוס "הושלם"
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        referred_email: email,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    if (updateError) {
      console.error('[referrals/claim] Update referral failed:', updateError);
      return NextResponse.json({ error: 'שגיאה בעדכון קוד ההפניה' }, { status: 500 });
    }

    // מספר ניתוחי הבונוס — מהרשומה או ברירת מחדל
    const rewardAnalyses = referral.reward_analyses ?? DEFAULT_REWARD_ANALYSES;

    // שליפת מנוי הממפנה להוספת ניתוחי בונוס
    const { data: subscription, error: subFetchError } = await supabase
      .from('subscriptions')
      .select('id, analyses_limit')
      .eq('user_id', referral.referrer_id)
      .single();

    if (subFetchError || !subscription) {
      console.error('[referrals/claim] Fetch referrer subscription failed:', subFetchError);
      return NextResponse.json({ error: 'שגיאה בשליפת מנוי הממפנה' }, { status: 500 });
    }

    // עדכון מגבלת ניתוחים עם תוספת הבונוס
    const { error: subUpdateError } = await supabase
      .from('subscriptions')
      .update({
        analyses_limit: subscription.analyses_limit + rewardAnalyses,
      })
      .eq('id', subscription.id);

    if (subUpdateError) {
      console.error('[referrals/claim] Update subscription failed:', subUpdateError);
      return NextResponse.json({ error: 'שגיאה בעדכון מנוי הממפנה' }, { status: 500 });
    }

    // שליחת אימייל לממפנה — כישלון לא מונע הצלחת הפעולה
    try {
      const adminClient = createAdminClient();

      // שליפת פרטי הממפנה דרך admin client
      const [profileResult, authResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', referral.referrer_id)
          .single(),
        adminClient.auth.admin.getUserById(referral.referrer_id),
      ]);

      const referrerName = profileResult.data?.full_name ?? 'משתמש';
      const referrerEmail = authResult.data.user?.email;

      if (referrerEmail) {
        await sendReferralAcceptedEmail(referrerEmail, referrerName, rewardAnalyses);
      }
    } catch (emailError) {
      console.error('[referrals/claim] Referral accepted email failed:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[referrals/claim] Unexpected error:', error);
    return NextResponse.json({ error: 'שגיאה בלתי צפויה' }, { status: 500 });
  }
}
