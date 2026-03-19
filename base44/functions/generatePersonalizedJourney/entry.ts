import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { journey_type = 'daily', focus_area } = await req.json();

    // Get user profile
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email }, '', 1);
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get recent analyses to understand user's journey
    const analyses = await base44.entities.Analysis.filter(
      { created_by: user.email },
      '-created_date',
      20
    );

    // Get active goals
    const goals = await base44.entities.UserGoal.filter(
      { created_by: user.email, status: 'active' },
      '-created_date',
      5
    );

    // Generate personalized journey using AI
    const prompt = buildJourneyPrompt(profile, analyses, goals, journey_type, focus_area);
    
    const journeyData = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 10, maxLength: 100 },
          description: { type: "string", minLength: 50, maxLength: 300 },
          focus_area: { 
            type: "string", 
            enum: ["life_purpose", "relationships", "career", "personal_growth", "spiritual_path", "self_discovery", "health", "creativity"]
          },
          steps: {
            type: "array",
            minItems: 3,
            maxItems: journey_type === 'daily' ? 5 : 10,
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                title: { type: "string", minLength: 10, maxLength: 80 },
                description: { type: "string", minLength: 50, maxLength: 250 },
                type: { 
                  type: "string", 
                  enum: ["exercise", "reflection", "insight", "action", "tool_usage", "meditation", "journaling"]
                },
                related_tool_suggestion: { 
                  type: "string",
                  enum: ["numerology", "astrology", "palmistry", "graphology", "tarot", "drawing", "compatibility", "journal", "meditation"]
                },
                estimated_time_minutes: { type: "number", minimum: 5, maximum: 60 },
                why_this_matters: { type: "string", minLength: 50, maxLength: 200 }
              },
              required: ["step_number", "title", "description", "type"]
            }
          },
          expected_outcomes: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: { type: "string" }
          },
          motivational_message: { type: "string", minLength: 50, maxLength: 200 }
        },
        required: ["title", "description", "focus_area", "steps", "expected_outcomes", "motivational_message"]
      }
    });

    // Calculate end date
    const startDate = new Date();
    const daysToAdd = journey_type === 'daily' ? 1 : 7;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd);

    // Create journey in database
    const journey = await base44.entities.CoachingJourney.create({
      title: journeyData.title,
      description: journeyData.description,
      status: 'active',
      focus_area: journeyData.focus_area,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      progress_percentage: 0,
      source_analysis_ids: analyses.slice(0, 3).map(a => a.id),
      related_goal_id: goals[0]?.id,
      steps: journeyData.steps,
      total_steps: journeyData.steps.length,
      completed_steps: 0,
      ai_insights: [journeyData.motivational_message],
      tags: [journey_type, journeyData.focus_area, 'ai_generated']
    });

    return Response.json({
      success: true,
      journey,
      expected_outcomes: journeyData.expected_outcomes,
      motivational_message: journeyData.motivational_message
    });

  } catch (error) {
    console.error('Journey generation failed:', error);
    return Response.json({ 
      error: 'Failed to generate journey',
      details: error.message 
    }, { status: 500 });
  }
});

function buildJourneyPrompt(profile, analyses, goals, journey_type, focus_area) {
  const tools_used = [...new Set(analyses.map(a => a.tool_type))];
  const preferred_disciplines = profile.preferred_disciplines || [];
  const focus_areas = profile.focus_areas || [];
  
  return `אתה מאמן אישי מומחה ביצירת מסעות התפתחות אישית מותאמים.

**פרופיל המשתמש:**
- שם: ${profile.full_name_hebrew || 'משתמש'}
- תחומי עניין: ${preferred_disciplines.join(', ') || 'לא צוין'}
- תחומי מיקוד: ${focus_areas.join(', ') || 'לא צוין'}
- כלים שכבר השתמש בהם: ${tools_used.join(', ') || 'אף אחד'}
- מספר ניתוחים שביצע: ${analyses.length}
- יעדים פעילים: ${goals.length}

**סוג המסע:** ${journey_type === 'daily' ? 'יומי (3-5 שלבים)' : 'שבועי (7-10 שלבים)'}
**תחום מיקוד מבוקש:** ${focus_area || 'כללי - בחר את המתאים ביותר'}

**משימתך:**
צור מסע אישי מותאם שיוביל את המשתמש להתפתחות אמיתית.

**עקרונות חשובים:**
1. התחל מהכרת עצמך בסיסית והתקדם לעומק
2. שלב כלים מגוונים (לא רק מה שכבר השתמש)
3. כל שלב צריך להיבנות על הקודם
4. תן שילוב של: רפלקציה, פעולה, כלים מיסטיים
5. השתמש בשפה מעודדת, חמה ואישית
6. הסבר למשתמש למה כל שלב חשוב

**דוגמאות לשלבים טובים:**
- "התחבר לליבה שלך: ניתוח נומרולוגי" (tool_usage + numerology)
- "כתוב על רגע שבו הרגשת הכי אתה" (journaling)
- "מדיטציה קצרה: מה אתה באמת רוצה?" (meditation)
- "פעולה: שיחה כנה עם אדם קרוב" (action)
- "הסתכל על הכוכבים שלך: אסטרולוגיה" (tool_usage + astrology)

**חשוב:** 
- לכל שלב תן כותרת מעוררת השראה
- הסבר למה השלב הזה חשוב (why_this_matters)
- תן זמן ריאלי (estimated_time_minutes)
- המסר המוטיבציוני צריך לדבר ישירות ללב

החזר JSON מובנה.`;
}