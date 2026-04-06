import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * AGGRESSIVE CLEANUP - DELETE ALL DailyInsight records
 * This is a one-time cleanup to remove ALL old data
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[cleanupDailyInsights] AGGRESSIVE CLEANUP for user: ${user.email}`);

    // Get ALL DailyInsight records for this user
    const allInsights = await base44.asServiceRole.entities.DailyInsight.filter({
      created_by: user.email
    });

    console.log(`[cleanupDailyInsights] Found ${allInsights.length} total insights - DELETING ALL`);

    if (allInsights.length === 0) {
      return Response.json({
        success: true,
        deleted: 0,
        message: 'No records found'
      });
    }

    // DELETE ALL RECORDS - no validation, just delete everything
    let deletedCount = 0;
    for (const insight of allInsights) {
      try {
        await base44.asServiceRole.entities.DailyInsight.delete(insight.id);
        deletedCount++;
        console.log(`[cleanupDailyInsights] Deleted ${insight.id} (${deletedCount}/${allInsights.length})`);
      } catch (err) {
        console.error(`[cleanupDailyInsights] Failed to delete ${insight.id}:`, err);
      }
    }

    console.log(`[cleanupDailyInsights] CLEANUP COMPLETE. Deleted ${deletedCount}/${allInsights.length} records.`);

    return Response.json({
      success: true,
      deleted: deletedCount,
      total_checked: allInsights.length,
      message: `Deleted ALL ${deletedCount} DailyInsight records`
    });

  } catch (error) {
    console.error('[cleanupDailyInsights] Error:', error);
    return Response.json({ 
      error: error.message,
      success: false,
      deleted: 0
    }, { status: 500 });
  }
});