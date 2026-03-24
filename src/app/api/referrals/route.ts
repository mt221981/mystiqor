/**
 * API Route: ניהול קוד הפניה של המשתמש
 * GET  /api/referrals — מחזיר קוד הפניה קיים של המשתמש
 * POST /api/referrals — יוצר קוד הפניה חדש למשתמש
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import type { NextRequest } from 'next/server';

/**
 * מייצר קוד הפניה בן 8 תווים אלפאנומריים גדולים
 */
function generateReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
}

/**
 * GET /api/referrals
 * מחזיר קוד הפניה קיים של המשתמש המחובר
 * אם אין קוד פעיל, מחזיר { code: null }
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

    // שליפת קוד הפניה פעיל של המשתמש
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      console.error('[referrals] GET failed:', error);
      return NextResponse.json({ error: 'שגיאה בשליפת קוד הפניה' }, { status: 500 });
    }

    return NextResponse.json({ code: referral?.referral_code ?? null });
  } catch (error) {
    console.error('[referrals] GET unexpected error:', error);
    return NextResponse.json({ error: 'שגיאה בלתי צפויה' }, { status: 500 });
  }
}

/**
 * POST /api/referrals
 * יוצר קוד הפניה חדש למשתמש המחובר
 * מנסה שוב פעם אחת אם קיימת התנגשות (unique constraint)
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // בדיקת אימות — חובה
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר למערכת' }, { status: 401 });
    }

    // ניסיון ראשון ליצירת קוד
    let code = generateReferralCode();

    const { error: insertError } = await supabase.from('referrals').insert({
      referral_code: code,
      referrer_id: user.id,
      referred_email: '',
      status: 'pending',
    });

    if (insertError) {
      // אם יש התנגשות ב-unique constraint — ניסיון שני עם קוד חדש
      if (insertError.code === '23505') {
        code = generateReferralCode();

        const { error: retryError } = await supabase.from('referrals').insert({
          referral_code: code,
          referrer_id: user.id,
          referred_email: '',
          status: 'pending',
        });

        if (retryError) {
          console.error('[referrals] POST retry failed:', retryError);
          return NextResponse.json({ error: 'שגיאה ביצירת קוד הפניה' }, { status: 500 });
        }
      } else {
        console.error('[referrals] POST failed:', insertError);
        return NextResponse.json({ error: 'שגיאה ביצירת קוד הפניה' }, { status: 500 });
      }
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error('[referrals] POST unexpected error:', error);
    return NextResponse.json({ error: 'שגיאה בלתי צפויה' }, { status: 500 });
  }
}
