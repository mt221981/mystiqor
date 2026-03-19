import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ENHANCED DAILY INSIGHT GENERATOR v4.0
 * 
 * Integrates:
 * 1. Natal Astrology (Chart)
 * 2. Transit Astrology (Daily Planetary Movements)
 * 3. Numerology (Personal Year/Month/Day)
 * 4. Tarot (Daily Card Draw)
 * 5. User Goals
 */

const TAROT_CARDS = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", 
  "The World", "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands",
  "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups",
  "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords",
  "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles"
];

function calculatePersonalNumbers(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  
  const reduce = (n) => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = n.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return n;
  };

  const day = birth.getDate();
  const month = birth.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const personalYear = reduce(day + month + reduce(currentYear));
  const personalMonth = reduce(personalYear + currentMonth);
  const personalDay = reduce(personalMonth + currentDay);

  return { personalYear, personalMonth, personalDay };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const userName = (user.full_name || 'חבר').split(' ')[0];

    // 1. Get User Profile for Birth Data
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];
    
    // 2. Numerology Calculation
    const numerologyData = profile?.birth_date ? calculatePersonalNumbers(profile.birth_date) : null;

    // 3. Tarot Draw
    const dailyCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    const cardOrientation = Math.random() > 0.8 ? "reversed" : "upright"; // 20% chance of reversal

    // 4. Astrology (Natal & Transits)
    const astroCalculations = await base44.entities.AstrologyCalculation.list('-created_date', 1);
    const natalCalc = astroCalculations[0] || {};
    
    // Calculate/Fetch Transits (Simplified for this version if helper fails/doesn't exist)
    let transits = [];
    try {
        // Try to invoke transit calculation if available, otherwise use mock/general
        const transitRes = await base44.functions.invoke('calculateTransits', { 
            target_date: new Date().toISOString(),
            natal_chart: natalCalc
        });
        if (transitRes.data?.transits) {
            transits = transitRes.data.transits.slice(0, 3);
        }
    } catch (e) {
        console.log("Transit calc skipped/failed", e.message);
    }

    // 5. Active Goals
    const activeGoals = await base44.entities.UserGoal.filter({
      created_by: user.email,
      status: { $in: ['active', 'in_progress'] }
    });

    // 6. Build the AI Prompt
    const context = {
        numerology: numerologyData,
        tarot: { card: dailyCard, orientation: cardOrientation },
        astrology: {
            sun_sign: natalCalc.sun_sign,
            moon_sign: natalCalc.moon_sign,
            transits: transits
        },
        goals: activeGoals.map(g => g.goal_title)
    };

    const prompt = `
    Act as a mystical mentor. Create a personalized Daily Insight for ${userName}.
    
    Today's Energies:
    - **Numerology**: Personal Day ${numerologyData?.personalDay || '?'}, Month ${numerologyData?.personalMonth || '?'}.
    - **Tarot Card**: ${dailyCard} (${cardOrientation}).
    - **Astrology**: Sun Sign ${natalCalc.sun_sign || 'Unknown'}, Transits: ${transits.map(t => `${t.planet} ${t.aspect} ${t.natal_planet}`).join(', ') || 'General cosmic energy'}.
    - **User Goals**: ${activeGoals.length > 0 ? activeGoals.map(g => g.goal_title).join(', ') : 'General growth'}.

    Task:
    Synthesize these inputs into a cohesive message. 
    - Connect the Tarot card's meaning with the Numerology vibration.
    - If Astrology data exists, weave it in (e.g., "With the Moon in... and this card...").
    - Relate it all to their goals.
    
    Output JSON:
    {
        "insight_title": "Short, catchy title (e.g. 'The Magician brings New Beginnings')",
        "insight_content": "Deep paragraph synthesizing the Tarot, Numerology, and Astrology data.",
        "actionable_tip": "Specific action to take today based on the card/numbers.",
        "mood": "inspiring/reflective/empowering/cautionary/celebratory",
        "focus_area": "strength/growth/challenge/opportunity/reflection/action",
        "confidence_score": 0.95,
        "tarot_meaning": "Brief meaning of the card in this context"
    }
    
    Language: Hebrew. Tone: Mystical but grounded, encouraging.
    `;

    const aiRes = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                insight_title: { type: "string" },
                insight_content: { type: "string" },
                actionable_tip: { type: "string" },
                mood: { type: "string" },
                focus_area: { type: "string" },
                confidence_score: { type: "number" },
                tarot_meaning: { type: "string" }
            }
        }
    });

    // 7. Save the Insight
    const newInsight = await base44.entities.DailyInsight.create({
        insight_date: today,
        insight_title: aiRes.insight_title,
        insight_content: aiRes.insight_content,
        actionable_tip: aiRes.actionable_tip,
        mood: aiRes.mood,
        focus_area: aiRes.focus_area,
        confidence_score: aiRes.confidence_score,
        source_tools: ['numerology', 'tarot', 'astrology', 'ai'],
        numerology_data: numerologyData,
        tarot_card: {
            name: dailyCard,
            orientation: cardOrientation,
            meaning: aiRes.tarot_meaning
        },
        astrology_transits: transits,
        metadata: {
            goals_count: activeGoals.length,
            generated_at: new Date().toISOString()
        }
    });

    return Response.json({ success: true, insight: newInsight });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});