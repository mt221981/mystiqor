import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * פונקציה עזר לשמירת Features מניתוח
 * לא משנה פונקציונליות קיימת - רק מוסיפה שכבת תיעוד
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // אימות משתמש
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_id, tool_type, features } = await req.json();

    if (!analysis_id || !tool_type || !features || !Array.isArray(features)) {
      return Response.json({ 
        error: 'Missing required fields: analysis_id, tool_type, features (array)' 
      }, { status: 400 });
    }

    // שמירת כל ה-features
    const savedFeatures = [];
    
    for (const feature of features) {
      try {
        const saved = await base44.entities.Feature.create({
          analysis_id,
          tool_type,
          feature_category: feature.category || 'other',
          feature_key: feature.key,
          feature_value: typeof feature.value === 'object' 
            ? JSON.stringify(feature.value) 
            : String(feature.value),
          numeric_value: typeof feature.value === 'number' ? feature.value : undefined,
          confidence: feature.confidence || 0.9,
          weight: feature.weight || 0.5,
          source: feature.source || 'calculation',
          provenance: feature.provenance || {},
          metadata: feature.metadata || {},
          tags: feature.tags || []
        });
        
        savedFeatures.push(saved);
      } catch (err) {
        console.error(`Failed to save feature ${feature.key}:`, err);
        // ממשיכים גם אם feature אחד נכשל
      }
    }

    return Response.json({ 
      success: true,
      saved_count: savedFeatures.length,
      features: savedFeatures
    });

  } catch (error) {
    console.error('Error in saveFeatures:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});