import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user's subscription
    const subscriptions = await base44.entities.Subscription.filter({
      created_by: user.email
    }, '-created_date', 1);

    if (subscriptions.length === 0) {
      return Response.json({ error: 'No subscription found' }, { status: 404 });
    }

    const subscription = subscriptions[0];

    if (!subscription.stripe_subscription_id) {
      return Response.json({ error: 'No Stripe subscription ID' }, { status: 400 });
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update local subscription
    await base44.entities.Subscription.update(subscription.id, {
      cancel_at_period_end: true
    });

    return Response.json({ 
      success: true, 
      message: 'Subscription will be cancelled at period end' 
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ 
      error: error.message || 'Failed to cancel subscription' 
    }, { status: 500 });
  }
});