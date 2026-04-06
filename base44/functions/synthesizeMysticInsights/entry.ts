import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch all relevant user data
        const [
            userProfile,
            analyses,
            goals,
            moods
        ] = await Promise.all([
            base44.entities.UserProfile.list('', 1).then(res => res[0]),
            base44.entities.Analysis.list('-created_date', 20),
            base44.entities.UserGoal.list('-created_date', 10),
            base44.entities.MoodEntry.list('-entry_date', 14)
        ]);

        if (!userProfile) {
            return Response.json({ error: 'User profile not found' }, { status: 404 });
        }

        // 2. Prepare context for AI
        const context = {
            profile: {
                name: userProfile.full_name_hebrew || user.full_name,
                birth_date: userProfile.birth_date,
                birth_time: userProfile.birth_time,
                focus_areas: userProfile.focus_areas,
                preferred_disciplines: userProfile.preferred_disciplines
            },
            analyses_summary: analyses.map(a => ({
                tool: a.tool_type,
                date: a.created_date,
                summary: a.summary,
                results: a.results // Note: this might be large, handled by LLM context limit
            })),
            active_goals: goals.filter(g => g.status === 'active').map(g => ({
                title: g.goal_title,
                category: g.goal_category
            })),
            recent_moods: moods.map(m => ({
                date: m.entry_date,
                mood: m.mood_score
            }))
        };

        const inputSources = [...new Set(analyses.map(a => a.tool_type))];

        // 3. Call AI
        const prompt = `
        You are a master mystic and holistic life coach. 
        Your task is to synthesize data from multiple mystical disciplines (Numerology, Astrology, Palmistry, Tarot, Graphology, etc.) into a cohesive, unified personality profile and set of predictive insights.

        Input Data:
        ${JSON.stringify(context, null, 2)}

        Instructions:
        1. Look for patterns across different tools. Do the Numerology and Astrology point to the same life path? Do Tarot and Graphology suggest similar emotional states?
        2. Identify conflicts and resolve them (e.g., "While your chart suggests X, your handwriting shows you have overcome this by Y").
        3. Create a comprehensive personality profile.
        4. Provide predictive insights for the near future based on the combined data.
        5. Suggest concrete actions (recommendations).

        Output Language: Hebrew (עברית).
        `;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    personality_profile: {
                        type: "object",
                        properties: {
                            summary: { type: "string" },
                            strengths: { type: "array", items: { type: "string" } },
                            challenges: { type: "array", items: { type: "string" } },
                            hidden_talents: { type: "array", items: { type: "string" } }
                        }
                    },
                    predictive_insights: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                timeframe: { type: "string" },
                                area: { type: "string" },
                                prediction: { type: "string" },
                                probability: { type: "string" }
                            }
                        }
                    },
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                action: { type: "string" },
                                reason: { type: "string" },
                                related_tool: { type: "string" }
                            }
                        }
                    }
                },
                required: ["personality_profile", "predictive_insights", "recommendations"]
            }
        });

        // 4. Save Synthesis
        const synthesisData = {
            profile_id: userProfile.id,
            synthesis_date: new Date().toISOString(),
            personality_profile: aiResponse.personality_profile,
            predictive_insights: aiResponse.predictive_insights,
            recommendations: aiResponse.recommendations,
            input_sources: inputSources,
            raw_ai_output: aiResponse
        };

        const newSynthesis = await base44.entities.MysticSynthesis.create(synthesisData);

        return Response.json(newSynthesis);

    } catch (error) {
        console.error('Synthesis error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});