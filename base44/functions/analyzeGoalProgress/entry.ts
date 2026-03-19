import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI-POWERED GOAL PROGRESS ANALYZER
 * Analyzes why a goal isn't progressing and suggests actionable solutions
 */

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
    const goals = await base44.entities.UserGoal.filter({ id: goal_id });
    if (!goals || goals.length === 0) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goal = goals[0];
    const userName = (user.full_name || 'חבר').split(' ')[0];

    // Get user's profile for context
    const profiles = await base44.entities.UserProfile.filter(
      { created_by: user.email },
      '-created_date',
      1
    );
    const profile = profiles[0];

    // Get goal's action plan progress
    const completedActions = goal.ai_action_plan?.filter(a => a.status === 'completed').length || 0;
    const totalActions = goal.ai_action_plan?.length || 0;
    const actionCompletionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

    // Calculate time since goal creation
    const daysSinceCreation = Math.floor((Date.now() - new Date(goal.created_date).getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = goal.target_date 
      ? Math.min(100, (daysSinceCreation / Math.floor((new Date(goal.target_date).getTime() - new Date(goal.created_date).getTime()) / (1000 * 60 * 60 * 24))) * 100)
      : daysSinceCreation * 2; // 2% per day if no target date

    const progressGap = Math.max(0, expectedProgress - (goal.progress_percentage || 0));

    // Build comprehensive analysis prompt
    const analysisPrompt = `אתה מאמן AI מומחה בניתוח והתגברות על מכשולים בהשגת יעדים אישיים.

**המטרה:** נתח למה ${userName} לא מתקדם/ת ביעד ספציפי והצע פתרונות מעשיים ומותאמים אישית.

---

## 📊 נתוני היעד:

**יעד:** ${goal.goal_title}
**תיאור:** ${goal.goal_description}
**קטגוריה:** ${goal.goal_category}
**סטטוס:** ${goal.status}
**התקדמות נוכחית:** ${goal.progress_percentage || 0}%
**התקדמות צפויה:** ${expectedProgress.toFixed(0)}%
**פער:** ${progressGap.toFixed(0)}% מאחור

**תוכנית פעולה:**
- ${totalActions} פעולות מתוכננות
- ${completedActions} פעולות הושלמו (${actionCompletionRate.toFixed(0)}%)
- ${totalActions - completedActions} פעולות ממתינות

**זמנים:**
- נוצר לפני ${daysSinceCreation} ימים
${goal.target_date ? `- תאריך יעד: ${new Date(goal.target_date).toLocaleDateString('he-IL')}` : '- אין תאריך יעד מוגדר'}

${goal.ai_summary ? `**סיכום AI קודם:** ${goal.ai_summary}` : ''}

---

## 👤 פרופיל ${userName}:

${profile ? `
- **מזל שמש:** ${profile.sun_sign || 'לא ידוע'}
- **מזל ירח:** ${profile.moon_sign || 'לא ידוע'}
- **תחומי מיקוד:** ${profile.focus_areas?.join(', ') || 'לא הוגדרו'}
- **תחומי עניין:** ${profile.preferred_disciplines?.join(', ') || 'לא הוגדרו'}
` : 'פרופיל לא זמין'}

---

## 🎯 המשימה שלך:

1. **זהה את המכשולים העיקריים** (2-4 מכשולים):
   - למה ${userName} לא מתקדם/ת?
   - האם זה חוסר בהירות, פחד, חוסר זמן, אנרגיה נמוכה?
   - שים לב לפער בין התקדמות צפויה לממשית

2. **נתח את הגורמים הפסיכולוגיים**:
   - מה עוצר את ${userName}?
   - האם יש התנגדות פנימית?
   - ${profile?.sun_sign ? `איך ה-${profile.sun_sign} שלו/ה משפיע?` : ''}

3. **הצע 3-5 פעולות קונקרטיות** שיעזרו:
   - כל פעולה צריכה להיות **ספציפית ומעשית**
   - ניתנת לביצוע תוך 1-3 ימים
   - ממוקדת בהתגברות על מכשול ספציפי
   - עם זמן משוער לביצוע

4. **צור תזכורת חכמה**:
   - מתי הזמן הכי טוב להזכיר ל-${userName} את היעד?
   - איזה סוג הודעה יהיה הכי אפקטיבי?

---

## ✅ החזר JSON מדויק:

\`\`\`json
{
  "main_obstacles": [
    {
      "obstacle": "שם המכשול",
      "description": "הסבר מפורט",
      "severity": "high/medium/low",
      "psychological_root": "השורש הפסיכולוגי"
    }
  ],
  "root_cause_analysis": "ניתוח עמוק של הסיבה המרכזית לחוסר התקדמות (2-3 משפטים)",
  "motivational_message": "הודעה מעודדת ואישית ל-${userName} (2-3 משפטים)",
  "action_steps": [
    {
      "step": "הפעולה הספציפית",
      "why_this_helps": "למה זה יעזור להתגבר על המכשול",
      "estimated_time": "זמן משוער בדקות",
      "priority": "high/medium/low",
      "obstacle_addressed": "איזה מכשול זה פותר"
    }
  ],
  "smart_reminder": {
    "best_time_of_day": "morning/afternoon/evening",
    "frequency": "daily/every_2_days/weekly",
    "message_tone": "encouraging/direct/gentle",
    "suggested_message": "הודעת התזכורת המוצעת"
  },
  "success_prediction": {
    "if_user_acts": "מה יקרה אם ${userName} יפעל/תפעל לפי ההמלצות (1-2 משפטים)",
    "timeframe": "תוך כמה זמן צפויה התקדמות",
    "confidence": 0.7-1.0
  }
}
\`\`\`

**חשוב:** היה אמפטי, מעשי, ומדויק. ${userName} רוצה באמת להצליח!`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          main_obstacles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                obstacle: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["high", "medium", "low"] },
                psychological_root: { type: "string" }
              },
              required: ["obstacle", "description", "severity", "psychological_root"]
            },
            minItems: 2,
            maxItems: 4
          },
          root_cause_analysis: { type: "string", minLength: 100, maxLength: 400 },
          motivational_message: { type: "string", minLength: 100, maxLength: 400 },
          action_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "string" },
                why_this_helps: { type: "string" },
                estimated_time: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                obstacle_addressed: { type: "string" }
              },
              required: ["step", "why_this_helps", "estimated_time", "priority"]
            },
            minItems: 3,
            maxItems: 5
          },
          smart_reminder: {
            type: "object",
            properties: {
              best_time_of_day: { type: "string", enum: ["morning", "afternoon", "evening"] },
              frequency: { type: "string", enum: ["daily", "every_2_days", "weekly"] },
              message_tone: { type: "string", enum: ["encouraging", "direct", "gentle"] },
              suggested_message: { type: "string" }
            },
            required: ["best_time_of_day", "frequency", "message_tone", "suggested_message"]
          },
          success_prediction: {
            type: "object",
            properties: {
              if_user_acts: { type: "string" },
              timeframe: { type: "string" },
              confidence: { type: "number", minimum: 0.7, maximum: 1.0 }
            },
            required: ["if_user_acts", "timeframe", "confidence"]
          }
        },
        required: ["main_obstacles", "root_cause_analysis", "motivational_message", "action_steps", "smart_reminder", "success_prediction"]
      }
    });

    // Update goal with analysis (preserve existing metadata)
    const updatedMetadata = goal.metadata || {};
    updatedMetadata.last_progress_analysis = {
      date: new Date().toISOString(),
      obstacles: result.main_obstacles,
      root_cause: result.root_cause_analysis,
      progress_gap: progressGap,
      motivational_message: result.motivational_message
    };

    await base44.entities.UserGoal.update(goal.id, {
      ai_action_plan: result.action_steps.map(step => ({
        action: step.step,
        estimated_time: step.estimated_time,
        priority: step.priority,
        status: 'todo'
      })),
      last_ai_update: new Date().toISOString(),
      metadata: updatedMetadata
    });

    // Create smart reminder
    const reminderTime = new Date();
    if (result.smart_reminder.best_time_of_day === 'morning') {
      reminderTime.setHours(9, 0, 0, 0);
    } else if (result.smart_reminder.best_time_of_day === 'afternoon') {
      reminderTime.setHours(14, 0, 0, 0);
    } else {
      reminderTime.setHours(19, 0, 0, 0);
    }
    
    if (reminderTime < new Date()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    await base44.entities.UserReminder.create({
      reminder_type: 'custom',
      title: `זמן לעבוד על: ${goal.goal_title}`,
      description: result.smart_reminder.suggested_message,
      remind_date: reminderTime.toISOString(),
      is_recurring: result.smart_reminder.frequency === 'daily',
      recurrence_pattern: result.smart_reminder.frequency === 'daily' ? 'daily' : null,
      status: 'pending',
      metadata: {
        goal_id: goal.id,
        tone: result.smart_reminder.message_tone,
        auto_generated: true
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      goal_updated: true,
      reminder_created: true,
      progress_gap: progressGap,
      action_completion_rate: actionCompletionRate
    });

  } catch (error) {
    console.error('[analyzeGoalProgress] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});