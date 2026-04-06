import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user's subscription
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      created_by: user.email
    }, '-created_date', 1);

    if (subscriptions.length === 0) {
      // Create default free subscription if none exists
      const newSub = await base44.asServiceRole.entities.Subscription.create({
        created_by: user.email,
        plan_type: 'free',
        status: 'active',
        analyses_limit: 3,
        analyses_used: 1,
        guest_profiles_limit: 1,
        guest_profiles_used: 0,
        auto_renew: false
      });
      
      return Response.json({ 
        success: true, 
        new_count: 1,
        subscription: newSub
      });
    }

    const subscription = subscriptions[0];
    const currentUsage = subscription.analyses_used || 0;
    const limit = subscription.analyses_limit || 3;

    // Check if limit reached (unless unlimited)
    if (limit !== -1 && currentUsage >= limit) {
      return Response.json({ 
        error: 'Usage limit reached',
        current: currentUsage,
        limit: limit
      }, { status: 403 });
    }

    // Increment usage
    const newCount = currentUsage + 1;
    await base44.asServiceRole.entities.Subscription.update(subscription.id, {
      analyses_used: newCount
    });

    return Response.json({ 
      success: true, 
      new_count: newCount,
      limit: limit
    });

  } catch (error) {
    console.error('incrementUsage error:', error);
    return Response.json({ 
      error: error.message || 'Failed to increment usage' 
    }, { status: 500 });
  }
});