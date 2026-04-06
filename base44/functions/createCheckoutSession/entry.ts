import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.10.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLANS = {
  basic: {
    name: 'מנוי בסיסי',
    price: 4900, // 49 ILS in agorot
    interval: 'month'
  },
  premium: {
    name: 'מנוי פרימיום',
    price: 9900, // 99 ILS in agorot
    interval: 'month'
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, successUrl, cancelUrl } = await req.json();

    if (!planId || !PLANS[planId]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Check if customer exists
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          user_email: user.email
        }
      });
    }

    // Create or get price
    const prices = await stripe.prices.list({
      lookup_keys: [`${planId}_monthly`],
      limit: 1
    });

    let price;
    if (prices.data.length > 0) {
      price = prices.data[0];
    } else {
      // Create product and price
      const product = await stripe.products.create({
        name: plan.name,
        metadata: { plan_id: planId }
      });

      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'ils',
        recurring: { interval: plan.interval },
        lookup_key: `${planId}_monthly`
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_id: planId
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          plan_id: planId
        }
      }
    });

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
});