/**
 * API route להשלמת onboarding
 * מבצע: (1) אימות קלט עם Zod, (2) upsert לטבלת profiles, (3) יצירת שורת subscription חינמית
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { onboardingCompleteSchema } from '@/lib/validations/profile';
import { sendWelcomeEmail } from '@/services/email/welcome';
import { zodValidationError } from '@/lib/utils/api-error';

import type { NextRequest } from 'next/server';

/** ערכי ברירת מחדל למנוי חינמי */
const FREE_SUBSCRIPTION_DEFAULTS = {
  plan_type: 'free',
  status: 'trial',
  analyses_limit: 3,
  analyses_used: 0,
  guest_profiles_limit: 1,
  guest_profiles_used: 0,
} as const;

/**
 * POST /api/onboarding/complete
 * מקבל נתוני onboarding, מאמת עם Zod, שומר פרופיל ויוצר מנוי חינמי
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // בדיקת אימות — חובה
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'לא מחובר למערכת' },
        { status: 401 }
      );
    }

    // אימות קלט עם Zod
    const body: unknown = await request.json();
    const parsed = onboardingCompleteSchema.safeParse(body);

    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten());
    }

    const {
      accepted_barnum: _acceptedBarnum,
      accepted_terms: _acceptedTerms,
      ...profileData
    } = parsed.data;

    // 1. Upsert profile (includes timezone_name if provided)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profileData,
      birth_time: profileData.birth_time || null,
      birth_place: profileData.birth_place || null,
      timezone_name: profileData.timezone_name || null,
      onboarding_completed: true,
    });

    if (profileError) {
      console.error('[onboarding/complete] Profile upsert failed:', profileError);
      return NextResponse.json(
        { error: 'שגיאה בשמירת הפרופיל' },
        { status: 500 }
      );
    }

    // שליחת אימייל ברוכים הבאים — כישלון לא מונע הצלחת onboarding
    try {
      await sendWelcomeEmail(user.email!, parsed.data.full_name);
    } catch (emailError) {
      console.error('[onboarding/complete] Welcome email failed:', emailError);
    }

    // 2. Create free subscription row (if not exists)
    // NOTE: subscriptions table uses user_id (required FK to auth.users), NOT id.
    // The id column is auto-generated. Do NOT set id: user.id.
    // This contradicts RESEARCH.md Pitfall 6 which is incorrect — verified against database.generated.ts.
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingSub) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          ...FREE_SUBSCRIPTION_DEFAULTS,
        });

      if (subError) {
        console.error('[onboarding/complete] Subscription creation failed:', subError);
        // Profile was saved — subscription failure is non-fatal
        // Log but don't fail the request
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[onboarding/complete] Unexpected error:', error);
    return NextResponse.json(
      { error: 'שגיאה בלתי צפויה' },
      { status: 500 }
    );
  }
}
