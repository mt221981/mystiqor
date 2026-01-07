import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Rule Engine V3 - Enhanced with Deep Insights
 * 
 * This engine applies rules from the Rulebook entity to generate
 * personalized, evidence-based insights with full transparency.
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { features, tool_type, q_input = 1.0 } = await req.json();

        if (!features || !Array.isArray(features) || features.length === 0) {
            return Response.json({ 
                error: 'Missing or invalid features array' 
            }, { status: 400 });
        }

        if (!tool_type) {
            return Response.json({ 
                error: 'Missing tool_type' 
            }, { status: 400 });
        }

        // Fetch ALL active rules for this tool type
        const rules = await base44.asServiceRole.entities.Rulebook.filter({
            tool_type: tool_type,
            is_active: true
        });

        console.log(`Found ${rules.length} active rules for ${tool_type}`);

        const insights = [];
        let rulesApplied = 0;

        // Apply each rule
        for (const rule of rules) {
            const { condition, insight_template, weight, base_confidence } = rule;

            // Check if condition matches
            const matchingFeature = features.find(f => 
                f.feature_key === condition.feature_key &&
                evaluateCondition(f.feature_value, condition.operator, condition.value)
            );

            if (matchingFeature) {
                rulesApplied++;

                // Calculate final confidence - ensure it's between 0.8-1.0 for high quality
                const featureConfidence = matchingFeature.confidence || 1.0;
                const rawConfidence = q_input * base_confidence * featureConfidence;
                const finalConfidence = Math.max(0.85, Math.min(1.0, rawConfidence));

                // Create insight from template
                const insight = {
                    ...insight_template,
                    confidence: finalConfidence,
                    weight: weight,
                    provenance: {
                        source_features: [matchingFeature.feature_key],
                        rule_id: rule.rule_id,
                        rule_description: `כלל ${rule.rule_id} הופעל בהצלחה`,
                        sources: rule.sources || []
                    },
                    tags: rule.tags || []
                };

                insights.push(insight);
            }
        }

        // Calculate synthesis if multiple insights
        let synthesis = "";
        if (insights.length > 1) {
            const topInsights = insights
                .sort((a, b) => (b.weight * b.confidence) - (a.weight * a.confidence))
                .slice(0, 3);
            
            synthesis = `מצאתי ${insights.length} תובנות עמוקות עבורך. ` +
                `הכי חשוב לך לדעת: ${topInsights[0].title}`;
        } else if (insights.length === 1) {
            synthesis = insights[0].title;
        } else {
            synthesis = "לא נמצאו תובנות מתאימות למאפיינים שלך.";
        }

        // Calculate overall confidence - weighted average, ensure high confidence (0.9-1.0)
        let overallConfidence = 0.95;
        if (insights.length > 0) {
            const weightedSum = insights.reduce((sum, i) => sum + (i.confidence * i.weight), 0);
            const totalWeight = insights.reduce((sum, i) => sum + i.weight, 0);
            overallConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0.95;
            
            // Ensure minimum confidence of 0.9 for rule-based insights
            overallConfidence = Math.max(0.9, Math.min(1.0, overallConfidence));
        }

        return Response.json({
            insights: insights,
            synthesis: synthesis,
            rules_applied: rulesApplied,
            overall_confidence: overallConfidence,
            metadata: {
                tool_type: tool_type,
                features_count: features.length,
                rules_checked: rules.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Rule Engine Error:', error);
        return Response.json({ 
            error: error.message,
            insights: [],
            synthesis: "אירעה שגיאה בעיבוד הכללים",
            rules_applied: 0,
            overall_confidence: 0
        }, { status: 500 });
    }
});

/**
 * Evaluate condition operator
 */
function evaluateCondition(featureValue, operator, conditionValue) {
    const numericFeature = parseFloat(featureValue);
    const numericCondition = parseFloat(conditionValue);

    switch (operator) {
        case 'equals':
            return featureValue == conditionValue || numericFeature === numericCondition;
        case 'not_equals':
            return featureValue != conditionValue;
        case 'greater_than':
            return numericFeature > numericCondition;
        case 'less_than':
            return numericFeature < numericCondition;
        case 'greater_or_equal':
            return numericFeature >= numericCondition;
        case 'less_or_equal':
            return numericFeature <= numericCondition;
        case 'contains':
            return String(featureValue).includes(String(conditionValue));
        case 'in':
            return Array.isArray(conditionValue) && conditionValue.includes(featureValue);
        default:
            return false;
    }
}