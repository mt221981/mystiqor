import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    const base44 = createClientFromRequest(req);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const planId = session.metadata.plan_id;

        // Check if subscription already exists
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
          created_by: userId
        }, '-created_date', 1);

        const subData = {
          created_by: userId,
          plan_type: planId,
          status: 'trial',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          analyses_limit: planId === 'basic' ? 20 : -1,
          analyses_used: 0,
          guest_profiles_limit: planId === 'basic' ? 3 : 10,
          guest_profiles_used: 0,
          auto_renew: true
        };

        if (existingSubs.length > 0) {
          // Update existing subscription
          await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, subData);
        } else {
          // Create new subscription
          await base44.asServiceRole.entities.Subscription.create(subData);
        }

        // Record payment
        await base44.asServiceRole.entities.PaymentHistory.create({
          created_by: userId,
          stripe_payment_id: session.payment_intent,
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          status: 'succeeded'
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        // Update subscription status
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: subscription.status === 'active' ? 'active' : subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
            status: 'cancelled',
            end_date: new Date().toISOString()
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;

        const subs = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription
        });

        if (subs.length > 0) {
          await base44.asServiceRole.entities.PaymentHistory.create({
            created_by: subs[0].created_by,
            stripe_payment_id: invoice.payment_intent,
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'failed',
            error_message: 'Payment failed'
          });
        }
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message || 'Webhook handler failed' 
    }, { status: 500 });
  }
});