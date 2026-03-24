/**
 * API Route: יצירת Stripe Checkout session
 * POST /api/subscription/checkout
 * מקבל planId (basic | premium), מאמת משתמש, ויוצר session תשלום ב-Stripe
 * מחזיר URL להפנייה למשתמש לדף התשלום
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/** אתחול Stripe SDK — lazy init למניעת קריסה בזמן build */
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/** מזהי מחירים ב-Stripe לפי תוכנית */
const PRICE_IDS: Record<'basic' | 'premium', string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,
  premium: process.env.STRIPE_PRICE_PREMIUM!,
};

/** סכמת Zod לאימות גוף הבקשה */
const CheckoutSchema = z.object({
  planId: z.enum(['basic', 'premium']),
});

/**
 * POST /api/subscription/checkout
 * יוצר Stripe Checkout session עבור תוכנית מנוי נבחרת
 * @returns { url: string } — כתובת ה-Checkout של Stripe
 */
export async function POST(req: NextRequest) {
  try {
    // אימות משתמש מחובר
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // אימות גוף הבקשה
    const body: unknown = await req.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'תוכנית לא תקינה' }, { status: 400 });
    }

    const { planId } = parsed.data;

    // יצירת Stripe Checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_IDS[planId],
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'שגיאה ביצירת תשלום' }, { status: 500 });
  }
}
