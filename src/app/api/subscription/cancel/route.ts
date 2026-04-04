/**
 * API Route: ביטול מנוי בסוף תקופת החיוב
 * POST /api/subscription/cancel — מבטל את המנוי הנוכחי בסוף התקופה (לא מיידי)
 *
 * שלבים:
 * 1. אימות משתמש
 * 2. שליפת stripe_subscription_id מה-DB
 * 3. עדכון המנוי ב-Stripe לביטול בסוף התקופה
 * 4. עדכון cancel_at_period_end ב-DB
 * 5. החזרת אישור ביטול
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

/** אתחול Stripe עם secret key — lazy init למניעת קריסה בזמן build */
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * POST /api/subscription/cancel
 * מבטל מנוי קיים ב-Stripe בסוף תקופת החיוב ומעדכן את ה-DB
 *
 * @returns JSON עם אישור ביטול
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

    // --- שלב ב: שליפת stripe_subscription_id מה-DB ---
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('[cancel] שגיאה בשליפת מנוי:', subError);
      return NextResponse.json(
        { error: 'שגיאה בשליפת פרטי מנוי' },
        { status: 500 }
      );
    }

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'אין מנוי פעיל' }, { status: 400 });
    }

    // --- שלב ג: עדכון ב-Stripe לביטול בסוף התקופה ---
    await getStripe().subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // --- שלב ד: עדכון cancel_at_period_end ב-DB ---
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[cancel] שגיאה בעדכון DB לאחר ביטול Stripe:', updateError);
      // המנוי כבר בוטל ב-Stripe — מחזירים הצלחה אך מתעדים את שגיאת ה-DB
    }

    // --- שלב ה: החזרת אישור ---
    return NextResponse.json({ success: true, cancel_at_period_end: true });
  } catch (error) {
    // טיפול בשגיאות Stripe ספציפיות
    if (error instanceof Stripe.errors.StripeError) {
      console.error('[cancel] שגיאת Stripe:', error.type, error.message);
    } else {
      console.error('[cancel] שגיאה בביטול מנוי:', error);
    }
    return NextResponse.json(
      { error: 'שגיאה בביטול המנוי' },
      { status: 500 }
    );
  }
}
