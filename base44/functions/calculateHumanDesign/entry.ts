import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Calculates Human Design based on birth data.
 * Since Human Design calculation is complex and requires ephemeris data,
 * we will use the LLM to generate a highly accurate estimation/interpretation 
 * based on the user's birth data, or mock the structure for now if we can't do precise calc.
 * Ideally, we would use a specialized library or API, but for this demo, AI is best.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { birth_date, birth_time, birth_place, name } = await req.json();

    if (!birth_date || !birth_time) {
      return Response.json({ error: 'Birth date and time are required' }, { status: 400 });
    }

    // Use LLM to "calculate" (estimate) and interpret Human Design
    // We ask the LLM to simulate the calculation logic based on its training data of ephemerides
    const prompt = `
    You are an expert Human Design Analyst.
    Calculate and interpret the Human Design chart for:
    Name: ${name}
    Date: ${birth_date}
    Time: ${birth_time}
    Place: ${birth_place || 'Unknown'}

    Please determine the likely:
    1. Type (Generator, Manifesting Generator, Projector, Manifestor, Reflector)
    2. Strategy
    3. Authority
    4. Profile (e.g. 1/3, 2/4)
    5. Definition (Single, Split, etc)
    6. Incarnation Cross
    7. Defined Centers (Head, Ajna, Throat, G, Heart, Sacral, Spleen, Solar Plexus, Root)

    And provide a deep, personalized interpretation in Hebrew.
    
    Output JSON format:
    {
      "type": "string",
      "strategy": "string (Hebrew)",
      "authority": "string (Hebrew)",
      "profile": "string",
      "definition": "string",
      "incarnation_cross": "string",
      "centers": {
        "head": boolean,
        "ajna": boolean,
        "throat": boolean,
        "g_center": boolean,
        "heart": boolean,
        "sacral": boolean,
        "spleen": boolean,
        "solar_plexus": boolean,
        "root": boolean
      },
      "interpretation": {
        "summary": "string",
        "type_description": "string",
        "strategy_advice": "string",
        "authority_advice": "string",
        "profile_meaning": "string",
        "centers_analysis": "string"
      }
    }
    `;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["Manifestor", "Generator", "Manifesting Generator", "Projector", "Reflector"] },
          strategy: { type: "string" },
          authority: { type: "string" },
          profile: { type: "string" },
          definition: { type: "string" },
          incarnation_cross: { type: "string" },
          centers: {
            type: "object",
            properties: {
              head: { type: "boolean" },
              ajna: { type: "boolean" },
              throat: { type: "boolean" },
              g_center: { type: "boolean" },
              heart: { type: "boolean" },
              sacral: { type: "boolean" },
              spleen: { type: "boolean" },
              solar_plexus: { type: "boolean" },
              root: { type: "boolean" }
            },
            required: ["head", "ajna", "throat", "g_center", "heart", "sacral", "spleen", "solar_plexus", "root"]
          },
          interpretation: {
            type: "object",
            properties: {
              summary: { type: "string" },
              type_description: { type: "string" },
              strategy_advice: { type: "string" },
              authority_advice: { type: "string" },
              profile_meaning: { type: "string" },
              centers_analysis: { type: "string" }
            },
            required: ["summary", "type_description", "strategy_advice"]
          }
        },
        required: ["type", "strategy", "authority", "profile", "centers", "interpretation"]
      }
    });

    return Response.json(result);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});