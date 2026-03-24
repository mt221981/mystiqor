/**
 * Stripe Webhook Handler — מטפל באירועי Stripe
 *
 * מסלול זה נמצא מחוץ לקבוצת (auth) — Stripe קורא לו ישירות ללא session משתמש.
 * הגנות:
 * 1. אימות signature — חתימת webhook מ-Stripe
 * 2. idempotency — כל אירוע מעובד פעם אחת בלבד דרך processed_webhook_events
 *
 * אירועים נתמכים:
 * - checkout.session.completed — יצירת מנוי לאחר תשלום ראשוני
 * - customer.subscription.updated — עדכון סטטוס/ביטול עתידי
 * - customer.subscription.deleted — ביטול מנוי וחזרה לחינם
 * - invoice.payment_failed — כישלון חיוב חוזר → שליחת אימייל
 */

import { NextRequest, NextResponse } from 'next/server';

import Stripe from 'stripe';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentFailedEmail } from '@/services/email/payment-failed';
import type { Database } from '@/types/database';

/** טיפוס מקומי לקליינט Admin */
type AdminClient = ReturnType<typeof createAdminClient>;

/** מיפוי סטטוס Stripe לסטטוס מנוי פנימי */
type SubscriptionStatus = Database['public']['Tables']['subscriptions']['Row']['status'];

/** אתחול Stripe — lazy init למניעת קריסה בזמן build */
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * POST /api/webhooks/stripe
 * מקבל אירועי webhook מ-Stripe, מאמת חתימה, ומעבד לפי סוג האירוע
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // --- שלב א: קריאת body גולמי ואימות חתימה ---
    // CRITICAL: חייב להשתמש ב-request.text() ולא request.json()
    // Stripe מחשב חתימה על ה-raw bytes — כל parsing ישבור את ה-signature
    const body = await request.text();
    const sig = request.headers.get('stripe-signature') ?? '';

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch {
      console.error('[webhook/stripe] חתימה לא תקינה');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // --- שלב ב: בדיקת idempotency (לפני עיבוד — Pitfall 2) ---
    // מנסים להוסיף את ה-event_id לפני עיבוד — unique constraint יכשיל כפל
    const supabase = createAdminClient();
    const { error: dupError } = await supabase
      .from('processed_webhook_events')
      .insert({ stripe_event_id: event.id, event_type: event.type });

    if (dupError) {
      // הפרת unique constraint = אירוע כבר עובד, מחזירים 200 בשקט
      console.log(`[webhook/stripe] אירוע כבר עובד: ${event.id}`);
      return NextResponse.json({ received: true });
    }

    // --- שלב ג: עיבוד לפי סוג האירוע ---
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(supabase, event);
        break;
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(supabase, event);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(supabase, event);
        break;
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(supabase, event);
        break;
      }

      default:
        console.log(`[webhook/stripe] אירוע לא מטופל: ${event.type}`);
    }

    // --- שלב ד: החזר 200 ---
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook/stripe] שגיאה לא צפויה:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * ממפה סטטוס Stripe לסטטוס מנוי פנימי
 * Stripe יכול להחזיר סטטוסים שאינם בטיפוס הפנימי (כגון 'paused')
 *
 * @param stripeStatus - סטטוס מ-Stripe
 * @returns סטטוס מנוי פנימי תואם
 */
function mapStripeStatusToSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  const statusMap: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> = {
    active: 'active',
    trialing: 'trial',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    paused: 'expired',
    incomplete: 'expired',
    incomplete_expired: 'expired',
  };
  return statusMap[stripeStatus] ?? 'expired';
}

/**
 * מטפל באירוע checkout.session.completed
 * upsert מנוי עם plan_type ו-analyses_limit נכון
 *
 * @param supabase - קליינט Admin של Supabase
 * @param event - אירוע Stripe
 */
async function handleCheckoutSessionCompleted(
  supabase: AdminClient,
  event: Stripe.Event
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId) {
    console.error('[webhook/stripe] checkout.session.completed: metadata חסר', {
      userId,
      planId,
      sessionId: session.id,
    });
    return;
  }

  // מגבלת ניתוחים: basic=20, כל שאר תוכניות בתשלום=-1 (ללא הגבלה)
  const analysesLimit = planId === 'basic' ? 20 : -1;

  // plan_type נשמר כ-string בDB — cast בטוח כי metadata.plan_id מגיע מה-checkout שלנו
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_type: planId as 'basic' | 'premium' | 'enterprise',
        status: 'active' as SubscriptionStatus,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        analyses_limit: analysesLimit,
        analyses_used: 0,
        start_date: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[webhook/stripe] שגיאה ב-upsert מנוי:', error);
  } else {
    console.log(`[webhook/stripe] מנוי נוצר/עודכן: userId=${userId}, plan=${planId}`);
  }
}

/**
 * מטפל באירוע customer.subscription.updated
 * מעדכן סטטוס מנוי וביטול עתידי
 *
 * @param supabase - קליינט Admin של Supabase
 * @param event - אירוע Stripe
 */
async function handleSubscriptionUpdated(
  supabase: AdminClient,
  event: Stripe.Event
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const mappedStatus = mapStripeStatusToSubscriptionStatus(sub.status);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: mappedStatus,
      cancel_at_period_end: sub.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', sub.id);

  if (error) {
    console.error('[webhook/stripe] שגיאה בעדכון מנוי:', error);
  } else {
    console.log(`[webhook/stripe] מנוי עודכן: ${sub.id}, status=${mappedStatus}`);
  }
}

/**
 * מטפל באירוע customer.subscription.deleted
 * מוריד משתמש לתוכנית חינם עם מגבלות ברירת מחדל
 *
 * @param supabase - קליינט Admin של Supabase
 * @param event - אירוע Stripe
 */
async function handleSubscriptionDeleted(
  supabase: AdminClient,
  event: Stripe.Event
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled' as SubscriptionStatus,
      plan_type: 'free',
      analyses_limit: 3,
      analyses_used: 0,
    })
    .eq('stripe_subscription_id', sub.id);

  if (error) {
    console.error('[webhook/stripe] שגיאה בביטול מנוי:', error);
  } else {
    console.log(`[webhook/stripe] מנוי בוטל וחזר לחינם: ${sub.id}`);
  }
}

/**
 * מטפל באירוע invoice.payment_failed
 * שולח אימייל על כישלון חיוב — כישלון שליחה לא גורם ל-webhook לכשול
 *
 * @param supabase - קליינט Admin של Supabase
 * @param event - אירוע Stripe
 */
async function handleInvoicePaymentFailed(
  supabase: AdminClient,
  event: Stripe.Event
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeCustomerId = invoice.customer as string;

  // מחפשים את המשתמש לפי stripe_customer_id
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (subError || !subscription) {
    console.error('[webhook/stripe] לא נמצא מנוי לקוח:', stripeCustomerId);
    return;
  }

  // מביאים פרטי פרופיל (אימייל מ-auth ושם מ-profiles)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', subscription.user_id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error('[webhook/stripe] לא נמצא פרופיל:', subscription.user_id);
    return;
  }

  // מביאים אימייל מ-auth.users דרך admin API
  const { data: authData, error: authError } =
    await supabase.auth.admin.getUserById(subscription.user_id);

  if (authError || !authData.user?.email) {
    console.error('[webhook/stripe] לא נמצא אימייל:', subscription.user_id);
    return;
  }

  const email = authData.user.email;
  const name = profile.full_name;
  const amountInShekel = (invoice.amount_due ?? 0) / 100;

  // שליחת אימייל — כישלון לא מחזיר שגיאה ל-Stripe
  try {
    await sendPaymentFailedEmail(email, name, amountInShekel);
    console.log(`[webhook/stripe] אימייל כישלון תשלום נשלח: ${email}`);
  } catch (emailError) {
    // כישלון שליחת אימייל לא אמור לגרום ל-webhook לכשול
    console.error('[webhook/stripe] שגיאה בשליחת אימייל:', emailError);
  }
}
