/**
 * API Route: יצירת סשן ניהול חשבון ב-Stripe
 * POST /api/subscription/portal — מייצר קישור לפורטל הניהול של Stripe
 *
 * שלבים:
 * 1. אימות משתמש
 * 2. שליפת stripe_customer_id מה-DB
 * 3. יצירת סשן פורטל ב-Stripe
 * 4. החזרת URL לניתוב בצד הלקוח
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

/** אתחול Stripe עם secret key — lazy init למניעת קריסה בזמן build */
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * POST /api/subscription/portal
 * מייצר סשן ניהול חשבון ב-Stripe ומחזיר URL לניתוב
 *
 * @returns JSON עם url לפורטל Stripe
 */
export async function POST(): Promise<NextResponse> {
  try {
    // --- שלב א: אימות משתמש ---
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // --- שלב ב: שליפת stripe_customer_id מה-DB ---
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('[portal] שגיאה בשליפת מנוי:', subError);
      return NextResponse.json(
        { error: 'שגיאה בשליפת פרטי מנוי' },
        { status: 500 }
      );
    }

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'אין מנוי פעיל' }, { status: 400 });
    }

    // --- שלב ג: יצירת סשן פורטל ב-Stripe ---
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`,
    });

    // --- שלב ד: החזרת URL ---
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[portal] שגיאה בפתיחת ניהול חשבון:', error);
    return NextResponse.json(
      { error: 'שגיאה בפתיחת ניהול חשבון' },
      { status: 500 }
    );
  }
}
