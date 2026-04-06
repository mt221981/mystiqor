import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * GENERATE COACHING JOURNEY
 * 
 * יוצר מסע אימון אישי (Coaching Journey) למשתמש
 * מבוסס על ניתוחיו המיסטיים (נומרולוגיה, אסטרולוגיה, מסמכים)
 * ויעדים אישיים
 * 
 * Input: goal_id (optional), analysis_ids (optional), focus_area (optional)
 * Output: CoachingJourney object
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            goal_id = null, 
            analysis_ids = [], 
            focus_area = null,
            custom_prompt = null
        } = body;

        console.log('🚀 Generating coaching journey for user:', user.id);

        // ====== STEP 1: Gather user data ======
        
        // Get user profile
        const profiles = await base44.entities.UserProfile.filter(
            { created_by: user.email },
            '-created_date',
            1
        );
        const userProfile = profiles[0] || null;

        // Get all analyses (or specific ones if provided)
        let analyses;
        if (analysis_ids.length > 0) {
            analyses = [];
            for (const id of analysis_ids) {
                try {
                    const analysis = await base44.entities.Analysis.filter({ id }, '', 1);
                    if (analysis[0]) analyses.push(analysis[0]);
                } catch (e) {
                    console.log('Could not fetch analysis:', id);
                }
            }
        } else {
            analyses = await base44.entities.Analysis.filter(
                { created_by: user.email },
                '-created_date',
                20
            );
        }

        // Get active goals
        const goals = await base44.entities.UserGoal.filter(
            { 
                created_by: user.email,
                status: { $in: ['active', 'in_progress'] }
            },
            '-created_date',
            10
        );

        // Get specific goal if goal_id provided
        let targetGoal = null;
        if (goal_id) {
            const goalResults = await base44.entities.UserGoal.filter({ id: goal_id }, '', 1);
            targetGoal = goalResults[0] || null;
        }

        console.log('📊 Data gathered:', {
            analyses_count: analyses.length,
            goals_count: goals.length,
            has_profile: !!userProfile
        });

        // ====== STEP 2: Build context for LLM ======
        
        let contextString = `# פרטי המשתמש:\n`;
        
        if (userProfile) {
            contextString += `- שם: ${userProfile.full_name_hebrew || user.full_name}\n`;
            contextString += `- תאריך לידה: ${userProfile.birth_date}\n`;
            if (userProfile.birth_time) contextString += `- שעת לידה: ${userProfile.birth_time}\n`;
            if (userProfile.birth_place_name) contextString += `- מקום לידה: ${userProfile.birth_place_name}\n`;
        }

        contextString += `\n# ניתוחים זמינים (${analyses.length}):\n\n`;
        
        // Summarize key analyses
        const numerologyAnalyses = analyses.filter(a => a.tool_type === 'numerology');
        const astrologyAnalyses = analyses.filter(a => a.tool_type === 'astrology');
        const documentAnalyses = analyses.filter(a => a.tool_type === 'document_analyzer');
        const otherAnalyses = analyses.filter(a => !['numerology', 'astrology', 'document_analyzer'].includes(a.tool_type));

        if (numerologyAnalyses.length > 0) {
            const latest = numerologyAnalyses[0];
            contextString += `## נומרולוגיה:\n`;
            if (latest.results?.calculation) {
                const calc = latest.results.calculation;
                if (calc.life_path?.number) contextString += `- מסלול חיים: ${calc.life_path.number}\n`;
                if (calc.destiny?.number) contextString += `- גורל: ${calc.destiny.number}\n`;
                if (calc.soul?.number) contextString += `- דחף נשמה: ${calc.soul.number}\n`;
                if (calc.personality?.number) contextString += `- אישיות: ${calc.personality.number}\n`;
                if (calc.personal_year?.number) contextString += `- שנה אישית: ${calc.personal_year.number}\n`;
            }
            if (latest.summary) contextString += `סיכום: ${latest.summary}\n`;
            contextString += `\n`;
        }

        if (astrologyAnalyses.length > 0) {
            const latest = astrologyAnalyses[0];
            contextString += `## אסטרולוגיה:\n`;
            if (latest.results?.calculation) {
                const calc = latest.results.calculation;
                if (calc.sun_sign) contextString += `- מזל שמש: ${calc.sun_sign}\n`;
                if (calc.moon_sign) contextString += `- מזל ירח: ${calc.moon_sign}\n`;
                if (calc.rising_sign) contextString += `- צועד: ${calc.rising_sign}\n`;
            }
            if (latest.summary) contextString += `סיכום: ${latest.summary}\n`;
            contextString += `\n`;
        }

        if (documentAnalyses.length > 0) {
            contextString += `## תובנות ממסמכים:\n`;
            documentAnalyses.slice(0, 2).forEach((doc, idx) => {
                contextString += `### מסמך ${idx + 1}:\n`;
                if (doc.results?.analysis?.summary) {
                    contextString += `${doc.results.analysis.summary}\n`;
                }
                if (doc.results?.analysis?.key_insights) {
                    contextString += `תובנות מרכזיות:\n`;
                    doc.results.analysis.key_insights.slice(0, 3).forEach(insight => {
                        contextString += `- ${insight.title}: ${insight.content.substring(0, 200)}...\n`;
                    });
                }
                contextString += `\n`;
            });
        }

        if (otherAnalyses.length > 0) {
            contextString += `## ניתוחים נוספים (${otherAnalyses.length}):\n`;
            otherAnalyses.slice(0, 3).forEach(a => {
                contextString += `- ${a.tool_type}: ${a.summary || 'ניתוח זמין'}\n`;
            });
            contextString += `\n`;
        }

        // Goals context
        if (targetGoal) {
            contextString += `\n# היעד המרכזי:\n`;
            contextString += `- כותרת: ${targetGoal.goal_title}\n`;
            contextString += `- תיאור: ${targetGoal.goal_description}\n`;
            contextString += `- קטגוריה: ${targetGoal.goal_category}\n`;
            if (targetGoal.target_date) contextString += `- תאריך יעד: ${targetGoal.target_date}\n`;
            contextString += `\n`;
        } else if (goals.length > 0) {
            contextString += `\n# יעדים פעילים (${goals.length}):\n`;
            goals.slice(0, 3).forEach(g => {
                contextString += `- ${g.goal_title} (${g.goal_category})\n`;
            });
            contextString += `\n`;
        }

        // ====== STEP 3: Generate journey with LLM ======
        
        const journeyPrompt = `${contextString}

---

# המשימה שלך:

אתה מאמן רוחני מומחה ומנוסה, משלב ידע עמוק בנומרולוגיה קבלית, אסטרולוגיה, פסיכולוגיה יונגיאנית ופיתוח אישי.

**צור מסע אימון אישי (Coaching Journey) למשתמש בן 7-12 שלבים.**

${focus_area ? `**תחום המיקוד:** ${focus_area}` : '**זהה את תחום המיקוד המרכזי בעצמך** מהנתונים.'}

${targetGoal ? `**המסע צריך לתמוך ביעד:** ${targetGoal.goal_title}` : ''}

${custom_prompt ? `**הנחיות נוספות מהמשתמש:** ${custom_prompt}` : ''}

## עקרונות חשובים:

1. **התאמה אישית מקסימלית**: כל שלב חייב להיות מבוסס על נתונים אמיתיים של המשתמש (מספרי נומרולוגיה, מזלות, תובנות ממסמכים).
   
2. **שלבים מדורגים**: בנה התקדמות הגיונית - מהכרה עצמית, דרך תרגול והתנסות, ועד ליישום ושינוי.

3. **מגוון סוגי פעילויות**: שלב בין:
   - **reflection** (הרהור והתבוננות פנימית)
   - **exercise** (תרגילים מעשיים)
   - **action** (פעולות קונקרטיות בעולם החיצוני)
   - **insight** (תובנות מודעות)
   - **meditation** (מדיטציות ורגיעה)
   - **journaling** (כתיבה ביומן)
   - **tool_usage** (שימוש בכלים המיסטיים באפליקציה)

4. **קישור לנתונים**: כל שלב צריך להתייחס ישירות לנתון ספציפי מהניתוחים. לדוגמה:
   - "שלב 1: הכרת מסלול החיים שלך (Life Path 7)" ולא "שלב 1: הכרה עצמית" באופן כללי
   - "תרגיל ביטוי רגשי (בהתבסס על Soul Urge 3 ו-Moon in Cancer)"

5. **מעשיות**: כל שלב צריך להיות ברור, בר ביצוע ולכלול הנחיות מפורטות.

6. **מוטיבציה**: השתמש בטון מעודד, תומך וחיובי.

7. **תזמון**: הצע `due_date` הגיוני לכל שלב (פרוס על פני 4-12 שבועות).

## פורמט החזרה:

החזר JSON מובנה עם המבנה הבא:

- **title**: כותרת מעוררת השראה למסע (למשל: "מסע למימוש הייעוד האמיתי")
- **description**: תיאור כולל של המסע והמטרה שלו (150-250 מילים)
- **focus_area**: אחד מהערכים המותרים: life_purpose, relationships, career, personal_growth, spiritual_path, self_discovery, health, creativity
- **steps**: מערך של 7-12 שלבים, כל אחד עם:
  - **step_number**: מספר סידורי
  - **title**: כותרת השלב
  - **description**: תיאור מפורט (200-300 מילים) של מה לעשות ואיך
  - **type**: reflection/exercise/action/insight/meditation/journaling/tool_usage
  - **related_insight_text**: תובנה או הסבר הקשור לשלב, מבוסס על הניתוחים (אופציונלי)
  - **related_tool_suggestion**: הצעת כלי מהאפליקציה לשימוש (Numerology, Astrology, Tarot וכו') (אופציונלי)
  - **due_date**: תאריך יעד מוצע (YYYY-MM-DD)

- **tags**: מערך תגיות (למשל: ["numerology", "life_path_7", "spiritual_growth"])
- **ai_insights**: מערך של 2-4 תובנות AI נוספות על המסע עצמו

**החזר JSON מושלם ומפורט.**`;

        console.log('🤖 Calling LLM to generate journey...');

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: journeyPrompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    description: { type: "string", minLength: 450 },
                    focus_area: { 
                        type: "string",
                        enum: ["life_purpose", "relationships", "career", "personal_growth", "spiritual_path", "self_discovery", "health", "creativity"]
                    },
                    steps: {
                        type: "array",
                        minItems: 7,
                        maxItems: 12,
                        items: {
                            type: "object",
                            properties: {
                                step_number: { type: "number" },
                                title: { type: "string" },
                                description: { type: "string", minLength: 600 },
                                type: { 
                                    type: "string",
                                    enum: ["exercise", "reflection", "insight", "action", "tool_usage", "meditation", "journaling"]
                                },
                                related_insight_text: { type: "string" },
                                related_tool_suggestion: { type: "string" },
                                due_date: { type: "string", format: "date" }
                            },
                            required: ["step_number", "title", "description", "type"]
                        }
                    },
                    tags: { 
                        type: "array",
                        items: { type: "string" }
                    },
                    ai_insights: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["title", "description", "focus_area", "steps"]
            }
        });

        console.log('✅ Journey generated by AI');

        // ====== STEP 4: Save the journey ======
        
        const journeyData = {
            title: aiResponse.title,
            description: aiResponse.description,
            status: 'active',
            focus_area: aiResponse.focus_area,
            start_date: new Date().toISOString(),
            progress_percentage: 0,
            source_analysis_ids: analyses.map(a => a.id),
            related_goal_id: goal_id,
            steps: aiResponse.steps.map(step => ({
                ...step,
                status: 'todo'
            })),
            total_steps: aiResponse.steps.length,
            completed_steps: 0,
            tags: aiResponse.tags || [],
            ai_insights: aiResponse.ai_insights || []
        };

        const savedJourney = await base44.entities.CoachingJourney.create(journeyData);

        console.log('💾 Journey saved:', savedJourney.id);

        // ====== STEP 5: Link to goal if applicable ======
        
        if (targetGoal) {
            try {
                await base44.entities.UserGoal.update(targetGoal.id, {
                    related_journey_id: savedJourney.id
                });
                console.log('🔗 Journey linked to goal');
            } catch (e) {
                console.log('Could not link to goal:', e.message);
            }
        }

        return Response.json({
            success: true,
            journey: savedJourney,
            message: 'מסע האימון האישי שלך נוצר בהצלחה! 🎉'
        });

    } catch (error) {
        console.error('❌ Error generating coaching journey:', error);
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});