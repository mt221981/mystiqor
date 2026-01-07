import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goal_id } = await req.json();

    if (!goal_id) {
      return Response.json({ error: 'goal_id is required' }, { status: 400 });
    }

    // Get the goal
    const goals = await base44.entities.UserGoal.filter({ id: goal_id }, '', 1);
    const goal = goals[0];

    if (!goal) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Get user profile for context
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email }, '', 1);
    const profile = profiles[0];

    // Get related analyses if any
    const relatedAnalyses = goal.related_analysis_ids && goal.related_analysis_ids.length > 0
      ? await base44.asServiceRole.entities.Analysis.filter({ 
          id: { $in: goal.related_analysis_ids } 
        })
      : [];

    // Generate AI recommendations
    const prompt = `אתה מאמן אישי מומחה. עזור למשתמש להגיע ליעד שלו.

**פרטי המשתמש:**
- שם: ${profile?.full_name_hebrew || user.full_name || 'משתמש'}
- תאריך לידה: ${profile?.birth_date || 'לא צוין'}

**היעד:**
- כותרת: ${goal.goal_title}
- תיאור: ${goal.goal_description}
- קטגוריה: ${goal.goal_category}
- יעד לתאריך: ${goal.target_date || 'לא הוגדר'}

**ניתוחים קשורים:**
${relatedAnalyses.length > 0 ? relatedAnalyses.map(a => `- ${a.tool_type}: ${a.summary}`).join('\n') : 'אין ניתוחים קשורים'}

**צור:**
1. **ai_summary** - סיכום מעודד ומוטיבציוני (100-150 מילים) שמסביר איך היעד הזה קשור לתובנות מהניתוחים ולאישיות של המשתמש
2. **ai_action_plan** - תוכנית פעולה של 5-8 פעולות מעשיות, כל אחת עם:
   - action: פעולה ספציפית ומדידה
   - estimated_time: זמן משוער (למשל "שבועיים", "חודש")
   - priority: low/medium/high
3. **recommended_tools** - 2-4 כלים מהמערכת שיכולים לעזור (numerology, astrology, palmistry, graphology, tarot, drawing, journal)
4. **motivation_quote** - ציטוט מעורר השראה (50-100 תווים)

דבר בגוף שני, בצורה חמה ואישית.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          ai_summary: { type: "string", minLength: 300, maxLength: 600 },
          ai_action_plan: {
            type: "array",
            minItems: 5,
            maxItems: 8,
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                estimated_time: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                status: { type: "string", enum: ["todo", "in_progress", "completed"], default: "todo" }
              },
              required: ["action", "estimated_time", "priority"]
            }
          },
          recommended_tools: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string" }
          },
          motivation_quote: { type: "string", minLength: 50, maxLength: 150 }
        },
        required: ["ai_summary", "ai_action_plan", "recommended_tools", "motivation_quote"]
      }
    });

    // Add default status to action plan items
    const actionPlan = aiResponse.ai_action_plan.map(action => ({
      ...action,
      status: action.status || 'todo'
    }));

    // Update the goal with AI recommendations
    await base44.entities.UserGoal.update(goal_id, {
      ai_summary: aiResponse.ai_summary,
      ai_action_plan: actionPlan,
      recommended_tools: aiResponse.recommended_tools,
      motivation_quote: aiResponse.motivation_quote,
      last_ai_update: new Date().toISOString()
    });

    return Response.json({
      success: true,
      recommendations: {
        summary: aiResponse.ai_summary,
        action_plan: actionPlan,
        recommended_tools: aiResponse.recommended_tools,
        motivation_quote: aiResponse.motivation_quote
      }
    });

  } catch (error) {
    console.error('Goal recommendations generation failed:', error);
    return Response.json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    }, { status: 500 });
  }
});