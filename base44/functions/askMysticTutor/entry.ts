import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { question, context, discipline } = await req.json();

        // Build a rich prompt based on the discipline
        let systemPrompt = `You are a wise and patient mystical tutor specializing in ${discipline || 'mystical arts'}. 
        Your goal is to explain complex concepts in simple, relatable terms. 
        Always be encouraging and insightful. 
        If the question is about personal interpretation, give general guidance but remind them that intuition plays a key role.`;
        
        if (discipline === 'numerology') {
            systemPrompt += " Focus on the vibrational meaning of numbers and their influence on life paths.";
        } else if (discipline === 'astrology') {
            systemPrompt += " Focus on planetary energies, zodiac archetypes, and house meanings.";
        }

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `
            Student Question: "${question}"
            Context/Current Lesson: ${context || 'General Q&A'}
            
            Please provide a concise but deep answer. Use an emoji or two to keep it engaging.
            `,
            response_json_schema: null // We want a text response
        });

        return Response.json({ answer: response });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});