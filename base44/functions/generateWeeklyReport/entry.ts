import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { report_type = 'weekly' } = await req.json();

        // 1. Fetch User Profile
        const profiles = await base44.entities.UserProfile.list();
        const profile = profiles[0];

        // 2. Fetch Usage Data (Analytics) - Last 7 days for weekly
        // Note: In a real scenario, we'd query by date range. Here we list and filter in memory if needed, or rely on limit.
        const recentEvents = await base44.entities.AnalyticsEvent.list('-created_date', 100); 
        // Filter for this user (AnalyticsEvent usually doesn't store user email directly in top level schema shown, 
        // but assuming we filter by created_by or the sdk handles it. 
        // If AnalyticsEvent is system-wide, we'd need a user filter. Assuming row-level security or created_by filter works).
        
        // 3. Fetch Recent Analyses
        const recentAnalyses = await base44.entities.Analysis.list('-created_date', 10);

        // 4. Prepare Data for LLM
        const usageContext = recentEvents.map(e => `${e.event_type}: ${e.event_name} at ${e.created_date}`).join('\n');
        const analysisContext = recentAnalyses.map(a => `Tool: ${a.tool_type}, Summary: ${a.summary}`).join('\n');

        // 5. Invoke LLM for Holistic Synthesis
        const prompt = `
        Analyze the following user activity and spiritual data to create a ${report_type} holistic report.
        User Name: ${user.full_name}
        
        Usage Logs (Last period):
        ${usageContext}

        Recent Mystic Analyses:
        ${analysisContext}

        Tasks:
        1. Analyze Usage Patterns: Identify which tools they use most, what times of day (are they a "night owl" seeker?), and suggest what this means for their spiritual seeking style.
        2. Practical Integration: Suggest 3 concrete, practical ways they can use their recent insights in daily life (e.g., "Since you checked Tarot about career, try this specific visualization before meetings").
        3. Period Summary: A narrative summary of their spiritual journey this ${report_type}.
        4. Update Personality Profile: Refine their profile based on this new combined data.

        Output JSON format required.
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
                    usage_analysis: {
                        type: "object",
                        properties: {
                            most_used_tools: { type: "array", items: { type: "string" } },
                            peak_activity_times: { type: "string" },
                            pattern_insight: { type: "string" }
                        }
                    },
                    practical_integration: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                suggestion: { type: "string" },
                                context: { type: "string" },
                                difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                            }
                        }
                    },
                    period_summary: { type: "string" },
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
                }
            }
        });

        // 6. Save to Entity
        const synthesisData = {
            profile_id: profile?.id || 'unknown',
            synthesis_date: new Date().toISOString(),
            report_type: report_type,
            input_sources: ['analytics', 'recent_analyses'],
            ...aiResponse
        };

        const newRecord = await base44.entities.MysticSynthesis.create(synthesisData);

        return Response.json(newRecord);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});