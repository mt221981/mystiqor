import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * ULTRA-PERSONALIZED DAILY INSIGHT GENERATOR v3.0
 * 
 * Deep personalization through:
 * 1. Natal chart analysis (planets, houses, aspects) → strengths/challenges
 * 2. Active goals → desired outcomes
 * 3. Current transits → timing and opportunities
 * 4. Intelligent matching: which natal placements support which goals
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check for existing insight
    const existingInsights = await base44.entities.DailyInsight.filter({
      created_by: user.email,
      insight_date: today
    });

    if (existingInsights.length > 0) {
      return Response.json({
        success: true,
        insight: existingInsights[0],
        from_cache: true
      });
    }

    const userName = (user.full_name || 'חבר יקר').split(' ')[0];

    // Get natal chart
    const astrologyCalculations = await base44.entities.AstrologyCalculation.filter(
      { created_by: user.email },
      '-created_date',
      1
    );

    const hasNatalChart = astrologyCalculations.length > 0;

    // ====== Without natal chart - inspirational insight ======
    if (!hasNatalChart) {
      const noChartPrompt = `אתה מאמן רוחני חם, אמפטי, ומעורר השראה.

**המטרה:** צור תובנה יומית קצרה ומעצימה ל-${userName} שעדיין לא יצר מפת לידה אסטרולוגית.

**עקרונות:**
1. **דבר על הכוח של הכרה עצמית** - למה זה משנה חיים?
2. **הזכר את האנרגיה הכללית של ${new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}** - זמן של הקשבה פנימית
3. **צור סקרנות אותנטית** - מה מפת לידה יכולה לגלות?
4. **תן טיפ פשוט ומעשי** שכל אחד יכול לעשות ב-5-10 דקות

**סגנון:**
- חם, אישי, מדבר ישר ללב
- **2-3 משפטים לתובנה** - תמציתי ועמוק
- פנה ישירות ל-${userName} בגוף ראשון

**החזר JSON מדויק:**`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: noChartPrompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            insight_title: { type: "string", minLength: 15, maxLength: 60 },
            insight_content: { type: "string", minLength: 120, maxLength: 400 },
            actionable_tip: { type: "string", minLength: 60, maxLength: 250 },
            focus_area: { 
              type: "string",
              enum: ["strength", "growth", "challenge", "opportunity", "reflection", "action"]
            },
            mood: {
              type: "string",
              enum: ["inspiring", "reflective", "empowering", "cautionary", "celebratory"]
            },
            confidence_score: { type: "number", minimum: 0.95, maximum: 1.0 }
          },
          required: ["insight_title", "insight_content", "actionable_tip", "focus_area", "mood", "confidence_score"]
        }
      });

      const savedInsight = await base44.entities.DailyInsight.create({
        insight_date: today,
        insight_title: result.insight_title,
        insight_content: result.insight_content,
        actionable_tip: result.actionable_tip,
        related_analysis_ids: [],
        source_tools: ['inspiration'],
        confidence_score: result.confidence_score || 1.0,
        focus_area: result.focus_area,
        mood: result.mood,
        viewed: false,
        delivered_via_notification: false,
        related_goal_ids: [],
        goal_alignment_score: 0,
        metadata: {
          no_natal_chart: true,
          generated_at: new Date().toISOString()
        }
      });

      return Response.json({
        success: true,
        insight: savedInsight,
        from_cache: false,
        needs_natal_chart: true
      });
    }

    // ====== With natal chart - deeply personalized insight ======
    const natalCalc = astrologyCalculations[0];

    // Get active goals
    const activeGoals = await base44.entities.UserGoal.filter({
      created_by: user.email,
      status: { $in: ['active', 'in_progress'] }
    });

    // Calculate transits - with fallback
    let transitsData = null;
    try {
      const transitsResponse = await base44.functions.invoke('calculateTransits', {
        natal_chart: {
          planets: natalCalc.planets || [],
          sun_sign: natalCalc.sun_sign,
          moon_sign: natalCalc.moon_sign,
          rising_sign: natalCalc.rising_sign
        },
        target_date: new Date().toISOString()
      });

      transitsData = transitsResponse.data?.error ? null : transitsResponse.data;
    } catch (error) {
      console.error('[generateDailyInsight] Transits calculation failed, continuing without transits:', error.message);
    }

    // Get recent analyses
    const recentAnalyses = await base44.entities.Analysis.filter(
      { created_by: user.email },
      '-created_date',
      3
    );

    const topTransit = transitsData?.transits?.[0];
    const transitsList = transitsData?.transits?.slice(0, 5) || [];

    // ====== DEEP PERSONALIZATION: Analyze natal chart strengths for goals ======
    const natalStrengths = analyzeNatalStrengths(natalCalc);
    const goalChartAlignment = activeGoals.map(goal => ({
      goal,
      supportive_placements: findSupportivePlacements(goal, natalCalc, natalStrengths),
      recommended_focus: recommendFocusForGoal(goal, natalCalc, topTransit)
    }));

    // Build ultra-personalized prompt
    const withChartPrompt = `# אתה אסטרולוג פסיכולוגי אבולוציוני ומאמן אישי ברמה עולמית 🌟

**תפקידך:** צור תובנה יומית ULTRA-PERSONALIZED ל-${userName} המשלבת:
1. **מפת הלידה הייחודית שלו/ה** → החוזקות והאתגרים האישיים
2. **היעדים הפעילים שלו/ה** → מה הוא/היא רוצה להשיג
3. **המעברים של היום** → הזדמנויות ותזמון
4. **התאמה חכמה** → איך החוזקות הנטאליות תומכות ביעדים

---

## 📋 ${userName} - הפרופיל המלא:

**מפת הלידה:**
- **☀️ שמש**: ${natalCalc.sun_sign} בבית ${natalCalc.planets?.find(p => p.name === 'Sun')?.house || '?'}
- **🌙 ירח**: ${natalCalc.moon_sign} בבית ${natalCalc.planets?.find(p => p.name === 'Moon')?.house || '?'}
- **⬆️ אסצנדנט**: ${natalCalc.rising_sign}
- **🔥 יסוד דומיננטי**: ${natalCalc.dominant_element}
- **☊ North Node**: ${natalCalc.special_points?.north_node?.sign || 'לא זמין'} בבית ${natalCalc.special_points?.north_node?.house || '?'}

**החוזקות הנטאליות המרכזיות של ${userName}:**
${natalStrengths.map((s, i) => `${i + 1}. ${s.description} (${s.placement})`).join('\n')}

---

## 🎯 היעדים הפעילים של ${userName}:

${activeGoals.length > 0 ? activeGoals.map((goal, i) => {
  const alignment = goalChartAlignment[i];
  return `
**יעד ${i + 1}: ${goal.goal_title}**
- קטגוריה: ${translateCategory(goal.goal_category)}
- התקדמות: ${goal.progress_percentage || 0}%
${goal.goal_description ? `- תיאור: ${goal.goal_description}` : ''}

**💫 איך מפת הלידה תומכת ביעד הזה:**
${alignment.supportive_placements.map(p => `  - ${p}`).join('\n')}

**🎯 מה כדאי למקד היום:**
${alignment.recommended_focus}
`;
}).join('\n\n') : '**אין יעדים פעילים** - אבל תן המלצה מבוססת מפת לידה להגדרת יעד.'}

---

## 🌟 המעברים של היום (${new Date().toLocaleDateString('he-IL')}):

${transitsList.length > 0 ? `
**Top 3 המעברים החזקים:**
${transitsList.slice(0, 3).map((t, i) => `
${i + 1}. **${t.transiting_planet} ${t.aspect_type} ${t.natal_planet} הנטאלי**
   - 🏠 משפיע על בית ${t.natal_house}
   - 💪 עוצמה: ${(parseFloat(t.strength) * 100).toFixed(0)}%
   ${t.is_exact ? '🎯 **מעבר מדויק!**' : ''}
`).join('\n')}
` : 'אין מעברים חזקים במיוחד היום - זמן של יציבות.'}

---

## 🎨 הוראות ליצירת תובנה ULTRA-PERSONALIZED:

### 1️⃣ **בחר את focus_area והמצב mood בחכמה:**

**קריטריונים לבחירה:**

${activeGoals.length > 0 ? `
**יש יעדים פעילים** - התמקד ביעד הכי דחוף:
- יעד ראשון: "${activeGoals[0].goal_title}" (${translateCategory(activeGoals[0].goal_category)})
- אם זה יעד career → focus_area: "growth" או "opportunity", mood: "empowering"
- אם זה יעד relationships → focus_area: "reflection" או "challenge", mood: "reflective" או "inspiring"
- אם זה יעד personal_growth → focus_area: "strength" או "action", mood: "inspiring"
- אם זה יעד spiritual → focus_area: "reflection", mood: "reflective"
` : ''}

${topTransit ? `
**יש מעבר חזק** - ${topTransit.transiting_planet} ${topTransit.aspect_type} ${topTransit.natal_planet}:
- אם האספקט הוא Trine/Sextile → mood: "inspiring" או "empowering", focus_area: "opportunity"
- אם האספקט הוא Square/Opposition → mood: "cautionary" או "reflective", focus_area: "challenge" או "growth"
- אם האספקט הוא Conjunction → mood: "celebratory" או "empowering", focus_area: "action"
` : ''}

**כלל זהב:** אם יש התאמה בין מעבר חזק ליעד פעיל → **זה חייב להיות הלב של התובנה!**

### 2️⃣ **בנה את התובנה במבנה הזה:**

**insight_title (4-8 מילים):**
- כלול את שם ${userName} או התייחסות אישית
- התייחס ליעד או למעבר
- דוגמאות:
  * "${userName}, היום תומך ב${activeGoals[0]?.goal_title || 'צמיחה שלך'}"
  * "${topTransit ? `${topTransit.transiting_planet} מעורר את ה-${topTransit.natal_planet} שלך` : 'זמן לחיבור פנימי'}"

**insight_content (2-3 משפטים, 150-400 תווים):**

משפט 1: **מה קורה עכשיו** (אסטרולוגית + אישית)
- "${userName}, ${topTransit ? `${topTransit.transiting_planet} ${topTransit.aspect_type} ${topTransit.natal_planet} שלך היום` : 'האנרגיה של היום'} - זו קריאה מהנשמה..."

משפט 2: **מה זה אומר על היעד שלך**
${activeGoals.length > 0 ? `
- "זה בדיוק הזמן ${getActionForGoal(activeGoals[0])} ביעד '${activeGoals[0].goal_title}' שלך. ${getChartSupport(goalChartAlignment[0])}"
` : ''}

משפט 3: **ההזדמנות והכיוון**
- "אם תקשיב/י לקריאה הזאת, תוכל/י ${getOpportunityText(topTransit, activeGoals[0])}..."

**actionable_tip (70-350 תווים):**
- **חייב להיות קונקרטי ל-100%** - לא "תעבוד על עצמך"
- **קשור ישירות ליעד** (אם יש) או למעבר
- **ניתן לביצוע ב-5-15 דקות היום**

דוגמאות מצוינות:
${activeGoals.length > 0 ? `
- "קח/י 10 דקות היום לכתוב 3 צעדים קטנים לקראת '${activeGoals[0].goal_title}' - ה-${natalCalc.sun_sign} שלך אהב/ת פעולה ממוקדת"
- "התקשר/י למישהו שיכול לעזור לך ב-'${activeGoals[0].goal_title}' - ה-${natalCalc.moon_sign} Moon שלך יודע/ת להתחבר"
` : `
- "כתוב/י היום יעד אחד ברור לחודש הבא - ה-${natalCalc.sun_sign} שלך צריך/ה כיוון"
- "הקדש/י 7 דקות למדיטציה על השאלה: 'מה אני באמת רוצה?'"
`}

### 3️⃣ **הבא JSON מושלם:**

**related_goal_ids:** ${activeGoals.length > 0 ? `["${activeGoals[0].id}"${activeGoals.length > 1 ? `, "${activeGoals[1].id}"` : ''}]` : '[]'}

**goal_alignment_score:** ${activeGoals.length > 0 ? '0.9-1.0 (התובנה MUST תמוך ביעד!)' : '0'}

**key_themes:** רשימה של 2-3 נושאים מרכזיים (למשל: ["career_growth", "jupiter_expansion", "action_taking"])

**transit_focus:**
\`\`\`json
{
  "primary_transit": "${topTransit ? `${topTransit.transiting_planet} ${topTransit.aspect_type} ${topTransit.natal_planet}` : 'general_energy'}",
  "psychological_theme": "הנושא הפסיכולוגי המרכזי (למשל: 'ביטחון עצמי', 'קבלת החלטות')",
  "growth_opportunity": "ההזדמנות הספציפית לצמיחה",
  "natal_strengths_activated": ${JSON.stringify(natalStrengths.slice(0, 2).map(s => s.placement))}
}
\`\`\`

---

## ✅ דוגמה לתובנה PERFECT (עם יעד):

${activeGoals.length > 0 ? `
\`\`\`json
{
  "insight_title": "${userName}, ${topTransit ? `${topTransit.transiting_planet} תומך` : 'האנרגיה תומכת'} ביעד '${activeGoals[0].goal_title}' שלך",
  "insight_content": "${userName}, ${topTransit ? `${topTransit.transiting_planet} ${topTransit.aspect_type} ${topTransit.natal_planet} שלך היום` : 'האנרגיה של היום'} - זו קריאה ישירה מהנשמה לקדם את היעד '${activeGoals[0].goal_title}' שלך. ${goalChartAlignment[0]?.supportive_placements[0] || `ה-${natalCalc.sun_sign} שלך`} נותן/ת לך בדיוק את הכוח הזה. אם תנצל/י את האנרגיה הזאת היום, תוכל/י ${getSpecificAction(activeGoals[0], natalCalc)}.",
  "actionable_tip": "${getConcreteActionForGoal(activeGoals[0], natalCalc, topTransit)}",
  "focus_area": "${getFocusAreaForGoal(activeGoals[0])}",
  "mood": "${getMoodForGoal(activeGoals[0], topTransit)}",
  "confidence_score": 1.0,
  "related_goal_ids": ["${activeGoals[0].id}"],
  "goal_alignment_score": 0.95,
  "key_themes": ${JSON.stringify(getThemesForGoal(activeGoals[0], natalCalc))},
  "transit_focus": {
    "primary_transit": "${topTransit ? `${topTransit.transiting_planet} ${topTransit.aspect_type} ${topTransit.natal_planet}` : 'supportive_energy'}",
    "psychological_theme": "${getPsychThemeForGoal(activeGoals[0])}",
    "growth_opportunity": "${getGrowthOpportunity(activeGoals[0], natalCalc)}",
    "natal_strengths_activated": ${JSON.stringify(goalChartAlignment[0]?.supportive_placements.slice(0, 2) || [natalCalc.sun_sign])}
  }
}
\`\`\`
` : `
(דוגמה ללא יעד - התמקד במפת הלידה ובמעבר)
`}

**עכשיו צור את התובנה המושלמת! החזר JSON נקי בלבד.**`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: withChartPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          insight_title: { type: "string", minLength: 15, maxLength: 70 },
          insight_content: { type: "string", minLength: 150, maxLength: 500 },
          actionable_tip: { type: "string", minLength: 70, maxLength: 350 },
          focus_area: { 
            type: "string",
            enum: ["strength", "growth", "challenge", "opportunity", "reflection", "action"]
          },
          mood: {
            type: "string",
            enum: ["inspiring", "reflective", "empowering", "cautionary", "celebratory"]
          },
          confidence_score: { type: "number", minimum: 0.95, maximum: 1.0 },
          key_themes: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 4
          },
          transit_focus: {
            type: "object",
            properties: {
              primary_transit: { type: "string" },
              psychological_theme: { type: "string" },
              growth_opportunity: { type: "string" },
              natal_strengths_activated: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["primary_transit", "psychological_theme", "growth_opportunity"]
          },
          related_goal_ids: {
            type: "array",
            items: { type: "string" }
          },
          goal_alignment_score: {
            type: "number",
            minimum: 0,
            maximum: 1
          }
        },
        required: ["insight_title", "insight_content", "actionable_tip", "focus_area", "mood", "confidence_score", "transit_focus"]
      }
    });

    const savedInsight = await base44.entities.DailyInsight.create({
      insight_date: today,
      insight_title: result.insight_title,
      insight_content: result.insight_content,
      actionable_tip: result.actionable_tip,
      related_analysis_ids: recentAnalyses.map(a => a.id),
      source_tools: ['astrology_transits', 'natal_chart_analysis', 'goal_integration'],
      confidence_score: result.confidence_score || 1.0,
      focus_area: result.focus_area,
      mood: result.mood,
      viewed: false,
      delivered_via_notification: false,
      related_goal_ids: result.related_goal_ids || [],
      goal_alignment_score: result.goal_alignment_score || 0,
      metadata: {
        has_natal_chart: true,
        transit_based: true,
        goal_integrated: activeGoals.length > 0,
        key_transit: topTransit ? `${topTransit.transiting_planet} ${topTransit.aspect_type} ${topTransit.natal_planet}` : null,
        top_transit: topTransit,
        natal_strengths_used: natalStrengths.slice(0, 3).map(s => s.placement),
        goal_chart_alignment: goalChartAlignment.map(g => ({
          goal_id: g.goal.id,
          goal_title: g.goal.goal_title,
          supportive_placements: g.supportive_placements.slice(0, 2)
        })),
        key_themes: result.key_themes || [],
        transit_focus: result.transit_focus,
        generated_at: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      insight: savedInsight,
      from_cache: false,
      personalization_level: 'ultra_high',
      goals_integrated: activeGoals.length,
      natal_strengths_count: natalStrengths.length,
      transit_based: !!transitsData
    });

  } catch (error) {
    console.error('[generateDailyInsight] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ============= HELPER FUNCTIONS FOR DEEP PERSONALIZATION =============

function analyzeNatalStrengths(natalCalc) {
  const strengths = [];
  
  // Sun sign strengths
  const sunStrengths = {
    'Aries': { description: 'יוזמה ואומץ', qualities: ['leadership', 'action', 'courage'] },
    'Taurus': { description: 'יציבות והתמדה', qualities: ['persistence', 'reliability', 'patience'] },
    'Gemini': { description: 'תקשורת וגמישות', qualities: ['communication', 'adaptability', 'learning'] },
    'Cancer': { description: 'אמפתיה ואינטואיציה', qualities: ['empathy', 'nurturing', 'intuition'] },
    'Leo': { description: 'ביטחון ויצירתיות', qualities: ['confidence', 'creativity', 'leadership'] },
    'Virgo': { description: 'דיוק ושירות', qualities: ['analysis', 'organization', 'service'] },
    'Libra': { description: 'איזון ודיפלומטיה', qualities: ['harmony', 'relationships', 'fairness'] },
    'Scorpio': { description: 'עומק וטרנספורמציה', qualities: ['depth', 'transformation', 'intensity'] },
    'Sagittarius': { description: 'חזון והרפתקנות', qualities: ['vision', 'optimism', 'exploration'] },
    'Capricorn': { description: 'שאפתנות ומשמעת', qualities: ['ambition', 'discipline', 'achievement'] },
    'Aquarius': { description: 'חדשנות ועצמאות', qualities: ['innovation', 'independence', 'humanitarianism'] },
    'Pisces': { description: 'רגישות ודמיון', qualities: ['compassion', 'imagination', 'spirituality'] }
  };
  
  if (sunStrengths[natalCalc.sun_sign]) {
    strengths.push({
      placement: `Sun in ${natalCalc.sun_sign}`,
      description: sunStrengths[natalCalc.sun_sign].description,
      qualities: sunStrengths[natalCalc.sun_sign].qualities,
      weight: 1.0
    });
  }
  
  // Moon sign emotional strengths
  if (natalCalc.moon_sign) {
    strengths.push({
      placement: `Moon in ${natalCalc.moon_sign}`,
      description: `כוח רגשי ב${natalCalc.moon_sign}`,
      qualities: ['emotional_intelligence', 'intuition'],
      weight: 0.9
    });
  }
  
  // Element dominance
  if (natalCalc.dominant_element) {
    const elementStrengths = {
      'Fire': { description: 'אנרגיה ויוזמה', qualities: ['action', 'passion', 'leadership'] },
      'Earth': { description: 'מעשיות ויציבות', qualities: ['practicality', 'reliability', 'grounding'] },
      'Air': { description: 'אינטלקט ותקשורת', qualities: ['intellect', 'communication', 'social'] },
      'Water': { description: 'רגישות ואינטואיציה', qualities: ['emotion', 'intuition', 'empathy'] }
    };
    
    if (elementStrengths[natalCalc.dominant_element]) {
      strengths.push({
        placement: `Dominant ${natalCalc.dominant_element}`,
        description: elementStrengths[natalCalc.dominant_element].description,
        qualities: elementStrengths[natalCalc.dominant_element].qualities,
        weight: 0.8
      });
    }
  }
  
  // Strong aspects (from aspects array)
  if (natalCalc.aspects && natalCalc.aspects.length > 0) {
    const strongAspects = natalCalc.aspects
      .filter(a => parseFloat(a.strength) > 0.8)
      .slice(0, 2);
    
    strongAspects.forEach(aspect => {
      strengths.push({
        placement: `${aspect.planet1} ${aspect.type} ${aspect.planet2}`,
        description: `קשר חזק בין ${aspect.planet1} ל-${aspect.planet2}`,
        qualities: getAspectQualities(aspect),
        weight: parseFloat(aspect.strength)
      });
    });
  }
  
  return strengths.sort((a, b) => b.weight - a.weight);
}

function getAspectQualities(aspect) {
  const qualities = {
    'Conjunction': ['unity', 'focus', 'intensity'],
    'Trine': ['harmony', 'flow', 'talent'],
    'Sextile': ['opportunity', 'cooperation', 'skill'],
    'Square': ['challenge', 'growth', 'action'],
    'Opposition': ['awareness', 'balance', 'perspective']
  };
  return qualities[aspect.type] || ['connection'];
}

function findSupportivePlacements(goal, natalCalc, natalStrengths) {
  const placements = [];
  
  const categoryPlacements = {
    'career': ['Sun', 'Saturn', 'Jupiter', 'Capricorn', 'Leo'],
    'relationships': ['Venus', 'Moon', 'Libra', 'Cancer'],
    'personal_growth': ['Jupiter', 'Pluto', 'North Node', 'Sagittarius'],
    'health': ['Sun', 'Moon', 'Virgo', 'Scorpio'],
    'spirituality': ['Neptune', 'Pisces', 'North Node', 'Jupiter'],
    'creativity': ['Venus', 'Neptune', 'Leo', 'Pisces'],
    'finance': ['Venus', 'Jupiter', 'Taurus', 'Capricorn']
  };
  
  const relevantKeys = categoryPlacements[goal.goal_category] || ['Sun', 'Moon'];
  
  // Check natal strengths that match goal
  natalStrengths.forEach(strength => {
    if (relevantKeys.some(key => strength.placement.includes(key))) {
      placements.push(`${strength.placement} - ${strength.description}`);
    }
  });
  
  // Specific planet positions
  if (natalCalc.planets) {
    relevantKeys.forEach(planetName => {
      const planet = natalCalc.planets.find(p => p.name === planetName);
      if (planet) {
        placements.push(`${planetName} ב-${planet.sign} (בית ${planet.house}) תומך ביעד זה`);
      }
    });
  }
  
  return placements.slice(0, 3);
}

function recommendFocusForGoal(goal, natalCalc, topTransit) {
  const recommendations = [];
  
  if (topTransit) {
    if (topTransit.aspect_type === 'Trine' || topTransit.aspect_type === 'Sextile') {
      recommendations.push('זמן מצוין לפעולה - האנרגיה זורמת');
    } else if (topTransit.aspect_type === 'Square' || topTransit.aspect_type === 'Opposition') {
      recommendations.push('זמן להתמודד עם אתגרים בדרך ליעד');
    }
  }
  
  if (goal.goal_category === 'career' && natalCalc.sun_sign === 'Capricorn') {
    recommendations.push('השתמש במשמעת הטבעית שלך');
  }
  
  if (goal.goal_category === 'relationships' && natalCalc.moon_sign === 'Cancer') {
    recommendations.push('האמפתיה שלך היא הכוח הגדול ביותר שלך');
  }
  
  return recommendations.join('. ') || 'התמקד בצעדים קטנים ועקביים';
}

function translateCategory(category) {
  const translations = {
    'career': 'קריירה',
    'relationships': 'יחסים',
    'personal_growth': 'צמיחה אישית',
    'health': 'בריאות',
    'spirituality': 'רוחניות',
    'creativity': 'יצירתיות',
    'finance': 'כלכלה'
  };
  return translations[category] || category;
}

function getActionForGoal(goal) {
  const actions = {
    'career': 'לקדם',
    'relationships': 'לחזק',
    'personal_growth': 'לצמוח ב',
    'health': 'לשפר',
    'spirituality': 'להעמיק ב',
    'creativity': 'ליצור ב',
    'finance': 'לבנות'
  };
  return actions[goal.goal_category] || 'לעבוד על';
}

function getChartSupport(alignment) {
  if (alignment.supportive_placements.length > 0) {
    return alignment.supportive_placements[0].split(' - ')[1] || 'מפת הלידה שלך תומכת בזה';
  }
  return 'יש לך את הכוח לזה';
}

function getOpportunityText(transit, goal) {
  if (goal && goal.goal_category === 'career') {
    return 'לעשות צעד משמעותי בקריירה שלך';
  }
  if (transit && (transit.aspect_type === 'Trine' || transit.aspect_type === 'Sextile')) {
    return 'לנצל את הזרימה הטבעית של האנרגיה';
  }
  return 'לצמוח בדרך שלך';
}

function getSpecificAction(goal, natalCalc) {
  if (goal.goal_category === 'career') {
    return `לקדם את הקריירה ב${natalCalc.sun_sign === 'Capricorn' ? 'מעשיות ומשמעת' : 'הדרך הייחודית שלך'}`;
  }
  return 'להתקדם בדרך שלך';
}

function getConcreteActionForGoal(goal, natalCalc, transit) {
  const actions = {
    'career': `כתוב/י היום 3 צעדים קטנים לקראת "${goal.goal_title}" - ה-${natalCalc.sun_sign} שלך אוהב/ת תכנון. בחר/י צעד אחד לביצוע מחר.`,
    'relationships': `התקשר/י היום למישהו חשוב לך ב-"${goal.goal_title}" - ה-${natalCalc.moon_sign} Moon שלך יודע/ת איך להתחבר. 5 דקות יכולות לשנות הכל.`,
    'personal_growth': `הקדש/י 10 דקות לכתיבה חופשית על "${goal.goal_title}" - איפה את/ה עכשיו ולאן רוצה להגיע. ה-${natalCalc.sun_sign} שלך צריך/ה בהירות.`,
    'health': `עש/י היום פעולה אחת קטנה עבור "${goal.goal_title}" - גם 10 דקות של תנועה או מדיטציה חשובים.`,
    'spirituality': `הקדש/י 15 דקות למדיטציה או כתיבת יומן רוחני על "${goal.goal_title}". ה-${natalCalc.moon_sign} שלך צריך/ה את הזמן הזה.`,
    'creativity': `צור/י משהו קטן היום הקשור ל-"${goal.goal_title}" - גם 10 דקות של יצירה מתקדמות אותך.`
  };
  
  return actions[goal.goal_category] || `קח/י צעד אחד קטן היום לקראת "${goal.goal_title}" - התקדמות מתחילה בפעולה.`;
}

function getFocusAreaForGoal(goal) {
  const focusAreas = {
    'career': 'growth',
    'relationships': 'reflection',
    'personal_growth': 'strength',
    'health': 'action',
    'spirituality': 'reflection',
    'creativity': 'opportunity'
  };
  return focusAreas[goal.goal_category] || 'action';
}

function getMoodForGoal(goal, transit) {
  if (transit && (transit.aspect_type === 'Trine' || transit.aspect_type === 'Sextile')) {
    return 'empowering';
  }
  if (transit && transit.aspect_type === 'Square') {
    return 'cautionary';
  }
  
  const moods = {
    'career': 'empowering',
    'relationships': 'reflective',
    'personal_growth': 'inspiring',
    'health': 'empowering',
    'spirituality': 'reflective',
    'creativity': 'inspiring'
  };
  return moods[goal.goal_category] || 'inspiring';
}

function getThemesForGoal(goal, natalCalc) {
  const themes = [goal.goal_category];
  themes.push(`${natalCalc.sun_sign.toLowerCase()}_energy`);
  if (goal.goal_category === 'career') {
    themes.push('achievement', 'growth');
  } else if (goal.goal_category === 'relationships') {
    themes.push('connection', 'empathy');
  }
  return themes.slice(0, 3);
}

function getPsychThemeForGoal(goal) {
  const themes = {
    'career': 'ביטחון עצמי והגשמה מקצועית',
    'relationships': 'קשר אותנטי ופגיעות',
    'personal_growth': 'הכרה עצמית והתפתחות',
    'health': 'דאגה עצמית ומיינדפולנס',
    'spirituality': 'חיפוש משמעות וחיבור רוחני',
    'creativity': 'ביטוי עצמי ויצירתיות'
  };
  return themes[goal.goal_category] || 'התפתחות אישית';
}

function getGrowthOpportunity(goal, natalCalc) {
  return `לנצל את ${natalCalc.sun_sign === 'Aries' ? 'האומץ' : natalCalc.sun_sign === 'Taurus' ? 'ההתמדה' : natalCalc.sun_sign === 'Gemini' ? 'הגמישות' : 'החוזק'} של ${natalCalc.sun_sign} כדי להתקדם ב-${translateCategory(goal.goal_category)}`;
}