import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active subscriptions
    const subscriptions = await base44.entities.Subscription.filter({
      created_by: user.email,
      status: 'active'
    }, '-created_date', 1);

    let subscription = subscriptions.length > 0 ? subscriptions[0] : null;

    // If no subscription exists, create free subscription
    if (!subscription) {
      subscription = await base44.entities.Subscription.create({
        plan_type: 'free',
        status: 'active',
        analyses_limit: 5,
        analyses_used: 0,
        start_date: new Date().toISOString(),
        last_reset_date: new Date().toISOString(),
        auto_renew: false,
        cancel_at_period_end: false
      });

      return Response.json({
        hasSubscription: true,
        plan: 'free',
        status: 'active',
        analysesLimit: 5,
        analysesUsed: 0,
        analysesRemaining: 5,
        canAnalyze: true
      });
    }

    // Check if monthly reset is needed (for free and basic plans)
    if (subscription.plan_type === 'free' || subscription.plan_type === 'basic') {
      const lastReset = subscription.last_reset_date ? new Date(subscription.last_reset_date) : new Date(subscription.created_date);
      const now = new Date();
      
      // Reset if it's a new month
      const needsReset = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();

      if (needsReset) {
        await base44.entities.Subscription.update(subscription.id, {
          analyses_used: 0,
          last_reset_date: now.toISOString()
        });
        subscription.analyses_used = 0;
        subscription.last_reset_date = now.toISOString();
      }
    }

    // Calculate remaining analyses
    const isUnlimited = subscription.plan_type === 'premium' || subscription.plan_type === 'enterprise';
    const analysesRemaining = isUnlimited 
      ? 999999 
      : Math.max(0, subscription.analyses_limit - (subscription.analyses_used || 0));

    return Response.json({
      hasSubscription: true,
      plan: subscription.plan_type,
      status: subscription.status,
      analysesLimit: subscription.analyses_limit,
      analysesUsed: subscription.analyses_used || 0,
      analysesRemaining,
      canAnalyze: isUnlimited || analysesRemaining > 0,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      autoRenew: subscription.auto_renew || false,
      isUnlimited,
      lastResetDate: subscription.last_reset_date
    });

  } catch (error) {
    console.error('Get subscription status failed:', error);
    return Response.json({ 
      error: 'Failed to get subscription status',
      details: error.message 
    }, { status: 500 });
  }
});